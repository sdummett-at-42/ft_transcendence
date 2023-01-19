import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

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
  app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: 60000,
	}
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  console.log("Listening on port: " + process.env.APP_PORT);
  await app.listen(process.env.APP_PORT);
}
bootstrap();