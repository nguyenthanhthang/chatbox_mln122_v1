import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AISettingsDocument = AISettings & Document;

@Schema({ timestamps: true })
export class AISettings {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 'gpt-4' })
  defaultModel: string;

  @Prop({ default: 1000 })
  maxTokens: number;

  @Prop({ default: 0.7 })
  temperature: number;

  @Prop({ default: 'You are a helpful AI assistant.' })
  systemPrompt: string;

  @Prop({ default: true })
  enableStreaming: boolean;

  @Prop({ default: false })
  enableHistory: boolean;

  @Prop({ default: 30 })
  maxHistoryDays: number;

  @Prop({ type: Object })
  customSettings?: Record<string, any>;
}

export const AISettingsSchema = SchemaFactory.createForClass(AISettings);
