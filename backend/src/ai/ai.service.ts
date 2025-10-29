import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ClaudeService } from './claude.service';

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'claude';
  maxTokens: number;
  costPerToken: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private openaiService: OpenAIService,
    private claudeService: ClaudeService,
  ) {}

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number = 1000,
    temperature: number = 0.7,
  ): Promise<{ content: string; tokens: number }> {
    const provider = this.getProviderFromModel(model);

    switch (provider) {
      case 'openai':
        return this.openaiService.generateResponse(
          messages,
          model,
          maxTokens,
          temperature,
        );
      case 'claude':
        return this.claudeService.generateResponse(messages, model, maxTokens);
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  }

  async generateStreamResponse(
    messages: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number = 1000,
    temperature: number = 0.7,
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const provider = this.getProviderFromModel(model);

    if (provider === 'openai') {
      return this.openaiService.generateStreamResponse(
        messages,
        model,
        maxTokens,
        temperature,
      );
    }

    throw new Error(`Streaming not supported for model: ${model}`);
  }

  getAvailableModels(): AIModel[] {
    const openaiModels = this.openaiService.getAvailableModels().map((model) => ({
      id: model,
      name: `OpenAI ${model}`,
      provider: 'openai' as const,
      maxTokens: 4000,
      costPerToken: 0.00003,
    }));

    const claudeModels = this.claudeService.getAvailableModels().map((model) => ({
      id: model,
      name: `Claude ${model}`,
      provider: 'claude' as const,
      maxTokens: 200000,
      costPerToken: 0.000015,
    }));

    return [...openaiModels, ...claudeModels];
  }

  private getProviderFromModel(model: string): 'openai' | 'claude' {
    if (model.startsWith('gpt-') || model.startsWith('text-')) {
      return 'openai';
    }
    if (model.startsWith('claude-')) {
      return 'claude';
    }
    throw new Error(`Unknown model provider for: ${model}`);
  }
}
