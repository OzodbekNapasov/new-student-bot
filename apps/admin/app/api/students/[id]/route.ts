import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE /api/students/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/students/[id] — update group_id, student_card_number, etc.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { group_id, student_card_number, is_active } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (group_id !== undefined) updates.group_id = group_id;
    if (student_card_number !== undefined) updates.student_card_number = student_card_number;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select('*, user:users(id, telegram_id, first_name, last_name), group:groups(id, name, code)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ student: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
