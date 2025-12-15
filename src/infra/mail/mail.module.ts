import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

import { ADDITIONAL_PROVIDERS, CONFIG } from '../../common/enums';
import { LoggerModule } from '../logger';
import { LoggerService } from '../logger/services/logger.service';
import { RabbitmqModule } from '../rabbitmq';
import { MailService } from './mail.service';
import { templates } from './templates';

@Module({
  imports: [LoggerModule, RabbitmqModule],
  providers: [
    MailService,
    {
      provide: ADDITIONAL_PROVIDERS.SENDGRID,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get(CONFIG.SENDGRID_API_KEY);
        return SendGrid.setApiKey(apiKey);
      },
    },
    {
      provide: ADDITIONAL_PROVIDERS.TEMPLATES,
      useValue: templates,
    },
    LoggerService,
  ],
  exports: [MailService, ADDITIONAL_PROVIDERS.SENDGRID, LoggerService],
})
export class MailModule {}
