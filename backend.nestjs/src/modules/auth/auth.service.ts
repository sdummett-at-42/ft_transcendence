import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/modules/users/dto/create-user.dto";
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class AuthService {
	constructor(private readonly users: UsersService) {}

	async validateUser(details: CreateUserDto) {
		const user = await this.users.findOneUserByEmail(details.email);
		if (user)
			return user;
		return await this.users.create(details);
	}

	async findUser(id: number) {
		const user = await this.users.findOneUserById(id);
		return user;
	}

	generateUsername() {
		return this.users.generateUsername();
	}
}