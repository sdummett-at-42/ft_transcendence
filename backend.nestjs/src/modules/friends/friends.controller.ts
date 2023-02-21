import { Controller, Get, UseGuards, Req, ParseIntPipe, Post, Patch, Delete, Body, HttpCode } from "@nestjs/common";
import { AuthenticatedGuard } from "src/modules/auth/utils/authenticated.guard";
import { ContentTypeGuard } from "src/shared/content-type.guard";
import { FriendsService } from "./friends.service";
import { FriendRequestService } from "./friend-request.service";
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from "src/modules/users/entities/user.entity";

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
	constructor(private readonly friends: FriendsService, private readonly friendRequest: FriendRequestService) { }

	@Get()
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all friends' })
	async getFriends(@Req() request) {
		return this.friends.findAllFriends(request.user.id);
	}

	@Delete()
	@HttpCode(204)
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiNoContentResponse({ type: UserEntity, description: 'Removes a friend' })
	async removeFriend(
		@Req() request,
		@Body('friendId') friendId: number,
	) {
		return this.friends.removeFriend(request.user.id, friendId);
	}

	@Post('requests')
	@HttpCode(201)
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiCreatedResponse({ type: UserEntity, description: 'Sends a friend request' })
	async sendFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.sendFriendRequest(request.user.id, friendId);
	}

	@Patch('requests')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity, description: 'Accepts a friend request' })
	async acceptFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.acceptFriendRequest(request.user.id, friendId);
	}

	@Delete('requests')
	@HttpCode(204)
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiNoContentResponse({ type: UserEntity, description: 'Declines a friend request' })
	async declineFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.declineFriendRequest(request.user.id, friendId);
	}

	@Get('requests/sended')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all sended friend requests' })
	async getFriendRequests(@Req() request ) {
		return this.friendRequest.getSendedFriendRequests(request.user.id);
	}

	@Get('requests/received')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all received friend requests' })
	async getReceivedFriendRequests(@Req() request ) {
		return this.friendRequest.getReceivedFriendRequests(request.user.id);
	}
}