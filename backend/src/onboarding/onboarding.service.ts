import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookCallDto } from './dto/book-call.dto';
import { UpdateCallStatusDto } from './dto/update-call-status.dto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async bookCall(studentId: string, dto: BookCallDto) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.teacherId !== dto.teacherId) {
      throw new BadRequestException('Slot does not belong to this teacher');
    }

    if (slot.teacherId === studentId) {
      throw new ForbiddenException('Cannot book your own slot');
    }

    const existing = await this.prisma.onboardingCall.findFirst({
      where: {
        studentId,
        slotId: dto.slotId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existing) {
      throw new ConflictException('You already have an active booking for this slot');
    }

    return this.prisma.onboardingCall.create({
      data: {
        studentId,
        teacherId: dto.teacherId,
        slotId: dto.slotId,
        scheduledAt: new Date(dto.scheduledAt),
        studentNotes: dto.studentNotes,
        status: 'PENDING',
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        studentNotes: true,
        slot: {
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
        teacher: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async getStudentCalls(studentId: string) {
    return this.prisma.onboardingCall.findMany({
      where: { studentId },
      orderBy: { scheduledAt: 'asc' },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        studentNotes: true,
        slot: {
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
        teacher: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async getTeacherCalls(teacherId: string) {
    return this.prisma.onboardingCall.findMany({
      where: { teacherId, dismissedByTeacher: false },
      orderBy: { scheduledAt: 'asc' },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        studentNotes: true,
        slot: {
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
        student: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async updateCallStatus(
    callId: string,
    teacherId: string,
    dto: UpdateCallStatusDto,
  ) {
    const call = await this.prisma.onboardingCall.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.teacherId !== teacherId) {
      throw new ForbiddenException('Not your call');
    }

    return this.prisma.onboardingCall.update({
      where: { id: callId },
      data: { status: dto.status },
    });
  }

  async dismissCall(callId: string, teacherId: string) {
    const call = await this.prisma.onboardingCall.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.teacherId !== teacherId) {
      throw new ForbiddenException('Not your call');
    }

    if (call.status === 'PENDING' || call.status === 'CONFIRMED') {
      throw new BadRequestException(
        'Cannot dismiss active calls. Cancel them first.',
      );
    }

    return this.prisma.onboardingCall.update({
      where: { id: callId },
      data: { dismissedByTeacher: true },
    });
  }

  async cancelCallAsStudent(callId: string, studentId: string) {
    const call = await this.prisma.onboardingCall.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.studentId !== studentId) {
      throw new ForbiddenException('Not your call');
    }

    if (call.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING calls can be cancelled');
    }

    return this.prisma.onboardingCall.update({
      where: { id: callId },
      data: { status: 'CANCELLED' },
    });
  }
}
