import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;
}
