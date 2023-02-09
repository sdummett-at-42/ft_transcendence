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
		console.log("disconnecting: ", socket.id);
		this.chat.handleDisconnect(socket);
	}

	@SubscribeMessage('createChannel')
	handleCreateChannel(@ConnectedSocket() socket, @MessageBody() messageBody: CreateChannelDto) {
		this.chat.createChannel(socket, messageBody);
	}
}