import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

type BooleanFunction = () => boolean;

interface Achievement {
	// icon: string,
	name: string
	description: string,
	functionHandler: BooleanFunction,
}

@Injectable()
export class AchievementService {

	/* Below is the array that holds each achievement description
	*  and their respective handler function (the function that checks if a
	*  if a user deserve an achievement or not).
	*  You can add/modify an achievement here.
	*  ps: make sure to implement your function handler
	*  ps2: your function must return a boolean, that will indicate to
	*  the checker if we give the achievement to the user or not
	*  ps3: true => give achievement // false => do not give achievement
	*/

	achievementArray: Achievement[] = [
		{
			name: "Achievement name 1",
			description: "This is the description of the achievement 1",
			functionHandler: this.handleAch1,
		},
		{
			name: "Achievement name 2",
			description: "This is the description of the achievement 2",
			functionHandler: this.handleAch2,
		},
	];

	/* achievement.name : "Achievement name 1" */
	private handleAch1(): boolean {
		console.log(`handle 'Achievement name 1' called`);
		return true;
	}

	/* achievement.name : "Achievement name 2" */
	private handleAch2(): boolean {
		console.log(`handle 'Achievement name 2' called`);
		return true;
	}

	/**
	 * /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
	 *
	 *  TO IMPLEMENT A NEW ACHIEVEMENT YOU DO NOT NEED TO TOUCH CODE BELOW /!\
	 *
	 * /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
	 */

	constructor(private readonly prisma: PrismaService) { this.initAchs() }

	private async initAchs() {
		/* Push the achievement infos into DB */
		for (const achievement of this.achievementArray) {
			await this.prisma.achievement.upsert({
				where: { name: achievement.name },
				update: {
					name: achievement.name,
					description: achievement.description,
				},
				create: {
					name: achievement.name,
					description: achievement.description
				}
			})
		}
	}

	async checker(userId: number, achievementName: string) {
		/* Check if user exists and if the user
		*  already have the achievement
		*/
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { achievements: true }
		});
		if (!user)
			return;
		const hasAchievement = user.achievements.some((achievement) => achievement.name === achievementName);
		if (hasAchievement)
			return;

		/* Iterate through the array of achievement to match
		*  the name and then call the achievement handler
		*/
		for (const achievement of this.achievementArray) {
			if (achievement.name === achievementName) {
				const give = achievement.functionHandler();
				/* If the implemented handler returns true, so it means we are
				 * allowed to give the achievement to the user
				*/
				if (give) {
					await this.prisma.user.update({
						where: { id: userId },
						data: { achievements: { connect: { name: achievement.name } } }
					});
				}
				break;
			}
		}
	}

	async getAchievements() {
		return await this.prisma.achievement.findMany();
	}
}