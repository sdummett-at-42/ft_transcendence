import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Shape, Square , Bullet, Circle, Coordonnee , Player, Field, BlackHole} from './entities/game.entities';
import { GameGateway } from './game.gateway';
import { Response } from 'express';

@Injectable()
export class GameService {
    numberElement = 2;

    field = new Field(400, 800);
    shapes : Shape[] = [];
    bulletInterval: NodeJS.Timeout; // stocker ID de l'intervalle de la partie
    frequencyInterval: NodeJS.Timeout; // stocker ID de l'intervalle f bullet

    //x:number, y:number, height:number, width:number)
    // a pofiner plus tard pour le set up des positions
    player1 = new Player(20, 200, 84, 5);
    player2 = new Player(780, 200, 84, 5);

    /* ******************* *\
    |* input/entry functon *|
    \* ******************* */

    initGame(server : Server, user : Socket) {
        // declarer ici tous les elements de la carte dans shapes et mettre le count dans numberElement
        // on count pour numberElement lors reset/scoring
        this.shapes.push(this.player1.racket);
        this.shapes.push(this.player2.racket);

        // Creation Circle : x, y, r
        const circle_01 = new Circle(200, 100, 30);
        this.shapes.push(circle_01);

        // Creation square : x, y, l, w
        const square_01 = new Square(400, 240, 50, 100);
        this.shapes.push(square_01);

        // Creation BlackHole : x, y, l, w
        const BlackHole_01 = new BlackHole(200, 300, 45);
        this.shapes.push(BlackHole_01);

        this.numberElement = this.shapes.length;
        server.emit("image", this.shapes);   
    }

    startingGame(server : Server) : void {
        if (this.shapes.length > this.numberElement ) {
            console.log("Partie deja en cours");
        }
        else {
            if (this.shapes.length === 0 )
                this.shapes.push(this.player1.racket);
            console.log("starting game !");

            // Creation bullet
            // x, y, r, v, f, a
            let bullet_01 = new Bullet(200, 200, 6, 3, 50, 3.14 );
            this.shapes.push(bullet_01);


            server.emit("image", this.shapes);

            this.startMoving(server, bullet_01);

        }
    }

    stopGame(server : Server) : void {
        console.log("amour");
        if (this.shapes.length <= this.numberElement ) {
            console.log("la partie n'a pas commence !");
            return null;
        }
        else {
            console.log("Fin de la partie !");//

            //console.log(this.shapes.length);
            //console.log(this.shapes[2]);//

            clearInterval(this.frequencyInterval);
            clearInterval(this.bulletInterval);
            this.shapes.splice(this.numberElement);

            console.log("sub", this.shapes.length);
            server.emit('image', this.shapes);
        }
    }

    mouvementGame(server : Server, x : number, y : number) : void { // faire pour joueur 1 et 2
        let tmpYmin : number = y - this.player1.racket.length / 2; // tmpY = haut de la racket
        let tmpYmax : number = y + this.player1.racket.length / 2; // tmpY = bas de la racket      
        
        // Player 1
        if (tmpYmin < 0) // si haut racket trop haut
            this.player1.racket.pos.y = 0;
        else if (tmpYmax > this.field.height) // si haut racket trop bas
            this.player1.racket.pos.y = this.field.height - this.player1.racket.length;
        else
            this.player1.racket.pos.y = tmpYmin;
        
        // Player 2
        if (tmpYmin < 0) // si haut racket trop haut
            this.player2.racket.pos.y = 0;
        else if (tmpYmax > this.field.height) // si haut racket trop bas
            this.player2.racket.pos.y = this.field.height - this.player2.racket.length;
        else
            this.player2.racket.pos.y = tmpYmin;

        server.emit('image', this.shapes);
    }

    /* *************** *\
    |* Interne functon *|
    \* *************** */

    startMoving(server: Server, bullet: Bullet) {
        if (this.bulletInterval)
            clearInterval(this.bulletInterval);
      
        let delay = 1000 / bullet.f;
        console.log("delay = ", delay, " bullet.r * Math.cos(bullet.a) = " ,bullet.r * Math.cos(bullet.a));
      

        // Start the interval to increment to all bullet.f every second
        this.frequencyInterval = setInterval(() => {
            bullet.f += 5;
            console.log("bullet frequency: ", bullet.f);
        }, 1000);


        const intervalFunction = () => {
            // Check if bullet got collisionwith element if collision bullet.a will change
            this.checkCollision(bullet);
        
            // Change bullet.pos with new value
            bullet.pos.x += bullet.v * Math.cos(bullet.a);
            bullet.pos.y += bullet.v * Math.sin(bullet.a);
        
        //console.log(`position = (${bullet.pos.x}.${bullet.pos.y})`);
        
            // send shapes[] to front
            server.emit('image', this.shapes);
        
            // Recalculate the delay based on the new frequency
            delay = 1000 / bullet.f;
        
            // Clear the previous interval and create a new one with the updated delay
            clearInterval(this.bulletInterval);
            this.bulletInterval = setInterval(intervalFunction, delay);
        };
      
        // Set the first interval
        this.bulletInterval = setInterval(intervalFunction, delay);
    }
      
