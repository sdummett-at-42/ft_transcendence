import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty } from "class-validator";

export class CreateFriendRequestDto {
	@ApiProperty()
	@IsNumber()
	@IsNotEmpty()
	friendId: number;
}
