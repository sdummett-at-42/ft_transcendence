import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket, MessageBody} from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';
import { Shape, Square , Bullet, Circle, Coordonnee , Player} from './entities/game.entities';
import { GameService } from './game.service';
import { EventGame } from './game-event.enum';
import { LobbyService } from './lobby/lobby.service';

@WebSocketGateway({namespace: 'game'})
export class GameGateway {
  //constructor(private readonly gameService: GameService, private readonly lobbyService: LobbyService) {}
  constructor(
    @Inject(forwardRef(() => LobbyService))
    private readonly lobbyService: LobbyService,
    private readonly gameService: GameService,
  ) {}
  
  
  @WebSocketServer() server: Server;

  // Connection
  handleConnection(socket: Socket) {
    console.log('New client connected game:', socket.id);
    //this.gameService.handleConnection(socket);
    //this.gameService.initGame(this.server, socket);
  }
//
  // Disconnection
  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected game: ${socket.id}\n`);
  }

  @SubscribeMessage(EventGame.gameStart)
  // generate bullet and game start
  StartingMessage(client: any, payload: any) : void {
    console.log("gateway : start game");
    this.gameService.startingGame(this.server);
  }

  @SubscribeMessage(EventGame.gameEnd)
  // Destroy all bullet
  EndingMessage(client: any, payload: any) : void {
    console.log("gateway : end");
    this.gameService.stopGame(this.server);
  }

  @SubscribeMessage(EventGame.playerMouvement)
  MouvementMessage(client: any, payload: any) : void {
    // send new coord
    this.gameService.mouvementGame(this.server, payload.x, payload.y);
  }

  @SubscribeMessage(EventGame.playerJoinGame)
  JoinGameMessage(client: any, payload: any) : void {
    console.log(`Gateway : player has join game`);
    console.log(payload);
  }

  @SubscribeMessage(EventGame.playerJoinQueue)
  JoinLobbyMessage(client: any, payload: any) : void {
    console.log(`Gateway : player has join queue`);
    // function check every second if 2 player match
    this.lobbyService.lobbyJoinQueue(client);
  }

  @SubscribeMessage(EventGame.playerLeaveQueue)
  LeaveLobbyMessage(client: any, payload: any) : void {
    console.log(`Gateway : player has leave queue`);
    // function cancel Queue (delete from [] user search)
    this.lobbyService.lobbyLeaveQueue(client);
  }

  // this.gameService.initGame(this.server, socket);

}
