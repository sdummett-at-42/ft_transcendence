import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { HttpException } from "@nestjs/common";

@Injectable()
export class ChannelsService {
	constructor(private readonly prisma: PrismaService) { }

	async createChannel(name: string, ownerId: number, isPublic: boolean, password?: string) {
		const channel = await this.prisma.channel.findUnique({
			where: { name },
			select: {
				id: true,
			}
		});
		if (channel)
			throw new HttpException('Channel name already taken', 409);
		return this.prisma.channel.create({
			data: {
				name,
				isPublic,
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
		// check if channel exists
		const channel = await this.prisma.channel.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				isPublic: true,
				hasPassword: true,
			}
		});
		if (!channel)
			throw new HttpException('Channel not found', 404);
		return channel;
	}

	async updateChannelName(id: number, name: string) {
		const channel = await this.prisma.channel.findUnique({
			where: { name },
			select: {
				id: true,
			}
		});
		if (channel && channel.id !== id)
			throw new HttpException('Channel name already taken', 409);

		const updatedChannel = this.prisma.channel.update({
			where: { id },
			data: {
				name,
			},
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

	async updateChannelPassword(id: number, password: string) {
		const updatedChannel = await this.prisma.channel.update({
			where: { id },
			data: {
				password,
			},
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

	async updateChannelIsPublic(id: number, isPublic: boolean) {
		const updatedChannel = await this.prisma.channel.update({
			where: { id },
			data: {
				isPublic,
			},
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