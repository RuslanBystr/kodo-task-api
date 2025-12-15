import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sendGrid, { MailDataRequired } from '@sendgrid/mail';

import { ADDITIONAL_PROVIDERS, CONFIG } from '../../common/enums';
import { IMailPort } from '../../core/ports/mail.port';
import { LoggerService } from '../logger/services/logger.service';
import { templateName, templates } from './templates';

@Injectable()
export class MailService implements IMailPort {
  private readonly forgotPasswordUrl = this.configService.get<string>(
    CONFIG.FORGOT_PASSWORD_URL,
  );
  constructor(
    @Inject(ADDITIONAL_PROVIDERS.SENDGRID)
    private readonly transporter: typeof sendGrid,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  private SENDER = this.configService.get(CONFIG.SENDER);

  async send(data: MailDataRequired) {
    try {
      await this.transporter.send(data);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }

  async sendForgotPassword({ email, name, code }) {
    const buildTemplate = this.getTemplate('forgotPasswordHtml');
    const url = `${this.forgotPasswordUrl}?code=${code}&email=${email}`;
    const html = buildTemplate({ name, link: url });
    await this.send({
      from: this.SENDER,
      to: email,
      subject: 'Reset password',
      html,
    });
  }

  async sendVerifyCode({ email, name, code }) {
    const buildTemplate = this.getTemplate('verifyCodeHtml');
    const html = buildTemplate({ name, code });
    await this.send({
      from: this.SENDER,
      to: email,
      subject: 'Verification code',
      html,
    });
  }
  private getTemplate(template: templateName) {
    return templates.get(template);
  }
}
