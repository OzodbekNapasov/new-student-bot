import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Attendance, Prisma } from '@prisma/client';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(data: {
    studentId: string;
    groupId: string;
    date: string;
    status: string;
    markedById: string;
  }): Promise<Attendance> {
    return this.prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: data.studentId,
          date: data.date,
        },
      },
      update: {
        status: data.status,
        markedById: data.markedById,
      },
      create: data,
    });
  }

  async findByGroupAndDate(groupId: string, date: string): Promise<Attendance[]> {
    return this.prisma.attendance.findMany({
      where: { groupId, date },
      include: {
        student: {
          include: { user: true },
        },
      },
    });
  }

  async findByStudent(studentId: string): Promise<Attendance[]> {
    return this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });
  }

  async getStudentStats(studentId: string) {
    const total = await this.prisma.attendance.count({ where: { studentId } });
    const present = await this.prisma.attendance.count({
      where: { studentId, status: 'PRESENT' },
    });
    const absent = await this.prisma.attendance.count({
      where: { studentId, status: 'ABSENT' },
    });
    const excused = await this.prisma.attendance.count({
      where: { studentId, status: 'EXCUSED' },
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      total,
      present,
      absent,
      excused,
      percentage,
    };
  }
}
