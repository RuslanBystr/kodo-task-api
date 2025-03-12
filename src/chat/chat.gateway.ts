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
    const userId = client.id;
    this.onlineUsers.add(userId);
    console.log(`${userId} connected`);
  }

  @SubscribeMessage('userConnected')
  handleUserConnection(@MessageBody() userId: string, client: Socket): void {
    this.onlineUsers.add(userId);
    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
    console.log(`User ${userId} connected`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.id;
    this.onlineUsers.delete(userId);
    console.log(`User ${userId} disconnected`);
    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: CreateMessageDto) {
    const message = await this.messageService.sendMessage(data);
    this.server.to(`chat-${data.chatId}`).emit('newMessage', message);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat-${chatId}`);
  }
}
