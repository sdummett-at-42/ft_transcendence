import { Module } from "@nestjs/common";
import { AchievementsController } from "./achievements.controller";
import { AchievementService } from "./achievements.service";
import { PrismaModule } from "nestjs-prisma";
import { RedisModule } from "../redis/redis.module";

@Module({
	controllers: [AchievementsController],
	providers: [AchievementService],
	imports: [PrismaModule, RedisModule],
	exports: [AchievementService],
})
export class AchievementModule { }