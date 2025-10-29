import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { AISettings, AISettingsSchema } from './schemas/ai-settings.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: Message.name, schema: MessageSchema },
      { name: AISettings.name, schema: AISettingsSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
