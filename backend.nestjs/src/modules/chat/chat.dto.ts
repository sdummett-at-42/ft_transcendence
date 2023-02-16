import * as  Joi from 'joi';

export class CreateRoomDto {
	name: string;
	isPublic: boolean;
	password?: string;
}

export const CreateRoomSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	isPublic: Joi.boolean().required(),
	password: Joi.string().min(1).max(32).optional(),
});

export class LeaveRoomDto {
	name: string;
}

export const LeaveRoomSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
});

export class JoinRoomDto {
	name: string;
	password?: string;
}

export const JoinRoomSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	password: Joi.string().min(1).max(32).optional(),
});

export class BanUserDto {
	name: string;
	userId: number;
}

export const BanUserSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
});

export class UnbanUserDto {
	name: string;
	userId: number;
}

export const UnbanUserSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
});

export class MuteUserDto {
	name: string;
	userId: number;
	timeout: number;
}

export const MuteUserSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
	timeout: Joi.number().min(30).max(1260).required(),
});

export class UnmuteUserDto {
	name: string;
	userId: number;
}

export const UnmuteUserSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
})

export class InviteUserDto {
	name: string;
	userId: number;
}

export const InviteUserSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	userId: Joi.number().required(),
});

export class SendMessageDto {
	name: string;
	message: string;
}

export const SendMessageSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	message: Joi.string().min(1).max(150).required(),
});

export class UpdateRoomDto {
	name: string;
	isPublic?: boolean;
	password?: string;
}

export const UpdateRoomSchema = Joi.object({
	name: Joi.string().min(1).max(32).required(),
	isPublic: Joi.boolean().optional(),
	password: Joi.string().min(0).max(32).optional(),
});
