import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { UserRepository } from '../repositories/user.repository';
import { GroupRepository } from '../repositories/group.repository';
import { CreateStudentDto, UpdateStudentDto, TransferStudentDto } from './dto/students.dto';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly userRepository: UserRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async createStudent(dto: CreateStudentDto) {
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${dto.groupId} not found`);
    }

    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException(`User with email ${dto.email} already exists`);
      }
    }

    const user = await this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email || null,
      telegramId: dto.telegramId || null,
      role: 'STUDENT',
      status: 'ACTIVE',
    });

    return this.studentRepository.create({
      user: { connect: { id: user.id } },
      group: { connect: { id: dto.groupId } },
      studentCardNumber: dto.studentCardNumber || null,
      gender: dto.gender || null,
    });
  }

  async getAllStudents(groupId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = groupId ? { groupId } : {};

    const [students, total] = await Promise.all([
      this.studentRepository.findAll({ skip, take: limit, where }),
      this.studentRepository.count(where),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(id: string) {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async updateStudent(id: string, dto: UpdateStudentDto) {
    const student = await this.getStudentById(id);

    if (dto.firstName || dto.lastName) {
      await this.userRepository.update(student.userId, {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
      });
    }

    return this.studentRepository.update(id, {
      ...(dto.status && { status: dto.status }),
      ...(dto.studentCardNumber && { studentCardNumber: dto.studentCardNumber }),
    });
  }

  async transferStudent(id: string, dto: TransferStudentDto) {
    const student = await this.getStudentById(id);
    const targetGroup = await this.groupRepository.findById(dto.targetGroupId);

    if (!targetGroup) {
      throw new NotFoundException(`Target Group with ID ${dto.targetGroupId} not found`);
    }

    return this.studentRepository.update(student.id, {
      group: { connect: { id: dto.targetGroupId } },
    });
  }

  async deleteStudent(id: string) {
    await this.getStudentById(id);
    return this.studentRepository.softDelete(id);
  }
}
