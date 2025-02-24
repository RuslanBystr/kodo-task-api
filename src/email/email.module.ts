import { Module } from '@nestjs/common';
import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';
import { TemplatesService } from './services/templates.service';
import { MailingProvider } from './providers/mailing.provider';
import { templatesProvider } from './providers/templates.provider';
import { LoggerModule } from '../logger/logger.module';
import { ADDITIONAL_PROVIDERS } from 'src/common/enums/additional-providers';
import { LoggerService } from 'src/logger/services/logger.service';

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
