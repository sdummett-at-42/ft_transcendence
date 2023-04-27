import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { RedisService } from 'src/modules/redis/redis.service';
import { CreateRoomDto, LeaveRoomDto, JoinRoomDto, BanUserDto, MuteUserDto, InviteUserDto, UnbanUserDto, UnmuteUserDto, SendMessageDto, UpdateRoomDto, KickUserDto, AddRoomAdminDto, RemoveRoomAdminDto, GiveOwnershipDto, BlockUserDto, UnblockUserDto, UninviteUserDto, GetRoomMsgHistDto, sendDMDto, GetDmHistDto } from './chat.dto';
import { Event } from './chat-event.enum';
import * as argon2 from 'argon2';
import { PrismaService } from "nestjs-prisma";

const EXPIRATION_TIME = 2 * 24 * 60 * 60;

@Injectable()
export class ChatService {

	// NOTE: When server sends message to the room, we should replace ${userId} with the pseudo of the user instead.
	constructor(private readonly redis: RedisService, private readonly prisma: PrismaService) {	 }

	async afterInit() {
		// Delete all the rooms afterInit ?
	}

	private extractString(inputString: string): string {
		if (!inputString)
			return '';

		const prefix = 's:';
		const suffix = '.';
		const startIndex = inputString.indexOf(prefix);
		const endIndex = inputString.indexOf(suffix, startIndex + prefix.length);

		if (startIndex !== -1 && endIndex !== -1)
			return inputString.substring(startIndex + prefix.length, endIndex);
		return '';
	}

	async handleConnection(socket) {
		if (socket.handshake.auth.token == undefined) {
			console.debug("Session cookie wasn't provided. Disconnecting socket.");
			socket.emit(Event.notConnected, {
				timestamp: new Date().toISOString(),
				message: `No session cookie provided`,
			});
			socket.disconnect()
			return;
		}
		const sessionHash = this.extractString(socket.handshake.auth.token);
		const session = await this.redis.getSession(sessionHash);
		if (session === null || !JSON.parse(session).passport) {
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
		socket.emit(Event.unreadNotif, {
			rooms: [], // TO DO.
			users: await this.redis.getUserUnreadDM(userId),
		})
	}

	async handleDisconnect(@ConnectedSocket() socket) {
		console.debug(`Socket ${socket.id} disconnected`);
	}

	async disconnectUserSockets(userId: number, server) {
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
		// let banned = (await this.redis.getRoomBanned(roomName)).map(Number);
		// let muted = (await this.redis.getRoomAllMuted(roomName)).map(Number);
		const memberList = {
			owner: owner,
			admins: admins,
			members: members,
			// banned: banned,
			// muted: muted,
		}
		console.log("memberList", memberList)
		return memberList;
	}
	//test
	async createRoom(socket, dto: CreateRoomDto, server) {
		const room = await this.redis.getRoom(dto.roomName);
		if (room.length > 0) {
			console.debug(`Room ${dto.roomName} already exists`);
			socket.emit(Event.roomNotCreated, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `La salle ${dto.roomName} existe déjà.`
			});
			return;
		}

		console.debug(`Creating room ${dto.roomName}, owner: ${socket.data.userId}`);
		let isProtected = false;
		if (dto.password != "")
			isProtected = true;
		await this.redis.setCreatedAt(dto.roomName);
		await this.redis.setRoomName(dto.roomName);
		await this.redis.setRoomOwner(dto.roomName, socket.data.userId);
		await this.redis.setRoomAdmin(dto.roomName, socket.data.userId);
		await this.redis.setRoomMember(dto.roomName, socket.data.userId);
		await this.redis.setRoomVisibility(dto.roomName, dto.visibility);
		await this.redis.setRoomPassword(dto.roomName, await argon2.hash(dto.password), JSON.stringify(isProtected));
		await this.redis.setUserRoom(socket.data.userId, dto.roomName);


		// console.log("Je passe la dedans");
		socket.emit(Event.roomCreated, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `La salle ${dto.roomName} a été créée.`
		});

