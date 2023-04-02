import { Injectable, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Response } from 'express';
import * as fs from "fs";
import { Player, Game, Square, Circle, BlackHole } from '../entities/game.entities';
import { GameGateway } from '../game.gateway'
import { EventGame } from '../game-event.enum';

@Injectable()
export class LobbyService {
    constructor(private readonly gameGateway: GameGateway) {}

    BaseThreshold = 1000 / 100;

    // TODO
    // recuper par la DB
    nbGame : number = 0;
    users : { player : Player, threshold : number}[] = [];
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

        const index = this.users.findIndex(users => users.player.id === client.data.userId);

        if (index === -1) { // Check if player already in Q
            console.log("DATA =", client.data);
            const player = new Player(client.data);
            this.users.push({ player, threshold : this.BaseThreshold});

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
        const suppr = this.users.findIndex(users => users.player.id === client.data.userId); // check if in users first element us.id == cl.id
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

        let gotMatch : Boolean = false;
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
                    if (this.checkMatch(this.users[i], this.users[j]) === true) { // if yes create game
                        this.lobbyCreateGame(this.users[i], this.users[j]);
                        gotMatch = true;
                        i = this.users.length; // leave loop because users was modified
                        break;
                    }
                }
                // if not match found augment treshold to this.users[i]
                if (gotMatch === true) {
                    gotMatch = false;
                } else {
                    this.users[i].threshold += 5;
                }
                i++;
            }
        }
        // Test solo player

        // else {
        //     console.log("---------TEST");
        //     const player = new Player(this.users[0]);
        //     player.id = this.users[0].id;
        //     console.log("player1:", this.users[0]);
        //     console.log("player2:", player);
        //     console.log("---------ENDTEST");



        //     this.lobbyCreateGame(this.users[0], player);

        // }
    }

    checkMatch(p1 : {player : Player, threshold : number}, p2 : {player : Player, threshold : number}) : Boolean{
        const diff : number = Math.abs(p1.player.elo - p2.player.elo);
        
        // check gap elo
        if (p1.threshold >= diff && p2.threshold >= diff) {
            console.log("match found");
            console.log(p1);
            console.log(p2);
            return true;
        }
        return (false)
    }
    
    // take 2 player, delete user [], generate game
    // lobbyCreateGame(player1 : Player, player2 : Player, server : Server) {
        lobbyCreateGame(p1 : {player : Player, threshold : number}, p2 : {player : Player, threshold : number}) {
            // kick player from users[]
            // create game with p1 && p2, generate map && game
            // when done
            
            console.log("lobbyCreateGame:" , p1, p2);
            // Create game and push in games[]
            const game = new Game(this.nbGame++, p1.player, p2.player);
            this.games.push(game);
            
            // remove player from Users[]
            const remP1 = this.users.findIndex(users => users.player.id === p1.player.id);
            if (remP1 != -1)
                this.users.splice(remP1, 1);
            const remP2 = this.users.findIndex(users => users.player.id === p2.player.id);
            if (remP2 != -1)
                this.users.splice(remP2, 1);

            console.log("Users after lobbycreate:", this.users.length);

            // console.log("Player 1:", p1);
            // console.log("Player 2:", p2);
            
            this.initGame(this.gameGateway.server, game);
            // send to player join game's url
            //this.gameGateway.server

            console.log("+++++++++++++");
            console.log(this.games);
            console.log("+++++++++++++");

            this.gameGateway.server.to(p1.player.socket).to(p2.player.socket).emit("goInGame", game.id);

    // const redirect = `${this.req.protocol}://${this.req.hostname}/game/${game.id}`;
    //const redirect = "http://localhost:3001/game/" + game.id;
    //console.log(redirect);
    //this.response.redirect(redirect);
    }
    // rediriger verls /game/:idGame
    // controller check si game existe
    //  1 = get Game
    //  0 = 404








    // TODO
    // maybe pass user to get his skin ?
    // need map too
    // Add 2 player
    initGame(server : Server, game : Game) {
        // declarer ici tous les elements de la carte dans shapes et mettre le count dans numberElement
        // on count pour numberElement lors reset/scoring

        console.log("-------------");
        console.log("----Game:", game);
        console.log("-------------");

        if (game.shapes.length != 0)
            return ;

        // this.player1 = game.p1;
        // this.player2 = game.p2;

        const distwall = 10;
        game.p1.racket = new Square(distwall , 200, 84, 5);
        game.p2.racket = new Square(game.field.width - distwall , 200, 84, 5);


        game.shapes.push(game.p1.racket);
        game.shapes.push(game.p2.racket);
        game.server = server;

        // TODO
        // definir la map dans init map de service et pas in game

        // Creation Circle : x, y, r
        const circle_01 = new Circle(200, 100, 30);
        game.shapes.push(circle_01);

        // // Creation square : x, y, l, w
        // const square_01 = new Square(400, 240, 50, 100);
        // game.shapes.push(square_01);

        // // Creation square : x, y, l, w
        // const square_02 = new Square(250, 50, 250, 200);
        // game.shapes.push(square_02);

        // // Creation square : x, y, l, w
        // const square_03 = new Square(600, 25, 20, 10);
        // game.shapes.push(square_03);

        // // Creation square : x, y, l, w
        // const square_04 = new Square(50, 120, 50, 100);
        // game.shapes.push(square_04);

        // Creation BlackHole : x, y, l, w
        const BlackHole_01 = new BlackHole(200, 300, 45);
        game.shapes.push(BlackHole_01);

        game.numberElement = game.shapes.length;
        server.emit(EventGame.gameImage, game.shapes);   
    }
}

// TODO
// Gros problem collision si bullet rentre par le coin