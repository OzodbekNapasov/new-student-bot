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

  const { data, error } = await query.order('joined_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data });
}

// POST /api/students — add student to group
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegram_id, group_id, first_name, last_name, username, student_card_number } = body;

    if (!telegram_id || !group_id) {
      return NextResponse.json({ error: 'telegram_id and group_id are required' }, { status: 400 });
    }

    // Find or create user
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', String(telegram_id))
      .single();

    if (!user) {
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert({
          telegram_id: String(telegram_id),
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
