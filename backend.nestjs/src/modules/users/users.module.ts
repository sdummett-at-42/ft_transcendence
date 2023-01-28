import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'nestjs-prisma';
import { ImagesService } from '../images/images.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ImagesService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
