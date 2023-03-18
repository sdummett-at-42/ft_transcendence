import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'nestjs-prisma';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './utils/fortytwo.strategy';
import { GoogleStrategy } from './utils/google.strategy';
import { SessionSerializer } from './utils/Serializer';

@Module({
	imports: [
		PrismaModule,
		UsersModule,
		PassportModule.register({ session: true}),
		RedisModule,
	],
	controllers: [AuthController],
	providers: [
		FortyTwoStrategy,
		GoogleStrategy,
		SessionSerializer,
		{
			provide: "AUTH_SERVICE",
			useClass: AuthService,
		}	
	],
})
export class AuthModule {}
