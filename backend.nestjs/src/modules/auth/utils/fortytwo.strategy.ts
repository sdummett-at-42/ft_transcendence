import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-42";
import { AuthService } from "../auth.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService, private readonly config: ConfigService) {
		super({
			clientID: config.get("FORTYTWO_CLIENT_ID"),
			clientSecret: config.get("FORTYTWO_CLIENT_SECRET"),
			callbackURL: config.get("FORTYTWO_CALLBACK_URL"),
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		console.log(`validate: profile.name: ${JSON.stringify(profile.name)}`)
		const user = await this.authService.validateUser(profile.emails[0].value, profile.name.givenName);
		return user;
	}
}