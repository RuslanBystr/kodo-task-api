import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

import { ADDITIONAL_PROVIDERS, CONFIG } from '../common/enums';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/services/logger.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';
import { TemplatesService } from './services/templates.service';
import { templates } from './templates';

@Module({
  imports: [LoggerModule, RabbitmqModule],
  controllers: [MailController],
  providers: [
    MailService,
    TemplatesService,
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
  exports: [
    MailService,
    ADDITIONAL_PROVIDERS.SENDGRID,
    TemplatesService,
    LoggerService,
  ],
})
export class MailModule {}
