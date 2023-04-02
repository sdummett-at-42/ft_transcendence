import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Shape, Square , Bullet, Circle, Coordonnee , Player, Field, BlackHole, Game } from './entities/game.entities';
import { GameGateway } from './game.gateway';
import { RedisService } from 'src/modules/redis/redis.service';
import { EventGame } from './game-event.enum';
import { LobbyService } from './lobby/lobby.service';

@Injectable()
export class GameService {
    constructor(private readonly redis: RedisService,
                //private readonly lobbyService: LobbyService
                ) { }

    // numberElement = 2;
    // speed = 5;

    //field = new Field(400, 800);
    //shapes : Shape[] = [];
    //bulletInterval: NodeJS.Timeout; // stocker ID de l'intervalle de la partie
    //frequencyInterval: NodeJS.Timeout; // stocker ID de l'intervalle f bullet

    //x:number, y:number, height:number, width:number)
    // a pofiner plus tard pour le set up des positions
    // player1 : Player;
    // player2 : Player;

    /* ************************** *\
    |* connect disconnect functon *|
    \* ************************** */

    async handleConnection(socket : Socket) {
		if (socket.handshake.headers.cookie == undefined) {
			console.debug("Session cookie wasn't provided. Disconnecting socket.");
			socket.emit(EventGame.NotConnected, {
				timestamp: new Date().toISOString(),
				message: `No session cookie provided`,
			});
            console.log("handleConnection no session cookie");
			socket.disconnect()
			return;
		}
		const sessionHash = socket.handshake.headers.cookie.slice(16).split(".")[0];
		const session = await this.redis.getSession(sessionHash);
		if (session === null) {
			console.debug("User isn't logged in");
			socket.emit(EventGame.NotConnected, {
				timestamp: new Date().toISOString(),
				message: `User isn't logged in.`,
			});
            console.log("handleConnection not logged");
			socket.disconnect()
			return;
		}
        console.log("handleConnection: connected");
		socket.emit(EventGame.IsConnected, {
			timestamp: new Date().toISOString(),
			message: `Socket successfully connected.`
		});

        const allData = JSON.parse(session).passport.user;
        const userId = JSON.parse(session).passport.user.id;
		socket.data.userId = userId;

        socket.data.name = allData.name;
        socket.data.elo = allData.elo;
        socket.data.socket = socket.id;

        console.log("data: ",  socket.data.socket);
        console.log("socketid: ",  socket.id);

        // TODO
        // check si avec https j'ai encore acces a headers.referer

        //console.log("user : ", JSON.parse(session).passport.user);
        console.log("socket:", socket.handshake.headers.referer);
        const gameId = socket.handshake.headers.referer.split('/').pop();
        console.log("**************************");
        if (gameId === "game") { // not in game
            console.log("socket in: /game");
            socket.join(`game`);
        } else {
            //TODO
            // check if game exist| ingame| finish
            console.log("socket in: /game/qqch");

            console.log(`gameId:`, gameId);
            socket.data.ingame = gameId;
            // console.log(`game${gameId}`);

            // socket.join(`game${gameId}`); // create room "game_id" utliser avec l'url /game/:id
        }
        console.log("**************************");//



	}

    /* ******************* *\
    |* input/entry functon *|
    \* ******************* */

    // TODO
    // check si client not in game ?
    // check si client est joueur
    //      yes = modifier player en question
    //      non = spectateur
    // si oui ajouter ou ecraser le socket ?
    joinGame(server: Server, game : Game, client : Socket, payload : {roomId : string, msg : string}) {
        
        client.join(payload.roomId);

        console.log(payload);
        console.log(game.roomId);
        
        console.log("client  ", client.data.userId);
        console.log("player 1", game.p1.id);
        console.log("player 2", game.p2.id);

        if (client.data.userId === game.p1.id) { // c'est le joueur 1
            game.p1.socket = client.data.socket;
        }

        if (client.data.userId === game.p2.id) { // c'est le joueur 2
            game.p2.socket = client.data.socket;
        }
    }

