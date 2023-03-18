import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';
import { Circle, Coordonnee } from './entities/game.entities';
// import { createCanvas } from 'canvas';

@WebSocketGateway({namespace: 'game'})
export class GameGateway {
  @WebSocketServer() server: Server;

  // Connection
  HandleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Disconnection
  HandleDisconnection(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // S'abonne a un message -> recevoir tous les msg de correspondante
  @SubscribeMessage('start')
  StartingMessage(client: any, payload: any) : void{
    console.log("start srv");
  }

  @SubscribeMessage('Mouvement')
  MouvementMessage(client: any, payload: any) : void{
    const x = payload.x;
    const y = payload.y;
    console.log(`MouvementMessage Detected !`);
    console.log(`Position de la souris : x=${x}, y=${y}`);

      // Envoyer etat objet de la map ?
      const circle = new Circle(x, y, 5);
      this.server.emit('image', circle);
  }

  @SubscribeMessage('joinGame')
  JoinMessage(client: any, payload: any) : void{
    console.log(`player has join`);
    console.log(payload);
  }

}
