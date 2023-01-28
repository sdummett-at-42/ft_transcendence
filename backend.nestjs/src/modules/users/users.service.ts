import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {

	constructor(private readonly prisma: PrismaService) { }

	create(createUserDto: CreateUserDto) {
		return this.prisma.user.create({
			data: createUserDto,
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			}
		});
	}

	findAllUsers() {
		return this.prisma.user.findMany({
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			}
		});
	}

	async findOneUserById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			}
		});
		if (!user)
			throw new HttpException('User not found', 404);
		return user;
	}

	findOneUserByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } });
	}

	updateUser(id: number, updateUserDto: UpdateUserDto) {
		return this.prisma.user.update({
			where: { id },
			data: updateUserDto,
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			}
		});
	}

	removeUser(id: number) {
		return this.prisma.user.delete({
			where: { id },
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			}
		});
	}

	async generateUsername(){
		let buffer = randomBytes(10);
		let name = 'player-' + buffer.toString('hex');
		let user = await this.prisma.user.findUnique({ where: { name } });
		while (user) {
			console.log('user already exists');
			name = 'player-' + buffer.toString('hex');
			user = await this.prisma.user.findUnique({ where: { name } });
		}
		return name;
	}
}