    startingGame(server : Server, game : Game) : void {

        if (game.shapes.length > game.numberElement ) {
            console.log("Partie deja en cours");
        }
        else {
            if (game.shapes.length === 0 )
                game.shapes.push(game.p1.racket);
            console.log("starting game !");

            // Creation bullet
            // x, y, r, v, f, a
            const bullet_01 = new Bullet(200, 200, 5, 3, 30, Math.PI );
            game.shapes.push(bullet_01);

            server.to(game.roomId).emit(EventGame.gameImage, game.shapes);

            this.startMoving(server, game, bullet_01);

        }
    }

    stopGame(server : Server, game : Game) : void {

        if (game.shapes.length <= game.numberElement ) {
            console.log("la partie n'a pas commence !");
            return null;
        }
        else {
            console.log("Fin de la partie !");//
//
            //console.log(this.shapes.length);
            //console.log(this.shapes[2]);//

            clearInterval(game.frequencyInterval);
            clearInterval(game.bulletInterval);
            game.shapes.splice(game.numberElement);

            // console.log(game.shapes);
            // console.log("size shapes: ", game.shapes.length);
            server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
        }
    }

    // TODO
    // Si une seule fenetre playable -> check socket et non id
    mouvementGame(server : Server, game : Game, client : Socket, x : number, y : number) : void { // faire pour joueur 1 et 2

        let tmpYmin : number = y - game.p1.racket.length / 2; // tmpY = haut de la racket
        let tmpYmax : number = y + game.p1.racket.length / 2; // tmpY = bas de la racket      
        
        // console.log("client   :", client.data.userId);
        // Player 1
        if (client.data.userId === game.p1.id) {
            if (tmpYmin < 0) // si haut racket trop haut
                game.p1.racket.pos.y = 0;
            else if (tmpYmax > game.field.height) // si haut racket trop bas
                game.p1.racket.pos.y = game.field.height - game.p1.racket.length;
            else
                game.p1.racket.pos.y = tmpYmin;
        }

        // Player 2
        if (client.data.userId === game.p2.id) {
            if (tmpYmin < 0) // si haut racket trop haut
                game.p2.racket.pos.y = 0;
            else if (tmpYmax > game.field.height) // si haut racket trop bas
                game.p2.racket.pos.y = game.field.height - game.p2.racket.length;
            else
                game.p2.racket.pos.y = tmpYmin;
        }

        if (client.data.userId === game.p2.id || client.data.userId === game.p1.id)
            server.to(game.roomId).emit(EventGame.gameImage, game.shapes);

    }

    /* *************** *\
    |* Interne functon *|
    \* *************** */

    private startMoving(server: Server, game : Game, bullet: Bullet) {
        if (game.bulletInterval)
            clearInterval(game.bulletInterval);
      
        let delay = 1000 / bullet.f;
        //console.log("delay = ", delay, " bullet.r * Math.cos(bullet.a) = " ,bullet.r * Math.cos(bullet.a));
      

        // Start the interval to increment to all bullet.f every second
        game.frequencyInterval = setInterval(() => {
            bullet.f += game.speed;
            console.log("bullet frequency: ", bullet.f);
        }, 1000);


        const intervalFunction = () => {
            // Check if bullet got collisionwith element if collision bullet.a will change
            this.checkCollision(game, bullet);

            // 0 : No score | 1 : P1 score | 2 : P2 score | -1 : Limit score
            const scorer = this.checkScoring(game, bullet)
            if (scorer !== 0) {
                if (scorer > 0)
                    this.startNewBullet(game, scorer);
                return;
            }

            // Change bullet.pos with new value
            bullet.pos.x += bullet.v * Math.cos(bullet.a);
            bullet.pos.y += bullet.v * Math.sin(bullet.a);
        
        //console.log(`position = (${bullet.pos.x}.${bullet.pos.y})`);
        
            // send shapes[] to front
            server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
        
            // Recalculate the delay based on the new frequency
            delay = 1000 / bullet.f;
        
            // Clear the previous interval and create a new one with the updated delay
            clearInterval(game.bulletInterval);
            game.bulletInterval = setInterval(intervalFunction, delay);
        };

        // Set the first interval
        game.bulletInterval = setInterval(intervalFunction, delay);
    }

