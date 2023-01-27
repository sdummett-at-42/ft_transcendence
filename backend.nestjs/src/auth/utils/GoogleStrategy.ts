import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { generateUsername } from "src/users/generateUsername";
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
		const user = this.authService.validateUser({
			email: profile.emails[0].value,
			name: await generateUsername(),
			profilePicture: profile.photos[0].value,
		});
		return user || null;
	}
}