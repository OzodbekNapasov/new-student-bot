import { NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN || '8615940322:AAFbjXb3ExmtDMTfjoDoPq9gIWdScsdt3eo';
const webAppUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://new-student-bot-admin.vercel.app';

const bot = new Telegraf(token);

bot.start(async (ctx) => {
  const firstName = ctx.from?.first_name || 'Foydalanuvchi';
  await ctx.reply(
    `Assalomu alaykum, ${firstName}!\n\n🎓 Student Management Platform rasmiy botiga xush kelibsiz.\n\nPlatformani ochish uchun quyidagi tugmani bosing:`,
    Markup.keyboard([
      [Markup.button.webApp('📱 App Platformasini Ochish', webAppUrl)],
      ['📊 Mening Davomatim', 'ℹ️ Yordam'],
    ]).resize(),
  );
});

bot.help(async (ctx) => {
  await ctx.reply(
    'ℹ️ Yordam va Buyruqlar:\n\n' + '/start - Botni qayta ishga tushirish\n' + '/help - Yordam',
  );
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  if (text === '📊 Mening Davomatim') {
    await ctx.reply('📊 Davomatingiz hisob-kitob qilinmoqda...');
  } else if (text === 'ℹ️ Yordam') {
    await ctx.reply('ℹ️ Yordam:\n\n/start - Bosh menyu\n📱 App tugmasi - WebApp platformasi');
  } else {
    await ctx.reply(
      'Platformadan foydalanish uchun quyidagi tugmani bosing:',
      Markup.keyboard([
        [Markup.button.webApp('📱 App Platformasini Ochish', webAppUrl)],
        ['📊 Mening Davomatim', 'ℹ️ Yordam'],
      ]).resize(),
    );
  }
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
  return NextResponse.json({ status: 'Telegram Bot Webhook is Active ✅' });
}
