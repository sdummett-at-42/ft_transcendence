import { Controller , Get, Res, Param, HttpCode , UseGuards} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GameService } from './game.service';
import { LobbyService } from './lobby/lobby.service';
import { AuthenticatedGuard } from 'src/modules/auth/utils/authenticated.guard';
import * as fs from "fs";

@ApiTags('games')
@Controller('game')
@UseGuards(AuthenticatedGuard)
export class GameController {
    constructor(private readonly gameService: GameService,
                private readonly lobbyService: LobbyService) {}

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
    @ApiParam({ name: 'id', description: `ID de la partie` })
    @ApiResponse({ status: 200, description: `La partie a été trouvé avec succès.` })
    @ApiResponse({ status: 404, description: `La partie n'existe pas ou n'a pas été trouvé.` })
    async gameRoom(@Param('id')id :string, @Res() res:Response) {
        // client auto connect on socket's game
        console.log(`Controller('game')  @Get(':id') gamerRoom: ${id}`);
        const numId = Number(id);

        if (isNaN(numId) || numId >= this.lobbyService.nbGame || numId < 0) { // unvalid id or unexistant game
            //erreur 404 game existe pas
            // peut etre rediriger vers /game ?
            res.sendStatus(404);
        } else {
            // game exist but maybe end or in course
            const data = await fs.promises.readFile('src/modules/game/Dir/game.html', 'utf8');
            res.status(200).send(data);
        }

        // check if game 
        //      no game = 404
        //      game en cours = OK 200
        //      game done = ???

    }
}
