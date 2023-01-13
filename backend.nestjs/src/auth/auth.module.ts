import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { SessionSerializer } from './utils/Serializer';

@Module({
	imports: [PrismaModule, UsersModule],
	controllers: [AuthController],
	providers: [
		GoogleStrategy,
		SessionSerializer,
		{
			provide: "AUTH_SERVICE",
			useClass: AuthService,
		}	
	],
})
export class AuthModule {}
