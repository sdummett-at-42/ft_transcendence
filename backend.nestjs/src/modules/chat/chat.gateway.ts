import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateRoomSchema, LeaveRoomSchema, JoinRoomSchema, BanUserSchema, MuteUserSchema, InviteUserSchema, UnbanUserSchema, UnmuteUserSchema, SendMessageSchema, UpdateRoomSchema } from './chat.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
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

	@SubscribeMessage('logout')
	async onLogout(@ConnectedSocket() socket) {
		this.chat.logout(socket.data.userId, this.server);
	}

	async onLogoutViaController(userId: number) {
		this.chat.logout(userId, this.server);
	}

	@SubscribeMessage("create")
	async onCreateRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = CreateRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.createRoom(socket, dto, this.server);
	}

	@SubscribeMessage("join")
	onJoinRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = JoinRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.joinRoom(socket, dto, this.server);
	}

	@SubscribeMessage("leave")
	onLeaveRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = LeaveRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.leaveRoom(socket, dto, this.server);
	}

	@SubscribeMessage("ban")
	onBanUser(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = BanUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.banUser(socket, dto, this.server);
	}

	@SubscribeMessage("unban")
	onUnbanUser(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = UnbanUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.unbanUser(socket, dto, this.server);
	}

	@SubscribeMessage("mute")
	onMuteUser(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = MuteUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.muteUser(socket, dto, this.server);
	}

	@SubscribeMessage("unmute")
	onUnmuteUser(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = UnmuteUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.unmuteUser(socket, dto, this.server);
	}

	@SubscribeMessage("invite")
	onInviteUser(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = InviteUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.inviteUser(socket, dto, this.server);
	}

	@SubscribeMessage("send")
	onSendMessage(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = SendMessageSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.sendMessage(socket, dto, this.server);
	}

	@SubscribeMessage("update")
	onUpdateRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		const { error } = UpdateRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit('error', { message: error });
			return;
		}
		this.chat.updateRoom(socket, dto, this.server);
	}

	@SubscribeMessage("server")
	getSocketsInRoom(@MessageBody() room) {
		console.log(this.server.sockets.adapter.rooms[room]
			? Object.values(this.server.sockets.adapter.rooms[room].sockets)
			: []);
	}
}