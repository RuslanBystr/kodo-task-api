import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
// import { RedisModule } from "../redis/redis.module";
import { ChatMemberGuard } from './guards/chat-member.guard';
import { ChatModule } from '../chat/chat.module';
import { FileEntity } from '../file/entities/file.entity';
import { User } from '../user/entities/user.entity';
import { CryptoService } from '../crypto/crypto.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Chat, FileEntity, User]),
    // RedisModule,
    forwardRef(() => ChatModule),
  ],
  controllers: [MessageController],
  providers: [MessageService, CryptoService, ChatMemberGuard],
  exports: [MessageService],
})
export class MessageModule {}
