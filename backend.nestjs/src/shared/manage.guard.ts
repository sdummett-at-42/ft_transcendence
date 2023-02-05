import { CanActivate, ExecutionContext } from "@nestjs/common";

export class ManageGuard implements CanActivate {
	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		if (!request.user)
			return false;
		if (request.user.id != request.params.id)
			return false;
		return true;
	}
}