import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/students?group_id=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('group_id');

  let query = supabase
    .from('students')
    .select(
      '*, user:users(id, telegram_id, first_name, last_name, username), group:groups(id, name, code)',
    );

  if (groupId) query = query.eq('group_id', groupId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Always sort alphabetically by Familiya Ism Sharif (last_name first_name)
  const sorted = (data || []).sort((a: any, b: any) => {
    const nameA = `${a.user?.last_name || ''} ${a.user?.first_name || ''}`.trim().toLowerCase();
    const nameB = `${b.user?.last_name || ''} ${b.user?.first_name || ''}`.trim().toLowerCase();
    return nameA.localeCompare(nameB, 'uz');
  });

  return NextResponse.json({ students: sorted });
}

// POST /api/students — add student to group (telegram_id optional!)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegram_id, group_id, first_name, last_name, username, student_card_number } = body;

    if (!group_id || (!first_name && !last_name)) {
      return NextResponse.json({ error: 'Talaba ismi va group_id kiritilishi shart' }, { status: 400 });
    }

    const tgId = telegram_id ? String(telegram_id) : `STU_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    // Find or create user
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', tgId)
      .single();

    if (!user) {
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert({
          telegram_id: tgId,
          first_name: first_name || 'Talaba',
          last_name: last_name || '',
          username: username || '',
          role: 'STUDENT',
        })
        .select('*')
        .single();
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
      user = newUser;
    }

    // Add to students table
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .upsert(
        { user_id: user.id, group_id, student_card_number: student_card_number || '' },
        { onConflict: 'user_id,group_id' },
      )
      .select('*, user:users(id, telegram_id, first_name, last_name)')
      .single();

    if (studentErr) return NextResponse.json({ error: studentErr.message }, { status: 500 });
    return NextResponse.json({ student });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
