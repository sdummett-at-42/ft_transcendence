import { Controller, Get, UseGuards, Param, ParseIntPipe, Post, Patch, Delete, Body } from "@nestjs/common";
import { AuthenticatedGuard } from "src/modules/auth/utils/authenticated.guard";
import { ManageGuard } from "src/shared/manage.guard";
import { ContentTypeGuard } from "src/shared/content-type.guard";
import { FriendsService } from "./friends.service";
import { FriendRequestService } from "./friend-request.service";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity }from "src/modules/users/entities/user.entity";

@Controller('users/:id/friends')
export class FriendsController {
	constructor(private readonly friends: FriendsService, private readonly friendRequest: FriendRequestService) { }

	@Get()
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getFriends(@Param('id', ParseIntPipe) id: number) {
		return this.friends.findAllFriends(id);
	}

	@Delete()
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity })
	async removeFriend(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		console.log("hello world")
		return this.friends.removeFriend(id, friendId);
	}

	@Post('requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@UseGuards(ContentTypeGuard)
	@ApiCreatedResponse({ type: UserEntity })
	async sendFriendRequest(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.sendFriendRequest(id, friendId);
	}

	@Patch('requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity })
	async acceptFriendRequest(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.acceptFriendRequest(id, friendId);
	}

	@Delete('requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity })
	async declineFriendRequest(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.declineFriendRequest(id, friendId);
	}

	@Get('requests/sended')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getFriendRequests(@Param('id', ParseIntPipe) id: number) {
		return this.friendRequest.getSendedFriendRequests(id);
	}

	@Get('requests/received')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getReceivedFriendRequests(@Param('id', ParseIntPipe) id: number) {
		return this.friendRequest.getReceivedFriendRequests(id);
	}

}