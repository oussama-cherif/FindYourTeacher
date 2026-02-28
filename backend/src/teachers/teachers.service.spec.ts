import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeachersService', () => {
  let service: TeachersService;
  let prisma: {
    availabilitySlot: {
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      availabilitySlot: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  describe('createSlot', () => {
    const userId = 'teacher-1';

    it('should reject when startTime >= endTime', async () => {
      await expect(
        service.createSlot(userId, {
          dayOfWeek: 1,
          startTime: '14:00',
          endTime: '14:00',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createSlot(userId, {
          dayOfWeek: 1,
          startTime: '15:00',
          endTime: '14:00',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject overlapping slots on the same day', async () => {
      // Existing slot: 10:00-12:00 on Monday
      prisma.availabilitySlot.findFirst.mockResolvedValue({
        id: 'slot-1',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
      });

      // Try to create 11:00-13:00 on Monday (overlaps)
      await expect(
        service.createSlot(userId, {
          dayOfWeek: 1,
          startTime: '11:00',
          endTime: '13:00',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow non-overlapping slots on the same day', async () => {
      prisma.availabilitySlot.findFirst.mockResolvedValue(null);
      prisma.availabilitySlot.create.mockResolvedValue({
        id: 'new-slot',
        teacherId: userId,
        dayOfWeek: 1,
        startTime: '14:00',
        endTime: '16:00',
      });

      const result = await service.createSlot(userId, {
        dayOfWeek: 1,
        startTime: '14:00',
        endTime: '16:00',
      });

      expect(result.id).toBe('new-slot');
      expect(prisma.availabilitySlot.create).toHaveBeenCalled();
    });

    it('should allow same time slot on different days', async () => {
      prisma.availabilitySlot.findFirst.mockResolvedValue(null);
      prisma.availabilitySlot.create.mockResolvedValue({
        id: 'new-slot',
        teacherId: userId,
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '12:00',
      });

      const result = await service.createSlot(userId, {
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '12:00',
      });

      expect(result.id).toBe('new-slot');
    });
  });
});
