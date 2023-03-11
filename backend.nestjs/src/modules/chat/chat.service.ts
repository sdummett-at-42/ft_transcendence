import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateRoomDto, LeaveRoomDto, JoinRoomDto, BanUserDto, MuteUserDto, InviteUserDto, UnbanUserDto, UnmuteUserDto, SendMessageDto, UpdateRoomDto, KickUserDto, AddRoomAdminDto, RemoveRoomAdminDto, GiveOwnershipDto } from './chat.dto';
import { Event } from './chat-event.enum';
import * as argon2 from 'argon2';

@Injectable()
export class ChatService {

	// NOTE: When server sends message to the room, we should replace ${userId} with the pseudo of the user instead.
	constructor(private readonly redis: RedisService) { }

	async afterInit() {
		// Delete all the rooms afterInit ?
	}

	async handleConnection(socket) {
		if (socket.handshake.headers.cookie == undefined) {
			console.debug("Session cookie wasn't provided. Disconnecting socket.");
			socket.emit(Event.notConnected, {
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
			socket.emit(Event.notConnected, {
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

		socket.emit(Event.connected, {
			timestamp: new Date().toISOString(),
			message: `Socket successfully connected.`
		});
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		console.debug(`Socket ${socket.id} disconnected`);
	}

	async logout(userId: number, server) {
		console.debug(`User ${userId} logged out`);

		// TODO: add session id in socket.data in order to disconnect
		// only the socket related to the session that logout

		const sockets = server.sockets.sockets;
		sockets.forEach((value, key) => {
			if (value.data.userId === userId)
				value.disconnect
		});


		for (const socket of sockets)
			socket.disconnect();
	}

	async getMemberList(roomName: string) {
		const owner = await this.redis.getRoomOwner(roomName);
		let admins = (await this.redis.getRoomAdmins(roomName)).map(Number);
		let members = (await this.redis.getRoomMembers(roomName)).map(Number);
		const memberList = {
			owner: owner,
			admins: admins,
			members: members,
		}
		return memberList;
	}

	async createRoom(socket, dto: CreateRoomDto, server) {
		const room = await this.redis.getRoom(dto.roomName);
		if (room.length > 0) {
			console.debug(`Room ${dto.roomName} already exists`);
			socket.emit(Event.roomNotCreated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} already exists.`
			});
			return;
		}

		console.debug(`Creating room ${dto.roomName}, owner: ${socket.data.userId}`);
		let isProtected = false;
		if (dto.password != "")
			isProtected = true;
		await this.redis.setRoomName(dto.roomName);
		await this.redis.setRoomOwner(dto.roomName, socket.data.userId);
		await this.redis.setRoomAdmin(dto.roomName, socket.data.userId);
		await this.redis.setRoomMember(dto.roomName, socket.data.userId);
		await this.redis.setRoomVisibility(dto.roomName, dto.visibility);
		await this.redis.setRoomPassword(dto.roomName, await argon2.hash(dto.password), JSON.stringify(isProtected));
		await this.redis.setUserRoom(socket.data.userId, dto.roomName);

		socket.emit(Event.roomCreated, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `Room ${dto.roomName} has been created.`
		});

		const sockets = server.sockets.sockets;
		sockets.forEach((value, key) => {
			if (value.data.userId === socket.data.userId) {
				value.join(dto.roomName)
				value.emit(Event.roomJoined, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					message: `You have joined room ${dto.roomName}.`
				})
			}
		});
	}

	async leaveRoom(socket, dto: LeaveRoomDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomNotLeft, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomNotLeft, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		console.debug(`User ${userId} is leaving room ${dto.roomName}`);

		await this.redis.unsetRoomAdmin(dto.roomName, +userId);
		await this.redis.unsetRoomMember(dto.roomName, +userId);
		await this.redis.unsetUserRoom(+userId, dto.roomName);

		const owner = await this.redis.getRoomOwner(dto.roomName);
		if (owner === userId) {
			const admins = await this.redis.getRoomAdmins(dto.roomName);
			if (admins.length > 0)
				await this.redis.setRoomOwner(dto.roomName, +admins[0]);
			else {
				const members = await this.redis.getRoomMembers(dto.roomName);
				if (members.length > 0)
					await this.redis.setRoomOwner(dto.roomName, +members[0])
				else {
					this.redis.unsetRoom(dto.roomName);
					this.redis.unsetRoomName(dto.roomName);
				}
			}
		}

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === +userId);
		for (const socket of userSockets) {
			socket.leave(dto.roomName);
			socket.emit(Event.roomLeft, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have left room ${dto.roomName}.`
			});
		}

		// TODO: Must add the server message in redis here.
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${userId} has left the room ${dto.roomName}.`
		});
	}

	async joinRoom(socket, dto: JoinRoomDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const visibility = await this.redis.getRoomVisibility(dto.roomName);
		if (visibility === "private") {
			const invited = await this.redis.getRoomInvited(dto.roomName);
			if (invited.includes(userId) === false) {
				console.debug(`User ${userId} is not invited to room ${dto.roomName}`);
				socket.emit(Event.roomNotJoined, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					message: `You are not invited in room ${dto.roomName}.`
				});
				return;
			}
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(userId)) {
			console.debug(`User ${socket.data.userId} is banned from room ${dto.roomName} he is trying to join`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are banned from room ${dto.roomName}.`,
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId)) {
			console.debug(`User ${socket.data.userId} is already member in room ${dto.roomName}`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are already member in room ${dto.roomName}.`,
			});
			return;
		}

		if (members.length > 14) {
			console.debug(`Room ${dto.roomName} is full`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} is full.`,
			});
			return;
		}

		const hash = await this.redis.getRoomPassword(dto.roomName);
		if (await argon2.verify(hash, dto.password) === false) {
			console.debug(`Password for room ${dto.roomName} is incorrect`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Password is incorrect for room ${dto.roomName}.`
			});
			return;
		}

		await this.redis.unsetRoomInvited(dto.roomName, +userId);

		console.debug(`User ${userId} is joining room ${dto.roomName}`);

		await this.redis.setRoomMember(dto.roomName, +userId);
		await this.redis.setUserRoom(+userId, dto.roomName);

		const sockets = server.sockets.sockets;
		sockets.forEach((value, key) => {
			if (value.data.userId === socket.data.userId) {
				value.join(dto.roomName)
				value.join(Event.roomJoined, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					message: `You have joined room ${dto.roomName}.`,
				})
			}
		});

		// TODO: Add server msg in redis
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${socket.data.userId} has joined the room ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async kickUser(socket, dto: KickUserDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}
		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot kick himself`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot kick yourself.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (owner != userId && admins.includes(userId) === false) {
			console.debug(`User ${socket.data.userId} does not have the correct privilege to kick user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the correct privilege to kick in room ${dto.roomName}.`
			});
			return;
		}

		if (members.includes(dto.userId.toString()) === false) {
			console.debug(`User ${dto.userId} is not member in room ${dto.roomName}.`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not member in room ${dto.roomName}.`
			});
			return;
		}

		if (admins.includes(dto.userId.toString()) && owner != userId) {
			console.debug(`User ${userId} cannot kick admin ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot kick another admin in room ${dto.roomName}.`
			});
			return;
		}

		if (owner === dto.userId.toString()) {
			console.debug(`User ${userId} cannot kick admin ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot kick the owner of the room ${dto.roomName}.`
			});
			return;
		}
		console.debug(`User ${socket.data.userId} is kicking user ${dto.userId} from room ${dto.roomName}`);

		await this.redis.unsetRoomAdmin(dto.roomName, dto.userId);
		await this.redis.unsetRoomMember(dto.roomName, dto.userId);
		await this.redis.unsetUserRoom(dto.userId, dto.roomName);

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.leave(dto.roomName);
			socket.emit(Event.kicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have been kicked from room ${dto.roomName}.`,
			});
		}

		socket.emit(Event.userKicked, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been succesfully kicked from room ${dto.roomName}.`,
		})

		// TODO: store server message to redis
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been kicked from the room ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async banUser(socket, dto: BanUserDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot ban himself`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot ban yourself.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (owner != userId && admins.includes(userId) === false) {
			console.debug(`User ${socket.data.userId} does not have the correct privilege to ban user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the correct privilege to ban in room ${dto.roomName}.`
			});
			return;
		}

		if (admins.includes(dto.userId.toString()) && owner != userId) {
			console.debug(`User ${userId} cannot ban admin ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot ban another admin in room ${dto.roomName}.`
			});
			return;
		}

