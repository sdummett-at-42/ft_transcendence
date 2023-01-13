import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	displayName: string;
}
