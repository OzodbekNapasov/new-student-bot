import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
import { UserRepository } from '../repositories/user.repository';
import { StudentRepository } from '../repositories/student.repository';

describe('BotService', () => {
  let service: BotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-token'),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByTelegramId: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: StudentRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BotService>(BotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
