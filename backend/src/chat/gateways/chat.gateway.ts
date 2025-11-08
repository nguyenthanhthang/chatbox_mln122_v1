import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.userId = payload.sub || payload.id;
      this.connectedUsers.set(client.id, client.userId);

      // Join room for user-specific messages
      await client.join(`user:${client.userId}`);

      this.logger.log(
        `Client ${client.id} connected (userId: ${client.userId})`,
      );
    } catch (error) {
      this.logger.warn(`Client ${client.id} authentication failed: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Emit AI response to specific user
   */
  emitAIResponse(userId: string, data: {
    sessionId: string;
    messageId: string;
    content: string;
    tokens?: number;
    model?: string;
    status: 'processing' | 'completed' | 'error';
    error?: string;
  }) {
    this.server.to(`user:${userId}`).emit('ai-response', data);
    this.logger.log(`Emitted AI response to user ${userId}`);
  }

  /**
   * Emit typing indicator
   */
  emitTyping(userId: string, sessionId: string, isTyping: boolean) {
    this.server.to(`user:${userId}`).emit('typing', {
      sessionId,
      isTyping,
    });
  }

  /**
   * Emit message status update
   */
  emitMessageStatus(
    userId: string,
    sessionId: string,
    messageId: string,
    status: 'pending' | 'processing' | 'completed' | 'error',
  ) {
    this.server.to(`user:${userId}`).emit('message-status', {
      sessionId,
      messageId,
      status,
    });
  }
}

