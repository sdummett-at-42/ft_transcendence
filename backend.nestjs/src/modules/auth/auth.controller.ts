import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "../users/users.service";
import { FortyTwoAuthGuard } from "./utils/fortytwo-auth.guard";
import { GoogleAuthGuard } from "./utils/google-auth.guard";
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';

ApiTags('auth')
@Controller("auth")
export class AuthController {

	constructor(private readonly users: UsersService) {}

	// This function work just fine
	@Get('2fa/generate')
	async generate(@Res() res) {
		const userId = 0; // <= change
		// set 2fa enabled to false since we reset the secret and its not verified yet
		await this.users.update2faIsEnabled(userId, false);
		const secret = otplib.authenticator.generateSecret();

		// store the 2fa secret for the user
		await this.users.set2faSecret(userId, secret);

		const checkSecret = await this.users.get2faSecret(userId);
		console.log(`checkSecret: ${checkSecret}`);
		const accountName = "user@example.com"; // <= change (use user mail)
		const issuer = "transcendence.fr"; // <= change (user an env var)
		const url = otplib.authenticator.keyuri(accountName, issuer, secret);

		// generate qr code
		const qrc = await qrcode.toDataURL(url);

		// and send this qrcode as a response
		// Maybe we should return a nice formatted object here instead of the raw image
		// or just send the base64 qrcode inside the and object.
		res.setHeader('Content-Type', 'image/png');
		res.send(Buffer.from(qrc.split(',')[1], 'base64'));
	}

	// <= change to POST and put `otp` in the body
	// The returns of this function seems dogshit
	@Get('2fa/verify/:otp')
	async verify(@Param('otp') otp: string ) {
		const userId = 0;
		const isEnabled = await this.users.get2faIsEnabled(userId);
		if (isEnabled)
			return { message: "2FA already enabled =)"};

		const secret = await this.users.get2faSecret(userId);
		if (!secret)
			return {
				message: "Failed to verify because no secret has been generated => `auth/2fa/generate`",
			};

		const check = otplib.authenticator.check(otp, secret);
		if (!check)
			return { message: "otp doesn't match. =( [2FA NOT ENABLED]" };
		await this.users.update2faIsEnabled(userId, true);
		return ( {message: "otp match =) [2FA ENABLED]"});
	}

	//=====//

	@Get('42/login')
	@UseGuards(FortyTwoAuthGuard)
	handle42Login() {
		return { msg: '42 oauth'};
	}

	@Get('42/callback')
	@UseGuards(FortyTwoAuthGuard)
	fortytwoCallback() {
		return {msg: "Logged successfully."};
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
