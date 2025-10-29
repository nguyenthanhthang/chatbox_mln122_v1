import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    model: string = 'gpt-4',
    maxTokens: number = 1000,
    temperature: number = 0.7,
  ): Promise<{ content: string; tokens: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: messages as any,
        max_tokens: maxTokens,
        temperature,
      });

      const content = response.choices[0]?.message?.content || '';
      const tokens = response.usage?.total_tokens || 0;

      this.logger.log(`OpenAI response generated: ${tokens} tokens used`);

      return { content, tokens };
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateStreamResponse(
    messages: Array<{ role: string; content: string }>,
    model: string = 'gpt-4',
    maxTokens: number = 1000,
    temperature: number = 0.7,
  ): Promise<AsyncGenerator<string, void, unknown>> {
    try {
      const stream = await this.openai.chat.completions.create({
        model,
        messages: messages as any,
        max_tokens: maxTokens,
        temperature,
        stream: true,
      });

      return this.processStream(stream);
    } catch (error) {
      this.logger.error('OpenAI streaming error:', error);
      throw new Error('Failed to generate streaming AI response');
    }
  }

  private async *processStream(stream: any): AsyncGenerator<string, void, unknown> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];
  }
}
