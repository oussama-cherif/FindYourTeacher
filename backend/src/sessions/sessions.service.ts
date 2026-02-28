import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

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

  private generateJitsiRoomId(groupId: string): string {
    const ts = Date.now().toString(36);
    const slug = groupId.slice(0, 8);
    return `fyt-${slug}-${ts}`;
  }

  async createSession(userId: string, dto: CreateSessionDto) {
    const profileId = await this.resolveTeacherProfileId(userId);

    const group = await this.prisma.group.findUnique({
      where: { id: dto.groupId, isActive: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== profileId) {
      throw new ForbiddenException('Not your group');
    }

    return this.prisma.session.create({
      data: {
        groupId: dto.groupId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes ?? 60,
        jitsiRoomId: this.generateJitsiRoomId(dto.groupId),
        status: 'SCHEDULED',
      },
      include: {
        group: {
          select: { id: true, name: true, language: true, level: true },
        },
      },
    });
  }

  async getTeacherSessions(userId: string) {
    const profileId = await this.resolveTeacherProfileId(userId);

    return this.prisma.session.findMany({
      where: {
        group: { teacherId: profileId, isActive: true },
      },
      include: {
        group: {
          select: { id: true, name: true, language: true, level: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getStudentSessions(studentId: string) {
    return this.prisma.session.findMany({
      where: {
        status: { in: ['SCHEDULED', 'LIVE'] },
        group: {
          isActive: true,
          memberships: {
            some: { studentId, status: 'ACTIVE' },
          },
        },
      },
      include: {
        group: {
          select: { id: true, name: true, language: true, level: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getSessionDetail(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            language: true,
            level: true,
            teacherId: true,
            memberships: {
              where: { studentId: userId, status: 'ACTIVE' },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check access: must be teacher (owner) or active member
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const isTeacher = profile?.id === session.group.teacherId;
    const isMember = session.group.memberships.length > 0;

    if (!isTeacher && !isMember) {
      throw new ForbiddenException('Not authorized to view this session');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { memberships, teacherId, ...groupData } = session.group;

    // Check if student has credits for this group
    const hasCredits = isTeacher
      ? true
      : await this.paymentsService.hasCredits(userId, session.groupId);

    return {
      ...session,
      group: groupData,
      jitsiUrl: `https://meet.jit.si/${session.jitsiRoomId}`,
      isTeacher,
      hasCredits,
    };
  }

  async startSession(userId: string, sessionId: string) {
    const session = await this.findOwnedSession(userId, sessionId);

    if (session.status !== 'SCHEDULED') {
      throw new BadRequestException('Only SCHEDULED sessions can be started');
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'LIVE' },
    });
  }

  async endSession(userId: string, sessionId: string) {
    const session = await this.findOwnedSession(userId, sessionId);

    if (session.status !== 'LIVE') {
      throw new BadRequestException('Only LIVE sessions can be ended');
    }

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'DONE' },
      include: { group: { select: { id: true } } },
    });

    // Consume one credit for each active group member
    const activeMembers = await this.prisma.groupMembership.findMany({
      where: { groupId: updatedSession.group.id, status: 'ACTIVE' },
      select: { studentId: true },
    });

    for (const member of activeMembers) {
      await this.paymentsService.consumeCredit(
        member.studentId,
        updatedSession.group.id,
      );
    }

    return updatedSession;
  }

  async cancelSession(userId: string, sessionId: string) {
    const session = await this.findOwnedSession(userId, sessionId);

    if (session.status !== 'SCHEDULED') {
      throw new BadRequestException('Only SCHEDULED sessions can be cancelled');
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
    });
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.findOwnedSession(userId, sessionId);

    if (session.status !== 'SCHEDULED') {
      throw new BadRequestException('Only SCHEDULED sessions can be deleted');
    }

    return this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  private async findOwnedSession(userId: string, sessionId: string) {
    const profileId = await this.resolveTeacherProfileId(userId);

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        group: { select: { teacherId: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.group.teacherId !== profileId) {
      throw new ForbiddenException('Not your session');
    }

    return session;
  }
}
