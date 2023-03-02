import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateRoomDto, LeaveRoomDto, JoinRoomDto, BanUserDto, MuteUserDto, InviteUserDto, UnbanUserDto, UnmuteUserDto, SendMessageDto, UpdateRoomDto } from './chat.dto';
import { Event } from './chat-event.enum';

@Injectable()
export class ChatService {

	constructor(private readonly redis: RedisService) { }

	async afterInit() {
		await this.redis.delSocketKeys();
		await this.redis.delRoomKeys();
		await this.redis.delRoomMessagesKeys();
		await this.redis.delUserSocketsKeys();
		await this.redis.delUserRoomsKeys();
		await this.redis.delRoomMutedKeys();
	}

	async handleConnection(socket) {
		const userId = await this.redis.getUserId(socket);
		if (userId === null) {
			console.log("User not logged in");
			socket.emit("failure", "User not logged in");
			socket.disconnect()
			return;
		}
		console.log(`Adding new socket in the socket list for user:${userId}`);
		socket.data.userId = userId;
		this.redis.addUserSocket(userId, socket.id)
		const rooms = await this.redis.getUserRooms(userId);
		for (const room of rooms) {
			console.log(`Joining room ${room}`);
			socket.join(room);
		}
		socket.emit("connected");
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		console.log(`Socket ${socket.id} disconnected`);
		await this.redis.delUserSocket(socket.data.userId, socket.id);
		if (await this.redis.getUserSocketsNb(socket.data.userId) == 0)
			await this.redis.delUser(socket.data.userId);
	}

	async logout(userId: number, server) {
		console.log(`User ${userId} logging out`);
		const socketIds = await this.redis.getSocketsIds(userId);
		console.log({ socketIds });
		for (const socketId of socketIds)
			server.in(socketId).disconnectSockets();
	}

	async createRoom(socket, dto: CreateRoomDto, server) {

		if (await this.redis.checkIfRoomExists(dto.name) == true) {
			console.log(`Room ${dto.name} already exists`);
			socket.emit(Event.roomNotCreated, { message: `Room ${dto.name} already exists.` });
			return;
		}
		console.log(`Room ${dto.name} does not exist, creating...`);
		this.redis.createRoom(socket.data.userId, dto);
		socket.join(dto.name);
		socket.emit(Event.roomCreated, { message: `Room ${dto.name} has been created.` });
	}

	async leaveRoom(socket, dto: LeaveRoomDto, server) {
		if (this.roomDontExists(socket, Event.roomNotLeft, dto.name))
			return;

		if (this.userIsntLogged(socket, Event.roomNotLeft, dto.name))
			return;

		console.log(`User ${socket.data.userId} is logged in room ${dto.name}, leaving...`);
		await this.redis.leaveRoom(socket.data.userId, dto);

		if (await this.redis.getUserRoomNb(socket.data.userId) == 0)
			await this.redis.delUserRooms(socket.data.userId);

		if (await this.redis.checkIfRoomIsEmpty(dto.name) == true) {
			console.log("Room is empty, deleting it...");
			this.redis.deleteRoom(dto.name);
		}
		else {
			if (await this.redis.checkIfUserIsOwner(socket.data.userId, dto.name) == true)
				await this.redis.changeRoomOwner(dto.name);
			if (await this.redis.checkIfUserIsAdmin(socket.data.userId, dto.name) == true)
				await this.redis.removeUserFromAdmins(socket.data.userId, dto.name);
		}
		socket.leave(dto.name);
		socket.emit(Event.roomLeft, { message: `You have left room ${dto.name}.` });
		server.to(dto.name).emit("userLeft", { message: `User ${socket.data.userId} has left the room ${dto.name}.`});
	}

