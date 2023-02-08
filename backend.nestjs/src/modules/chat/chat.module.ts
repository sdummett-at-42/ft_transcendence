import { Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { FileController } from "./file.controller";

@Module({
	imports: [RedisModule],
	controllers: [FileController],
	providers: [ChatService, ChatGateway],
	exports: [ChatService],
})
export class ChatModule {}