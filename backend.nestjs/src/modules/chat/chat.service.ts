import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class ChatService {
	private readonly redis;
	constructor( private readonly redisService: RedisService) {
		this.redis = this.redisService.getClient();
	}

	handleConnection(socket) {
		console.log("[ ChatService ] => handleConnection");
		const redisKey = `sess:${socket.handshake.headers.cookie.slice(16).split(".")[0]}`;
		this.redis.get(redisKey, (error, session) => {
			if (error) {
				console.log("redis error: ", error);
				socket.disconnect(true);
			} else {
				if (session === null) {
					console.log("Session not found");
					socket.disconnect(true)
				}
				else {
					console.log("Session found");
					socket.emit("connected");
				}
			}
		});
	}
}
