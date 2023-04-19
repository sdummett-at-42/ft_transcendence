import { Injectable } from "@nestjs/common";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { RedisService } from "../redis/redis.service";
import { FriendsService } from "../friends/friends.service";

@Injectable()
@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly redis: RedisService,
		private readonly friends: FriendsService,
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
			const friendIds = await this.friends.findAll(userId);
			if (!friendIds)
				return;
			const friendSocketIds = Object.entries(sockets)
			.filter(([key, value]) => friendIds.includes(value.data.userId))
			.map(([key, value]) => value.id);
			
			if (friendSocketIds.length > 0)
				this.server.to(friendSocketIds).emit('friendConnected', {id: +userId}); // Event to report here
		}

		/* This is to test achivements notifications */
		setTimeout(function () {
			console.log("Emitting new achievement!");
			this.emitNewAchievement(userId, 'Achievement 1');
			this.emitNewAchievement(userId, 'Achievement 2');
			this.emitNewAchievement(userId, 'Achievement 3');
		}.bind(this), 2000);
	}


	
	async handleDisconnect(@ConnectedSocket() socket) {
		// Check if the socket is in active session
		const userId = socket.data.userId;
		if (!userId)
		return;
		
		const sockets = await this.server.fetchSockets();
		const userSockets = sockets.filter(s => { return s.data.userId === userId });
		if (userSockets.length === 1) {
			const friendIds = await this.friends.findAll(userId);
			if (!friendIds)
			return;
			const friendSocketIds = Object.entries(sockets)
			.filter(([key, value]) => friendIds.includes(value.data.userId))
			.map(([key, value]) => value.id);
			
			if (friendSocketIds.length > 0)
			this.server.to(friendSocketIds).emit('friendDisconnected', {id: +userId}); // Event to report here
		}
	}
	
	async emitNewAchievement(userId: number, achievementName: string) {
		const sockets = await this.server.fetchSockets();
		sockets.forEach(socket => {
			if (socket.data.userId == userId) {
				socket.emit('newAchievement', { achievementName });
			}
		});
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

	async cancelFriendRequest(requesterId: number, receiverId: number) {
		const sockets = await this.server.fetchSockets();
		const receiverSocketsIds = Object.entries(sockets)
			.filter(([key, value]) => receiverId === value.data.userId)
			.map(([key, value]) => value.id);

		if (receiverSocketsIds.length > 0)
			this.server.to(receiverSocketsIds).emit('friendRequestCanceled', {id: requesterId});
	}

	@SubscribeMessage('getConnectedFriends')
	async onGetConnectedFriend(@ConnectedSocket() socket) {
		const sockets = await this.server.fetchSockets();
		const connectedIds = Object.entries(sockets)
			.map(([key, value]) => value.data.userId)
		if (connectedIds.length > 0){
			socket.emit('connectedFriends', { friendIds: connectedIds });
		}
	}
}