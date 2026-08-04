import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { StudentRepository } from '../repositories/student.repository';
import { GroupRepository } from '../repositories/group.repository';

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: AttendanceRepository,
          useValue: {
            markAttendance: jest.fn(),
            findByGroupAndDate: jest.fn(),
            findByStudent: jest.fn(),
            getStudentStats: jest.fn(),
          },
        },
        {
          provide: StudentRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: GroupRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
