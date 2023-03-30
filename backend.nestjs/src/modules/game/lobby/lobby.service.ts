import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Response } from 'express';
import * as fs from "fs";
import { Player } from '../entities/game.entities';
import { GameService } from '../game.service';
import { GameGateway } from '../game.gateway'

@Injectable()
export class LobbyService {
    constructor(private readonly gameService: GameService,
                private readonly gameGateway: GameGateway) {}

    users : Player[] = [];

    // Send html
    async lobbyRoom(res : Response) {
        console.log("Lobby.service : Controller('game')  lobbyRoom");
        const data = await fs.promises.readFile('src/modules/game/Dir/lobby.html', 'utf8');
        res.send(data);
    }

    // Add user [] 
    lobbyJoinQueue(client : any) {
        //console.log(client.handshake);
        // recuper les infos dont on a besoin du client
        // les convertir en player//
        // push dans users[]
    }

    // Delete user []
    lobbyLeaveQueue(client : any) {
        // check si client est dans users[]
        // si non rien
        // si oui le supprimer
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
    lobbyCreateGame() {
        // kick player from users[]
        // create game with p1 && p2, generate map && game
        // when done


        this.gameService.initGame(this.gameGateway.server, "42");
    } 
}
