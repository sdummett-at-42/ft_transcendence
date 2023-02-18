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
	HttpException,
	HttpStatus,
	HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { ManageGuard } from '../../shared/manage.guard';
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
	@ApiOkResponse({ type: UserEntity, isArray: true })
	findAll() {
		return this.users.findAllUsers();
	}

	@Get('me')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@ApiOkResponse({ type: UserEntity })
	findMe(@Request() req) {
		return this.users.findOneUserById(req.user.id);
	}

	@Post('me/logout')
	@HttpCode(201)
	@UseGuards(AuthenticatedGuard)
	@ApiCreatedResponse({ type: UserEntity })
	logout(@Request() req) {
		this.chat.onLogoutViaController(req.user.id);
		const user = req.user;
		req.logout((err) => {
			if (err) {
			  console.error(err);
			  throw new HttpException('Error logging out', HttpStatus.INTERNAL_SERVER_ERROR);
			}
		});
		return user;
	}

	@Delete('me/delete')
	@HttpCode(204)
	@UseGuards(AuthenticatedGuard)
	@ApiNoContentResponse({ type: UserEntity })
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
	@ApiOkResponse({ type: UserEntity })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const user = await this.users.findOneUserById(id);
		if (!user)
			throw new NotFoundException(`User with id ${id} does not exist.`);
		return user;
	}

	@Patch(':id')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@UseGuards(ContentTypeGuard)
	@ApiOkResponse({ type: UserEntity })
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.users.updateUser(id, updateUserDto);
	}

	@Delete(':id')
	@HttpCode(204)
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@UseGuards(ContentTypeGuard)
	@ApiNoContentResponse({ type: UserEntity })
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.users.removeUser(id);
	}
}
