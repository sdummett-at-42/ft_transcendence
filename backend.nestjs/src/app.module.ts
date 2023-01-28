import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'nestjs-prisma';
import { Passport } from 'passport';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { ImagesModule } from './images/images.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
	AuthModule, 
	PrismaModule,
	UsersModule,
	ImagesModule,
	FriendsModule,
	PassportModule.register({ session: true }), 
],
  providers: [AppService],
})
export class AppModule {}
