import { ApiProperty } from "@nestjs/swagger";

export class UserMeEntity {

	@ApiProperty()
	id: number;

	@ApiProperty()
	email: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	profilePicture: string;

	@ApiProperty()
	elo: number;
}
