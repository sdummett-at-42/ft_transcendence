import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateRoomDto, LeaveRoomDto, JoinRoomDto, BanUserDto, MuteUserDto, InviteUserDto, UnbanUserDto, UnmuteUserDto, SendMessageDto } from './chat.dto';

@Injectable()
export class ChatService {
	private readonly redis;

	constructor(private readonly redisService: RedisService) {
		this.redis = this.redisService.getClient();
	}

	async afterInit() {
		this.redis.keys('socket:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.redis.del(keys, (error, response) => {
						if (error) {
							console.log("redis.del error: ", error);
						} else {
							console.log(`redis.del: Deleting ${response} keys`);
						}
					});
				}
			}
		});
		this.redis.keys('room:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.redis.del(keys, (error, response) => {
						if (error) {
							console.log("redis.del error: ", error);
						} else {
							console.log(`redis.del: Deleting ${response} keys`);
						}
					});
				}
			}
		});
		this.redis.keys('room-messages:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.redis.del(keys, (error, response) => {
						if (error) {
							console.log("redis.del error: ", error);
						} else {
							console.log(`redis.del: Deleting ${response} keys`);
						}
					});
				}
			}
		});
		this.redis.keys('user-sockets:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.redis.del(keys, (error, response) => {
						if (error) {
							console.log("redis.del error: ", error);
						} else {
							console.log(`redis.del: Deleting ${response} keys`);
						}
					});
				}
			}
		});
		this.redis.keys('user-rooms:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.redis.del(keys, (error, response) => {
						if (error) {
							console.log("redis.del error: ", error);
						} else {
							console.log(`redis.del: Deleting ${response} keys`);
						}
					});
				}
			}
		});
	}

	async handleConnection(socket) {
		const userId = await this.getUserId(socket);
		if (userId === null) {
			console.log("User not logged in");
			socket.emit("failure", "User not logged in");
			return;
		}
		console.log(`Adding new socket in the socket list for user:${userId}`);
		socket.data.userId = userId;
		this.redis.hset(`user-sockets:${userId}`, socket.id, '1');
		socket.emit("connected");
	}

	getUserId(socket) {
		return new Promise((resolve, reject) => {
			const redisKey = `sess:${socket.handshake.headers.cookie.slice(16).split(".")[0]}`;
			this.redis.get(redisKey, (error, session) => {
				if (session === null)
					resolve(session);
				else {
					const userId = JSON.parse(session).passport.user.id;
					resolve(userId);
				}
			});
		});
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		console.log(`Socket ${socket.id} disconnected`);
		this.redis.hdel(`user-sockets:${socket.data.userId}`, socket.id, (error, response) => {
			if (error) {
				console.log("redis.hdel error: ", error);
			} else {
				console.log(`redis.hdel: Deleted ${response} keys`);
			}
		});
		if (await this.getUserSocketsNb(socket.data.userId) == 0)
			this.redis.del(`user:${socket.data.userId}`);
	}

	getUserSocketsNb(userId: number) {
		return new Promise((resolve, reject) => {
			this.redis.hlen(`user-sockets:${userId}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				resolve(response);
			});
		});
	}

	async createRoom(socket, dto: CreateRoomDto, server) {

		if (await this.checkIfRoomExists(dto.name) == true) {
			console.log(`Room ${dto.name} already exists`);
			socket.emit("failure", "Room already exists");
			return;
		}
		console.log(`Room ${dto.name} does not exist, creating...`);
		this.createRoomInRedis(socket.data.userId, dto);
		socket.join(dto.name);
		socket.emit("roomCreated");
	}

	async createRoomInRedis(userId, dto: CreateRoomDto) {
		let { password } = dto;
		if (!password)
			password = ""

		this.redis.multi()
			.hset(`room:${dto.name}`, "owner", JSON.stringify(userId))
			.hset(`room:${dto.name}`, "isPublic", JSON.stringify(dto.isPublic))
			.hset(`room:${dto.name}`, "logged", JSON.stringify([userId]))
			.hset(`room:${dto.name}`, "banned", JSON.stringify([]))
			.hset(`room:${dto.name}`, "muted", JSON.stringify([]))
			.hset(`room:${dto.name}`, "admins", JSON.stringify([userId]))
			.hset(`room:${dto.name}`, "invited", JSON.stringify([]))
			.hset(`room:${dto.name}`, "password", JSON.stringify(password))
			.exec((error, response) => {
				if (error) {
					console.error(error)
					return;
				}
				console.log(`redis: Created room:${dto.name}`);
			});

		this.redis.hset(`user-rooms:${userId}`, dto.name, '1');

		this.redis.multi()
			.zadd(`room-messages:${dto.name}`, Date.now(), JSON.stringify({ userId: -1, message: `Welcome to your channel ${dto.name}.` }))
			.expire(`room-messages:${dto.name}`, 2 * 24 * 60 * 60)
			.exec();

		// Print the newly created room for debug purpose
		this.redis.hgetall(`room:${dto.name}`, (error, response) => {
			if (error) {
				console.error(error);
				return;
			}
			console.log(response);
		})
	}

	async leaveRoom(socket, dto: LeaveRoomDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}
		console.log(`User ${socket.data.userId} is logged in room ${dto.name}, leaving...`);
		await this.leaveRoomInRedis(socket.data.userId, dto);

		if (await this.getUserRoomNb(socket.data.userId) == 0)
			this.redis.del(`user-rooms:${socket.data.userId}`);

		if (await this.checkIfRoomIsEmpty(dto.name) == true) {
			console.log("Room is empty, deleting it...");
			this.deleteRoomInRedis(dto.name);
		}
		else if (await this.checkIfUserIsOwner(socket.data.userId, dto.name) == true)
			this.changeRoomOwnerInRedis(dto.name);
		socket.leave(dto.name);
		socket.emit("roomLeft");
		server.to(dto.name).emit("userLeft", socket.data.userId);
	}

	async getUserRoomNb(userId: number) {
		return new Promise((resolve, reject) => {
			this.redis.hlen(`user-rooms:${userId}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				resolve(response);
			});
		})
	}

	async leaveRoomInRedis(userId, dto: LeaveRoomDto): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${dto.name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let logged = JSON.parse(response);
				logged = logged.filter((x) => x !== userId);
				console.log({ loggedAfterRemoverLeaver: logged });
				this.redis.hset(`room:${dto.name}`, "logged", JSON.stringify(logged));
				this.redis.hdel(`user-rooms:${userId}`, dto.name);
				resolve()
			});
		});
	}

	deleteRoomInRedis(name: string) {
		this.redis.del(`room:${name}`, (error, response) => {
			if (error) {
				console.error(error);
				return;
			}
			console.log(`redis: Deleted room:${name}`);
		});
	}

	// This function need to be improved, next owner should be the first in admin list
	// or the first user in the logged list
	changeRoomOwnerInRedis(name: string) {
		this.redis.hget(`room:${name}`, "logged", (error, response) => {
			if (error) {
				console.error(error);
				return;
			}
			let logged = JSON.parse(response);
			this.redis.hset(`room:${name}`, "owner", JSON.stringify(logged[0]));
		});
	}

	async joinRoom(socket, dto: JoinRoomDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}
		else if (await this.checkIfRoomIsPublic(dto.name) == false) {
			if (await this.checkIfUserIsInvited(socket.data.userId, dto.name) == false) {
				console.log(`User ${socket.data.userId} is not invited to room ${dto.name}`);
				socket.emit("failure", "You are not invited to this room");
				return;
			}
			else
				this.removeInvitation(socket.data.userId, dto.name);
		}

		if (await this.checkIfUserIsBanned(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is banned from room ${dto.name}`);
			socket.emit("failure", "You are banned from this room");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is already logged in room ${dto.name}`);
			socket.emit("failure", "You are already logged in this room");
			return;
		}

		if (await this.checkIfRoomIsFull(dto.name) == true) {
			console.log(`Room ${dto.name} is full`);
			socket.emit("failure", "Room is full");
			return;
		}

		if (await this.checkIfRoomIsProtected(dto.name) == true) {
			if (await this.checkIfPasswordIsCorrect(dto.name, dto.password) == false) {
				console.log(`Password for room ${dto.name} is incorrect`);
				socket.emit("failure", "Password is incorrect");
				return;
			}
		}

		console.log(`User ${socket.data.userId} is joining room ${dto.name}...`);
		await this.joinRoomInRedis(socket.data.userId, dto.name);
		socket.join(dto.name);
		socket.emit("roomJoined", dto.name);
		server.to(dto.name).emit("userJoined", socket.data.userId);
	}

	async checkIfRoomIsFull(name: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				let logged = JSON.parse(response);
				if (logged.length >= 10) {
					resolve(true);
					return;
				}
				resolve(false);
			});
		});
	}

	async joinRoomInRedis(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let logged = JSON.parse(response);
				logged.push(userId);
				this.redis.hset(`room:${name}`, "logged", JSON.stringify(logged));
				this.redis.hset(`user-rooms:${userId}`, name, '1');
				resolve();
			});
		});
	}

	async banUser(socket, dto: BanUserDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to ban user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to ban");
			return;
		}

		if (await this.checkIfUserIsBanned(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already banned from room ${dto.name}`);
			socket.emit("failure", "User is already banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is banning user ${dto.userId} from room ${dto.name}...`);
		await this.banUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userBanned", dto.userId);
	}

	async banUserInRedis(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let banned = JSON.parse(response);
				banned.push(userId);
				this.redis.hset(`room:${name}`, "banned", JSON.stringify(banned), () => {
					resolve();
				});
			});
		});
	}

	async unbanUser(socket, dto: UnbanUserDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unban user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to unban");
			return;
		}

		if (await this.checkIfUserIsBanned(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not banned from room ${dto.name}`);
			socket.emit("failure", "User is not banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is unbanning user ${dto.userId} from room ${dto.name}...`);
		await this.unbanUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userUnbanned", dto.userId);
	}

	async unbanUserInRedis(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let banned = JSON.parse(response);
				banned = banned.filter((x) => x != userId);
				this.redis.hset(`room:${name}`, "banned", JSON.stringify(banned), () => {
					resolve();
				});
			});
		});
	}

	async muteUser(socket, dto: MuteUserDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to mute user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to mute");
			return;
		}

		if (await this.checkIfUserIsMuted(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already muted in room ${dto.name}`);
			socket.emit("failure", "User is already muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is muting user ${dto.userId} in room ${dto.name}...`);
		// ADD: the mute timeout should be added here
		await this.muteUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userMuted", dto.userId);
	}

	async muteUserInRedis(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "muted", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let muted = JSON.parse(response);
				muted.push(userId);
				this.redis.hset(`room:${name}`, "muted", JSON.stringify(muted), () => {
					resolve();
				});
			});
		});
	}

	async unmuteUser(socket, dto: UnmuteUserDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unmute user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to unmute");
			return;
		}

		if (await this.checkIfUserIsMuted(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not muted in room ${dto.name}`);
			socket.emit("failure", "User is not muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is unmuting user ${dto.userId} in room ${dto.name}...`);
		await this.unmuteUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userUnmuted", dto.userId);
	}

	async unmuteUserInRedis(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "muted", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let muted = JSON.parse(response);
				muted = muted.filter((x) => x != userId);
				this.redis.hset(`room:${name}`, "muted", JSON.stringify(muted), () => {
					resolve();
				});
			});
		});
	}

	async inviteUser(socket, dto: InviteUserDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already logged in room ${dto.name}`);
			socket.emit("failure", "User is already logged in this room");
			return;
		}

		if (await this.checkIfUserIsInvited(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already invited in room ${dto.name}`);
			socket.emit("failure", "User is already invited in this room");
			return;
		}

		if (await this.checkIfUserIsBanned(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is banned from room ${dto.name}`);
			socket.emit("failure", "User is banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is inviting user ${dto.userId} to room ${dto.name}...`);
		await this.inviteUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userInvited", dto.userId);
	}

	async inviteUserInRedis(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "invited", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let invited = JSON.parse(response);
				invited.push(userId);
				this.redis.hset(`room:${name}`, "invited", JSON.stringify(invited), () => {
					resolve();
				});
			});
		});
	}

	removeInvitation(userId, name: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "invited", (error, response) => {
				if (error) {
					console.error(error);
					return;
				}
				let invited = JSON.parse(response);
				invited = invited.filter((x) => x !== userId);
				this.redis.hset(`room:${name}`, "invited", JSON.stringify(invited));
				resolve();
			})
		});
	}

	async sendMessage(socket, dto: SendMessageDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsBanned(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is banned from room ${dto.name}`);
			socket.emit("failure", "User is banned from this room");
			return;
		}

		if (await this.checkIfUserIsMuted(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is already muted in room ${dto.name}`);
			socket.emit("failure", "User is already muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is sending a message to room ${dto.name}`);
		const currentTimestamp = Date.now()
		await this.sendMessageInRedis(dto.name, socket.data.userId, currentTimestamp, dto.message);
		server.to(dto.name).emit("receive", {
			userId: socket.data.userId,
			timestamp: new Date(currentTimestamp).toISOString(),
			message: dto.message,
		})
		socket.emit("sended");
	}

	async sendMessageInRedis(name, userId, timestamp, message): Promise<void> {
		return new Promise((resolve) => {
			this.redis.multi()
				.zadd(`room-messages:${name}`, Date.now(), JSON.stringify({
					userId,
					timestamp,
					message,
				})).exec(() => {
					resolve();
				});
		});
	}

	checkIfRoomExists(name: string) {
		return new Promise((resolve, reject) => {
			this.redis.exists(`room:${name}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				resolve(response);
			});
		});
	}

	checkIfUserIsLogged(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const logged = JSON.parse(response);
				if (logged.includes(userId))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsOwner(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "owner", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const owner = JSON.parse(response);
				if (owner === userId)
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsAdmin(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "admins", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const admins = JSON.parse(response);
				if (admins.includes(userId))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsMuted(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "muted", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const muted = JSON.parse(response);
				if (muted.includes(userId))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsBanned(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const banned = JSON.parse(response);
				if (banned.includes(userId))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsInvited(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "invited", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const invited = JSON.parse(response);
				if (invited.includes(userId))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserHasPrivileges(bannerId, bannedId, name: string) {
		return new Promise(async (resolve, reject) => {
			if (await this.checkIfUserIsOwner(bannedId, name) == true)
				resolve(false);
			else if (await this.checkIfUserIsOwner(bannerId, name) == true)
				resolve(true);
			else if (await this.checkIfUserIsAdmin(bannerId, name) == true &&
				await this.checkIfUserIsAdmin(bannedId, name) == false)
				resolve(true);
			resolve(false);
		});
	}

	checkIfRoomIsProtected(name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "password", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const password = JSON.parse(response);
				if (password === "")
					resolve(false);
				else
					resolve(true);
			});
		});
	}

	checkIfRoomIsEmpty(name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const logged = JSON.parse(response);
				console.log({ logged });
				if (logged.length === 0)
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfRoomIsPublic(name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "isPublic", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const isPublic = JSON.parse(response);
				if (isPublic)
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfPasswordIsCorrect(name: string, password: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "password", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const roomPassword = JSON.parse(response);
				if (roomPassword === password)
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserExists(userId: string) {
		return new Promise((resolve, reject) => {
			this.redis.exists(`user:${userId}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				if (response === 1)
					resolve(true);
				else
					resolve(false);
			});
		});
	}
}