		if (owner === dto.userId.toString()) {
			console.debug(`User ${userId} cannot ban owner ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot ban the owner of the room ${dto.roomName}.`
			});
			return;
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already banned from room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already banned in room ${dto.roomName}.`
			});
			return;
		}

		if (members.includes(dto.userId.toString()) === false) {
			console.debug(`User ${dto.userId} is not member in room ${dto.roomName}.`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not member in room ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is banning user ${dto.userId} from room ${dto.roomName}`);

		await this.redis.unsetRoomAdmin(dto.roomName, dto.userId);
		await this.redis.unsetRoomMember(dto.roomName, dto.userId);
		await this.redis.setRoomBanned(dto.roomName, dto.userId);
		await this.redis.unsetUserRoom(dto.userId, dto.roomName);

		// Notify user being banned
		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.leave(dto.roomName);
			socket.emit(Event.banned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have been banned from room ${dto.roomName}.`,
			});
		}

		// Success notify
		socket.emit(Event.userBanned, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been successfully banned from room ${dto.roomName}.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been banned from the room ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async unbanUser(socket, dto: UnbanUserDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot unban himself`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot unban yourself.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (owner != userId && admins.includes(userId) === false) {
			console.debug(`User ${socket.data.userId} does not have the correct privilege to unban user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the correct privilege to unban in room ${dto.roomName}.`
			});
			return;
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(dto.userId.toString()) == false) {
			console.debug(`User ${dto.userId} is not banned from room ${dto.roomName}`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not banned in room ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is unbanning user ${dto.userId} from room ${dto.roomName}`);

		await this.redis.unsetRoomBanned(dto.roomName, dto.userId);

		const sockets = server.sockets.sockets;
		sockets.forEach((value, key) => {
			if (value.data.userId === dto.userId) {
				value.emit(Event.unbanned, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					message: `You have been unbanned from room ${dto.roomName}.`
				})
			}
		});

		socket.emit(Event.userUnbanned, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been succesfully unbanned from room ${dto.roomName}.`,
		})

		// TODO: store server message to redis
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been unbanned from the room ${dto.roomName}.`
		});
	}

	async muteUser(socket, dto: MuteUserDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot mute himself`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot mute yourself.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (owner != userId && admins.includes(userId) === false) {
			console.debug(`User ${socket.data.userId} does not have the correct privilege to mute user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the correct privilege to mute in room ${dto.roomName}.`
			});
			return;
		}

		if (admins.includes(dto.userId.toString()) && owner != userId) {
			console.debug(`User ${userId} cannot mute admin ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot mute another admin in room ${dto.roomName}.`
			});
			return;
		}

		if (owner === dto.userId.toString()) {
			console.debug(`User ${userId} cannot mute owner ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot mute the owner of the room ${dto.roomName}.`
			});
			return;
		}

		const muted = await this.redis.getRoomMuted(dto.roomName, dto.userId);
		if (muted.length > 0) {
			console.debug(`User ${dto.userId} is already muted in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already muted in room ${dto.roomName}.`
			});
			return;
		}

		if (members.includes(dto.userId.toString()) === false) {
			console.debug(`User ${dto.userId} is not member in room ${dto.roomName}.`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not member in room ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is muting user ${dto.userId} in room ${dto.roomName}`);

		await this.redis.setRoomMuted(dto.roomName, dto.userId, dto.timeout);

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.emit(Event.muted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have been muted from room ${dto.roomName} for ${dto.timeout} secs.`,
			});
		}

		// Success notify
		socket.emit(Event.userMuted, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been successfully muted from room ${dto.roomName} for ${dto.timeout} secs.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been muted from the room ${dto.roomName} for ${dto.timeout} secs.`
		});
	}

	async unmuteUser(socket, dto: UnmuteUserDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot unmute himself`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot unmute yourself.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (owner != userId && admins.includes(userId) === false) {
			console.debug(`User ${socket.data.userId} does not have the correct privilege to unmute user ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You do not have the correct privilege to unmute in room ${dto.roomName}.`
			});
			return;
		}

		const muted = await this.redis.getRoomMuted(dto.roomName, dto.userId);
		if (muted.length === 0) {
			console.debug(`User ${dto.userId} is not muted in room ${dto.roomName}`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not muted in room ${dto.roomName}.`
			});
			return;
		}

		if (members.includes(dto.userId.toString()) === false) {
			console.debug(`User ${dto.userId} is not member of room ${dto.roomName}.`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not member of room ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is unmuting user ${dto.userId} in room ${dto.roomName}`);

		await this.redis.unsetRoomMuted(dto.roomName, dto.userId);

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.emit(Event.unmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have been unmuted from room ${dto.roomName}.`,
			});
		}

		socket.emit(Event.userUnmuted, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been succesfully unmuted from room ${dto.roomName}.`,
		})

		// TODO: store server message to redis
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been unmuted from the room ${dto.roomName}.`
		});
	}

	async inviteUser(socket, dto: InviteUserDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot invite himself`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot invite yourself.`
			});
			return;
		}

		if (members.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already member in room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already member in room ${dto.roomName}.`
			});
			return;
		}

		const invited = await this.redis.getRoomInvited(dto.roomName);
		if (invited.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already invited in room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already invited in room ${dto.roomName}.`,
			});
			return;
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is banned from room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is banned from room ${dto.roomName}.`,
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is inviting user ${dto.userId} to room ${dto.roomName}`);

		await this.redis.setRoomInvited(dto.roomName, dto.userId);

		const sockets = server.sockets.sockets;
		sockets.forEach((value, key) => {
			if (value.data.userId === dto.userId) {
				value.emit(Event.invited, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					message: `You have been invited to room ${dto.roomName}.`
				})
			}
		});

		socket.emit(Event.userInvited, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${userId} has been succesfully invited to room ${dto.roomName}.`,
		});
	}

	async sendRoomMessage(socket, dto: SendMessageDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.msgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(userId)) {
			console.debug(`User ${socket.data.userId} is banned from room ${dto.roomName}`);
			socket.emit(Event.msgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are banned from room ${dto.roomName}.`,
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.msgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		const muted = await this.redis.getRoomMuted(dto.roomName, +userId);
		if (muted.length > 0) {
			console.debug(`User ${userId} is muted in room ${dto.roomName}`);
			socket.emit(Event.msgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are muted in room ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is sending a message to room ${dto.roomName}`);

		const currentTimestamp = Date.now()
		this.redis.setRoomMessage(dto.roomName, currentTimestamp, +userId, dto.message, 2 * 24 * 60 * 60);

		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: socket.data.userId,
			timestamp: new Date(currentTimestamp).toISOString(),
			message: dto.message,
		})
	}

	async updateRoom(socket, dto: UpdateRoomDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomNotUpdated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomNotUpdated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		if (owner != userId) {
			console.debug(`User ${socket.data.userId} is not the owner of room ${dto.roomName}`);
			socket.emit(Event.roomNotUpdated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not the owner of the room ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is updating room ${dto.roomName}`);

		let isProtected = false;
		if (dto.password != "")
			isProtected = true;
		await this.redis.setRoomVisibility(dto.roomName, dto.visibility);
		await this.redis.setRoomPassword(dto.roomName, await argon2.hash(dto.password), JSON.stringify(isProtected));

		socket.emit(Event.roomUpdated, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `Room ${dto.roomName} has been updated.`,
		})
	}

	async addRoomAdmin(socket, dto: AddRoomAdminDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot add himself as admin`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot add yourself as admin.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		if (owner != userId) {
			console.debug(`User ${socket.data.userId} is not the owner of room ${dto.roomName}`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not the owner of the room ${dto.roomName}.`
			});
			return;
		}

		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (admins.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already admin.`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is already admin.`
			});
			return;
		}

		console.debug(`User ${userId} is adding user ${dto.userId} as admin`);

		await this.redis.setRoomAdmin(dto.roomName, dto.userId);

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.emit(Event.granted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have been greanted admin in the room ${dto.roomName}.`,
			});
		}

		// Success notify
		socket.emit(Event.roomAdminAdded, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been successfully granted admin in room ${dto.roomName}.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been granted admin in the room ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async removeAdmin(socket, dto: RemoveRoomAdminDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomAdminNotRemoved, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomAdminNotRemoved, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot remove himself as admin`);
			socket.emit(Event.roomAdminNotRemoved, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot remove yourself as admin.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		if (owner != userId) {
			console.debug(`User ${socket.data.userId} is not the owner of room ${dto.roomName}`);
			socket.emit(Event.roomAdminNotRemoved, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not the owner of the room ${dto.roomName}.`
			});
			return;
		}

		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (admins.includes(dto.userId.toString()) === false) {
			console.debug(`User ${dto.userId} isn't an admin.`);
			socket.emit(Event.roomAdminNotRemoved, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} isn't an admin.`
			});
			return;
		}

		console.debug(`User ${userId} is removing user ${dto.userId} from admin list`);

		await this.redis.unsetRoomAdmin(dto.roomName, dto.userId);

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.emit(Event.demoted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have been demoted to a normal member in the room ${dto.roomName}.`,
			});
		}

		// Success notify
		socket.emit(Event.roomAdminRemoved, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been removed from admin list in the room ${dto.roomName}.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been demoted to a normal user in the room ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async giveRoomOwnership(socket, dto: GiveOwnershipDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomOwnershipNotGived, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomOwnershipNotGived, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot give himself the ownership`);
			socket.emit(Event.roomOwnershipNotGived, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot give yourself the ownership.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		if (owner != userId) {
			console.debug(`User ${socket.data.userId} is not the owner of room ${dto.roomName}`);
			socket.emit(Event.roomOwnershipNotGived, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not the owner of the room ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${userId} is giving the ownership of room ${dto.roomName} to user ${dto.userId}`);

		await this.redis.setRoomOwner(dto.roomName, dto.userId);
		await this.redis.setRoomAdmin(dto.roomName, dto.userId);

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.emit(Event.granted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You have been granted owner in the room ${dto.roomName}.`,
			});
		}

		// Success notify
		socket.emit(Event.roomOwnershipGived, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} has been successfully granted owner in room ${dto.roomName}.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			timestamp: new Date().toISOString(),
			message: `User ${dto.userId} is the new owner of the room ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async getRoomsList(socket, dto, server) {
		const roomsList = [];
		const roomNames = await this.redis.getRoomNames();

		await Promise.all(roomNames.map(async (roomName) => {
			if (await this.redis.getRoomVisibility(roomName) == "public") {
				let isProtected = false;
				if (await this.redis.getRoomProtection(roomName) == "true")
					isProtected = true;

				roomsList.push({
					roomName,
					protected: isProtected
				});
			}
		}));
		socket.emit(Event.roomsListReceveid, {
			roomsList,
		})
	}

	async atomic_test() {
		this.redis.atomic_test();
	}
}
