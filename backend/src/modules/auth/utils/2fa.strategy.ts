import { Strategy } from "passport-custom";
import { PassportStrategy } from "@nestjs/passport";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import * as otplib from 'otplib';
import * as Joi from 'joi'

export class OtpDto {
	otp: string;
}
export const OtpSchema = Joi.object({
	otp: Joi.string().min(6).max(6).required(),
});

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, '2fa') {
	constructor(private readonly auth: AuthService) {
		super()
	}

	async validate(req): Promise<any> {

		const username = req.user.name;
		const twofactorCookie = this.auth.getCookie('2fa', req);
		// no 2fa cookie sended
		if (twofactorCookie === undefined)
			throw new UnauthorizedException({message: 'No 2FA cookie.'});

		let userId;
		let email;
		try {
			const obj = this.auth.decrypt2faId(twofactorCookie);
			userId = obj.userId;
			email = obj.email;
			console.log(`obj = ${JSON.stringify(obj)}`);
		}
		catch (err) {
			// Invalid cookie sended
			throw new UnauthorizedException({message: 'Invalid 2FA cookie.'});
		}

		const cookie = await this.auth.get2faCookie(userId);
		// Invalid cookie sended
		if (!cookie)
			throw new UnauthorizedException({message: 'Invalid 2FA cookie.'});

		const secret = await this.auth.get2faSecret(userId);
		// 2FA not enabled
		if (!secret)
			throw new UnauthorizedException({
				message: "2FA is not enabled",
				twofactorEnabled: false,
				twofactorValidated: false,
			});

		const dto = req.body;
		if (dto === undefined)
			throw new BadRequestException({message: 'You need to pass an object with `otp` field'})
		const { error } = OtpSchema.validate(dto);
		if (error) {
			console.log(error.message)
			throw new BadRequestException({message: error.message})
		}

		const check = otplib.authenticator.check(dto.otp, secret);
		// Invalid OTP
		if (!check) {
			console.log('OTP check failed, Invalid OTP')
			throw new UnauthorizedException({
				message: "OTP check failed, Invalid OTP",
				twofactorEnabled: true,
				twofactorValidated: false,
			});
		}

		const user = await this.auth.validateUser(email, username);

		console.log(`${JSON.stringify(user)}`);
		req.session.passport = { user };
		return user;
	}
}