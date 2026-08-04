import { Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { StudentRepository } from '../repositories/student.repository';
import { GroupRepository } from '../repositories/group.repository';
import { BulkAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly studentRepository: StudentRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async markBulkAttendance(markedById: string, dto: BulkAttendanceDto) {
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${dto.groupId} not found`);
    }

    const results = await Promise.all(
      dto.attendances.map((item) =>
        this.attendanceRepository.markAttendance({
          studentId: item.studentId,
          groupId: dto.groupId,
          date: dto.date,
          status: item.status,
          markedById,
        }),
      ),
    );

    return {
      message: `Successfully marked attendance for ${results.length} students on ${dto.date}`,
      date: dto.date,
      groupId: dto.groupId,
      count: results.length,
      data: results,
    };
  }

  async getGroupAttendanceByDate(groupId: string, date: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.attendanceRepository.findByGroupAndDate(groupId, date);
  }

  async getStudentAttendanceStats(studentId: string) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const [stats, history] = await Promise.all([
      this.attendanceRepository.getStudentStats(studentId),
      this.attendanceRepository.findByStudent(studentId),
    ]);

    return {
      student,
      stats,
      history,
    };
  }
}
