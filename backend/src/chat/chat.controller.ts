import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AIService } from '../ai/ai.service';
import { SendMessageDto, CreateSessionDto, UpdateAISettingsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: AIService,
  ) {}

  // Chat Sessions Management
  @Post('sessions')
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.createSession(createSessionDto, user.id);
  }

  @Get('sessions')
  async getSessions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getSessions(user.id, page, limit);
  }

  @Get('sessions/:id')
  async getSessionById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.getSessionById(id, user.id);
  }

  @Delete('sessions/:id')
  async deleteSession(@Param('id') id: string, @CurrentUser() user: any) {
    await this.chatService.deleteSession(id, user.id);
    return { message: 'Chat session deleted successfully' };
  }

  // AI Chat Functions
  @Post('send')
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.sendMessage(sendMessageDto, user.id);
  }

  @Get('history/:sessionId')
  async getSessionHistory(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit: number = 50,
    @CurrentUser() user: any,
  ) {
    // Verify session belongs to user
    await this.chatService.getSessionById(sessionId, user.id);
    return this.chatService.getSessionHistory(sessionId, limit);
  }

  @Delete('history/:sessionId')
  async clearSessionHistory(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: any,
  ) {
    await this.chatService.clearSessionHistory(sessionId, user.id);
    return { message: 'Session history cleared successfully' };
  }

  @Post('clear')
  async clearAllHistory(@CurrentUser() user: any) {
    await this.chatService.clearAllUserHistory(user.id);
    return { message: 'All chat history cleared successfully' };
  }

  @Get('export')
  async exportHistory(
    @Query('format') format: string = 'json',
    @CurrentUser() user: any,
  ) {
    return this.chatService.exportUserHistory(user.id, format);
  }

  // AI Configuration
  @Get('ai/models')
  async getAvailableModels() {
    return this.chatService['aiService'].getAvailableModels();
  }

  @Get('ai/settings')
  async getAISettings(@CurrentUser() user: any) {
    return this.chatService.getAISettings(user.id);
  }

  @Patch('ai/settings')
  async updateAISettings(
    @Body() updateAISettingsDto: UpdateAISettingsDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.updateAISettings(user.id, updateAISettingsDto);
  }
}