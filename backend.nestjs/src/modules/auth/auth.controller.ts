import { Controller, ExecutionContext, Get, Param, Req, Request, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "../users/users.service";
import { FortyTwoAuthGuard } from "./utils/fortytwo-auth.guard";
import { GoogleAuthGuard } from "./utils/google-auth.guard";
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { AuthenticatedGuard } from "./utils/authenticated.guard";
import { serialize, parse } from 'cookie';
import { RedisService } from "../redis/redis.service";
import * as crypto from 'crypto';

ApiTags('auth')
@Controller("auth")
export class AuthController {

	constructor(
		private readonly users: UsersService,
		private readonly redis: RedisService) {}


	@Get('2fa/generate')
	@UseGuards(AuthenticatedGuard)
	async generate(@Res() res, @Req() req) {
		const userId = req.user.id; // <= change
		// set 2fa enabled to false since we reset the secret and its not verified yet
		await this.users.update2faIsEnabled(userId, false);
		const secret = otplib.authenticator.generateSecret();

		// store the 2fa secret for the user
		await this.users.set2faSecret(userId, secret);

		const checkSecret = await this.users.get2faSecret(userId);
		console.log(`checkSecret: ${checkSecret}`);
		const accountName = "user@example.com"; // <= change (use user mail)
		const issuer = "transcendence.fr"; // <= change (user an env var)
		// generate an url from the secret
		const url = otplib.authenticator.keyuri(accountName, issuer, secret);

		// generate qr code
		const base64Qrcode = await qrcode.toDataURL(url);

		// and send this qrcode as a response
		// This below must be deleted, it's for test purpose
		res.setHeader('Content-Type', 'image/png');
		res.send(Buffer.from(base64Qrcode.split(',')[1], 'base64'));
		return {
			contentType: 'image/png',
			base64Qrcode,
		}
	}

	// <= change to POST and`otp` should be extracted from the body
	@Get('2fa/verify/:otp')
	@UseGuards(AuthenticatedGuard)
	async verify(@Param('otp') otp: string, @Req() req) {
		const userId = req.user.id;
		const isEnabled = await this.users.get2faIsEnabled(userId);
		if (isEnabled)
			return {
				message: "2FA already enabled =)",
				secret_generated: true,
				secret_verified: true,
				};

		const secret = await this.users.get2faSecret(userId);
		if (!secret)
			return {
				message: "Failed to verify because no secret has been generated => `auth/2fa/generate`",
				secret_generated: false,
				secret_verified: false,
			};

		const check = otplib.authenticator.check(otp, secret);
		if (!check)
			return {
				message: "otp doesn't match. =( [2FA NOT ENABLED]",
				secret_generated: true,
				secret_verified: false,
			};

		await this.users.update2faIsEnabled(userId, true);
		return ({
			message: "otp match =) [2FA ENABLED]",
			secret_generated: true,
			secret_verified: true,
		});
	}

	// Move logout from user controller here
	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	logout(@Request() req) {
		req.logout((err) => {
			if (err)
			  console.error(err);
		});
		return ({ message: "Successfully logout" });
	}

	@Get('42/callback')
	@UseGuards(FortyTwoAuthGuard)
	async fortytwoCallback(@Req() req, @Res() res, context: ExecutionContext) {

		const userId = req.user.id;
		const twofactor_enabled = await this.users.get2faIsEnabled(userId);

		console.log(`- UserId: ${userId} - 2FA ENABLED: ${twofactor_enabled}`);

		if (twofactor_enabled) {
			let expirationTime: number;
			let cookieValue = await this.redis.get2faCookie(userId);
			if (!cookieValue) {
				cookieValue = this.generateSessionId(userId)
				expirationTime = 3 * 60 ; // 3 min in secs
				await this.redis.set2faCookie(userId, cookieValue as string, expirationTime);
			}
			else
				expirationTime = await this.redis.get2faCookieExpirationTime(userId);

			const cookie = serialize('2fa', cookieValue as string, {
				httpOnly: true,
				maxAge: expirationTime,
				// careful if we add prefix /api to all routes
				// will need to update path
				path: "/auth/2fa/validate",
			});
			res.setHeader('Set-Cookie', cookie);
			res.send({
				msg: "Partially logged, 2fa needed",
				twofactor_enabled: true,
				twofactor_validated: false,
			});
			return;
		}

		// Not sure about that
		const authGuard = new FortyTwoAuthGuard();
		await authGuard.logIn(req);

		res.send({
			msg: "Logged successfully.",
			twofactor_enabled: false,
			twofactor_validated: false,
		});
	}

	getCookie(cookieName: string, req) {
		const cookieHeader = req.headers.cookie;
		const cookies = parse(cookieHeader || '');
		return cookies[cookieName];
	}

	// <= Change to post method and extract the otp from the body
	@Get('2fa/validate/:otp')
	async validate2fa(@Param('otp') otp: string, @Req() req, @Res() res) {
		const twofactorCookie = this.getCookie('2fa', req);
		console.log(`twofactorCookie: ${twofactorCookie}`);
		if (twofactorCookie === undefined) {
			// no 2fa sended => quit
			console.log("No 2FA Cookie sended, No Cookie")
			res.send("No 2FA Cookie sended, No Cookie")
			return;
		}
		let userId;
		try {
			userId = this.decryptSessionId(twofactorCookie);
		}
		catch(err) {
			console.log(err);
			// Send Invalid Cookie
			console.log(`Decrypting 2FA Cookie failed, Invalid Cookie.`)
			res.send(`Decrypting 2FA Cookie failed, Invalid Cookie.`)
			return;
		}

		console.log(`userId ==> ${userId}`);
		const cookie = this.redis.get2faCookie(userId);
		if (!cookie) {
			// Send Invalid Cookie
			console.log("2FA Cookie doesnt exist, Invalid Cookie")
			res.send("2FA Cookie doesnt exist, Invalid Cookie")
		}
		const secret = await this.users.get2faSecret(userId);
		if (!secret) {
			// Send 2FA Not Enabled
			console.log(`secret === NULL, 2FA Not Enabled`)
			res.send(`secret === NULL, 2FA Not Enabled`)
			return;
		}

		const check = otplib.authenticator.check(otp, secret);
		if (!check) {
			// Send Invalid OTP
			console.log(`OTP check failed, Invalid OTP`)
			res.send(`OTP check failed, Invalid OTP`)
			return;
		}

		console.log(`Success logging in user`)

		let expirationTime;
		let sessionId;
		const checkSidCookie = this.getCookie('sid', req);
		if (checkSidCookie != undefined && await this.redis.getSidCookie(checkSidCookie) != null) {
			expirationTime = await this.redis.getSidCookieExpirationTime(checkSidCookie);
			sessionId = checkSidCookie;
		}
		else {
			expirationTime = 60;
			sessionId = this.createSession(userId, expirationTime);
		}

		const sidCookie = serialize('sid', sessionId as string, {
			httpOnly: true,
			maxAge: expirationTime,
			path: "/",
		});
		res.setHeader('Set-Cookie', sidCookie);
		res.send({
			msg: "Successfully logged, 2FA validated =)",
			twofactor_enabled: true,
			twofactor_validated: true,
		});
	}

	createSession(userId: number, expirationTime: number) {
		const sessionId = this.generateSessionId(userId);
		this.redis.setSidCookie(sessionId, userId, expirationTime);
		return sessionId;
	}

	// Use env to store this secret
	private readonly secretKey: string = 'your-secret-key-here-your-secret-key-here';

	// Generate session ID with user ID
	generateSessionId(userId: number): string {
		const key = this.secretKey.slice(0, 32);
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
		let encrypted = cipher.update(userId.toString(), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return iv.toString('hex') + encrypted;
	}

	// Decrypt session ID to get user ID
	decryptSessionId(sessionId: string): number {
		const key = this.secretKey.slice(0, 32);
		const iv = Buffer.from(sessionId.slice(0, 32), 'hex');
		const encrypted = sessionId.slice(32);
		const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return parseInt(decrypted, 10);
	}

	//=====//

	@Get('42/login')
	@UseGuards(FortyTwoAuthGuard)
	handle42Login() {
		return { msg: '42 oauth'};
	}

	@Get('google/login')
	@UseGuards(GoogleAuthGuard)
	handleGoogleLogin() {
		return { msg: 'Google oauth'};
	}

	@Get('google/callback')
	@UseGuards(GoogleAuthGuard)
	googleCallback() {
		return {msg: "Logged successfully."};
	}
}
