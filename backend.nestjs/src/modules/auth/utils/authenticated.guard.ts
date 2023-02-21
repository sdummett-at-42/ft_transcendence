import { CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

export class AuthenticatedGuard implements CanActivate {
	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		if (request.isAuthenticated())
			return true;
		throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
	}
}