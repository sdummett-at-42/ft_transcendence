import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Shape, Square , Bullet, Circle, BlackHole, Game } from './entities/game.entities';
import { EventGame } from './game-event.enum';
import { PrismaService } from 'nestjs-prisma';
import { FriendsService } from "../friends/friends.service";
import { NotificationsGateway } from "./../notifications/notifications.gateway"

@Injectable()
export class GameService {
    constructor(
        private readonly notif : NotificationsGateway,
        private readonly prisma: PrismaService,
        private readonly friends: FriendsService,
    ) { }

    /* ******************* *\
    |* input/entry functon *|
    \* ******************* */

    // un seul socket joueur
    // attendre les 2 joueurs present

    onMatch(game : Game) : Boolean {
        if (game.endBool === true) // match is finished
            return false;
        return true;
    }

    // join room game + set up player
    joinGame(server: Server, game : Game, client : Socket, roomId : string) {
        client.join(roomId);

        if (client.data.userId === game.p1.id) // player 1
            game.p1.socket = client.data.socket;
        if (client.data.userId === game.p2.id) // player 2
            game.p2.socket = client.data.socket;

        server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
        // When 1 player are in game, laucnh timer if Player 2 doesn't join
        // 15 sec to join
        if (game.p1.socket != undefined || game.p2.socket != undefined) {
            clearTimeout(game.timeoutJoin);
            game.timeoutJoin = setTimeout(() => {
                if (game.p1.socket === undefined) // player 2 win abandon
                    this.victoryByGiveUpLimitMax(game, 2);
                if (game.p2.socket === undefined) // player 1 win abandon
                    this.victoryByGiveUpLimitMax(game, 1);
            }, 15000)
        }

        // When 2 player are here start game
        if (game.p1.socket != undefined && game.p2.socket != undefined) {
            // stop timer
            clearTimeout(game.timeoutJoin);
            if (game.startBool === false)
                this.startingGame(server, game);
        }
    }

    startingGame(server : Server, game : Game) : void {
        // Set game Start
        game.startBool = true;

        // Bullet start side player 1
        this.startNewBullet(game, 1);

        // Set date start game
        game.dateStart =  new Date();
        let elapsedTime : number;
        const delay = 1000 / 60 // ~60 emit sec

        // Start game interval
        game.gameInterval = setInterval(() => {
            if (game.pause === true) { // game in pause
                const dateActual = new Date().getTime();
                
                // si p1Pause && limit pause depasser = victoire forfait
                if (game.pauseP1 === true) {
                    const check : number = game.pauseP1Time + dateActual - game.pauseP1Start.getTime();
                    if (game.limitPauseTimerBool && check >= game.limitPauseTimer ||
                        game.pauseP1Max >= game.pauseTotalMax) {
                        this.victoryByGiveUpLimitMax(game, 2);
                         return ;
                    }
                }
                // if player 2 pause
                if (game.pauseP2 === true) {
                    const check : number = game.pauseP2Time + dateActual - game.pauseP2Start.getTime();;
                    if (game.limitPauseTimerBool && check >= game.limitPauseTimer ||
                        game.pauseP2Max >= game.pauseTotalMax) {
                        this.victoryByGiveUpLimitMax(game, 1);
                        return ;
                    }
                }

                } else { // game not in pause
                    // check game timer end
                    elapsedTime = Math.floor(new Date().getTime() - game.dateStart.getTime() - game.pauseTotalTime);
                    // check Limit timer et score non egalitaire
                    if (game.limitTimerBool === true && elapsedTime >= game.limitTimer && game.p1.score != game.p2.score) {
                        this.victoryByScore(game);
                        return ;
                    }
                }
                server.to(game.roomId).emit(EventGame.gameImage, game.shapes);
                server.to(game.roomId).emit(EventGame.gameTimer, elapsedTime);
            }, delay);
    }

    pauseGame(game : Game, idPause : number) : void {
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

        clearInterval(game.bulletInterval);
        game.bulletInterval = undefined;

        clearInterval(game.frequencyInterval);
        game.frequencyInterval = undefined;
    }

