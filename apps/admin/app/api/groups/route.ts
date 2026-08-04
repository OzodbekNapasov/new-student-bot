import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Generate a random 6-char alphanumeric login code
function generateLoginCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/groups (Auto-ensures special status groups exist)
export async function GET() {
  try {
    // Ensure "Akademik ta'til olganlar" group exists
    const { data: akademikGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('code', 'AKADEMIK')
      .single();
    if (!akademikGroup) {
      await supabase.from('groups').insert({
        name: "🎓 Akademik ta'til olganlar",
        code: 'AKADEMIK',
        faculty: 'Maxsus status',
        academic_year: 'Tizim',
        login_code: 'AKAD01',
      });
    }

    // Ensure "Talabalar safidan chiqarilganlar" group exists
    const { data: chiqarilganGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('code', 'CHIQARILGAN')
      .single();
    if (!chiqarilganGroup) {
      await supabase.from('groups').insert({
        name: '🛑 Talabalar safidan chiqarilganlar',
        code: 'CHIQARILGAN',
        faculty: 'Maxsus status',
        academic_year: 'Tizim',
        login_code: 'CHIQ01',
      });
    }
  } catch (e) {
    console.error('Error auto-creating status groups:', e);
  }

  const { data, error } = await supabase
    .from('groups')
    .select('*, leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups: data });
}

// POST /api/groups — create group with auto-generated login code & optional leader_name
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, faculty, academic_year, leader_name } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
    }

    // Generate unique login code
    let loginCode = generateLoginCode();
    let attempt = 0;
    while (attempt < 10) {
      const { data: existing } = await supabase
        .from('groups')
        .select('id')
        .eq('login_code', loginCode)
        .single();
      if (!existing) break;
      loginCode = generateLoginCode();
      attempt++;
    }

    let leaderId = null;

    // If leader_name provided, create a leader user record
    if (leader_name && String(leader_name).trim()) {
      const cleanLeaderName = String(leader_name).trim();
      const parts = cleanLeaderName.split(' ').filter(Boolean);
      const lastName = parts[0] || '';
      const firstName = parts.slice(1).join(' ') || lastName;

      const autoTgId = `LEADER_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const { data: leaderUser } = await supabase
        .from('users')
        .insert({
          telegram_id: autoTgId,
          first_name: firstName,
          last_name: parts.length > 1 ? lastName : '',
          role: 'GROUP_LEADER',
        })
        .select('*')
        .single();

      if (leaderUser) {
        leaderId = leaderUser.id;
      }
    }

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name,
        code,
        faculty: faculty || '',
        academic_year: academic_year || '',
        login_code: loginCode,
        leader_id: leaderId,
      })
      .select('*, leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ group: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
