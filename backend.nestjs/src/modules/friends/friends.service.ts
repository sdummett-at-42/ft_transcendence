import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class FriendsService {
	constructor(private readonly prisma: PrismaService) { }

	findOneFriend(id: number, friendId: number) {
		return this.prisma.friend.findUnique({
			where: {
				userId_friendId: {
					userId: +id,
					friendId: +friendId
				}
			},
			select: {
				friend: {
					select: {
						id: true,
						name: true,
						profilePicture: true,
						elo: true
					}
				}
			}
		});
	}

	addFriend(id: number, friendId: number) {
		return this.prisma.friend.upsert({
			where: {
				userId_friendId: {
					userId: +id,
					friendId: +friendId
				}
			},
			update: {},
			create: {
				user: { connect: { id: +id } },
				friend: { connect: { id: +friendId } },
			},
			select: {
				friend: {
					select: {
						id: true,
						name: true,
						profilePicture: true,
						elo: true
					}
				}
			}
		});
	}

	findAllFriends(id: number) {
		return this.prisma.friend.findMany({
			where: { userId: +id },
			select: {
				friend: {
					select: {
						id: true,
						name: true,
						profilePicture: true,
						elo: true

					}
				}
			},
		})
	}

	// sendFriendRequest(id: number, friendId: number) {

	async removeFriend(id: number, friendId: number) {
		const friend = await this.prisma.friend.findUnique({
			where: {
				userId_friendId: {
					userId: +id,
					friendId: +friendId
				}
			}
		})
		if (!friend)
			throw new HttpException('You are not friends with this user', HttpStatus.BAD_REQUEST);

		this.prisma.friend.delete({
			where: {
				userId_friendId: {
					userId: +friendId,
					friendId: +id
				}
			}
		})
		return this.prisma.friend.delete({
			where: {
				userId_friendId: {
					userId: +id,
					friendId: +friendId
				}
			},
			select: {
				friend: {
					select: {
						id: true,
						name: true,
						profilePicture: true,
						elo: true
					}
				}
			}
		})
	}
}