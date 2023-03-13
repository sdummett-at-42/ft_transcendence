import { Module } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";
import { PrismaModule } from "nestjs-prisma";

@Module({
	  controllers: [ImagesController],
	  providers: [ImagesService],
	  imports: [PrismaModule],
	  exports: [ImagesService],
})
export class ImagesModule {}