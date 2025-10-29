import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ default: UserRole.USER })
  role: UserRole;

  @Prop({ default: VerificationStatus.PENDING })
  emailVerification: VerificationStatus;

  @Prop({ default: VerificationStatus.PENDING })
  phoneVerification: VerificationStatus;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  phoneVerificationCode?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
