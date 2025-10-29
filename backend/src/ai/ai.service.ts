import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ClaudeService } from './claude.service';
import { GoogleAIService, GoogleAIMessage } from './google-ai.service';

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'claude' | 'google';
  maxTokens: number;
  costPerToken: number;
  supportsImages?: boolean;
  supportsText?: boolean;
}

export interface MultimodalMessage {
  role: 'user' | 'assistant';
  content: string;
  images?: { base64: string; mimeType: string }[];
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private openaiService: OpenAIService,
    private claudeService: ClaudeService,
    private googleAIService: GoogleAIService,
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
      case 'google':
        return this.generateGoogleResponse(messages, model);
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  }

  async generateMultimodalResponse(
    messages: MultimodalMessage[],
    model: string,
    maxTokens: number = 1000,
    temperature: number = 0.7,
  ): Promise<{ content: string; tokens: number }> {
    const provider = this.getProviderFromModel(model);

    if (provider === 'google') {
      return this.generateGoogleMultimodalResponse(messages, model);
    }

    // For other providers, extract text only
    const textMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    return this.generateResponse(textMessages, model, maxTokens, temperature);
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
    const openaiModels = this.openaiService
      .getAvailableModels()
      .map((model) => ({
        id: model,
        name: `OpenAI ${model}`,
        provider: 'openai' as const,
        maxTokens: 4000,
        costPerToken: 0.00003,
        supportsImages: false,
        supportsText: true,
      }));

    const claudeModels = this.claudeService
      .getAvailableModels()
      .map((model) => ({
        id: model,
        name: `Claude ${model}`,
        provider: 'claude' as const,
        maxTokens: 200000,
        costPerToken: 0.000015,
        supportsImages: false,
        supportsText: true,
      }));

    const googleModels = [
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google' as const,
        maxTokens: 8192,
        costPerToken: 0.00001,
        supportsImages: true,
        supportsText: true,
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google' as const,
        maxTokens: 8192,
        costPerToken: 0.00002,
        supportsImages: true,
        supportsText: true,
      },
    ];

    return [...openaiModels, ...claudeModels, ...googleModels];
  }

  private async generateGoogleResponse(
    messages: Array<{ role: string; content: string }>,
    model: string,
  ): Promise<{ content: string; tokens: number }> {
    const googleMessages: GoogleAIMessage[] = messages.map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    }));

    const response =
      await this.googleAIService.generateTextResponse(googleMessages);
    return {
      content: response.content,
      tokens: response.tokens,
    };
  }

  private async generateGoogleMultimodalResponse(
    messages: MultimodalMessage[],
    model: string,
  ): Promise<{ content: string; tokens: number }> {
    const googleMessages: GoogleAIMessage[] = messages.map((msg) => {
      const parts = [];

      // Add text content
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      // Add images
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach((image) => {
          parts.push(
            this.googleAIService.convertImageToPart(
              image.base64,
              image.mimeType,
            ),
          );
        });
      }

      return {
        role: msg.role as 'user' | 'model',
        parts,
      };
    });

    const response =
      await this.googleAIService.generateMultimodalResponse(googleMessages);
    return {
      content: response.content,
      tokens: response.tokens,
    };
  }

  private getProviderFromModel(model: string): 'openai' | 'claude' | 'google' {
    if (model.startsWith('gpt-') || model.startsWith('text-')) {
      return 'openai';
    }
    if (model.startsWith('claude-')) {
      return 'claude';
    }
    if (model.startsWith('gemini-')) {
      return 'google';
    }
    throw new Error(`Unknown model provider for: ${model}`);
  }
}
