import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatService } from '../chat.service';
import { CreateMessageDto } from '../dto';

@WebSocketGateway({
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract user from JWT token
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // TODO: Verify JWT token and get user info
      // For now, we'll use a simple approach
      const userId = client.handshake.auth.userId;
      if (!userId) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(userId, client.id);
      client.join(`user:${userId}`);

      // Notify others that user is online
      client.broadcast.emit('user:online', { userId });

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    // Find user by socket ID
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);

        // Notify others that user is offline
        client.broadcast.emit('user:offline', { userId });

        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('join:room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const userId = this.getUserIdFromSocket(client);
      if (!userId) return;

      // Verify user has access to this chat
      const chat = await this.chatService.getChatById(data.chatId, userId);
      if (!chat) {
        client.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      client.join(`chat:${data.chatId}`);
      client.emit('joined:room', { chatId: data.chatId });

      // Notify others in the room
      client.to(`chat:${data.chatId}`).emit('user:joined', {
        chatId: data.chatId,
        userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('leave:room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return;

    client.leave(`chat:${data.chatId}`);
    client.emit('left:room', { chatId: data.chatId });

    // Notify others in the room
    client.to(`chat:${data.chatId}`).emit('user:left', {
      chatId: data.chatId,
      userId,
    });
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    try {
      const userId = this.getUserIdFromSocket(client);
      if (!userId) return;

      // Send message via service
      const message = await this.chatService.sendMessage(data, userId);

      // Broadcast to all users in the chat room
      this.server.to(`chat:${data.chatId}`).emit('message:new', message);

      // Update chat's last message
      this.server.to(`chat:${data.chatId}`).emit('chat:updated', {
        chatId: data.chatId,
        lastMessage: message,
        lastMessageAt: message.createdAt,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const userId = this.getUserIdFromSocket(client);
      if (!userId) return;

      await this.chatService.markAsRead(data.chatId, userId);

      // Notify others in the room
      client.to(`chat:${data.chatId}`).emit('message:read', {
        chatId: data.chatId,
        userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark as read' });
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return;

    // Notify others in the room (excluding sender)
    client.to(`chat:${data.chatId}`).emit('typing:start', {
      chatId: data.chatId,
      userId,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return;

    // Notify others in the room (excluding sender)
    client.to(`chat:${data.chatId}`).emit('typing:stop', {
      chatId: data.chatId,
      userId,
    });
  }

  private getUserIdFromSocket(client: Socket): string | null {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        return userId;
      }
    }
    return null;
  }

  // Helper method to send message to specific user
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Helper method to send message to chat room
  sendToChat(chatId: string, event: string, data: any) {
    this.server.to(`chat:${chatId}`).emit(event, data);
  }
}
