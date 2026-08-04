import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminTelegramId } from '@/lib/telegramAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegram_id, first_name, last_name, username, photo_url } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id required' }, { status: 400 });
    }

    // Determine role: SUPER_ADMIN if admin ID, otherwise keep existing or default STUDENT
    const isAdmin = isAdminTelegramId(telegram_id);

    // Upsert user
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id: String(telegram_id),
          first_name: first_name || 'User',
          last_name: last_name || '',
          username: username || '',
          photo_url: photo_url || '',
          role: isAdmin ? 'SUPER_ADMIN' : undefined,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'telegram_id',
          ignoreDuplicates: false,
        },
      )
      .select('*')
      .single();

    if (error) {
      console.error('Upsert user error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If admin, force role update
    if (isAdmin && user.role !== 'SUPER_ADMIN') {
      await supabase
        .from('users')
        .update({ role: 'SUPER_ADMIN' })
        .eq('telegram_id', String(telegram_id));
      user.role = 'SUPER_ADMIN';
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
