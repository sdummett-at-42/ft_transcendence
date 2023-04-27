import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { FriendsService } from "./friends.service";
import { FriendsController } from "./friends.controller";
import { FriendRequestService } from "./friend-request.service";
import { RedisModule } from "../redis/redis.module";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { AchievementService } from "../achievements/achievements.service"


@Module({
	imports: [PrismaModule, RedisModule],
	controllers: [FriendsController],
	providers: [FriendsService, FriendRequestService, NotificationsGateway, AchievementService],
	exports: [FriendsService, NotificationsGateway],
})
export class FriendsModule { }