    checkScoring(bullet : Bullet) : void {
        // si scoring retirer bullet qui a marque de la partie
        // si plus de bullet en jeux en remettre une pour le joueur qui a perdu ou inverse

        if (bullet.pos.x + bullet.r > this.field.width) {
            this.player2.score++;
        } else if (bullet.pos.x - bullet.r < 0) {
            this.player1.score++;
        }
    }

    checkCollision(bullet : Bullet) : void {
        // Vérifier si la balle touche les murs horizontaux
        if (bullet.pos.y + bullet.r > this.field.height || bullet.pos.y - bullet.r < 0)
            bullet.a = -bullet.a;
        //console.log(bullet.a);
            
        // si collision, changer direction bullet

        // Check if bullet hit an other shape
        // collision activate with Square and Circle
        // no collision between bullet (or himself)
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            // Mettre optimisation check si radius bullet et radius shape no hit
            // === >

            if (shape instanceof Circle || shape instanceof BlackHole) {
                // check if collision with circle
                let dx :number = Math.pow(shape.pos.x - bullet.pos.x, 2);
                let dy :number = Math.pow(shape.pos.y - bullet.pos.y, 2);
                const dist = Math.sqrt(dx + dy);
                if (dist <= shape.r + bullet.r) {// if true => change dir bullet
                    console.log("Collision with Cercle !");

                    // Mettre à jour l'angle de la balle
                    if (shape instanceof BlackHole)
                        this.collisionBlackHole(bullet, shape);
                    else
                        this.collisionCircle(bullet, shape);

                }
            } else if (shape instanceof Square) {
                // check if collision with Square
                const minX : number = bullet.pos.x - bullet.r; 
                const maxX : number = bullet.pos.x + bullet.r; 
                const minY : number = bullet.pos.y - bullet.r; 
                const maxY : number = bullet.pos.y + bullet.r; 

                // erreur si balle trop grosse (bullet > obstacle ou racket) a changer avec les differents idees
                if (((minX >= shape.pos.x && minX <= shape.pos.x + shape.width) || //    si partie gauche bullet
                    (maxX >= shape.pos.x && maxX <= shape.pos.x + shape.width)) && // ou si partie droite
                    ((minY >= shape.pos.y && minY <= shape.pos.y + shape.length) ||//et  si partie haute bullet
                    (maxY >= shape.pos.y && maxY <= shape.pos.y + shape.length)) // ou    si partie bas bullet
                    ) {
                    console.log("Collision with Square !");

                    // Cas racket
                    if (i < 2) // i = 0 J1 | i = 1 j2
                        this.collisionRacket(bullet, shape);
                    else // Square on map
                        this.collisionSquare(bullet, shape);
                }
            }
        }
    }

    collisionRacket(bullet : Bullet, racket: Square) : void {
        const centerX = racket.pos.x + racket.width / 2;
        const centerY = racket.pos.y + racket.length / 2;
        const deltaX = bullet.pos.x - centerX;
        const deltaY = bullet.pos.y - centerY;
        let angle = Math.atan2(deltaY, deltaX);
        console.log(angle);

        // if angle to acute
        if (angle >= 1.1 && angle <= 2.2) { // high 
            if (angle < 1.6)
                angle = 1.1
            else
                angle = 2.2
        }
        else if (angle <= -1.1 && angle >= -2.2) { // low
        if (angle > -1.6)
                angle = -1.1
            else
                angle = -2.2
        }
        // change bullet.a
        bullet.a = angle;
    }

    collisionSquare(bullet : Bullet, square : Square) : void {
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
            // Collision with horizontal edge
            bullet.a = Math.PI - bullet.a;
        } else {
            // Collision with vertical edge
            bullet.a = 2 * Math.PI - bullet.a;
        }
    }

    collisionBlackHole(bullet : Bullet, bh : BlackHole) : void {
        const dx = bullet.pos.x - bh.pos.x;
        const dy = bullet.pos.y - bh.pos.y;

        const newAngle = 2 * Math.atan2(dy, dx) - bullet.a + Math.PI;

        // Change bullet.a
        bullet.a = newAngle - Math.PI;
    }

    collisionCircle(bullet : Bullet, circle : Circle) : void {
        // Collision angle
        const angle = Math.atan2(bullet.pos.y - circle.pos.y, bullet.pos.x - circle.pos.x);
        
        // Angle of reflection
        const reflectionAngle = 2 * angle - bullet.a + Math.PI;

        // Change bullet.a
        bullet.a = reflectionAngle;
    }
}