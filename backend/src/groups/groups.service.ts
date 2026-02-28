import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupFiltersDto } from './dto/group-filters.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private async resolveTeacherProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return profile.id;
  }

  async createGroup(userId: string, dto: CreateGroupDto) {
    const profileId = await this.resolveTeacherProfileId(userId);

    return this.prisma.group.create({
      data: {
        teacherId: profileId,
        name: dto.name,
        language: dto.language,
        level: dto.level,
        audienceType: dto.audienceType,
        maxStudents: dto.maxStudents,
        pricePerSession: new Decimal(dto.pricePerSession),
      },
    });
  }

  async getTeacherGroups(userId: string) {
    const profileId = await this.resolveTeacherProfileId(userId);

    const groups = await this.prisma.group.findMany({
      where: { teacherId: profileId, isActive: true },
      include: {
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const pendingCount = await this.prisma.groupMembership.count({
      where: {
        status: 'PENDING',
        group: { teacherId: profileId, isActive: true },
      },
    });

    return { groups, pendingMemberships: pendingCount };
  }

  async updateGroup(userId: string, groupId: string, dto: UpdateGroupDto) {
    const profileId = await this.resolveTeacherProfileId(userId);

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== profileId) {
      throw new ForbiddenException('Not your group');
    }

    return this.prisma.group.update({
      where: { id: groupId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.audienceType !== undefined && {
          audienceType: dto.audienceType,
        }),
        ...(dto.maxStudents !== undefined && { maxStudents: dto.maxStudents }),
        ...(dto.pricePerSession !== undefined && {
          pricePerSession: new Decimal(dto.pricePerSession),
        }),
      },
    });
  }

  async deactivateGroup(userId: string, groupId: string) {
    const profileId = await this.resolveTeacherProfileId(userId);

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== profileId) {
      throw new ForbiddenException('Not your group');
    }

    return this.prisma.group.update({
      where: { id: groupId },
      data: { isActive: false },
    });
  }

  async listGroups(filters: GroupFiltersDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (filters.language) {
      where.language = filters.language;
    }
    if (filters.level) {
      where.level = filters.level;
    }
    if (filters.audienceType) {
      where.audienceType = filters.audienceType;
    }

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          language: true,
          level: true,
          audienceType: true,
          maxStudents: true,
          pricePerSession: true,
          teacher: {
            select: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: {
              memberships: { where: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data: groups,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getGroupDetail(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      select: {
        id: true,
        name: true,
        language: true,
        level: true,
        audienceType: true,
        maxStudents: true,
        pricePerSession: true,
        platformFee: true,
        teacher: {
          select: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return {
      ...group,
      availableSpots: group.maxStudents - group._count.memberships,
    };
  }

  async joinGroup(studentId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        _count: {
          select: { memberships: { where: { status: 'ACTIVE' } } },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group._count.memberships >= group.maxStudents) {
      throw new BadRequestException('Group is full');
    }

    const existing = await this.prisma.groupMembership.findUnique({
      where: { groupId_studentId: { groupId, studentId } },
    });

    if (existing) {
      if (existing.status === 'ACTIVE' || existing.status === 'PENDING') {
        throw new ConflictException('Already a member or request pending');
      }

      // Re-join after leaving or being removed
      return this.prisma.groupMembership.update({
        where: { id: existing.id },
        data: { status: 'PENDING' },
      });
    }

    return this.prisma.groupMembership.create({
      data: { groupId, studentId, status: 'PENDING' },
    });
  }

  async leaveGroup(studentId: string, groupId: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: { groupId_studentId: { groupId, studentId } },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status === 'LEFT' || membership.status === 'REMOVED') {
      throw new BadRequestException('Already left or removed');
    }

    return this.prisma.groupMembership.update({
      where: { id: membership.id },
      data: { status: 'LEFT' },
    });
  }

  async getStudentMemberships(studentId: string) {
    return this.prisma.groupMembership.findMany({
      where: { studentId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            language: true,
            level: true,
            audienceType: true,
            pricePerSession: true,
            platformFee: true,
            isActive: true,
            teacher: {
              select: {
                user: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async approveMembership(userId: string, membershipId: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: { id: membershipId },
      include: {
        group: {
          include: {
            _count: {
              select: { memberships: { where: { status: 'ACTIVE' } } },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const profileId = await this.resolveTeacherProfileId(userId);

    if (membership.group.teacherId !== profileId) {
      throw new ForbiddenException('Not your group');
    }

    if (membership.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING memberships can be approved');
    }

    if (membership.group._count.memberships >= membership.group.maxStudents) {
      throw new BadRequestException('Group is full');
    }

    return this.prisma.groupMembership.update({
      where: { id: membershipId },
      data: { status: 'ACTIVE' },
    });
  }

  async removeMember(userId: string, membershipId: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: { id: membershipId },
      include: { group: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const profileId = await this.resolveTeacherProfileId(userId);

    if (membership.group.teacherId !== profileId) {
      throw new ForbiddenException('Not your group');
    }

    return this.prisma.groupMembership.update({
      where: { id: membershipId },
      data: { status: 'REMOVED' },
    });
  }

  async getGroupMembers(userId: string, groupId: string) {
    const profileId = await this.resolveTeacherProfileId(userId);

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== profileId) {
      throw new ForbiddenException('Not your group');
    }

    return this.prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        student: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
