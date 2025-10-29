import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsMongoId,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  participants: string[];

  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsOptional()
  @IsString()
  avatar?: string;
}
