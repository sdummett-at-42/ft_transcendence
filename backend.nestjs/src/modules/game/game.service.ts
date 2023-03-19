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
    bulletInterval: NodeJS.Timeout; // stocker ID de l'intervalle
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
            // x, y, r, v, f, a
            let bullet_01 = new Bullet(200, 200, 6, 3, 80, 3.14 /4);
            this.shapes.push(bullet_01);

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
        if (this.bulletInterval) clearInterval(this.bulletInterval);

        let delay = 1000 / bullet.f;
        console.log("delay = ", delay, " bullet.r * Math.cos(bullet.a) = " ,bullet.r * Math.cos(bullet.a));

        this.bulletInterval = setInterval(() => {
            const collisionInfo = this.checkCollision(bullet);
            if (collisionInfo.collision === false) {
                bullet.pos.x += bullet.v * Math.cos(bullet.a);
                bullet.pos.y += bullet.v * Math.sin(bullet.a);
            }
            else {
                const collisionShape = collisionInfo.shape;
                const collisionAngle = this.collisionAngle(bullet, collisionShape);
                this.bounce(bullet, collisionAngle);
                bullet.pos.x += bullet.v * Math.cos(bullet.a);
                bullet.pos.y += bullet.v * Math.sin(bullet.a);
            }
            console.log(`position = (${bullet.pos.x}.${bullet.pos.y})`);
            server.emit('image', this.shapes);
        }, delay);
    }

    checkCollision(bullet : Bullet) : {collision: boolean, shape : Shape | null} {
        // Vérifier si la balle touche les murs horizontaux
        if (bullet.pos.y + bullet.r > this.field.height || bullet.pos.y - bullet.r < 0)
            bullet.a = -bullet.a;

        // Check mur verticaux for fun
        if (bullet.pos.x + bullet.r > this.field.width) {
            bullet.pos.x = this.field.width - bullet.r;  // corrige la position pour éviter que la balle passe à travers le mur
            bullet.a = Math.PI - bullet.a;
        } else if (bullet.pos.x - bullet.r < 0) {
            bullet.pos.x = bullet.r;  // corrige la position pour éviter que la balle passe à travers le mur
            bullet.a = Math.PI - bullet.a;
        }
            
        //return {collision: true, shape : null}; 
    
        // Vérifier si la balle touche une autre forme
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            if (shape instanceof Circle) {
                const dx = bullet.pos.x - shape.pos.x;
                const dy = bullet.pos.y - shape.pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < bullet.r + shape.r) {
                    return {collision : true, shape : shape};
                }
            } else if (shape instanceof Square) {
                if (bullet.pos.x + bullet.r > shape.pos.x && bullet.pos.x - bullet.r < shape.pos.x + shape.width &&
                    bullet.pos.y + bullet.r > shape.pos.y && bullet.pos.y - bullet.r < shape.pos.y + shape.length) {
                        return {collision : true, shape : shape};
                }
            }
        }
        // Si aucune collision détectée, renvoyer false
        return {collision: false, shape : null};
    }

    collisionAngle(bullet: Bullet, collisionShape: Shape): number | null {
        // Vérifier si la balle touche une autre forme
        if (collisionShape instanceof Circle) {
            const dx = bullet.pos.x - collisionShape.pos.x;
            const dy = bullet.pos.y - collisionShape.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bullet.r + collisionShape.r) {
                // Calculer l'angle de collision
                const angle = Math.atan2(dy, dx);
                return angle;
            }
            else if (collisionShape instanceof Square) {
                // Vérifier si la balle touche le carré
                const halfWidth = collisionShape.width / 2;
                const halfLength = collisionShape.length / 2;
                if (bullet.pos.x + bullet.r > collisionShape.pos.x - halfWidth &&
                    bullet.pos.x - bullet.r < collisionShape.pos.x + halfWidth &&
                    bullet.pos.y + bullet.r > collisionShape.pos.y - halfLength &&
                    bullet.pos.y - bullet.r < collisionShape.pos.y + halfLength) {
                    // Calculer l'angle de collision
                    const dx = bullet.pos.x - collisionShape.pos.x;
                    const dy = bullet.pos.y - collisionShape.pos.y;
                    const angle = Math.atan2(dy, dx);
                    return angle;
                }
            }
        }
        // Si aucune collision détectée, renvoyer null
        return null;
    }
      

    bounce(bullet: Bullet, angle: number) {
        if (angle === null) {
          return;
        }
      
        // Calcul de l'angle de réflexion
        const reflectionAngle = 2 * angle - bullet.a + Math.PI;
      
        // Correction de l'angle de réflexion en fonction de la position de collision
        const dx = Math.abs(bullet.pos.x - this.field.width / 2);
        const dy = Math.abs(bullet.pos.y - this.field.height / 2);
        const factor = 0.1; // Ajustez ce facteur pour changer la réflexion en fonction de la position
        const dxAdjusted = dx * factor;
        const dyAdjusted = dy * factor;
      
        if (bullet.pos.x < this.field.width / 2) {
            bullet.a = reflectionAngle + dxAdjusted;
        } else {
            bullet.a = reflectionAngle - dxAdjusted;
        }
        if (bullet.pos.y < this.field.height / 2) {
            bullet.a = reflectionAngle + dyAdjusted;
        } else {
            bullet.a = reflectionAngle - dyAdjusted;
        }
      
        // Mise à jour de la position de la balle
        bullet.pos.x += bullet.v * Math.cos(bullet.a);
        bullet.pos.y += bullet.v * Math.sin(bullet.a);
      }
}
