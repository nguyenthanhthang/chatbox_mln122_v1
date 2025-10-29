import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../database/schemas/chat.schema';
import { Message, MessageDocument } from '../database/schemas/message.schema';
import { CreateChatDto, CreateMessageDto, SearchMessagesDto } from './dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createChat(
    createChatDto: CreateChatDto,
    userId: string,
  ): Promise<Chat> {
    const chat = new this.chatModel({
      ...createChatDto,
      createdBy: new Types.ObjectId(userId),
      participants: [
        ...createChatDto.participants.map((id) => new Types.ObjectId(id)),
        new Types.ObjectId(userId),
      ],
    });

    return chat.save();
  }

  async getChats(userId: string): Promise<Chat[]> {
    return this.chatModel
      .find({
        participants: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('participants', 'username email avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async getChatById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatModel
      .findOne({
        _id: chatId,
        participants: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('participants', 'username email avatar')
      .populate('lastMessage')
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    return chat;
  }

  async sendMessage(
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
    const chat = await this.chatModel.findOne({
      _id: createMessageDto.chatId,
      participants: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    const message = new this.messageModel({
      chatId: new Types.ObjectId(createMessageDto.chatId),
      senderId: new Types.ObjectId(userId),
      content: createMessageDto.content,
      type: createMessageDto.type || 'text',
    });

    await message.save();

    // Update chat's last message
    await this.chatModel.findByIdAndUpdate(createMessageDto.chatId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 },
    });

    return message.populate('senderId', 'username email avatar');
  }

  async getChatHistory(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    const chat = await this.chatModel.findOne({
      _id: chatId,
      participants: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ chatId: new Types.ObjectId(chatId) })
        .populate('senderId', 'username email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments({ chatId: new Types.ObjectId(chatId) }),
    ]);

    return {
      messages: messages.reverse(),
      total,
    };
  }

  async searchMessages(
    searchDto: SearchMessagesDto,
    userId: string,
  ): Promise<Message[]> {
    const query: any = {
      content: { $regex: searchDto.query, $options: 'i' },
    };

    if (searchDto.chatId) {
      const chat = await this.chatModel.findOne({
        _id: searchDto.chatId,
        participants: new Types.ObjectId(userId),
        isActive: true,
      });

      if (!chat) {
        throw new NotFoundException('Chat not found or access denied');
      }

      query.chatId = searchDto.chatId;
    } else {
      // Search in all user's chats
      const userChats = await this.chatModel
        .find({
          participants: new Types.ObjectId(userId),
          isActive: true,
        })
        .select('_id');

      query.chatId = { $in: userChats.map((chat) => chat._id) };
    }

    if (searchDto.type) {
      query.type = searchDto.type;
    }

    return this.messageModel
      .find(query)
      .populate('senderId', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(searchDto.limit ?? 50)
      .skip(searchDto.offset ?? 0)
      .exec();
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatModel.findOne({
      _id: chatId,
      participants: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    // Mark all unread messages in chat as read by user
    await this.messageModel.updateMany(
      {
        chatId: new Types.ObjectId(chatId),
        readBy: { $ne: new Types.ObjectId(userId) },
      },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
      },
    );
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatModel.findOne({
      _id: chatId,
      createdBy: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    chat.isActive = false;
    await chat.save();
  }
}
