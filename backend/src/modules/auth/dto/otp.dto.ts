import { ApiProperty } from "@nestjs/swagger";
import { MaxLength, MinLength } from "class-validator";

export class OtpDto {
	@ApiProperty()
	@MaxLength(6)
	@MinLength(6)
	otp: string
}
