import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class BodySizeGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
		console.log("BodySizeGuard")
        const request = context.switchToHttp().getRequest();
        const limit = 2048000; // 2MB
        if (request.headers['content-length'] > limit) {
			throw new HttpException('Request body too large', HttpStatus.PAYLOAD_TOO_LARGE);

        }
        return true;
    }
}
