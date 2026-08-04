import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Student, Prisma } from '@prisma/client';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  async findById(id: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        group: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
        group: true,
      },
    });
  }

  async findByGroupId(groupId: string): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { groupId, deletedAt: null },
      include: {
        user: true,
      },
      orderBy: { user: { lastName: 'asc' } },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }): Promise<Student[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.student.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      include: {
        user: true,
        group: true,
      },
      orderBy,
    });
  }

  async update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'EXPELLED' },
    });
  }

  async count(where?: Prisma.StudentWhereInput): Promise<number> {
    return this.prisma.student.count({
      where: { ...where, deletedAt: null },
    });
  }
}
