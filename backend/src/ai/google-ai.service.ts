import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Content,
  Part,
} from '@google/generative-ai';

export interface GoogleAIMessage {
  role: 'user' | 'model';
  parts: Part[];
}

export interface GoogleAIResponse {
  content: string;
  tokens: number;
  model: string;
}

@Injectable()
export class GoogleAIService {
  private readonly logger = new Logger(GoogleAIService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
  }

  async generateTextResponse(
    messages: GoogleAIMessage[],
    systemPrompt?: string,
  ): Promise<GoogleAIResponse> {
    try {
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts);
      const response = await result.response;
      const text = response.text();

      // Get usage information
      const usage = await response.usageMetadata();

      return {
        content: text,
        tokens: usage.totalTokenCount || 0,
        model: 'gemini-1.5-flash',
      };
    } catch (error) {
      this.logger.error('Error generating text response:', error);
      throw new Error(`Google AI text generation failed: ${error.message}`);
    }
  }

  async generateMultimodalResponse(
    messages: GoogleAIMessage[],
    systemPrompt?: string,
  ): Promise<GoogleAIResponse> {
    try {
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts);
      const response = await result.response;
      const text = response.text();

      // Get usage information
      const usage = await response.usageMetadata();

      return {
        content: text,
        tokens: usage.totalTokenCount || 0,
        model: 'gemini-1.5-flash',
      };
    } catch (error) {
      this.logger.error('Error generating multimodal response:', error);
      throw new Error(
        `Google AI multimodal generation failed: ${error.message}`,
      );
    }
  }

  // Helper method to convert base64 image to Google AI format
  convertImageToPart(base64Image: string, mimeType: string): Part {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    return {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
  }

  // Helper method to create text part
  createTextPart(text: string): Part {
    return {
      text: text,
    };
  }

  // Helper method to create message with mixed content
  createMessage(
    role: 'user' | 'model',
    content: string,
    images?: { base64: string; mimeType: string }[],
  ): GoogleAIMessage {
    const parts: Part[] = [];

    // Add text if provided
    if (content) {
      parts.push(this.createTextPart(content));
    }

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach((image) => {
        parts.push(this.convertImageToPart(image.base64, image.mimeType));
      });
    }

    return {
      role,
      parts,
    };
  }

  // Get available models
  async getAvailableModels() {
    return [
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        maxTokens: 8192,
        supportsImages: true,
        supportsText: true,
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        maxTokens: 8192,
        supportsImages: true,
        supportsText: true,
      },
    ];
  }
}
