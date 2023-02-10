import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateChannelDto } from '../channels/channel.dto';
import { CreateRoomDto, LeaveRoomDto } from './chat.dto';

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
	}

	handleConnection(socket) {
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
					console.log("user_id", JSON.parse(session).passport.user.id)
					this.redis.set(`socket:${socket.id}`, JSON.parse(session).passport.user.id)
					console.log(`Added socket:${socket.id} to redis`);
					socket.emit("connected");
				}
			}
		});
	}

	handleDisconnect(@ConnectedSocket() socket) {
		this.redis.del(`socket:${socket.id}`);
		console.log(`Removed socket:${socket.id} from redis`);
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
		let hasPassword;
		if (!password) {
			password = ""
			hasPassword = false;
		}
		else {
			hasPassword = true;
		}
		this.redis.multi()
			.hset(`room:${dto.name}`, "owner", JSON.stringify(socket.id))
			.hset(`room:${dto.name}`, "isPublic", JSON.stringify(dto.isPublic))
			.hset(`room:${dto.name}`, "logged", JSON.stringify([socket.id]))
			.hset(`room:${dto.name}`, "banned", JSON.stringify([]))
			.hset(`room:${dto.name}`, "muted", JSON.stringify([]))
			.hset(`room:${dto.name}`, "admins", JSON.stringify([socket.id]))
			.hset(`room:${dto.name}`, "password", JSON.stringify(password))
			.hset(`room:${dto.name}`, "hasPassword", JSON.stringify(hasPassword))
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
		this.leaveRoomInRedis(socket, dto);
		socket.leave(dto.name);
		socket.emit("roomLeft");
		server.to(dto.name).emit("userLeft", socket.id);
	}

	async leaveRoomInRedis(socket, dto: LeaveRoomDto) {
		this.redis.hget(`room:${dto.name}`, "logged", (error, response) => {
			if (error) {
				console.error(error);
				return;
			}
			let logged = JSON.parse(response);
			logged = logged.filter((id) => id !== socket.id);
			this.redis.hset(`room:${dto.name}`, "logged", JSON.stringify(logged));
		});

		if (await this.checkIfRoomIsEmpty(dto.name) == true) {
			// Delete the room if it is empty
			// this.deleteRoomInRedis(dto.name);
		}
		else if (await this.checkIfUserIsOwner(socket.id, dto.name) == true) {
			// Change the owner if the user leaving is the owner
			// this.changeRoomOwnerInRedis(dto.name);
		}
	}


	async joinRoom(socket, name: string, server) {
		const roomExists = this.redis.hexists(`room:${name}`, "owner", (error, response) => {
			if (response === 1) {
				socket.join(name);
				socket.emit("roomJoined");
				server.to(name).emit("userJoined", socket.id);
			} else {
				console.log(`redis: Room ${name} does not exist`);
				socket.emit("roomDoesNotExist");
			}
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

	checkIfRoomIsEmpty(name: string) {
		return new Promise((resolve, reject) => {
			this.redis.hget(`room:${name}`, "logged", (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
					return;
				}
				const logged = JSON.parse(response);
				if (logged.length === 0)
					resolve(true);
				else
					resolve(false);
			});
		});
	}
}