		let vis = await this.redis.getRoomVisibility(dto.roomName);
		const sockets = server.sockets.sockets;
		sockets.forEach((value, key) => {
			if (value.data.userId === socket.data.userId) {
				value.join(dto.roomName)
				value.emit(Event.roomJoined, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					public: vis,
					protected :isProtected, 
					message: `Vous avez rejoint le salon ${dto.roomName}.`
				})
			}
		});
	}

	async leaveRoom(socket, dto: LeaveRoomDto, server) {
		const userId: string = socket.data.userId.toString();
		const keys = await this.redis.getRoom(dto.roomName);
		console.log("unsetRoom", keys);

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
					this.redis.unsetAllRoomBanned(dto.roomName);
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
				message: `Vous avez quitté le salon ${dto.roomName}.`
			});
		}

		// TODO: Must add the server message in redis here.
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +userId,
			timestamp: new Date().toISOString(),
			message: ` a quitté la salle ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
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
				message: `La salle ${dto.roomName} n'existe pas.`
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
					message: `Vous n'êtes pas invité dans la salle de ${dto.roomName}.`
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
				message: `Vous êtes banni du salon ${dto.roomName}.`,
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId)) {
			console.debug(`User ${socket.data.userId} is already member in room ${dto.roomName}`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous êtes déjà membre du salon ${dto.roomName}.`,
			});
			return;
		}

		if (members.length > 14) {
			console.debug(`Room ${dto.roomName} is full`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `La salle ${dto.roomName} est pleine.`,
			});
			return;
		}

		const hash = await this.redis.getRoomPassword(dto.roomName);
		if (await argon2.verify(hash, dto.password) === false) {
			console.debug(`Password for room ${dto.roomName} is incorrect`);
			socket.emit(Event.roomNotJoined, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Le mot de passe est incorrect.`
			});
			return;
		}

		await this.redis.unsetRoomInvited(dto.roomName, +userId);

		console.debug(`User ${userId} is joining room ${dto.roomName}`);
		let isProtected = false;
		if (dto.password != "")
			isProtected = true;
		await this.redis.setRoomMember(dto.roomName, +userId);
		await this.redis.setUserRoom(+userId, dto.roomName);
		let vis = await this.redis.getRoomVisibility(dto.roomName);
		

		const sockets = server.sockets.sockets;
		sockets.forEach((value, key) => {
			if (value.data.userId === socket.data.userId) {
				console.log(value.data.userId);
				value.join(dto.roomName)
				// console.log("Je passe ici2", vis);
				socket.emit(Event.roomJoined, {
					roomName: dto.roomName,
					timestamp: new Date().toISOString(),
					public: vis,
					protected :isProtected, 
					message: `Vous avez rejoint le salon ${dto.roomName}.`,
				})
			}
		});

		// TODO: Add server msg in redis
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +socket.data.userId,
			timestamp: new Date().toISOString(),
			message: ` a rejoint la salle ${dto.roomName}.`
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
				message: `La salle ${dto.roomName} n'existe pas.`
			});
			return;
		}
		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `vous n'est pas membre de la salle ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot kick himself`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas vous expulsez.`
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
				message: `l'utilisateur n'est pas membre du salon ${dto.roomName}.`
			});
			return;
		}

		if (admins.includes(dto.userId.toString()) && owner != userId) {
			console.debug(`User ${userId} cannot kick admin ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas exclure un autre admin du salon ${dto.roomName}.`
			});
			return;
		}

		if (owner === dto.userId.toString()) {
			console.debug(`User ${userId} cannot kick admin ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotKicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas expulser le proprio du salon ${dto.roomName}.`
			});
			return;
		}
		console.debug(`User ${socket.data.userId} is kicking user ${dto.userId} from room ${dto.roomName}`);

		// await this.redis.unsetRoomAdmin(dto.roomName, dto.userId);
		await this.redis.unsetRoomMember(dto.roomName, dto.userId);
		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});

		await this.redis.unsetUserRoom(dto.userId, dto.roomName);

		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.leave(dto.roomName);
			socket.emit(Event.kicked, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous avez été expulsé du salon ${dto.roomName}.`,
			});
		}

		socket.emit(Event.userKicked, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `L'utilisateur a été expulsé du salon ${dto.roomName} avec succès.`,
		})

		// TODO: store server message to redis
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` a été expulsé du salon ${dto.roomName}.`
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
				message: `Vous n'êtes pas membre du salon ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot ban himself`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas vous bannir vous-même.`
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
				message: `Vous ne pouvez pas interdire un autre admin dans le salon ${dto.roomName}.`
			});
			return;
		}

		if (owner === dto.userId.toString()) {
			console.debug(`User ${userId} cannot ban owner ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas interdire le proprio du salon ${dto.roomName}.`
			});
			return;
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already banned from room ${dto.roomName}`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur est déjà banni dans le salon ${dto.roomName}.`
			});
			return;
		}

		if (members.includes(dto.userId.toString()) === false) {
			console.debug(`User ${dto.userId} is not member in room ${dto.roomName}.`);
			socket.emit(Event.userNotBanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur n'est pas membre du salon ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is banning user ${dto.userId} from room ${dto.roomName}`);

		// await this.redis.unsetRoomAdmin(dto.roomName, dto.userId);
		await this.redis.unsetRoomMember(dto.roomName, dto.userId);
		await this.redis.setRoomBanned(dto.roomName, dto.userId);
		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
		await this.redis.unsetUserRoom(dto.userId, dto.roomName);

		// Notify user being banned
		const sockets = await server.in(dto.roomName).fetchSockets();
		const userSockets = sockets.filter(socket => socket.data.userId === dto.userId);
		for (const socket of userSockets) {
			socket.leave(dto.roomName);
			socket.emit(Event.banned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous avez été banni du salon ${dto.roomName}.`,
			});
		}

		// Success notify
		socket.emit(Event.userBanned, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `L'utilisateur a été banni avec succès du salon ${dto.roomName}.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` a été banni du salon ${dto.roomName}.`
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
				message: `Vous n'êtes pas membre du salon ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot unban himself`);
			socket.emit(Event.userNotUnbanned, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas vous débannir vous-même.`
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
				message: `L'utilisateur ${dto.userId} n'est pas banni dans le salon ${dto.roomName}.`
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
					message: `Vous avez été débanni du salon ${dto.roomName}.`
				})
			}
		});

		socket.emit(Event.userUnbanned, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `L'utilisateur a été débanni avec succès du salon ${dto.roomName}.`,
		})

		// TODO: store server message to redis
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` a été débanni du salon ${dto.roomName}.`
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
				message: `Vous n'êtes pas membre du salon ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot mute himself`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas vous réduire au silence vous-même.`
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
				message: `Vous ne pouvez pas réduire au silence un autre admin dans le salon ${dto.roomName}.`
			});
			return;
		}

		if (owner === dto.userId.toString()) {
			console.debug(`User ${userId} cannot mute owner ${dto.userId} in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas réduire au silence le proprio du salon ${dto.roomName}.`
			});
			return;
		}

		const muted = await this.redis.getRoomMuted(dto.roomName, dto.userId);
		if (muted.length > 0) {
			console.debug(`User ${dto.userId} is already muted in room ${dto.roomName}`);
			socket.emit(Event.userNotMuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur ${dto.userId} est déjà réduit au silence dans le salon ${dto.roomName}.`
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
				timeout: dto.timeout,
				message: `Vous avez été réduit au silence dans la salle de discussion ${dto.roomName} pour ${dto.timeout} secondes.`,
			});
		}

		// Success notify
		socket.emit(Event.userMuted, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `L'utilisateur a été réduit au silence dans le salon ${dto.roomName} pour ${dto.timeout} secondes.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` a été réduit au silence dans le salon ${dto.roomName} pour ${dto.timeout} secondes.`
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
				message: `Vous ne pouvez pas vous réactiver vous-même.`
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
				message: `L'utilisateur n'est pas réduit au silence dans le salon ${dto.roomName}.`
			});
			return;
		}

		if (members.includes(dto.userId.toString()) === false) {
			console.debug(`User ${dto.userId} is not member of room ${dto.roomName}.`);
			socket.emit(Event.userNotUnmuted, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur ${dto.userId} n'est pas membre du salon ${dto.roomName}.`
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
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` a été réactivé dans le salon ${dto.roomName}.`
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
				message: `Vous n'êtes pas membre du salon ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot invite himself`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas vous inviter vous-même.`
			});
			return;
		}

		if (members.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already member in room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur est déjà membre du salon ${dto.roomName}.`
			});
			return;
		}

		const invited = await this.redis.getRoomInvited(dto.roomName);
		if (invited.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already invited in room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur est déjà invité dans le salon ${dto.roomName}.`,
			});
			return;
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is banned from room ${dto.roomName}`);
			socket.emit(Event.userNotInvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur est banni du salon ${dto.roomName}.`,
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
					message: `Vous avez été invité dans le salon ${dto.roomName}.`
				})
			}
		});

		socket.emit(Event.userInvited, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${userId} a été invité avec succès dans le salon ${dto.roomName}.`,
		});

		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` a été invité avec succès dans le salon ${dto.roomName}.`,
		});
	}

	async uninviteUser(socket, dto: UninviteUserDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.userNotUninvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.userNotUninvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You are not member in room ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot uninvite himself`);
			socket.emit(Event.userNotUninvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `You cannot uninvite yourself.`
			});
			return;
		}

		const invited = await this.redis.getRoomInvited(dto.roomName);
		if (invited.includes(dto.userId.toString()) == false) {
			console.debug(`User ${dto.userId} is not invited in room ${dto.roomName}`);
			socket.emit(Event.userNotUninvited, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} is not invited in room ${dto.roomName}.`,
			});
			return;
		}
		console.debug(`User ${socket.data.userId} is uninviting user ${dto.userId} from room ${dto.roomName}`);

		await this.redis.unsetRoomInvited(dto.roomName, dto.userId);

		socket.emit(Event.userUninvited, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `User ${userId} has been succesfully uninvited to room ${dto.roomName}.`,
		});
	}

	async sendRoomMessage(socket, dto: SendMessageDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomMsgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.roomName} doesn't exists.`
			});
			return;
		}

		const banned = await this.redis.getRoomBanned(dto.roomName);
		if (banned.includes(userId)) {
			console.debug(`User ${socket.data.userId} is banned from room ${dto.roomName}`);
			socket.emit(Event.roomMsgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous avez été banni du salon ${dto.roomName}.`,
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomMsgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous n'êtes pas membre du salon ${dto.roomName}.`,
			});
			return;
		}

		const muted = await this.redis.getRoomMuted(dto.roomName, +userId);
		if (muted.length > 0) {
			console.debug(`User ${userId} is muted in room ${dto.roomName}`);
			socket.emit(Event.roomMsgNotSended, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous êtes en mode muet dans le salon ${dto.roomName}.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is sending a message to room ${dto.roomName}`);

		const currentTimestamp = Date.now()
		this.redis.setRoomMessage(dto.roomName, new Date(currentTimestamp).toISOString(), +userId, dto.message, EXPIRATION_TIME);

		const blockedBy = await this.redis.getRoomUsersBlockedBy(dto.roomName, +userId);
		console.log(`user ${userId} is blocked by ${JSON.stringify(blockedBy)}`);
		const sockets = await server.in(dto.roomName).fetchSockets();
		let excludedSocketIds = sockets.map((socket) => {
			if (blockedBy.includes(socket.data.userId))
				return socket.id;
		});
		server.to(dto.roomName).except(excludedSocketIds).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: socket.data.userId,
			timestamp: new Date(currentTimestamp).toISOString(),
			message: dto.message,
		});
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
			public: dto.visibility,
			protected :isProtected, 
			message: `Room ${dto.roomName} has been updated.`,
		})
		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
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
		if (members.includes(dto.userId.toString()) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous n'êtes pas membre du salon ${dto.roomName}.`,
			});
			return;
		}

		if (userId == dto.userId.toString()) {
			console.debug(`User ${socket.data.userId} cannot add himself as admin`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous ne pouvez pas vous ajouter en tant qu'admin.`
			});
			return;
		}

		const owner = await this.redis.getRoomOwner(dto.roomName);
		if (owner != userId) {
			console.debug(`User ${socket.data.userId} is not the owner of room ${dto.roomName}`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous n'êtes pas le proprio du salon ${dto.roomName}.`
			});
			return;
		}

		const admins = await this.redis.getRoomAdmins(dto.roomName);
		if (admins.includes(dto.userId.toString())) {
			console.debug(`User ${dto.userId} is already admin.`);
			socket.emit(Event.roomAdminNotAdded, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur ${dto.userId} est déjà admin.`
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
				message: `Vous avez été désigné(e) administrateur(trice) du salon ${dto.roomName}.`,
			});
		}

		// Success notify
		socket.emit(Event.roomAdminAdded, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: ` l'utilisateur ${dto.userId} a été promu au rôle d'admin du salon ${dto.roomName}.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` a été promu au rôle d'admin du salon ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async removeRoomAdmin(socket, dto: RemoveRoomAdminDto, server) {
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
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` has been demoted to a normal user in the room ${dto.roomName}.`
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
				message: `Vous avez été nommé propriétaire du salon ${dto.roomName}.`,
			});
		}

		// Success notify
		socket.emit(Event.roomOwnershipGived, {
			roomName: dto.roomName,
			timestamp: new Date().toISOString(),
			message: `L'utilisateur ${dto.userId} a été nommé propriétaire du salon ${dto.roomName}.`,
		})

		// Send message to room by the server to notify user that someone has been banned
		server.to(dto.roomName).emit(Event.roomMsgReceived, {
			roomName: dto.roomName,
			userId: -1,
			targetId: +dto.userId,
			timestamp: new Date().toISOString(),
			message: ` est le nouveau propriétaire du salon ${dto.roomName}.`
		});

		server.to(dto.roomName).emit(Event.memberListUpdated, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}

	async getRoomsList(socket, dto, server) {
		const roomsList = [];
		// console.debug("here0");
		const roomNames = await this.redis.getRoomNames();
		// console.debug("here1");
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
		console.debug(`Sending public rooms to user ${socket.data.userId}`);
		socket.emit(Event.roomsListReceived, {
			roomsList,
		})
	}
	
	async getBlockList(socket,dto, server){
		console.log("here??", socket.data.userId)
		const userId: number = socket.data.userId;
		const usersblocked = await this.redis.getUsersBlocked(+userId);
		socket.emit(Event.userBlockList, {
			list: usersblocked,
		});
	}

	async blockUser(socket, dto: BlockUserDto, server) {
		const userId: string = socket.data.userId.toString();

		if (userId == dto.toUserId.toString()) {
			console.debug(`User ${socket.data.userId} cannot block himself`);
			socket.emit(Event.userNotBlocked, {
				userId: dto.toUserId,
				timestamp: new Date().toISOString(),
				message: `You cannot block yourself.`
			});
			return;
		}

		const usersblocked = await this.redis.getUsersBlocked(dto.fromUserId);
		if (usersblocked.includes(dto.toUserId)) {
			console.debug(`User ${dto.toUserId} is already blocked by user ${userId}`);
			socket.emit(Event.userNotBlocked, {
				userId: dto.toUserId,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur est déjà bloqué par vous.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is blocking user ${dto.toUserId}`);

		await this.redis.setUserBlocked( +userId, dto.toUserId);

		socket.emit(Event.userBlocked, {
			userId: dto.toUserId,
			timestamp: new Date().toISOString(),
			message: `L'utilisateur a été bloqué avec succès.`,
			fromuserId: dto.fromUserId,
		})
	}

	async unblockUser(socket, dto: UnblockUserDto, server) {
		const userId: string = socket.data.userId.toString();
		
		if (userId == dto.toUserId.toString()) {
			console.debug(`User ${socket.data.userId} cannot unblock himself`);
			socket.emit(Event.userNotUnblocked, {
				userId: dto.toUserId,
				timestamp: new Date().toISOString(),
				message: `You cannot unblock yourself.`
			});
			return;
		}

		const userBlocked = await this.redis.getUsersBlocked(dto.fromUserId);
		if (userBlocked.includes(dto.toUserId) == false) {
			console.debug(`User ${dto.toUserId} is not blocked by user ${userId}`);
			socket.emit(Event.userNotUnblocked, {
				userId: dto.toUserId,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur n'est pas bloqué par vous.`
			});
			return;
		}

		console.debug(`User ${socket.data.userId} is unblocking user ${dto.toUserId}`);

		await this.redis.unsetUserBlocked(+userId, dto.toUserId);

		socket.emit(Event.userUnblocked, {
			userId: dto.toUserId,
			timestamp: new Date().toISOString(),
			message: `L'utilisateur a été débloqué avec succès.`,
			fromuserId: dto.fromUserId,
		})
	}

	async getRoomMsgHist(socket, dto: GetRoomMsgHistDto, server) {
		const userId: string = socket.data.userId.toString();

		const room = await this.redis.getRoom(dto.roomName);
		if (room.length === 0) {
			console.debug(`Room ${dto.roomName} doesn't exist`);
			socket.emit(Event.roomMsgHistNotReceived, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `La salle ${dto.roomName} n'existe pas.`
			});
			return;
		}

		const members = await this.redis.getRoomMembers(dto.roomName);
		if (members.includes(userId) === false) {
			console.debug(`User ${userId} is not member in room ${dto.roomName}`);
			socket.emit(Event.roomMsgHistNotReceived, {
				roomName: dto.roomName,
				timestamp: new Date().toISOString(),
				message: `Vous n'êtes pas membre du salon ${dto.roomName}.`,
			});
			return;
		}

		console.debug(`Sending message history from room ${dto.roomName} to user ${userId}`)
		const roomMessages = await this.redis.getRoomMessages(dto.roomName);
		socket.emit(Event.roomMsgHistReceived, {
			roomName: dto.roomName,
			msgHist: roomMessages,
		})
	}

	async sendDM(socket, dto: sendDMDto, server) {
		const userId: string = socket.data.userId.toString();

		if (+userId === dto.userId) {
			socket.emit(Event.DMNotSended, {
				userId: dto.userId,
				timestamp: new Date().toISOString(),
				message: `You cannot send DM to yourself.`,
			});
			return;
		}

		const user = await this.prisma.user.findUnique({
			where: {
				id: dto.userId
			}
		});
		if (!user || user.id === 0) {
			socket.emit(Event.DMNotSended, {
				userId: dto.userId,
				timestamp: new Date().toISOString(),
				message: `User ${dto.userId} doesn't exist.`,
			});
			return;
		}

		const userBlocked = await this.redis.getUsersBlocked(dto.userId);
		console.log("userBlock", userBlocked, +userId);
		if (userBlocked.includes(+userId)) {
			socket.emit(Event.DMNotSended, {
				userId: dto.userId,
				timestamp: new Date().toISOString(),
				message: `L'utilisateur vous a bloqué.`,
			});
			return;
		}
		
		const sockets = await server.fetchSockets();
		// console.log("userId", userId);
		const currentTimestamp = Date.now();
		socket.emit(Event.DMReceived, {
			userId: +userId,
			timestamp: new Date(currentTimestamp).toISOString(),
			message: dto.message,
		})
		socket.emit(Event.dmUpdated, {
			userId: +dto.userId, 
			timestamp: new Date().toISOString(),
			message: `Room ${dto.userId} has been updated.`,
			fromId : +userId,
		})
		const receiverSockets = sockets.filter(s => {
			return s.data.userId === dto.userId ;
		});
		console.log("receiverSockets", receiverSockets.length);
		this.redis.setDm(+userId, dto.userId, new Date(currentTimestamp).toISOString(), dto.message, EXPIRATION_TIME);
		if (receiverSockets.length === 0) {
			console.debug(`User ${userId} is sending a DM to user ${dto.userId} (disconnected)`);
			await this.redis.setUserUnreadDM(+userId, dto.userId);
			return;
		}
		receiverSockets.forEach(socket => {
			// console.debug("socket",socket);
			socket.emit(Event.DMReceived, {
				userId: +userId,
				timestamp: new Date(currentTimestamp).toISOString(),
				message: dto.message,
			})
			socket.emit(Event.dmUpdated, {
				userId: +userId,
				timestamp: new Date().toISOString(),
				message: `Room ${dto.userId} has been updated.`,
			})
		});
	}

	async getDmHist(socket, dto: GetDmHistDto, server) {
		const userId: string = socket.data.userId.toString();

		const dms = await this.redis.getDm(+userId, dto.userId);
		socket.emit(Event.dmHist, {
			userId: dto.userId,
			msgHist: dms,
		})
	}


	async notifsRead(socket, dto, server) {
		await this.redis.unsetUserUnreadDM(socket.data.userId);
		// unsetUnreadRoomMsg <== TODO
	}

	// async getUserRooms(socket, dto, server) {
	// 	const rooms = await this.redis.getUserRooms(socket.data.userId)
	// 	socket.emit(Event.userRooms, {rooms});
	// }
	async getUserRooms(socket, dto, server) {
		const roomsList = [];
		const roomNames = await this.redis.getUserRooms(socket.data.userId)
		await Promise.all(roomNames.map(async (roomName) => {
			let ifpublic = "private";
			let ifprotected = false;
			if (await this.redis.getRoomVisibility(roomName) == "public") 
				ifpublic = "public";
			if (await this.redis.getRoomProtection(roomName) == "true")
				ifprotected  = true;

				roomsList.push({
					roomName,
					protected: ifprotected, 
					public : ifpublic,
					// timestamp: new Date().toISOString(),
					created_at: await this.redis.getCreatedAt(roomName),
				});
			}
		));
		socket.emit(Event.userRooms, {
			roomsList,
		})
	}
	async getDmsList(socket, dto, server) {
		const dms = await this.redis.getDmList(socket.data.userId);
		socket.emit(Event.dmsList, { dms });
	}

	async getRoomMembers(socket, dto, server) {
		console.log("dto.roomName",dto.roomName);
		console.log(await this.getMemberList(dto.roomName))
		socket.emit(Event.roomMembers, {
			roomName: dto.roomName,
			memberList: await this.getMemberList(dto.roomName),
		});
	}
}
