import { Controller, Get, Res, UseGuards} from "@nestjs/common";
import { Response } from "express";
import * as fs from "fs";
// import { AuthenticatedGuard } from "./modules/auth/utils/authenticated.guard";

// @UseGuards(AuthenticatedGuard)
@Controller('client')
export class FileController {
	@Get()
	async sendFile(@Res() res: Response){
		const data = await fs.promises.readFile('src/modules/chat/index.html', 'utf8');
		res.send(data);
	}
}