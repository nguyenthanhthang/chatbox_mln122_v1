import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ default: false })
  isGroup: boolean;

  @Prop()
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  settings?: Record<string, any>;

  // Statistics
  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  onlineUsers: Types.ObjectId[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Add indexes for better performance
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ isActive: 1 });
