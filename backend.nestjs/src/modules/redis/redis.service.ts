import { Injectable } from '@nestjs/common';
import * as Redis from 'redis';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RedisService {
	private readonly client;

	constructor(private readonly config: ConfigService) {
		this.client = Redis.createClient({
			url: this.config.get('REDIS_URL'),
			legacyMode: true,
		});
		this.client.connect();
		this.client.on('error', (err) => {
			console.debug('Redis error: ', err);
		});
		this.client.on('connect', () => {
			console.debug('Redis connected');
		});
	}

	getClient() {
		return this.client;
	}

	async setRoomOwner(roomName: string, userId: number) {
		await this.client.del(`room:${roomName}:infos:owner`);
		this.client.hset(`room:${roomName}:infos:owner`, userId, 1);
	}

	async getRoomOwner(roomName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`room:${roomName}:infos:owner`, (err, owner) => {
				resolve(owner[0]);
			})
		})
	}

	async setRoomAdmin(roomName: string, userId: number) {
		this.client.hset(`room:${roomName}:infos:admin`, userId, 1);
	}

	async unsetRoomAdmin(roomName: string, userId: number) {
		this.client.hdel(`room:${roomName}:infos:admin`, userId, 1);
	}

	async getRoomAdmins(roomName: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`room:${roomName}:infos:admin`, (err, admins) => {
				resolve(admins);
			})
		})
	}

	async setRoomMember(roomName: string, userId: number) {
		this.client.hset(`room:${roomName}:infos:member`, userId, 1);
	}

	async unsetRoomMember(roomName: string, userId: number) {
		this.client.hdel(`room:${roomName}:infos:member`, userId, 1);
	}

	async getRoomMembers(roomName: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`room:${roomName}:infos:member`, (err, members) => {
				resolve(members);
			})
		})
	}

	async setRoomBanned(roomName: string, userId: number) {
		this.client.hset(`room:${roomName}:infos:banned`, userId, 1);
	}

	async unsetRoomBanned(roomName: string, userId: number) {
		this.client.hdel(`room:${roomName}:infos:banned`, userId, 1);
	}

	async getRoomBanned(roomName: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`room:${roomName}:infos:banned`, (err, banned) => {
				resolve(banned);
			})
		})
	}

	async setRoomMuted(roomName: string, userId: number, expirationTime: number) {
		this.client.multi()
			.set(`room:${roomName}:infos:muted:${userId}`, 1)
			.expire(`room:${roomName}:infos:muted:${userId}`, expirationTime)
			.exec()
	}

	async unsetRoomMuted(roomName: string, userId: number) {
		this.client.del(`room:${roomName}:infos:muted:${userId}`);
	}

	async getRoomMuted(roomName: string, userId: number): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.keys(`room:${roomName}:infos:muted:${userId}`, (err, muted) => {
				resolve(muted);
			})
		})
	}

	async setRoomInvited(roomName: string, userId: number) {
		this.client.hset(`room:${roomName}:infos:invited`, userId, 1);
	}

	async unsetRoomInvited(roomName: string, userId: number) {
		this.client.hdel(`room:${roomName}:infos:invited`, userId, 1);
	}

	async getRoomInvited(roomName: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`room:${roomName}:infos:invited`, (err, invited) => {
				resolve(invited);
			})
		})
	}

	async setRoomPassword(roomName: string, password: string, protectedByPassword: string) {
		await this.client.del(`room:${roomName}:infos:password`);
		this.client.hset(`room:${roomName}:infos:password`, password, 1);
		this.client.set(`room:${roomName}:infos:protected`, protectedByPassword);
	}

	async getRoomPassword(roomName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`room:${roomName}:infos:password`, (err, password) => {
				resolve(password[0]);
			})
		})
	}

	async getRoomProtection(roomName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.client.get(`room:${roomName}:infos:protected`, (err, protectedByPassword) => {
				resolve(protectedByPassword);
			})
		});
	}

	async setRoomVisibility(roomName: string, visibility: string) {
		await this.client.del(`room:${roomName}:infos:visibility`);
		this.client.hset(`room:${roomName}:infos:visibility`, visibility, 1);
	}

	async getRoomVisibility(roomName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.client.hkeys(`room:${roomName}:infos:visibility`, (err, visibility) => {
				resolve(visibility[0]);
			})
		})
	}

	async setRoomUserBlocked(roomName: string, userBlockedById: number, userBlockedId: number) {
		this.client.set(`room:${roomName}:infos:blocked:${userBlockedById}:${userBlockedId}`, JSON.stringify({ userBlockedById, userBlockedId }));
	}

	async unsetRoomUserBlocked(roomName: string, userId: number, userBlockedId: number) {
		this.client.del(`room:${roomName}:infos:blocked:${userId}:${userBlockedId}`);
	}

	private async getRoomUsersBlockedKeys(roomName: string, userId: number): Promise<string[]> {
		return new Promise(async (resolve, reject) => {
			await this.client.keys(`room:${roomName}:infos:blocked:${userId}:*`, (err, keys) => {
				resolve(keys);
			})
		});
	}

	async getRoomUsersBlocked(roomName: string, userId: number): Promise<any[]> {
		const usersBlockedKeys = await this.getRoomUsersBlockedKeys(roomName, userId);
		if (!usersBlockedKeys || usersBlockedKeys.length === 0) {
			return [];
		}

		const usersBlocked = await Promise.all(
			usersBlockedKeys.map(key => {
				return new Promise((resolve, reject) => {
					this.client.get(key, (err, value) => {
						resolve((JSON.parse(value)).userBlockedId);
					});
				})
			})
		);
		return usersBlocked;
	}

	private async getRoomUsersBlockedByKeys(roomName: string, userBlockedId: number): Promise<string[]> {
		return new Promise(async (resolve, reject) => {
			await this.client.keys(`room:${roomName}:infos:blocked:*:${userBlockedId}`, (err, keys) => {
				resolve(keys);
			})
		});
	}

	async getRoomUsersBlockedBy(roomName: string, userId: number): Promise<any[]> {
		const usersBlockedByKeys = await this.getRoomUsersBlockedByKeys(roomName, userId);
		if (!usersBlockedByKeys || usersBlockedByKeys.length === 0) {
			return [];
		}

		const userBlockedBy = await Promise.all(
			usersBlockedByKeys.map(key => {
				return new Promise((resolve, reject) => {
					this.client.get(key, (err, value) => {
						resolve((JSON.parse(value)).userBlockedById);
					});
				})
			})
		);
		return userBlockedBy;
	}

	async setRoomMessage(roomName: string, timestamp: string, userId: number, message: string, expirationTime: number) {
		const uniqueId = uuid();
		this.client.multi()
			.set(`room:${roomName}:message:${uniqueId}`, JSON.stringify({
				timestamp: timestamp,
				userId: userId,
				message: message,
			}))
			.expire(`room:${roomName}:message:${uniqueId}`, expirationTime)
			.exec()
	}

	private async getRoomMessagesKeys(roomName: string): Promise<string[]> {
		return new Promise(async (resolve, reject) => {
			await this.client.keys(`room:${roomName}:message:*`, (err, keys) => {
				resolve(keys);
			})
		});
	}

	async getRoomMessages(roomName: string): Promise<any[]> {
		const messageKeys = await this.getRoomMessagesKeys(roomName);

		if (!messageKeys || messageKeys.length === 0) {
			return [];
		}

		const messages = await Promise.all(
			messageKeys.map(key => {
				return new Promise((resolve, reject) => {
					this.client.get(key, (err, value) => {
						const message = JSON.parse(value);
						resolve(message);
					})
				});
			}));
		return messages;
	}

	async setUserRoom(userId: number, roomName: string) {
		this.client.set(`user:${userId}:room:${roomName}`, 1);
	}

	async unsetUserRoom(userId: number, roomName: string) {
		this.client.del(`user:${userId}:room:${roomName}`, 1);
	}

	async getUserRooms(userId: number): Promise<string[]> {
		const userRoomsKeys: string[] = await new Promise((resolve, reject) => {
			this.client.keys(`user:${userId}:room:*`, (err, keys) => {
				resolve(keys)
			});
		});
		const patternToRemove = `user:${userId}:room:`;
		const userRooms = userRoomsKeys.map((str) => str.replace(new RegExp(`^${patternToRemove}`), ''));
		return userRooms;
	}

	async setUserUnreadDM(emitterId: number, receiverId: number) {
		let users = await this.getUserUnreadDM(receiverId);
		if (!users)
			users = [];
		if (!users.includes(emitterId))
			users.push(emitterId);
		await this.client.set(`user:${receiverId}:unreaddm`, JSON.stringify(users))//users);

	}

	async unsetUserUnreadDM(userId: number) {
		this.client.del(`user:${userId}:unreaddm`);
	}

	async getUserUnreadDM(userId: number): Promise<number[]> {
		return new Promise((resolve, reject) => {
			this.client.get(`user:${userId}:unreaddm`, (err, reply) => {
				resolve(reply)
			});
		});
	}

	private createDmId(userId1: number, userId2) {
		const tmp = userId1;
		if (userId1 > userId2) {
			userId1 = userId2;
			userId2 = tmp;
		}
		return userId1.toString() + userId2.toString();
	}

	async setDm(emitterId: number, receiverId: number, timestamp: string, message: string, expirationTime: number) {
		const dmId = this.createDmId(emitterId, receiverId);
		const uniqueId = uuid();
		this.client.multi()
		this.client.multi()
			.set(`dm:${dmId}:message:${uniqueId}`, JSON.stringify({
				timestamp: timestamp,
				userId: emitterId,
				message: message,
			}))
			.expire(`dm:${dmId}:message:${uniqueId}`, expirationTime)
			.exec()
			this.setDmList(emitterId, receiverId, expirationTime);
			this.setDmList(receiverId, emitterId, expirationTime);
	}

	async getDm(userId1: number, userId2: number) {
		const messageKeys = await this.getDmKeys(userId1, userId2);

		if (!messageKeys || messageKeys.length === 0) {
			return [];
		}

		const messages = await Promise.all(
			messageKeys.map(key => {
				return new Promise((resolve, reject) => {
					this.client.get(key, (err, value) => {
						const message = JSON.parse(value);
						resolve(message);
					})
				});
			}));
		return messages;
	}

	private async getDmKeys(userId1: number, userId2: number): Promise<string[]> {
		const dmId = this.createDmId(userId1, userId2);
		return new Promise(async (resolve, reject) => {
			await this.client.keys(`dm:${dmId}:message:*`, (err, keys) => {
				resolve(keys);
			})
		});
	}

	async setDmList(userId: number, userIdToAdd: number, expirationTime: number) {
		let users = await this.getDmList(userId);
		if (!users)
			users = [];
		if (!users.includes(userIdToAdd))
			users.push(userIdToAdd);
		this.client.multi()
			.set(`user:${userId}:dms`, JSON.stringify(users))//users)
			.expire(`user:${userId}: dms`, expirationTime + 42)
			.exec()
	}

	async getDmList(userId:number): Promise<number[]> {
		return new Promise((resolve, reject) => {
			this.client.get(`user:${userId}:dms`, (err, reply) => {
				resolve(JSON.parse(reply));
			});
		})
	}

	async setRoomName(roomName: string) {
		this.client.set(`roomName:${roomName}`, roomName);
	}

	async unsetRoomName(roomName: string) {
		this.client.del(`roomName:${roomName}`, roomName);
	}

	private async getRoomName(roomName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.client.get(`roomName:${roomName}`, (err, roomName) => {
				resolve(roomName);
			});
		});
	}

	private async getRoomNameKeys(): Promise<string[]> {
		return new Promise(async (resolve, reject) => {
			await this.client.keys(`roomName:*`, (err, keys) => {
				resolve(keys);
			})
		});
	}
	async getRoomNames(): Promise<any[]> {
		const roomNameKeys = await this.getRoomNameKeys();

		if (!roomNameKeys || roomNameKeys.length === 0) {
			return [];
		}

		const roomNames = await Promise.all(
			roomNameKeys.map(key => {
				return new Promise((resolve, reject) => {
					this.client.get(key, (err, value) => {
						// const roomName = JSON.parse(value);
						resolve(value);
					})
				});
			}));
		return roomNames;
	}

	async getRoom(roomName: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.keys(`room:${roomName}:*`, (err, keys) => {
				resolve(keys);
			})
		})
	}

	async unsetRoom(roomName: string) {
		const keys = await this.getRoom(roomName);
		keys.forEach(key => {
			this.client.del(key);
		})
	}

	private async getRoomsKeys(): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.client.keys(`room:*`, (err, keys) => {
				resolve(keys);
			});
		});
	}

	async unsetRooms() {
		const keys = await this.getRoomsKeys();
		keys.forEach(key => {
			this.client.del(key);
		})
	}

	async getSession(sess: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.client.get(`sess:${sess}`, (err, session) => {
				resolve(session);
			});
		});
	}

	/* ******** */
	/* Tests */

	async delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async atomic_test() {
		await this.setRoomBanned("42", 24);
		await this.setRoomBanned("42", 12313);
		await this.setRoomOwner("42", 2245);
		// await this.unsetRoomBanned("42", 24);

		// await this.unsetAllRooms();  
		const owner = await this.getRoomOwner("42");
		console.debug(`length: ${owner.length}`)
		console.debug(`owner: ${owner}`);

		// const uniqueId = uuid();
		// console.debug(`uniqueId: ${uniqueId}`)
		// await this.setRoomMessage("42", Date.now(), 244, "Hello World", 15);
		// await new Promise(f => setTimeout(f, 10000));
		// await this.setRoomMessage("42", 244, Date.now(), "Hello Last World", 15);
		const messages = await this.getRoomMessages("42");
		console.debug("messages:");
		console.debug(messages)
		console.debug(`typeof messages: ${typeof messages}`)
		const room = await this.getRoom("42");
		console.debug(`room.length: ${room.length}`);
		console.debug(`typeof room: ${typeof room}`)
		const room2 = await this.getRoom("unknown");
		console.debug(`room2.length: ${room2.length}`);
		console.debug(`typeof room2: ${typeof room2}`)

		await this.setRoomMember("42", 1337);
		await this.setRoomMember("42", 1338);
		await this.setRoomMember("42", 29384);
		let members = await this.getRoomMembers("42");
		console.debug(`members: ${members}`);
		console.debug(`members.length: ${members.length}`);
		console.debug(members.includes("1337"));
		await this.unsetRoomMember("42", 1337);
		members = await this.getRoomMembers("42");

		console.debug(members.includes("1337"));

		await this.setRoomVisibility("42", "LOOL");
		let visibility = await this.getRoomVisibility("42");
		console.debug(`visibility: ${visibility}`);
		await this.setRoomVisibility("42", "MDR")
		visibility = await this.getRoomVisibility("42");
		console.debug(`visibility: ${visibility}`);

		// await this.setRoomPassword("42", await argon2.hash(""));
		const hash = await this.getRoomPassword("42");
		console.debug(`hash: ${hash}`);
		console.debug(`verify: ${await argon2.verify(hash, "")}`);

		await this.setRoomMuted("42", 4242, 10);
		await this.unsetRoomMuted("42", 4242);
		let muted = await this.getRoomMuted("42", 4242);
		console.debug(`muted: ${muted}`);
		console.debug(`muted.length: ${muted.length}`);
		muted = await this.getRoomMuted("42", 4243);
		console.debug(`muted: ${muted}`);
		console.debug(`muted.length: ${muted.length}`);
		await this.setRoomMuted("42", 4243, 10);
		console.debug(`muted: ${muted}`);
		console.debug(`muted.length: ${muted.length}`);

		await this.setUserRoom(4242, "roooomz");
		await this.setUserRoom(4242, "roooomz-2");
		await this.setUserRoom(4242, "roooomz-42");
		await this.setUserRoom(4242, "roooomz-224");
		await this.unsetUserRoom(4242, "roooomz");
		// await this.unsetUserRoom(4242, "roooomz-2");
		await this.unsetUserRoom(4242, "roooomz-42");
		// await this.unsetUserRoom(4242, "roooomz-224");

		const userRooms = await this.getUserRooms(4242);
		console.debug(`userRooms: ${userRooms}`)
	}
}
