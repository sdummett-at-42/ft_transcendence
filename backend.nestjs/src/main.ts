import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
	.setTitle("ft_transcendence")
	.setDescription("The ft_transcendence API description")
	.setVersion("0.1")
	.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.setGlobalPrefix("api");
  app.use(session({
	secret: "ashkjdhsadkjashdsa",
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: 60000,
	}
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3001);
}
bootstrap();