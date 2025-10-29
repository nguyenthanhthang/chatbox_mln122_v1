import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { ClaudeService } from './claude.service';
import { GoogleAIService } from './google-ai.service';
import { AIService } from './ai.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenAIService, ClaudeService, GoogleAIService, AIService],
  exports: [AIService, OpenAIService, ClaudeService, GoogleAIService],
})
export class AIModule {}
