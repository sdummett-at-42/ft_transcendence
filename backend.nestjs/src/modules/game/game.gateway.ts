import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket} from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';
import { Shape, Square , Bullet, Circle, Coordonnee , Player} from './entities/game.entities';
import { GameService } from './game.service';

@WebSocketGateway({namespace: 'game'})
export class GameGateway {
  constructor(private readonly gameService: GameService) {}
  @WebSocketServer() server: Server;

  // Connection
  handleConnection(socket: Socket) {
    console.log('New client connected game:', socket.id);
  }

  // Disconnection
  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected game: ${socket.id}\n`);
  }

  // S'abonne a un message -> recevoir tous les msg de correspondante
  @SubscribeMessage('start')
  StartingMessage(client: any, payload: any) : void{
    console.log("start game");
    // Lancement pseudo partie : genere une balle qui se deplace dans la map
    this.gameService.startingGame(this.server);
  }

  @SubscribeMessage('end')
  EndingMessage(client: any, payload: any) : void{
    console.log("end");
    // Lancement pseudo partie : genere une balle qui se deplace dans la map
    this.gameService.stopGame(this.server);
  }

  @SubscribeMessage('Mouvement')
  MouvementMessage(client: any, payload: any) : void{
    const x = payload.x;
    const y = payload.y;
    console.log(`MouvementMessage Detected !`);
    console.log(`Position de la souris : x=${x}, y=${y}`);

      // send new coord
      this.gameService.mouvementGame(this.server, x, y);
  }

  @SubscribeMessage('joinGame')
  JoinMessage(client: any, payload: any) : void{
    console.log(`player has join`);
    console.log(payload);
  }

}
