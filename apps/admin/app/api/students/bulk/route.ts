import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/students/bulk — Add multiple students to a group from line-separated names
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { group_id, names } = body;

    if (!group_id || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json(
        { error: 'group_id va kamida bitta talaba ismi kiritilishi shart' },
        { status: 400 },
      );
    }

    const cleanNames = names
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0);

    if (cleanNames.length === 0) {
      return NextResponse.json({ error: 'Talaba ismlari bo\'sh bo\'lishi mumkin emas' }, { status: 400 });
    }

    const addedStudents = [];

    for (const fullName of cleanNames) {
      const parts = fullName.split(' ').filter(Boolean);
      const lastName = parts[0] || '';
      const firstName = parts.slice(1).join(' ') || lastName;

      const autoTgId = `STU_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

      // Insert user
      const { data: user, error: userErr } = await supabase
        .from('users')
        .insert({
          telegram_id: autoTgId,
          first_name: firstName,
          last_name: parts.length > 1 ? lastName : '',
          role: 'STUDENT',
        })
        .select('*')
        .single();

      if (userErr || !user) continue;

      // Insert student
      const { data: student } = await supabase
        .from('students')
        .upsert(
          { user_id: user.id, group_id, student_card_number: '' },
          { onConflict: 'user_id,group_id' },
        )
        .select('*, user:users(*)')
        .single();

      if (student) addedStudents.push(student);
    }

    return NextResponse.json({
      success: true,
      count: addedStudents.length,
      students: addedStudents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
