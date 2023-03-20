import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	
	constructor(private readonly authService: AuthService, private readonly config: ConfigService) {
		super({
			clientID: config.get("GOOGLE_CLIENT_ID"),
			clientSecret: config.get("GOOGLE_CLIENT_SECRET"),
			callbackURL: config.get("GOOGLE_CALLBACK_URL"),
			scope: ["email"],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		console.log(`GoogleStrategy: accessToken: ${accessToken}, refreshToken: ${refreshToken}`);
		return await this.authService.validateUser(profile.emails[0].value);
	}
}