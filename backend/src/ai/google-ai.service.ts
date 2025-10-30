import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
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
  private textModel: GenerativeModel;
  private visionModel: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    // Use broadly supported models on v1beta
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.textModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
    this.visionModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
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
      const chat = this.textModel.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        // Apply a system instruction if provided
        ...(systemPrompt
          ? {
              systemInstruction: {
                role: 'user',
                parts: [{ text: systemPrompt }],
              },
            }
          : {}),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts);
      const response = result.response;
      const text = response.text();

      // Get usage information
      const usage = (response as any).usageMetadata || {};

      return {
        content: text,
        tokens: usage.totalTokenCount ?? 0,
        model: 'gemini-2.0-flash',
      };
    } catch (error) {
      this.logger.error('Error generating text response:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Google AI text generation failed: ${message}`);
    }
  }

  async generateMultimodalResponse(
    messages: GoogleAIMessage[],
    systemPrompt?: string,
  ): Promise<GoogleAIResponse> {
    try {
      const chat = this.visionModel.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        // Apply a system instruction if provided
        ...(systemPrompt
          ? {
              systemInstruction: {
                role: 'user',
                parts: [{ text: systemPrompt }],
              },
            }
          : {}),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts);
      const response = result.response;
      const text = response.text();

      // Get usage information
      const usage = (response as any).usageMetadata || {};

      return {
        content: text,
        tokens: usage.totalTokenCount ?? 0,
        model: 'gemini-2.0-flash',
      };
    } catch (error) {
      this.logger.error('Error generating multimodal response:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Google AI multimodal generation failed: ${message}`);
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

  // Helper to fetch an image URL and convert to inlineData Part
  async fetchImageUrlToPart(url: string, mimeType?: string): Promise<Part> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }
    const arrayBuf = await res.arrayBuffer();
    const base64 = Buffer.from(new Uint8Array(arrayBuf)).toString('base64');
    const contentType =
      mimeType || res.headers.get('content-type') || 'image/jpeg';
    return {
      inlineData: {
        data: base64,
        mimeType: contentType,
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
  getAvailableModels() {
    return [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        maxTokens: 8192,
        supportsImages: true,
        supportsText: true,
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        maxTokens: 8192,
        supportsImages: true,
        supportsText: true,
      },
    ];
  }
}
