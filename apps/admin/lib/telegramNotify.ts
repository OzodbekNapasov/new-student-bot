/**
 * Telegram Notification Helper
 * Sends messages to Telegram users via the Bot API
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || '8135594558';

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
): Promise<boolean> {
  if (!BOT_TOKEN || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

/**
 * Notify group leader AND admin when a new student is added
 */
export async function notifyStudentAdded({
  studentFullName,
  groupName,
  leaderTelegramId,
  addedBy = 'Admin',
}: {
  studentFullName: string;
  groupName: string;
  leaderTelegramId?: string | null;
  addedBy?: string;
}) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const leaderMsg =
    `👥 *Guruhingizga yangi talaba qo'shildi!*\n\n` +
    `📚 *Guruh:* ${groupName}\n` +
    `👤 *Talaba:* *${studentFullName}*\n` +
    `🕐 *Vaqt:* ${timeStr}\n\n` +
    `💡 _Web panelda talabalar ro'yxatini ko'rishingiz mumkin._`;

  const adminMsg =
    `🔔 *Yangi talaba qo'shildi!*\n\n` +
    `📚 *Guruh:* ${groupName}\n` +
    `👤 *Talaba:* *${studentFullName}*\n` +
    `🕐 *Vaqt:* ${timeStr}\n` +
    `👨‍💼 *Qo'shgan:* ${addedBy}\n\n` +
    `💡 _Admin panelda ko'rish mumkin._`;

  const tasks: Promise<boolean>[] = [];

  // Notify group leader
  if (leaderTelegramId && !leaderTelegramId.startsWith('STU_')) {
    tasks.push(sendTelegramMessage(leaderTelegramId, leaderMsg));
  }

  // Notify admin (only if leader is not admin)
  if (leaderTelegramId !== ADMIN_TELEGRAM_ID) {
    tasks.push(sendTelegramMessage(ADMIN_TELEGRAM_ID, adminMsg));
  }

  await Promise.allSettled(tasks);
}

/**
 * Notify group leader AND admin for bulk added students
 */
export async function notifyStudentsBulkAdded({
  studentNames,
  groupName,
  leaderTelegramId,
}: {
  studentNames: string[];
  groupName: string;
  leaderTelegramId?: string | null;
}) {
  if (studentNames.length === 0) return;

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const listStr = studentNames.map((name, i) => `${i + 1}. ${name}`).join('\n');

  const leaderMsg =
    `👥 *Guruhingizga ${studentNames.length} nafar yangi talaba qo'shildi!*\n\n` +
    `📚 *Guruh:* ${groupName}\n` +
    `🕐 *Vaqt:* ${timeStr}\n\n` +
    `📋 *Qo'shilgan talabalar:*\n${listStr}\n\n` +
    `💡 _Web panelda to'liq ro'yxatni ko'rishingiz mumkin._`;

  const adminMsg =
    `🔔 *${studentNames.length} nafar yangi talaba qo'shildi!*\n\n` +
    `📚 *Guruh:* ${groupName}\n` +
    `🕐 *Vaqt:* ${timeStr}\n\n` +
    `📋 *Qo'shilgan talabalar:*\n${listStr}\n\n` +
    `💡 _Admin panelda ko'rish mumkin._`;

  const tasks: Promise<boolean>[] = [];

  if (leaderTelegramId && !leaderTelegramId.startsWith('STU_')) {
    tasks.push(sendTelegramMessage(leaderTelegramId, leaderMsg));
  }

  if (leaderTelegramId !== ADMIN_TELEGRAM_ID) {
    tasks.push(sendTelegramMessage(ADMIN_TELEGRAM_ID, adminMsg));
  }

  await Promise.allSettled(tasks);
}