    resumeGame(game : Game, idResume : number) : void {
        if (!game.pause)
            return ;

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

            // check if relaunch
            if (!game.p1.relaunchBulletBool && !game.p2.relaunchBulletBool)
                game.shapes.forEach((shape) => {
                    if (shape instanceof Bullet)
                        this.startMoving(game.server, game, shape);
                })
            else {
                let side;
                const bullet : Shape = game.shapes.find(shape => shape instanceof Bullet)
                if (bullet === undefined || !(bullet instanceof Bullet))
                    return ;
                if (game.p1.relaunchBulletBool)
                    side = 1;
                else
                    side = 2;
                game.launchBulletTimer = setTimeout(() => {
                    // Player got X ms to launch bullet
                    if (side === 1)
                        game.p1.relaunchBulletBool = false;
                    else if (side === 2)
                        game.p2.relaunchBulletBool = false;
                    this.startMoving(game.server, game, bullet);
                }, 3000);
            }
        }             
    }

    // stop all interval et clear all bullet
    stopGame(server : Server, game : Game) : void {

        clearInterval(game.bulletInterval);
        game.bulletInterval = undefined;


        clearInterval(game.frequencyInterval);
        game.frequencyInterval = undefined;
            
        // and clear all element add after init
        game.shapes.splice(game.numberElement);

        // Stop game's interval
        clearInterval(game.gameInterval);
        game.gameInterval = undefined;
            
        // Bool endgame true
        game.endBool = true;
        
        server.to(game.roomId).emit(EventGame.gameImage, game.shapes);

        game.frequencyInterval = undefined;
        // Delete game in 60 sec
        // game.frequencyInterval = setTimeout(() => {
            game.deleteBool = true;
        // console.log("delete this game");
        // }, 60000);
    }

    mouvementGame(server : Server, game : Game, client : Socket, x : number, y : number) : void { // faire pour joueur 1 et 2

        let tmpYmin : number = y - game.p1.racket.length / 2; // tmpY = haut de la racket
        let tmpYmax : number = y + game.p1.racket.length / 2; // tmpY = bas de la racket      
        
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
        let delay = 1000 / bullet.f;
      

        // Start the interval to increment to all bullet.f every second
        if (game.frequencyInterval === undefined) {
                game.frequencyInterval = setInterval(() => {
                    game.shapes.forEach((shape) => {
                        if (shape instanceof Bullet) {
                            shape.f += shape.speed;
                        }})
                }, 1000);
        }



        const intervalFunction = () => {

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

        if (side === 1)
            this.setBulletRelaunch(game, game.p1.racket);
        else
            this.setBulletRelaunch(game, game.p2.racket);


        //game.server.to(game.roomId).emit(EventGame.gameImage, game.shapes);

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
            game.p1.score++;
            game.server.to(game.roomId).emit(EventGame.gameScore, game.p1);
            if (game.limitScoreBool === true && game.p1.score >= game.limitScore) {
                this.victoryByScore(game);
                return -1;
            }
            return 2;
        } else if (bullet.pos.x - bullet.r < 0) {
            game.p2.score++;
            game.server.to(game.roomId).emit(EventGame.gameScore, game.p2);
            if (game.limitScoreBool === true && game.p2.score >= game.limitScore) {
                this.victoryByScore(game);
                return -1;
            }
            return 1;
        } else {
            return 0;
        }
    }

    private async victoryByScore(game : Game) {
        // stop game
        this.stopGame(game.server, game);


        game.typewin = false; // win by score

        // get who win
        let scoreP1;
        let scoreP2;
        if (game.p1.score > game.p2.score) {
            scoreP1 = 1;
            scoreP2 = 0;
            // calcul new elo
            await this.newElo(game, scoreP1, scoreP2)
            game.winner = game.p1 ;
            game.loser = game.p2;
        }
        else if (game.p1.score < game.p2.score) {
            scoreP1 = 0;
            scoreP2 = 1;
            // calcul new elo
            await this.newElo(game, scoreP1, scoreP2)
            game.winner = game.p2 ;
            game.loser = game.p1;
        }
        else {
            scoreP1 = 0.5;
            scoreP2 = 0.5;
        }

        // calcul new elo
        // this.newElo(game, scoreP1, scoreP2)

        // send to front type of victory
        game.server.to(game.roomId).emit(EventGame.gameVictory, {type : game.typewin, winner : game.winner, loser : game.loser, boolRanked : game.boolRanked})
        return -1;
    }

    private async victoryByGiveUpLimitMax(game : Game, winner : number) {
        // stop game
        this.stopGame(game.server, game);

        game.typewin = true; // win by giveup

        // winner == 1 -> player 1 win
        // winner == 2 -> player 2 win

        // get who win + calcul new elo
        if (winner === 1) { // p1 win
            await this.newElo(game, 1, 0);
            game.winner = game.p1 ;
            game.loser = game.p2;
        }
        else if (winner === 2) { // p2 win
            await this.newElo(game, 0, 1);
            game.winner = game.p2;
            game.loser = game.p1 ;
        }

        game.server.to(game.roomId).emit(EventGame.gameVictory, {type : game.typewin, winner : game.winner, loser : game.loser, boolRanked : game.boolRanked});
    }

    private async newElo(game : Game, scoreP1 : number, scoreP2 : number) {
        // const users = await this.prisma.user.findMany();

        const p1Prisma = await this.prisma.user.findUnique({
            where : {id : game.p1.id},
        });
        const p2Prisma = await this.prisma.user.findUnique({
            where : {id : game.p2.id},
        });

        // Check if ranked game
        if (game.boolRanked) {
            this.updateElo(game.p1.id, game.p1.elo, game.p1.eloChange = this.calculateElo(game.p1.elo, game.p2.elo, scoreP1, p1Prisma.eloHistory.length)); // last = nb game jouer
            this.updateElo(game.p2.id, game.p2.elo, game.p2.eloChange = this.calculateElo(game.p2.elo, game.p1.elo, scoreP2, p2Prisma.eloHistory.length));
        }
        
        await this.updatePrisma(game, scoreP1, p1Prisma, p2Prisma);
    }

    private calculateElo(oldElo: number, opponentElo: number, score: number, gamesPlayed: number): number {
        const k = this.getKFactor(gamesPlayed);
        const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - oldElo) / 400));
        const eloChange = k * (score - expectedScore);
        // const newElo = oldElo + eloChange;
      
        return Math.round(eloChange);
    }
      
    private getKFactor(gamesPlayed: number): number {
        if (gamesPlayed < 30)
            return 40;
        else if (gamesPlayed < 50)
            return 20;
        else
            return 10;
        
    }

    private async updateElo(id : number, oldElo : number, eloChange : number){
        const newElo = oldElo + eloChange;
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                elo: newElo,
                eloHistory: {push:newElo}
            }
          });
    }

    private async updatePrisma(game : Game, scoreP1 : number,  p1Prisma, p2Prisma) {
        let winnerId;
        let looserId;
        let winnerScore;
        let looserScore;

        if (scoreP1 === 1) {
            winnerId = p1Prisma.id;
            looserId = p2Prisma.id;
            winnerScore = game.p1.score;
            looserScore = game.p2.score;
        } else {
            winnerId = p2Prisma.id;
            looserId = p1Prisma.id;
            winnerScore = game.p2.score;
            looserScore = game.p1.score;
        }

        const match = await this.prisma.match.create({
			data: {
                winner: { connect: { id: winnerId } },
                looser: { connect: { id: looserId } },
                winnerScore: winnerScore,
                looserScore: looserScore
			},
		});
    }
      
    private checkCollision(game : Game, bullet : Bullet) {
        // Vérifier si la balle touche les murs horizontaux
        if (bullet.pos.y + bullet.r > game.field.height) { // bottom
            bullet.a = -bullet.a;
            bullet.pos.y -= 3;
        }
        if (bullet.pos.y - bullet.r < 0) { // top
            bullet.a = -bullet.a;
            bullet.pos.y += 3;
        }
            
        // Check if bullet hit an other shape
        // collision activate with Square and Circle
        // no collision between bullet (or himself)
        for (let i = 0; i < game.shapes.length; i++) {
            const shape = game.shapes[i];
            // Mettre optimisation check si radius bullet et radius shape no hit
            // === >
            if (shape instanceof Circle || shape instanceof BlackHole) {
                // check if collision with circle
                if (this.checkInRangeCircle(bullet, shape)) {
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
        const pourcentbullet = (bullet.pos.y - racket.pos.y) / racket.length;

        // change direction from where is bullet on racket 
        const angleFinal = pourcentbullet * pi3o - pi3;
        if (bullet.a > Math.PI)
            bullet.a -= Math.PI * 2;
        else if (bullet.a < -Math.PI)
            bullet.a += Math.PI * 2;

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
        
        // Change bullet.a according to...
        if (dx < dy) {
            // Collision with vertical edge
            bullet.a = Math.PI - bullet.a;
        } else {
            // Collision with horozontal edge
            
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
        // Get pourcent racket.y on field.y
        const pourcentRacket = 1 - ((racket.pos.y + racket.length / 2) / game.field.height );
        // Place Bullet on racket from pourcent
        temp.pos.y = (pourcentRacket * racket.length) + racket.pos.y;
        this.collisionRacket(game, temp, racket);
    }

}