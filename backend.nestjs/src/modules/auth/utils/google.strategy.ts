import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	
	constructor(@Inject("AUTH_SERVICE") private readonly authService: AuthService) {
		super({
			clientID: "1045717457926-kgdcav689el0pdvt01idctpv0a9jlpd4.apps.googleusercontent.com",
			clientSecret: "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",
			callbackURL: "http://localhost:3001/auth/google/redirect",
			scope: ["email"],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = this.authService.validateUser(profile.emails[0].value);
		return user || null;
	}
}