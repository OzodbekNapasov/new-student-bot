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

// GET /api/groups
export async function GET() {
  const { data, error } = await supabase
    .from('groups')
    .select('*, leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups: data });
}

// POST /api/groups — create group with auto-generated login code
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, faculty, academic_year } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
    }

    // Generate unique login code
    let loginCode = generateLoginCode();
    // Ensure uniqueness
    let attempt = 0;
    while (attempt < 10) {
      const { data: existing } = await supabase.from('groups').select('id').eq('login_code', loginCode).single();
      if (!existing) break;
      loginCode = generateLoginCode();
      attempt++;
    }

    const { data, error } = await supabase
      .from('groups')
      .insert({ name, code, faculty: faculty || '', academic_year: academic_year || '', login_code: loginCode })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ group: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
