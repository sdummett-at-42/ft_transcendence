import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

	sendFriendRequest(id: number, friendId: number) {
		if (+id === +friendId) 
			throw new HttpException('You cannot send a friend request to yourself', 400);

		const friend = this.prisma.friend.findUnique({
			where: {
				userId_friendId: {
					userId: +id,
					friendId: +friendId
				}
			}
		})

		if (friend)
		throw new HttpException('You are already friends with this user', 400);

		const friendRequest = this.prisma.friendRequest.findUnique({
			where: {
				senderId_receiverId: {
					senderId: +id,
					receiverId: +friendId
				}
			}
		})
		if (friendRequest)
		throw new HttpException('You already sent a friend request to this user', 400);

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
			throw new HttpException('You do not have a friend request from this user', 400);

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
		})

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
		})
	}

	declineFriendRequest(id: number, friendId: number) {
		const friendRequest = this.prisma.friendRequest.findUnique({
			where: {
				senderId_receiverId: {
					senderId: +friendId,
					receiverId: +id
				}
			}
		})
		if (!friendRequest)
			throw new HttpException('You do not have a friend request from this user', 400);

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
			throw new HttpException('You are not friends with this user', 400);

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

