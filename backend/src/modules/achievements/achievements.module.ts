import { Module } from "@nestjs/common";
import { AchievementsController } from "./achievements.controller";
import { AchievementService } from "./achievements.service";
import { PrismaModule } from "nestjs-prisma";

@Module({
	controllers: [AchievementsController],
	providers: [AchievementService],
	imports: [PrismaModule],
	exports: [AchievementService],
})
export class AchievementModule { }