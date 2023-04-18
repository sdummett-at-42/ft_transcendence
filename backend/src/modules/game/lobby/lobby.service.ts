import { Injectable, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/modules/redis/redis.service';
import { Response } from 'express';
import * as fs from "fs";
import { Player, Game, Square, Circle, BlackHole } from '../entities/game.entities';
import { GameGateway } from '../game.gateway'
import { EventGame } from '../game-event.enum';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class LobbyService {
    constructor(private readonly gameGateway: GameGateway,
                private readonly redis: RedisService,
                private readonly prisma: PrismaService ){}

    BaseThreshold = 1000 / 100;

    // TODO
    // Ajouter liste player en jeu

    nbGame : number = 0;
    users : { player : Player, threshold : number}[] = [];
    games : Game[] = [];
    queueInterval: NodeJS.Timeout;

    // Send html
    async lobbyRoom(res : Response) {
        // console.log("Lobby.service : Controller('game')  lobbyRoom");
        // const data = await fs.promises.readFile('src/modules/game/Dir/lobby.html', 'utf8');
        // res.send(data);
        //  console.log("USERS:", this.users);
    }

    // Add user [] 
    lobbyJoinQueue(client : Socket) {
        // console.log("lobby join Queue:", client.data);
        //TODO check if in game (boolean)

        const index = this.users.findIndex(users => users.player.id === client.data.userId);

        if (index === -1) { // Check if player already in Q
            // console.log("DATA =", client.data);
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
        // console.log("queueInterval: check");
        // console.log("lenght:" ,this.users.length);
        // console.log("users:" ,this.users);

        let gotMatch : Boolean = false;
        if (this.users.length === 0) { // if no player in Q
            clearInterval(this.queueInterval);
            this.queueInterval = undefined;
            // console.log(this.queueInterval);
        } else if (this.users.length >= 2) { // if >= 2 player in Q
            // check if 2 player match
            let j : number;
            for (let i : number = 0; i < this.users.length; i++) {
                // console.log(this.users.length);
                // console.log("i = ", i);
                j = i + 1;
                while (j < this.users.length) {
                    if (this.checkMatch(this.users[i], this.users[j]) === true) { // if yes create game
                        this.lobbyCreateGame(this.users[i], this.users[j]);
                        gotMatch = true;
                        i = this.users.length; // leave loop because users was modified
                        break;
                    }
                    j++;
                }
                // if not match found augment treshold to this.users[i]
                if (gotMatch === true) {
                    gotMatch = false;
                } else {
                    this.users[i].threshold += 5;
                }
                //i++;
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
            // console.log("match found");
            // console.log(p1);
            // console.log(p2);
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
            
            //console.log("lobbyCreateGame:" , p1, p2);


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

            // console.log("Users after lobbycreate:", this.users.length);

            // console.log("Player 1:", p1);
            // console.log("Player 2:", p2);
            
            this.initGame(this.gameGateway.server, game);
            // send to player join game's url
            //this.gameGateway.server

            // console.log("+++++++++++++");
            // console.log(this.games);
            // console.log("+++++++++++++");

            const p1Socket = p1.player.socket;
            const p2Socket = p2.player.socket;

            p1.player.socket = undefined;
            p2.player.socket = undefined;

            this.gameGateway.server.to(p1Socket).to(p2Socket).emit(EventGame.lobbyGoGame , game.id);

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

        // console.log("-------------");
        // console.log("----Game:", game);
        // console.log("-------------");

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



    /* *************** *\
    |* connect functon *|
    \* *************** */

    private extractString(inputString: string): string {
		if (!inputString)
			return '';

		const prefix = 's:';
		const suffix = '.';
		const startIndex = inputString.indexOf(prefix);
		const endIndex = inputString.indexOf(suffix, startIndex + prefix.length);

		if (startIndex !== -1 && endIndex !== -1)
			return inputString.substring(startIndex + prefix.length, endIndex);
		return '';
	}

    async handleConnection(socket : Socket) : Promise<null | { game: Game; id : number }> {
        // console.log(socket.handshake.headers);
		if (socket.handshake.auth.token == undefined) {
			// console.debug("Session cookie wasn't provided. Disconnecting socket.");
			socket.emit(EventGame.NotConnected, {
				timestamp: new Date().toISOString(),
				message: `No session cookie provided`,
			});
			socket.disconnect()
			return null;
		}
		const sessionHash = this.extractString(socket.handshake.auth.token);
		const session = await this.redis.getSession(sessionHash);
		if (session === null) {
			// console.debug("User isn't logged in");
			socket.emit(EventGame.NotConnected, { // Event to report here
				timestamp: new Date().toISOString(),
				message: `User isn't logged in.`,
			});
			socket.disconnect()
			return null;
		}

        // console.log("handleConnection: connected");
		socket.emit(EventGame.IsConnected, {
			timestamp: new Date().toISOString(),
			message: `Socket successfully connected.`
		});

        const allData = JSON.parse(session).passport.user;
        const userId = JSON.parse(session).passport.user.id;
        
		socket.data.userId = userId;
        socket.data.socket = socket.id;
        
        //TODO
        // get via prisma
        const prismData = await this.prisma.user.findUnique({
			where: { id : userId },
			select: {
				name: true,
				elo: true,
			},
		});
        socket.data.name = prismData.name;
        socket.data.elo = prismData.elo;


        // TODO
        // check si avec https j'ai encore acces a headers.referer

        // console.log("user : ", JSON.parse(session).passport.user);
        // console.log("socket:", socket.handshake.headers.referer);
        const gameId = socket.handshake.headers.referer.split('/').pop();
        // console.log("**************************");
        if (gameId === "game") { // not in game
            // console.log("socket in: /game");
            socket.join(`game`);
        } else {
            //TODO
            // check if game exist| ingame| finish
            // console.log("socket in: /game/:id");
            socket.data.ingame = gameId;
            
            const index = this.games.findIndex(games => games.id === Number(gameId));
            const game : Game = this.games[index];

            if (game === undefined || game.p1.id === undefined || game.p2.id === undefined)
                return null;

            // if in game at player pause his game
            if (game.p1.id === userId) // p1 connec
                return {game : game, id : game.p1.id};
            if (game.p2.id === userId) // p2 connect
                return {game : game, id : game.p2.id};
            return {game : game, id : userId}; // spec connect
        }
        return null;
	}



    /* ****************** *\
    |* disconnect functon *|
    \* ****************** */

    async handleDisconnection(socket : Socket) : Promise<null | { game: Game; id : number }> {
        if (socket.handshake.auth.token == undefined) {
			// console.debug("Session cookie wasn't provided. Disconnecting socket.");
			socket.emit(EventGame.NotConnected, {
				timestamp: new Date().toISOString(),
				message: `No session cookie provided`,
			});
			socket.disconnect()
			return null;
		}
		const sessionHash = this.extractString(socket.handshake.auth.token);
		const session = await this.redis.getSession(sessionHash);
		if (session === null) {
			// console.debug("User isn't logged in");
			socket.emit(EventGame.NotConnected, { // Event to report here
				timestamp: new Date().toISOString(),
				message: `User isn't logged in.`,
			});
			socket.disconnect()
			return null;
		}

        const userId = JSON.parse(session).passport.user.id;


        // TODO
        // check si avec https j'ai encore acces a headers.referer

        const gameId = socket.handshake.headers.referer.split('/').pop();

        if (gameId === "game") { // not in game
            // console.log("disconnect socket in: /game");
            // check is player is in Q
            const index = this.users.findIndex(users => users.player.id === userId);
            if (index !== -1)
                this.users.splice(index, 1);
        } else {
            //TODO
            // check if game exist| ingame| finish
            // console.log("disconnect in game/:id");

            const index = this.games.findIndex(games => games.id === Number(gameId));
            const game : Game = this.games[index];

            if (game === undefined || game.p1.id === undefined || game.p2.id === undefined)
                return null;

            // if in game at player pause his game
            if (game.p1.socket === socket.id) { // p1 deco
                return {game : game, id :game.p1.id};
            }
            if (game.p2.socket === socket.id) { // p2 deco
                return {game : game, id :game.p2.id};
            }
            // else spec

        }
        return null;
    }

}