import { User } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UserEntity implements User {

	@ApiProperty()
	id: number;

	@ApiProperty()
	email: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	friends: User[];

	@ApiProperty()
	profilePicture: string;

	@ApiProperty()
	elo: number;

	@ApiProperty()
	eloHistory: number[];

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
