import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaModule } from "nestjs-prisma";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [RedisModule, PrismaModule],
  controllers: [GameController],
  providers: [GameService, GameGateway]
})
export class GameModule {}
