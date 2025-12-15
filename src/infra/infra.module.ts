import { Module } from '@nestjs/common';

import { CryptoModule } from './crypto';
import { DatabaseModule } from './database';
import { LoggerModule } from './logger';
import { MailModule } from './mail';
import { RabbitmqModule } from './rabbitmq';

@Module({
  imports: [
    CryptoModule,
    DatabaseModule,
    LoggerModule,
    MailModule,
    RabbitmqModule,
  ],
  exports: [
    CryptoModule,
    DatabaseModule,
    LoggerModule,
    MailModule,
    RabbitmqModule,
  ],
})
export class InfraModule {}
