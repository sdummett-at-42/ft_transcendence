import { ApiProperty } from "@nestjs/swagger";
import { MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
	@ApiProperty()
	@MaxLength(15)
	@MinLength(1)
	name: string;
}
