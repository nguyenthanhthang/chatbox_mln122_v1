import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { ClaudeService } from './claude.service';
import { AIService } from './ai.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenAIService, ClaudeService, AIService],
  exports: [AIService, OpenAIService, ClaudeService],
})
export class AIModule {}
