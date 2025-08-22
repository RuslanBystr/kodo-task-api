import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { errorFilterProvider } from './common/utils/filters/error';
import { FileModule } from './file/file.module';
import { ProjectModule } from './project/project.module';
import { ChatModule } from './chat/chat.module';
import { StripeModule } from './stripe/stripe.module';
import { CryptoModule } from './crypto/crypto.module';
import { ActivityModule } from './activity/activity.module';
import { LlmModule } from './llm/llm.module';

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
    ChatModule,
    StripeModule,
    CryptoModule,
    ActivityModule,
    LlmModule,
  ],
  controllers: [AppController],
  providers: [AppService, errorFilterProvider],
})
export class AppModule {}
