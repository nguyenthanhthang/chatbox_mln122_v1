import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsUrl, IsDateString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  emailVerificationToken?: string | null;

  @IsOptional()
  phoneVerificationCode?: string | null;

  @IsOptional()
  @IsString()
  emailVerification?: 'pending' | 'verified';

  @IsOptional()
  @IsString()
  phoneVerification?: 'pending' | 'verified';

  @IsOptional()
  refreshToken?: string | null;

  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;
}
