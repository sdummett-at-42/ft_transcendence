import { Controller , Get, Res, Param} from '@nestjs/common';
import { Response } from 'express';

@Controller('game')
export class GameController {
    @Get()
    helloGame() {
        console.log("Controller('game')  @Get() hellogame()");
        return "Hello From Game !";
    }

    @Get(':id')
    gameRoom(@Param('id')id :string, @Res() res:Response) {
        console.log(`Controller('game')  @Get(':id') gamerRoon: ${id}`);
        res.sendFile('game.html', { root: 'src/modules/game/Dir'});
    }
}
