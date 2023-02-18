import { Controller, Delete, Get, Patch, ParseIntPipe, Param, Res, UploadedFile, UseGuards, BadRequestException } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors } from "@nestjs/common";
import { AuthenticatedGuard } from "src/modules/auth/utils/authenticated.guard";
import { ManageGuard } from "src/shared/manage.guard";
import { BodySizeGuard } from "src/shared/body-size.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('images')
@Controller('images')
export class ImagesController {
	constructor(private readonly images: ImagesService) { }

	@Get(':id')
	@UseGuards(AuthenticatedGuard)
	async getImage(@Res() res, @Param('id', ParseIntPipe) id: number) {
		const image = await this.images.findOneImage(id);
		res.set({
			'Content-Type': image.mimetype,
			'Content-disposition': `inline; filename=user-${image.name}.${image.mimetype}`
		});
		return res.send(Buffer.from(image.data, 'base64'));
	}

	@Patch(':id')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	@UseGuards(BodySizeGuard)
	@UseInterceptors(FileInterceptor('file'))
	async updateImage(@UploadedFile() file: any, @Param('id', ParseIntPipe) id: number) {
		const{ buffer } = file;
		const imageBase64 = buffer.toString('base64');
		if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg')
			throw new BadRequestException('Invalid file type');

		const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
		const jpegSignature = [0xFF, 0xD8, 0xFF];
		const fileSignature = imageBase64.substring(0, 24).split(',').map((s) => parseInt(s, 16));
		if (file.mimetype === 'image/png' && !fileSignature.every((v, i) => v === pngSignature[i]))
			throw new BadRequestException('Invalid file type');
		if (file.mimetype === 'image/jpeg' && !fileSignature.every((v, i) => v === jpegSignature[i]))
			throw new BadRequestException('Invalid file type');

		return this.images.updateImage(imageBase64, file.mimetype, id);
	}

	@Delete(':id')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	async deleteImage(@Param('id', ParseIntPipe) id: number) {
		return this.images.updateImageToDefault(id);
	}

}