import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH /api/groups/[id]/leader — assign or remove a group leader
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { leader_telegram_id } = body;
    const groupId = params.id;

    if (!leader_telegram_id) {
      // Remove leader
      const { data, error } = await supabase
        .from('groups')
        .update({ leader_id: null, updated_at: new Date().toISOString() })
        .eq('id', groupId)
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ group: data });
    }

    // Find or create leader user
    let { data: leaderUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', String(leader_telegram_id))
      .single();

    if (findError || !leaderUser) {
      // Create user with GROUP_LEADER role
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: String(leader_telegram_id),
          first_name: body.leader_name || 'Rahbar',
          role: 'GROUP_LEADER',
        })
        .select('*')
        .single();
      if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
      leaderUser = newUser;
    } else {
      // Update existing user to GROUP_LEADER role
      await supabase
        .from('users')
        .update({ role: 'GROUP_LEADER', updated_at: new Date().toISOString() })
        .eq('id', leaderUser.id);
      leaderUser.role = 'GROUP_LEADER';
    }

    // Set leader on group
    const { data: updatedGroup, error: updateError } = await supabase
      .from('groups')
      .update({ leader_id: leaderUser.id, updated_at: new Date().toISOString() })
      .eq('id', groupId)
      .select('*, leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name)')
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ group: updatedGroup, leader: leaderUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/groups/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('groups').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// GET /api/groups/[id] — get group details with students
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('groups')
    .select(
      `*, 
       leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name),
       students(id, student_card_number, is_active, user:users(id, telegram_id, first_name, last_name, username))`
    )
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: data });
}
