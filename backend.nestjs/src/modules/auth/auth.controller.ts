import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GoogleAuthGuard } from "./utils/google-auth.guard";

ApiTags('auth')
@Controller("auth")
export class AuthController {
	
	@Get("google/login")
	@UseGuards(GoogleAuthGuard)
	handleLogin() {
		return {msg: 'Google authentication'};
	}

	// api/auth/google/redirect
	@Get("google/redirect")
	@UseGuards(GoogleAuthGuard)
	handleRedirect() {
		return {msg: "OK"};
	}
}