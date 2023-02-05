import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { PrismaModule } from 'nestjs-prisma';

@Module({
	controllers: [ChannelsController],
	providers: [ChannelsService],
	imports: [PrismaModule],
	exports: [ChannelsService],
})
export class ChannelsModule {}