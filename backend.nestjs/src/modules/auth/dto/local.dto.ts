import { ApiProperty } from "@nestjs/swagger";

export class LocalDto {
	@ApiProperty()
	auth: string;

	@ApiProperty()
	username: string;

	@ApiProperty()
	email: string;

	@ApiProperty()
	password: string;
}
