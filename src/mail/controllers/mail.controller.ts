import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RabbitMQService } from '../../rabbitmq/services/rabbitmq.service';
import { MailService } from '../services/mail.service';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mail: MailService,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  @Post('support')
  async supportList(
    @Body() body: { name: string; email: string; message: string },
  ) {
    this.rabbitmqService.sendMessage(
      `MESSAGE:\n ${body.email}\n${body?.name ?? ''} ${body.message}`,
    );
    return {
      success: true,
    };
  }
}
