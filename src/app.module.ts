import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { FileModule } from './file/file.module';
import { ProjectModule } from './project/project.module';
import { ChatModule } from './chat/chat.module';
import { StripeModule } from './stripe/stripe.module';
import { CryptoModule } from './crypto/crypto.module';
import { ActivityModule } from './activity/activity.module';
import { LlmModule } from './llm/llm.module';
import { BillingModule } from './billing/billing.module';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsLoggerFilter } from './common/utils/filters/error';
import { MembersModule } from './members/members.module';

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
    CqrsModule,
    FileModule,
    ProjectModule,
    ChatModule,
    StripeModule,
    CryptoModule,
    ActivityModule,
    LlmModule,
    BillingModule,
    MembersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    },
    AppService,
  ],
})
export class AppModule {}
