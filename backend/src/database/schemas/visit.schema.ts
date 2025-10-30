import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VisitDocument = Visit & Document;

@Schema({ timestamps: true })
export class Visit {
  @Prop()
  userId?: string;

  @Prop({ required: true })
  ip: string;

  @Prop()
  userAgent?: string;

  @Prop()
  path?: string;

  @Prop({ index: true })
  date: string; // YYYY-MM-DD
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
