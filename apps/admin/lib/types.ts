export type UserRole = 'SUPER_ADMIN' | 'GROUP_LEADER' | 'STUDENT';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';

export interface User {
  id: string;
  telegram_id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: UserRole;
  photo_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  faculty: string;
  academic_year: string;
  leader_id: string | null;
  leader?: User;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  students?: Student[];
}

export interface Student {
  id: string;
  user_id: string;
  group_id: string;
  student_card_number: string;
  is_active: boolean;
  joined_at: string;
  user?: User;
  group?: Group;
}

export interface Attendance {
  id: string;
  student_id: string;
  group_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by_id: string | null;
  note: string;
  created_at: string;
  student?: Student;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}
