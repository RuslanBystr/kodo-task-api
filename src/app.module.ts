import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { errorFilterProvider } from './utils/filters/error/error.filter.provider';
import { FileModule } from './file/file.module';
import { ProjectModule } from './project/project.module';
import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    UserModule,
    EmailModule,
    AuthModule,
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FileModule,
    ProjectModule,
    MessageModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, errorFilterProvider],
})
export class AppModule {}
