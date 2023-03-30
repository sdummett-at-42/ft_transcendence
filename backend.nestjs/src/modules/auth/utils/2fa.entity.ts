import { ApiProperty } from "@nestjs/swagger";

export class SecretQrCodeEntity {
	@ApiProperty()
	contentType: string;
	@ApiProperty()
	base64Qrcode: string;
}