import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GroupRepository } from '../../repositories/group.repository';

@Injectable()
export class GroupScopeGuard implements CanActivate {
  constructor(private readonly groupRepository: GroupRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is unauthenticated');
    }

    // SUPER_ADMIN has global unrestricted access
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const groupId = request.params.groupId || request.body.groupId || request.query.groupId;

    if (!groupId) {
      return true;
    }

    if (user.role === 'GROUP_LEADER') {
      const group = await this.groupRepository.findById(groupId);
      if (!group || group.leaderId !== user.sub) {
        throw new ForbiddenException(
          'Group Leader is restricted to managing their assigned group only',
        );
      }
    }

    return true;
  }
}
