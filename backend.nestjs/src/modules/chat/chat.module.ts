import { Module } from "@nestjs/common";
import { ChannelsModule } from "../channels/channels.module";
import { RedisModule } from "../redis/redis.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { FileController } from "./file.controller";

@Module({
	imports: [RedisModule, ChannelsModule],
	controllers: [FileController],
	providers: [ChatService, ChatGateway],
	exports: [ChatService],
})
export class ChatModule {}