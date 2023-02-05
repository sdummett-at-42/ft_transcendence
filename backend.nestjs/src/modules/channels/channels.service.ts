import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { HttpException } from "@nestjs/common";
import { CreateChannelDto, UpdateChannelDto } from "./channel.dto";

@Injectable()
export class ChannelsService {
	constructor(private readonly prisma: PrismaService) { }

	async createChannel(ownerId: number, dto: CreateChannelDto) {
		const channel = await this.prisma.channel.findUnique({
			where: { name : dto.name },
			select: {
				id: true,
			}
		});
		if (channel)
			throw new HttpException('Channel name already taken', 409);
		const hasPassword = dto.password ? true : false;
		return this.prisma.channel.create({
			data: {
				name: dto.name,
				isPublic: dto.isPublic,
				password: dto.password,
				hasPassword,
				owner: {
					connect: {
						id: ownerId,
					}
				}
			},
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
			}
		});
	}

	async findAllChannels() {
		return this.prisma.channel.findMany({
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
			}
		});
	}

	async findAllPublicChannels() {
		return this.prisma.channel.findMany({
			where: {
				isPublic: true,
			},
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
			}
		});
	}

	async findOneChannelById(id: number) {
		const channel = await this.prisma.channel.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
				owner: true,
			}
		});
		if (!channel)
			throw new HttpException('Channel not found', 404);
		return channel;
	}

	async findOnePublicChannelById(id: number) {
		const channel = await this.prisma.channel.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
			}
		});
		if (!channel || !channel.isPublic)
			throw new HttpException('Channel not found', 404);
		return channel;
	}

	async updateChannel(id: number, dto: UpdateChannelDto) {
		if (dto.name) {
			const channel = await this.prisma.channel.findUnique({
				where: { name: dto.name },
				select: {
					id: true,
				}
			});
			if (channel && channel.id !== id)
				throw new HttpException('Channel name already taken', 409);
		}
		const updatedChannel = await this.prisma.channel.update({
			where: { id },
			data: dto ,
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
			}
		});
		if (!updatedChannel)
			throw new HttpException('Channel not found', 404);
		return updatedChannel;
	}

	async deleteChannel(id: number) {
		const deletedChannel = await this.prisma.channel.delete({
			where: { id },
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
			}
		});
		if (!deletedChannel)
			throw new HttpException('Channel not found', 404);
		return deletedChannel;
	}
}