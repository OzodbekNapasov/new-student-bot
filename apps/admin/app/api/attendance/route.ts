import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/attendance?group_id=xxx&date=2024-01-15
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('group_id');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select(
      '*, student:students(id, user:users(id, telegram_id, first_name, last_name))'
    )
    .eq('group_id', groupId!)
    .eq('date', date);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendance: data });
}

// POST /api/attendance — mark attendance
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { records, group_id, date, marked_by_id } = body;
    // records: [{ student_id, status, note }]

    if (!records?.length || !group_id) {
      return NextResponse.json({ error: 'records and group_id required' }, { status: 400 });
    }

    const today = date || new Date().toISOString().split('T')[0];

    const upsertData = records.map((r: any) => ({
      student_id: r.student_id,
      group_id,
      date: today,
      status: r.status || 'PRESENT',
      note: r.note || '',
      marked_by_id: marked_by_id || null,
    }));

    const { data, error } = await supabase
      .from('attendance')
      .upsert(upsertData, { onConflict: 'student_id,date' })
      .select('*');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ attendance: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/attendance/stats?student_id=xxx
export async function HEAD(req: Request) {
  return NextResponse.json({});
}
