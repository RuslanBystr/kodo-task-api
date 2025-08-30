import { Module } from '@nestjs/common';

import { ADDITIONAL_PROVIDERS } from '../common/enums';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/services/logger.service';
import { MailController } from './controllers/mail.controller';
import { MailingProvider } from './providers/mailing.provider';
import { templatesProvider } from './providers/templates.provider';
import { MailService } from './services/mail.service';
import { TemplatesService } from './services/templates.service';

@Module({
  imports: [LoggerModule],
  controllers: [MailController],
  providers: [
    MailService,
    TemplatesService,
    MailingProvider,
    templatesProvider,
    LoggerService,
  ],
  exports: [
    MailService,
    ADDITIONAL_PROVIDERS.SENDGRID,
    TemplatesService,
    LoggerService,
  ],
})
export class EmailModule {}
