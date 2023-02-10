import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateChannelDto } from '../channels/channel.dto';
import { CreateRoomDto, CreateRoomSchema } from './chat.dto';

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

	createRoom(socket, dto: CreateRoomDto, server) {
		console.log({dto});
		this.redis.hexists(`room:${dto.name}`, "owner", (error, response) => {
			if (response === 1) {
				console.log(`redis: Room ${dto.name} already exists`);
				socket.emit("roomExists");
			} else {
				console.log(`redis: Room ${dto.name} does not exist`);
				this.createRoomInRedis(socket, dto.name);
				socket.join(dto.name);
				socket.emit("roomCreated");
			}
		});
	}

	async createRoomInRedis(socket, roomName: string) {
		this.redis.multi()
			.hset(`room:${roomName}`, "owner", socket.id)
			.hset(`room:${roomName}`, "isPublic", JSON.stringify(true))
			.hset(`room:${roomName}`, "logged", JSON.stringify([]))
			.hset(`room:${roomName}`, "banned", JSON.stringify([]))
			.hset(`room:${roomName}`, "muted", JSON.stringify([]))
			.hset(`room:${roomName}`, "admins", JSON.stringify([]))
			.hset(`room:${roomName}`, "messages", JSON.stringify([]))
			.exec((error, response) => {
				console.log(`redis: Created room:${roomName}`);
			});
	}

	async joinRoom(socket, roomName: string, server) {
		const roomExists = this.redis.hexists(`room:${roomName}`, "owner", (error, response) => {
			if (response === 1) {
				socket.join(roomName);
				socket.emit("roomJoined");
				server.to(roomName).emit("userJoined", socket.id);
			} else {
				console.log(`redis: Room ${roomName} does not exist`);
				socket.emit("roomDoesNotExist");
			}
		});
	}

	async leaveRoom(socket, roomName: string, server) {
		socket.leave(roomName);
		socket.emit("roomLeft");
		server.to(roomName).emit("userLeft", socket.id);
	}

	async messageRoom(socket, data, server) {
		const { roomName, message } = data;
		server.to(roomName).emit("messageReceived", message);
	}

	checkIfRoomExists(roomName: string) {
		const roomExists = this.redis.hexists(`room:${roomName}`, "owner", (error, response) => {
			if (response === 1) {
				console.log(`redis: Room ${roomName} exists`);
				return true;
			} else {
				console.log(`redis: Room ${roomName} does not exist`);
				return false;
			}
		});
	}

	checkIfUserIsBanned(socket, roomName: string) {
		this.redis.hget(`room:${roomName}`, "banned", (error, response) => {
			const banned = JSON.parse(response);
			if (banned.includes(socket.id))
				return true;
			else
				return false;
		});
	}

	checkIfUserIsMuted(socket, roomName: string) {
		this.redis.hget(`room:${roomName}`, "muted", (error, response) => {
			const muted = JSON.parse(response);
			if (muted.includes(socket.id))
				return true;
			else
				return false;
		});
	}

	checkIfUserIsAdmin(socket, roomName: string) {
		this.redis.hget(`room:${roomName}`, "admins", (error, response) => {
			const admins = JSON.parse(response);
			if (admins.includes(socket.id))
				return true;
			else
				return false;
		});
	}

	checkIfUserIsOwner(socket, roomName: string) {
		this.redis.hget(`room:${roomName}`, "owner", (error, response) => {
			if (response === socket.id)
				return true;
			else
				return false;
		});
	}



}