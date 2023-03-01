import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateRoomDto, LeaveRoomDto, JoinRoomDto, BanUserDto, MuteUserDto, InviteUserDto, UnbanUserDto, UnmuteUserDto, SendMessageDto, UpdateRoomDto } from './chat.dto';

@Injectable()
export class ChatService {

	constructor(private readonly redis: RedisService) {}

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
			socket.emit("failure", "Room already exists");
			return;
		}
		console.log(`Room ${dto.name} does not exist, creating...`);
		this.redis.createRoom(socket.data.userId, dto);
		socket.join(dto.name);
		socket.emit("roomCreated");
	}

	async leaveRoom(socket, dto: LeaveRoomDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}
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
		socket.emit("roomLeft");
		server.to(dto.name).emit("userLeft", socket.data.userId);
	}

	async joinRoom(socket, dto: JoinRoomDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}
		else if (await this.redis.checkIfRoomIsPublic(dto.name) == false) {
			if (await this.redis.checkIfUserIsInvited(socket.data.userId, dto.name) == false) {
				console.log(`User ${socket.data.userId} is not invited to room ${dto.name}`);
				socket.emit("failure", "You are not invited to this room");
				return;
			}
		}

		if (await this.redis.checkIfUserIsBanned(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is banned from room ${dto.name}`);
			socket.emit("failure", "You are banned from this room");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is already logged in room ${dto.name}`);
			socket.emit("failure", "You are already logged in this room");
			return;
		}

		if (await this.redis.checkIfRoomIsFull(dto.name) == true) {
			console.log(`Room ${dto.name} is full`);
			socket.emit("failure", "Room is full");
			return;
		}

		if (await this.redis.checkIfRoomIsProtected(dto.name) == true) {
			if (await this.redis.checkIfPasswordIsCorrect(dto.name, dto.password) == false) {
				console.log(`Password for room ${dto.name} is incorrect`);
				socket.emit("failure", "Password is incorrect");
				return;
			}
		}

		this.redis.removeInvitation(socket.data.userId, dto.name);
		console.log(`User ${socket.data.userId} is joining room ${dto.name}...`);
		await this.redis.joinRoom(socket.data.userId, dto.name);
		const socketIds = await this.redis.getSocketsIds(socket.data.userId);
		socketIds.forEach((socketId) => {
			server.in(socketId).socketsJoin(dto.name);
			server.to(socketId).emit("roomJoined", dto.name);
		});
		server.to(dto.name).emit("userJoined", socket.data.userId);
	}

	async banUser(socket, dto: BanUserDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to ban user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to ban");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already banned from room ${dto.name}`);
			socket.emit("failure", "User is already banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is banning user ${dto.userId} from room ${dto.name}...`);
		await this.redis.banUser(dto.userId, dto.name);
		server.to(dto.name).emit("userBanned", dto.userId);
	}

	async unbanUser(socket, dto: UnbanUserDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unban user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to unban");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not banned from room ${dto.name}`);
			socket.emit("failure", "User is not banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is unbanning user ${dto.userId} from room ${dto.name}...`);
		await this.redis.unbanUser(dto.userId, dto.name);
		server.to(dto.name).emit("userUnbanned", dto.userId);
	}

	async muteUser(socket, dto: MuteUserDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to mute user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to mute");
			return;
		}

		if (await this.redis.checkIfUserIsMuted(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already muted in room ${dto.name}`);
			socket.emit("failure", "User is already muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is muting user ${dto.userId} in room ${dto.name}...`);
		await this.redis.muteUser(dto.userId, dto.name, dto.timeout);
		server.to(dto.name).emit("userMuted", dto.userId);
	}

	async unmuteUser(socket, dto: UnmuteUserDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "User is not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unmute user ${dto.userId} in room ${dto.name}`);
			socket.emit("failure", "You do not have the right privileges to unmute");
			return;
		}

		if (await this.redis.checkIfUserIsMuted(dto.userId, dto.name) == false) {
			console.log(`User ${dto.userId} is not muted in room ${dto.name}`);
			socket.emit("failure", "User is not muted in this room");
			return;
		}

		console.log(`User ${socket.data.userId} is unmuting user ${dto.userId} in room ${dto.name}...`);
		await this.redis.unmuteUser(dto.userId, dto.name);
		server.to(dto.name).emit("userUnmuted", dto.userId);
	}

	async inviteUser(socket, dto: InviteUserDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already logged in room ${dto.name}`);
			socket.emit("failure", "User is already logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsInvited(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is already invited in room ${dto.name}`);
			socket.emit("failure", "User is already invited in this room");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.name) == true) {
			console.log(`User ${dto.userId} is banned from room ${dto.name}`);
			socket.emit("failure", "User is banned from this room");
			return;
		}

		console.log(`User ${socket.data.userId} is inviting user ${dto.userId} to room ${dto.name}...`);
		await this.redis.inviteUser(dto.userId, dto.name);
		server.to(dto.name).emit("userInvited", dto.userId);
	}

	async sendMessage(socket, dto: SendMessageDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsBanned(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is banned from room ${dto.name}`);
			socket.emit("failure", "User is banned from this room");
			return;
		}

		if (await this.redis.checkIfUserIsMuted(socket.data.userId, dto.name) == true) {
			console.log(`User ${socket.data.userId} is muted in room ${dto.name}`);
			socket.emit("failure", "You are muted in this room");
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
		socket.emit("sended");
	}

	async updateRoom(socket, dto: UpdateRoomDto, server) {
		if (await this.redis.checkIfRoomExists(dto.name) == false) {
			console.log(`Room ${dto.name} does not exist`);
			socket.emit("failure", "Room does not exist");
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.name}`);
			socket.emit("failure", "You are not logged in this room");
			return;
		}

		if (await this.redis.checkIfUserIsAdmin(socket.data.userId, dto.name) == false) {
			console.log(`User ${socket.data.userId} is not admin of room ${dto.name}`);
			socket.emit("failure", "You are not admin of this room");
			return;
		}

		console.log(`User ${socket.data.userId} is updating room ${dto.name}`);
		await this.redis.updateRoom(dto);
		server.to(dto.name).emit("roomUpdated", dto);
	}
}