import { ConnectedSocket, WebSocketServer, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from "@nestjs/common";
import { Server } from 'socket.io'
import { RedisService } from '../redis/redis.service';
import { FriendsService } from './friends.service';

@Injectable()
@WebSocketGateway({ cors: true,  namespace: 'friends' })
export class FriendsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly redis: RedisService,
		private readonly friendsService: FriendsService) { }

	@WebSocketServer()
	server: Server;

	async afterInit(server: any) {}

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

	// If first connected socket, send 'friendConnected' to all the friends
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
			if (!friendIds)
				return;
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
			if (!friendIds)
				return;
			const friendSocketIds = Object.entries(sockets)
			.filter(([key, value]) => friendIds.includes(value.data.userId))
			.map(([key, value]) => value.id);

			if (friendSocketIds.length > 0)
				this.server.to(friendSocketIds).emit('friendDisconnected', {id: +userId}); // Event to report here
		}
	}

	async sendFriendRequest(requesterId: number, receiverId: number) {
		const sockets = await this.server.fetchSockets();
		console.log(`nb current sockets: ${sockets.length} `);
		const receiverSocketIds = Object.entries(sockets)
			.filter(([key, value]) => { console.log(`~ID: ${value.data.userId}`); return receiverId === value.data.userId})
			.map(([key, value]) => { console.log(`ID: ${value.data.userId}`); return value.id});
			
		console.log(receiverSocketIds);

		if (receiverSocketIds.length > 0)
			this.server.to(receiverSocketIds).emit('friendRequestReceived', { id: requesterId }); // Event to report here
	}

	async acceptFriendRequest(requesterId: number, receiverId: number) {
		const sockets = await this.server.fetchSockets();
		const requesterSocketIds = Object.entries(sockets)
		.filter(([key, value]) => requesterId === value.data.userId)
		.map(([key, value]) => value.id);

		if (requesterSocketIds.length > 0)
			this.server.to(requesterSocketIds).emit('friendRequestAccepted', { id: receiverId }); // Event to report here
	}
}