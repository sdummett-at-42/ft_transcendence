import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'nestjs-prisma';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { SessionSerializer } from './utils/Serializer';

@Module({
	imports: [
		PrismaModule,
		UsersModule,
		PassportModule.register({ session: true}),
	],
	controllers: [AuthController],
	providers: [
		GoogleStrategy,
		SessionSerializer,
		{
			provide: "AUTH_SERVICE",
			useClass: AuthService,
		}	
	],
})
export class AuthModule {}
