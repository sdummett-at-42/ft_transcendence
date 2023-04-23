import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	@MinLength(1)
	@MaxLength(15)
	@IsAlphanumeric()
	name: string;

	@ApiProperty()
	profilePicture: string;

}
