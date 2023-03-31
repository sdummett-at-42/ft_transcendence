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
                ) {}

    nbGame : number = 0;
    users : Player[] = [];
    games : Game[] = [];
    queueInterval: NodeJS.Timeout;

    // Send html
    async lobbyRoom(res : Response) {
        console.log("Lobby.service : Controller('game')  lobbyRoom");
        const data = await fs.promises.readFile('src/modules/game/Dir/lobby.html', 'utf8');
        res.send(data);
        console.log("USERS:", this.users);
    }

    // Add user [] 
    lobbyJoinQueue(client : Socket) {
        console.log("lobby join Queue:", client.data);
        //TODO check if in game (boolean)

        const index = this.users.findIndex(users => users.id === client.data.userId);

        if (index === -1) { // Check if player already in Q
            console.log("DATA =", client.data);
            const player = new Player(client.data);
            this.users.push(player);

            if (this.queueInterval === undefined) {
                this.queueInterval = setInterval(this.intervalQueueFunction.bind(this), 500);
            }

            // this.lobbyCreateGame(player, player);
        }
    }

    // Delete user []
    lobbyLeaveQueue(client : Socket) {
        //TODO
        // what happen when client logout
        // kick client Q if socket dc

        // check if client in users[] and delete it
        const suppr = this.users.findIndex(users => users.id === client.data.userId); // check if in users first element us.id == cl.id
        if (suppr !== -1)
            this.users.splice(suppr, 1);
    }    
    
    /* *************** *\
    |* Interne functon *|
    \* *************** */
    
    intervalQueueFunction() {
        console.log("queueInterval: check");
        console.log("lenght:" ,this.users.length);
        console.log("users:" ,this.users);
        if (this.users.length === 0) { // if no player in Q
            clearInterval(this.queueInterval);
            this.queueInterval = undefined;
            console.log(this.queueInterval);
        } else if (this.users.length >= 2) { // if >= 2 player in Q
            // check if 2 player match
            let j : number;
            for (let i : number = 0; i < this.users.length - 1; i++) {
                j = i + 1;
                while (j < this.users.length) {
                    if (this.checkMatch(this.users[i], this.users[j]) === true) {
                        // if yes create game
                        this.lobbyCreateGame(this.users[i], this.users[j]);
                        i = this.users.length; // leave loop
                        break;
                    }
                    // if not augment gap to this.users[i]
                }
                // if not match found augment gap to this.users[i]
                i++;
            }
        }
        else {
            console.log("---------TEST");
            const player = new Player(this.users[0]);
            player.id = this.users[0].id;
            console.log("player1:", this.users[0]);
            console.log("player2:", player);
            console.log("---------ENDTEST");



            this.lobbyCreateGame(this.users[0], player);

        }
    }

    checkMatch(p1 : Player, p2 : Player) : Boolean{
        // check gap elo
        // if () {

        //     }
        console.log("match found");
        console.log(p1);
        console.log(p2);

        return (true)
    }
    
    // take 2 player, delete user [], generate game
    // lobbyCreateGame(player1 : Player, player2 : Player, server : Server) {
        lobbyCreateGame(p1 : Player, p2 : Player) {
            // kick player from users[]
            // create game with p1 && p2, generate map && game
            // when done
            
            console.log("lobbyCreateGame:" , p1, p2);
            // Create game and push in games[]
            const game = new Game(this.nbGame++, p1, p2);
            this.games.push(game);
            
            // remove player from Users[]
            const remP1 = this.users.findIndex(users => users.id === p1.id);
            if (remP1 != -1)
                this.users.splice(remP1, 1);
            const remP2 = this.users.findIndex(users => users.id === p1.id);
            if (remP2 != -1)
                this.users.splice(remP2, 1);

            console.log("Users after lobbycreate:", this.users.length);

            // console.log("Player 1:", p1);
            // console.log("Player 2:", p2);
            
            this.gameService.initGame(this.gameGateway.server, game);
            // send to player join game's url
            //this.gameGateway.server
            this.gameGateway.server.to(p1.socket).to(p2.socket).emit("goInGame", game.id);

    // const redirect = `${this.req.protocol}://${this.req.hostname}/game/${game.id}`;
    //const redirect = "http://localhost:3001/game/" + game.id;
    //console.log(redirect);
    //this.response.redirect(redirect);
    }
    // rediriger verls /game/:idGame
    // controller check si game existe
    //  1 = get Game
    //  0 = 404
}