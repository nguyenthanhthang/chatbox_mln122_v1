import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsMongoId,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice',
  FILE = 'file',
}

export class SearchMessagesDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsMongoId()
  chatId?: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
