import { CanActivate, ExecutionContext, UnauthorizedException, Injectable } from "@nestjs/common";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	constructor() {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		if (request.isAuthenticated())
			return true;
		throw new UnauthorizedException('Unauthorized');
	}
}