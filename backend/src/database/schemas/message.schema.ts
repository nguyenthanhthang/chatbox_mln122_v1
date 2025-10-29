import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ChatSession' })
  sessionId: Types.ObjectId;

  @Prop({ required: true, enum: MessageRole })
  role: MessageRole;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: 0 })
  tokens: number;

  @Prop()
  model?: string;

  @Prop({ default: false })
  isStreaming: boolean;

  @Prop()
  parentMessageId?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: [Object] })
  images?: Array<{
    base64: string;
    mimeType: string;
    filename?: string;
  }>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
