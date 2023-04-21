import { ApiProperty } from "@nestjs/swagger";
import { MaxLength } from "class-validator";

export class UpdateUserDto {
	@ApiProperty()
	@MaxLength(15)
	name: string;
}
