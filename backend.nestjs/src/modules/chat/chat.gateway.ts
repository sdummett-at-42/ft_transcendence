import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
// import { WsException } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChannelDto } from '../channels/channel.dto';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chat: ChatService) { }

	async afterInit(server: Server) {
		await this.chat.afterInit();
	}

	async handleConnection(@ConnectedSocket() socket) {
		this.chat.handleConnection(socket);
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		this.chat.handleDisconnect(socket);
	}

	@SubscribeMessage("createRoom")
	handleCreateRoom(@ConnectedSocket() socket, @MessageBody() room) {
		this.chat.createRoom(socket, room);
	}

	@SubscribeMessage("joinRoom")
	handleJoinRoom(@ConnectedSocket() socket, @MessageBody() room) {
		this.chat.joinRoom(socket, room, this.server);
	}

	@SubscribeMessage("leaveRoom")
	handleLeaveRoom(@ConnectedSocket() socket, @MessageBody() room) {
		this.chat.leaveRoom(socket, room, this.server);
	}

	@SubscribeMessage("messageRoom")
	handleMessageRoom(@ConnectedSocket() socket, @MessageBody() message) {
		this.chat.messageRoom(socket, message, this.server);
	}
}