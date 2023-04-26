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
    console.log("You are connected to socket game");
    // console.log('New client connected game:', socket.id);

    // console.log("client handshake", socket.handshake.auth.url);

    const res = await this.lobbyService.handleConnection(socket);
    if (res !== null && this.gameService.onMatch(res.game)) 
    {
      // console.log("resume game");
      // this.gameService.joinGame(this.server, res.game, socket, res.game.roomId);
      this.gameService.resumeGame(res.game, res.id);
    }
    else{
      if (res !== null) {
        const game = res.game;
        game.server.to(socket.id).emit(EventGame.gameVictory, {type : game.typewin, winner : game.winner, loser : game.loser});
      }

    }
  }

  // Disconnection
  async handleDisconnect(socket: Socket) {
    // console.log(`Client disconnected game: ${socket.id}`);
    // return any or {game : Game, id : number}
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
    // console.log("MouvementMessage");

    // get game by gameid from client
    const gameId = Number(payload.roomId); // string to number
    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];
    if (game === undefined || !this.gameService.onMatch(game))
      return ;

    this.gameService.mouvementGame(this.server, game, client, payload.data.x, payload.data.y);
  }

  @SubscribeMessage(EventGame.playerClickCanvas)
  ClickCanvasMessage(client: any, roomId : string) : void {
    // console.log("click");
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
    // console.log(`Gateway : player has join game`);
    // console.log("roomId", roomId);
  
    // get game by gameid from client
    const gameId = Number(roomId); // string to number

    // console.log("gameId fromt client data:", gameId);
    const indexGame = this.lobbyService.games.findIndex(games => games.id === gameId);
    const game = this.lobbyService.games[indexGame];
    
    if (game === undefined || !this.gameService.onMatch(game)) {
      console.log("No game join");
      if (game === undefined)
        console.log("game undefined");
      else
        console.log("pas en match")
      return ;
    }
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
  lobbySendInvitGame(client: any, idTarget : number) : void {
    this.lobbyService.lobbySendInvitGame(client, idTarget);
  }

  @SubscribeMessage(EventGame.lobbyResponseInvitGame)
  lobbyResponseInvitGame(client: any, data : {p1 : number, p2 : number, res : Boolean}) : void {
    this.lobbyService.lobbyResponseInvitGame(client, data);
  }

  @SubscribeMessage("testGame")
  testGame(client: any) : void {
    console.log("*********************")
    console.log("*********************")
    console.log("*********************")
    console.log("*********************")
    console.log("*********************")
    console.log("*********************")
    console.log("*********************")
  }
}
