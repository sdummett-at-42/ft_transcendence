import { ConnectedSocket, WebSocketServer, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from "@nestjs/common";
import { Server } from 'socket.io'
import { RedisService } from '../redis/redis.service';
import { FriendsService } from './friends.service';

@Injectable()
@WebSocketGateway({ namespace: 'friends' })
export class FriendsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly redis: RedisService,
		private readonly friendsService: FriendsService) { }

	@WebSocketServer()
	server: Server;

	async afterInit(server: any) {}

	// If first connected socket, send 'friendConnected' to all the friends
	async handleConnection(@ConnectedSocket() socket) {
		if (socket.handshake.headers.cookie == undefined) {
			console.debug("Session cookie wasn't provided. Disconnecting socket.");
			socket.emit('notConnected', { // Event to report here
				timestamp: new Date().toISOString(),
				message: `No session cookie provided`,
			});
			socket.disconnect()
			return;
		}
		const sessionHash = socket.handshake.headers.cookie.slice(16).split(".")[0];
		const session = await this.redis.getSession(sessionHash);
		if (session === null) {
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

		const userRooms = await this.redis.getUserRooms(userId);
		for (const room of userRooms)
			socket.join(room);

		socket.emit('connected', { // Event to report here
			timestamp: new Date().toISOString(),
			message: `Socket successfully connected.`
		});

		const sockets = await this.server.fetchSockets();
		const userSockets = sockets.filter(s => { return s.data.userId === userId });
		if (userSockets.length === 1) {
			const friendIds = await this.friendsService.findAll(userId);
			const friendSocketIds = Object.entries(sockets)
			.filter(([key, value]) => friendIds.includes(value.data.userId))
			.map(([key, value]) => value.id);
			
			if (friendSocketIds.length > 0)
				this.server.to(friendSocketIds).emit('friendConnected', {id: +userId}); // Event to report here
		}
	}

	// If last connected socket, send 'friendDisconnected' to all friends
	async handleDisconnect(@ConnectedSocket() socket) {
		// Check if the socket is in active session
		const userId = socket.data.userId;
		if (!userId)
			return;

		const sockets = await this.server.fetchSockets();
		const userSockets = sockets.filter(s => { return s.data.userId === userId });
		if (userSockets.length === 1) {
			const friendIds = await this.friendsService.findAll(userId);
			const friendSocketIds = Object.entries(sockets)
			.filter(([key, value]) => friendIds.includes(value.data.userId))
			.map(([key, value]) => value.id);

			if (friendSocketIds.length > 0)
				this.server.to(friendSocketIds).emit('friendDisconnected', {id: +userId}); // Event to report here
		}
	}

	@SubscribeMessage('sendFriendRequest')
	sendFriendRequest(@ConnectedSocket() socket, @MessageBody() dto) {
		console.log('sendFriendRequest');
	}

}