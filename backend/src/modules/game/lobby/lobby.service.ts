import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/modules/redis/redis.service';
import { Response } from 'express';
import { Player, Game, Square, Circle, BlackHole } from '../entities/game.entities';
import { GameGateway } from '../game.gateway'
import { EventGame } from '../game-event.enum';
import { PrismaService } from 'nestjs-prisma';
import { FriendsService } from "../../friends/friends.service";
import { NotificationsGateway } from "./../../notifications/notifications.gateway"


@Injectable()
export class LobbyService {
    constructor(private readonly gameGateway: GameGateway,
                private readonly notif : NotificationsGateway,
                private readonly redis: RedisService,
                private readonly prisma: PrismaService,
                private readonly friends: FriendsService, ){}

    BaseThreshold = 1000 / 100;

    nbGame : number = 0;
    users : { player : Player, threshold : number, type : string}[] = [];
    games : Game[] = [];
    queueInterval: NodeJS.Timeout;
    invits : {sender : number, socketSender : string, target : number, time : NodeJS.Timeout}[] = [];

    // clear toutes les 60 secondes les parties finit
    clearGames: NodeJS.Timeout = setInterval(() => {
        for (let i = 0; i < this.games.length; i++) {
            if (this.games[i].deleteBool) {
                this.games.splice(i, 1);
                i--;
                }   
        }}, 60000);

    // Add user [] 
    async lobbyJoinQueue(client : Socket, type : string) {
        const index = this.users.findIndex(users => users.player.id === client.data.userId);
        if (index === -1 && !this.inMatch(client.data.userId)) { // Check if player already in Q and not in game

            const prismData = await this.prisma.user.findUnique({
                where: { id : client.data.userId },
                select: {
                    name: true,
                    elo: true,
                },
            });
            //id, name, elo, socket
            const data = {id : client.data.userId, name : prismData.name, elo : prismData.elo , socket : client.data.socket}
            const player = new Player(data);
            this.users.push({ player, threshold : this.BaseThreshold, type});
            if (this.queueInterval === undefined)
                this.queueInterval = setInterval(this.intervalQueueFunction.bind(this), 500);
        }
    }

    // Delete user []
    lobbyLeaveQueue(client : Socket) {
        const suppr = this.users.findIndex(users => users.player.id === client.data.userId); // check if in users first element us.id == cl.id
        if (suppr !== -1)
            this.users.splice(suppr, 1);
    }

    /* ****************** *\
    |* Invitation functon *|
    \* ****************** */

    // envoyer ad target emit getInvite
    async lobbySendInvitGame(client: Socket, idTarget : number, type : string) {
        // check invitation deja en cours
        if (this.lobbyAlreadyInvit(client.data.userId, idTarget)) {
            this.gameGateway.server.to(client.id).emit(EventGame.lobbyRefuseInvitGame, {idTarget, state : "une invitation est en cours"});
            return ;
        }

        // Retirer Q + check inMatch
        this.lobbyLeaveQueue(client);
        if (this.inMatch(client.data.userId)) {// true -> match
            this.gameGateway.server.to(client.id).emit(EventGame.lobbyRefuseInvitGame, {idTarget, state : "indisponible"});
            return ;
        }
        // get idTarget socket
        const sockets = await this.gameGateway.server.fetchSockets();
        const socketIds = sockets.filter(socket => socket.data.userId === idTarget).map(socket => socket.id);

        // check is player socket connect Or not ig
        if (!socketIds.length || this.inMatch(idTarget)){ // no socket || ig
            this.gameGateway.server.to(client.id).emit(EventGame.lobbyRefuseInvitGame, {idTarget, state : "indisponible"});
        }
        else { // socket && noig
            this.invits.push({sender : client.data.userId, socketSender : client.id, target : idTarget, time: setTimeout(() => {
                this.gameGateway.server.to(client.id).emit(EventGame.lobbyRefuseInvitGame, {idTarget, state : "indisponible"});
                this.lobbyLeaveInvit(client.data.userId, idTarget);
            }, 30000)});
            this.gameGateway.server.to(socketIds).emit(EventGame.lobbyGetInvitGame, {player : client.data.userId, you : idTarget, type : type}); 
        }
    }

