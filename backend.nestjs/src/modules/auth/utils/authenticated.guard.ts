import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { RedisService } from "src/modules/redis/redis.service";
import { parse } from 'cookie';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	constructor(private readonly redis: RedisService) {}

	getCookie(cookieName: string, req) {
		const cookieHeader = req.headers.cookie;
		const cookies = parse(cookieHeader || '');
		return cookies[cookieName];
	}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const sidCookie = this.getCookie('sid', request);

		if (sidCookie != undefined && (await this.redis.getSidCookie(sidCookie) != null))
			return true;
		throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
	}
}