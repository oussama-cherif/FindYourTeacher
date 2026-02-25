import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async createRecommendation(studentId: string, dto: CreateRecommendationDto) {
    if (!dto.rating && !dto.comment) {
      throw new BadRequestException(
        'At least a rating or comment is required',
      );
    }

    // Verify student has attended at least one DONE session with this teacher
    const hasAttended = await this.prisma.session.findFirst({
      where: {
        status: 'DONE',
        group: {
          teacher: { userId: dto.teacherId },
          memberships: {
            some: { studentId, status: 'ACTIVE' },
          },
        },
      },
    });

    if (!hasAttended) {
      throw new ForbiddenException(
        'You must attend at least one session with this teacher',
      );
    }

    // Check for existing recommendation
    const existing = await this.prisma.recommendation.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: dto.teacherId,
          studentId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'You already left a review for this teacher',
      );
    }

    // Rating-only reviews are auto-approved; comments need admin approval
    const autoApproved = !dto.comment;

    const recommendation = await this.prisma.recommendation.create({
      data: {
        teacherId: dto.teacherId,
        studentId,
        rating: dto.rating,
        comment: dto.comment,
        approved: autoApproved,
        approvedAt: autoApproved ? new Date() : undefined,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        approved: true,
        createdAt: true,
      },
    });

    // If auto-approved (rating only), update teacher stats immediately
    if (autoApproved) {
      await this.updateTeacherStats(dto.teacherId);
    }

    return recommendation;
  }

  async getTeacherRecommendations(teacherId: string) {
    // Return approved recommendations OR rating-only (auto-approved)
    const recommendations = await this.prisma.recommendation.findMany({
      where: {
        teacherId,
        approved: true,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        student: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const profile = await this.prisma.teacherProfile.findFirst({
      where: { userId: teacherId },
      select: {
        averageRating: true,
        recommendationCount: true,
      },
    });

    return {
      recommendations,
      averageRating: profile?.averageRating ?? null,
      totalCount: profile?.recommendationCount ?? 0,
    };
  }

  async getPendingRecommendations() {
    return this.prisma.recommendation.findMany({
      where: { approved: false, comment: { not: null } },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        student: {
          select: { id: true, fullName: true },
        },
        teacher: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveRecommendation(adminId: string, recommendationId: string) {
    const rec = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!rec) {
      throw new NotFoundException('Recommendation not found');
    }

    if (rec.approved) {
      throw new BadRequestException('Already approved');
    }

    await this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        approved: true,
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    await this.updateTeacherStats(rec.teacherId);

    return { message: 'Recommendation approved' };
  }

  async rejectRecommendation(recommendationId: string) {
    const rec = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!rec) {
      throw new NotFoundException('Recommendation not found');
    }

    await this.prisma.recommendation.delete({
      where: { id: recommendationId },
    });

    return { message: 'Recommendation rejected' };
  }

  private async updateTeacherStats(teacherId: string) {
    const approved = await this.prisma.recommendation.findMany({
      where: { teacherId, approved: true },
      select: { rating: true },
    });

    const count = approved.length;
    const ratingsWithValue = approved.filter((r) => r.rating !== null);
    const averageRating =
      ratingsWithValue.length > 0
        ? new Decimal(
            ratingsWithValue.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
              ratingsWithValue.length,
          ).toDecimalPlaces(1)
        : null;

    await this.prisma.teacherProfile.updateMany({
      where: { userId: teacherId },
      data: {
        recommendationCount: count,
        averageRating,
        hasStarBadge: count >= 5,
      },
    });
  }
}
