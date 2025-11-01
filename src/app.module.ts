import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { ChatModule } from './chat/chat.module';
import { ExceptionsLoggerFilter } from './common/utils/filters/error';
import { CryptoModule } from './crypto/crypto.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { LlmModule } from './llm/llm.module';
import { LoggerModule } from './logger/logger.module';
import { MembersModule } from './members/members.module';
import { NotificationModule } from './notification/notification.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';
import { WebrtcModule } from './webrtc/webrtc.module';

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
    CryptoModule,
    ActivityModule,
    LlmModule,
    BillingModule,
    MembersModule,
    NotificationModule,
    WebrtcModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    },
  ],
})
export class AppModule {}
