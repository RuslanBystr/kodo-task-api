import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageService } from '../message/services/message.service';
import * as jwt from 'jsonwebtoken';

import { CreateMessageDto } from '../message/dto/create-message.dto';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from '../common/enums/config';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
  ) {}

  private onlineUsers = new Set<string>();
  private userSocketMap = new Map<string, string>();
  private chatUserMap = new Map<string, Set<string>>();
  private userChatMap = new Map<string, string>();

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.accessToken;

    if (!token) {
      console.warn(client.handshake);
      client.disconnect();
      return;
    }
    try {
      const decoded: any = jwt.verify(
        token,
        this.configService.get<string>(CONFIG.JWT_SECRET),
      );
      client.data.userId = decoded.id || decoded.sub;
      console.log(`Connected userId : ${client.data.userId}`);
    } catch (err) {
      console.log('Invalid token, disconnecting...');
      client.disconnect();
    }
  }

  @SubscribeMessage('userConnected')
  handleUserConnection(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    if (!userId) return;

    const stringUserId = userId.toString();
    client.data.userId = stringUserId;

    this.onlineUsers.add(stringUserId);
    this.userSocketMap.set(stringUserId, client.id);

    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
    console.log(`User ${stringUserId} connected with socket ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId;
    if (!userId) return;

    this.onlineUsers.delete(userId);
    this.userSocketMap.delete(userId);
    this.userChatMap.delete(userId);

    for (const [chatId, users] of this.chatUserMap.entries()) {
      users.delete(userId);
      if (users.size === 0) {
        this.chatUserMap.delete(chatId);
      }
    }

    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
    console.log(`User ${userId} disconnected`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: CreateMessageDto) {
    const message = await this.messageService.sendMessage(data);
    this.server.to(`chat-${data.chatId}`).emit('newMessage', message);
  }

  @SubscribeMessage('reaction')
  async addReactionOnMessage(@MessageBody() message: any): Promise<void> {
    const response = await this.messageService.addReactionOnMessage(
      message.id,
      message.reaction,
    );
    this.server.to(`chat-${message.chatId}`).emit('updateMessage', response);
  }

  @SubscribeMessage('typing')
  async typingMessage(@MessageBody() message: any): Promise<void> {
    this.server.to(`chat-${message.chatId}`).emit('typing', message.userId);
  }

  @SubscribeMessage('removeMessage')
  async removeMessage(@MessageBody() message: any): Promise<void> {
    const deletedMessage = await this.messageService.removeMessage(message.id);
    this.server
      .to(`chat-${message.chatId}`)
      .emit('cleanMessage', deletedMessage);
  }

  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody()
    {
      chatId,
      readByUserId,
      userId,
    }: {
      chatId: string;
      readByUserId: number;
      userId: number;
    },
  ) {
    const message = await this.messageService.markAsRead(userId, readByUserId);
    this.server.to(`chat-${chatId}`).emit('messageRead', message);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(@MessageBody() data, @ConnectedSocket() client: Socket) {
    console.log('joinChat', data);
    const userId = client.data.userId;

    this.userChatMap.set(userId, data);

    this.userSocketMap.set(userId, client.id);

    client.join(data);

    console.log(`User ${userId} joined chat ${data}`);
  }

  @SubscribeMessage('webrtc_signal')
  handleWebrtcSignal(
    @MessageBody() data: { signal: any; toUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.data.userId;
    const toUserId = data.toUserId?.toString();
    const fromChatId = this.userChatMap.get(fromUserId);
    const toChatId = this.userChatMap.get(toUserId);

    console.log(`WebRTC from: ${fromUserId} to: ${toUserId}`);
    console.log(data.signal);
    console.log(`fromChatId: ${fromChatId}, toChatId: ${toChatId}`);
    console.log(this.userChatMap);
    if (fromChatId && toChatId && fromChatId === toChatId) {
      const toSocketId = this.userSocketMap.get(toUserId);
      if (toSocketId) {
        console.log('OK');
        this.server.to(toSocketId).emit('webrtc_signal', {
          signal: data.signal,
          fromUserId,
        });
      } else {
        console.log(`User ${toUserId} is not connected (no socket found)`);
      }
    } else {
      console.log(
        `WebRTC signaling failed: users not in the same chat or chat IDs not found`,
      );
    }
  }
}