    private startNewBullet(game : Game, scorer : number) : void {
        // delete bullet who score
        // create new bullet to player who score/ get scored ?
        // user click to send bullet (time to send or bullet go himself)
        // don't stop timing game or maybe yes

        // TODO Multi_ball
        // delete la bullet precise


        // Delete old bullet and interval
        game.shapes.splice(game.numberElement);
        clearInterval(game.frequencyInterval);
        clearInterval(game.bulletInterval);

        const r = 5;


        let newX : number;
        let newY : number;
        let newA : number;

        if (scorer === 1) {
            newA = 0;
            newX = game.p1.racket.pos.x + game.p1.racket.width + r + 1;
            newY = game.p1.racket.pos.y + game.p1.racket.length / 2;
        } else if (scorer === 2) {
            newA = Math.PI;
            newX = game.p2.racket.pos.x - r - 1;
            newY = game.p2.racket.pos.y + game.p2.racket.length / 2;
        }

        // Creation New bullet
        // x, y, r, v, f, a
        const bullet_01 = new Bullet(newX, newY, r, 3, 30, newA);
        game.shapes.push(bullet_01);

        game.server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
            
        // TODO
        // get timer in game setting
        // timer to clic
        // sinon fin timer lance

        const launchBulletTimer = setTimeout(() => {
              // Player got X ms to launch bullet
              this.startMoving(game.server, game, bullet_01);
            }, 5000);

        // ce code ci dessous appeler dans function appeler par gateway click

        // if player click
        // cancel setTimeout
        // -----
        clearTimeout(launchBulletTimer);

        this.startMoving(game.server, game, bullet_01);
        // -----
    }
      
    private checkScoring(game : Game, bullet : Bullet) : number {
        // si scoring retirer bullet qui a marque de la partie
        // si plus de bullet en jeux en remettre une pour le joueur qui a perdu ou inverse

        if (bullet.pos.x + bullet.r > game.field.width) {
            game.p2.score++;
            if (game.limitScoreBool === true && game.p2.score >= game.limitScore)
                return (this.victoryByScore(game));
            game.server.to(game.roomId).emit(EventGame.gameScore, game.p2);
            return 2;
        } else if (bullet.pos.x - bullet.r < 0) {
            game.p1.score++;
            if (game.limitScoreBool === true && game.p1.score >= game.limitScore)
                return (this.victoryByScore(game));
            game.server.to(game.roomId).emit(EventGame.gameScore, game.p1);
            return 1;
        } else {
            return 0;
        }
    }

    private victoryByScore(game : Game) : number {
        // Stop game
        game.shapes.splice(game.numberElement);
        clearInterval(game.frequencyInterval);
        clearInterval(game.bulletInterval);

        console.log("Test");

        this.newElo(game)

        return -1;
    }

    private newElo(game : Game) : void {

        let score1;
        let score2;
        if (game.p1.score > game.p2.score) {
            score1 = 1;
            score2 = 0;
        }
        else if (game.p1.score < game.p2.score) {
            score1 = 0;
            score2 = 1;
        }
        else {
            score1 = 0.5;
            score2 = 0.5;
        }

        // TODO
        // change nombregame (facteur K)
        this.calculateElo(game.p1.score, game.p2.score, score1, 5); // last = nb game jouer
        this.calculateElo(game.p2.score, game.p2.score, score2, 5);
    }

