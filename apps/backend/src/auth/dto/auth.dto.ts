import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TelegramAuthDto {
  @ApiProperty({ description: 'Raw Telegram WebApp initData string' })
  @IsString()
  @IsNotEmpty()
  initData: string;
}

export class LoginDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
