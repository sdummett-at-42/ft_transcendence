import { Module } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";
import { PrismaModule } from "nestjs-prisma";
import { UsersModule } from "src/users/users.module";

@Module({
	  controllers: [ImagesController],
	  providers: [ImagesService],
	  imports: [PrismaModule, UsersModule],
	  exports: [ImagesService],
})
export class ImagesModule {}