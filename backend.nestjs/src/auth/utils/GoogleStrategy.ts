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
			callbackURL: "http://localhost:3001/api/auth/google/redirect",
			scope: ["profile", "email"],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		// console.log(accessToken);
		// console.log(refreshToken);
		// console.log(profile);
		// console.log("validate function");
		const user = this.authService.validateUser({
			email: profile.emails[0].value,
			displayName: profile.displayName
		});
		// console.log("Validate");
		// console.log(user);
		return user || null;
	}
}