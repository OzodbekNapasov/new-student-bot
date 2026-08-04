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
// Helpers
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

async function getUser(telegramId: string) {
  const { data } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();
  return data;
}

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

function getRoleKeyboard(role: string) {
  if (role === 'SUPER_ADMIN') {
    return Markup.keyboard([
      [Markup.button.text("📚 Guruhlar ro'yxati"), Markup.button.text('👥 Barcha talabalar')],
      [Markup.button.webApp('🖥️ Admin Web Paneli', webAppUrl)],
    ]).resize();
  }
  if (role === 'GROUP_LEADER') {
    return Markup.keyboard([
      [Markup.button.text("👥 Talabalar ro'yxati"), Markup.button.text("＋ Talaba qo'shish")],
      [Markup.button.webApp('📋 Guruh Web Paneli', webAppUrl)],
    ]).resize();
  }
  return Markup.keyboard([
    [Markup.button.text('📚 Mening guruhim')],
    [Markup.button.webApp('📱 Web Panel', webAppUrl)],
  ]).resize();
}

// Helper: send group students list (alphabetical)
async function sendGroupStudentsList(ctx: any, groupId: string, groupName: string) {
  const { data: students } = await supabase
    .from('students')
    .select('*, user:users(*)')
    .eq('group_id', groupId);

  if (!students || students.length === 0) {
    await ctx.reply(`📚 *${groupName}* guruhida hali talabalar yo'q.`, { parse_mode: 'Markdown' });
    return;
  }

  // Sort alphabetically by first_name & last_name
  const sorted = students.sort((a, b) => {
    const nameA = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.trim();
    const nameB = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.trim();
    return nameA.localeCompare(nameB, 'uz');
  });

  let message = `📚 *${groupName}* guruhi talabalari (Alifbo tartibida):\n\n`;
  sorted.forEach((s, idx) => {
    const fullName = `${s.user?.first_name || ''} ${s.user?.last_name || ''}`.trim();
    const username = s.user?.username ? `@${s.user.username}` : `ID: \`${s.user?.telegram_id}\``;
    message += `${idx + 1}. 👤 *${fullName}* — ${username}\n`;
  });

  message += `\n👥 *Jami:* ${sorted.length} nafar talaba`;

  await ctx.reply(message, { parse_mode: 'Markdown' });
}

// ============================================================
// /start command
// ============================================================
bot.start(async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;

  const user = await upsertUser(tgUser);

  // Check if admin
  if (String(tgUser.id) === '8135594558') {
    await supabase
      .from('users')
      .update({ role: 'SUPER_ADMIN' })
      .eq('telegram_id', String(tgUser.id));
    await ctx.reply(`👑 *Xush kelibsiz, Admin!*\n\nKerakli bo'limni tanlang:`, {
      parse_mode: 'Markdown',
      ...getRoleKeyboard('SUPER_ADMIN'),
    });
    return;
  }

  // If GROUP_LEADER
  if (user?.role === 'GROUP_LEADER') {
    await ctx.reply(`👨‍🏫 *Xush kelibsiz, ${tgUser.first_name}!*\n\nKerakli bo'limni tanlang:`, {
      parse_mode: 'Markdown',
      ...getRoleKeyboard('GROUP_LEADER'),
    });
    return;
  }

  // If STUDENT — check if belongs to a group
  if (user?.role === 'STUDENT') {
    const { data: studentRecord } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentRecord) {
      await ctx.reply(`🎓 *Xush kelibsiz, ${tgUser.first_name}!*\n\nKerakli bo'limni tanlang:`, {
        parse_mode: 'Markdown',
        ...getRoleKeyboard('STUDENT'),
      });
      return;
    }
  }

  // Unregistered — ask for login code
  await setState(String(tgUser.id), 'WAITING_LOGIN_CODE');
  await ctx.reply(
    `Assalomu alaykum, ${tgUser.first_name}! 👋\n\n` +
      `🔑 Tizimga kirish uchun *login kodingizni* yuboring.\n\n` +
      `📌 Login kodni guruh rahbari bo'lsangiz — admin beradi.\n` +
      `📌 Talaba bo'lsangiz — guruh rahbaringizdan so'rang.`,
    { parse_mode: 'Markdown' },
  );
});

// ============================================================
// Button Handlers
// ============================================================

