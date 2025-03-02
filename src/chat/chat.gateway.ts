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

  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.id}`);
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
