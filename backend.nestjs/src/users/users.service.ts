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

  findAll() {
	return  this.prismaService.user.findMany();
  }


  findOne(id: number) {
	return this.prismaService.user.findUnique({where: {id}});
  }

  findOneById(id: number) {
	return this.prismaService.user.findUnique({where: {id}});
  }
  findOneByEmail(email: string) {
	return this.prismaService.user.findUnique({where: {email}});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
	return this.prismaService.user.update({where: {id}, data: updateUserDto});
  }

  remove(id: number) {
	this.prismaService.user.delete({where: {id}});
  }
}