    // target send to sender response -> gogame | refus
    async lobbyResponseInvitGame(client : Socket, data : {client : number, res : Boolean, type : string}) {
        // check si p1 et p2 dispo
        const   target = client;
        const   sender = data.client;
        const   socketSender = this.invits.find(invits => invits.sender === sender && invits.target === target.data.userId).socketSender;

        if (socketSender === undefined || socketSender === null) {
            this.gameGateway.server.to(socketSender).emit(EventGame.lobbyRefuseInvitGame, {idTarget : target.data.userId, state : "refus"});
            return;
        }
        
        
        // // Reponse -> invitation traiter retirer invite Q
        this.lobbyLeaveInvit(sender, target.data.userId);

        if (!data.res) { // refus
            this.gameGateway.server.to(socketSender).emit(EventGame.lobbyRefuseInvitGame, {idTarget : target.data.userId, state : "refus"});
            return ;
        }


        // // leave Q
        let suppr = this.users.findIndex(users => users.player.id === target.data.userId); // check if in users first element us.id == cl.id
        if (suppr !== -1)
            this.users.splice(suppr, 1);
        suppr = this.users.findIndex(users => users.player.id === sender); // check if in users first element us.id == cl.id
        if (suppr !== -1)
            this.users.splice(suppr, 1);

        // // check inGame
        if (this.inMatch(sender) || this.inMatch(target.data.userId)) {// true -> P1 match
            this.gameGateway.server.to(socketSender).emit(EventGame.lobbyRefuseInvitGame, {idTarget : target.data.userId, state : "quelqu'un est en partie"});
            return ;
        }


        // // check if socket sender valid
        const sockets = await this.gameGateway.server.fetchSockets();
        const socketIds = sockets.filter(socket => socket.data.userId === sender).map(socket => socket.id);
        if (!socketIds.includes(socketSender))
            return ;
        
        // // set Player
        const prismDataPlayer1 = await this.prisma.user.findUnique({
            where: { id : sender },
            select: {
                name: true,
                elo: true,
            },
        });
        const prismDataPlayer2 = await this.prisma.user.findUnique({
            where: { id : target.data.userId },
            select: {
                name: true,
                elo: true,
            },
        });
        const dataP1 = {id : sender, name : prismDataPlayer1.name, elo : prismDataPlayer1.elo , socket : socketSender}
        const p1 = new Player(dataP1);
        const dataP2 = {id : target.data.userId, name : prismDataPlayer2.name, elo : prismDataPlayer2.elo , socket : target.id}
        const p2 = new Player(dataP2);
        this.lobbyCreateGame({player : p1, threshold : 0, type : data.type}, {player : p2, threshold : 0, type : data.type} )
    }

    
    /* *************** *\
    |* Interne functon *|
    \* *************** */

    lobbyLeaveInvit(sender : number, target : number) : void {
        const suppr = this.invits.findIndex(invits => invits.sender === sender && invits.target === target);
        if (suppr !== -1) {
            clearTimeout(this.invits[suppr].time);
            this.invits.splice(suppr, 1);
        }
    }

    lobbyAlreadyInvit(sender : number, target : number) : Boolean {
        const suppr = this.invits.findIndex(invits => invits.sender === sender && invits.target === target);
        if (suppr !== -1)
            return true;
        return false;
    }

    inMatch(id : number) : Boolean {
        const foundGame = this.games.find(
            game => !game.endBool && ( (game.p1.id === id || game.p2.id === id) && game.endBool === false));
        if (foundGame === undefined)
            return false;
        return true;
    }

    intervalQueueFunction() {
        console.log("Player in Q :" ,this.users.length);
        for (let i = 0; i < this.users.length; i++)
            console.log(`id : ${this.users[i].player.name}`);
        console.log();

        let gotMatch : Boolean = false;
        if (this.users.length === 0) { // if no player in Q
            clearInterval(this.queueInterval);
            this.queueInterval = undefined;
        } else if (this.users.length >= 2) { // if >= 2 player in Q
            // check if 2 player match
            let j : number;
            for (let i : number = 0; i < this.users.length; i++) {
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
                if (gotMatch === true)
                    gotMatch = false;
                else
                    this.users[i].threshold += 5;
            }
        }
    }

    checkMatch(p1 : {player : Player, threshold : number, type : string}, p2 : {player : Player, threshold : number, type : string}) : Boolean{
        const diff : number = Math.abs(p1.player.elo - p2.player.elo);
        // check gap elo
        if (p1.type === p2.type && p1.threshold >= diff && p2.threshold >= diff)
            return true;
        return (false)
    }
    
    // take 2 player, delete user [], generate game
    // lobbyCreateGame(player1 : Player, player2 : Player, server : Server) {
    lobbyCreateGame(p1 : {player : Player, threshold : number, type : string}, p2 : {player : Player, threshold : number, type : string}) {
        const p1Socket = p1.player.socket;
        const p2Socket = p2.player.socket;
            
        p1.player.socket = undefined;
        p2.player.socket = undefined;

        // Create game and push in games[]
        const game = new Game(this.nbGame++, p1.player, p2.player, p1.type);
        this.games.push(game);
            
        // remove player from Users[]
        const remP1 = this.users.findIndex(users => users.player.id === p1.player.id);
        if (remP1 != -1)
            this.users.splice(remP1, 1);
        const remP2 = this.users.findIndex(users => users.player.id === p2.player.id);
        if (remP2 != -1)
            this.users.splice(remP2, 1);
            
        this.initGame(this.gameGateway.server, game);
        this.notif.inGameNotify(p1.player.id);
        this.notif.inGameNotify(p2.player.id);
        this.gameGateway.server.to(p1Socket).to(p2Socket).emit(EventGame.lobbyGoGame , game.id);
    }

