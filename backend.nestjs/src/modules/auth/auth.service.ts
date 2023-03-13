import { Injectable } from "@nestjs/common";
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class AuthService {
	constructor(private readonly users: UsersService) {}

	async validateUser(email: string) {
		const user = await this.users.findOneUserByEmail(email);
		if (user)
			return user;
		return await this.users.create(email);
	}

	async findUser(id: number) {
		const user = await this.users.findOneUserById(id);
		return user;
	}

	generateUsername() {
		return this.users.generateUsername();
	}
}