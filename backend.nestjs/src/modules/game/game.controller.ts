import { Controller , Get, Res, Param} from '@nestjs/common';
import { Response } from 'express';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get()
    helloGame() {
        console.log("Controller('game')  @Get() hellogame()");
        return "Hello From Game cette page deviendra surement le lobby !";
    }

    @Get(':id')
    async gameRoom(@Param('id')id :string, @Res() res:Response) {
        console.log(`Controller('game')  @Get(':id') gamerRoon: ${id}`);
        this.gameService.initGame(id, res);
    }
}
