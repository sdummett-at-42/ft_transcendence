import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";


@Injectable()
export class ImagesService {
	constructor(private readonly prisma: PrismaService) { }

	async create(imageBase64: string, mimetype: string, name: string, ownerId: number) {
		return this.prisma.image.create({
			data: {
				data: imageBase64,
				name,
				mimetype,
				owner : { connect: { id: ownerId } }
			}
		});
	}

	async findOneImage(ownerId: number) {
		const image = await this.prisma.image.findUnique({ where: { ownerId }});
		if (!image)
			throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
		return image;
	}

	findAllImages() {
		return this.prisma.image.findMany();
	}

	updateImage(imageBase64: string, mimetype: string, ownerId: number) {
		return this.prisma.image.update({
			where: { ownerId },
			data: {
				data: imageBase64,
				mimetype,
			}
		});
	}

	async updateImageToDefault(ownerId: number) {
		const { data, mimetype } = await this.prisma.image.findUnique({ where: { ownerId: 0 }});

		return this.prisma.image.update({
			where: { ownerId },
			data: {
				data,
				mimetype,
			}
		});
	}

	updateImageName(ownerId: number, name: string) {
		return this.prisma.image.update({
			where: { ownerId },
			data: { name }
		});
	}

	removeImage(ownerId: number) {
		return this.prisma.image.delete({ where: { ownerId }});
	}

}