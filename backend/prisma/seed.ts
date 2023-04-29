import { PrismaService } from "nestjs-prisma";
import { LoginMethod } from "@prisma/client";

const prisma = new PrismaService();
async function main() {

	// const fs = require('fs');
	// const imageBuffer = fs.readFileSync('./default-profile-picture.png');
	// const imageBase64 = imageBuffer.toString('base64');
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
			email: "DUMMY EMAIL",
			name: "DUMMY NAME",
			minName: "DUMMY NAME".toLowerCase(),
			loginMethod: LoginMethod.LOCAL,
		}
	})
	await prisma.user.update({
		where: { id: 0 },
		data: {
			profilePicture: `${process.env.BACKENDURL}/api/images/${defaultUser.id}`
		}
	})
	const defaultImage = await prisma.image.upsert({
		where: { ownerId: 0 },
		update: {},
		create: {
			data: "DEFAULT IMAGE DUMMY DATA",
			name: "default-profile-picture.png",
			mimetype: "image/png",
			owner: { connect: { id: 0 } }
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