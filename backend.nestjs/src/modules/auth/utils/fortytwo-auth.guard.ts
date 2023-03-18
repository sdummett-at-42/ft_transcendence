import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		// const request = context.switchToHttp().getRequest();
		if (!activate)
			throw new UnauthorizedException("Unauthorized");
		// await super.logIn(request);
		return activate;
	}
}