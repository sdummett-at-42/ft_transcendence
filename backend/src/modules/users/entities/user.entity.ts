import { User } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UserEntity {

	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	profilePicture: string;

	@ApiProperty()
	elo: number;
}
