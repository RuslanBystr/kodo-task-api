import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';
import { appendFileSync } from 'fs';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';

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
  app.useWebSocketAdapter(new IoAdapter(app));

  setupSwagger(app);

  await app
    .listen(process.env.API_PORT, '0.0.0.0')
    .then(() =>
      console.log(
        '\x1b[38;2;150;255;150m Server started\x1b[0m http://localhost:' +
          process.env.API_PORT,
      ),
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

process.on('SIGINT', () => {
  console.log('\x1b[38;2;255;190;170m - Server stopped\x1b[0m');
  process.exit(0);
});

process.on('uncaughtException', (error: Error) => {
  logErrorToFile(error);
  console.log('Uncaught Exception\nPROCESS EXIT HAPPENED, CHECK LOGS FOLDER');
  process.exit(0);
});
