import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, VerifyEmailDto, VerifyPhoneDto } from './dto';
import { User } from '../database/schemas/user.schema';
import { getUserId } from '../common/utils/get-user-id';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import twilio from 'twilio';

@Injectable()
export class AuthService {
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.initializeEmailTransporter();
    this.initializeTwilioClient();
  }

  private initializeEmailTransporter() {
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT') ?? 587,
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  private initializeTwilioClient() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(registerDto);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const userId = getUserId(user);
      await this.usersService.update(userId, { emailVerificationToken });

      // Send verification email
      await this.sendVerificationEmail(user.email, emailVerificationToken);

      // If phone number provided, send SMS verification
      if (registerDto.phoneNumber) {
        const phoneVerificationCode = this.generateVerificationCode();
        await this.usersService.update(userId, { phoneVerificationCode });
        await this.sendVerificationSMS(
          registerDto.phoneNumber,
          phoneVerificationCode,
        );
      }

      return {
        message: 'User registered successfully. Please verify your email.',
        userId: userId,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    const userId = getUserId(user);
    await this.usersService.updateLastLogin(userId);

    const payload = { email: user.email, sub: userId, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // Store refresh token
    await this.usersService.updateRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.usersService.findByEmailVerificationToken(
      verifyEmailDto.token,
    );

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    const userId = getUserId(user);
    await this.usersService.update(userId, {
      emailVerification: 'verified',
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async verifyPhone(verifyPhoneDto: VerifyPhoneDto, userId: string) {
    const user = await this.usersService.findById(userId);

    if (user.phoneVerificationCode !== verifyPhoneDto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    const userObjectId = getUserId(user);
    await this.usersService.update(userObjectId, {
      phoneVerification: 'verified',
      phoneVerificationCode: null,
    });

    return { message: 'Phone number verified successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByRefreshToken(refreshToken);

      const userId = getUserId(user);
      const newPayload = { email: user.email, sub: userId, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Verify Your Email - Chatbox',
      html: `
        <h2>Welcome to Chatbox!</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  private async sendVerificationSMS(phoneNumber: string, code: string) {
    if (!this.twilioClient) {
      console.log(`SMS verification code for ${phoneNumber}: ${code}`);
      return;
    }

    await this.twilioClient.messages.create({
      body: `Your Chatbox verification code is: ${code}`,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
