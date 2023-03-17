import { Controller , Get, Res} from '@nestjs/common';
import { Response } from 'express';

@Controller('game')
export class GameController {
    @Get()
    helloGame(@Res() res: Response) {
        res.sendFile('game.html', { root: 'src/game/Dir'});
        return "Hello From Game asd  !";
    }
}
