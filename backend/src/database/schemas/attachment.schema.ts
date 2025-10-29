import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttachmentDocument = Attachment & Document;

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  messageId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  url: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

// Add indexes for better performance
AttachmentSchema.index({ messageId: 1 });
AttachmentSchema.index({ uploadedBy: 1 });
AttachmentSchema.index({ mimeType: 1 });
