import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertTeacherProfileDto } from './dto/upsert-teacher-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { TeacherFiltersDto } from './dto/teacher-filters.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            phone: true,
            isVerified: true,
          },
        },
      },
    });

    if (!profile) {
      // Auto-create empty profile for new teachers
      return this.prisma.teacherProfile.create({
        data: { userId, languages: [], audienceTypes: [] },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              phone: true,
              isVerified: true,
            },
          },
        },
      });
    }

    return profile;
  }

  async upsertProfile(userId: string, dto: UpsertTeacherProfileDto) {
    return this.prisma.teacherProfile.upsert({
      where: { userId },
      update: {
        bio: dto.bio,
        languages: dto.languages,
        audienceTypes: dto.audienceTypes,
      },
      create: {
        userId,
        bio: dto.bio,
        languages: dto.languages,
        audienceTypes: dto.audienceTypes,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getAvailability(userId: string) {
    return this.prisma.availabilitySlot.findMany({
      where: { teacherId: userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createSlot(userId: string, dto: CreateAvailabilitySlotDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    // Check for overlapping slots on the same day
    const overlapping = await this.prisma.availabilitySlot.findFirst({
      where: {
        teacherId: userId,
        dayOfWeek: dto.dayOfWeek,
        startTime: { lt: dto.endTime },
        endTime: { gt: dto.startTime },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'This slot overlaps with an existing one',
      );
    }

    return this.prisma.availabilitySlot.create({
      data: {
        teacherId: userId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async deleteSlot(userId: string, slotId: string) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.teacherId !== userId) {
      throw new ForbiddenException('Not your slot');
    }

    return this.prisma.availabilitySlot.delete({
      where: { id: slotId },
    });
  }

  async listTeachers(filters: TeacherFiltersDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      role: 'TEACHER',
      isActive: true,
      teacherProfile: { isNot: null },
    };

    if (filters.language) {
      where.teacherProfile = {
        ...((where.teacherProfile as Record<string, unknown>) ?? {}),
        languages: { has: filters.language },
      };
    }

    if (filters.audienceType) {
      where.teacherProfile = {
        ...((where.teacherProfile as Record<string, unknown>) ?? {}),
        audienceTypes: { has: filters.audienceType },
      };
    }

    const [teachers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          teacherProfile: {
            select: {
              id: true,
              bio: true,
              languages: true,
              audienceTypes: true,
              recommendationCount: true,
              hasStarBadge: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: teachers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true, role: 'TEACHER' },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
        teacherProfile: {
          select: {
            id: true,
            bio: true,
            languages: true,
            audienceTypes: true,
            recommendationCount: true,
            hasStarBadge: true,
          },
        },
        availabilitySlots: {
          where: { isBooked: false },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!user || !user.teacherProfile) {
      throw new NotFoundException('Teacher not found');
    }

    return user;
  }
}
