import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatSessionDocument = ChatSession & Document;

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 'New Chat' })
  title: string;

  @Prop({ required: true, default: 'gpt-4' })
  aiModel: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ default: 0 })
  totalTokens: number;

  @Prop({ default: 0 })
  messageCount: number;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
