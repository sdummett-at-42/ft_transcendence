import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ContentTypeGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		if (request.headers["content-type"] !== "application/json") {
			throw new HttpException('Invalid content-type', HttpStatus.BAD_REQUEST);
		}
		return true;
	}
}