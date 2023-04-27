import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class BodySizeGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
		const limit = 204800; // 200kb
        if (request.headers['content-length'] > limit) {
			throw new HttpException('Request body too large. Maximum size is 2kb', HttpStatus.PAYLOAD_TOO_LARGE);

        }
        return true;
    }
}
