import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatSession, ChatSessionDocument } from '../database/schemas/chat-session.schema';
import { Message, MessageDocument, MessageRole } from '../database/schemas/message.schema';
import { AISettings, AISettingsDocument } from '../database/schemas/ai-settings.schema';
import { AIService } from '../ai/ai.service';
import { SendMessageDto, CreateSessionDto } from './dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(AISettings.name) private aiSettingsModel: Model<AISettingsDocument>,
    private aiService: AIService,
  ) {}

  // Chat Session Management
  async createSession(
    createSessionDto: CreateSessionDto,
    userId: string,
  ): Promise<ChatSession> {
    const session = new this.chatSessionModel({
      userId: new Types.ObjectId(userId),
      title: createSessionDto.title || 'New Chat',
      aiModel: createSessionDto.model || 'gpt-4',
    });

    return session.save();
  }

  async getSessions(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ sessions: ChatSession[]; total: number }> {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      this.chatSessionModel
        .find({ userId: new Types.ObjectId(userId), isActive: true })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.chatSessionModel.countDocuments({ userId: new Types.ObjectId(userId), isActive: true }),
    ]);

    return { sessions, total };
  }

  async getSessionById(sessionId: string, userId: string): Promise<ChatSession> {
    const session = await this.chatSessionModel
      .findOne({
        _id: sessionId,
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();

    if (!session) {
      throw new NotFoundException('Chat session not found or access denied');
    }

    return session;
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.chatSessionModel.findOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!session) {
      throw new NotFoundException('Chat session not found or access denied');
    }

    session.isActive = false;
    await session.save();
  }

  // AI Chat Functions
  async sendMessage(
    sendMessageDto: SendMessageDto,
    userId: string,
  ): Promise<{ userMessage: Message; aiMessage: Message }> {
    let sessionId = sendMessageDto.sessionId;

    // Create new session if not provided
    if (!sessionId) {
      const newSession = await this.createSession(
        { title: 'New Chat', model: sendMessageDto.model },
        userId,
      );
      sessionId = newSession._id.toString();
    }

    // Verify session belongs to user
    const session = await this.getSessionById(sessionId, userId);

    // Get user's AI settings
    const aiSettings = await this.getOrCreateAISettings(userId);

    // Create user message
    const userMessage = new this.messageModel({
      sessionId: new Types.ObjectId(sessionId),
      role: MessageRole.USER,
      content: sendMessageDto.message,
      timestamp: new Date(),
    });

    await userMessage.save();

    // Get conversation history for context
    const history = await this.getSessionHistory(sessionId, 10); // Last 10 messages
    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system prompt if provided
    if (sendMessageDto.systemPrompt || aiSettings.systemPrompt) {
      messages.unshift({
        role: 'system',
        content: sendMessageDto.systemPrompt || aiSettings.systemPrompt,
      });
    }

    try {
      // Generate AI response
      const aiResponse = await this.aiService.generateResponse(
        messages,
        sendMessageDto.model || session.aiModel || aiSettings.defaultModel,
        sendMessageDto.maxTokens || aiSettings.maxTokens,
        sendMessageDto.temperature || aiSettings.temperature,
      );

      // Create AI message
      const aiMessage = new this.messageModel({
        sessionId: new Types.ObjectId(sessionId),
        role: MessageRole.ASSISTANT,
        content: aiResponse.content,
        timestamp: new Date(),
        tokens: aiResponse.tokens,
        model: sendMessageDto.model || session.aiModel,
      });

      await aiMessage.save();

      // Update session
      await this.chatSessionModel.findByIdAndUpdate(sessionId, {
        lastMessageAt: new Date(),
        $inc: { 
          messageCount: 2, // User + AI message
          totalTokens: aiResponse.tokens,
        },
        $push: { messages: [userMessage._id, aiMessage._id] },
      });

      return { userMessage, aiMessage };
    } catch (error) {
      // If AI fails, still save user message
      await this.chatSessionModel.findByIdAndUpdate(sessionId, {
        lastMessageAt: new Date(),
        $inc: { messageCount: 1 },
        $push: { messages: userMessage._id },
      });

      throw new BadRequestException('Failed to generate AI response: ' + error.message);
    }
  }

  async getSessionHistory(
    sessionId: string,
    limit: number = 50,
  ): Promise<Message[]> {
    return this.messageModel
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ timestamp: 1 })
      .limit(limit)
      .exec();
  }

  async clearSessionHistory(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSessionById(sessionId, userId);
    
    // Delete all messages in session
    await this.messageModel.deleteMany({ sessionId: new Types.ObjectId(sessionId) });
    
    // Reset session stats
    await this.chatSessionModel.findByIdAndUpdate(sessionId, {
      messageCount: 0,
      totalTokens: 0,
      messages: [],
    });
  }

  async clearAllUserHistory(userId: string): Promise<void> {
    // Get all user sessions
    const sessions = await this.chatSessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('_id');

    const sessionIds = sessions.map(s => s._id);

    // Delete all messages
    await this.messageModel.deleteMany({
      sessionId: { $in: sessionIds },
    });

    // Reset all sessions
    await this.chatSessionModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      {
        messageCount: 0,
        totalTokens: 0,
        messages: [],
      },
    );
  }

  // AI Settings Management
  async getOrCreateAISettings(userId: string): Promise<AISettings> {
    let settings = await this.aiSettingsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!settings) {
      settings = new this.aiSettingsModel({
        userId: new Types.ObjectId(userId),
      });
      await settings.save();
    }

    return settings;
  }

  async updateAISettings(
    userId: string,
    updateData: any,
  ): Promise<AISettings> {
    const settings = await this.aiSettingsModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      updateData,
      { new: true, upsert: true },
    );

    return settings;
  }

  async getAISettings(userId: string): Promise<AISettings> {
    return this.getOrCreateAISettings(userId);
  }

  // Export functionality
  async exportUserHistory(userId: string, format: string = 'json'): Promise<any> {
    const sessions = await this.chatSessionModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .populate('messages')
      .sort({ createdAt: -1 })
      .exec();

    if (format === 'json') {
      return {
        exportDate: new Date(),
        totalSessions: sessions.length,
        sessions: sessions.map(session => ({
          id: session._id,
          title: session.title,
          aiModel: session.aiModel,
          createdAt: session.createdAt,
          messageCount: session.messageCount,
          totalTokens: session.totalTokens,
          messages: session.messages,
        })),
      };
    }

    // Add other formats (CSV, PDF) as needed
    throw new BadRequestException('Unsupported export format');
  }
}