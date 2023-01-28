import { Controller, Delete, Get, Patch, ParseIntPipe, Param, Res, UploadedFile, UseGuards } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors } from "@nestjs/common";
import { AuthenticatedGuard } from "src/modules/auth/utils/authenticated.guard";
import { ManageGuard } from "src/shared/manage.guard";
import { BodySizeGuard } from "src/shared/body-size.guard";

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
		return this.images.updateImage(imageBase64, file.mimetype, id);
	}

	@Delete(':id')
	@UseGuards(AuthenticatedGuard)
	@UseGuards(ManageGuard)
	async deleteImage(@Param('id', ParseIntPipe) id: number) {
		return this.images.updateImageToDefault(id);
	}

}