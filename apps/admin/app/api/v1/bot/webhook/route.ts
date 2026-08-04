import { NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const webAppUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://new-student-bot-admin.vercel.app';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const bot = new Telegraf(token);
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder',
);

// ============================================================
// Helper: get or create user
// ============================================================
async function upsertUser(tgUser: any) {
  const { data } = await supabase
    .from('users')
    .upsert(
      {
        telegram_id: String(tgUser.id),
        first_name: tgUser.first_name || 'User',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'telegram_id', ignoreDuplicates: false },
    )
    .select('*')
    .single();
  return data;
}

// ============================================================
// Helper: get user role
// ============================================================
async function getUser(telegramId: string) {
  const { data } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();
  return data;
}

// ============================================================
// Helper: save bot state (conversation state)
// ============================================================
async function setState(telegramId: string, state: string | null) {
  if (state === null) {
    await supabase.from('bot_states').delete().eq('telegram_id', telegramId);
  } else {
    await supabase
      .from('bot_states')
      .upsert(
        { telegram_id: telegramId, state, updated_at: new Date().toISOString() },
        { onConflict: 'telegram_id' },
      );
  }
}

async function getState(telegramId: string): Promise<string | null> {
  const { data } = await supabase
    .from('bot_states')
    .select('state')
    .eq('telegram_id', telegramId)
    .single();
  return data?.state || null;
}

// ============================================================
// /start command
// ============================================================
bot.start(async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;

  // Upsert user
  const user = await upsertUser(tgUser);

  // Check if admin
  if (String(tgUser.id) === '8135594558') {
    // Force admin role
    await supabase
      .from('users')
      .update({ role: 'SUPER_ADMIN' })
      .eq('telegram_id', String(tgUser.id));
    await ctx.reply(
      `👑 Xush kelibsiz, Admin!\n\nPlatformani boshqarish uchun quyidagi tugmani bosing:`,
      Markup.keyboard([[Markup.button.webApp('🖥️ Admin Panelini Ochish', webAppUrl)]]).resize(),
    );
    return;
  }

  // If already a GROUP_LEADER
  if (user?.role === 'GROUP_LEADER') {
    await ctx.reply(
      `👨‍🏫 Xush kelibsiz, ${tgUser.first_name}!\n\nGuruhingizni boshqarish uchun quyidagi tugmani bosing:`,
      Markup.keyboard([[Markup.button.webApp('📋 Guruh Paneliga Kirish', webAppUrl)]]).resize(),
    );
    return;
  }

  // If already a STUDENT
  if (user?.role === 'STUDENT') {
    await ctx.reply(
      `🎓 Xush kelibsiz, ${tgUser.first_name}!\n\nDavomatingizni ko'rish uchun:`,
      Markup.keyboard([[Markup.button.webApp("📊 Davomatimni Ko'rish", webAppUrl)]]).resize(),
    );
    return;
  }

  // New user — ask for login code
  await setState(String(tgUser.id), 'WAITING_LOGIN_CODE');
  await ctx.reply(
    `Assalomu alaykum, ${tgUser.first_name}! 👋\n\n` +
      `🔑 Tizimga kirish uchun *login kodingizni* yuboring.\n\n` +
      `📌 Login kodni guruh rahbari bo'lsangiz — admin tomonidan beriladi.\n` +
      `📌 Talaba bo'lsangiz — guruh rahbaringizdan so'rang.`,
    { parse_mode: 'Markdown' },
  );
});

// ============================================================
// /help command
// ============================================================
bot.help(async (ctx) => {
  const user = await getUser(String(ctx.from?.id));
  const roleText =
    user?.role === 'SUPER_ADMIN'
      ? '👑 Super Admin'
      : user?.role === 'GROUP_LEADER'
        ? '👨‍🏫 Guruh Rahbari'
        : user?.role === 'STUDENT'
          ? '🎓 Talaba'
          : "❓ Noma'lum";

  await ctx.reply(
    `ℹ️ *Yordam*\n\nRolingiz: ${roleText}\n\n` +
      `/start — Botni qayta ishga tushirish\n` +
      `/panel — Panelingizni ochish`,
    { parse_mode: 'Markdown' },
  );
});

