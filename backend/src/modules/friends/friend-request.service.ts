import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { FriendsService } from "./friends.service";

@Injectable()
export class FriendRequestService {
	constructor(private readonly prisma: PrismaService, private readonly friends: FriendsService) { }

	async sendFriendRequest(id: number, friendId: number) {
		if (+id === +friendId)
			throw new HttpException('You cannot send a friend request to yourself', HttpStatus.BAD_REQUEST);

		const friend = await this.friends.findOneFriend(id, friendId);

		if (friend)
			throw new HttpException('You are already friends with this user', HttpStatus.BAD_REQUEST);

		const friendRequest = await this.prisma.friendRequest.findUnique({
			where: {
				senderId_receiverId: {
					senderId: +id,
					receiverId: +friendId
				}
			}
		})
		if (friendRequest)
			throw new HttpException('You already sent a friend request to this user', HttpStatus.BAD_REQUEST);

		return this.prisma.friendRequest.upsert({
			where: {
				senderId_receiverId: {
					senderId: +id,
					receiverId: +friendId
				}
			},
			update: {},
			create: {
				sender: { connect: { id: +id } },
				receiver: { connect: { id: +friendId } },
			},
			select: {
				receiver: {
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

	getSendedFriendRequests(id: number) {
		return this.prisma.friendRequest.findMany({
			where: { senderId: +id },
			select: {
				receiver: {
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

	getReceivedFriendRequests(id: number) {
		return this.prisma.friendRequest.findMany({
			where: { receiverId: +id },
			select: {
				sender: {
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

	async acceptFriendRequest(id: number, friendId: number) {
		const friendRequest = await this.prisma.friendRequest.findUnique({
			where: {
				senderId_receiverId: {
					senderId: +friendId,
					receiverId: +id
				}
			}
		})
		if (!friendRequest)
			throw new HttpException('You do not have a friend request from this user', HttpStatus.BAD_REQUEST);

		// Delete the friendship request
		await this.prisma.friendRequest.delete({
			where: {
				senderId_receiverId: {
					senderId: +friendId,
					receiverId: +id
				}
			}
		})
		// Add the friend in both sides
		await this.prisma.friend.upsert({
			where: {
				userId_friendId: {
					userId: +friendId,
					friendId: +id
				}
			},
			update: {},
			create: {
				user: { connect: { id: +friendId } },
				friend: { connect: { id: +id } },
			}
		});

		return this.friends.addFriend(id, friendId);
	}

	async declineFriendRequest(id: number, friendId: number) {
		const friendRequest = await this.prisma.friendRequest.findUnique({
			where: {
				senderId_receiverId: {
					senderId: +friendId,
					receiverId: +id
				}
			}
		})
		if (!friendRequest)
			throw new HttpException('You do not have a friend request from this user', HttpStatus.BAD_REQUEST);

		return this.prisma.friendRequest.delete({
			where: {
				senderId_receiverId: {
					senderId: +friendId,
					receiverId: +id
				}
			},
			select: {
				sender: {
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
}