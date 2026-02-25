import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { BuyCreditsDto } from './dto/buy-credits.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('buy-credits')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  buyCredits(
    @CurrentUser('sub') studentId: string,
    @Body() dto: BuyCreditsDto,
  ) {
    return this.paymentsService.buyCredits(studentId, dto);
  }

  @Post(':creditId/verify')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  verifyPayment(
    @CurrentUser('sub') studentId: string,
    @Param('creditId', ParseUUIDPipe) creditId: string,
  ) {
    return this.paymentsService.verifyPayment(studentId, creditId);
  }

  @Get('student')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  getStudentCredits(@CurrentUser('sub') studentId: string) {
    return this.paymentsService.getStudentCredits(studentId);
  }

  @Get('student/group/:groupId')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  getStudentGroupCredits(
    @CurrentUser('sub') studentId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ) {
    return this.paymentsService.getStudentGroupCredits(studentId, groupId);
  }

  @Get('teacher')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getTeacherEarnings(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getTeacherEarnings(userId);
  }
}