// 👥 Talabalar ro'yxati (Group Leader)
bot.hears("👥 Talabalar ro'yxati", async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await getUser(telegramId);

  if (!user || (user.role !== 'GROUP_LEADER' && user.role !== 'SUPER_ADMIN')) {
    await ctx.reply("❌ Sizda bu buyruqni ishlatish huquqi yo'q.");
    return;
  }

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('leader_id', user.id)
    .single();

  if (!group) {
    await ctx.reply('⚠️ Sizga hali guruh biriktirilmagan.');
    return;
  }

  await sendGroupStudentsList(ctx, group.id, group.name);
});

// ＋ Talaba qo'shish (Group Leader & Admin)
bot.hears("＋ Talaba qo'shish", async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await getUser(telegramId);

  if (!user || (user.role !== 'GROUP_LEADER' && user.role !== 'SUPER_ADMIN')) {
    await ctx.reply("❌ Sizda bu buyruqni ishlatish huquqi yo'q.");
    return;
  }

  await setState(telegramId, 'WAITING_ADD_STUDENT');
  await ctx.reply(
    `➕ *Yangi talaba qo'shish*\n\n` +
      `Talabaning Telegram ID'sini va Ismini yuboring.\n\n` +
      `📌 *Format:* \`TelegramID Ism Familiya\`\n` +
      `📌 *Misol:* \`987654321 Jasur Toshmatov\`\n\n` +
      `Bekor qilish uchun /cancel deb yozing.`,
    { parse_mode: 'Markdown' },
  );
});

// 📚 Guruhlar ro'yxati (Admin)
bot.hears("📚 Guruhlar ro'yxati", async (ctx) => {
  const telegramId = String(ctx.from.id);
  if (telegramId !== '8135594558') return;

  const { data: groups } = await supabase
    .from('groups')
    .select('*, leader:users!groups_leader_id_fkey(first_name, last_name), students(count)')
    .order('created_at', { ascending: false });

  if (!groups || groups.length === 0) {
    await ctx.reply('📂 Guruhlar topilmadi.');
    return;
  }

  let text = `📚 *Barcha Guruhlar Ro'yxati:* (${groups.length} ta)\n\n`;
  groups.forEach((g, idx) => {
    const leaderName = g.leader
      ? `${g.leader.first_name} ${g.leader.last_name}`.trim()
      : ' Kutilmoqda...';
    const studentCount = g.students?.[0]?.count || 0;
    text += `${idx + 1}. *${g.name}* (${g.code})\n`;
    text += `   👨‍🏫 Rahbar: ${leaderName}\n`;
    text += `   🔑 Login kodi: \`${g.login_code || '---'}\`\n`;
    text += `   👥 Talabalar: ${studentCount} nafar\n\n`;
  });

  await ctx.reply(text, { parse_mode: 'Markdown' });
});

// 👥 Barcha talabalar (Admin)
bot.hears('👥 Barcha talabalar', async (ctx) => {
  const telegramId = String(ctx.from.id);
  if (telegramId !== '8135594558') return;

  const { data: students } = await supabase
    .from('students')
    .select('*, user:users(*), group:groups(name)');

  if (!students || students.length === 0) {
    await ctx.reply("👥 Tizimda talabalar yo'q.");
    return;
  }

  // Sort alphabetically
  const sorted = students.sort((a, b) => {
    const nameA = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.trim();
    const nameB = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.trim();
    return nameA.localeCompare(nameB, 'uz');
  });

  let text = `👥 *Barcha Talabalar Ro'yxati (Alifbo tartibida):*\n\n`;
  sorted.forEach((s, idx) => {
    const name = `${s.user?.first_name || ''} ${s.user?.last_name || ''}`.trim();
    text += `${idx + 1}. 👤 *${name}* — ${s.group?.name || 'Guruhsiz'}\n`;
  });

  text += `\n👥 *Jami:* ${sorted.length} nafar talaba`;
  await ctx.reply(text, { parse_mode: 'Markdown' });
});

// 📚 Mening guruhim (Student)
bot.hears('📚 Mening guruhim', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await getUser(telegramId);

  if (!user) return;

  const { data: studentRecord } = await supabase
    .from('students')
    .select('*, group:groups(*)')
    .eq('user_id', user.id)
    .single();

  if (!studentRecord || !studentRecord.group) {
    await ctx.reply('⚠️ Siz hali biror guruhga biriktirilmagansiz.');
    return;
  }

  await sendGroupStudentsList(ctx, studentRecord.group.id, studentRecord.group.name);
});

