import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/modules/redis/redis.service';
import { Response } from 'express';
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

    nbGame : number = 0;
    users : { player : Player, threshold : number, type : string}[] = [];
    games : Game[] = [];
    queueInterval: NodeJS.Timeout;
    // Todo liste des user et de leurs socket activer
    usersSocket : {id : number, socketId : string[]};


    // TODO
    // inutile
    // Send html
    async lobbyRoom(res : Response) {
        // console.log("Lobby.service : Controller('game')  lobbyRoom");
        // const data = await fs.promises.readFile('src/modules/game/Dir/lobby.html', 'utf8');
        // res.send(data);
        //  console.log("USERS:", this.users);
    }

    // Add user [] 
    async lobbyJoinQueue(client : Socket, type : string) {
        // console.log("lobby join Queue:", client.data);
        //TODO check if in game (boolean)

        console.log(`type: ${type}`);

        const userId = 1;
        const sockets = await this.gameGateway.server.fetchSockets();
        console.log("--------");
        console.log(Object.entries(sockets)
            .filter(([key, value]) => { userId === value.data.userId }));

        console.log("--------");

        const socketIds = Object.entries(sockets)
            .filter(([key, value]) => { userId === value.data.userId })
            .map(([key, value]) => { return value.id });
        
            if (socketIds.length)
                console.log("***",socketIds);
            else
                console.log(`User ${client.id} no socket`);

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
    async lobbySendInvitGame(client: Socket, idTarget : number) {

        // Retirer Q + check inMatch
        this.lobbyLeaveQueue(client);
        if (this.inMatch(client.data.userId)) {// true -> match
            // reponse negative
        }
        // check si idtarget dispo
        const sockets = await this.gameGateway.server.fetchSockets();
        const socketIds = Object.entries(sockets)
            .filter(([key, value]) => { idTarget === value.data.idTarget })
            .map(([key, value]) => { return value.id });
        
            if (socketIds)
                console.log(socketIds);
            else
                console.log(`User ${idTarget} no socket`);


        // send to iftarget getinvita
    }

    // target send to sender response -> gogame | refus
    lobbyResponseInvitGame(client : Socket, data : {p1 : number, p2 : number, res : Boolean}) {
        // check si p1 et p2 dispo
    }



    
    /* *************** *\
    |* Interne functon *|
    \* *************** */

    inMatch(id : number) : Boolean {
        const foundGame = this.games.find(
            game => !game.endBool && ( game.p1.id === id || game.p2.id === id ));

        if (foundGame === undefined) {
            return false;
        }
        else {
            return true;
        }

        // return !!foundGame; // retourne true si foundGame n'est pas null
    }
    
    intervalQueueFunction() {
        // console.log("queueInterval: check");
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

    checkMatch(p1 : {player : Player, threshold : number, type : string}, p2 : {player : Player, threshold : number, type : string}) : Boolean{
        const diff : number = Math.abs(p1.player.elo - p2.player.elo);

        console.log(`p2.type: ${p2.type}`);
        console.log(`p1.type: ${p1.type}`);
        
        // check gap elo
        if (p1.type === p2.type && p1.threshold >= diff && p2.threshold >= diff)
            return true;
        return (false)
    }
    
    // take 2 player, delete user [], generate game
    // lobbyCreateGame(player1 : Player, player2 : Player, server : Server) {
    lobbyCreateGame(p1 : {player : Player, threshold : number, type : string}, p2 : {player : Player, threshold : number, type : string}) {
        // kick player from users[]
        // create game with p1 && p2, generate map && game
        // when done
         
        //console.log("lobbyCreateGame:" , p1, p2);

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


        this.gameGateway.server.to(p1Socket).to(p2Socket).emit(EventGame.lobbyGoGame , game.id);
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
        if (!game.boolRanked) { // map fun map perso
            this.initMap(game);    
        }
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
		if (session === null || !JSON.parse(session).passport) {
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

        if (!socket.handshake.auth.url) // lobby nothing to do
            return null;

        const getUrl = socket.handshake.auth.url.split('/').filter((item) => item !== "");



        if (getUrl.length < 3 || getUrl.length > 4) { // no game no lobby
            return null;
        } else if (getUrl.length === 4 && getUrl[2] === "game") { // in game
            //TODO
            // check if game exist| ingame| finish


            const gameId = getUrl.pop();
            
            const index = this.games.findIndex(games => games.id === Number(gameId));
            const game : Game = this.games[index];

            if (game === undefined || game.p1.id === undefined || game.p2.id === undefined)
                return null;

            // if in game at player resume his game
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
		if (session === null || !JSON.parse(session).passport) {
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
        // kick by socket ?
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
            //TODO
            // check if game exist| ingame| finish
            // console.log("disconnect in game/:id");

            const gameId = getUrl.pop();
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