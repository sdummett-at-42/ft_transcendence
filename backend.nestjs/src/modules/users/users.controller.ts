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
	Post,
	Req,
	HttpException,
	HttpStatus,
	HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthenticatedGuard } from 'src/modules/auth/utils/authenticated.guard';
import { ContentTypeGuard } from '../../shared/content-type.guard';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('users')
@ApiTags('users')
export class UsersController {
	constructor(private readonly users: UsersService, private readonly chat: ChatGateway) { }

	@Get()
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, isArray: true, description: 'Returns all users' })
	findAll() {
		return this.users.findAllUsers();
	}

	@Get('me')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity, description: 'Returns the current user' })
	findMe(@Request() req) {
		return this.users.findOneUserById(req.user.id);
	}

	@Post('me/logout')
	@HttpCode(201)
	@UseGuards(AuthenticatedGuard)
	@ApiCreatedResponse({ type: UserEntity, description: 'Logs out the current user' })
	logout(@Request() req) {
		this.chat.onLogoutViaController(req.user.id);
		const user = req.user;
		req.logout((err) => {
			if (err)
			  console.error(err);
		});
		return user;
	}

	@Delete('me/delete')
	@HttpCode(204)
	@UseGuards(AuthenticatedGuard)
	@ApiNoContentResponse({ type: UserEntity, description: 'Deletes the current user' })
	async deleteMe(@Request() req) {
		const user = await this.users.removeUser(req.user.id);
		this.chat.onLogoutViaController(req.user.id);
		req.logout((err) => {
			return user;
		});
	}

	@Get(':id')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
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
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity, description: 'Updates a user by id' })
	update(
		@Body() updateUserDto: UpdateUserDto,
		@Req() request,
	) {
		return this.users.updateUser(request.user.id, updateUserDto);
	}
}
