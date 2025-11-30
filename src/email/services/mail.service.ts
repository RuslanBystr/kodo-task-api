import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired } from '@sendgrid/mail';

import { ADDITIONAL_PROVIDERS, CONFIG } from '../../common/enums';
import { LoggerService } from '../../logger/services/logger.service';
import { templates } from '../templates';
import { SendgridType } from '../types';
import { TemplatesService } from './templates.service';

@Injectable()
export class MailService {
  private readonly forgotPasswordUrl = this.configService.get<string>(
    CONFIG.FORGOT_PASSWORD_URL,
  );
  constructor(
    @Inject(ADDITIONAL_PROVIDERS.SENDGRID)
    private readonly transporter: SendgridType,
    private readonly templatesService: TemplatesService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  private SENDER = this.configService.get(CONFIG.SENDER);
  // private ADMIN_EMAIL = this.configService.get(CONFIG.ADMIN_EMAIL);

  async send(data: MailDataRequired) {
    try {
      await this.transporter.send(data);
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException();
    }
  }

  async sendForgotPassword({ email, name, code }) {
    const buildTemplate =
      this.templatesService.getTemplate('forgotPasswordHtml');
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
    const buildTemplate = this.templatesService.getTemplate('verifyCodeHtml');
    const html = buildTemplate({ name, code });
    await this.send({
      from: this.SENDER,
      to: email,
      subject: 'Verification code',
      html,
    });
  }

  async sendTest(email) {
    await this.loggerService.debug({
      reason: 'Send email TEST debug',
      data: email,
    });
    await this.send({
      from: this.SENDER,
      to: email,
      subject: 'Test subject',
      html: '<p>Hello Test</p>',
    });
  }

  public async sendAdminInvitation({
    email,
    role,
    invitationToken,
  }: {
    email: string;
    role: string;
    invitationToken: string;
  }) {
    const buildTemplate = templates.get('adminInvitationHtml');
    const link = `${this.configService.get(CONFIG.ADMIN_INVITATION_URL)}?invitationToken=${invitationToken}`;
    const html = buildTemplate ? buildTemplate({ role, link }) : '';

    await this.send({
      from: this.SENDER,
      to: email,
      subject: 'Admin invitation',
      html,
    });
  }

  public async sendInvitedAdminCredentials({
    email,
    userName,
    password,
  }: {
    email: string;
    userName: string;
    password: string;
  }) {
    const buildTemplate = templates.get('adminIvitedCredentialsHtml');
    const html = buildTemplate
      ? buildTemplate({ userName, password, email })
      : '';

    await this.send({
      from: this.SENDER,
      to: email,
      subject: 'Invited admin credentials',
      html,
    });
  }
}
