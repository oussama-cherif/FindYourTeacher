import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { BuyCreditsDto } from './dto/buy-credits.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
  private readonly isSandbox: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private http: HttpService,
  ) {
    this.isSandbox = this.config.get<string>('FLOUCI_APP_TOKEN') === 'sandbox';
  }

  async buyCredits(studentId: string, dto: BuyCreditsDto) {
    // Verify group exists and student is an active member
    const group = await this.prisma.group.findUnique({
      where: { id: dto.groupId, isActive: true },
      select: {
        id: true,
        name: true,
        pricePerSession: true,
        platformFee: true,
        memberships: {
          where: { studentId, status: 'ACTIVE' },
          select: { id: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.memberships.length === 0) {
      throw new ForbiddenException('You must be an active member of this group');
    }

    const pricePerSession = new Decimal(group.pricePerSession);
    // Student pays full session price, teacher receives 100% (platform fee is a separate teacher subscription)
    const amountPaid = pricePerSession.times(dto.credits);
    const totalPlatformFee = new Decimal(0);
    const teacherNet = amountPaid;

    // Create session credit record with PENDING status
    const credit = await this.prisma.sessionCredit.create({
      data: {
        studentId,
        groupId: dto.groupId,
        totalCredits: dto.credits,
        amountPaid,
        platformFee: totalPlatformFee,
        teacherNet,
        status: 'PENDING',
      },
    });

    // Call Flouci API to generate payment
    const amountInMillimes = amountPaid.times(1000).toNumber();
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');

    const flouciResponse = await this.callFlouciGeneratePayment(
      amountInMillimes,
      `${frontendUrl}/fr/dashboard/student/payments/success?creditId=${credit.id}`,
      `${frontendUrl}/fr/dashboard/student/payments/fail?creditId=${credit.id}`,
      credit.id,
    );

    // Store Flouci payment ID
    await this.prisma.sessionCredit.update({
      where: { id: credit.id },
      data: { flouciPaymentId: flouciResponse.paymentId },
    });

    return {
      creditId: credit.id,
      paymentUrl: flouciResponse.link,
      amount: amountPaid,
      credits: dto.credits,
      groupName: group.name,
    };
  }

  async verifyPayment(studentId: string, creditId: string) {
    const credit = await this.prisma.sessionCredit.findUnique({
      where: { id: creditId },
    });

    if (!credit) {
      throw new NotFoundException('Credit purchase not found');
    }

    if (credit.studentId !== studentId) {
      throw new ForbiddenException('Not your purchase');
    }

    if (credit.status === 'PAID') {
      return { status: 'PAID', message: 'Already verified' };
    }

    if (credit.status !== 'PENDING') {
      throw new BadRequestException('Payment cannot be verified');
    }

    if (!credit.flouciPaymentId) {
      throw new BadRequestException('No Flouci payment ID found');
    }

    // Verify with Flouci
    const verified = await this.callFlouciVerifyPayment(credit.flouciPaymentId);

    if (verified) {
      await this.prisma.sessionCredit.update({
        where: { id: creditId },
        data: { status: 'PAID', paidAt: new Date() },
      });

      return { status: 'PAID', message: 'Payment verified successfully' };
    } else {
      await this.prisma.sessionCredit.update({
        where: { id: creditId },
        data: { status: 'FAILED' },
      });

      return { status: 'FAILED', message: 'Payment verification failed' };
    }
  }

  async getStudentCredits(studentId: string) {
    const credits = await this.prisma.sessionCredit.findMany({
      where: { studentId },
      include: {
        group: {
          select: { id: true, name: true, language: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute balances per group
    const groupBalances = new Map<
      string,
      { groupId: string; groupName: string; remaining: number; total: number }
    >();

    for (const c of credits) {
      if (c.status !== 'PAID') continue;
      const key = c.groupId;
      const existing = groupBalances.get(key);
      if (existing) {
        existing.remaining += c.totalCredits - c.usedCredits;
        existing.total += c.totalCredits;
      } else {
        groupBalances.set(key, {
          groupId: c.groupId,
          groupName: c.group.name,
          remaining: c.totalCredits - c.usedCredits,
          total: c.totalCredits,
        });
      }
    }

    return {
      purchases: credits,
      balances: Array.from(groupBalances.values()),
    };
  }

  async getStudentGroupCredits(studentId: string, groupId: string) {
    const credits = await this.prisma.sessionCredit.findMany({
      where: { studentId, groupId, status: 'PAID' },
      select: { totalCredits: true, usedCredits: true },
    });

    const remaining = credits.reduce(
      (sum, c) => sum + (c.totalCredits - c.usedCredits),
      0,
    );

    return { groupId, remaining };
  }

  async getTeacherEarnings(userId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    const credits = await this.prisma.sessionCredit.findMany({
      where: {
        status: 'PAID',
        group: { teacherId: profile.id },
      },
      include: {
        group: {
          select: { id: true, name: true },
        },
        student: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const totalEarned = credits.reduce(
      (sum, c) => sum.plus(c.teacherNet),
      new Decimal(0),
    );

    return {
      totalEarned,
      payments: credits,
    };
  }

  // Check if student has available credits for a group
  async hasCredits(studentId: string, groupId: string): Promise<boolean> {
    const credits = await this.prisma.sessionCredit.findMany({
      where: {
        studentId,
        groupId,
        status: 'PAID',
      },
      select: { totalCredits: true, usedCredits: true },
    });

    return credits.some((c) => c.usedCredits < c.totalCredits);
  }

  // Consume one credit for a student in a group (called when session ends)
  async consumeCredit(studentId: string, groupId: string): Promise<boolean> {
    // Find the oldest PAID credit with remaining balance
    const credit = await this.prisma.sessionCredit.findFirst({
      where: {
        studentId,
        groupId,
        status: 'PAID',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!credit || credit.usedCredits >= credit.totalCredits) {
      return false;
    }

    await this.prisma.sessionCredit.update({
      where: { id: credit.id },
      data: { usedCredits: { increment: 1 } },
    });

    return true;
  }

  private async callFlouciGeneratePayment(
    amountInMillimes: number,
    successLink: string,
    failLink: string,
    trackingId: string,
  ): Promise<{ paymentId: string; link: string }> {
    // Sandbox mode: skip Flouci API and redirect directly to success page
    if (this.isSandbox) {
      const sandboxPaymentId = `sandbox_${trackingId}_${Date.now()}`;
      return {
        paymentId: sandboxPaymentId,
        link: successLink,
      };
    }

    const baseUrl = this.config.getOrThrow<string>('FLOUCI_BASE_URL');
    const appToken = this.config.getOrThrow<string>('FLOUCI_APP_TOKEN');
    const appSecret = this.config.getOrThrow<string>('FLOUCI_APP_SECRET');

    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${baseUrl}/api/v2/generate_payment`,
          {
            app_token: appToken,
            app_secret: appSecret,
            amount: amountInMillimes,
            accept_card: 'true',
            session_timeout_secs: 1200,
            success_link: successLink,
            fail_link: failLink,
            developer_tracking_id: trackingId,
          },
        ),
      );

      return {
        paymentId: data.result.payment_id,
        link: data.result.link,
      };
    } catch {
      throw new BadRequestException('Failed to initiate payment with Flouci');
    }
  }

  private async callFlouciVerifyPayment(paymentId: string): Promise<boolean> {
    // Sandbox mode: always return success
    if (this.isSandbox) {
      return true;
    }

    const baseUrl = this.config.getOrThrow<string>('FLOUCI_BASE_URL');
    const appToken = this.config.getOrThrow<string>('FLOUCI_APP_TOKEN');
    const appSecret = this.config.getOrThrow<string>('FLOUCI_APP_SECRET');

    try {
      const { data } = await firstValueFrom(
        this.http.get(`${baseUrl}/api/v2/verify_payment/${paymentId}`, {
          headers: {
            'Content-Type': 'application/json',
            apppublic: appToken,
            appsecret: appSecret,
          },
        }),
      );

      return data.result?.status === 'SUCCESS';
    } catch {
      return false;
    }
  }
}
