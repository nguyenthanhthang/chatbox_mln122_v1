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
    
    // Check if API key is missing or is placeholder
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your-google-ai-api-key-here') {
      this.logger.error('GOOGLE_AI_API_KEY chưa được cấu hình hoặc vẫn là placeholder');
      this.logger.error('Vui lòng set GOOGLE_AI_API_KEY trong:');
      this.logger.error('  - Local: file backend/.env');
      this.logger.error('  - Render: Environment Variables trong Dashboard');
      throw new Error('GOOGLE_AI_API_KEY chưa được cấu hình. Vui lòng kiểm tra file .env hoặc environment variables trên Render.');
    }

    // Trim whitespace (common mistake when copy-pasting)
    const trimmedKey = apiKey.trim();
    if (trimmedKey !== apiKey) {
      this.logger.warn('API key có khoảng trắng thừa, đã tự động trim');
    }

    // Log API key status (masked for security)
    const maskedKey = trimmedKey.length > 8 
      ? `${trimmedKey.substring(0, 4)}...${trimmedKey.substring(trimmedKey.length - 4)}`
      : '***';
    this.logger.log(`Google AI API Key loaded: ${maskedKey} (length: ${trimmedKey.length})`);

    // Validate API key format (Google AI keys usually start with AIza)
    if (!trimmedKey.startsWith('AIza')) {
      this.logger.warn('API key không có định dạng chuẩn của Google AI (thường bắt đầu với "AIza")');
      this.logger.warn(`API key bắt đầu với: ${trimmedKey.substring(0, 4)}`);
    }

    // Use broadly supported models on v1beta
    this.genAI = new GoogleGenerativeAI(trimmedKey);
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
    } catch (error: any) {
      this.logger.error('Error generating text response:', error);
      
      // Check for API key errors specifically
      if (
        error?.message?.includes('API key not valid') || 
        error?.message?.includes('API_KEY_INVALID') ||
        error?.errorDetails?.some((d: any) => d.reason === 'API_KEY_INVALID') ||
        error?.status === 400 && error?.message?.includes('API')
      ) {
        this.logger.error('GOOGLE_AI_API_KEY không hợp lệ hoặc đã hết hạn.');
        this.logger.error('Vui lòng kiểm tra:');
        this.logger.error('  1. API key có đúng format không (bắt đầu với AIza...)');
        this.logger.error('  2. API key có còn hoạt động không (kiểm tra trên Google AI Studio)');
        this.logger.error('  3. API key đã được set đúng trong Render Environment Variables');
        throw new Error('API key Google AI không hợp lệ. Vui lòng kiểm tra GOOGLE_AI_API_KEY trong Render Dashboard.');
      }
      
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Tạo phản hồi văn bản từ Google AI thất bại: ${message}`);
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
    } catch (error: any) {
      this.logger.error('Error generating multimodal response:', error);
      
      // Check for API key errors specifically
      if (
        error?.message?.includes('API key not valid') || 
        error?.message?.includes('API_KEY_INVALID') ||
        error?.errorDetails?.some((d: any) => d.reason === 'API_KEY_INVALID') ||
        error?.status === 400 && error?.message?.includes('API')
      ) {
        this.logger.error('GOOGLE_AI_API_KEY không hợp lệ hoặc đã hết hạn.');
        this.logger.error('Vui lòng kiểm tra:');
        this.logger.error('  1. API key có đúng format không (bắt đầu với AIza...)');
        this.logger.error('  2. API key có còn hoạt động không (kiểm tra trên Google AI Studio)');
        this.logger.error('  3. API key đã được set đúng trong Render Environment Variables');
        throw new Error('API key Google AI không hợp lệ. Vui lòng kiểm tra GOOGLE_AI_API_KEY trong Render Dashboard.');
      }
      
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Tạo phản hồi đa phương tiện từ Google AI thất bại: ${message}`);
    }
  }

  /**
   * Convert Cloudinary public_id to optimized URL for Gemini
   * Dùng URL transform để giảm kích thước (max 1024px) và tối ưu format
   */
  convertCloudinaryPublicIdToPart(
    publicId: string,
    cloudName: string,
    mimeType?: string,
  ): Part {
    // Tạo URL transform: f_auto (auto format), q_auto (auto quality), w_1024 (max width 1024)
    // Gemini có thể fetch từ URL trực tiếp, không cần download
    const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1024,h_1024,c_limit/${publicId}`;
    return {
      inlineData: {
        data: optimizedUrl, // Gemini sẽ tự fetch từ URL này
        mimeType: mimeType || 'image/jpeg',
      },
    };
  }

  /**
   * Convert Cloudinary URL to optimized URL for Gemini
   */
  convertCloudinaryUrlToPart(url: string, mimeType?: string): Part {
    // Nếu đã là Cloudinary URL, transform nó
    if (url.includes('res.cloudinary.com')) {
      // Thêm transform vào URL nếu chưa có
      if (!url.includes('/upload/')) {
        return {
          inlineData: {
            data: url,
            mimeType: mimeType || 'image/jpeg',
          },
        };
      }
      // Insert transform vào URL
      const optimizedUrl = url.replace(
        '/upload/',
        '/upload/f_auto,q_auto,w_1024,h_1024,c_limit/',
      );
      return {
        inlineData: {
          data: optimizedUrl,
          mimeType: mimeType || 'image/jpeg',
        },
      };
    }
    // Nếu không phải Cloudinary URL, dùng trực tiếp
    return {
      inlineData: {
        data: url,
        mimeType: mimeType || 'image/jpeg',
      },
    };
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

  /**
   * Get Cloudinary cloud name from config
   */
  getCloudName(): string {
    return (
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'missing'
    );
  }

  // Helper to fetch an image URL and convert to inlineData Part
  async fetchImageUrlToPart(url: string, mimeType?: string): Promise<Part> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Không thể tải ảnh: ${res.status} ${res.statusText}`);
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
