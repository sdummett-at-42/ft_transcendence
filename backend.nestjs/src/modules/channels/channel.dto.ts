import { IsString, IsNotEmpty, MaxLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	name: string;

	@IsBoolean()
	isPublic: boolean;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	password?: string;
}

export class UpdateChannelDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	name?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	password?: string;

	@IsOptional()
	@IsBoolean()
	isPublic?: boolean;
}
