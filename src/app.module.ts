import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { GraphQLModule } from '@nestjs/graphql';

import { ExceptionsLoggerFilter } from './common/utils/filters/error';
import { InfraModule } from './infra/infra.module';
import { ActivityModule } from './modules/activity/activity.module';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { ChatModule } from './modules/chat/chat.module';
import { FileModule } from './modules/file/file.module';
import { LlmModule } from './modules/llm/llm.module';
import { MembersModule } from './modules/members/members.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ProjectModule } from './modules/project/project.module';
import { UserModule } from './modules/user/user.module';
import { WebrtcModule } from './modules/webrtc/webrtc.module';

@Module({
  imports: [
    InfraModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
    }),
    CqrsModule,
    FileModule,
    ProjectModule,
    ChatModule,
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
