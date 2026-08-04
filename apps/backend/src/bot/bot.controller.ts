import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BotService } from './bot.service';

@ApiTags('Telegram Bot')
@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Telegram Bot Webhook update endpoint' })
  async handleWebhook(@Body() update: any) {
    await this.botService.handleWebhookUpdate(update);
    return { status: 'ok' };
  }
}
