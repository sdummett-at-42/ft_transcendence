import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateRoomDto, LeaveRoomDto, JoinRoomDto, BanUserDto, MuteUserDto, InviteUserDto, UnbanUserDto, UnmuteUserDto } from './chat.dto';

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
		this.redis.keys('user:*', (error, keys) => {
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
		socket.data.userId = userId;
		console.log({ socketData: socket.data });
		// Need to remove the statement below since we are using socket.data to store userId
		console.log(`Adding socket for user ${userId}`);
		this.redis.hset(`user:${userId}`, socket.id, '1'); 
		console.log(`Added socket:${socket.id} to redis`);
		socket.emit("connected");
	}

	getUserId(socket) {
		return new Promise((resolve, reject) => {
			const redisKey = `sess:${socket.handshake.headers.cookie.slice(16).split(".")[0]}`; // BUG: if user is not logged in
			this.redis.get(redisKey, (error, session) => {
				if (error) {
					console.log("redis.get error: ", error);
					reject(error);
				} else {
					if (session === null) {
						console.log("Session not found");
						reject("Session not found");
					}
					else {
						console.log("Session found");
						const userId = JSON.parse(session).passport.user.id;
						resolve(userId);
					}
				}
			});
		});
	}

	handleDisconnect(@ConnectedSocket() socket) {
		const redisKey = `sess:${socket.handshake.headers.cookie.slice(16).split(".")[0]}`; // BUG: if user is not logged in
		this.redis.get(redisKey, (error, session) => {
			if (error) {
				console.log("redis.get error: ", error);
				socket.disconnect(true);
			} else {
				if (session === null) {
					console.log("Session not found");
					socket.disconnect(true);
				}
				else {
					console.log("Session found");
					const userId = JSON.parse(session).passport.user.id;
					console.log(`Removing socket for user ${userId}`);
					this.redis.hdel(`user:${userId}`, socket.id);
					console.log(`Removed socket:${socket.id} from redis`);
				}
			}
		});
	}

	async createRoom(socket, dto: CreateRoomDto, server) {

		if (await this.checkIfRoomExists(dto.name) == true) {
			console.log(`Room ${dto.name} already exists`);
			socket.emit("failure", "Room already exists");
			return;
		}
		console.log(`Room ${dto.name} does not exist, creating...`);
		this.createRoomInRedis(socket, dto);
		socket.join(dto.name);
		socket.emit("roomCreated");

		console.log(await this.checkIfUserIsLogged(socket.id, dto.name));
		console.log(await this.checkIfUserIsLogged("abcdef", dto.name));
	}

	async createRoomInRedis(socket, dto: CreateRoomDto) {
		let { password } = dto;
		if (!password)
			password = ""

		this.redis.multi()
			.hset(`room:${dto.name}`, "owner", JSON.stringify(socket.id))
			.hset(`room:${dto.name}`, "isPublic", JSON.stringify(dto.isPublic))
			.hset(`room:${dto.name}`, "logged", JSON.stringify([socket.id]))
			.hset(`room:${dto.name}`, "banned", JSON.stringify([]))
			.hset(`room:${dto.name}`, "muted", JSON.stringify([]))
			.hset(`room:${dto.name}`, "admins", JSON.stringify([socket.id]))
			.hset(`room:${dto.name}`, "invited", JSON.stringify([]))
			.hset(`room:${dto.name}`, "password", JSON.stringify(password))
			.hset(`room:${dto.name}`, "messages", JSON.stringify([{
				userId: -1,
				timestamp: "0",
				message: `Welcome to your channel ${dto.name}.`,
			}]))
			.exec((error, response) => {
				if (error) {
					console.error(error)
					return;
				}
				console.log(`redis: Created room:${dto.name}`);
			});

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

		if (await this.checkIfUserIsLogged(socket.id, dto.name) == false) {
			console.log(`User ${socket.id} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}
		console.log(`User ${socket.id} is logged in room ${dto.name}, leaving...`);
		await this.leaveRoomInRedis(socket, dto);

		if (await this.checkIfRoomIsEmpty(dto.name) == true) {
			console.log("Room is empty, deleting it...");
			this.deleteRoomInRedis(dto.name);
		}
		else if (await this.checkIfUserIsOwner(socket.id, dto.name) == true)
			this.changeRoomOwnerInRedis(dto.name);
		socket.leave(dto.name);
		socket.emit("roomLeft");
		server.to(dto.name).emit("userLeft", socket.id);
	}

	async leaveRoomInRedis(socket, dto: LeaveRoomDto): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${dto.name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let logged = JSON.parse(response);
				logged = logged.filter((id) => id !== socket.id);
				console.log({ loggedAfterRemoverLeaver: logged });
				this.redis.hset(`room:${dto.name}`, "logged", JSON.stringify(logged), () => {
					resolve();
				});
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
			if (await this.checkIfUserIsInvited(socket.id, dto.name) == false) {
				console.log(`User ${socket.id} is not invited to room ${dto.name}`);
				socket.emit("failure", "You are not invited to this room");
				return;
			}
			else
				this.removeInvitation(socket.id, dto.name);
		}

		if (await this.checkIfUserIsBanned(socket.id, dto.name) == true) {
			console.log(`User ${socket.id} is banned from room ${dto.name}`);
			socket.emit("failure", "You are banned from this room");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.id, dto.name) == true) {
			console.log(`User ${socket.id} is already logged in room ${dto.name}`);
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

		console.log(`User ${socket.id} is joining room ${dto.name}...`);
		await this.joinRoomInRedis(socket, dto.name);
		socket.join(dto.name);
		socket.emit("roomJoined", dto.name);
		server.to(dto.name).emit("userJoined", socket.id);
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

	async joinRoomInRedis(socket, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let logged = JSON.parse(response);
				logged.push(socket.id);
				console.log({ loggedAfterJoiner: logged });
				this.redis.hset(`room:${name}`, "logged", JSON.stringify(logged), () => {
					resolve();
				});
			});
		});
	}

	async banUser(socket, dto: BanUserDto, server) {
		if (await this.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.checkIfUserIsLogged(socket.id, dto.name) == false) {
			console.log(`User ${socket.id} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.id, dto.userId, dto.name) == false) {
			console.log(`User ${socket.id} does not have right privileges to ban user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to ban");
			return;
		}

		if (await this.checkIfUserIsBanned(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already banned from room ${dto.name}`);
			socket.emit("failure", "User is already banned from this room");
			return;
		}

		console.log(`User ${socket.id} is banning user ${dto.userId} from room ${dto.name}...`);
		await this.banUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userBanned", dto.userId);
	}

	async banUserInRedis(id, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let banned = JSON.parse(response);
				banned.push(id);
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

		if (await this.checkIfUserIsLogged(socket.id, dto.name) == false) {
			console.log(`User ${socket.id} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.id, dto.userId, dto.name) == false) {
			console.log(`User ${socket.id} does not have right privileges to unban user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to unban");
			return;
		}

		if (await this.checkIfUserIsBanned(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not banned from room ${dto.name}`);
			socket.emit("failure", "User is not banned from this room");
			return;
		}

		console.log(`User ${socket.id} is unbanning user ${dto.userId} from room ${dto.name}...`);
		await this.unbanUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userUnbanned", dto.userId);
	}

	async unbanUserInRedis(id, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let banned = JSON.parse(response);
				banned = banned.filter((x) => x != id);
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

		if (await this.checkIfUserIsLogged(socket.id, dto.name) == false) {
			console.log(`User ${socket.id} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.id, dto.userId, dto.name) == false) {
			console.log(`User ${socket.id} does not have right privileges to mute user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to mute");
			return;
		}

		if (await this.checkIfUserIsMuted(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already muted in room ${dto.name}`);
			socket.emit("failure", "User is already muted in this room");
			return;
		}

		console.log(`User ${socket.id} is muting user ${dto.userId} in room ${dto.name}...`);
		// ADD: the mute timeout should be added here
		await this.muteUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userMuted", dto.userId);
	}

	async muteUserInRedis(id, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "muted", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let muted = JSON.parse(response);
				muted.push(id);
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

		if (await this.checkIfUserIsLogged(socket.id, dto.name) == false) {
			console.log(`User ${socket.id} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.checkIfUserHasPrivileges(socket.id, dto.userId, dto.name) == false) {
			console.log(`User ${socket.id} does not have right privileges to unmute user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to unmute");
			return;
		}

		if (await this.checkIfUserIsMuted(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not muted in room ${dto.name}`);
			socket.emit("failure", "User is not muted in this room");
			return;
		}

		console.log(`User ${socket.id} is unmuting user ${dto.userId} in room ${dto.name}...`);
		await this.unmuteUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userUnmuted", dto.userId);
	}

	async unmuteUserInRedis(id, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "muted", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let muted = JSON.parse(response);
				muted = muted.filter((x) => x != id);
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

		if (await this.checkIfUserIsLogged(socket.id, dto.name) == false) {
			console.log(`User ${socket.id} is not logged in room ${dto.name}`);
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

		console.log(`User ${socket.id} is inviting user ${dto.userId} to room ${dto.name}...`);
		await this.inviteUserInRedis(dto.userId, dto.name);
		server.to(dto.name).emit("userInvited", dto.userId);
	}

	async inviteUserInRedis(id, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.redis.hget(`room:${name}`, "invited", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let invited = JSON.parse(response);
				invited.push(id);
				this.redis.hset(`room:${name}`, "invited", JSON.stringify(invited), () => {
					resolve();
				});
			});
		});
	}

	removeInvitation(id, name: string) {
		this.redis.hget(`room:${name}`, "invited", (error, response) => {
			if (error) {
				console.error(error);
				return;
			}
			let invited = JSON.parse(response);
			invited = invited.filter((userId) => userId !== id);
			this.redis.hset(`room:${name}`, "invited", JSON.stringify(invited));
		});
	}

	async messageRoom(socket, data, server) {
		const { name, message } = data;
		server.to(name).emit("messageReceived", message);
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

	checkIfUserIsLogged(id, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const logged = JSON.parse(response);
				console.log(logged);
				console.log(id);
				if (logged.includes(id))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsOwner(id, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "owner", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const owner = JSON.parse(response);
				if (owner === id)
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsAdmin(id, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "admins", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const admins = JSON.parse(response);
				if (admins.includes(id))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsMuted(id, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "muted", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const muted = JSON.parse(response);
				if (muted.includes(id))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsBanned(id, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const banned = JSON.parse(response);
				if (banned.includes(id))
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	checkIfUserIsInvited(id, name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "invited", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const invited = JSON.parse(response);
				if (invited.includes(id))
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

	checkIfUserExists(id: string) {
		return new Promise((resolve, reject) => {
			this.redis.exists(`user:${id}`, (error, response) => {
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