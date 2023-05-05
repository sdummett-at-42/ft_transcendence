import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

type BooleanFunction = (number) => Promise<boolean>;

interface Achievement {
	icon: string,
	name: string
	description: string,
	handler: BooleanFunction;
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
			icon: "",
			name: "Bienvenue champion !",
			description: "Tu as gagné ton premier match ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkWin(userId, 1),
		},
		{
			icon: "",
			name: "Un début prometteur !",
			description: "Tu as gagné 10 matchs ! 🏆",
			handler: async (userId: number) => await this.checkWin(userId, 10),
		},
		{
			icon: "",
			name: "Invincible !",
			description: "Tu as gagné 100 matchs ! 🏆",
			handler: async (userId: number) => await this.checkWin(userId, 100),
		},
		{
			icon: "",
			name: "Pense à te reposer !",
			description: "Tu as gagné 1000 matchs ! 🏆",
			handler: async (userId: number) => await this.checkWin(userId, 1000),
		},
		{
			icon: "",
			name: "Millionnaire !",
			description: "Tu as gagné 10000 matchs ! 🏆",
			handler: async (userId: number) => await this.checkWin(userId, 10000),
		},
		{
			icon: "",
			name: "Ajouter un ami",
			description: "Tu as ajouté un ami ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkFriendAdded(userId, 1),
		},
		{
			icon: "",
			name: "Ajouter 10 amis",
			description: "Tu as ajouté 10 amis ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkFriendAdded(userId, 10),
		},
		{
			icon: "",
			name: "Ajouter 100 amis",
			description: "Tu as ajouté 100 amis ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkFriendAdded(userId, 100),
		},
		{
			icon: "",
			name: "Activer la 2FA",
			description: "Tu as activé la 2FA ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkIf2faEnabled(userId),
		},
		// {
		// 	icon: "",
		// 	name: "Etre premier au classement",
		// 	description: "Tu es premier au classement ! Bravo ! 🏆",
		// 	handler: async (userId: number) => await this.checkRank(userId, 1),
		// },
		// {
		// 	icon: "",
		// 	name: "Etre deuxième au classement",
		// 	description: "Tu es deuxième au classement ! Bravo ! 🏆",
		// 	handler: async (userId: number) => await this.checkRank(userId, 2),
		// },
		// {
		// 	icon: "",
		// 	name: "Etre troisième au classement",
		// 	description: "Tu es troisième au classement ! Bravo ! 🏆",
		// 	handler: async (userId: number) => await this.checkRank(userId, 3),
		// },
		{
			icon: "",
			name: "Atteindre exactement 42 elo",
			description: "Tu as atteint 42 elo ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkFTElo(userId),
		},
		{
			icon: "",
			name: "Atteindre 1100 elo",
			description: "Tu as atteint 1100 elo ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkElo(userId, 1100),
		},
		{
			icon: "",
			name: "Atteindre 1500 elo",
			description: "Tu as atteint 1500 elo ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkElo(userId, 1500),
		},
		{
			icon: "",
			name: "Atteindre 1800 elo",
			description: "Tu as atteint 1800 elo ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkElo(userId, 1800),
		},
		{
			icon: "",
			name: "Atteindre 2000 elo",
			description: "Tu as atteint 2000 elo ! Bravo ! 🏆",
			handler: async (userId: number) => await this.checkElo(userId, 2000),
		}
	];

	private async checkFTElo(userId: number) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		return user.elo === 42;
	}

	private async checkElo(userId: number, elo: number) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		return user.elo >= elo;
	}
	private async checkRank(userId: number, rank: number) {
		const users = await this.prisma.user.findMany({
			select: {
				id: true,
				elo: true,
			},
			orderBy: {
				elo: "desc"
			}
		});
		return users[rank - 1].id === userId;
	}

	private async checkIf2faEnabled(userId: number) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		return user.twofactorIsEnabled;
	}

	private async checkFriendAdded(userId: number, nb: number) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		return user.friends.length >= nb;
	}

	private async checkWin(userId: number, nbMatch: number) {
		const matchesNb = await this.prisma.match.count({
			where: {
				winnerId: userId
			}
		});
		return matchesNb >= nbMatch;
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
					icon: achievement.icon,
					name: achievement.name,
					description: achievement.description,
				},
				create: {
					icon: achievement.icon,
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