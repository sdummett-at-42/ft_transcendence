import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Shape, Square , Bullet, Circle, Coordonnee , Player, Field} from './entities/game.entities';
import { GameGateway } from './game.gateway';
import { Response } from 'express';
import * as fs from "fs";

@Injectable()
export class GameService {
    
    field = new Field(400, 800);
    shapes : Shape[] = [];
    bulletInterval: NodeJS.Timeout; // stocker ID de l'intervalle de la partie
    frequencyInterval: NodeJS.Timeout; // stocker ID de l'intervalle f bullet

    //x:number, y:number, height:number, width:number) {
    player1 = new Player(20, 200, 84, 5);

    /* ******************* *\
    |* input/entry functon *|
    \* ******************* */

    async initGame(id: string, res : Response) {
        const data = await fs.promises.readFile('src/modules/game/Dir/game.html', 'utf8');
        this.shapes.push(this.player1.racket);
        res.send(data);
    }

    startingGame(server : Server) : void {
        if (this.shapes.length > 1 ) {
            console.log("Partie deja en cours");
        }
        else {
            if (this.shapes.length === 0 )
                this.shapes.push(this.player1.racket);
            console.log("starting game !");

            // Creation bullet
            // x, y, r, v, f, a
            let bullet_01 = new Bullet(200, 200, 180, 3, 30, 3.14 );
            this.shapes.push(bullet_01);

            // Creation Circle : x, y, r
            // const circle_01 = new Circle(50, 175, 30);
            // this.shapes.push(circle_01);


            server.emit("image", this.shapes);

            this.startMoving(server, bullet_01);

        }
    }

    stopGame(server : Server) : void {
        console.log("amour");
        if (this.shapes.length <= 1 ) {
            console.log("la partie n'a pas commence !");
            return null;
        }
        else {
            console.log("Fin de la partie !");

            console.log(this.shapes.length);
            clearInterval(this.frequencyInterval);
            clearInterval(this.bulletInterval);
            this.shapes.splice(1);

            console.log("sub", this.shapes.length);
            server.emit('image', this.shapes);
        }
    }

    mouvementGame(server : Server, x : number, y : number) : void { // faire pour joueur 1 et 2
        let tmpYmin : number = y - this.player1.racket.length / 2; // tmpY = haut de la racket
        let tmpYmax : number = y + this.player1.racket.length / 2; // tmpY = bas de la racket      
        
        if (tmpYmin < 0) // si haut racket trop haut
            this.player1.racket.pos.y = 0;
        else if (tmpYmax > this.field.height) // si haut racket trop bas
            this.player1.racket.pos.y = this.field.height - this.player1.racket.length;
        else
            this.player1.racket.pos.y = tmpYmin;
        
        // console.log("Ymin", tmpYmin);
        // console.log("Ymax", tmpYmax);
        // console.log("fild", this.field.height);
        // console.log("Yfin", this.player1.racket.pos.y);


        // console.log(this.player1.racket);
        //console.log(this.shapes);
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
      
      
      

    checkCollision(bullet : Bullet) : void {
        // Vérifier si la balle touche les murs horizontaux
        if (bullet.pos.y + bullet.r > this.field.height || bullet.pos.y - bullet.r < 0)
            bullet.a = -bullet.a;
        //console.log(bullet.a);

        // Check mur verticaux for fun || a supprime plus tard ou juste scorer
        if (bullet.pos.x + bullet.r > this.field.width) {
            bullet.pos.x = this.field.width - bullet.r;  // corrige la position pour éviter que la balle passe à travers le mur
            bullet.a = Math.PI - bullet.a;
        } else if (bullet.pos.x - bullet.r < 0) {
            bullet.pos.x = bullet.r;  // corrige la position pour éviter que la balle passe à travers le mur
            bullet.a = Math.PI - bullet.a;
        }
            
        // si collision, changer direction bullet
    
        // Check if bullet hit an other shape
        // collision activate with Square and Circle
        // no collision between bullet (or himself)
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            if (shape instanceof Circle) {
                // check if collision with circle
                const dx :number = Math.pow(shape.pos.x - bullet.pos.x, 2);
                const dy :number = Math.pow(shape.pos.y - bullet.pos.y, 2);
                const dist = Math.sqrt(dx + dy);
                if (dist <= shape.r + bullet.r) {// if true => change dir bullet
                    console.log("Collision with Cercle !");
                    // calculer angle collision
                    bullet.a = Math.PI - bullet.a;

                }
            } else if (shape instanceof Square) {
                // check if collision with Square
                const minX : number = bullet.pos.x - bullet.r; 
                const maxX : number = bullet.pos.x + bullet.r; 
                const minY : number = bullet.pos.y - bullet.r; 
                const maxY : number = bullet.pos.y + bullet.r; 
                // if true => change dir bullet
                // if (shape.pos.x <= maxX && shape.pos.x + shape.length <= minX
                //     && shape.pos.y <= maxY && shape.pos.y + shape.width <= minY) {
                //         console.log("Collision with Square !"); 
                //         bullet.a += 2;
                //     }

                console.log(minX, maxX, minY, maxY);
                console.log(shape.pos.x, shape.pos.x + shape.width, shape.pos.y, shape.pos.y + shape.length);

                if (((minX >= shape.pos.x && minX <= shape.pos.x + shape.width) || //    si partie gauche bullet
                    (maxX >= shape.pos.x && maxX <= shape.pos.x + shape.width)) && // ou si partie droite
                    ((minY >= shape.pos.y && minY <= shape.pos.y + shape.length) ||//et  si partie haute bullet
                    (maxY >= shape.pos.y && maxY <= shape.pos.y + shape.length)) // ou    si partie bas bullet
                    ) {
                    console.log("Collision with Square !");
                    bullet.a = Math.PI - bullet.a;
                }
            }
        }
        // Si aucune collision détectée, nothing change
    }
}
