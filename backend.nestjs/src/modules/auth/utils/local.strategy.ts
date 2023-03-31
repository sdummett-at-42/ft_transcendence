import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
import * as Joi from 'joi';
import { LoginMethod } from "@prisma/client";

const PASSWORD_MIN = 16;
const USERNAME_MIN = 3;
const USERNAME_MAX = 16;
export const RegisterSchema = Joi.object({
	username: Joi.string().min(USERNAME_MIN).max(USERNAME_MAX).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(PASSWORD_MIN).required(),
});

export const LoginSchema = Joi.object({
	username: Joi.string().min(USERNAME_MIN).max(USERNAME_MAX).required(),
	password: Joi.string().min(PASSWORD_MIN).required(),
});

const REGISTER = "REGISTER";
const LOGIN = "LOGIN";
export const AuthSchema = Joi.object({
	auth: Joi.string().valid(REGISTER, LOGIN).required(),
});

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(
		private readonly authService: AuthService,
		private readonly config: ConfigService,
	) {
		super();
	}

	async handleLogin({ username, password }) {
		console.log(`handleLogin()`);
		const { error } = LoginSchema.validate({ username, password });
		if (error)
			throw new BadRequestException(error.message);
		console.log(`username: ${username}`)
		console.log(`password: ${password}`)

		const user = await this.authService.findUserByName(username);
		if (!user)
			throw new NotFoundException('Username not registered.');

		if (user.loginMethod != LoginMethod.LOCAL)
			throw new ConflictException(`You used another signin method. (${user.loginMethod})`);

		if (user.password != password)
			throw new BadRequestException('Wrong password');

		return user;
	}

	async handleRegister({ username, email, password }) {
		console.log(`handleRegister()`);
		const { error } = RegisterSchema.validate({ username, email, password });
		if (error)
			throw new BadRequestException(error.message);
		console.log(`username: ${username}`)
		console.log(`email   : ${email}`)
		console.log(`password: ${password}`)

		let user = await this.authService.findUserByEmail(email);
		if (user)
			throw new ConflictException('Email already registered.');

		user = await this.authService.findUserByName(username);
		if (user)
			throw new ConflictException('Username already registered.');

		// Save user in redis (with an expiration of 1 day)
		// Generate a random string
		// Send an email with an url containing the random string

		// Create the endpoint that handle email confirmation
		const image: { base64: string, mimeType: string } = {base64: "MOCKBASE64", mimeType: "MOCKMIMETYPE"};
		return await this.authService.createUser(LoginMethod.LOCAL, email, username, password, image);
		// return user;
	}

	async validate(req): Promise<any> {
		const { username, email, password, auth } = req.body;

		const { error } = AuthSchema.validate({ auth });
		if (error)
			throw new BadRequestException(error.message);

		let user;
		console.log(`auth: ${auth}`);
		if (auth === REGISTER)
			user = await this.handleRegister({ username, email, password });
		else
			user = await this.handleLogin({ username, password });

		req.session.passport = { user };
		return user;
	}
}
