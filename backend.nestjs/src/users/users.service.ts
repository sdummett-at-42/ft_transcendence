import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(private readonly prismaService: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prismaService.user.create({data: createUserDto});
  }

  findAllUsers() {
	return  this.prismaService.user.findMany();
  }

  findOneUser(id: number) {
	return this.prismaService.user.findUnique({where: {id}});
  }

  findOneUserById(id: number) {
	return this.prismaService.user.findUnique({where: {id}});
  }

  findOneUserByEmail(email: string) {
	return this.prismaService.user.findUnique({where: {email}});
  }

  updateUser(id: number, updateUserDto: UpdateUserDto) {
	return this.prismaService.user.update({where: {id}, data: updateUserDto});
  }

  removeUser(id: number) {
	return this.prismaService.user.delete({where: {id}});
  }

  async findUserFriends(id: number) {
	const {friends} = await this.findOneUser(id);
	return {friends};
  }

  async addUserFriend(id: number, friendId: number) {
	const user = await this.findOneUser(id);
	if (user.friends.find((val) => val === +friendId))
		return user.friends;
	let updatedFriends: UpdateUserDto = {friends: user.friends};
	updatedFriends.friends.push(+friendId);
	await this.prismaService.user.update({where: {id}, data: updatedFriends});
	return {friends: updatedFriends.friends};
  }

  async removeUserFriend(id:number, friendId: number) {
	const user = await this.findOneUser(id);
	const index = user.friends.findIndex((val) => val === +friendId);
	if (index != -1) {
		let updatedFriends: UpdateUserDto = {friends: user.friends};
		updatedFriends.friends.splice(index, 1);
		await this.prismaService.user.update({where: {id}, data: updatedFriends});
		return {friends: updatedFriends.friends};
	}
	return {friends: user.friends};
  }
}
