import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { FriendsService } from "./friends.service";
import { FriendsController } from "./friends.controller";
import { FriendRequestService } from "./friend-request.service";

@Module({
	imports: [PrismaModule],
	controllers: [FriendsController],
	providers: [FriendsService, FriendRequestService],
	exports: [FriendsService],
})
export class FriendsModule { }