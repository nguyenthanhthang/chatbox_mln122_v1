import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  ValidateIf,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsBase64OrDataUrl } from './validators/base64.validator';

export class ImageDto {
  @IsOptional()
  @IsString()
  @IsBase64OrDataUrl()
  base64?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  publicId?: string; // Cloudinary public_id (ưu tiên dùng thay vì url)

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.mimeType !== undefined && o.mimeType !== null)
  @Matches(/^[a-z]+\/[a-z0-9\-\+]+$/i, {
    message: 'mimeType phải có định dạng type/subtype (ví dụ: image/jpeg)',
  })
  mimeType?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  format?: string; // jpg, png, webp, etc.
}

export class SendMessageDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4000)
  maxTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];
}
