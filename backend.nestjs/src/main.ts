import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import * as connectRedis from 'connect-redis';
import * as Redis from 'redis';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	// Session
	const RedisStore = connectRedis(session);
	const redisClient = Redis.createClient({
		url: configService.get('REDIS_URL'),
		legacyMode: true,
	});
	redisClient.connect();
	redisClient.on('error', (err) => {
		console.log('Redis error: ', err);
	});
	redisClient.on('connect', () => {
		console.log('Redis connected');
	});

	app.use(
		session({
			store: new RedisStore({ client: redisClient }),
			secret: configService.get('SESSION_SECRET'),
			saveUninitialized: false,
			resave: false,
			cookie: {
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			}
		}));

	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	const { httpAdapter } = app.get(HttpAdapterHost);
	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter)); // to test

	const config = new DocumentBuilder()
		.setTitle("ft_transcendence")
		.setDescription("The ft_transcendence API description")
		.setVersion("0.1")
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	app.setGlobalPrefix("api");
	app.use(passport.initialize());
	app.use(passport.session());

	await app.listen(configService.get('APP_PORT'));
}
bootstrap();