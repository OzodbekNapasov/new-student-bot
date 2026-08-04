import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '8135594558';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegram_id, login_code, first_name, last_name, username, photo_url } = body;

    // 1. Login via Login Code (e.g. AB3K7Z)
    if (login_code) {
      const code = String(login_code).toUpperCase().trim();
      const { data: group } = await supabase
        .from('groups')
        .select('*, leader:users!groups_leader_id_fkey(*)')
        .eq('login_code', code)
        .eq('is_active', true)
        .single();

      if (!group) {
        return NextResponse.json({ error: "Kiritilgan login kod noto'g'ri" }, { status: 404 });
      }

      // If group already has a leader
      if (group.leader) {
        return NextResponse.json({ user: group.leader, group });
      }

      // If group has leader_id but leader query was null, fetch user by leader_id
      if (group.leader_id) {
        const { data: leaderUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', group.leader_id)
          .single();
        if (leaderUser) {
          return NextResponse.json({ user: leaderUser, group });
        }
      }

      // Group exists but has no leader — if telegram_id provided, make them leader!
      if (telegram_id) {
        const { data: leaderUser } = await supabase
          .from('users')
          .upsert(
            {
              telegram_id: String(telegram_id),
              first_name: first_name || 'Rahbar',
              last_name: last_name || '',
              username: username || '',
              role: 'GROUP_LEADER',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'telegram_id' },
          )
          .select('*')
          .single();

        if (leaderUser) {
          await supabase.from('groups').update({ leader_id: leaderUser.id }).eq('id', group.id);
          return NextResponse.json({ user: leaderUser, group });
        }
      }

      return NextResponse.json({ error: 'Guruh rahbari hali belgilanmagan' }, { status: 400 });
    }

    // 2. Login via telegram_id
    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id or login_code required' }, { status: 400 });
    }

    const isAdmin = String(telegram_id) === String(ADMIN_ID);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', String(telegram_id))
      .single();

    let user;

    if (existingUser) {
      // Check if user is leader of any group
      const { data: leaderGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('leader_id', existingUser.id)
        .single();

      let role = existingUser.role;
      if (isAdmin) role = 'SUPER_ADMIN';
      else if (leaderGroup && role !== 'SUPER_ADMIN') role = 'GROUP_LEADER';

      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: first_name || existingUser.first_name,
          last_name: last_name || existingUser.last_name,
          username: username || existingUser.username,
          photo_url: photo_url || existingUser.photo_url,
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', String(telegram_id))
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      user = data;
    } else {
      // New user
      const { data, error } = await supabase
        .from('users')
        .insert({
          telegram_id: String(telegram_id),
          first_name: first_name || 'User',
          last_name: last_name || '',
          username: username || '',
          photo_url: photo_url || '',
          role: isAdmin ? 'SUPER_ADMIN' : 'STUDENT',
        })
        .select('*')
        .single();

      if (error) {
        const { data: retryUser } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', String(telegram_id))
          .single();
        user = retryUser;
      } else {
        user = data;
      }
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
