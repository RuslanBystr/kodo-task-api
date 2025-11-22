import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Client,
  ClientProxy,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'telegram_bot_queue',
      queueOptions: {
        durable: true, // Ensure queue survives restarts
      },
    },
  })
  private client: ClientProxy;

  async onModuleInit() {
    await this.client.connect();
  }

  sendMessage(message: any) {
    this.client.emit('telegram_notification', message);
  }
}
