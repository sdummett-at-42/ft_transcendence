import { Injectable } from '@nestjs/common';
import * as Redis from 'redis';
import { ConfigService } from '@nestjs/config';
import { CreateRoomDto, UpdateRoomDto, LeaveRoomDto } from '../chat/chat.dto';
import * as argon2 from 'argon2';

@Injectable()
export class RedisService {
	private readonly client;

	constructor(private readonly config: ConfigService) {
		this.client = Redis.createClient({
			url: this.config.get('REDIS_URL'),
			legacyMode: true,
		});
		this.client.connect();
		this.client.on('error', (err) => {
			console.log('Redis error: ', err);
		});
		this.client.on('connect', () => {
			console.log('Redis connected');
		});
	}

	getClient() {
		return this.client;
	}

	async delSocketKeys() {
		this.client.keys('socket:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.client.del(keys, (error, response) => {
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

	async delRoomKeys() {
		this.client.keys('room:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.client.del(keys, (error, response) => {
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

	async delRoomMessagesKeys() {
		this.client.keys('room-messages:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.client.del(keys, (error, response) => {
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

	async delUserSocketsKeys() {
		this.client.keys('user-sockets:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.client.del(keys, (error, response) => {
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

	async delUserRoomsKeys() {
		this.client.keys('user-rooms:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.client.del(keys, (error, response) => {
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

	async delRoomMutedKeys() {
		this.client.keys('room-muted:*', (error, keys) => {
			if (error)
				console.log("redis error: ", error);
			else {
				if (keys.length > 0) {
					this.client.del(keys, (error, response) => {
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

	async delUser(userId) {
		this.client.del(`user:${userId}`);
	}

	async delUserSocket(userId, socketId) {
		this.client.hdel(`user-sockets:${userId}`, socketId, (error, response) => {
			if (error) {
				console.log("redis.hdel error: ", error);
			} else {
				console.log(`redis.hdel: Deleted ${response} keys`);
			}
		});
	}

	async delUserRooms(userId) {
		this.client.del(`user-rooms:${userId}`);
	}

	async addUserSocket(userId, socketId) {
		this.client.hset(`user-sockets:${userId}`, socketId, '1');
	}

	async getUserSocketsNb(userId: number) {
		return new Promise((resolve, reject) => {
			this.client.hlen(`user-sockets:${userId}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				resolve(response);
			});
		});
	}

	async getUserId(socket) {
		return new Promise((resolve, reject) => {
			if (socket.handshake.headers.cookie === undefined)
				resolve(null);
			const redisKey = `sess:${socket.handshake.headers.cookie.slice(16).split(".")[0]}`;
			this.client.get(redisKey, (error, session) => {
				if (session === null)
					resolve(session);
				else {
					const userId = JSON.parse(session).passport.user.id;
					resolve(userId);
				}
			});
		});
	}

	async getUserRooms(userId) : Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`user-rooms:${userId}`, (error, rooms) => {
				if (error) {
					console.log("redis.smembers error: ", error);
					resolve([]);
				} else {
					resolve(rooms);
				}
			});
		});
	}

	async getSocketsIds(userId: number) : Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`user-sockets:${userId}`, (error, keys) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				resolve(keys);
			});
		});
	}

	async createRoom(userId, dto: CreateRoomDto) {
		let { password } = dto;
		if (!password || password === "")
			password = ""
		else
			password = await argon2.hash(password);

		this.client.multi()
			.hset(`room:${dto.roomName}`, "owner", JSON.stringify(userId))
			.hset(`room:${dto.roomName}`, "isPublic", JSON.stringify(dto.isPublic))
			.hset(`room:${dto.roomName}`, "logged", JSON.stringify([userId]))
			.hset(`room:${dto.roomName}`, "banned", JSON.stringify([]))
			.hset(`room:${dto.roomName}`, "admins", JSON.stringify([userId]))
			.hset(`room:${dto.roomName}`, "invited", JSON.stringify([]))
			.hset(`room:${dto.roomName}`, "password", JSON.stringify(password))
			.exec((error, response) => {
				if (error) {
					console.error(error)
					return;
				}
				console.log(`redis: Created room:${dto.roomName}`);
			});

		this.client.hset(`user-rooms:${userId}`, dto.roomName, '1');

		this.client.multi()
			.zadd(`room-messages:${dto.roomName}`, Date.now(), JSON.stringify({ userId: -1, message: `Welcome to your channel ${dto.roomName}.` }))
			.expire(`room-messages:${dto.roomName}`, 2 * 24 * 60 * 60)
			.exec();

		// Print the newly created room for debug purpose
		this.client.hgetall(`room:${dto.roomName}`, (error, response) => {
			if (error) {
				console.error(error);
				return;
			}
			console.log(response);
		})
	}

	async removeUserFromAdmins(userId, roomName): Promise<void> {
		return new Promise((resolve) => {
			this.client.hget(`room:${roomName}`, "admins", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let admins = JSON.parse(response);
				console.log({ adminsRmBefore: admins })
				admins = admins.filter((x) => x !== userId);
				console.log({ adminsRmAfter: admins })
				this.client.hset(`room:${roomName}`, "admins", JSON.stringify(admins));
				resolve();
			});
		});
	}

	async getUserRoomNb(userId: number) {
		return new Promise((resolve, reject) => {
			this.client.hlen(`user-rooms:${userId}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				resolve(response);
			});
		})
	}

	async leaveRoom(userId, dto: LeaveRoomDto): Promise<void> {
		return new Promise((resolve) => {
			this.client.hget(`room:${dto.roomName}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let logged = JSON.parse(response);
				logged = logged.filter((x) => x !== userId);
				console.log({ loggedAfterRemoverLeaver: logged });
				this.client.hset(`room:${dto.roomName}`, "logged", JSON.stringify(logged));
				this.client.hdel(`user-rooms:${userId}`, dto.roomName);
				resolve()
			});
		});
	}

	async deleteRoom(name: string) {
		this.client.del(`room:${name}`, (error, response) => {
			if (error) {
				console.error(error);
				return;
			}
			console.log(`redis: Deleted room:${name}`);
		});
	}

	// This function need to be improved, next owner should be the first in admin list
	// or the first user in the logged list
	async changeRoomOwner(name: string): Promise<void> {
		return new Promise((resolve) => {
			this.client.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					return;
				}
				let logged = JSON.parse(response);
				this.client.hset(`room:${name}`, "owner", JSON.stringify(logged[0]));
				this.client.hget(`room:${name}`, "admins", (error, response) => {
					if (error) {
						console.error(error);
						return;
					}
					let admins = JSON.parse(response);
					console.log({ adminsBefore: admins })
					admins.push(logged[0]);
					console.log({ adminsAfter: admins })
					this.client.hset(`room:${name}`, "admins", JSON.stringify(admins));
					resolve();
				});
			});
		});
	}

	async checkIfRoomIsFull(name: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "logged", (error, response) => {
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

	async joinRoom(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.client.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let logged = JSON.parse(response);
				logged.push(userId);
				this.client.hset(`room:${name}`, "logged", JSON.stringify(logged));
				this.client.hset(`user-rooms:${userId}`, name, '1');
				resolve();
			});
		});
	}

	async banUser(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.client.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let banned = JSON.parse(response);
				banned.push(userId);
				this.client.hset(`room:${name}`, "banned", JSON.stringify(banned));
				this.client.hget(`room:${name}`, "logged", (error, response) => {
					let logged = JSON.parse(response);
					logged = logged.filter((x) => x != userId);
					this.client.hset(`room:${name}`, "logged", JSON.stringify(logged));
					this.client.hdel(`user-rooms:${userId}`, name);
				});
				resolve();
			});
		});
	}

	async unbanUser(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.client.hget(`room:${name}`, "banned", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let banned = JSON.parse(response);
				banned = banned.filter((x) => x != userId);
				this.client.hset(`room:${name}`, "banned", JSON.stringify(banned), () => {
					resolve();
				});
			});
		});
	}

	async muteUser(userId, name: string, timeout): Promise<void> {
		return new Promise((resolve) => {
			this.client.multi()
				.set(`room-muted:${name}:${userId}`, 'true')
				.expire(`room-muted:${name}:${userId}`, timeout)
				.exec();
			resolve();
		});
	}

	async unmuteUser(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.client.del(`room-muted:${name}:${userId}`)
			resolve();
		});
	}

	async inviteUser(userId, name: string): Promise<void> {
		return new Promise((resolve) => {
			this.client.hget(`room:${name}`, "invited", (error, response) => {
				if (error) {
					console.error(error);
					resolve();
					return;
				}
				let invited = JSON.parse(response);
				invited.push(userId);
				this.client.hset(`room:${name}`, "invited", JSON.stringify(invited), () => {
					resolve();
				});
			});
		});
	}

	async removeInvitation(userId, name: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "invited", (error, response) => {
				if (error) {
					console.error(error);
					return;
				}
				let invited = JSON.parse(response);
				invited = invited.filter((x) => x !== userId);
				this.client.hset(`room:${name}`, "invited", JSON.stringify(invited));
				resolve();
			})
		});
	}

	async sendMessage(name, userId, timestamp, message): Promise<void> {
		return new Promise((resolve) => {
			this.client.multi()
				.zadd(`room-messages:${name}`, Date.now(), JSON.stringify({
					userId,
					timestamp,
					message,
				})).exec(() => {
					resolve();
				});
		});
	}

	async updateRoom(dto: UpdateRoomDto): Promise<void> {
		return new Promise(async (resolve) => {
			let { password } = dto;
			if (password != undefined && password != "")
				password = await argon2.hash(password);
			if (password != undefined)
				this.client.hset(`room:${dto.roomName}`, "password", JSON.stringify(password));
			if (dto.isPublic != undefined)
				this.client.hset(`room:${dto.roomName}`, "isPublic", JSON.stringify(dto.isPublic));
			resolve()
		});
	}

	async checkIfRoomExists(name: string) {
		return new Promise((resolve, reject) => {
			this.client.exists(`room:${name}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				resolve(response);
			});
		});
	}

	async checkIfUserIsLogged(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "logged", (error, response) => {
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

	async checkIfUserIsOwner(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "owner", (error, response) => {
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

	async checkIfUserIsAdmin(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "admins", (error, response) => {
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

	async checkIfUserIsMuted(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.client.get(`room-muted:${name}:${userId}`, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				if (response === null)
					resolve(false);
				else
					resolve(true);
			});
		});
	}

	async checkIfUserIsBanned(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "banned", (error, response) => {
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

	async checkIfUserIsInvited(userId, name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "invited", (error, response) => {
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

	async checkIfUserHasPrivileges(bannerId, bannedId, name: string) {
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

	async checkIfRoomIsProtected(name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "password", (error, response) => {
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

	async checkIfRoomIsEmpty(name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "logged", (error, response) => {
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

	async checkIfRoomIsPublic(name: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "isPublic", (error, response) => {
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

	async checkIfPasswordIsCorrect(name: string, password: string) {
		return new Promise((resolve, reject) => {
			this.client.hget(`room:${name}`, "password", async (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const roomPassword = JSON.parse(response);
				if (password == undefined && roomPassword === "")
					resolve(true);
				else if (password != undefined && password === "" && roomPassword === "")
					resolve(true);
				else if (password != undefined && await argon2.verify(roomPassword, password) === true)
					resolve(true);
				else
					resolve(false);
			});
		});
	}

	async checkIfUserExists(userId: string) {
		return new Promise((resolve, reject) => {
			this.client.exists(`user:${userId}`, (error, response) => {
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
