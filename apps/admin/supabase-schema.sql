-- ============================================================
-- Student Management Platform — FULL Schema (v2)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  username TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('SUPER_ADMIN', 'GROUP_LEADER', 'STUDENT')),
  photo_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GROUPS (with login_code for leader auto-login)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  faculty TEXT DEFAULT '',
  academic_year TEXT DEFAULT '',
  leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  login_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  student_card_number TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'EXCUSED', 'LATE')),
  marked_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- BOT STATES (for tracking conversation state in serverless bot)
CREATE TABLE IF NOT EXISTS public.bot_states (
  telegram_id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON public.students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_groups_leader_id ON public.groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_login_code ON public.groups(login_code);

-- SEED: Super Admin
INSERT INTO public.users (telegram_id, first_name, last_name, role)
VALUES ('8135594558', 'Admin', 'User', 'SUPER_ADMIN')
ON CONFLICT (telegram_id) DO UPDATE SET role = 'SUPER_ADMIN';

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_users" ON public.users;
DROP POLICY IF EXISTS "allow_all_groups" ON public.groups;
DROP POLICY IF EXISTS "allow_all_students" ON public.students;
DROP POLICY IF EXISTS "allow_all_attendance" ON public.attendance;
DROP POLICY IF EXISTS "allow_all_bot_states" ON public.bot_states;

CREATE POLICY "allow_all_users" ON public.users FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_groups" ON public.groups FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_students" ON public.students FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_attendance" ON public.attendance FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_bot_states" ON public.bot_states FOR ALL USING (TRUE) WITH CHECK (TRUE);
