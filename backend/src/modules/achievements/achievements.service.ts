import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class AchievementService {
	constructor(private readonly prisma: PrismaService) { }

	async getAchievements() {
		return await this.prisma.achievement.findMany();
	}
}