// /cancel command to reset state
bot.command('cancel', async (ctx) => {
  await setState(String(ctx.from.id), null);
  const user = await getUser(String(ctx.from.id));
  await ctx.reply('❌ Amaliyot bekor qilindi.', getRoleKeyboard(user?.role || 'STUDENT'));
});

// ============================================================
// Text message handler
// ============================================================
bot.on('text', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  const state = await getState(telegramId);

  // 1. Process Login Code
  if (state === 'WAITING_LOGIN_CODE') {
    const code = text.toUpperCase().trim();

    const { data: group } = await supabase
      .from('groups')
      .select('*, leader:users!groups_leader_id_fkey(telegram_id)')
      .eq('login_code', code)
      .eq('is_active', true)
      .single();

    if (!group) {
      await ctx.reply(
        `❌ *Login kod topilmadi!*\n\nKod: \`${code}\`\n\nIltimos, to'g'ri kodni kiriting yoki admindan yangi kod so'rang.`,
        { parse_mode: 'Markdown' },
      );
      return;
    }

    if (group.leader_id && group.leader?.telegram_id !== telegramId) {
      await ctx.reply(`⚠️ Bu guruhning rahbari allaqachon belgilangan.\nAdmin bilan bog'laning.`);
      return;
    }

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

    await supabase
      .from('groups')
      .update({ leader_id: user?.id, updated_at: new Date().toISOString() })
      .eq('id', group.id);

    await setState(telegramId, null);

    await ctx.reply(
      `✅ *Muvaffaqiyatli kirish!*\n\n` +
        `👨‍🏫 Siz *${group.name}* guruhining rahbari sifatida tizimga kirdingiz.\n\n` +
        `Quydagi tugmalar orqali botdan foydalanishingiz mumkin:`,
      { parse_mode: 'Markdown', ...getRoleKeyboard('GROUP_LEADER') },
    );
    return;
  }

  // 2. Process Add Student via Bot Text
  if (state === 'WAITING_ADD_STUDENT') {
    const user = await getUser(telegramId);
    let groupId: string | null = null;

    if (user?.role === 'GROUP_LEADER') {
      const { data: group } = await supabase
        .from('groups')
        .select('id')
        .eq('leader_id', user.id)
        .single();
      groupId = group?.id || null;
    }

    if (!groupId) {
      await ctx.reply('❌ Guruh topilmadi.');
      await setState(telegramId, null);
      return;
    }

    // Format: TelegramID Firstname Lastname
    const parts = text.split(' ').filter(Boolean);
    if (parts.length < 2) {
      await ctx.reply(
        `⚠️ *Xato format!*\n\nFormat: \`TelegramID Ism Familiya\`\nMisol: \`987654321 Jasur Toshmatov\``,
        { parse_mode: 'Markdown' },
      );
      return;
    }

    const studentTgId = parts[0];
    const firstName = parts[1];
    const lastName = parts.slice(2).join(' ') || '';

    // Create user
    let { data: studentUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', studentTgId)
      .single();

    if (!studentUser) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          telegram_id: studentTgId,
          first_name: firstName,
          last_name: lastName,
          role: 'STUDENT',
        })
        .select('*')
        .single();
      studentUser = newUser;
    }

    if (studentUser) {
      await supabase
        .from('students')
        .upsert({ user_id: studentUser.id, group_id: groupId }, { onConflict: 'user_id,group_id' });

      await setState(telegramId, null);
      await ctx.reply(
        `✅ *Talaba qo'shildi!*\n\n👤 *${firstName} ${lastName}* (ID: \`${studentTgId}\`) guruhga muvaffaqiyatli qo'shildi.`,
        { parse_mode: 'Markdown', ...getRoleKeyboard('GROUP_LEADER') },
      );
      return;
    }
  }

  // Default menu reply
  const user = await getUser(telegramId);
  if (user) {
    await ctx.reply("Kerakli bo'limni tanlang:", getRoleKeyboard(user.role));
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
  return NextResponse.json({
    status: 'Telegram Bot Webhook Active ✅',
    version: '3.0-bot-native-features',
  });
}
