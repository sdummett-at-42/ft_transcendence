import { Controller, HttpCode, UseGuards, Get } from "@nestjs/common";
import { AuthenticatedGuard } from "../auth/utils/authenticated.guard";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AchievementService } from "./achievements.service";
import { AchievementEntity } from "../users/entities/achievements.entity";

@Controller('achievements')
@UseGuards(AuthenticatedGuard)
@ApiTags('achievements')
export class AchievementsController {
	constructor(private readonly achievementsService: AchievementService) { }

	@Get()
	@HttpCode(200)
	@ApiOkResponse({type: AchievementEntity, description: 'Return all the availabled achievements'})
	async getAchievements() {
		return this.achievementsService.getAchievements();
	}
}