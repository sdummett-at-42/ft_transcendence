import { Controller, Get, Post, Delete, Body, Param, Req, Request, Res, Response, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "../users/users.service";
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { AuthenticatedGuard } from "./utils/authenticated.guard";
import { serialize, parse } from 'cookie';
import { RedisService } from "../redis/redis.service";
import * as crypto from 'crypto';
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { OtpDto } from "./dto/otp.dto";

ApiTags('auth')
@Controller("auth")
export class AuthController {

	constructor(
		private readonly users: UsersService,
		private readonly redis: RedisService,
		private readonly config: ConfigService) { }

	@Delete('logout')
	@UseGuards(AuthenticatedGuard)
	async logout(@Request() req, @Response() res) {
		// this.chat.onLogoutViaController(req.user.id);
		req.logout(() => {
			const user = req.user;
			res.send(user);
		})
	}

	@Get('42/login')
	@UseGuards(AuthGuard('42'))
	handle42Login() { }

	@Get('/42/callback')
	@UseGuards(AuthGuard('42'))
	async fortyTwoCallback(@Req() req, @Res() res) {
		const userId = req.user.id;
		const twofactorEnabled = await this.users.get2faIsEnabled(userId);

		if (twofactorEnabled)
			return this.handle2fa(userId, res);

		req.logIn(req.user, (err) => {
			if (err) {
				console.log('Login Failed');

			}
			res.send({
				msg: "Logged successfully.",
				twofactorEnabled: false,
				twofactorValidated: false,
			})
		});
	}

	@Get('google/login')
	@UseGuards(AuthGuard('google'))
	handleGoogleLogin() { }

	@Get('/google/callback')
	@UseGuards(AuthGuard('google'))
	async googleCallback(@Req() req, @Res() res) {
		const userId = req.user.id;
		const twofactorEnabled = await this.users.get2faIsEnabled(userId);

		if (twofactorEnabled)
			return this.handle2fa(userId, res);

		req.logIn(req.user, (err) => {
			if (err) {
				console.log(`Login Failed : ${err}`);
				res.send({msg: "Login user failed."})
				return;
			}
			res.send({
				msg: "Logged successfully.",
				twofactorEnabled: false,
				twofactorValidated: false,
			})
		});
	}

	@Get('2fa/generate')
	@UseGuards(AuthenticatedGuard)
	async generate(@Res() res, @Req() req) {
		const userId = req.user.id;

		// set 2fa enabled to false since we reset the secret and its not verified yet
		await this.users.update2faIsEnabled(userId, false);
		const secret = otplib.authenticator.generateSecret();

		// store the 2fa secret for the user
		await this.users.set2faSecret(userId, secret);

		const accountName = req.user.email;
		const issuer = this.config.get('ISSUER');
		// generate an url from the secret
		const url = otplib.authenticator.keyuri(accountName, issuer, secret);

		// generate qr code
		const base64Qrcode = await qrcode.toDataURL(url);

		res.send({
			contentType: 'image/png',
			base64Qrcode,
		});
		// For test purpose comment the above return and
		// uncomment the two line below to display the
		// qrcode directly to screen
		// res.setHeader('Content-Type', 'image/png');
		// res.send(Buffer.from(base64Qrcode.split(',')[1], 'base64'));
	}

	@Post('2fa/verify/')
	@UseGuards(AuthenticatedGuard)
	async verify(@Body() dto: OtpDto, @Req() req) {
		const userId = req.user.id;
		const isEnabled = await this.users.get2faIsEnabled(userId);
		if (isEnabled)
			return {
				message: "2FA is already enabled.",
				secretGenerated: true,
				secretVerified: true,
			};

		const secret = await this.users.get2faSecret(userId);
		if (!secret)
			return {
				message: "Failed to verify because no secret has been generated.",
				secretGenerated: false,
				secretVerified: false,
			};

		const check = otplib.authenticator.check(dto.otp, secret);
		if (!check)
			return {
				message: "otp doesn't match. 2FA not enabled.",
				secretGenerated: true,
				secretVerified: false,
			};

		await this.users.update2faIsEnabled(userId, true);
		return ({
			message: "otp match. 2FA enabled.",
			secretGenerated: true,
			secretVerified: true,
		});
	}

	@Post('2fa/validate/')
	async validate2fa(@Body() dto: OtpDto, @Req() req, @Res() res) {
		const twofactorCookie = this.getCookie('2fa', req);
		// no 2fa cookie sended
		if (twofactorCookie === undefined) {
			throw new UnauthorizedException('Unauthorized');
		}
		let userId;
		try {
			userId = this.decrypt2faId(twofactorCookie);
		}
		catch (err) {
			// Invalid cookie sended
			throw new UnauthorizedException('Unauthorized');
		}

		const cookie = await this.redis.get2faCookie(userId);
		if (!cookie) {
			// Invalid cookie sended
			throw new UnauthorizedException('Unauthorized');
		}
		const secret = await this.users.get2faSecret(userId);
		if (!secret) {
			// Send 2FA Not Enabled
			res.send({
				msg: "2FA is not enabled",
				twofactorEnabled: false,
				twofactorValidated: false,
			});
			return;
		}

		const check = otplib.authenticator.check(dto.otp, secret);
		if (!check) {
			// Send Invalid OTP
			res.send({
				msg: "OTP check failed, Invalid OTP",
				twofactorEnabled: true,
				twofactorValidated: false,
			});
			return;
		}

		const user = await this.users.findOneUserById(userId);
		req.logIn(user, (err) => {
			if (err) {
				console.log(`Login Failed : ${err}`);
				res.send({msg: "Login user failed."})
				return;
			}
			res.send({
				msg: "Logged successfully. OTP validated.",
				twofactorEnabled: true,
				twofactorValidated: true,
			})
		});
	}

	private async handle2fa(userId: number, res) {
		let expirationTime: number;
		let cookieValue = await this.redis.get2faCookie(userId);
		if (!cookieValue) {
			cookieValue = this.generate2faId(userId)
			expirationTime = 3 * 60; // 3 min in secs
			await this.redis.set2faCookie(userId, cookieValue as string, expirationTime);
		}
		else
			expirationTime = await this.redis.get2faCookieExpirationTime(userId);

		const cookie = serialize('2fa', cookieValue as string, {
			httpOnly: true,
			maxAge: expirationTime,
			path: "/",
		});
		res.setHeader('Set-Cookie', cookie);
		res.send({
			msg: "Partially logged, 2fa needed.",
			twofactorEnabled: true,
			twofactorValidated: false,
		});
	}

	// Return a cookie or undefined if not found
	private getCookie(cookieName: string, req) {
		const cookieHeader = req.headers.cookie;
		const cookies = parse(cookieHeader || '');
		return cookies[cookieName];
	}

	// Generate 2FA ID with user ID
	private generate2faId(userId: number): string {
		const key = this.config.get('SESSION_SECRET').slice(0, 32);
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
		let encrypted = cipher.update(userId.toString(), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return iv.toString('hex') + encrypted;
	}

	// Decrypt 2FA ID to get user ID
	private decrypt2faId(sessionId: string): number {
		const key = this.config.get('SESSION_SECRET').slice(0, 32);
		const iv = Buffer.from(sessionId.slice(0, 32), 'hex');
		const encrypted = sessionId.slice(32);
		const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return parseInt(decrypted, 10);
	}
}
