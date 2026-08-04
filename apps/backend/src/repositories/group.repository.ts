import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Group, Prisma } from '@prisma/client';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.GroupCreateInput): Promise<Group> {
    return this.prisma.group.create({ data });
  }

  async findById(id: string): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        leader: true,
        _count: { select: { students: true } },
      },
    });
  }

  async findByCode(code: string): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { code },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.GroupWhereInput;
    orderBy?: Prisma.GroupOrderByWithRelationInput;
  }): Promise<Group[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.group.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      include: {
        leader: true,
        _count: { select: { students: true } },
      },
      orderBy,
    });
  }

  async update(id: string, data: Prisma.GroupUpdateInput): Promise<Group> {
    return this.prisma.group.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Group> {
    return this.prisma.group.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async count(where?: Prisma.GroupWhereInput): Promise<number> {
    return this.prisma.group.count({
      where: { ...where, deletedAt: null },
    });
  }
}
