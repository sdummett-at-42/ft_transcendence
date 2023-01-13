import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Passport } from 'passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
	AuthModule, 
	PrismaModule,
	UsersModule,
	PassportModule.register({ session: true }), 
	],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
