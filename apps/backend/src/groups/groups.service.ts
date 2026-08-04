import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { GroupRepository } from '../repositories/group.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreateGroupDto, UpdateGroupDto, AssignLeaderDto } from './dto/groups.dto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createGroup(dto: CreateGroupDto) {
    const existing = await this.groupRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Group with code ${dto.code} already exists`);
    }

    if (dto.leaderId) {
      const leader = await this.userRepository.findById(dto.leaderId);
      if (!leader) {
        throw new NotFoundException('Assigned leader user not found');
      }
    }

    return this.groupRepository.create({
      name: dto.name,
      code: dto.code,
      faculty: dto.faculty || null,
      academicYear: dto.academicYear || 2024,
      ...(dto.leaderId && { leader: { connect: { id: dto.leaderId } } }),
    });
  }

  async getAllGroups(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [groups, total] = await Promise.all([
      this.groupRepository.findAll({ skip, take: limit }),
      this.groupRepository.count(),
    ]);

    return {
      data: groups,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGroupById(id: string) {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async updateGroup(id: string, dto: UpdateGroupDto) {
    await this.getGroupById(id);
    return this.groupRepository.update(id, dto);
  }

  async assignLeader(id: string, dto: AssignLeaderDto) {
    await this.getGroupById(id);

    const leader = await this.userRepository.findById(dto.leaderId);
    if (!leader) {
      throw new NotFoundException('Leader user not found');
    }

    if (leader.role !== 'GROUP_LEADER' && leader.role !== 'SUPER_ADMIN') {
      await this.userRepository.update(leader.id, { role: 'GROUP_LEADER' });
    }

    return this.groupRepository.update(id, {
      leader: { connect: { id: dto.leaderId } },
    });
  }

  async deleteGroup(id: string) {
    await this.getGroupById(id);
    return this.groupRepository.softDelete(id);
  }
}
