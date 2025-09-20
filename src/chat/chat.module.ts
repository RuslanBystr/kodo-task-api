import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CryptoService } from '../crypto/crypto.service';
import { FileEntity } from '../file/entities/file.entity';
import { User } from '../user/entities/user.entity';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './controllers/chat.controller';
import { MessageController } from './controllers/message.controller';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { UserChat } from './entities/user.chat.entity';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chat,
      UserChat,
      Message,
      MessageReaction,
      FileEntity,
      User,
    ]),
    AuthModule,
  ],
  providers: [ChatGateway, ChatService, MessageService, CryptoService],
  controllers: [ChatController, MessageController],
  exports: [ChatService, MessageService],
})
export class ChatModule {}
