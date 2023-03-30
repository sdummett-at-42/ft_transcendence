import { Injectable, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Response } from 'express';
import * as fs from "fs";
import { Player, Game } from '../entities/game.entities';
import { GameService } from '../game.service';
import { GameGateway } from '../game.gateway'

@Injectable()
export class LobbyService {
    constructor(private readonly gameService: GameService,
                private readonly gameGateway: GameGateway,
                @Inject('Response') private readonly response: Response) {}

    nbGame : number = 0;
    users : Player[] = [];
    games : Game[] = [];

    // Send html
    async lobbyRoom(res : Response) {
        console.log("Lobby.service : Controller('game')  lobbyRoom");
        const data = await fs.promises.readFile('src/modules/game/Dir/lobby.html', 'utf8');
        res.send(data);
    }
//
    // Add user [] 
    lobbyJoinQueue(client : Socket) {
        console.log("lobby join Queue:", client.data);

        // check if player already in Q
        //TODO check if in game (boolean)
        const index = this.users.indexOf(client.data.userId);
        if (index === -1) {
            const player = new Player(client.data);
            this.users.push(player);
        }
    }

    // Delete user []
    lobbyLeaveQueue(client : Socket) {
        // check if client in users[] and delete it
        const suppr = this.users.indexOf(client.data.userId);
        if (suppr !== -1)
            this.users.slice(suppr, 1);
    }

    /* *************** *\
    |* Interne functon *|
    \* *************** */

    // check every second if 2 player in user [] are matchable
    // trier par elo pour optimiser ?
    lobbyCheckQueue() {

    }

    // take 2 player, delete user [], generate game
    // lobbyCreateGame(player1 : Player, player2 : Player, server : Server) {
    lobbyCreateGame(p1 : Player, p2 : Player) {
        // kick player from users[]
        // create game with p1 && p2, generate map && game
        // when done
        
        // Create game and push in games[]
        const game = new Game(this.nbGame++, p1, p2);
        this.games.push(game);
        
        // remove player from Users[]
        const remP1 = this.users.indexOf(p1);
        this.users.slice(remP1, 1);
        const remP2 = this.users.indexOf(p2);
        this.users.slice(remP2, 1);
        
        this.gameService.initGame(this.gameGateway.server, game);
        this.response.redirect("/game/test")
    }
    // rediriger verls /game/:idGame
    // controller check si game existe
    //  1 = get Game
    //  0 = 404
}
