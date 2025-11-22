import { Module } from '@nestjs/common';

import { RabbitMQService } from './services/rabbitmq.service';

@Module({
  imports: [],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitmqModule {}
