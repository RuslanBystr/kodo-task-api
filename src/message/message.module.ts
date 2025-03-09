import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
      TypeOrmModule.forFeature([Message, Chat]),
      RedisModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
