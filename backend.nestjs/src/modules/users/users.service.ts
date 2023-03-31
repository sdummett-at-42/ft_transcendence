import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomBytes } from 'crypto';
import { ImagesService } from '../images/images.service';
import { LoginMethod } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly images: ImagesService,
	) { }

	async create(loginMethod: LoginMethod, email: string, username: string, image) {
		const user = await this.prisma.user.create({
			data: {
				email,
				name: username,
				loginMethod,
			},
		});

		// const defaultImage = await this.images.findOneImage(0);
		await this.images.create(
			image.base64,
			image.mimeType,
			user.name,
			user.id,
		);
		return this.prisma.user.update({
			where: { id: user.id },
			data: {
				profilePicture: `http://localhost:3001/images/${user.id}`,
			},
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			},
		});
	}

	findAllUsers() {
		return this.prisma.user.findMany({
			where: {
				id: { not: 0 },
			},
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			},
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
			},
		});
		// if (!user || user.id === 0)
		// 	throw new HttpException('User not found', 404);
		if (user && user.id === 0) return null;
		return user;
	}

	async findOneUserByIdWithEmail(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
				email: true,
			},
		});
		if (!user || user.id === 0) throw new HttpException('User not found', 404);
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
			},
		});
	}

	async update2faIsEnabled(id: number, enabled: boolean) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) return null;
		return this.prisma.user.update({
			where: { id },
			data: { twofactorIsEnabled: enabled },
			select: { twofactorIsEnabled: true },
		});
	}

	async set2faSecret(id: number, secret: string) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) return;
		const up = await this.prisma.user.update({
			where: { id },
			data: { twofactorSecret: secret },
		});
	}

	async get2faIsEnabled(id: number) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) return null;
		return user.twofactorIsEnabled;
	}

	async get2faSecret(id: number) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) return null;
		return user.twofactorSecret;
	}

	async removeUser(id: number) {
		await this.images.removeImage(id);
		return this.prisma.user.delete({
			where: { id },
			select: {
				id: true,
				name: true,
				profilePicture: true,
				elo: true,
			},
		});
	}

	async generateUsername() {
		let buffer = randomBytes(10);
		let name = 'player-' + buffer.toString('hex');
		let user = await this.prisma.user.findUnique({ where: { name } });
		while (user) {
			name = 'player-' + buffer.toString('hex');
			user = await this.prisma.user.findUnique({ where: { name } });
		}
		return name;
	}
}
