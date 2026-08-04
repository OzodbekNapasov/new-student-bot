export type UserRole = 'SUPER_ADMIN' | 'GROUP_LEADER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type StudentStatus = 'ACTIVE' | 'EXPELLED' | 'GRADUATED' | 'ACADEMIC_LEAVE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}
