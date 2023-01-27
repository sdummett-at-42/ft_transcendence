import { randomBytes } from 'crypto';
import { PrismaService } from 'nestjs-prisma';

export async function generateUsername(): Promise<string> {
	const prisma = new PrismaService();
	let buffer = randomBytes(10);
    let name = 'player-' + buffer.toString('hex');
	let user = await prisma.user.findUnique({ where: { name } });
	while (user) {
		console.log('user already exists');
		name = 'player-' + buffer.toString('hex');
		user = await prisma.user.findUnique({ where: { name } });
	}
	return name;
}
