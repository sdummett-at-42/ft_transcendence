import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
	return "This actions finds a user";
  }

  findOneById(id: number) {
	return this.prismaService.user.findUnique({where: {id}});
  }
  findOneByEmail(email: string) {
	return this.prismaService.user.findUnique({where: {email}});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
	this.prismaService.user.delete({where: {id}});
  }
}