// ============================================================
// /panel command
// ============================================================
bot.command('panel', async (ctx) => {
  const user = await getUser(String(ctx.from?.id));
  if (!user || user.role === 'STUDENT') {
    await ctx.reply(
      '📱 Platformani ochish:',
      Markup.keyboard([[Markup.button.webApp('📱 Platformani Ochish', webAppUrl)]]).resize(),
    );
    return;
  }
  const label =
    user.role === 'SUPER_ADMIN' ? '🖥️ Admin Panelini Ochish' : '📋 Guruh Paneliga Kirish';
  await ctx.reply(
    'Panelni oching:',
    Markup.keyboard([[Markup.button.webApp(label, webAppUrl)]]).resize(),
  );
});

// ============================================================
// Text message handler — process login code
// ============================================================
bot.on('text', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const text = ctx.message.text.trim();

  // Ignore commands
  if (text.startsWith('/')) return;

  const state = await getState(telegramId);

  if (state === 'WAITING_LOGIN_CODE') {
    // Try to find group by login code
    const code = text.toUpperCase().trim();

    const { data: group } = await supabase
      .from('groups')
      .select('*, leader:users!groups_leader_id_fkey(telegram_id)')
      .eq('login_code', code)
      .eq('is_active', true)
      .single();

    if (!group) {
      await ctx.reply(
        `❌ *Login kod topilmadi!*\n\n` +
          `Kod: \`${code}\`\n\n` +
          `Iltimos, to'g'ri kodni kiriting yoki admindan yangi kod so'rang.`,
        { parse_mode: 'Markdown' },
      );
      return;
    }

    // Check if group already has a different leader
    if (group.leader_id && group.leader?.telegram_id !== telegramId) {
      await ctx.reply(`⚠️ Bu guruhning rahbari allaqachon belgilangan.\nAdmin bilan bog'laning.`);
      return;
    }

    // Upsert user as GROUP_LEADER
    const tgUser = ctx.from;
    const { data: user } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id: telegramId,
          first_name: tgUser.first_name || 'Rahbar',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          role: 'GROUP_LEADER',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'telegram_id' },
      )
      .select('*')
      .single();

    // Assign as group leader
    await supabase
      .from('groups')
      .update({ leader_id: user?.id, updated_at: new Date().toISOString() })
      .eq('id', group.id);

    // Clear state
    await setState(telegramId, null);

    await ctx.reply(
      `✅ *Muvaffaqiyatli kirish!*\n\n` +
        `👨‍🏫 Siz *${group.name}* guruhining rahbari sifatida tizimga kirdingiz.\n\n` +
        `Guruhingizni boshqarish uchun quyidagi tugmani bosing:`,
      {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
          [Markup.button.webApp('📋 Guruh Paneliga Kirish', webAppUrl)],
        ]).resize(),
      },
    );
    return;
  }

  // Default — show panel button
  const user = await getUser(telegramId);
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'GROUP_LEADER' || user?.role === 'STUDENT') {
    const label =
      user.role === 'SUPER_ADMIN'
        ? '🖥️ Admin Panelini Ochish'
        : user.role === 'GROUP_LEADER'
          ? '📋 Guruh Paneliga Kirish'
          : "📊 Davomatimni Ko'rish";
    await ctx.reply(
      'Panelingizni oching:',
      Markup.keyboard([[Markup.button.webApp(label, webAppUrl)]]).resize(),
    );
  } else {
    await setState(telegramId, 'WAITING_LOGIN_CODE');
    await ctx.reply('🔑 Login kodingizni yuboring:');
  }
});

// ============================================================
// Webhook handlers
// ============================================================
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
  return NextResponse.json({ status: 'Telegram Bot Webhook Active ✅', version: '2.0-login-code' });
}
