import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { RedisModule } from "../redis/redis.module";
import { ChatService } from "./chat.service";

@Module({
	imports: [RedisModule, PrismaModule],
<<<<<<< HEAD
	controllers: [],
=======
	controllers: [FileController],
>>>>>>> wlo
	providers: [ChatService],
	exports: [ChatService],
})
export class ChatModule {}