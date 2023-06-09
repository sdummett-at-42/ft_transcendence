import * as  Joi from 'joi';

const ROOM_NAME_MIN = 1;
const ROOM_NAME_MAX = 32;
const PASSWORD_MIN = 0;
const PASSWORD_MAX = 32;
const TIMEOUT_MIN = 30
const TIMEOUT_MAX = 1260;
const MESSAGE_MIN = 1;
const MESSAGE_MAX = 500;
const USERID_MIN = 1;
const PUBLIC = "public";
const PRIVATE = "private";

export class CreateRoomDto {
	roomName: string;
	visibility: string;
	password: string;
}
export const CreateRoomSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	visibility: Joi.string().valid(PUBLIC, PRIVATE).required(),
	password: Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX).required(),
});

export class LeaveRoomDto {
	roomName: string;
}
export const LeaveRoomSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
});

export class JoinRoomDto {
	roomName: string;
	password: string;
	visibility: string;
	
}
export const JoinRoomSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	password: Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX).required(),
});

export class KickUserDto {
	roomName: string;
	userId: number;
}
export const KickUserSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
})

export class BanUserDto {
	roomName: string;
	userId: number;
}
export const BanUserSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
});

export class UnbanUserDto {
	roomName: string;
	userId: number;
}
export const UnbanUserSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
});

export class MuteUserDto {
	roomName: string;
	userId: number;
	timeout: number;
}
export const MuteUserSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
	timeout: Joi.number().min(TIMEOUT_MIN).max(TIMEOUT_MAX).required(),
});

export class UnmuteUserDto {
	roomName: string;
	userId: number;
}
export const UnmuteUserSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
})

export class InviteUserDto {
	roomName: string;
	userId: number;
}
export const InviteUserSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
});

export class UninviteUserDto {
	roomName: string;
	userId: number;
}
export const UninviteUserSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
});

export class SendMessageDto {
	roomName: string;
	message: string;
}
export const SendMessageSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	message: Joi.string().min(MESSAGE_MIN).max(MESSAGE_MAX).required(),
});

export class UpdateRoomDto {
	roomName: string;
	visibility: string;
	password: string;
}
export const UpdateRoomSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	visibility: Joi.string().valid(PUBLIC, PRIVATE).required(),
	password: Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX).required(),
});

export class AddRoomAdminDto {
	roomName: string;
	userId: number;
}
export const AddRoomAdminSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
})

export class RemoveRoomAdminDto {
	roomName: string;
	userId: number;	
}
export const RemoveRoomAdminSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
})

export class GiveOwnershipDto {
	roomName: string;
	userId: number;
}
export const GiveOwnershipSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
	userId: Joi.number().min(USERID_MIN).required(),
})

export class BlockUserDto {
	toUserId:number;
	fromUserId: number;
}

export const BlockUserSchema = Joi.object({
	toUserId: Joi.number().min(USERID_MIN).required(),
	fromUserId: Joi.number().min(USERID_MIN).required(),
})

export class UnblockUserDto {
	toUserId:number;
	fromUserId: number;
}

export const UnblockUserSchema = Joi.object({
	toUserId: Joi.number().min(USERID_MIN).required(),
	fromUserId: Joi.number().min(USERID_MIN).required(),
})

export class GetRoomMsgHistDto {
	roomName: string;
}

export const GetRoomMsgHistSchema = Joi.object({
	roomName: Joi.string().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).required(),
})

export class sendDMDto {
	userId: number;
	message: string
}

export const sendDMSchema = Joi.object({
	userId: Joi.number().min(USERID_MIN).required(),
	message: Joi.string().min(MESSAGE_MIN).max(MESSAGE_MAX).required(),
})

export class GetDmHistDto {
	userId: number;
}

export const GetDmHistSchema = Joi.object({
	userId: Joi.number().min(USERID_MIN).required(),
})
