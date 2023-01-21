import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
	constructor(private readonly userService: UsersService) {}

	async validateUser(details: CreateUserDto) {
		const user = await this.userService.findOneByEmail(details.email);
		if (user)
			return user;
		return await this.userService.create(details);
	}

	async findUser(id: number) {
		const user = await this.userService.findOneById(id);
		return user;
	}
}