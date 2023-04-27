import { Controller , Get, Res, Param, HttpCode , UseGuards} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GameService } from './game.service';
import { LobbyService } from './lobby/lobby.service';
import { AuthenticatedGuard } from 'src/modules/auth/utils/authenticated.guard';

@ApiTags('games')
@Controller('game')
@UseGuards(AuthenticatedGuard)
export class GameController {
    constructor(private readonly gameService: GameService,
                private readonly lobbyService: LobbyService) {}
    // suppri plus tard et transferer dans lobby-service quand match found poru charger la map
    // une fois charger (les deux client auront dis que c'est bon ou l'un des joueurs manque)
    // start game ou gagnant en fonction cas
    @Get(':id')
    @ApiParam({ name: 'id', description: `ID de la partie` })
    @ApiResponse({ status: 200, description: `La partie a été trouvé avec succès.` })
    @ApiResponse({ status: 404, description: `La partie n'existe pas ou n'a pas été trouvé.` })
    async gameRoom(@Param('id')id :string, @Res() res:Response) {
        const numId = Number(id);
        if (isNaN(numId) || numId >= this.lobbyService.nbGame || numId < 0) // unvalid id or unexistant game
            res.sendStatus(404);
        else
            res.status(200);
    }
}
