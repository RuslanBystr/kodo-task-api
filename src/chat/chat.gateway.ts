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

import { CreateMessageDto } from './dto';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
  ) {}

  private onlineUsers = new Set<string>();
  private userSocketMap = new Map<number, string>();
  private socketUserMap = new Map<string, string>();

  private chatUserMap = new Map<string, Set<string>>();
  private userChatMap = new Map<string, Set<string>>();

  async handleConnection() {
    console.log('Connected');
  }

  @SubscribeMessage('userConnected')
  handleUserConnection(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    if (!userId) return;

    client.data.userId = userId;
    this.onlineUsers.add(userId);

    this.userSocketMap.set(Number(userId), client.id);
    this.socketUserMap.set(client.id, userId);

    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
    console.log(`User ${userId} connected with socket ${client.id}`);
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
    console.log(`User ${userId} disconnected`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: CreateMessageDto) {
    const message = await this.messageService.sendMessage(data);
    this.server
      .to(`chat-${data.chatId}`)
      .emit('newMessage', { ...message, chat: { id: data.chatId } });

    const chatMembers = await this.chatService.getChatMembers(data.chatId);

    const filterMembers = chatMembers.filter(
      (member) => data.senderId !== member.id,
    );

    for (const member of filterMembers) {
      const socketId = this.userSocketMap.get(member.id);

      if (socketId) {
        this.server.to(socketId).emit('notifyNewMessage', message);
      }
    }
  }

  @SubscribeMessage('reaction')
  async addReactionOnMessage(@MessageBody() message: any): Promise<void> {
    const response = await this.messageService.addReactionOnMessage(
      message.id,
      1, // TODO CRITICAL TASK
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
  handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      console.warn('Attempted to join chat without userId set on socket');
      return;
    }
    this.userSocketMap.set(userId, client.id);

    let chatSet = this.userChatMap.get(userId);

    if (!chatSet) {
      chatSet = new Set<string>();
      this.userChatMap.set(userId, chatSet);
    }

    chatSet.add(chatId);

    client.join(`chat-${chatId}`);

    console.log(`User ${userId} joined chat ${chatId}`);
  }

  @SubscribeMessage('webrtc_signal')
  async handleWebrtcSignal(
    @MessageBody() data: { signal: any; toUserId: string; chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.data.userId;

    const fromChats = this.userChatMap.get(fromUserId) || new Set<string>();
    let toChats = this.userChatMap.get(data.toUserId);

    if (!toChats) {
      const toSocketId = this.userSocketMap.get(Number(data.toUserId));

      if (toSocketId) {
        const toSocket = this.server.sockets.sockets.get(toSocketId);

        if (toSocket) {
          toSocket.join(`chat-${data.chatId}`);
          toChats = new Set<string>([data.chatId]);
          this.userChatMap.set(data.toUserId, toChats);

          console.log(`Auto-joined ${data.toUserId} to chat ${data.chatId}`);
        } else {
          console.warn(`Socket not found for user ${data.toUserId}`);
          return;
        }
      } else {
        console.warn(`User ${data.toUserId} is not connected`);
        return;
      }
    }

    if (fromChats.has(data.chatId) && toChats.has(data.chatId)) {
      const toSocketId = this.userSocketMap.get(Number(data.toUserId));

      if (toSocketId) {
        this.server.to(toSocketId).emit('webrtc_signal', {
          signal: data.signal,
          fromUserId,
          chatId: data.chatId,
        });
      }
    } else {
      console.log('Users are not in the same chat');
    }
  }
}
