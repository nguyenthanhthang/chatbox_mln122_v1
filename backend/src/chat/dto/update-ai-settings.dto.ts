import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export class UpdateAISettingsDto {
  @IsOptional()
  @IsString()
  defaultModel?: string;

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
  @IsBoolean()
  enableStreaming?: boolean;

  @IsOptional()
  @IsBoolean()
  enableHistory?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  maxHistoryDays?: number;
}
