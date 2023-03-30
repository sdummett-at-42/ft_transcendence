import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { FriendsService } from "./friends.service";
import { FriendsController } from "./friends.controller";
import { FriendRequestService } from "./friend-request.service";
import { RedisModule } from "../redis/redis.module";
import { FriendsGateway } from "./friends.gateway";

@Module({
	imports: [PrismaModule, RedisModule],
	controllers: [FriendsController],
	providers: [FriendsService, FriendRequestService, FriendsGateway],
	exports: [FriendsService, FriendsGateway],
})
export class FriendsModule { }