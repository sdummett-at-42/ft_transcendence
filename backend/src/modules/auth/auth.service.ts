import { Injectable } from "@nestjs/common";
import { UsersService } from "src/modules/users/users.service";
import { serialize, parse } from 'cookie';
import { ConfigService } from "@nestjs/config";
import * as crypto from 'crypto';
import { RedisService } from "../redis/redis.service";
import { ChatGateway } from "../chat/chat.gateway";
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class AuthService {
	constructor(
		private readonly users: UsersService,
		private readonly config: ConfigService,
		private readonly redis: RedisService,
		private readonly chat: ChatGateway,
		private readonly httpService: HttpService) { }

	async downloadProfilePic(profilePicUrl: string, accessToken: string) {
		const authHeader = { Authorization: `Bearer ${accessToken}` };
		const { data, headers } = await firstValueFrom(
			this.httpService.get(profilePicUrl, { headers: authHeader, responseType: 'arraybuffer' }).pipe(
				catchError((error) => {
					throw `An error happened: ${error}`;
				}),
			),
		);
		const base64 = Buffer.from(data).toString('base64');
		const mimeType = headers['content-type'];
		return { base64, mimeType };
	}

	async validateUser(email: string, username: string, profilePicUrl: string = null, accessToken: string = null) {
		const user = await this.users.findOneUserByEmail(email);
		if (user)
			return user;
		const image = await this.downloadProfilePic(profilePicUrl, accessToken);
		return await this.users.create(email, username, image);
	}

	async findUser(id: number) {
		const user = await this.users.findOneUserById(id);
		return user;
	}

	generateUsername() {
		return this.users.generateUsername();
	}

	// Return a cookie or undefined if not found
	getCookie(cookieName: string, req) {
		const cookieHeader = req.headers.cookie;
		const cookies = parse(cookieHeader || '');
		return cookies[cookieName];
	}

	// Generate 2FA ID with user ID
	generate2faId(obj: { userId: number, email: string }): string {
		const key = this.config.get('SESSION_SECRET').slice(0, 32);
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
		let encrypted = cipher.update(JSON.stringify(obj), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return iv.toString('hex') + encrypted;
	}

	// Decrypt 2FA ID to get user ID
	decrypt2faId(sessionId: string): { userId: number, email: string } {
		const key = this.config.get('SESSION_SECRET').slice(0, 32);
		const iv = Buffer.from(sessionId.slice(0, 32), 'hex');
		const encrypted = sessionId.slice(32);
		const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return JSON.parse(decrypted);
	}

	async set2faCookie(userId: number, cookieValue: string, expirationTime: number) {
		return await this.redis.set2faCookie(userId, cookieValue as string, expirationTime);
	}

	async get2faCookie(userId: number) {
		return await this.redis.get2faCookie(userId);
	}

	async set2faSecret(userId: number, secret: string) {
		return await this.users.set2faSecret(userId, secret);
	}

	async get2faSecret(userId: number) {
		return await this.users.get2faSecret(userId);
	}

	async get2faCookieExpirationTime(userId: number) {
		return await this.redis.get2faCookieExpirationTime(userId);
	}

	async findOneUserById(userId: number) {
		return await this.users.findOneUserById(userId);
	}

	async get2faIsEnabled(userId: number) {
		return await this.users.get2faIsEnabled(userId);
	}

	async update2faIsEnabled(userId: number, isEnabled: boolean) {
		return await this.users.update2faIsEnabled(userId, false);
	}

	getIssuer() {
		return this.config.get('ISSUER');
	}

	async disconnectUserSockets(userId: number) {
		this.chat.disconnectUserSockets(userId);
	}
}