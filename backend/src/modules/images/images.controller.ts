import { Controller, Delete, Get, Patch, ParseIntPipe, Param, Res, Req, UploadedFile, UseGuards, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors } from "@nestjs/common";
import { AuthenticatedGuard } from "src/modules/auth/utils/authenticated.guard";
import { BodySizeGuard } from "src/shared/body-size.guard";
import { ApiBadRequestResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiPayloadTooLargeResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { HttpCode } from "@nestjs/common";

@ApiTags('images')
@UseGuards(AuthenticatedGuard)
@Controller('images')
export class ImagesController {
	constructor(private readonly images: ImagesService) { }

	@Get(':id')
	@HttpCode(200)
	@ApiOkResponse({ description: 'Returns the image' })
	@ApiNotFoundResponse({ description: 'Image not found' })
	async getImage(@Res() res, @Param('id', ParseIntPipe) id: number) {
		const image = await this.images.findOneImage(id);
		res.set({
			'Content-Type': image.mimetype,
			'Content-disposition': `inline; filename=user-${image.name}.${image.mimetype}`
		});
		return res.send(Buffer.from(image.data, 'base64'));
	}

	@Patch(':id')
	@HttpCode(200)
	//@UseGuards(BodySizeGuard)
	@UseInterceptors(FileInterceptor('image'))
	@ApiOkResponse({ description: 'Updates the image.' })
	//@ApiPayloadTooLargeResponse({ description: 'The file is too large. The maximum file size is 2KB' })
	@ApiBadRequestResponse({ description: 'Invalid file type. It must be a PNG or JPEG file.' })
	@ApiUnauthorizedResponse({ description: 'You are not authorized to update this image' })
	async updateImage(@UploadedFile() image: any, @Param('id', ParseIntPipe) id: number, @Req() request) {
		if (request.user.id != id)
			throw new HttpException('You are not authorized to update this image', HttpStatus.UNAUTHORIZED);
		const{ buffer } = image;
		const imageBase64 = buffer.toString('base64');
		if (image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg')
			throw new BadRequestException('Invalid image type, server supports only PNG and JPEG images');

		// const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
		// const jpegSignature = [0xFF, 0xD8, 0xFF];
		// const imageSignature = imageBase64.substring(0, 24).split(',').map((s) => parseInt(s, 16));
		// if (image.mimetype === 'image/png' && !imageSignature.every((v, i) => v === pngSignature[i]))
		// 	throw new BadRequestException('Invalid image type');
		// if (image.mimetype === 'image/jpeg' && !imageSignature.every((v, i) => v === jpegSignature[i]))
		// 	throw new BadRequestException('Invalid image type');

		return this.images.updateImage(imageBase64, image.mimetype, id);
	}

	@Delete(':id')
	@HttpCode(204)
	@ApiNoContentResponse({ description: 'Deletes the image' })
	@ApiUnauthorizedResponse({ description: 'You are not authorized to delete this image' })
	async deleteImage(@Param('id', ParseIntPipe) id: number, @Req() request) {
		if (request.user.id != id)
			throw new HttpException('You are not authorized to delete this image', HttpStatus.UNAUTHORIZED);
		return this.images.updateImageToDefault(id);
	}

}
