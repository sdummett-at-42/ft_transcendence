import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	
	constructor(@Inject("AUTH_SERVICE") private readonly authService: AuthService, private readonly config: ConfigService) {
		super({
			clientID: config.get("GOOGLE_CLIENT_ID"),
			clientSecret: config.get("GOOGLE_CLIENT_SECRET"),
			callbackURL: "http://localhost:3001/auth/google/redirect",
			scope: ["email"],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = this.authService.validateUser(profile.emails[0].value);
		return user || null;
	}
}