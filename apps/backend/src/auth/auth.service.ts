import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repositories/user.repository';
import { verifyTelegramWebAppData } from './utils/telegram-auth';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateTelegramAuth(initData: string) {
    const botToken =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      '8615940322:AAFbjXb3ExmtDMTfjoDoPq9gIWdScsdt3eo';
    const tgUser = verifyTelegramWebAppData(initData, botToken);

    if (!tgUser) {
      throw new UnauthorizedException('Invalid Telegram WebApp initData signature');
    }

    let user = await this.userRepository.findByTelegramId(String(tgUser.id));

    if (!user) {
      user = await this.userRepository.create({
        telegramId: String(tgUser.id),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        role: 'STUDENT',
        status: 'ACTIVE',
      });
    }

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'BLOCKED') {
      throw new ForbiddenException('Account is blocked');
    }

    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'super-secret-jwt-key-student-management-2026',
      });

      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.status === 'BLOCKED') {
        throw new ForbiddenException('User access denied');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      telegramId: user.telegramId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        telegramId: user.telegramId,
      },
    };
  }
}
