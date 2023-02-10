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