	async joinRoom(socket, dto: JoinRoomDto, server) {
		if (this.roomDontExists(socket, Event.roomNotJoined, dto.name))
			return;
		else if (await this.redis.checkIfRoomIsPublic(dto.name) == false) {
			if (await this.redis.checkIfUserIsInvited(socket.data.userId, dto.name) == false) {
				console.log(`User ${socket.data.userId} is not invited to room ${dto.name}`);
				socket.emit(Event.roomNotJoined, { message: `You are not invited in room ${dto.name}.` });
				return;
			}
		}

		if (await this.userIsBanned(socket, Event.roomNotJoined, dto.name))
			return;

		if (await this.userIsLogged(socket, Event.roomNotJoined, dto.name))
			return;

		if (await this.roomIsFull(socket, Event.roomNotJoined, dto.name))
			return;

		if (await this.redis.checkIfRoomIsProtected(dto.name) == true) {
			if (await this.passwordIsWrong(socket, Event.roomNotJoined, dto.name, dto.password))
				return;
		}

		this.redis.removeInvitation(socket.data.userId, dto.name);
		console.log(`User ${socket.data.userId} is joining room ${dto.name}...`);
		await this.redis.joinRoom(socket.data.userId, dto.name);
		const socketIds = await this.redis.getSocketsIds(socket.data.userId);
		socketIds.forEach((socketId) => {
			server.in(socketId).socketsJoin(dto.name);
			server.to(socketId).emit(Event.roomJoined, { message: `Room ${dto.name} has been joined.` });
		});
		server.to(dto.name).emit("userJoined", { message: `User ${socket.data.userId} has joined the room ${dto.name}.` });
	}

	async banUser(socket, dto: BanUserDto, server) {
		if (await this.roomDontExists(socket, Event.userNotBanned, dto.name))
			return;

		if (await this.userIsLogged(socket, Event.userNotBanned, dto.name))
			return;

		if (await this.userIsntLogged(socket, Event.userNotBanned, dto.name))
			return;

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have the correct privilege to ban user ${dto.userId} in room ${dto.name}`);
			socket.emit(Event.userNotBanned, "You do not have the correct privilege to ban");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already banned from room ${dto.name}`);
			socket.emit(Event.userNotBanned, "User is already banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is banning user ${dto.userId} from room ${dto.name}...`);
		await this.redis.banUser(dto.userId, dto.name);
		server.to(dto.name).emit(Event.userBanned, { message: `User ${dto.userId} has been banned from the room ${dto.name}.` });
	}

	async unbanUser(socket, dto: UnbanUserDto, server) {

		if (await this.roomDontExists(socket, Event.userNotUnbanned, dto.name))
			return;

		if (await this.userIsntLogged(socket, Event.userNotUnbanned, dto.name))
			return;

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unban user ${dto.userId} in room ${dto.name}`);
			socket.emit(Event.userNotUnbanned, "You do not have the right privileges to unban");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not banned from room ${dto.name}`);
			socket.emit(Event.userNotUnbanned, "User is not banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is unbanning user ${dto.userId} from room ${dto.name}...`);
		await this.redis.unbanUser(dto.userId, dto.name);
		server.to(dto.name).emit(Event.userUnbanned, { message: `User ${dto.userId} has been unban from the room ${dto.name}.` });
	}

	async muteUser(socket, dto: MuteUserDto, server) {
		if (await this.roomDontExists(socket, Event.userNotMuted, dto.name))
			return;

		if (await this.userIsntLogged(socket, Event.userNotMuted, dto.name))
			return;

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit(Event.userNotMuted, "User is not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to mute user ${dto.userId} in room ${dto.name}`);
			socket.emit(Event.userNotMuted, "You do not have the right privileges to mute");
			return;
		}

		if (await this.redis.checkIfUserIsMuted(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already muted in room ${dto.name}`);
			socket.emit(Event.userNotMuted, "User is already muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is muting user ${dto.userId} in room ${dto.name}...`);
		await this.redis.muteUser(dto.userId, dto.name, dto.timeout);
		server.to(dto.name).emit(Event.userMuted, { message: `User ${dto.userId} has been muted from the room ${dto.name} for ${dto.timeout} secs.` });
	}

	async unmuteUser(socket, dto: UnmuteUserDto, server) {
		if (this.roomDontExists(socket, Event.userNotUnmuted, dto.name))
			return;

		if (this.userIsntLogged(socket, Event.userNotUnmuted, dto.name))
			return;

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit(Event.userNotUnmuted, "User is not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unmute user ${dto.userId} in room ${dto.name}`);
			socket.emit(Event.userNotUnmuted, "You do not have the right privileges to unmute");
			return;
		}

		if (await this.redis.checkIfUserIsMuted(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not muted in room ${dto.name}`);
			socket.emit(Event.userNotUnmuted, "User is not muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is unmuting user ${dto.userId} in room ${dto.name}...`);
		await this.redis.unmuteUser(dto.userId, dto.name);
		server.to(dto.name).emit(Event.userUnmuted, { message: `User ${dto.userId} has been unmuted from the room ${dto.name}.` });
	}

	async inviteUser(socket, dto: InviteUserDto, server) {
		if (this.roomDontExists(socket, Event.userNotInvited, dto.name))
			return;

		if (this.userIsLogged(socket, Event.userNotInvited, dto.name))
			return;

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already logged in room ${dto.name}`);
			socket.emit(Event.userNotInvited, "User is already logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsInvited(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already invited in room ${dto.name}`);
			socket.emit(Event.userNotInvited, "User is already invited in this room");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is banned from room ${dto.name}`);
			socket.emit(Event.userNotInvited, "User is banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is inviting user ${dto.userId} to room ${dto.name}...`);
		await this.redis.inviteUser(dto.userId, dto.name);
		server.to(dto.name).emit(Event.userInvited, { message: `Invitation for the room ${dto.name} sended to user ${dto.userId}.` });
	}

