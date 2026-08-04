import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '8135594558';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegram_id, first_name, last_name, username, photo_url } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id required' }, { status: 400 });
    }

    const isAdmin = String(telegram_id) === String(ADMIN_ID);

    // First check if user already exists (to preserve their existing role)
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', String(telegram_id))
      .single();

    let user;

    if (existingUser) {
      // User exists — only update profile fields, NEVER change role here
      const role = isAdmin ? 'SUPER_ADMIN' : existingUser.role;
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
        console.error('Update user error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      user = data;
    } else {
      // New user — create with STUDENT role (or SUPER_ADMIN if admin)
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
        // Conflict — user was created between our check and insert
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
