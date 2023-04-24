import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

type BooleanFunction = (number) => Promise<boolean>;

interface Achievement {
	// icon: string,
	name: string
	description: string,
	handler: any; // BooleanFunction,
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
			name: "Bienvenue champion !",
			description: "Tu as gagné ton premier match ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkOneWin(userId),
		},
		{
			name: "Un début prometteur !",
			description: "Tu as gagné 10 matchs ! 🏆",
			handler: async (userId: number) => await this.checkTenWin(userId),
		},
		{
			name: "Invincible !",
			description: "Tu as gagné 100 matchs ! 🏆",
			handler: async (userId: number) => await this.checkHundredWin(userId),
		},
		{
			name: "Pense à te reposer !",
			description: "Tu as gagné 1000 matchs ! 🏆",
			handler: async (userId: number) => await this.checkThousandWin(userId),
		},
		{
			name: "Millionnaire !",
			description: "Tu as gagné 10000 matchs ! 🏆",
			handler: async (userId: number) => await this.checkTenThousandWin(userId),
		},

	];

	private async checkWin(userId: number) {
		return this.prisma.match.count({
			where: {
				winnerId: userId
			}
		});
	}

	private async checkOneWin(userId: number): Promise<boolean> {
		return await this.checkWin(userId) >= 1;
	}

	private async checkTenWin(userId: number): Promise<boolean> {
		return await this.checkWin(userId) >= 10;
	}

	private async checkHundredWin(userId: number): Promise<boolean> {
		return await this.checkWin(userId) >= 100;
	}

	private async checkThousandWin(userId: number): Promise<boolean> {
		return await this.checkWin(userId) >= 1000;
	}

	private async checkTenThousandWin(userId: number): Promise<boolean> {
		return await this.checkWin(userId) >= 10000;
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

	async checker(userId: number) {
		/* Check if user exists and if the user
		*  already have the achievement
		*/
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { achievements: true }
		});
		if (!user)
			return;

		/* Iterate through the array of achievement to match
		*  the name and then call the achievement handler
		*/
		for (const achievement of this.achievementArray) {
			const hasAchievement = user.achievements.some((achs) => achs.name === achievement.name);
			if (!hasAchievement) {
				const give = await achievement.handler(userId);
				/* If the implemented handler returns true, so it means we are
				*  allowed to give the achievement to the user
				*/
				if (give) {
					await this.prisma.user.update({
						where: { id: userId },
						data: { achievements: { connect: { name: achievement.name } } }
					});
				}

			}
		}
	}

	async getAchievements() {
		return await this.prisma.achievement.findMany();
	}
}