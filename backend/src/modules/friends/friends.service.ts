import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class FriendsService {
	constructor(private readonly prisma: PrismaService) { }

	async findAll(id: number){
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { friends: true },
		});
		if (!user)
			return null;
		return user.friends;
	}

	// depth mustn't be called with a depth, or called with a depth of 0
	async addFriend(id: number, friendId: number, depth: number = 0) {
		// Add the friend on the other side in a recursive manner
		if (depth === 0)
			this.addFriend(friendId, id, 1);

		const user = await this.prisma.user.findUnique({ where : { id }, select: { friends: true }});
		if (!user || user.friends.includes(friendId))
			return user;

		const friendIds: number[] = [...user.friends, friendId];

		return this.prisma.user.update({
			where: { id },
			data: { friends: friendIds },
			select: { friends: true},
		});
	}

	// depth mustn't be called with a depth, or called with a depth of 0
	async removeFriend(id: number, friendId: number, depth: number = 0) {
		// Remove the friend on the other side in a recursive manner
		if (depth === 0)
			this.removeFriend(friendId, id, 1);

		const user = await this.prisma.user.findUnique({ where: { id }, select: { friends: true} });
		if (!user || !user.friends.includes(friendId))
			return user;

		const friendIds: number[] = user.friends.filter(id => id !== friendId);

		return this.prisma.user.update({
			where: { id },
			data: { friends: friendIds },
			select: { friends: true },
		})
	}
}