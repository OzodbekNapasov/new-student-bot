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
      [
        Markup.button.text('👤 Profil & Kirish Kodu'),
        Markup.button.webApp('🖥️ Admin Web Paneli', webAppUrl),
      ],
      [Markup.button.text('🚪 Chiqish')],
    ]).resize();
  }
  if (role === 'GROUP_LEADER') {
    return Markup.keyboard([
      [Markup.button.text("👥 Talabalar ro'yxati"), Markup.button.text("＋ Talaba qo'shish")],
      [
        Markup.button.text('👤 Profil & Login Kodi'),
        Markup.button.webApp('📋 Guruh Web Paneli', webAppUrl),
      ],
      [Markup.button.text('🚪 Chiqish')],
    ]).resize();
  }
  return Markup.keyboard([
    [Markup.button.text('🔑 Kirish'), Markup.button.text('📚 Mening guruhim')],
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

  // Sort alphabetically by Familiya Ism Sharif (last_name first_name)
  const sorted = students.sort((a, b) => {
    const nameA = `${a.user?.last_name || ''} ${a.user?.first_name || ''}`.trim();
    const nameB = `${b.user?.last_name || ''} ${b.user?.first_name || ''}`.trim();
    return nameA.localeCompare(nameB, 'uz');
  });

  let message = `📚 *${groupName}* guruhi talabalari:\n\n`;
  sorted.forEach((s, idx) => {
    const fullName =
      `${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() ||
      `${s.user?.first_name || ''}`;
    const studentId = s.student_card_number || `STU-${(s.id || '').slice(0, 8).toUpperCase()}`;
    message += `${idx + 1}. *${fullName}* (\`${studentId}\`)\n`;
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

  // 1. Check if SUPER_ADMIN
  if (String(tgUser.id) === '8135594558') {
    await supabase
      .from('users')
      .update({ role: 'SUPER_ADMIN' })
      .eq('telegram_id', String(tgUser.id));

    await ctx.reply(
      `👑 *Xush kelibsiz, Super Admin!* 👋\n\n` +
        `🆔 *Sizning Telegram ID:* \`${tgUser.id}\`\n` +
        `🔑 *Rolingiz:* SUPER ADMIN (Bosh Boshqaruvchi)\n` +
        `🌐 *Web Admin Panel:* ${webAppUrl}\n\n` +
        `Kerakli bo'limni tanlang:`,
      { parse_mode: 'Markdown', ...getRoleKeyboard('SUPER_ADMIN') },
    );
    return;
  }

  // 2. If GROUP_LEADER
  if (user?.role === 'GROUP_LEADER') {
    const { data: group } = await supabase
      .from('groups')
      .select('*, students(count)')
      .eq('leader_id', user.id)
      .single();

    const leaderName =
      `${user.first_name || tgUser.first_name} ${user.last_name || tgUser.last_name || ''}`.trim();
    const groupText = group ? `*${group.name}* (${group.code})` : 'Biriktirilmagan';
    const loginCode = group?.login_code ? `\`${group.login_code}\`` : 'Mavjud emas';
    const studentCount = group?.students?.[0]?.count || 0;

    await ctx.reply(
      `Salom, *${leaderName}*! 👋\n\n` +
        `🆔 *Sizning Telegram ID-ingiz:* \`${tgUser.id}\`\n` +
        `👨‍🏫 *Guruhingiz:* ${groupText}\n` +
        `🔑 *Sizning Web Login Kodingiz:* ${loginCode}\n` +
        `👥 *Guruhdagi talabalar:* ${studentCount} nafar\n` +
        `🌐 *Web Panel Havolasi:* ${webAppUrl}\n\n` +
        `💡 _Brauzer orqali Web panelga kirishda ushbu Telegram ID va Login kodingizdan foydalaning!_\n\n` +
        `Kerakli bo'limni tanlang:`,
      { parse_mode: 'Markdown', ...getRoleKeyboard('GROUP_LEADER') },
    );
    return;
  }

  // 3. If STUDENT
  if (user?.role === 'STUDENT') {
    const { data: studentRecord } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentRecord) {
      await ctx.reply(
        `🎓 *Xush kelibsiz, ${tgUser.first_name}!*\n\n` +
          `🆔 *Sizning Telegram ID-ingiz:* \`${tgUser.id}\`\n\n` +
          `Kerakli bo'limni tanlang:`,
        { parse_mode: 'Markdown', ...getRoleKeyboard('STUDENT') },
      );
      return;
    }
  }

  // Unregistered / Student without group — show Kirish keyboard and prompt
  await setState(String(tgUser.id), 'WAITING_LOGIN_CODE');
  await ctx.reply(
    `Assalomu alaykum, ${tgUser.first_name}! 👋\n\n` +
      `🆔 *Sizning Telegram ID-ingiz:* \`${tgUser.id}\`\n\n` +
      `🔑 Tizimga kirish uchun *Guruh Login Kodingizni* yuboring.\n\n` +
      `📌 Login kod guruh rahbariga admin tomonidan beriladi.\n` +
      `📌 Qayta kirish uchun *🔑 Kirish* tugmasini bosing.`,
    { parse_mode: 'Markdown', ...getRoleKeyboard('STUDENT') },
  );
});

// ============================================================
// Button Handlers
// ============================================================

// 👤 Profil & Login Kodi / Kirish Kodu / Profilim
bot.hears(['👤 Profil & Login Kodi', '👤 Profil & Kirish Kodu', '👤 Profilim'], async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;
  const telegramId = String(tgUser.id);
  const user = await getUser(telegramId);

  if (telegramId === '8135594558' || user?.role === 'SUPER_ADMIN') {
    await ctx.reply(
      `👑 *Super Admin Profili va Ma'lumotlari:*\n\n` +
        `👤 *Ism:* ${tgUser.first_name} ${tgUser.last_name || ''}\n` +
        `🆔 *Telegram ID:* \`${tgUser.id}\`\n` +
        `🔑 *Rolingiz:* SUPER ADMIN\n` +
        `🌐 *Web Admin Panel:* ${webAppUrl}\n\n` +
        `💡 _Web Admin paneliga Telegram ID orqali bevosita kiring._`,
      { parse_mode: 'Markdown' },
    );
    return;
  }

  if (user?.role === 'GROUP_LEADER') {
    const { data: group } = await supabase
      .from('groups')
      .select('*, students(count)')
      .eq('leader_id', user.id)
      .single();

    const leaderName =
      `${user.first_name || tgUser.first_name} ${user.last_name || tgUser.last_name || ''}`.trim();
    const groupText = group ? `*${group.name}* (${group.code})` : 'Biriktirilmagan';
    const loginCode = group?.login_code ? `\`${group.login_code}\`` : 'Mavjud emas';
    const studentCount = group?.students?.[0]?.count || 0;

    await ctx.reply(
      `👨‍🏫 *O'qituvchi (Guruh Rahbari) Profili va Kirish Kodlari:*\n\n` +
        `👤 *Ismingiz:* ${leaderName}\n` +
        `🆔 *Telegram ID-ingiz:* \`${tgUser.id}\`\n` +
        `📚 *Guruhingiz:* ${groupText}\n` +
        `🔑 *Web Login Kodingiz:* ${loginCode}\n` +
        `👥 *Guruhdagi talabalar:* ${studentCount} nafar\n` +
        `🌐 *Web Panel Havolasi:* ${webAppUrl}\n\n` +
        `💡 _Brauzerdan Web platformaga kirishda ushbu Telegram ID va Login kodingizni kiriting!_`,
      { parse_mode: 'Markdown' },
    );
    return;
  }

  await ctx.reply(
    `👤 *Sizning Profilingiz:*\n\n` +
      `🆔 *Telegram ID-ingiz:* \`${tgUser.id}\`\n` +
      `📌 Tizimga guruh kodingiz orqali kirishingiz mumkin.\n` +
      `🌐 *Web Panel:* ${webAppUrl}`,
    { parse_mode: 'Markdown' },
  );
});

// 🔑 Kirish
bot.hears('🔑 Kirish', async (ctx) => {
  const telegramId = String(ctx.from.id);
  await setState(telegramId, 'WAITING_LOGIN_CODE');
  await ctx.reply(
    `🆔 *Sizning Telegram ID:* \`${telegramId}\`\n\n` +
      `🔑 *Login kodingizni yuboring:*\n\n` +
      `📌 Rahbar bo'lsangiz — admin tomonidan berilgan 6 xonali login kodni kiriting (masalan: \`AB3K7Z\`).`,
    { parse_mode: 'Markdown' },
  );
});

// 🚪 Chiqish
bot.hears('🚪 Chiqish', async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await getUser(telegramId);

  if (user) {
    // Unassign leader from group if leader
    if (user.role === 'GROUP_LEADER') {
      await supabase.from('groups').update({ leader_id: null }).eq('leader_id', user.id);
    }
    // Reset user role to STUDENT
    await supabase.from('users').update({ role: 'STUDENT' }).eq('telegram_id', telegramId);
  }

  await setState(telegramId, null);

  await ctx.reply(
    `🚪 *Hisobdan chiqdingiz.*\n\nQayta kirish uchun *🔑 Kirish* tugmasini bosing yoki yangi login kodingizni yuboring.`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        [Markup.button.text('🔑 Kirish')],
        [Markup.button.webApp('📱 Web Panel', webAppUrl)],
      ]).resize(),
    },
  );
});

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
      `Talabaning Familiya, Ism va Sharifini (F.I.Sh) yuboring.\n\n` +
      `📌 *Misol:* \`Toshmatov Jasur Alisherovich\`\n\n` +
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

  // Sort alphabetically by Familiya Ism Sharif (last_name first_name)
  const sorted = students.sort((a, b) => {
    const nameA = `${a.user?.last_name || ''} ${a.user?.first_name || ''}`.trim();
    const nameB = `${b.user?.last_name || ''} ${b.user?.first_name || ''}`.trim();
    return nameA.localeCompare(nameB, 'uz');
  });

  let text = `👥 *Barcha Talabalar Ro'yxati:*\n\n`;
  sorted.forEach((s, idx) => {
    const name =
      `${s.user?.last_name || ''} ${s.user?.first_name || ''}`.trim() ||
      `${s.user?.first_name || ''}`;
    const studentId = s.student_card_number || `STU-${(s.id || '').slice(0, 8).toUpperCase()}`;
    text += `${idx + 1}. *${name}* (\`${studentId}\`) — ${s.group?.name || 'Guruhsiz'}\n`;
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

    const { data: updatedGroup } = await supabase
      .from('groups')
      .select('*, students(count)')
      .eq('id', group.id)
      .single();

    const studentCount = updatedGroup?.students?.[0]?.count || 0;
    const leaderName =
      `${user?.first_name || tgUser.first_name} ${user?.last_name || tgUser.last_name || ''}`.trim();

    await setState(telegramId, null);

    await ctx.reply(
      `Salom, *${leaderName}*! 👋\n\n` +
        `✅ *Muvaffaqiyatli kirish!*\n` +
        `🆔 *Sizning Telegram ID:* \`${telegramId}\`\n` +
        `👨‍🏫 *Guruhingiz:* *${group.name}* (${group.code})\n` +
        `🔑 *Sizning Web Login Kodingiz:* \`${code}\`\n` +
        `👥 *Guruhdagi talabalar:* ${studentCount} nafar\n` +
        `🌐 *Web Panel Havolasi:* ${webAppUrl}\n\n` +
        `💡 _Brauzer orqali Web platformaga kirishda ushbu Telegram ID va Login kodingizdan foydalaning!_`,
      { parse_mode: 'Markdown', ...getRoleKeyboard('GROUP_LEADER') },
    );
    return;
  }

  // 2. Process Add Student via Bot Text (F.I.Sh)
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

    const parts = text.split(' ').filter(Boolean);
    const lastName = parts[0] || text;
    const firstName = parts.slice(1).join(' ') || '';

    const autoTgId = `STU_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const { data: studentUser } = await supabase
      .from('users')
      .insert({
        telegram_id: autoTgId,
        first_name: firstName || lastName,
        last_name: firstName ? lastName : '',
        role: 'STUDENT',
      })
      .select('*')
      .single();

    if (studentUser) {
      await supabase
        .from('students')
        .upsert({ user_id: studentUser.id, group_id: groupId }, { onConflict: 'user_id,group_id' });

      await setState(telegramId, null);
      const fullName = `${lastName} ${firstName}`.trim();
      await ctx.reply(
        `✅ *Talaba qo'shildi!*\n\n👤 *${fullName}* guruhga muvaffaqiyatli qo'shildi.`,
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
    await ctx.reply(
      `🆔 *Sizning Telegram ID-ingiz:* \`${telegramId}\`\n\n` + `🔑 Login kodingizni yuboring:`,
      getRoleKeyboard('STUDENT'),
    );
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
    version: '5.0-bot-tg-id-login-code-prompt',
  });
}
