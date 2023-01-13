import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
	constructor(private readonly userService: UsersService) {}

	async validateUser(details: CreateUserDto) {
		// console.log("AuthService");
		// console.log(details);
		// console.log({"details.email": details.email})
		const user = await this.userService.findOneByEmail(details.email);
		// console.log({"user": user});
		if (user)
			return user;
		console.log("User not found. Creating...");
		return await this.userService.create(details);
	}

	async findUser(id: number) {
		const user = await this.userService.findOneById(id);
		return user;
	}
}