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

  @Prop({ type: String, default: '' })
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
    url?: string;
    publicId?: string;
    mimeType?: string;
    width?: number;
    height?: number;
    size?: number;
    filename?: string;
    base64?: string; // backward compatibility
  }>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Ensure at least one of content or images exists
MessageSchema.pre('validate', function (next) {
  const hasText =
    typeof this.content === 'string' && this.content.trim().length > 0;
  const hasImages = Array.isArray(this.images) && this.images.length > 0;
  if (!hasText && !hasImages) {
    return next(new Error('Either content or images is required.'));
  }
  next();
});
