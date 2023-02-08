import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
// import { WsException } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chat: ChatService) { }

	async afterInit(server: Server) {
		console.log("[ ChatGateway ] => afterInit");
	}

	async handleConnection(@ConnectedSocket() socket) {
		console.log("[ ChatGateway ] => handleConnection");
		this.chat.handleConnection(socket);
	}

	async handleDisconnect(@ConnectedSocket() client) {
		console.log("[ ChatGateway ] => handleDisconnect");
		console.log("disconnecting: ", client.id);
		console.log("handleDisconnect");
	}

	@SubscribeMessage('message')
	handleMessage(@ConnectedSocket() socket, @MessageBody() messageBody: string) {
		console .log("[ ChatGateway ] => handleMessage");
		console.log("Event on message: ", messageBody);
		return 'Hello world!';
	}
}