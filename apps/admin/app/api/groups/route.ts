import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/groups
export async function GET() {
  const { data, error } = await supabase
    .from('groups')
    .select('*, leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups: data });
}

// POST /api/groups
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, faculty, academic_year } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('groups')
      .insert({ name, code, faculty: faculty || '', academic_year: academic_year || '' })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ group: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
