import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, AssignLeaderDto } from './dto/groups.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { GroupScopeGuard } from '../auth/guards/group-scope.guard';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, GroupScopeGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new academic group (Super Admin only)' })
  async createGroup(@Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'List academic groups with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getAllGroups(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.groupsService.getAllGroups(Number(page), Number(limit));
  }

  @Get(':groupId')
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'Get details of a specific group' })
  async getGroupById(@Param('groupId') groupId: string) {
    return this.groupsService.getGroupById(groupId);
  }

  @Put(':groupId')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update group details (Super Admin only)' })
  async updateGroup(@Param('groupId') groupId: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.updateGroup(groupId, dto);
  }

  @Put(':groupId/assign-leader')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Assign a Group Leader to group (Super Admin only)' })
  async assignLeader(@Param('groupId') groupId: string, @Body() dto: AssignLeaderDto) {
    return this.groupsService.assignLeader(groupId, dto);
  }

  @Delete(':groupId')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete/Archive group (Super Admin only)' })
  async deleteGroup(@Param('groupId') groupId: string) {
    return this.groupsService.deleteGroup(groupId);
  }
}
