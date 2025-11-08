import { IsOptional, IsString } from 'class-validator';

export class CloudinarySignatureDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  publicId?: string;
}

