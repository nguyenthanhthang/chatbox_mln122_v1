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
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { AIService } from '../ai/ai.service';
import { CloudinaryMonitorService } from '../common/services/cloudinary-monitor.service';
import {
  SendMessageDto,
  CreateSessionDto,
  UpdateAISettingsDto,
  UpdateSessionTitleDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { validateFileSignature } from '../common/utils/file-signature.util';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: AIService,
    private readonly configService: ConfigService,
    private readonly cloudinaryMonitor: CloudinaryMonitorService,
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
    return { message: 'Đã xóa cuộc trò chuyện thành công' };
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

  /**
   * Generate Cloudinary upload signature for direct client-side upload
   * FE sẽ dùng signature này để upload trực tiếp lên Cloudinary
   */
  @Post('upload-signature')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { ttl: 60000, limit: 20 } }) // 20 requests per minute
  async getUploadSignature(@Body() body: { folder?: string; publicId?: string }) {
    try {
      const folder = body.folder || 'chatbox/images';
      const timestamp = Math.round(Date.now() / 1000);
      
      // Generate signature parameters
      const params: any = {
        timestamp,
        folder,
        eager: 'w_320,h_320,c_limit,f_auto,q_auto', // Thumbnail sẵn
        transformation: 'f_auto,q_auto,w_1920,h_1920,c_limit', // Transform chính
      };

      if (body.publicId) {
        params.public_id = body.publicId;
      }

      // Generate signature
      const signature = cloudinary.utils.api_sign_request(
        params,
        this.configService.get<string>('CLOUDINARY_API_SECRET') || '',
      );

      return {
        signature,
        timestamp,
        folder,
        cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        apiKey: this.configService.get<string>('CLOUDINARY_API_KEY'),
        eager: params.eager,
        transformation: params.transformation,
      };
    } catch (err: any) {
      throw new BadRequestException(
        `Không thể tạo chữ ký upload: ${err?.message || String(err)}`,
      );
    }
  }

  /**
   * Legacy endpoint - vẫn giữ để backward compatibility
   * Nhưng khuyến khích dùng direct upload với signature
   */
  @Post('upload-image')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 uploads per minute
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        // Chấp nhận mọi file ảnh nhưng block SVG (security risk)
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
        // Block SVG files vì có thể chứa XSS
        if (file.mimetype === 'image/svg+xml') {
          return cb(new Error('SVG files không được hỗ trợ vì lý do bảo mật. Vui lòng sử dụng PNG, JPG hoặc WebP.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Giảm xuống 5MB để giảm rủi ro
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    // Validate file signature (magic numbers) - security check
    const isValidSignature = validateFileSignature(file.buffer, file.mimetype);
    if (!isValidSignature) {
      throw new BadRequestException(
        'File signature không khớp với định dạng. File có thể đã bị chỉnh sửa hoặc không phải là file ảnh hợp lệ.',
      );
    }

    try {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'chatbox/images',
            // Tự động nén và tối ưu ảnh
            transformation: [
              {
                // File đã được compress ở client-side, chỉ cần optimize nhẹ
                // Giữ nguyên kích thước nếu đã nhỏ (< 1MB sau khi compress)
                ...(file.size > 1024 * 1024
                  ? {
                      width: 1920,
                      height: 1920,
                      crop: 'limit',
                    }
                  : {}),
                // Chỉ nén nhẹ nếu file vẫn lớn (> 500KB), giữ nguyên nếu đã nhỏ
                quality: file.size > 500 * 1024 ? 'auto:good' : 'auto',
                fetch_format: 'auto', // Tự động convert sang format tối ưu (webp nếu browser hỗ trợ)
                // Chỉ dùng progressive cho JPEG lớn
                ...(file.mimetype === 'image/jpeg' && file.size > 500 * 1024
                  ? { flags: 'progressive' }
                  : {}),
              },
            ],
            // Tự động detect loại resource
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      // Log upload for monitoring
      await this.cloudinaryMonitor.logUpload(
        uploadResult.bytes || file.size,
        true, // transformed
      );

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
      // Kiểm tra nếu lỗi do Cloudinary config thiếu
      if (err?.message?.includes('Missing') || err?.message?.includes('Invalid')) {
        throw new BadRequestException('Cấu hình Cloudinary chưa được thiết lập. Vui lòng liên hệ quản trị viên.');
      }
      const msg = `Lỗi khi tải ảnh lên: ${err?.message || String(err)}`;
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
    return { message: 'Đã xóa lịch sử cuộc trò chuyện thành công' };
  }

  @Post('clear')
  async clearAllHistory(@CurrentUser() user: any) {
    await this.chatService.clearAllUserHistory(user.id);
    return { message: 'Đã xóa toàn bộ lịch sử thành công' };
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