    initGame(server : Server, game : Game) {
        if (game.shapes.length != 0)
            return ;

        const distwall = 10;
        game.p1.racket = new Square(distwall , 200, 84, 5);
        game.p2.racket = new Square(game.field.width - distwall , 200, 84, 5);

        game.p1.racket = new Square(distwall , 200, 84, 5);
        game.p2.racket = new Square(game.field.width - distwall - 5 , 200, 84, 5);

        game.shapes.push(game.p1.racket);
        game.shapes.push(game.p2.racket);
        game.server = this.gameGateway.server;

        if (!game.boolRanked) // map fun map perso
            this.initMap(game);    
        game.numberElement = game.shapes.length;
    }

    initMap(game : Game) : void {
        let idMap : number;
        const width = game.field.width;
        const height = game.field.height

        if (!game.boolMap) // pas de map choisit -> aleatoire
            idMap = game.id % 3;
        else
            idMap = game.map;

        if (idMap === 0) { // blackhole
            const BlackHole_01 = new BlackHole(width / 2, height / 2, 45);
            game.shapes.push(BlackHole_01);
        } else if (idMap === 1) {
            // Creation Circle : x, y, r
            const c_01 = new Circle(width / 4, height / 4, 30);
            const c_02 = new Circle(width / 4, height * 0.75, 30);
            const c_03 = new Circle(width / 2, height / 2, 30);
            const c_04 = new Circle(width * 0.75 , height / 4, 30);
            const c_05 = new Circle(width * 0.75, height * 0.75, 30);

            game.shapes.push(c_01, c_02, c_03, c_04, c_05);
        }
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
		if (socket.handshake.auth.token == undefined) {
			socket.emit(EventGame.NotConnected, {
				timestamp: new Date().toISOString(),
				message: `No session cookie provided`,
			});
			socket.disconnect()
			return null;
		}
		const sessionHash = this.extractString(socket.handshake.auth.token);
		const session = await this.redis.getSession(sessionHash);
		if (session === null || !JSON.parse(session).passport || !JSON.parse(session).passport.user) {
			socket.emit(EventGame.NotConnected, { // Event to report here
				timestamp: new Date().toISOString(),
				message: `User isn't logged in.`,
			});
			socket.disconnect()
			return null;
		}

		socket.emit(EventGame.IsConnected, {
			timestamp: new Date().toISOString(),
			message: `Socket successfully connected.`
		});

        
        const userId = JSON.parse(session).passport.user.id;
        
		socket.data.userId = userId;
        socket.data.socket = socket.id;
        
        const prismData = await this.prisma.user.findUnique({
			where: { id : userId },
			select: {
				name: true,
				elo: true,
			},
		});
        socket.data.name = prismData.name;
        socket.data.elo = prismData.elo;

        if (!socket.handshake.auth.url) // lobby nothing to do
            return null;
        const getUrl = socket.handshake.auth.url.split('/').filter((item) => item !== "");

        if (getUrl.length < 3 || getUrl.length > 4) { // no game no lobby
            return null;
        } else if (getUrl.length === 4 && getUrl[2] === "game") { // in game
            // check if game exist| ingame| finish


            const gameId = getUrl.pop();
            
            const index = this.games.findIndex(games => games.id === Number(gameId));
            const game : Game = this.games[index];

            if (game === undefined || game.p1.id === undefined || game.p2.id === undefined)
                return null;

            // if in game at player resume his game
            if (game.p1.id === userId) { // p1 connec
                // si game pas fini : status in game
                if (game.endBool === false) {
                    game.p1socket = socket;
                }
                return {game : game, id : game.p1.id};
            }
            if (game.p2.id === userId) { // p2 connect
                // si game pas fini : status in game
                if (game.endBool === false) {
                    game.p2socket = socket;
                }
                return {game : game, id : game.p2.id};
            }
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
		if (session === null || !JSON.parse(session).passport || !JSON.parse(session).passport.user) {
			// console.debug("User isn't logged in");
			socket.emit(EventGame.NotConnected, { // Event to report here
				timestamp: new Date().toISOString(),
				message: `User isn't logged in.`,
			});
			socket.disconnect()
			return null;
		}

        const userId = JSON.parse(session).passport.user.id;

        if (!socket.handshake.auth.url) {// lobby and leave Q if player in Q
            const index = this.users.findIndex(users => users.player.id === userId);
            if (index !== -1)
                this.users.splice(index, 1);
            return null;
        }

        const getUrl = socket.handshake.auth.url.split('/').filter((item) => item !== "");

        if (getUrl.length < 3 || getUrl.length > 4) { // no game no lobby
            return null;
        } else if (getUrl.length === 4 && getUrl[2] === "game") { // in game

            const gameId = getUrl.pop();
            const index = this.games.findIndex(games => games.id === Number(gameId));
            const game : Game = this.games[index];

            if (game === undefined || game.p1.id === undefined || game.p2.id === undefined)
                return null;

            // if in game at player pause his game
            if (game.p1.socket === socket.id) // p1 deco
                return {game : game, id :game.p1.id};
            if (game.p2.socket === socket.id) // p2 deco
                return {game : game, id :game.p2.id};
            // else spec
        }
        return null;
    }
}