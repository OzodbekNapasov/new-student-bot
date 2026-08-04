import { Bot, InlineKeyboard } from 'grammy';
import { prisma } from '../prisma/client.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ';
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';

export const bot = new Bot(BOT_TOKEN);

// Bot Commands
bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  const firstName = ctx.from?.first_name || 'Foydalanuvchi';
  const username = ctx.from?.username || '';

  if (!telegramId) return;

  // Check or register user
  let user = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      studentProfile: { include: { group: true } },
      managedGroups: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        firstName,
        username,
        role: 'STUDENT',
      },
      include: {
        studentProfile: { include: { group: true } },
        managedGroups: true,
      },
    });
  }

  let roleTitle = '🎓 Talaba';
  if (user.role === 'SUPER_ADMIN') roleTitle = '👑 Tizim Administratori';
  if (user.role === 'GROUP_LEADER') roleTitle = '⭐ Guruh Rahbari';

  let groupInfo = '';
  if (user.studentProfile?.group) {
    groupInfo = `\n📌 **Guruhingiz:** ${user.studentProfile.group.name}`;
  } else if (user.managedGroups.length > 0) {
    groupInfo = `\n📌 **Boshqaradigan guruhlar:** ${user.managedGroups.map((g) => g.name).join(', ')}`;
  }

  const welcomeMessage = `
👋 **Assalomu alaykum, ${firstName}!**

**Student Management Platform** botiga xush kelibsiz!

👤 **Sizning rolingiz:** ${roleTitle}${groupInfo}

Barcha imkoniyatlardan foydalanish uchun quyidagi **Mini App (WebApp)** tugmasini bosing:
  `.trim();

  const keyboard = new InlineKeyboard().webApp('📱 Platformani ochish', WEBAPP_URL);

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
});

bot.command('profile', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const user = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      studentProfile: { include: { group: { include: { leader: true } } } },
    },
  });

  if (!user) {
    return ctx.reply('⚠️ Siz tizimda roʻyxatdan oʻtmagansiz. /start tugmasini bosing.');
  }

  const profileText = `
👤 **Foydalanuvchi Profili**
🆔 Telegram ID: \`${user.telegramId}\`
👤 Ism: ${user.firstName} ${user.lastName || ''}
🔑 Rol: ${user.role}
📱 Telefon: ${user.phone || 'Kiritilmagan'}
${user.studentProfile?.group ? `🏫 Guruh: ${user.studentProfile.group.name}\n👨‍🏫 Guruh Rahbari: ${user.studentProfile.group.leader ? user.studentProfile.group.leader.firstName : 'Tayinlanmagan'}` : ''}
  `.trim();

  await ctx.reply(profileText, { parse_mode: 'Markdown' });
});

bot.command('help', async (ctx) => {
  const helpText = `
❓ **Yordam va Yo'riqnoma**

🔹 **Talabalar uchun:**
Telegram Mini App orqali davomatingizni, guruhdagi vazifalaringizni ko'rishingiz va javob topshirishingiz mumkin.

🔹 **Guruh Rahbarlari uchun:**
WebApp orqali faqat o'z guruh talabalari davomatini belgilashingiz, topshiriqlar yaratishingiz va baholashingiz mumkin.

🔹 **Administratorlar uchun:**
Web Admin Panel orqali barcha guruhlarni boshqarishingiz va guruh rahbarlarini biriktirishingiz mumkin.
  `.trim();

  await ctx.reply(helpText, { parse_mode: 'Markdown' });
});

// Helper function to send notification via Telegram Bot
export async function sendTelegramNotification(telegramId: string, message: string) {
  try {
    await bot.api.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    return true;
  } catch (error) {
    console.error(`Failed to send Telegram message to ${telegramId}:`, error);
    return false;
  }
}
