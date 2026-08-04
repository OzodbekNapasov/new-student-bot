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

// PATCH /api/students/[id] — update group_id, student_card_number, first_name, last_name, etc.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { group_id, student_card_number, is_active, first_name, last_name } = body;

    // Fetch existing student record first
    const { data: existingStudent } = await supabase
      .from('students')
      .select(
        '*, group:groups(id, name, code), user:users(id, telegram_id, first_name, last_name, photo_url)',
      )
      .eq('id', id)
      .single();

    // Update user table if first_name / last_name provided
    if ((first_name !== undefined || last_name !== undefined) && existingStudent?.user?.id) {
      const userUpdates: any = {};
      if (first_name !== undefined) userUpdates.first_name = first_name;
      if (last_name !== undefined) userUpdates.last_name = last_name;
      userUpdates.updated_at = new Date().toISOString();
      await supabase.from('users').update(userUpdates).eq('id', existingStudent.user.id);
    }

    const updates: any = {};
    if (group_id !== undefined) updates.group_id = group_id;
    if (student_card_number !== undefined) updates.student_card_number = student_card_number;
    if (is_active !== undefined) updates.is_active = is_active;

    let studentData: any = null;

    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select(
          '*, user:users(id, telegram_id, first_name, last_name, photo_url, updated_at), group:groups(id, name, code)',
        )
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      studentData = data;
    } else {
      // If only user (first_name/last_name) was updated, fetch updated student
      const { data, error } = await supabase
        .from('students')
        .select(
          '*, user:users(id, telegram_id, first_name, last_name, photo_url, updated_at), group:groups(id, name, code)',
        )
        .eq('id', id)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      studentData = data;
    }

    // If group_id changed, record transfer event log inside user's photo_url JSON field
    if (
      group_id &&
      existingStudent &&
      existingStudent.group_id !== group_id &&
      existingStudent.user?.id
    ) {
      const { data: newGroup } = await supabase
        .from('groups')
        .select('id, name, code')
        .eq('id', group_id)
        .single();

      const oldGroupName = existingStudent.group?.name || 'Guruhsiz';
      const newGroupName = newGroup?.name || 'Yangi guruh';

      let existingLogs: any[] = [];
      try {
        if (existingStudent.user.photo_url && existingStudent.user.photo_url.startsWith('[')) {
          existingLogs = JSON.parse(existingStudent.user.photo_url);
        }
      } catch (e) {
        existingLogs = [];
      }

      const newLog = {
        id: `log_${Date.now()}`,
        type: 'TRANSFER',
        from_group_name: oldGroupName,
        to_group_name: newGroupName,
        to_group_code: newGroup?.code || '',
        timestamp: new Date().toISOString(),
      };

      existingLogs.unshift(newLog);

      await supabase
        .from('users')
        .update({
          photo_url: JSON.stringify(existingLogs),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStudent.user.id);
    }

    return NextResponse.json({ student: studentData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
