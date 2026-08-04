export type Role = 'SUPER_ADMIN' | 'GROUP_LEADER' | 'STUDENT';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  telegramId?: string;
  firstName: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  role: Role;
  studentProfile?: StudentProfile;
  managedGroups?: Group[];
}

export interface Group {
  id: string;
  name: string;
  code: string;
  faculty?: string;
  academicYear?: number;
  leaderId?: string;
  leader?: User;
  students?: StudentProfile[];
  _count?: {
    students?: number;
    tasks?: number;
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  user?: User;
  groupId: string;
  group?: Group;
  studentCardNumber?: string;
  attendances?: Attendance[];
}

export interface Attendance {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  status: AttendanceStatus;
}

export interface Task {
  id: string;
  groupId: string;
  title: string;
  description: string;
  dueDate: string;
  submissions?: Submission[];
  createdBy?: {
    firstName: string;
    lastName?: string;
  };
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  content: string;
  fileUrl?: string;
  status: SubmissionStatus;
  grade?: number;
  student?: StudentProfile;
}
