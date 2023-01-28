import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'nestjs-prisma';
import { ImagesService } from '../images/images.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
	controllers: [UsersController],
	providers: [UsersService, ImagesService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}],
	imports: [PrismaModule],
	exports: [UsersService],
})
export class UsersModule { }
