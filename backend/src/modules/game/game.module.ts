import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaModule } from "nestjs-prisma";
import { RedisModule } from "../redis/redis.module";
import { LobbyService } from './lobby/lobby.service';
import { FriendsService } from "../friends/friends.service";


@Module({
  imports: [RedisModule, PrismaModule],
  controllers: [GameController],
  providers: [FriendsService, GameService, GameGateway, LobbyService]
})
export class GameModule {}
