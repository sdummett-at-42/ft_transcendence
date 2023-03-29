import { Controller , Get, Res, Param} from '@nestjs/common';
import { Response } from 'express';
import { GameService } from './game.service';
import { LobbyService } from './lobby/lobby.service';
import * as fs from "fs";


@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService, private readonly lobbyService: LobbyService) {}

    // plutot faire /game amene sur lobby.html
    // recherche game
    // match = envoit html game

    @Get()
    async lobbyRoom(@Res() res : Response) {
        // create lobby/ matchmaking here
        // if match create unic gameroom with these 2 client at player
        this.lobbyService.lobbyRoom(res);
    }

    // suppri plus tard et transferer dans lobby-service quand match found poru charger la map
    // une fois charger (les deux client auront dis que c'est bon ou l'un des joueurs manque)
    // start game ou gagnant en fonction cas
    @Get(':id')
    async gameRoom(@Param('id')id :string, @Res() res:Response) {
        // send page to print
        // client auto connect on socket's game
        console.log(`Controller('game')  @Get(':id') gamerRoom: ${id}`);
        const data = await fs.promises.readFile('src/modules/game/Dir/game.html', 'utf8');
        res.send(data);
    }
}
