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
  images?: { base64?: string; url?: string; mimeType?: string }[];
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
    throw new Error(`Mô hình ${_model} không hỗ trợ streaming`);
  }

  getAvailableModels(): AIModel[] {
    return [
      {
        id: 'gemini-1.0-pro',
        name: 'Gemini 1.0 Pro',
        provider: 'google' as const,
        maxTokens: 8192,
        costPerToken: 0.00001,
        supportsImages: true,
        supportsText: true,
      },
      {
        id: 'gemini-1.0-pro-vision',
        name: 'Gemini 1.0 Pro Vision',
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
      // Google API expects roles: 'user' | 'model'
      role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
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
    const googleMessages: GoogleAIMessage[] = [];

    for (const msg of messages) {
      const parts: any[] = [];

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (msg.images && msg.images.length > 0) {
        for (const image of msg.images) {
          if (image.base64) {
            parts.push(
              this.googleAIService.convertImageToPart(
                image.base64,
                image.mimeType || 'image/jpeg',
              ),
            );
          } else if (image.url) {
            const part = await this.googleAIService.fetchImageUrlToPart(
              image.url,
              image.mimeType,
            );
            parts.push(part);
          }
        }
      }

      googleMessages.push({
        role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts,
      });
    }

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
