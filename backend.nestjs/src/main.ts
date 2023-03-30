import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import * as connectRedis from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './modules/redis/redis.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config = app.get(ConfigService);

	// Enable cors
	app.enableCors({origin: 'http://localhost:5173', credentials: true});
	

	// Session
	const RedisStore = connectRedis(session);
	const redis = app.get(RedisService);
	app.use(
		session({
			store: new RedisStore({ client: redis.getClient() }),
			secret: config.get('SESSION_SECRET'),
			saveUninitialized: false,
			resave: false,
			cookie: {
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			}
		}));

	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	const { httpAdapter } = app.get(HttpAdapterHost);
	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter)); // to test

	const swaggerConfig = new DocumentBuilder()
		.setTitle("ft_transcendence")
		.setDescription("The ft_transcendence API description")
		.setVersion("0.1")
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("api", app, document);

	// app.setGlobalPrefix("api");
	app.use(passport.initialize());
	app.use(passport.session());

	await app.listen(config.get('APP_PORT'));
}
bootstrap();