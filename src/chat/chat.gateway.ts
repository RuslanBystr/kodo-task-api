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
import { CreateMessageDto } from '../message/dto/create-message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}

  private onlineUsers = new Set<string>();

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('userConnected')
  handleUserConnection(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.data.userId = userId;
    this.onlineUsers.add(userId);
    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
    console.log(`User ${userId} connected`);
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

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId;
    if (!userId) return;

    this.onlineUsers.delete(userId);
    console.log(`User ${userId} disconnected`);
    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: CreateMessageDto) {
    const message = await this.messageService.sendMessage(data);
    this.server.to(`chat-${data.chatId}`).emit('newMessage', message);
  }

  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody() { chatId, id }: { chatId: string; id: number },
  ) {
    console.log('marked');
    const message = await this.messageService.markAsRead(id);
    console.log(message);
    this.server.to(`chat-${chatId}`).emit('messageRead', message);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat-${chatId}`);
  }
}
