import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateRoomSchema, LeaveRoomSchema, JoinRoomSchema, BanUserSchema, MuteUserSchema, InviteUserSchema, UnbanUserSchema, UnmuteUserSchema, SendMessageSchema, UpdateRoomSchema, KickUserSchema, AddRoomAdminSchema, RemoveRoomAdminSchema, GiveOwnershipSchema, BlockUserSchema, UnblockUserSchema, UninviteUserSchema, GetRoomMsgHistSchema, sendDMSchema } from './chat.dto';
import { Injectable } from '@nestjs/common';
import { Event } from './chat-event.enum';

@Injectable()
@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chat: ChatService) { }

	// async afterInit(server: Server) {
	// 	this.chat.atomic_test();
	// }

	async afterInit(server: Server) {
		await this.chat.afterInit();
	}

	async handleConnection(@ConnectedSocket() socket) {
		this.chat.handleConnection(socket);
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		this.chat.handleDisconnect(socket);
	}

	// Maybe not needed since we call logout via users module
	@SubscribeMessage(Event.logout)
	async onLogout(@ConnectedSocket() socket) {
		this.chat.logout(socket.data.userId, this.server);
	}

	async onLogoutViaController(userId: number) {
		this.chat.logout(userId, this.server);
	}

	@SubscribeMessage(Event.createRoom)
	async onCreateRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = CreateRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.createRoom(socket, dto, this.server);
	}

	@SubscribeMessage(Event.joinRoom)
	onJoinRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = JoinRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.joinRoom(socket, dto, this.server);
	}

	@SubscribeMessage(Event.leaveRoom)
	onLeaveRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = LeaveRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.leaveRoom(socket, dto, this.server);
	}

	@SubscribeMessage(Event.kickUser)
	onKickUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = KickUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.kickUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.banUser)
	onBanUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = BanUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.banUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.unbanUser)
	onUnbanUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = UnbanUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.unbanUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.muteUser)
	onMuteUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = MuteUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.muteUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.unmuteUser)
	onUnmuteUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = UnmuteUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.unmuteUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.inviteUser)
	onInviteUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = InviteUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.inviteUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.uninviteUser)
	onUninviteUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = UninviteUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.uninviteUser(socket, dto, this.server);
	}


	@SubscribeMessage(Event.sendRoomMsg)
	onSendRoomMessage(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = SendMessageSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.sendRoomMessage(socket, dto, this.server);
	}

	@SubscribeMessage(Event.updateRoom)
	onUpdateRoom(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = UpdateRoomSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.updateRoom(socket, dto, this.server);
	}

	@SubscribeMessage(Event.addRoomAdmin)
	onAddRoomAdmin(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = AddRoomAdminSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.addRoomAdmin(socket, dto, this.server);
	}

	@SubscribeMessage(Event.removeRoomAdmin)
	onRemoveRoomAdmin(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = RemoveRoomAdminSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.removeRoomAdmin(socket, dto, this.server);
	}

	@SubscribeMessage(Event.giveRoomOwnership)
	onGiveRoomOwnership(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = GiveOwnershipSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.giveRoomOwnership(socket, dto, this.server);
	}

	@SubscribeMessage(Event.getRoomsList)
	onGetRoomsList(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto != undefined) {
			socket.emit(Event.dataError, { message: "You musn't pass any object as a payload." });
			return;
		}
		this.chat.getRoomsList(socket, dto, this.server);
	}

	@SubscribeMessage(Event.blockUser)
	onBlockUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = BlockUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.blockUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.unblockUser)
	onUnblockUser(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = UnblockUserSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.unblockUser(socket, dto, this.server);
	}

	@SubscribeMessage(Event.getRoomMsgHist)
	onGetRoomMsgHist(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = GetRoomMsgHistSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.getRoomMsgHist(socket, dto, this.server);
	}

	@SubscribeMessage(Event.sendDM)
	onSendDM(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto === undefined) {
			socket.emit(Event.dataError, { message: "You must pass an object as a payload." });
			return;
		}
		const { error } = sendDMSchema.validate(dto);
		if (error) {
			console.log(error.message);
			socket.emit(Event.dataError, { message: error.message });
			return;
		}
		this.chat.sendDM(socket, dto, this.server);
	}

	@SubscribeMessage(Event.notifRead)
	onNotifsRead(@ConnectedSocket() socket, @MessageBody() dto) {
		if (dto != undefined) {
			socket.emit(Event.dataError, { message: "You musn't pass any object as a payload." });
			return;
		}
		this.chat.notifsRead(socket, dto, this.server);
	}

}
