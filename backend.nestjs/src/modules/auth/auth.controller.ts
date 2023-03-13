import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FortyTwoAuthGuard } from "./utils/fortytwo-auth.guard";

ApiTags('auth')
@Controller("auth")
export class AuthController {

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
}
