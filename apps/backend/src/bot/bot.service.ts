import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context, Markup } from 'telegraf';
import { UserRepository } from '../repositories/user.repository';
import { StudentRepository } from '../repositories/student.repository';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private bot: Telegraf<Context>;
  private webAppUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly studentRepository: StudentRepository,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.webAppUrl =
      this.configService.get<string>('TELEGRAM_WEBAPP_URL') ||
      'https://new-student-bot-admin.vercel.app';

    if (token) {
      this.bot = new Telegraf(token);
    } else {
      this.logger.warn('TELEGRAM_BOT_TOKEN not provided, bot running in mock mode');
    }
  }

  async onModuleInit() {
    if (!this.bot) return;

    this.registerHandlers();
    this.logger.log('Telegram Bot handlers successfully registered');
  }

  private registerHandlers() {
    // /start command handler
    this.bot.start(async (ctx) => {
      const telegramId = ctx.from?.id.toString();
      const firstName = ctx.from?.first_name || 'Foydalanuvchi';

      let user = await this.userRepository.findByTelegramId(telegramId);

      if (!user) {
        // Automatically create or link user account
        user = await this.userRepository.create({
          telegramId,
          firstName,
          lastName: ctx.from?.last_name || null,
          role: 'STUDENT',
          status: 'ACTIVE',
        });
      }

      const keyboard = this.getRoleMenu(user.role);

      await ctx.reply(
        `Assalomu alaykum, ${firstName}!\n\n🎓 *Student Management Platform* rasmiy botiga xush kelibsiz.\n\nTizimdan foydalanish uchun quyidagi *WebApp* tugmasini bosing:`,
        {
          parse_mode: 'Markdown',
          ...keyboard,
        },
      );
    });

    // /help command
    this.bot.help((ctx) => {
      ctx.reply(
        'ℹ️ *Yordam va Buyruqlar*:\n\n' +
          '/start - Botni qayta ishga tushirish va menyu\n' +
          '/dashboard - WebApp platformasini ochish\n' +
          '/my_stats - Mening shaxsiy davomatim',
        { parse_mode: 'Markdown' },
      );
    });

    // /dashboard command
    this.bot.command('dashboard', (ctx) => {
      ctx.reply(
        '🚀 WebApp platformasini ochish uchun quyidagi tugmani bosing:',
        Markup.inlineKeyboard([
          Markup.button.webApp('📱 App Platformasini Ochish', this.webAppUrl),
        ]),
      );
    });
  }

  private getRoleMenu(role: string) {
    if (role === 'SUPER_ADMIN') {
      return Markup.keyboard([
        [Markup.button.webApp('👑 Super Admin Dashboard', this.webAppUrl)],
        ['📊 Tizim Statistikasi', '👥 Barcha Guruhlar'],
      ]).resize();
    }

    if (role === 'GROUP_LEADER') {
      return Markup.keyboard([
        [Markup.button.webApp('📋 Bugungi Davomat (1-Click)', `${this.webAppUrl}?view=attendance`)],
        ['📊 Guruh Statistikasi', "👤 Talabalar Ro'yxati"],
      ]).resize();
    }

    return Markup.keyboard([
      [Markup.button.webApp('📊 Mening Davomatim', `${this.webAppUrl}?view=student`)],
      ['👤 Mening Profilim', 'ℹ️ Yordam'],
    ]).resize();
  }

  async handleWebhookUpdate(update: any) {
    if (this.bot) {
      await this.bot.handleUpdate(update);
    }
  }

  async setWebhook(webhookUrl: string) {
    if (this.bot) {
      await this.bot.telegram.setWebhook(webhookUrl);
      this.logger.log(`Telegram Bot Webhook successfully set to ${webhookUrl}`);
    }
  }
}
