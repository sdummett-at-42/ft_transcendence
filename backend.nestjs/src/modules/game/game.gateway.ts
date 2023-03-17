import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';
import { createCanvas } from 'canvas';

@WebSocketGateway()
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
    console.log(`Position de la souris : x=${x}, y=${y}`);

      // Créer un canvas de 600 x 200 pixels
      const canvas = createCanvas(600, 200);
      const ctx = canvas.getContext('2d');

      // Dessiner un cercle à la position x, y
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();

      // Convertir l'image en base64
      const image = canvas.toDataURL();

      // Envoyer l'image au client
      this.server.emit('image', { data: image });
  }

  @SubscribeMessage('joinGame')
  JoinMessage(client: any, payload: any) : void{
    console.log(payload);
  }

}
