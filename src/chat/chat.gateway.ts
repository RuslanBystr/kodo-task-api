import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { CreateMessageDto } from './dto';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';

type ChatID = string;

@WebSocketGateway({
  cors: { origin: '*' },
  // namespace: '/chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
  ) {}

  private onlineUsers = new Set<string>();
  private userSocketMap = new Map<string, string>();
  private socketUserMap = new Map<string, string>();

  private chatUserMap = new Map<string, Set<string>>();
  private userChatMap = new Map<string, Set<string>>();

  async handleConnection() {}

  @SubscribeMessage('userConnected')
  handleUserConnection(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    if (!userId) return;

    client.data.userId = userId;
    this.onlineUsers.add(userId);

    this.userSocketMap.set(userId, client.id);
    this.socketUserMap.set(client.id, userId);

    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId || this.socketUserMap.get(client.id);
    if (!userId) return;

    this.onlineUsers.delete(userId);
    this.userSocketMap.delete(userId);
    this.socketUserMap.delete(client.id);
    this.userChatMap.delete(userId);

    for (const [chatId, users] of this.chatUserMap.entries()) {
      users.delete(userId);
      if (users.size === 0) {
        this.chatUserMap.delete(chatId);
      }
    }

    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const authUserId = client.data.userId!;
    if (!authUserId) throw new UnauthorizedException();

    if (Number(data.senderId) !== authUserId) {
      throw new ForbiddenException(
        'You cannot send messages on behalf of another user',
      );
    }

    const isMember = await this.chatService.chatMember(
      String(data.chatId),
      authUserId.toString(),
    );
    if (!isMember)
      throw new ForbiddenException('You are not a member of this chat');

    const message = await this.messageService.sendMessage(data);

    this.server
      .to(`chat-${data.chatId}`)
      .emit('newMessage', { ...message, chat: { id: data.chatId } });

    const chatMembers = await this.chatService.getChatMembers(data.chatId);
    for (const member of chatMembers) {
      if (member.id === authUserId) continue;
      const socketId = this.userSocketMap.get(member.id.toString());
      if (socketId) this.server.to(socketId).emit('notifyNewMessage', message);
    }
  }

  @SubscribeMessage('reaction')
  async addReactionOnMessage(
    @MessageBody() payload: { id: number; chatId: string; reaction: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const authUserId = client.data.userId!;
    const isMember = await this.chatService.chatMember(
      String(payload.chatId),
      authUserId.toString(),
    );
    if (!isMember)
      throw new ForbiddenException('You are not a member of this chat');

    const updatedMsg = await this.messageService.addReactionOnMessage(
      payload.id,
      authUserId,
      payload.reaction,
    );
    this.server.to(`chat-${payload.chatId}`).emit('updateMessage', updatedMsg);
  }

  @SubscribeMessage('typing')
  async typingMessage(
    @MessageBody() payload: { chatId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const authUserId = client.data.userId!;
    const isMember = await this.chatService.chatMember(
      String(payload.chatId),
      authUserId.toString(),
    );
    if (!isMember)
      throw new ForbiddenException('You are not a member of this chat');

    this.server.to(`chat-${payload.chatId}`).emit('typing', authUserId);
  }

  @SubscribeMessage('removeMessage')
  async removeMessage(
    @MessageBody() payload: { id: number; chatId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const authUserId = client.data.userId!;
    const isMember = await this.chatService.chatMember(
      String(payload.chatId),
      authUserId.toString(),
    );
    if (!isMember)
      throw new ForbiddenException('You are not a member of this chat');

    const deletedMessage = await this.messageService.removeMessage(payload.id);
    this.server
      .to(`chat-${payload.chatId}`)
      .emit('cleanMessage', deletedMessage);
  }

  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody() payload: { chatId: string; messageId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const authUserId = client.data.userId!;
    const isMember = await this.chatService.chatMember(
      String(payload.chatId),
      authUserId.toString(),
    );
    if (!isMember)
      throw new ForbiddenException('You are not a member of this chat');

    const message = await this.messageService.markAsRead(
      payload.messageId,
      authUserId,
    );
    this.server.to(`chat-${payload.chatId}`).emit('messageRead', message);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const authUserId = client.data.userId!;
    if (!authUserId) throw new UnauthorizedException();

    const isMember = await this.chatService.chatMember(
      String(chatId),
      authUserId.toString(),
    );
    if (!isMember)
      throw new ForbiddenException('You are not a member of this chat');

    this.userSocketMap.set(authUserId, client.id);

    let chatSet = this.userChatMap.get(authUserId);
    if (!chatSet) {
      chatSet = new Set<ChatID>();
      this.userChatMap.set(authUserId, chatSet);
    }
    chatSet.add(chatId);

    let usersSet = this.chatUserMap.get(chatId);
    if (!usersSet) {
      usersSet = new Set<string>();
      this.chatUserMap.set(chatId, usersSet);
    }
    usersSet.add(authUserId);

    client.join(`chat-${chatId}`);
  }

  @SubscribeMessage('webrtc_signal')
  async handleWebrtcSignal(
    @MessageBody() data: { signal: string; toUserId: string; chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.data.userId!;
    const chatId = String(data.chatId);
    const toUserId = data.toUserId;

    const fromChats = this.userChatMap.get(fromUserId) ?? new Set<ChatID>();
    let toChats = this.userChatMap.get(toUserId);

    if (!toChats) {
      const toSocketId = this.userSocketMap.get(toUserId);
      if (toSocketId) {
        const toSocket = this.server.sockets.sockets.get(toSocketId);
        if (toSocket) {
          toSocket.join(`chat-${chatId}`);
          toChats = new Set<ChatID>([chatId]);
          this.userChatMap.set(toUserId, toChats);
        } else {
          throw new NotFoundException(`Socket not found for user ${toUserId}`);
        }
      } else {
        throw new BadRequestException(`User ${toUserId} is not connected`);
      }
    }

    if (fromChats.has(chatId) && toChats.has(chatId)) {
      const toSocketId = this.userSocketMap.get(toUserId);
      if (toSocketId) {
        this.server.to(toSocketId).emit('webrtc_signal', {
          signal: data.signal,
          fromUserId,
        });
      }
    } else {
      throw new ForbiddenException('Both users must be in the chat');
    }
  }
}
