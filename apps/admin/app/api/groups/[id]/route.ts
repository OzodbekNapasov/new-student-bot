import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateLoginCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/groups/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('groups')
    .select(
      `*, 
       leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name),
       students(id, student_card_number, is_active, user:users(id, telegram_id, first_name, last_name, username))`,
    )
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: data });
}

// PATCH /api/groups/[id] — regenerate login code, remove leader, or update group/leader details
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const groupId = params.id;

    // Regenerate login code
    if (body.regenerate_code) {
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
      const { data, error } = await supabase
        .from('groups')
        .update({ login_code: loginCode, leader_id: null, updated_at: new Date().toISOString() })
        .eq('id', groupId)
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ group: data });
    }

    // Remove leader
    if (body.remove_leader) {
      const { data, error } = await supabase
        .from('groups')
        .update({ leader_id: null, updated_at: new Date().toISOString() })
        .eq('id', groupId)
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ group: data });
    }

    // Update leader_name directly
    if (body.leader_name !== undefined) {
      const cleanLeaderName = String(body.leader_name).trim();
      if (cleanLeaderName) {
        const parts = cleanLeaderName.split(' ').filter(Boolean);
        const lastName = parts[0] || '';
        const firstName = parts.slice(1).join(' ') || lastName;

        // Fetch current group to check if leader user exists
        const { data: grp } = await supabase
          .from('groups')
          .select('leader_id')
          .eq('id', groupId)
          .single();

        if (grp?.leader_id) {
          // Update existing leader user profile
          await supabase
            .from('users')
            .update({
              first_name: firstName,
              last_name: parts.length > 1 ? lastName : '',
              updated_at: new Date().toISOString(),
            })
            .eq('id', grp.leader_id);
        } else {
          // Create new leader user record
          const autoTgId = `LEADER_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          const { data: newLeader } = await supabase
            .from('users')
            .insert({
              telegram_id: autoTgId,
              first_name: firstName,
              last_name: parts.length > 1 ? lastName : '',
              role: 'GROUP_LEADER',
            })
            .select('*')
            .single();

          if (newLeader) {
            await supabase.from('groups').update({ leader_id: newLeader.id }).eq('id', groupId);
          }
        }
      }
    }

    // General update (name, faculty, etc.)
    const updateData: any = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.faculty !== undefined) updateData.faculty = body.faculty;
    if (body.academic_year !== undefined) updateData.academic_year = body.academic_year;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', groupId)
      .select('*, leader:users!groups_leader_id_fkey(id, telegram_id, first_name, last_name)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ group: data });
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
