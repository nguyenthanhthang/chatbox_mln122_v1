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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { AIService } from '../ai/ai.service';
import {
  SendMessageDto,
  CreateSessionDto,
  UpdateAISettingsDto,
  UpdateSessionTitleDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: AIService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('CLOUDINARY_URL');
    if (url) {
      // Let SDK read from env variable
      process.env.CLOUDINARY_URL = url;
      cloudinary.config({});
      cloudinary.config({ secure: true });
    } else {
      cloudinary.config({
        cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        secure: true,
      });
    }

    // Safe log to verify Cloudinary credentials are loaded
    const cfg = cloudinary.config() as any;
    const obf = (s?: string) =>
      s ? `${s.slice(0, 3)}***${s.slice(-2)}` : 'MISSING';
    // eslint-disable-next-line no-console
    console.log('[Cloudinary]', {
      name: cfg.cloud_name || 'MISSING',
      key: cfg.api_key ? 'SET' : 'MISSING',
      keySample: obf(cfg.api_key),
    });
  }

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

  @Patch('sessions/:id')
  async renameSession(
    @Param('id') id: string,
    @Body() body: UpdateSessionTitleDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.updateSessionTitle(id, user.id, body.title);
  }

  // AI Chat Functions
  @Post('send')
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.sendMessage(sendMessageDto, user.id);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    try {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'chatbox/avatars',
            transformation: [
              { width: 256, height: 256, crop: 'fill', gravity: 'face' },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      return {
        url: uploadResult.secure_url || uploadResult.url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.bytes,
        format: uploadResult.format,
        mimeType: file.mimetype,
        filename: file.originalname,
      };
    } catch (err: any) {
      const msg = `Cloudinary upload failed: ${err?.message || String(err)}`;
      // Surface to client as 400 so FE can read the message
      throw new BadRequestException(msg);
    }
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
  getAvailableModels() {
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
