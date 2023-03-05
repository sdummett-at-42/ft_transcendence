import * as  Joi from 'joi';
import { UserRole } from './chat-role.enum';
export class CreateRoomDto {
	roomName: string;
	isPublic: boolean;
	password?: string;
}

export const CreateRoomSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	isPublic: Joi.boolean().required(),
	password: Joi.string().min(1).max(32).optional(),
});

export class LeaveRoomDto {
	roomName: string;
}

export const LeaveRoomSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
});

export class JoinRoomDto {
	roomName: string;
	password?: string;
}

export const JoinRoomSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	password: Joi.string().min(1).max(32).optional(),
});


export class ChangeUserRoleDto {
	roomName: string;
	userId: number;
	role: string;
}

export const ChangeUserRoleSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
	role: Joi.string().valid(UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER).required(),
});

export class KickUserDto {
	roomName: string;
	userId: number;
}

export const KickUserSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
})

export class BanUserDto {
	roomName: string;
	userId: number;
}

export const BanUserSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
});

export class UnbanUserDto {
	roomName: string;
	userId: number;
}

export const UnbanUserSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
});

export class MuteUserDto {
	roomName: string;
	userId: number;
	timeout: number;
}

export const MuteUserSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
	timeout: Joi.number().min(30).max(1260).required(),
});

export class UnmuteUserDto {
	roomName: string;
	userId: number;
}

export const UnmuteUserSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
})

export class InviteUserDto {
	roomName: string;
	userId: number;
}

export const InviteUserSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
});

export class SendMessageDto {
	roomName: string;
	message: string;
}

export const SendMessageSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	message: Joi.string().min(1).max(150).required(),
});

export class UpdateRoomDto {
	roomName: string;
	isPublic?: boolean;
	password?: string;
}

export const UpdateRoomSchema = Joi.object({
	roomName: Joi.string().min(1).max(32).required(),
	isPublic: Joi.boolean().optional(),
	password: Joi.string().min(0).max(32).optional(),
});
