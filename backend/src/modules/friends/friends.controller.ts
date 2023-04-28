import { Controller, Get, UseGuards, Req, ParseIntPipe, Post, Patch, Delete, Body, HttpCode, BadRequestException } from "@nestjs/common";
import { AuthenticatedGuard } from "src/modules/auth/utils/authenticated.guard";
import { ContentTypeGuard } from "src/shared/content-type.guard";
import { FriendsService } from "./friends.service";
import { FriendRequestService } from "./friend-request.service";
import { ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from "src/modules/users/entities/user.entity";
import { CreateFriendRequestDto } from "./dto/friends.dto";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { AchievementService } from "../achievements/achievements.service"


@ApiTags('friends')
@Controller('friends')
@UseGuards(AuthenticatedGuard)
export class FriendsController {
	constructor(
		private readonly friends: FriendsService,
		private readonly achievement: AchievementService,
		private readonly friendRequest: FriendRequestService,
		private readonly notifications: NotificationsGateway) { }

	@Get()
	@HttpCode(200)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all friends' })
	async getFriends(@Req() request) {
		return this.friends.findAll(request.user.id);
	}

	@Delete()
	@HttpCode(204)
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
	@UseGuards(ContentTypeGuard)
	@ApiCreatedResponse({ type: UserEntity, description: 'Sends a friend request' })
	@ApiNotFoundResponse({ description: 'The friend doesnt exits'})
	async sendFriendRequest(
		@Body() dto: CreateFriendRequestDto,
		@Req() request
	) {
		const friendRequest = await this.friendRequest.sendFriendRequest(request.user.id, dto.friendId);
		this.notifications.sendFriendRequest(request.user.id, dto.friendId);
		return friendRequest;
	}

	@Patch('requests')
	@HttpCode(200)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity, description: 'Accepts a friend request' })
	async acceptFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		const friendRequest = await this.friendRequest.acceptFriendRequest(request.user.id, friendId);
		this.notifications.acceptFriendRequest(friendId, request.user.id);
		this.achievement.checker(request.user.id);
		this.achievement.checker(friendId);
		return friendRequest;
	}

	@Delete('requests/received')
	@HttpCode(204)
	@UseGuards(ContentTypeGuard)
	@ApiNoContentResponse({ type: UserEntity, description: 'Declines a received friend request' })
	async declineFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		return this.friendRequest.removeFriendRequest(request.user.id, friendId);
	}

	@Delete('requests/sended')
	@HttpCode(204)
	@UseGuards(ContentTypeGuard)
	@ApiNoContentResponse({ type: UserEntity, description: 'Remove a sent friend request' })
	async removeFriendRequest(
		@Req() request ,
		@Body('friendId') friendId: number,
	) {
		const friendRequest = await this.friendRequest.removeFriendRequest(friendId, request.user.id);
		this.notifications.cancelFriendRequest(request.user.id, friendId);
		return friendRequest;
	}

	@Get('requests/sended')
	@HttpCode(200)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all sended friend requests' })
	async getFriendRequests(@Req() request ) {
		return this.friendRequest.getSendedFriendRequests(request.user.id);
	}

	@Get('requests/received')
	@HttpCode(200)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all received friend requests' })
	async getReceivedFriendRequests(@Req() request ) {
		return this.friendRequest.getReceivedFriendRequests(request.user.id);
	}
}