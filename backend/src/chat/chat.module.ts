import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
import {
  ChatSession,
  ChatSessionSchema,
} from '../database/schemas/chat-session.schema';
import { Message, MessageSchema } from '../database/schemas/message.schema';
import {
  AISettings,
  AISettingsSchema,
} from '../database/schemas/ai-settings.schema';
import { AIModule } from '../ai/ai.module';
import { CloudinaryMonitorService } from '../common/services/cloudinary-monitor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: Message.name, schema: MessageSchema },
      { name: AISettings.name, schema: AISettingsSchema },
    ]),
    AIModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, CloudinaryMonitorService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
