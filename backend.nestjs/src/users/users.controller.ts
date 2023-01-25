import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	NotFoundException,
	Session,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { ManageGuard } from './manage.guard';
import { AuthenticatedGuard } from 'src/auth/utils/authenticated.guard';

@Controller('users')
@ApiTags('users')
export class UsersController {
	constructor(private readonly users: UsersService) { }

	@Get()
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	findAll() {
		return this.users.findAllUsers();
	}

	@Get(':id')
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const user = await this.users.findOneUserById(id);
		if (!user)
			throw new NotFoundException(`User with id ${id} does not exist.`);
		return user;
	}

	@Patch(':id')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity })
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.users.updateUser(id, updateUserDto);
	}

	@Delete(':id')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity })
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.users.removeUser(id);
	}

	@Get(':id/friends')
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getFriends(@Param('id', ParseIntPipe) id: number) {
		return this.users.findAllFriends(id);
	}

	@Delete(':id/friends')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity })
	async removeFriend(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		console.log("hello world")
		return this.users.removeFriend(id, friendId);
	}

	@Post(':id/friends/requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiCreatedResponse({ type: UserEntity })
	async sendFriendRequest(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		return this.users.sendFriendRequest(id, friendId);
	}

	@Patch(':id/friends/requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity })
	async acceptFriendRequest(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		return this.users.acceptFriendRequest(id, friendId);
	}

	@Delete(':id/friends/requests')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity })
	async declineFriendRequest(
		@Param('id', ParseIntPipe) id: number,
		@Body('friendId') friendId: number,
	) {
		return this.users.declineFriendRequest(id, friendId);
	}

	@Get(':id/friends/requests/send')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getFriendRequests(@Param('id', ParseIntPipe) id: number) {
		return this.users.getSendedFriendRequests(id);
	}

	@Get(':id/friends/requests/receive')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true })
	async getReceivedFriendRequests(@Param('id', ParseIntPipe) id: number) {
		return this.users.getReceivedFriendRequests(id);
	}
}
