import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatSession, ChatSessionSchema } from '../database/schemas/chat-session.schema';
import { Message, MessageSchema } from '../database/schemas/message.schema';
import { AISettings, AISettingsSchema } from '../database/schemas/ai-settings.schema';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: Message.name, schema: MessageSchema },
      { name: AISettings.name, schema: AISettingsSchema },
    ]),
    AIModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
