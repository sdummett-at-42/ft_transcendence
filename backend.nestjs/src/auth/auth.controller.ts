import { Controller, Get, UseGuards } from "@nestjs/common";
import { GoogleAuthGuard } from "./utils/Guard";

@Controller("auth")
export class AuthController {
	
	@Get("google/login")
	@UseGuards(GoogleAuthGuard)
	handleLogin() {
		console.log("handleLogin");
		return {msg: 'Google authentication'};
	}

	// api/auth/google/redirect
	@Get("google/redirect")
	@UseGuards(GoogleAuthGuard)
	handleRedirect() {
		return {msg: "OK"};
	}
}