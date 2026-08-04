import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, TelegramAuthDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate student or group leader via Telegram WebApp initData HMAC' })
  @ApiResponse({ status: 200, description: 'Successful authentication' })
  async authenticateTelegram(@Body() dto: TelegramAuthDto) {
    return this.authService.validateTelegramAuth(dto.initData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate Admin Panel / Group Leader with email & password' })
  @ApiResponse({ status: 200, description: 'Successful login' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtain new Access Token using Refresh Token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }
}
