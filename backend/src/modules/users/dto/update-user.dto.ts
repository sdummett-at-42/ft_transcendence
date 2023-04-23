import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
	@ApiProperty()
	@MaxLength(15)
	@MinLength(1)
	@IsAlphanumeric()
	name: string;
}
