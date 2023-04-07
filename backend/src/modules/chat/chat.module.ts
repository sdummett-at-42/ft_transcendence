import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { RedisModule } from "../redis/redis.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { FileController } from "./file.controller";

@Module({
	imports: [RedisModule, PrismaModule],
	controllers: [FileController],
	providers: [ChatService],
	exports: [ChatService],
})
export class ChatModule {}