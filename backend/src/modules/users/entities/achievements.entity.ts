import { User } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class AchievementEntity {

	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	description: string;
}
