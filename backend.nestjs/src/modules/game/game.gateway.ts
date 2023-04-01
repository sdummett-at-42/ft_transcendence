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
    this.gameService.handleConnection(socket);
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

    // get game by gameid from client
    const gameId = Number(client.data.ingame); // string to number

    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];

    this.gameService.startingGame(this.server, game);
  }

  @SubscribeMessage(EventGame.gameEnd)
  // Destroy all bullet
  EndingMessage(client: any, payload: any) : void {
    console.log("gateway : end");

    // get game by gameid from client
    const gameId = Number(client.data.ingame); // string to number

    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];

    this.gameService.stopGame(this.server, game);
  }

  // socket.emit("Mouvement", {roomId : room, data : data});
  @SubscribeMessage(EventGame.playerMouvement)
  MouvementMessage(client: any, payload: {roomId : number, data : Coordonnee}) : void {
    // send new coord
    console.log("MouvementMessage");

    // get game by gameid from client
    const gameId = Number(client.data.ingame); // string to number

    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];

    this.gameService.mouvementGame(this.server, game, client, payload.data.x, payload.data.y);
  }

  // When Client connect to socket server
  @SubscribeMessage(EventGame.playerJoinGame)
  JoinGameMessage(client: any, payload: {roomId : string, msg : string}) : void {
    console.log(`Gateway : player has join game`);


    // get game by gameid from client
      const gameId = Number(client.data.ingame); // string to number




      const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
      const game = this.lobbyService.games[indexGame];

      console.log(client.data);
      console.log("----------------------");
      console.log(gameId); // non def
      console.log(indexGame); // -1
      console.log(this.lobbyService.games);
      console.log("----------------------");


    this.gameService.joinGame(this.server, game, client, payload);
  }

  /* ***** *\
  |* lobby *|
  \* ***** */

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
