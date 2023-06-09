import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as  Joi from 'joi';
import { PrismaModule } from 'nestjs-prisma';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FriendsModule } from './modules/friends/friends.module';
import { ImagesModule } from './modules/images/images.module';
import { RedisModule } from './modules/redis/redis.module';
import { UsersModule } from './modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { GameModule } from './modules/game/game.module';
import { AchievementModule } from './modules/achievements/achievements.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				POSTGRES_USER: Joi.string().required(),
				POSTGRES_PASSWORD: Joi.string().required(),
				SESSION_SECRET: Joi.string().required(),
				BACKENDPORT: Joi.number().required(),
				THROTTLER_TTL: Joi.number().required(),
				THROTTLER_LIMIT: Joi.number().required(),
				REDIS_URL: Joi.string().required(),
				FORTYTWO_CLIENT_ID: Joi.string().required(),
				FORTYTWO_CLIENT_SECRET: Joi.string().required(),
				FORTYTWO_CALLBACK_URL: Joi.string().required(),
				ISSUER: Joi.string().required(),
				FRONTENDURL: Joi.string().required(),
				BACKENDURL: Joi.string().required(),
			})
		}),
		AuthModule,
		PrismaModule,
		RedisModule,
		UsersModule,
		ImagesModule,
		FriendsModule,
		ChatModule,
		AchievementModule,
		PassportModule.register({ session: true }),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				ttl: configService.get('THROTTLER_TTL'),
				limit: configService.get('THROTTLER_LIMIT'),
			}),
		}),
		GameModule,
	],
	providers: [AppService],
})
export class AppModule {}
