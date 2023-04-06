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

    /* ******************* *\
    |* input/entry functon *|
    \* ******************* */

    // TODO
    // check si client not in game ?
    // check si client est joueur
    //      yes = modifier player en question
    //      non = spectateur
    // si oui ajouter ou ecraser le socket ?

    // un seul socket joueur
    // attendre les 2 joueurs present

    //TODO
    // faire une fonction qui check si la game est termine pour bloquer les inputs

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
        console.log("joingame");
        server.to(game.roomId).emit(EventGame.gameImage, game.shapes);

        // When 2 player are here start game
        if (game.p1.socket != undefined && game.p2.socket != undefined)
            this.startingGame(server, game);
    }

    startingGame(server : Server, game : Game) : void {
        if (game.shapes.length > game.numberElement ) {
            console.log("Partie deja en cours");
        }
        else if (game.gameInterval === undefined) {
            console.log("starting game !");

            // Bullet start side player 1
            this.startNewBullet(game, 1);

            // TODO
            // temp max atteint = fin game
            game.dateStart =  new Date();
            let elapsedTime : number;
            const delay = 1000 / 60 // 60 emit sec

            // console.log("StartingGame : pre setInterval");
            game.gameInterval = setInterval(() => {
                if (game.pause === true) { // game in pause
                    // if player 1 pause
                    const dateActual = new Date().getTime();


                    // je veux check si un joueur a consommer sa duree total de pause
                    // stocker duree total pause joueur dans resume

                    // si p1Pause && limit pause depasser = victoire forfait
                    if (game.pauseP1 === true) {
                        const check : number = game.pauseP1Time + dateActual - game.pauseP1Start.getTime();
                        if (game.limitPauseTimerBool && check >= game.limitPauseTimer) {
                            this.victoryByGiveUpLimitMax(game, 2);
                            return ;
                        }
                    }
                    // if player 2 pause
                    if (game.pauseP2 === true) {
                        const check : number = game.pauseP2Time + dateActual - game.pauseP2Start.getTime();;
                        if (game.limitPauseTimerBool && check >= game.limitPauseTimer) {
                            this.victoryByGiveUpLimitMax(game, 1);
                            return ;
                        }
                    }

                } else { // game not in pause
                    // check game timer end
                    elapsedTime = Math.floor(new Date().getTime() - game.dateStart.getTime() - game.pauseTotalTime);
                    // check Limit timer
                    if (game.limitTimerBool === true && elapsedTime >= game.limitTimer) {
                        this.victoryByScore(game);
                        return ;
                    }
                }
                server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
                server.to(game.roomId).emit(EventGame.gameTimer, elapsedTime);
            }, delay);
            // console.log("StartingGame : sub setInterval");


        }
    }

    pauseGame(game : Game, idPause : number) : void {
        // cas deco : socket undefine
        // cas pause manuel : socket define but action emit

        console.log("PauseGame");
        // manual and deco
        // 2 if if player game alone ?
        if (idPause === game.p1.id) {
            game.pauseP1 = true;
            game.pauseP1Max ++;
            if (game.pauseP1Max >= game.pauseTotalMax) {
                this.victoryByGiveUpLimitMax(game, 2);
                return ;
            }
            game.pauseP1Start = new Date();
        }
        if (idPause === game.p2.id) {
            game.pauseP2 = true;
            game.pauseP2Max ++;
            if (game.pauseP2Max >= game.pauseTotalMax) {
                this.victoryByGiveUpLimitMax(game, 1);
                return ;
            }
            game.pauseP2Start = new Date();
        }

        if (game.pause === false) {
            game.pauseStart = new Date();
            game.pause = true;
            clearTimeout(game.launchBulletTimer);
        }

        // TODO
        // stop bullet all
        // game.shapes.forEach((shape, index) => {
        //     if (game.shapes[index] instanceof Bullet){
        

        //     }
        // })

        clearInterval(game.bulletInterval);
        game.bulletInterval = undefined;



        clearInterval(game.frequencyInterval);
        game.frequencyInterval = undefined;
    }

    resumeGame(game : Game, idResume : number) : void {
        if (!game.pause)
            return ;

        // TODO
        // cas fin pause manuel
        console.log("resume game");

        const actualDate : number = new Date().getTime();
        // if 2 player are ready
        if (idResume === game.p1.id && game.pauseP1Start) {
            game.pauseP1 = false;
            game.pauseP1Time += actualDate - game.pauseP1Start.getTime();
        } else if (idResume === game.p2.id && game.pauseP2Start) {
            game.pauseP2 = false;
            game.pauseP2Time += actualDate - game.pauseP2Start.getTime();
        }

        // All player aren't in pause
        if (!game.pauseP1 && !game.pauseP2) {
            game.pause = false;
            game.pauseTotalTime += actualDate - game.pauseStart.getTime();

            // TODO
            // decompte 3 2 1 reprise ?
            // si oui changer actualDate

            game.shapes.forEach((shape) => {
                if (shape instanceof Bullet)
                    this.startMoving(game.server, game, shape);
            })
        }             
    }

    // stop all interval et clear all bullet
    stopGame(server : Server, game : Game) : void {

        // if (game.shapes.length <= game.numberElement ) {
        //     console.log("la partie n'a pas commence !");
        //     return null;
        // }
        // else {
            console.log("Fin de la partie !");

            // Stop all interval bullet
            // game.shapes.forEach((shape, index) => {
            //     if (game.shapes[index] instanceof Bullet){
            //         clearInterval(game.bulletInterval);
            //         game.bulletInterval = undefined;
            //     }
            // })

            clearInterval(game.bulletInterval);
            game.bulletInterval = undefined;


            clearInterval(game.frequencyInterval);
            game.frequencyInterval = undefined;
            
            // and clear all element add after init
            game.shapes.splice(game.numberElement);

            // Stop game's interval
            clearInterval(game.gameInterval);
            game.gameInterval = undefined;

            server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
        // }
    }

    mouvementGame(server : Server, game : Game, client : Socket, x : number, y : number) : void { // faire pour joueur 1 et 2

        let tmpYmin : number = y - game.p1.racket.length / 2; // tmpY = haut de la racket
        let tmpYmax : number = y + game.p1.racket.length / 2; // tmpY = bas de la racket      
        
        // console.log("client   :", client.data.userId);
        // Player 1
        if (client.data.socket === game.p1.socket) {
            if (tmpYmin < 0) // si haut racket trop haut
                game.p1.racket.pos.y = 0;
            else if (tmpYmax > game.field.height) // si haut racket trop bas
                game.p1.racket.pos.y = game.field.height - game.p1.racket.length;
            else
                game.p1.racket.pos.y = tmpYmin;
            if (game.p1.relaunchBulletBool) {
                this.setBulletRelaunch(game, game.p1.racket);
            }
        }

        // Player 2
        if (client.data.socket === game.p2.socket) {
            if (tmpYmin < 0) // si haut racket trop haut
                game.p2.racket.pos.y = 0;
            else if (tmpYmax > game.field.height) // si haut racket trop bas
                game.p2.racket.pos.y = game.field.height - game.p2.racket.length;
            else
                game.p2.racket.pos.y = tmpYmin;
            if (game.p2.relaunchBulletBool) {
                this.setBulletRelaunch(game, game.p2.racket);
            }
        }
    }

    clickGame(game : Game, client : Socket) : void {
        // get first bullet (only 1 bullet when relaunch)
        const bullet : Shape = game.shapes.find(shape => shape instanceof Bullet)

        if (game.pause == true || bullet === undefined || !(bullet instanceof Bullet))
            return ;

        // Player 1
        if (client.data.socket === game.p1.socket && game.p1.relaunchBulletBool === true) {
            game.p1.relaunchBulletBool = false;
            clearTimeout(game.launchBulletTimer);
            this.startMoving(game.server, game, bullet);
        }
        // Player 2
        if (client.data.socket === game.p2.socket && game.p2.relaunchBulletBool === true) {
            game.p2.relaunchBulletBool = false;
            clearTimeout(game.launchBulletTimer);
            this.startMoving(game.server, game, bullet);
        }
    }

    /* *************** *\
    |* Interne functon *|
    \* *************** */

    private startMoving(server: Server, game : Game, bullet: Bullet) {
        console.log("Start moving : begin");
        let delay = 1000 / bullet.f;
        //console.log("delay = ", delay, " bullet.r * Math.cos(bullet.a) = " ,bullet.r * Math.cos(bullet.a));
      
        // TODO
        // add in bullet Boolean isMoving, set false
        // when call in start moving pass true ?

        // Start the interval to increment to all bullet.f every second
        if (game.frequencyInterval === undefined) {
                game.frequencyInterval = setInterval(() => {
                    // console.log("Start moving : bullet freq");
                    game.shapes.forEach((shape) => {
                        if (shape instanceof Bullet) {
                            shape.f += shape.speed;
                            console.log("bullet frequency: ", bullet.f);
                        }})
                }, 1000);
        }



        const intervalFunction = () => {
            // console.log("Start moving : intervalFunction");

            // TODO
            // retirer forEachif mono bullet
            game.shapes.forEach((shape, index) => {
                if (shape instanceof Bullet) {
                    // Check if bullet got collisionwith element if collision bullet.a will change
                    this.checkCollision(game, shape);
                    
                    // 0 : No score | 1 : P1 score | 2 : P2 score | -1 : Limit score
                    const scorer = this.checkScoring(game, shape)
                    if (scorer !== 0) {
                        this.deleteBullet(game, shape);
                        if (scorer > 0)
                            this.startNewBullet(game, scorer);
                        return;
                    }
                    // Change bullet.pos with new value
                    shape.pos.x += shape.v * Math.cos(shape.a);
                    shape.pos.y += shape.v * Math.sin(shape.a);
                    
                    // Recalculate the delay based on the new frequency
                    delay = 1000 / shape.f;
                    
                    // Clear the previous interval and create a new one with the updated delay                    
                    clearInterval(game.bulletInterval);
                    game.bulletInterval = setInterval(intervalFunction, delay);
                }})
            };

        // Set the interval to move bullet if not define
        if (game.bulletInterval === undefined) {
            game.bulletInterval = setInterval(intervalFunction, delay);
        }
    }

    private startNewBullet(game : Game, side : number) : void {
        // delete bullet who score
        // create new bullet to player who score/ get scored ?
        // user click to send bullet (time to send or bullet go himself)
        // don't stop timing game or maybe yes

        // TODO Multi_ball
        // delete la bullet precise
        // creer balle relance jsute debut game et quand plsu de bullet sur terrain

        const r = 5;


        let newX : number;
        let newY : number;
        let newA : number;

        if (side === 1) {
            newA = 0;
            newX = game.p1.racket.pos.x + game.p1.racket.width + r + 1;
            newY = game.p1.racket.pos.y + game.p1.racket.length / 2;
            game.p1.relaunchBulletBool = true;
        } else if (side === 2) {
            newA = Math.PI;
            newX = game.p2.racket.pos.x - r - 1;
            newY = game.p2.racket.pos.y + game.p2.racket.length / 2;
            game.p2.relaunchBulletBool = true;
        }

        // Creation New bullet
        // x, y, r, v, f, a
        const bullet_01 = new Bullet(newX, newY, r, 3, 30, newA);
        game.shapes.push(bullet_01);

        //game.server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
            
        // TODO
        // get timer in game setting
        // timer to clic
        // sinon fin timer lance

        game.launchBulletTimer = setTimeout(() => {
                // Player got X ms to launch bullet
                if (side === 1)
                    game.p1.relaunchBulletBool = false;
                else if (side === 2)
                    game.p2.relaunchBulletBool = false;
                this.startMoving(game.server, game, bullet_01);
            }, 5000);

    
    // clearInterval(launchBulletTimer);
    //this.startMoving(game.server, game, bullet_01);

    }

    private deleteBullet(game : Game, bullet : Bullet) : void {
        // console.log("delete bullet");
        const index = game.shapes.findIndex(shape => shape instanceof Bullet && 
                                            bullet.pos === bullet.pos)
        if (index === -1)
            return;

        game.shapes.splice(index, 1);
        // if 0 bullet stop bulletinterval
        clearInterval(game.bulletInterval);
        game.bulletInterval = undefined;
        clearInterval(game.frequencyInterval);
        game.frequencyInterval = undefined;
    }
      
    private checkScoring(game : Game, bullet : Bullet) : number {
        // si scoring retirer bullet qui a marque de la partie
        // si plus de bullet en jeux en remettre une pour le joueur qui a perdu ou inverse

        if (bullet.pos.x + bullet.r > game.field.width) {
            game.p2.score++;
            game.server.to(game.roomId).emit(EventGame.gameScore, game.p2);
            if (game.limitScoreBool === true && game.p2.score >= game.limitScore)
                return (this.victoryByScore(game));
            return 2;
        } else if (bullet.pos.x - bullet.r < 0) {
            game.p1.score++;
            game.server.to(game.roomId).emit(EventGame.gameScore, game.p1);
            if (game.limitScoreBool === true && game.p1.score >= game.limitScore)
                return (this.victoryByScore(game));
            return 1;
        } else {
            return 0;
        }
    }

    private victoryByScore(game : Game) : number {
        // stop game
        this.stopGame(game.server, game);

        console.log("++++++ VICTOIRE SCORE");

        // get who win
        let scoreP1;
        let scoreP2;
        if (game.p1.score > game.p2.score) {
            scoreP1 = 1;
            scoreP2 = 0;
        }
        else if (game.p1.score < game.p2.score) {
            scoreP1 = 0;
            scoreP2 = 1;
        }
        else {
            scoreP1 = 0.5;
            scoreP2 = 0.5;
        }

        // calcul new elo
        this.newElo(game, scoreP1, scoreP2)

        // send to front type of victory
        game.server.to(game.roomId).emit(EventGame.gameVictoryScore, {p1 : game.p1, p2 : game.p2})
        return -1;
    }

    private victoryByGiveUpLimitMax(game : Game, winner : number) : void {
        // stop game
        this.stopGame(game.server, game);

        // winner == 1 -> player 1 win
        // winner == 2 -> player 2 win

        console.log("++++++ VICTOIRE ABANDON");
        // get who win + calcul new elo
        if (winner === 1) // p1 win
            this.newElo(game, 1, 0);
        else if (winner === 2) // p2 win
            this.newElo(game, 0, 1);

        // TODO
        // change to gamevictoryGiveup
        game.server.to(game.roomId).emit(EventGame.gameVictoryScore, {p1 : game.p1, p2 : game.p2})
    }

    private newElo(game : Game, scoreP1 : number, scoreP2 : number) : void {
        // TODO
        // change nombregame (facteur K)
        this.calculateElo(game.p1.elo, game.p2.elo, scoreP1, 5); // last = nb game jouer
        this.calculateElo(game.p2.elo, game.p1.elo, scoreP2, 5);
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
                    // console.log("Collision with Cercle !");
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
                    // console.log("--Collision with Square !:", i);
                    // Cas racket
                    if (i < 2) // i = 0 J1 | i = 1 j2
                        this.collisionRacket(game, bullet, shape);
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

    private collisionRacket(game : Game, bullet : Bullet, racket: Square) : void {
    // if angle to acute
    const pi3 = Math.PI / 3;
    const pi2 = Math.PI / 2
    const pi3o = 2 * Math.PI /3

    // Where is bullet on our racket
    const pourcentbullet = ((bullet.pos.y - racket.pos.y) / racket.length) * 100;

    // change direction from where is bullet on racket 
    const angleFinal = (pourcentbullet / 100) * pi3o - pi3;
    if (bullet.a > Math.PI)
        bullet.a -= Math.PI * 2;
    else if (bullet.a < -Math.PI)
        bullet.a += Math.PI * 2;

    // console.log(`(${pourcentbullet} / 100) * ${pi3o} - ${pi3} = ${angleFinal}`);

    // console.log("angle :", bullet.a);
    // console.log("angle%:", bullet.a % Math.PI);
    // console.log("pi2 :", pi2);
    // console.log("-pi2:", -pi2);

    // check if bullet is part left or right map
    if (bullet.pos.x > game.field.width / 2) { // bullet go right
        bullet.a = angleFinal;
        if (angleFinal < 0)
            bullet.a = (pi2 - angleFinal) + pi2;
        else
            bullet.a = (-pi2 - angleFinal) - pi2;
    }
    else // bullet go left
        bullet.a = angleFinal;
    console.log("angleF:", bullet.a);
    console.log();
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

        // console.log(bullet.pos.x, bullet.pos.y);
        // console.log(x1, x2);
        // console.log(y1, y2);

        // console.log("dx", dx);
        // console.log("dy", dy);

        //console.log(dx, "<", dy, ":",dx < dy);

        //dx = distance wall vertical
        //dy = distance wall horizontaux

        // TODO
        // check if dx && dy < bullet.r ou petit poru detecter coin
        // appliquer collision cercle


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

    private setBulletRelaunch(game : Game, racket : Square) : void {
        const index = game.shapes.findIndex( (shape) => shape instanceof Bullet);
        if (index === -1)
            return ;
        
        let temp = game.shapes[index] as Bullet;
        temp.pos.y = racket.pos.y + racket.length / 2;
        this.collisionRacket(game, temp, racket);

    }
}