import { ApiProperty } from "@nestjs/swagger";
import { MaxLength } from "class-validator";

export class CreateUserDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	@MaxLength(15)
	name: string;

	@ApiProperty()
	friends?: number[]
}
