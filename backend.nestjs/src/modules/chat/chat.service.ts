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
			socket.emit(Event.notConnected, {
				timestamp: new Date().toISOString(),
				message: `User isnt logged in.`,
			});
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
		socket.emit(Event.connected, {
			timestamp: new Date().toISOString(),
			message: `User ${socket.data.userId} successfully connected through websocket.`
		});
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		console.log(`Socket ${socket.id} disconnected`);
		await this.redis.delUserSocket(socket.data.userId, socket.id);
		if (await this.redis.getUserSocketsNb(socket.data.userId) == 0)
			await this.redis.delUser(socket.data.userId);
	}

	async logout(userId: number, server) {
		console.log(`User ${userId} logged out`);
		const socketIds = await this.redis.getSocketsIds(userId);
		console.log({ socketIds });
		for (const socketId of socketIds)
			server.in(socketId).disconnectSockets();
	}

	async createRoom(socket, dto: CreateRoomDto, server) {

		if (await this.redis.checkIfRoomExists(dto.roomName) == true) {
			console.log(`Room ${dto.roomName} already exists`);
			socket.emit(Event.roomNotCreated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} already exists.`
			});
			return;
		}
		console.log(`Room ${dto.roomName} does not exist, creating...`);
		this.redis.createRoom(socket.data.userId, dto);
		socket.join(dto.roomName);
		socket.emit(Event.roomCreated, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `Room ${dto.roomName} has been created.`
		});
	}

	async leaveRoom(socket, dto: LeaveRoomDto, server) {
		if (await this.roomDontExists(socket, Event.roomNotLeft, dto.roomName))
			return;

		if (await this.userIsntLogged(socket, Event.roomNotLeft, dto.roomName))
			return;

		console.log(`User ${socket.data.userId} is logged in room ${dto.roomName}, leaving...`);
		await this.redis.leaveRoom(socket.data.userId, dto);

		if (await this.redis.getUserRoomNb(socket.data.userId) == 0)
			await this.redis.delUserRooms(socket.data.userId);

		if (await this.redis.checkIfRoomIsEmpty(dto.roomName) == true) {
			console.log("Room is empty, deleting it...");
			this.redis.deleteRoom(dto.roomName);
		}
		else {
			if (await this.redis.checkIfUserIsOwner(socket.data.userId, dto.roomName) == true)
				await this.redis.changeRoomOwner(dto.roomName);
			if (await this.redis.checkIfUserIsAdmin(socket.data.userId, dto.roomName) == true)
				await this.redis.removeUserFromAdmins(socket.data.userId, dto.roomName);
		}

		const socketIds = await this.redis.getSocketsIds(socket.data.userId);
		console.log({ socketIds });
		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === socket.data.userId);
		for (const socket of userSockets) {
			socket.leave(dto.roomName);
		}

		socket.emit(Event.roomLeft, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `You have left room ${dto.roomName}.`
		});
		server.to(dto.roomName).emit(Event.userLeft, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${socket.data.userId} has left the room ${dto.roomName}.`
		});
	}

	async joinRoom(socket, dto: JoinRoomDto, server) {
		if (await this.roomDontExists(socket, Event.roomNotJoined, dto.roomName))
			return;
		else if (await this.redis.checkIfRoomIsPublic(dto.roomName) == false) {
			if (await this.redis.checkIfUserIsInvited(socket.data.userId, dto.roomName) == false) {
				console.log(`User ${socket.data.userId} is not invited to room ${dto.roomName}`);
				socket.emit(Event.roomNotJoined, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					message: `You are not invited in room ${dto.roomName}.`
				});
				return;
			}
		}

		if (await this.userIsBanned(socket, Event.roomNotJoined, dto.roomName))
			return;

		if (await this.userIsLogged(socket, Event.roomNotJoined, dto.roomName))
			return;

		if (await this.roomIsFull(socket, Event.roomNotJoined, dto.roomName))
			return;

		if (await this.redis.checkIfRoomIsProtected(dto.roomName) == true) {
			if (await this.passwordIsWrong(socket, Event.roomNotJoined, dto.roomName, dto.password))
				return;
		}

		await this.redis.removeInvitation(socket.data.userId, dto.roomName);
		console.log(`User ${socket.data.userId} is joining room ${dto.roomName}...`);
		await this.redis.joinRoom(socket.data.userId, dto.roomName);
		const socketIds = await this.redis.getSocketsIds(socket.data.userId);
		socketIds.forEach((socketId) => {
			server.in(socketId).socketsJoin(dto.roomName);
			server.to(socketId).emit(Event.roomJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} has been joined.`
			});
		});
		server.to(dto.roomName).emit(Event.userJoined, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${socket.data.userId} has joined the room ${dto.roomName}.`
		});
	}

	async banUser(socket, dto: BanUserDto, server) {
		if (await this.roomDontExists(socket, Event.userNotBanned, dto.roomName))
			return;

		if (await this.userIsntLogged(socket, Event.userNotBanned, dto.roomName))
			return;

		if (socket.data.userId == dto.userId) {
			console.log(`User ${socket.data.userId} cannot ban himself`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot ban yourself.`
			});
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.roomName) == false) {
			console.log(`User ${socket.data.userId} does not have the correct privilege to ban user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the correct privilege to ban in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.roomName) == true) {
			console.log(`User ${dto.userId} is already banned from room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already banned in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.roomName) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.roomName}.`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not logged in room ${dto.roomName}.`
			});
			return;
		}

		console.log(`User ${socket.data.userId} is banning user ${dto.userId} from room ${dto.roomName}...`);
		await this.redis.banUser(dto.userId, dto.roomName);

		const socketIds = await this.redis.getSocketsIds(dto.userId);
		console.log({ socketIds });
		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => dto.userId === dto.userId);
		for (const socket of userSockets) {
			socket.leave(dto.roomName);
		}

		server.to(dto.roomName).emit(Event.userBanned, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been banned from the room ${dto.roomName}.`
		});
	}

	async unbanUser(socket, dto: UnbanUserDto, server) {

		if (await this.roomDontExists(socket, Event.userNotUnbanned, dto.roomName))
			return;

		if (await this.userIsntLogged(socket, Event.userNotUnbanned, dto.roomName))
			return;

		if (socket.data.userId == dto.userId) {
			console.log(`User ${socket.data.userId} cannot unban himself`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot unban yourself.`
			});
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.roomName) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unban user ${dto.userId} in room ${dto.roomName}.`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the right privileges to unban in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.roomName) == false) {
			console.log(`User ${dto.userId} is not banned from room ${dto.roomName}.`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not banned from room ${dto.roomName}.`,
			});
			return;
		}

		console.log(`User ${socket.data.userId} is unbanning user ${dto.userId} from room ${dto.roomName}...`);
		await this.redis.unbanUser(dto.userId, dto.roomName);
		server.to(dto.roomName).emit(Event.userUnbanned, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been unban from the room ${dto.roomName}.`
		});
	}

	async muteUser(socket, dto: MuteUserDto, server) {
		if (await this.roomDontExists(socket, Event.userNotMuted, dto.roomName))
			return;

		if (await this.userIsntLogged(socket, Event.userNotMuted, dto.roomName))
			return;

		if (socket.data.userId == dto.userId) {
			console.log(`User ${socket.data.userId} cannot mute himself`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot mute yourself.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.roomName) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not logged in this room.`
			});
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.roomName) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to mute user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the right privileges to mute in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsMuted(dto.userId, dto.roomName) == true) {
			console.log(`User ${dto.userId} is already muted in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already muted in roo ${dto.roomName}.`
			});
			return;
		}

		console.log(`User ${socket.data.userId} is muting user ${dto.userId} in room ${dto.roomName}...`);
		await this.redis.muteUser(dto.userId, dto.roomName, dto.timeout);
		server.to(dto.roomName).emit(Event.userMuted, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been muted from the room ${dto.roomName} for ${dto.timeout} secs.`
		});
	}

	async unmuteUser(socket, dto: UnmuteUserDto, server) {
		if (await this.roomDontExists(socket, Event.userNotUnmuted, dto.roomName))
			return;

		if (await this.userIsntLogged(socket, Event.userNotUnmuted, dto.roomName))
			return;

		if (socket.data.userId == dto.userId) {
			console.log(`User ${socket.data.userId} cannot unmute himself`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot unmute yourself.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.roomName) == false) {
			console.log(`User ${dto.userId} is not logged in room ${dto.roomName}`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not logged in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserHasPrivileges(socket.data.userId, dto.userId, dto.roomName) == false) {
			console.log(`User ${socket.data.userId} does not have right privileges to unmute user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the right privileges to unmute in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsMuted(dto.userId, dto.roomName) == false) {
			console.log(`User ${dto.userId} is not muted in room ${dto.roomName}`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not muted in room ${dto.roomName}.`
			});
			return;
		}

		console.log(`User ${socket.data.userId} is unmuting user ${dto.userId} in room ${dto.roomName}...`);
		await this.redis.unmuteUser(dto.userId, dto.roomName);
		server.to(dto.roomName).emit(Event.userUnmuted, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been unmuted from the room ${dto.roomName}.`
		});
	}

	async inviteUser(socket, dto: InviteUserDto, server) {
		if (await this.roomDontExists(socket, Event.userNotInvited, dto.roomName))
			return;

		if (await this.userIsntLogged(socket, Event.userNotInvited, dto.roomName))
			return;

		if (socket.data.userId == dto.userId) {
			console.log(`User ${socket.data.userId} cannot invite himself`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot invite yourself.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsLogged(dto.userId, dto.roomName) == true) {
			console.log(`User ${dto.userId} is already logged in room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.roomName} is already logged in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsInvited(dto.userId, dto.roomName) == true) {
			console.log(`User ${dto.userId} is already invited in room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already invited in room ${dto.roomName}.`,
			});
			return;
		}

		if (await this.redis.checkIfUserIsBanned(dto.userId, dto.roomName) == true) {
			console.log(`User ${dto.userId} is banned from room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is banned from room ${dto.roomName}.`,
			});
			return;
		}

		console.log(`User ${socket.data.userId} is inviting user ${dto.userId} to room ${dto.roomName}...`);
		await this.redis.inviteUser(dto.userId, dto.roomName);
		// Not sure about this line, we should only inform the user that sended the invitation.
		server.to(dto.roomName).emit(Event.userInvited, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `Invitation for the room ${dto.roomName} sended to user ${dto.userId}.`,
		});
	}

	async sendMessage(socket, dto: SendMessageDto, server) {
		if (await this.roomDontExists(socket, Event.msgNotSended, dto.roomName))
			return;

		if (await this.redis.checkIfUserIsBanned(socket.data.userId, dto.roomName) == true) {
			console.log(`User ${socket.data.userId} is banned from room ${dto.roomName}`);
			socket.emit(Event.msgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are banned from room ${dto.roomName}.`,
			});
			return;
		}

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.roomName) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.roomName}`);
			socket.emit(Event.msgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not logged in room ${dto.roomName}.`,
			});
			return;
		}

		if (await this.redis.checkIfUserIsMuted(socket.data.userId, dto.roomName) == true) {
			console.log(`User ${socket.data.userId} is muted in room ${dto.roomName}`);
			socket.emit(Event.msgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are muted in room ${dto.roomName}.`
			});
			return;
		}

		console.log(`User ${socket.data.userId} is sending a message to room ${dto.roomName}`);
		const currentTimestamp = Date.now()
		await this.redis.sendMessage(dto.roomName, socket.data.userId, currentTimestamp, dto.message);
		server.to(dto.roomName).emit(Event.msgSended, {
			roomName: dto.roomName,
			timestamp: new Date(currentTimestamp).toISOString(),
			message: dto.message,
			userId: socket.data.userId,
		})
		//Maybe useless, should we use it with the above statement
		// socket.emit(Event.msgSended, {
		// 	roomName: dto.roomName,
		// 	timestamp: new Date().toISOString(),
		// 	message: "Message sended.",
		// });
	}

	async updateRoom(socket, dto: UpdateRoomDto, server) {
		if (await this.roomDontExists(socket, Event.roomNotUpdated, dto.roomName))
			return;

		if (await this.redis.checkIfUserIsLogged(socket.data.userId, dto.roomName) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${dto.roomName}`);
			socket.emit(Event.roomNotUpdated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not logged in room ${dto.roomName}.`
			});
			return;
		}

		if (await this.redis.checkIfUserIsAdmin(socket.data.userId, dto.roomName) == false) {
			console.log(`User ${socket.data.userId} is not admin of room ${dto.roomName}`);
			socket.emit(Event.roomNotUpdated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not admin of the room ${dto.roomName}.`
			});
			return;
		}

		console.log(`User ${socket.data.userId} is updating room ${dto.roomName}`);
		await this.redis.updateRoom(dto);
		// socket.emit(Event.roomUpdated, {
		// 	roomName: dto.roomName,
		// 	timestamp: new Date().toISOString(),
		// 	message: `Room ${dto.roomName} has been updated.`,
		// })
		server.to(dto.roomName).emit(Event.roomUpdated, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			dto,
		});
	}

	async roomDontExists(socket, event: Event, roomName) {
		if (await this.redis.checkIfRoomExists(roomName) == false) {
			console.log(`Room ${roomName} does not exist`);
			socket.emit(event, {
				roomName: roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${roomName} does not exist.`,
			});
			return true;
		}
		return false;
	}

	async userIsntLogged(socket, event: Event, roomName) {
		if (await this.redis.checkIfUserIsLogged(socket.data.userId, roomName) == false) {
			console.log(`User ${socket.data.userId} is not logged in room ${roomName}`);
			socket.emit(event, {
				roomName: roomName,
				timestamp: new Date().toISOString(),
				message: `You are not logged in room ${roomName}.`,
			});
			return true;
		}
		return false;
	}

	async userIsBanned(socket, event: Event, roomName) {
		if (await this.redis.checkIfUserIsBanned(socket.data.userId, roomName) == true) {
			console.log(`User ${socket.data.userId} is banned from room ${roomName}`);
			socket.emit(event, {
				roomName: roomName,
				timestamp: new Date().toISOString(),
				message: `You are banned from room ${roomName}.`,
			});
			return true;
		}
		return false;
	}

	async userIsLogged(socket, event: Event, roomName) {
		if (await this.redis.checkIfUserIsLogged(socket.data.userId, roomName) == true) {
			console.log(`User ${socket.data.userId} is already logged in room ${roomName}`);
			socket.emit(event, {
				roomName: roomName,
				timestamp: new Date().toISOString(),
				message: `You are already logged in room ${roomName}.`,
			});
			return true;
		}
		return false;
	}

	async roomIsFull(socket, event: Event, roomName) {
		if (await this.redis.checkIfRoomIsFull(roomName) == true) {
			console.log(`Room ${roomName} is full`);
			socket.emit(event, {
				roomName: roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${roomName} is full.`,
			});
			return true;
		}
		return false;
	}

	async passwordIsWrong(socket, event: Event, roomName, password) {
		if (await this.redis.checkIfPasswordIsCorrect(roomName, password) == false) {
			console.log(`Password for room ${roomName} is incorrect`);
			socket.emit(event, {
				roomName: roomName,
				timestamp: new Date().toISOString(),
				message: `Password is incorrect for room ${roomName}.`
			});
			return true;
		}
		return false;
	}
}