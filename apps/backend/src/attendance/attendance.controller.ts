import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { GroupScopeGuard } from '../auth/guards/group-scope.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, GroupScopeGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: '1-Click Bulk mark daily attendance for group' })
  async markBulkAttendance(@Req() req: any, @Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulkAttendance(req.user.sub, dto);
  }

  @Get('group/:groupId')
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'Get group attendance records for a specific date' })
  @ApiQuery({ name: 'date', required: true, example: '2026-08-04' })
  async getGroupAttendanceByDate(@Param('groupId') groupId: string, @Query('date') date: string) {
    return this.attendanceService.getGroupAttendanceByDate(groupId, date);
  }

  @Get('student/:studentId')
  @Roles('SUPER_ADMIN', 'GROUP_LEADER', 'STUDENT')
  @ApiOperation({ summary: 'Get student attendance statistics & history' })
  async getStudentAttendanceStats(@Param('studentId') studentId: string) {
    return this.attendanceService.getStudentAttendanceStats(studentId);
  }
}
