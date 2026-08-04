import { NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN || '8615940322:AAFbjXb3ExmtDMTfjoDoPq9gIWdScsdt3eo';
const webAppUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://new-student-bot-admin.vercel.app';

const bot = new Telegraf(token);

// /start command
bot.start(async (ctx) => {
  const firstName = ctx.from?.first_name || 'Foydalanuvchi';

  await ctx.reply(
    `Assalomu alaykum, ${firstName}!\n\n🎓 *Student Management Platform* rasmiy botiga xush kelibsiz.\n\nTizimdan foydalanish va davomatni ko'rish uchun quyidagi *WebApp* tugmasini bosing:`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        [Markup.button.webApp('📱 App Platformasini Ochish', webAppUrl)],
        ['📊 Mening Davomatim', 'ℹ️ Yordam'],
      ]).resize(),
    },
  );
});

// /help command
bot.help(async (ctx) => {
  await ctx.reply(
    'ℹ️ *Yordam va Buyruqlar*:\n\n' +
      '/start - Botni qayta ishga tushirish va menyu\n' +
      '/dashboard - WebApp platformasini ochish\n' +
      '/my_stats - Mening shaxsiy davomatim',
    { parse_mode: 'Markdown' },
  );
});

export async function POST(req: Request) {
  try {
    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Bot webhook error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram Bot Webhook Active on Vercel' });
}
