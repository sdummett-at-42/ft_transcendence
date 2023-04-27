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
  async handleConnection(socket: Socket) {
    const res = await this.lobbyService.handleConnection(socket);
    if (res !== null && this.gameService.onMatch(res.game)) 
      this.gameService.resumeGame(res.game, res.id);
    else {
      if (res !== null) {
        const game = res.game;
        game.server.to(socket.id).emit(EventGame.gameVictory, {type : game.typewin, winner : game.winner, loser : game.loser});
      }
    }
  }

  // Disconnection
  async handleDisconnect(socket: Socket) {
    const res = await this.lobbyService.handleDisconnection(socket);
    if (res !== null && this.gameService.onMatch(res.game))
      this.gameService.pauseGame(res.game, res.id);
    else
      this.lobbyService.lobbyLeaveQueue(socket);
  }

  /* **** *\
  |* game *|
  \* **** */

  // socket.emit("Mouvement", {roomId : room, data : data});
  @SubscribeMessage(EventGame.playerMouvement)
  MouvementMessage(client: any, payload: {roomId : number, data : Coordonnee}) : void {
    const gameId = Number(payload.roomId);
    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];
    if (game === undefined || !this.gameService.onMatch(game))
      return ;

    this.gameService.mouvementGame(this.server, game, client, payload.data.x, payload.data.y);
  }

  @SubscribeMessage(EventGame.playerClickCanvas)
  ClickCanvasMessage(client: any, roomId : string) : void {
    // get game by gameid from client
    const gameId = Number(roomId);
    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];

    if (game === undefined || !this.gameService.onMatch(game))
      return ;
    this.gameService.clickGame(game, client);

  }

  // When Client connect to socket server
  @SubscribeMessage(EventGame.playerJoinGame)
  JoinGameMessage(client: any, roomId : string) : void {
    const gameId = Number(roomId);
    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];
    if (game === undefined || !this.gameService.onMatch(game))
      return ;
    this.gameService.joinGame(this.server, game, client, "game" + roomId);
  }

  /* ***** *\
  |* lobby *|
  \* ***** */

  // button join/lave Q
  @SubscribeMessage(EventGame.playerJoinQueue)
  JoinLobbyMessage(client: any, data : any) : void {
    this.lobbyService.lobbyJoinQueue(client, data.type);
  }

  @SubscribeMessage(EventGame.playerLeaveQueue)
  LeaveLobbyMessage(client: any) : void {
    this.lobbyService.lobbyLeaveQueue(client);
  }

  // invitation Game

  @SubscribeMessage(EventGame.lobbySendInvitGame)
  lobbySendInvitGame(client: any, data : {idTarget : number, type : string}) : void {
    this.lobbyService.lobbySendInvitGame(client, data.idTarget, data.type);
  }

  @SubscribeMessage(EventGame.lobbyResponseInvitGame)
  lobbyResponseInvitGame(client: any, data : {client : number, res : Boolean, type : string}) : void {
    this.lobbyService.lobbyResponseInvitGame(client, data);
  }
}
