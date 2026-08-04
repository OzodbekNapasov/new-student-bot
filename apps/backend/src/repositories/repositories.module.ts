import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { GroupRepository } from './group.repository';
import { StudentRepository } from './student.repository';
import { AttendanceRepository } from './attendance.repository';

@Global()
@Module({
  providers: [UserRepository, GroupRepository, StudentRepository, AttendanceRepository],
  exports: [UserRepository, GroupRepository, StudentRepository, AttendanceRepository],
})
export class RepositoriesModule {}
