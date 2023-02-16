import { Controller, Get, UseGuards, Req, ParseIntPipe, Post, Patch, Delete, Body } from "@nestjs/common";
import { AuthenticatedGuard } from "src/modules/auth/utils/authenticated.guard";
import { ContentTypeGuard } from "src/shared/content-type.guard";
import { FriendsService } from "./friends.service";
import { FriendRequestService } from "./friend-request.service";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from "src/modules/users/entities/user.entity";

@Controller('friends')
export class FriendsController {
	constructor(private readonly friends: FriendsService, private readonly friendRequest: FriendRequestService) { }

	@Get()
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getFriends(@Req() request) {
		return this.friends.findAllFriends(request.user.id);
	}

	@Delete()
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity })
	async removeFriend(
		@Req() request,
		@Body('friendId') friendId: number,
	) {
		return this.friends.removeFriend(request.user.id, friendId);
	}

	@Post('requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiCreatedResponse({ type: UserEntity })
	async sendFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.sendFriendRequest(request.user.id, friendId);
	}

	@Patch('requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity })
	async acceptFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.acceptFriendRequest(request.user.id, friendId);
	}

	@Delete('requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity })
	async declineFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.declineFriendRequest(request.user.id, friendId);
	}

	@Get('requests/sended')
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getFriendRequests(@Req() request ) {
		return this.friendRequest.getSendedFriendRequests(request.user.id);
	}

	@Get('requests/received')
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getReceivedFriendRequests(@Req() request ) {
		return this.friendRequest.getReceivedFriendRequests(request.user.id);
	}
}