import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	NotFoundException,
	UseGuards,
	Request,
	Req,
	HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthenticatedGuard } from 'src/modules/auth/utils/authenticated.guard';
import { ContentTypeGuard } from '../../shared/content-type.guard';
import { ChatGateway } from '../chat/chat.gateway';
import { UserMeEntity } from './entities/userme.entity';
import { AchievementEntity } from './entities/achievements.entity';

@Controller('users')
@UseGuards(AuthenticatedGuard)
@ApiTags('users')
export class UsersController {
	constructor(private readonly users: UsersService) { }

	@Get()
	@HttpCode(200)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all users' })
	findAll() {
		return this.users.findAllUsers();
	}

	@Get('me')
	@HttpCode(200)
	@ApiOkResponse({ type: UserMeEntity, description: 'Returns the current user' })
	findMe(@Request() req) {
		return this.users.findMe(req.user.id);
	}

	@Get('me/matchs')
	@HttpCode(200)
	@ApiOkResponse({ type: UserMeEntity, description: 'Returns all the matches of the current user' })
	async findMeMatchs(@Request() req) {
		return await this.users.findUserMatchs(req.user.id);
	}

	@Get(':id/matchs')
	@HttpCode(200)
	@ApiOkResponse({ type: UserMeEntity, description: 'Returns all the matches of an user' })
	async findUserMatchs(@Param('id', ParseIntPipe) id: number) {
		const user = await this.users.findOneUserById(id);
		if (!user)
			throw new NotFoundException(`User with id ${id} does not exist.`);
		return await this.users.findUserMatchs(id);
	}

	@Delete('me')
	@HttpCode(204)
	@ApiNoContentResponse({ type: UserEntity, description: 'Deletes the current user' })
	async deleteMe(@Request() req) {
		const user = await this.users.removeUser(req.user.id);
		// this.chat.disconnectUserSockets(req.user.id);
		req.logout((err) => {
			return user;
		});
	}

	@Get(':id')
	@HttpCode(200)
	@ApiOkResponse({ type: UserEntity, description: 'Returns a user by id' })
	@ApiNotFoundResponse({ description: 'User not found' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const user = await this.users.findOneUserById(id);
		if (!user)
			throw new NotFoundException(`User with id ${id} does not exist.`);
		return user;
	}

	@Patch('me')
	@HttpCode(200)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity, description: 'Updates a user by id' })
	update(
		@Body() updateUserDto: UpdateUserDto,
		@Req() request,
	) {
		return this.users.updateUser(request.user.id, updateUserDto);
	}

	@Get('me/achievements')
	@HttpCode(200)
	@ApiOkResponse({ type: AchievementEntity, description: 'Return an achievements array of the current user.'})
	async getMyAchievements(@Request() req) {
		return this.users.getAchievements(req.user.id);
	}

	@Get(':id/achievements')
	@HttpCode(200)
	@ApiOkResponse({ type: AchievementEntity, description: 'Return an achievements array of an user.'})
	async getUserAchievements(@Param('id', ParseIntPipe) id: number) {
		const user = await this.users.findOneUserById(id);
		if (!user)
			throw new NotFoundException(`User with id ${id} does not exist.`);
		return this.users.getAchievements(id);
	}
}
