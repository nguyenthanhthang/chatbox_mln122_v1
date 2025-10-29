import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { CreateChatDto, CreateMessageDto, SearchMessagesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Chat rooms management
  @Post('rooms')
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.createChat(createChatDto, user.id);
  }

  @Get('rooms')
  async getChats(@CurrentUser() user: any) {
    return this.chatService.getChats(user.id);
  }

  @Get('rooms/:id')
  async getChatById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.getChatById(id, user.id);
  }

  @Delete('rooms/:id')
  async deleteChat(@Param('id') id: string, @CurrentUser() user: any) {
    await this.chatService.deleteChat(id, user.id);
    return { message: 'Chat deleted successfully' };
  }

  // Chat history
  @Get('rooms/:id/history')
  async getChatHistory(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getChatHistory(id, user.id, page, limit);
  }

  // Messages
  @Post('send')
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.sendMessage(createMessageDto, user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    // TODO: Implement file upload logic
    return { message: 'File upload endpoint - to be implemented' };
  }

  // Search
  @Post('search')
  async searchMessages(
    @Body() searchDto: SearchMessagesDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.searchMessages(searchDto, user.id);
  }

  // Message status
  @Post('rooms/:id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    await this.chatService.markAsRead(id, user.id);
    return { message: 'Messages marked as read' };
  }
}
