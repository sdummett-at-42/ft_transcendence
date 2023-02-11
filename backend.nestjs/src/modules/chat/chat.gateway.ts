import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateRoomSchema, LeaveRoomSchema, JoinRoomSchema,  BanUserSchema } from './chat.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chat: ChatService) { }

	async afterInit(server: Server) {
		await this.chat.afterInit();
	}

	async handleConnection(@ConnectedSocket() socket) {
		// this.chat.handleConnection(socket);
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		this.chat.handleDisconnect(socket);
	}

	@SubscribeMessage("create")
	async onCreateRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = CreateRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', {message: error});
			return;
		}
		this.chat.createRoom(socket, dto, this.server);
	}

	@SubscribeMessage("join")
	onJoinRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = JoinRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', {message: error});
			return;
		}
		this.chat.joinRoom(socket, dto, this.server);
	}

	@SubscribeMessage("leave")
	onLeaveRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = LeaveRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', {message: error});
			return;
		}
		this.chat.leaveRoom(socket, dto, this.server);
	}

	@SubscribeMessage("ban")
	onBanUser(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = BanUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', {message: error});
			return;
		}
		this.chat.banUser(socket, dto, this.server);
	}

	// @SubscribeMessage("messageRoom")
	// onMessageRoom(@ConnectedSocket() socket, @MessageBody() dto) {
	// 	this.chat.messageRoom(socket, dto, this.server);
	// }

	@SubscribeMessage("server")
	getSocketsInRoom(@MessageBody() room) {
		console.log(this.server.sockets.adapter.rooms[room]
			? Object.values(this.server.sockets.adapter.rooms[room].sockets)
			: []);
	}
}