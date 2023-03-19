import { Module } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";
import { PrismaModule } from "nestjs-prisma";
import { RedisModule } from "../redis/redis.module";

@Module({
	  controllers: [ImagesController],
	  providers: [ImagesService],
	  imports: [PrismaModule, RedisModule],
	  exports: [ImagesService],
})
export class ImagesModule {}