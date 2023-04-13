import { PrismaService } from "nestjs-prisma";
import { LoginMethod } from "@prisma/client";

const prisma = new PrismaService();
async function main() {

	/*/ Achievement creation occurs here /*/

	await prisma.achievement.upsert({
		where: { name: "Achievement number 1" },
		update: {},
		create: {
			name: "Achievement number 1",
			description: "This is the achievement, its the worst one."
		}
	})
	await prisma.achievement.upsert({
		where: { name: "Achievement blbla" },
		update: {},
		create: {
			name: "Achievement blbla",
			description: "Lorem opossum"
		}
	})
	await prisma.achievement.upsert({
		where: { name: "Woooooow" },
		update: {},
		create: {
			name: "Woooooow",
			description: "This is the Woooow achievement, Its woooah!"
		}
	})
	await prisma.achievement.upsert({
		where: { name: "April Fool" },
		update: {},
		create: {
			name: "April Fool",
			description: "This isnt an achievement"
		}
	})
	await prisma.achievement.upsert({
		where: { name: "Transcendence" },
		update: {},
		create: {
			name: "Transcendence",
			description: "We are transcending"
		}
	})

	/*/ End of achievement creation /*/

	const fs = require('fs');
	// const imageBuffer = fs.readFileSync('./default-profile-picture.png');
	// const imageBase64 = imageBuffer.toString('base64');
	const imageBase64 = "ABC";

	// Default user
	const defaultUser = await prisma.user.upsert({
		where: { id: 0 },
		update: {},
		create: {
			id: 0,
			email: "default",
			name: "default-user",
			loginMethod: LoginMethod.LOCAL,
		}
	})
	await prisma.user.update({
		where: { id: 0 },
		data: {
			profilePicture: `http://localhost:3001/api/images/${defaultUser.id}`
		}
	})
	const defaultImage = await prisma.image.upsert({
		where: { ownerId: 0 },
		update: {},
		create: {
			data: imageBase64,
			name: "default-profile-picture.png",
			mimetype: "image/png",
			owner: { connect: { id: 0 } }
		}
	})

	// Alice
	const alice = await prisma.user.upsert({
		where: { email: "alice@prisma.io" },
		update: {},
		create: {
			email: "alice@prisma.io",
			name: "Alice",
			loginMethod: LoginMethod.LOCAL,
		}
	})
	await prisma.user.update({
		where: { id: alice.id },
		data: {
			profilePicture: `http://localhost:3001/api/images/${alice.id}`
		}
	})
	const aliceimage = await prisma.image.upsert({
		where: { ownerId: alice.id },
		update: {},
		create: {
			data: imageBase64,
			name: alice.name,
			mimetype: "image/png",
			owner: { connect: { id: alice.id } },
		}
	})

	// Bob
	const bob = await prisma.user.upsert({
		where: { email: "bob@prisma.io" },
		update: {},
		create: {
			email: "bob@prisma.io",
			name: "Bob",
			loginMethod: LoginMethod.LOCAL,
		}
	})
	await prisma.user.update({
		where: { id: bob.id },
		data: {
			profilePicture: `http://localhost:3001/api/images/${bob.id}`
		}
	})
	const bobimage = await prisma.image.upsert({
		where: { ownerId: bob.id },
		update: {},
		create: {
			data: imageBase64,
			name: bob.name,
			mimetype: "image/png",
			owner : { connect: { id: bob.id } },
		}
	})

	// Friend request
	const friendRequestAliceToBob = await prisma.friendRequest.upsert({
		where: {
			senderId_receiverId: {
				senderId: alice.id,
				receiverId: bob.id
			}
		},
		update: {},
		create: {
			sender: { connect: { id: alice.id } },
			receiver: { connect: { id: bob.id } },
		}
	})

	// Charlie
	const charlie = await prisma.user.upsert({
		where: { email: "charlie@prisma.io" },
		update: {},
		create: {
			email: "charlie@prisma.io",
			name: "Charlie",
			loginMethod: LoginMethod.LOCAL,
		}
	})
	await prisma.user.update({
		where: { id: charlie.id },
		data: {
			profilePicture: `http://localhost:3001/api/images/${charlie.id}`
		}
	})
	const charlieimage = await prisma.image.upsert({
		where: { ownerId: charlie.id },
		update: {},
		create: {
			data: imageBase64,
			name: charlie.name,
			mimetype: "image/png",
			owner: { connect: { id: charlie.id } },
		}
	})

	// Friend request
	// const BobAddCharlie = await prisma.friend.upsert({
	// 	where: {
	// 		userId_friendId: {
	// 			userId: bob.id,
	// 			friendId: charlie.id
	// 		}
	// 	},
	// 	update: {},
	// 	create: {
	// 		user: { connect: { id: bob.id } },
	// 		friend: { connect: { id: charlie.id } },
	// 	}
	// })

	// // Friend request
	// const BobAddAlice = await prisma.friend.upsert({
	// 	where: {
	// 		userId_friendId: {
	// 			userId: bob.id,
	// 			friendId: alice.id
	// 		}
	// 	},
	// 	update: {},
	// 	create: {
	// 		user: { connect: { id: bob.id } },
	// 		friend: { connect: { id: alice.id } },
	// 	}
	// })

	// const CharlieAddBob = await prisma.friend.upsert({
	// 	where: { userId_friendId: {
	// 		userId: charlie.id,
	// 		friendId: bob.id }},
	// 	update: {},
	// 	create: {
	// 		user: { connect: { id: charlie.id } },
	// 		friend: { connect: { id: bob.id } },
	// 	}
	// })

	// const findAllFriends = await prisma.friend.findMany({
	// 	where: { userId: bob.id },
	// 	select: {
	// 		friend: {
	// 			select: {
	// 				id: true,
	// 				name: true,
	// 				profilePicture: true,
	// 				elo: true

	// 			}
	// 		}
	// 	},
	// })
	// console.log(findAllFriends)

	// const AliceSendRequestToMe = await prisma.friendRequest.upsert({
	// 	where: {
	// 		senderId_receiverId: {
	// 			senderId: alice.id,
	// 			receiverId: 4
	// 		}
	// 	},
	// 	update: {},
	// 	create: {
	// 		sender: { connect: { id: alice.id } },
	// 		receiver: { connect: { id: 4 } },
	// 	}
	// })
}

main().then(async () => {
	await prisma.$disconnect()
})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})