    calculateElo(oldElo: number, opponentElo: number, score: number, gamesPlayed: number): number {
        const k = this.getKFactor(gamesPlayed);
        const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - oldElo) / 400));
        const eloChange = k * (score - expectedScore);
        const newElo = oldElo + eloChange;
      
        return Math.round(newElo);
    }
      
    getKFactor(gamesPlayed: number): number {
        if (gamesPlayed < 30)
            return 40;
        else if (gamesPlayed < 50)
            return 20;
        else
            return 10;
        
    }
      
      
      
      
      














    private checkCollision(game : Game, bullet : Bullet) {
        // Vérifier si la balle touche les murs horizontaux
        if (bullet.pos.y + bullet.r > game.field.height || bullet.pos.y - bullet.r < 0)
            bullet.a = -bullet.a;
            
        // Check if bullet hit an other shape
        // collision activate with Square and Circle
        // no collision between bullet (or himself)
        //console.log(game.shapes.length, game.shapes);
        for (let i = 0; i < game.shapes.length; i++) {
            const shape = game.shapes[i];
            // Mettre optimisation check si radius bullet et radius shape no hit
            // === >
            if (shape instanceof Circle || shape instanceof BlackHole) {
                // check if collision with circle
                if (this.checkInRangeCircle(bullet, shape)) {
                    console.log("Collision with Cercle !");
                    // Get new angle bullet
                    if (shape instanceof BlackHole)
                        this.collisionBlackHole(bullet, shape);
                    else
                        this.collisionCircle(bullet, shape);
                }
            } else if (shape instanceof Square && this.checkInRange(bullet, shape)) { // Check if shape to far from bullet
            //onsole.log("Square in range !");
                // check if collision with Square
                if (this.checkInRangeSquare(bullet, shape)) {
                    console.log("--Collision with Square !:", i);
                    // Cas racket
                    if (i < 2) // i = 0 J1 | i = 1 j2
                        this.collisionRacket(bullet, shape);
                    else // Square on map
                        this.collisionSquare(bullet, shape);
                }
            }
        }
    }

    private checkInRange(bullet : Bullet, square : Square) : Boolean {
        // Put square in circle

        // Get coord square's center
        const csx : number = square.pos.x + square.width / 2; 
        const csy : number = square.pos.y + square.length / 2;

        // Get radius circle
        const dsx : number = square.width / 2;
        const dsy : number = square.length / 2;
        const sr : number = Math.sqrt(Math.pow(dsx, 2) + Math.pow(dsy, 2));

        const circle = new Circle(csx, csy, sr);
        if (this.checkInRangeCircle(bullet, circle))
            return true;
        return false;
    }

    private checkInRangeSquare(bullet : Bullet, square : Square) : Boolean {
        // put bullet in square
        const minX : number = bullet.pos.x - bullet.r;
        const minY : number = bullet.pos.y - bullet.r;
        const bs = new Square(minX, minY, bullet.r * 2, bullet.r *2);

        //console.log("minX, MinY:", minX, minY);
        // check if collission bullet's square and sqare 
        if (this.checkInSquare(bs, square) || this.checkInSquare(square, bs))
            return true;
        
        return false;
    }

    //function check if square1 is in squre2
    private checkInSquare(square1 : Square, square2 : Square) : Boolean {
        const s1_xl : number = square1.pos.x;
        const s1_xr : number = square1.pos.x + square1.width;
        const s1_yt : number = square1.pos.y;
        const s1_yb : number = square1.pos.y + square1.length;

        const s2_xl : number = square2.pos.x;
        const s2_xr : number = square2.pos.x + square2.width;
        const s2_yt : number = square2.pos.y;
        const s2_yb : number = square2.pos.y + square2.length;

        if (s1_xl <= s2_xr && s1_xr >= s2_xl && s1_yt <= s2_yb && s1_yb >= s2_yt) {
            return true;
}

        if ((s1_xl >= s2_xl && s1_xl <= s2_xr && s1_yt >= s2_yt && s1_yt <= s2_yb)  // top left
        ||  (s1_xr >= s2_xl && s1_xr <= s2_xr && s1_yt >= s2_yt && s1_yt <= s2_yb)  // top right) 
        ||  (s1_xl >= s2_xl && s1_xl <= s2_xr && s1_yb >= s2_yt && s1_yb <= s2_yb)  // bot left
        ||  (s1_xr >= s2_xl && s1_xr <= s2_xr && s1_yb >= s2_yt && s1_yb <= s2_yb) )// bot right
            return true;
        // check square collision but corner not in
        if (s1_xl >= s2_xl && s1_xl <= s2_xr && s1_yt < s2_yt && s1_yb > s2_yt // cross top left to bot left 
        ||  s1_xr >= s2_xl && s1_xr <= s2_xr && s1_yt < s2_yt && s1_yb > s2_yt)// cross top right to bot right
            return true;
        return false;
    }

    private checkInRangeCircle(bullet : Bullet, circle : Circle | BlackHole) : Boolean {
        // check if collision with circle and bullet
        const dx : number = Math.pow(circle.pos.x - bullet.pos.x, 2);
        const dy : number = Math.pow(circle.pos.y - bullet.pos.y, 2);
        const dist = Math.sqrt(dx + dy);

        if (dist <= circle.r + bullet.r)// if true => change dir bullet
            return true
        return false;
    }

    private collisionRacket(bullet : Bullet, racket: Square) : void {
        const centerX = racket.pos.x + racket.width / 2;
        const centerY = racket.pos.y + racket.length / 2;
        const deltaX = bullet.pos.x - centerX;
        const deltaY = bullet.pos.y - centerY;
        let angle = Math.atan2(deltaY, deltaX);
        console.log(angle);

        // if angle to acute
        if (angle >= 1.1 && angle <= 2.2) { // top 
            if (angle < 1.6) { // left
                angle = 1.1
                bullet.pos.x += bullet.r;
            }
            else {// right
                angle = 2.2
                bullet.pos.x -= bullet.r;
            }
        }
        else if (angle <= -1.1 && angle >= -2.2) { // bot
        if (angle > -1.6) {// left
            angle = -1.1
                bullet.pos.x += bullet.r;
            }
            else { //right
                angle = -2.2
                bullet.pos.x -= bullet.r;
            }
        }
        // change bullet.a
        bullet.a = angle;
    }

    private collisionSquare(bullet : Bullet, square : Square) : void {
        let dx = Math.abs(bullet.pos.x - square.pos.x);
        // Set the corners of the rectangle based on the position of its top left corner, its width and its length
        const x1 = square.pos.x;
        const x2 = square.pos.x + square.width;
        const y1 = square.pos.y;
        const y2 = square.pos.y + square.length;
        
        // Determine if the ball hits the rectangle from the top, bottom, left or right
        dx = Math.min(Math.abs(bullet.pos.x - x1), Math.abs(bullet.pos.x - x2));
        const dy = Math.min(Math.abs(bullet.pos.y - y1), Math.abs(bullet.pos.y - y2));
        
        // TODO
        // Upgrade collision with Square

        console.log(bullet.pos.x, bullet.pos.y);
        console.log(x1, x2);
        console.log(y1, y2);

        console.log("dx", dx);
        console.log("dy", dy);

        //console.log(dx, "<", dy, ":",dx < dy);

        //dx = distance wall vertical
        //dy = distance wall horizontaux


        console.log("a1:", bullet.a);
        // Change bullet.a according to...
        if (dx < dy) {
            // Collision with vertical edge
            console.log("vertical");
            bullet.a = Math.PI - bullet.a;
        } else {
            // Collision with horozontal edge
            console.log("horizontal");
            
            const dytemp = Math.abs(bullet.pos.y - y1); // top
            // cas bullet.a = 0 ou 3.14
            if (bullet.a === 0) { // to right
                if (dytemp === dy) { // if top square
                    bullet.a = 5 * Math.PI / 4;
                } else { // if bot square
                    bullet.a = 3 * Math.PI / 4;
                }
            } else if (bullet.a === Math.PI || bullet.a === -Math.PI) { // to left
                if (dytemp === dy) { // if top square
                    bullet.a = 7 * Math.PI / 4;
                } else { // if bot square
                    bullet.a = Math.PI / 4;
                }
            } else {
                bullet.a = -bullet.a;
            }
        }
        console.log("a2:", bullet.a);
        console.log();

    }

    private collisionBlackHole(bullet : Bullet, bh : BlackHole) : void {
        const dx = bullet.pos.x - bh.pos.x;
        const dy = bullet.pos.y - bh.pos.y;

        const newAngle = 2 * Math.atan2(dy, dx) - bullet.a + Math.PI;

        // Change bullet.a
        bullet.a = newAngle - Math.PI;
    }

    private collisionCircle(bullet : Bullet, circle : Circle) : void {
        // Collision angle
        const angle = Math.atan2(bullet.pos.y - circle.pos.y, bullet.pos.x - circle.pos.x);
        
        // Angle of reflection
        const reflectionAngle = 2 * angle - bullet.a + Math.PI;

        // Change bullet.a
        bullet.a = reflectionAngle;
    }
}