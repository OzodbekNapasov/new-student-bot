import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegramNotify';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || '8135594558';
const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret-2026';

/**
 * GET /api/cron/daily-reminder
 * Called daily at 10:00 AM (UTC+5 = 05:00 UTC) via Vercel Cron
 *
 * Sends a summary message to each group leader and the admin
 * about students added today (since midnight).
 */
export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized access
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret') || req.headers.get('authorization')?.replace('Bearer ', '');

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const todayFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;

    // Get all students added today
    const { data: todayStudents } = await supabase
      .from('students')
      .select(
        '*, user:users(id, first_name, last_name), group:groups(id, name, code, leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name))',
      )
      .gte('joined_at', `${todayStr}T00:00:00.000Z`)
      .lt('joined_at', `${todayStr}T23:59:59.999Z`);

    if (!todayStudents || todayStudents.length === 0) {
      // Send a quiet all-clear to admin
      await sendTelegramMessage(
        ADMIN_TELEGRAM_ID,
        `📋 *Kunlik hisobot (${todayFormatted})*\n\n✅ Bugun hech qanday yangi talaba qo'shilmagan.`,
      );
      return NextResponse.json({ ok: true, message: 'No students added today', count: 0 });
    }

    // Group students by their group
    const byGroup: Record<
      string,
      {
        groupName: string;
        groupCode: string;
        leaderTgId: string | null;
        leaderName: string;
        students: string[];
      }
    > = {};

    for (const s of todayStudents) {
      const group = (s as any).group;
      const groupId = group?.id;
      if (!groupId) continue;

      if (!byGroup[groupId]) {
        const leader = group?.leader;
        byGroup[groupId] = {
          groupName: group.name,
          groupCode: group.code,
          leaderTgId: leader?.telegram_id || null,
          leaderName: leader
            ? `${leader.first_name} ${leader.last_name}`.trim()
            : 'Rahbar tayinlanmagan',
          students: [],
        };
      }

      const u = (s as any).user;
      const fullName = `${u?.last_name || ''} ${u?.first_name || ''}`.trim() || u?.first_name || 'Noma\'lum';
      byGroup[groupId].students.push(fullName);
    }

    const tasks: Promise<boolean>[] = [];
    let adminSummary = `📊 *Kunlik Hisobot — ${todayFormatted}*\n\n`;
    adminSummary += `👥 *Bugun qo'shilgan jami:* ${todayStudents.length} nafar talaba\n\n`;

    for (const [, gData] of Object.entries(byGroup)) {
      const listStr = gData.students.map((name, i) => `  ${i + 1}. ${name}`).join('\n');

      // Message for group leader
      if (gData.leaderTgId && !gData.leaderTgId.startsWith('STU_')) {
        const leaderMsg =
          `🌅 *Kunlik eslatma — ${todayFormatted}*\n\n` +
          `📚 *Guruhingiz:* ${gData.groupName}\n` +
          `👥 *Bugun qo'shilgan talabalar (${gData.students.length} nafar):*\n` +
          `${listStr}\n\n` +
          `💡 _Web panelda to'liq ro'yxatni ko'rishingiz mumkin._`;

        tasks.push(sendTelegramMessage(gData.leaderTgId, leaderMsg));
      }

      adminSummary += `📚 *${gData.groupName}* (${gData.groupCode}):\n`;
      adminSummary += `👨‍🏫 Rahbar: ${gData.leaderName}\n`;
      adminSummary += `${listStr}\n\n`;
    }

    // Send to admin
    tasks.push(sendTelegramMessage(ADMIN_TELEGRAM_ID, adminSummary));

    await Promise.allSettled(tasks);

    return NextResponse.json({
      ok: true,
      message: `Daily reminder sent for ${todayStudents.length} students across ${Object.keys(byGroup).length} groups`,
      count: todayStudents.length,
      groups: Object.keys(byGroup).length,
    });
  } catch (err: any) {
    console.error('Daily reminder cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