	async sendMessage(socket, dto: SendMessageDto, server) {
		if (this.roomDontExists(socket, Event.msgNotSended, dto.name))
			return;

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit(Event.msgNotSended, "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is banned from room ${dto.name}`);
			socket.emit(Event.msgNotSended, "User is banned from this room");
			return;
		}

		if (await this.redis.checkIfUserIsMuted(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is muted in room ${dto.name}`);
			socket.emit(Event.msgNotSended, "You are muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is sending a message to room ${dto.name}`);
		const currentTimestamp = Date.now()
		await this.redis.sendMessage(dto.name, socket.data.userId, currentTimestamp, dto.message);
		server.to(dto.name).emit("receive", {
			userId: socket.data.userId,
			timestamp: new Date(currentTimestamp).toISOString(),
			message: dto.message,
		})
		//Maybe useless, should we use it with the above statement
		socket.emit(Event.msgSended, { message: "Message sended." });
	}

	async updateRoom(socket, dto: UpdateRoomDto, server) {
		if (this.roomDontExists(socket, Event.roomNotUpdated, dto.name))
			return;

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit(Event.roomNotUpdated, "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsAdmin(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not admin of room ${dto.name}`);
			socket.emit(Event.roomNotUpdated, "You are not admin of this room");
			return;
		}

		console.log(`User ${socket.data.userId} is updating room ${dto.name}`);
		await this.redis.updateRoom(dto);
		socket.emit(Event.roomUpdated, { message: `Room ${dto.name} has been updated.` })
		server.to(dto.name).emit("roomUpdated", dto);
	}

	async roomDontExists(socket, event: Event, roomName) {
		if (await this.redis.checkIfRoomExists(roomName) == false) {
			console.log(`Room ${roomName} does not exist`);
			socket.emit(event, { message: `Room ${roomName} does not exist` });
			return true;
		}
		return false;
	}

	async userIsntLogged(socket, event: Event, roomName) {
		if (await this.redis.checkIfUserIsLogged(socket.data.userId, roomName) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${roomName}`);
			socket.emit(event, { message: `You are not logged in room ${roomName}.` });
			return true;
		}
		return false;
	}

	async userIsBanned(socket, event: Event, roomName) {
		if (await this.redis.checkIfUserIsBanned(socket.data.userId, roomName) == false) {
			console.log(`User ${socket.data.userId} is banned from room ${roomName}`);
			socket.emit(event, { message: `You are banned from room ${roomName}.` });
			return true;
		}
		return false;
	}

	async userIsLogged(socket, event: Event, roomName) {
		if (await this.redis.checkIfUserIsLogged(socket.data.userId, roomName) == true) {
			console.log(`User ${socket.data.userId} is already logged in room ${roomName}`);
			socket.emit(event, { message: `You are already logged in room ${roomName}.` });
			return true;
		}
		return false;
	}

	async roomIsFull(socket, event: Event, roomName) {
		if (await this.redis.checkIfRoomIsFull(roomName) == true) {
			console.log(`Room ${roomName} is full`);
			socket.emit(event, { message: `Room ${roomName} is full.` });
			return true;
		}
		return false;
	}

	async passwordIsWrong(socket, event: Event, roomName, password) {
		if (await this.redis.checkIfPasswordIsCorrect(roomName, password) == false) {
			console.log(`Password for room ${roomName} is incorrect`);
			socket.emit(event, { message: `Password is incorrect for room ${roomName}.` });
			return true;
		}
		return false;
	}
}