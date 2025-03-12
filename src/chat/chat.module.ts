import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from '../message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { User } from '../user/entities/user.entity';
import { UserChat } from "./entities/user.chat.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Chat, UserChat, User]), forwardRef(() => MessageModule)],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
