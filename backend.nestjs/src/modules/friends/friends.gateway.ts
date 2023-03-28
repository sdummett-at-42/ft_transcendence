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
		// Check if its the first socket of the user

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
		console.log(`sockets.length: ${sockets.length}`)

		const userSockets = sockets.filter(s => { return s.data.userId === userId });
		if (userSockets.length === 1) {
			console.log(`Only one connected socket for userId ${userId}, sending event to friends`);

			const userFriends = await this.friendsService.findAllFriends(userId);
			console.log(`userFriends: ${JSON.stringify(userFriends)}`);

			const friendIds: number[] = userFriends.map(user => user.friend.id);
			console.log(`friendIds: ${JSON.stringify(friendIds)}`) 

			const friendSocketIds: string[] = Object.entries(sockets)
			.filter(([key, value]) => friendIds.includes(+value.id))
			.map(([key, value]) => key);

			console.log(`friendSOcketIds: ${JSON.stringify(friendSocketIds)}`);
			
			this.server.to(friendSocketIds).emit('friendConnected', {id: +userId});
		}
		else // FOR DEBUG
			console.log(`More than one connected sockets, not sending any event to friends`)
	}

	// If last connected socket, send 'friendDisconnected' to all friends
	async handleDisconnect(@ConnectedSocket() socket) {
		// Check if the socket is in active session

	}

	@SubscribeMessage('sendFriendRequest')
	sendFriendRequest(@ConnectedSocket() socket, @MessageBody() dto) {
		console.log('sendFriendRequest');
	}

}