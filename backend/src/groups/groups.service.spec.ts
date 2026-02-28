import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupsService', () => {
  let service: GroupsService;
  let prisma: {
    group: { findUnique: jest.Mock };
    groupMembership: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      group: { findUnique: jest.fn() },
      groupMembership: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  describe('joinGroup', () => {
    const studentId = 'student-1';
    const groupId = 'group-1';

    it('should reject when group not found', async () => {
      prisma.group.findUnique.mockResolvedValue(null);

      await expect(service.joinGroup(studentId, groupId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject when group is full', async () => {
      prisma.group.findUnique.mockResolvedValue({
        id: groupId,
        isActive: true,
        maxStudents: 5,
        _count: { memberships: 5 },
      });

      await expect(service.joinGroup(studentId, groupId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create new membership when student never joined', async () => {
      prisma.group.findUnique.mockResolvedValue({
        id: groupId,
        isActive: true,
        maxStudents: 10,
        _count: { memberships: 3 },
      });
      prisma.groupMembership.findUnique.mockResolvedValue(null);
      prisma.groupMembership.create.mockResolvedValue({
        id: 'mem-1',
        groupId,
        studentId,
        status: 'PENDING',
      });

      const result = await service.joinGroup(studentId, groupId);

      expect(result.status).toBe('PENDING');
      expect(prisma.groupMembership.create).toHaveBeenCalledWith({
        data: { groupId, studentId, status: 'PENDING' },
      });
    });

    it('should reject if already active or pending', async () => {
      prisma.group.findUnique.mockResolvedValue({
        id: groupId,
        isActive: true,
        maxStudents: 10,
        _count: { memberships: 3 },
      });
      prisma.groupMembership.findUnique.mockResolvedValue({
        id: 'mem-1',
        status: 'ACTIVE',
      });

      await expect(service.joinGroup(studentId, groupId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow re-join after leaving', async () => {
      prisma.group.findUnique.mockResolvedValue({
        id: groupId,
        isActive: true,
        maxStudents: 10,
        _count: { memberships: 3 },
      });
      prisma.groupMembership.findUnique.mockResolvedValue({
        id: 'mem-1',
        status: 'LEFT',
      });
      prisma.groupMembership.update.mockResolvedValue({
        id: 'mem-1',
        status: 'PENDING',
      });

      const result = await service.joinGroup(studentId, groupId);

      expect(result.status).toBe('PENDING');
      expect(prisma.groupMembership.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: { status: 'PENDING' },
      });
    });

    it('should allow re-join after being removed', async () => {
      prisma.group.findUnique.mockResolvedValue({
        id: groupId,
        isActive: true,
        maxStudents: 10,
        _count: { memberships: 2 },
      });
      prisma.groupMembership.findUnique.mockResolvedValue({
        id: 'mem-1',
        status: 'REMOVED',
      });
      prisma.groupMembership.update.mockResolvedValue({
        id: 'mem-1',
        status: 'PENDING',
      });

      const result = await service.joinGroup(studentId, groupId);

      expect(result.status).toBe('PENDING');
    });
  });
});
