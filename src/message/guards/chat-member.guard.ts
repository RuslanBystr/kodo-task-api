import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService } from '../../chat/services/chat.service';

@Injectable()
export class ChatMemberGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, query } = context.switchToHttp().getRequest();
    const userId = user?.id;
    const chatId = query.chatId;
    console.log(query);
    if (!userId || !chatId) {
      throw new ForbiddenException('Missing userId or chatId');
    }

    const isMember = await this.chatService.chatMember(userId, chatId);

    if (!isMember) {
      throw new ForbiddenException('You do not have access to this chat');
    }
    return true;
  }
}
