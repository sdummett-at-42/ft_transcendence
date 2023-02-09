import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateChannelDto } from '../channels/channel.dto';

@Injectable()
export class ChatService {
	private readonly redis;

	constructor(private readonly redisService: RedisService) {
		this.redis = this.redisService.getClient();
	}

	async afterInit() {
		console.log("[ ChatService ] => afterInit");
		const keys = this.redis.keys('socket:*', (error, keys) => {
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
		console.log("[ ChatService ] => handleConnection");
		const redisKey = `sess:${socket.handshake.headers.cookie.slice(16).split(".")[0]}`;
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
		console.log("[ ChatService ] => handleDisconnect");
		this.redis.del(`socket:${socket.id}`);
		console.log(`Removed socket:${socket.id} from redis`);
	}
	async createChannel(socket, dto: CreateChannelDto) {
		console.log("[ ChatService ] => createChannel");

		this.redis.multi()
			// .hset(`channel:${name}`, "owner", userid)
			.hset(`channel:${dto.name}`, "isPublic", JSON.stringify(dto.isPublic))
			.hset(`channel:${dto.name}`, "logged", JSON.stringify([]))
			.hset(`channel:${dto.name}`, "banned", JSON.stringify([]))
			.hset(`channel:${dto.name}`, "muted", JSON.stringify([]))
			.hset(`channel:${dto.name}`, "admins", JSON.stringify([]))
			.hset(`channel:${dto.name}`, "messages", JSON.stringify([]))
			.sadd('channels', dto.name)
			.exec((err, results) => {
				if (err) {
					console.error(err);
				} else {
					console.log(`Created channel ${dto.name}`);
					socket.emit('channelCreated', dto.name);
					socket.broadcast.emit('channelListUpdated');
				}
			});
	}
}
