import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { User } from '../user/entities/user.entity';
import { UserChat } from './entities/user.chat.entity';
import { CryptoService } from '../crypto/crypto.service';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.service';
import { Message } from './entities/message.entity';
import { FileEntity } from '../file/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, UserChat, Message, FileEntity, User]),
  ],
  providers: [ChatGateway, ChatService, MessageService, CryptoService],
  controllers: [ChatController, MessageController],
  exports: [ChatService, MessageService],
})
export class ChatModule {}
