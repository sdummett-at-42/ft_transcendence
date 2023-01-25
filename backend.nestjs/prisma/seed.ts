import { PrismaService } from "nestjs-prisma";

const prisma = new PrismaService();
async function main() {
	const alice = await prisma.user.upsert({
		where: { email: "alice@prisma.io" },
		update: {},
		create: {
			email: "alice@prisma.io",
			name: "Alice",
			profilePicture: "https://example.com/alice.jpg",
		}
	})

	const bob = await prisma.user.upsert({
		where: { email: "bob@prisma.io" },
		update: {},
		create: {
			email: "bob@prisma.io",
			name: "Bob",
			profilePicture: "https://example.com/bob.jpg",
			}
		})

	const friendRequestAliceToBob = await prisma.friendshipRequest.upsert({
		where: { senderId_receiverId: { 
			senderId: alice.id,
			receiverId: bob.id  }},
		update: {},
		create: {
			sender: { connect: { id: alice.id } },
			receiver: { connect: { id: bob.id } },
		}
	})

	const charlie = await prisma.user.upsert({
		where: { email: "charlie@prisma.io" },
		update: {},
		create: {
			email: "charlie@prisma.io",
			name: "Charlie",
			profilePicture: "https://example.com/charlie.jpg",
		}
	})
	const BobAddCharlie = await prisma.friend.upsert({
		where: { userId_friendId: {
			userId: bob.id,
			friendId: charlie.id }},
		update: {},
		create: {
			user: { connect: { id: bob.id } },
			friend: { connect: { id: charlie.id } },
		}
	})
}

main().then(async () => {
	await prisma.$disconnect()
})
.catch(async (e) => {
	console.error(e)
	await prisma.$disconnect()
	process.exit(1)
})