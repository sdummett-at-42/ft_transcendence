import { Injectable } from "@nestjs/common";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { RedisService } from "../redis/redis.service";

@Injectable()
@WebSocketGateway({ cors: true, namespace: 'achievements' })
export class AchievementsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly redis: RedisService,
	) { }

	@WebSocketServer()
	server: Server;

	async afterInit(server: any) { }

	private extractString(inputString: string): string {
		if (!inputString)
			return '';

		const prefix = 's:';
		const suffix = '.';
		const startIndex = inputString.indexOf(prefix);
		const endIndex = inputString.indexOf(suffix, startIndex + prefix.length);

		if (startIndex !== -1 && endIndex !== -1)
			return inputString.substring(startIndex + prefix.length, endIndex);
		return '';
	}

	async handleConnection(@ConnectedSocket() socket) {
		if (socket.handshake.auth.token == undefined) {
			console.debug("Session cookie wasn't provided. Disconnecting socket.");
			socket.emit('notConnected', {
				timestamp: new Date().toISOString(),
				message: `No session cookie provided`,
			});
			socket.disconnect()
			return;
		}
		const sessionHash = this.extractString(socket.handshake.auth.token);
		const session = await this.redis.getSession(sessionHash);
		if (session === null || !JSON.parse(session).passport) {
			console.debug("User isn't logged in");
			socket.emit('notConnected', { // Event to report here
				timestamp: new Date().toISOString(),
				message: `User isn't logged in.`,
			});
			socket.disconnect()
			return;
		}

		const userId = JSON.parse(session).passport.user.id;
		socket.data.userId = userId;
		// setTimeout(function () {
		// 	console.log("Emitting new achievement!");
		// 	this.notifyUser(userId, 'Achievement 1');
		// }.bind(this), 3000);
	}

	async notifyUser(userId: number, achievementName: string) {
		const sockets = await this.server.fetchSockets();
		sockets.forEach(socket => {
			if (socket.data.userId == userId) {
				socket.emit('newAchievement', { achievementName });
			}
		});
	}

	async handleDisconnect(@ConnectedSocket() socket) { }
}