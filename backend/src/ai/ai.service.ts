import { Injectable, Logger } from '@nestjs/common';
import { GoogleAIService, GoogleAIMessage } from './google-ai.service';

export interface AIModel {
  id: string;
  name: string;
  provider: 'google';
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

  constructor(private googleAIService: GoogleAIService) {}

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
  ): Promise<{ content: string; tokens: number }> {
    // Only use Google AI
    return this.generateGoogleResponse(messages);
  }

  async generateMultimodalResponse(
    messages: MultimodalMessage[],
  ): Promise<{ content: string; tokens: number }> {
    // Only use Google AI for multimodal
    return this.generateGoogleMultimodalResponse(messages);
  }

  generateStreamResponse(
    _messages: Array<{ role: string; content: string }>,
    _model: string,
  ): never {
    // Google AI doesn't support streaming in this implementation
    throw new Error(`Streaming not supported for model: ${_model}`);
  }

  getAvailableModels(): AIModel[] {
    return [
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
  }

  private async generateGoogleResponse(
    messages: Array<{ role: string; content: string }>,
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

  private getProviderFromModel(model: string): 'google' {
    if (model.startsWith('gemini-')) {
      return 'google';
    }
    // Default to Google AI for any model
    return 'google';
  }
}
