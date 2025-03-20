import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { appendFileSync } from 'fs';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: process.env.CORS
      ? [process.env.ADMIN_PANEL_DOMAIN, process.env.PUBLIC_WEBSITE_DOMAIN]
      : function (origin, callback) {
          return callback(null, true);
        },
    credentials: true,
  });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Access-token',
    )
    .setTitle('KodoTask API')
    .setDescription('KodoTask API documentation')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    customCss: `
    button { outline: none !important; }
    #swagger-ui { background: linear-gradient(45deg, #eafffa, #cceeff); }
    .swagger-ui>.topbar { background-color: #66aabb; }
    #swagger-ui .scheme-container { background-color: #77d9d9; }
    .swagger-ui .auth-wrapper>.btn {border: 2px solid #fff; background-color: #dff; }
  `,
    customSiteTitle: 'KodoTask API Docs',
  });

  await app
    .listen(process.env.API_PORT || 3000)
    .then(() =>
      console.log('Server started http://localhost:' + process.env.API_PORT),
    )
    .catch((err) => console.log(err.message));
}
bootstrap();

function logErrorToFile(error: Error): void {
  const logsFolder = 'logs';
  const now = new Date();
  const fileName = `${now.toISOString()}.log`;
  const filePath = join(logsFolder, fileName);
  const timestamp = now.toString();

  const logMessage = `[${timestamp}] \nTRACE_STACK: ${error?.stack} \nMESSAGE: ${error?.message}`;

  appendFileSync(filePath, logMessage);
}

process.on('uncaughtException', (error: Error) => {
  logErrorToFile(error);
  console.log('Uncaught Exception\nPROCESS EXIT HAPPENED, CHECK LOGS FOLDER');
  process.exit(0);
});
