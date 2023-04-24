import { Controller, Get, Post, Delete, Body, Req, Request, Res, Response, UseGuards, HttpCode, Patch } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { AuthenticatedGuard } from "./utils/authenticated.guard";
import { serialize } from 'cookie';
import { AuthGuard } from "@nestjs/passport";
import { OtpDto } from "./dto/otp.dto";
import { AuthService } from "./auth.service";
import { SecretQrCodeEntity } from "./utils/2fa.entity";
import { LocalDto } from "./dto/local.dto";



@Controller("auth")
@ApiTags('auth')
export class AuthController {

	constructor(private readonly auth: AuthService) { }

	@Post('/local')
	@HttpCode(201)
	@ApiCreatedResponse({ description: 'Successfully register/log a user.' })
	@ApiBadRequestResponse({ description: 'There is a problem with the payload or the password is wrong.' })
	@ApiNotFoundResponse({ description: 'The username used to log the user isn\'t found.' })
	@ApiConflictResponse({ description: 'email or username is already in use or the login method is not the one used when registered.' })
	@UseGuards(AuthGuard('local'))
	async localRegister(@Body() dto: LocalDto, @Req() req, @Res() res) {
		const userId = req.user.id;
		const email = req.user.email;
		const twofactorEnabled = await this.auth.get2faIsEnabled(userId);

		if (twofactorEnabled) {
			req.logout(() => {})
			const cookie = await this.set2faCookie(userId, email);
			res.setHeader('Set-Cookie', cookie);
			res.status(202)
			res.send();
			return;
		}

		req.logIn(req.user, (err) => {
			if (err) {
				console.log('Login Failed');
			}
			res.status(201).send(req.user);
		});
	}

	// @Get('/local/forget')
	// @UseGuards(AuthGuard('local'))
	// localForget() {}

	// After trying to log using oauth method if 2fa is enabled
	// this endpoint will validate the otp needed
	@UseGuards(AuthGuard('2fa'))
	@Post('2fa/validate')
	@HttpCode(200)
	@ApiOkResponse({ description: 'User has been logged in using 2FA.' })
	@ApiUnauthorizedResponse({ description: 'User failed to logged in.' })
	@ApiBadRequestResponse({ description: 'The payload is malformed.' })
	twoFactorValidate(@Body() dto: OtpDto) { return { message: `Successfully logged using 2FA` } }

	@Delete('logout')
	@HttpCode(204)
	@ApiNoContentResponse({ description: 'User has been logged out.' })
	@UseGuards(AuthenticatedGuard)
	async logout(@Request() req, @Response() res) {
		// this.auth.disconnectUserSockets(req.user.id);
		req.logout(() => {
			const user = req.user;
			res.send(user);
		})
	}

	@Get('42/login')
	@HttpCode(200)
	@ApiOkResponse({ description: 'Attempt to log user in using 42 oauth' })
	@ApiUnauthorizedResponse({ description: 'User failed to logged in.' })
	@UseGuards(AuthGuard('42'))
	handle42Login() { }

	@Get('/42/callback')
	@HttpCode(200)
	@ApiOkResponse({ description: 'If 2FA not enabled, successfully logged user, else will need to provide OTP at the /auth/2fa/validate endpoint' })
	@UseGuards(AuthGuard('42'))
	async fortyTwoCallback(@Req() req, @Res() res) {
		const userId = req.user.id;
		const email = req.user.email;
		const twofactorEnabled = await this.auth.get2faIsEnabled(userId);

		if (twofactorEnabled)
			return this.handle2fa(userId, email, res);

		req.logIn(req.user, (err) => {
			if (err) {
				console.log('Login Failed');
			}
			// res.send({
			// 	message: "Logged successfully.",
			// 	twofactorEnabled: false,
			// 	twofactorValidated: false,
			// })
			res.status(200).redirect("http://localhost:5173/home")
		});
	}

	@Patch('2fa/disable')
	@HttpCode(201)
	@ApiCreatedResponse({ description: '2FA Disabled' })
	@UseGuards(AuthenticatedGuard)
	async disableTwoFa(@Req() req) {
		await this.auth.update2faIsEnabled(req.user.id, false);
	}

	// Generate a secret for activating 2fa
	// Need to verify /auth/2fa/verify to enable 2fa
	@Get('2fa/generate')
	@HttpCode(200)
	@ApiOkResponse({
		type: SecretQrCodeEntity,
		description: 'Generate a secret in order to enable 2FA, the user must verify at /auth/2fa/verify to effectively enabled 2fa.'
	})
	@UseGuards(AuthenticatedGuard)
	async generate(@Res() res, @Req() req) {
		const userId = req.user.id;

		// set 2fa enabled to false since we reset the secret and its not verified yet
		await this.auth.update2faIsEnabled(userId, false);
		const secret = otplib.authenticator.generateSecret();

		// store the 2fa secret for the user
		await this.auth.set2faSecret(userId, secret);

		const accountName = req.user.email;
		const issuer = this.auth.getIssuer();
		// generate an url from the secret
		const url = otplib.authenticator.keyuri(accountName, issuer, secret);

		// generate qr code
		const base64Qrcode = await qrcode.toDataURL(url);

		res.send({
			contentType: 'image/png',
			base64Qrcode,
		});
	}

	// If successful the 2fa is effectively enabled
	@Post('2fa/verify')
	@HttpCode(201)
	@ApiCreatedResponse({ description: 'Verify that the given otp is valid against the user secret.' })
	@ApiBadRequestResponse({ description: 'The payload is malformed.' })
	@UseGuards(AuthenticatedGuard)
	async verify(@Body() dto: OtpDto, @Req() req) {
		const userId = req.user.id;
		const isEnabled = await this.auth.get2faIsEnabled(userId);
		if (isEnabled)
			return {
				message: "2FA is already enabled.",
				secretGenerated: true,
				secretVerified: true,
			};

		const secret = await this.auth.get2faSecret(userId);
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

		await this.auth.update2faIsEnabled(userId, true);
		return ({
			message: "otp match. 2FA enabled.",
			secretGenerated: true,
			secretVerified: true,
		});
	}

	private async set2faCookie(userId: number, email: string) {
		let expirationTime: number;
		let cookieValue = await this.auth.get2faCookie(userId);
		if (!cookieValue) {
			cookieValue = this.auth.generate2faId({ userId, email })
			expirationTime = 3 * 60; // 3 min in secs
			await this.auth.set2faCookie(userId, cookieValue as string, expirationTime);
		}
		else
			expirationTime = await this.auth.get2faCookieExpirationTime(userId);

		const cookie = serialize('2fa', cookieValue as string, {
			httpOnly: true,
			maxAge: expirationTime,
			path: "/",
		});
		return cookie;

	}
	private async handle2fa(userId: number, email: string, res) {
		const cookie = await this.set2faCookie(userId, email);
		res.setHeader('Set-Cookie', cookie);
		res.status(302).redirect("http://localhost:5173/login/2fa")
	}
}
