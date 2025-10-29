import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleAIService } from './google-ai.service';
import { AIService } from './ai.service.js';

@Module({
  imports: [ConfigModule],
  providers: [GoogleAIService, AIService],
  exports: [AIService, GoogleAIService],
})
export class AIModule {}
