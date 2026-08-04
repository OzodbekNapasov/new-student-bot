import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, TransferStudentDto } from './dto/students.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { GroupScopeGuard } from '../auth/guards/group-scope.guard';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, GroupScopeGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'Add a new student to assigned group' })
  async createStudent(@Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'List students with optional groupId filter & pagination' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getAllStudents(
    @Query('groupId') groupId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.studentsService.getAllStudents(groupId, Number(page), Number(limit));
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'Get details of a specific student' })
  async getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentById(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'Update student profile information' })
  async updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.updateStudent(id, dto);
  }

  @Put(':id/transfer')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Transfer student to another group (Super Admin only)' })
  async transferStudent(@Param('id') id: string, @Body() dto: TransferStudentDto) {
    return this.studentsService.transferStudent(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'GROUP_LEADER')
  @ApiOperation({ summary: 'Expel/Delete student record' })
  async deleteStudent(@Param('id') id: string) {
    return this.studentsService.deleteStudent(id);
  }
}
