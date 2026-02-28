import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { BookCallDto } from './dto/book-call.dto';
import { UpdateCallStatusDto } from './dto/update-call-status.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  bookCall(@CurrentUser('sub') studentId: string, @Body() dto: BookCallDto) {
    return this.onboardingService.bookCall(studentId, dto);
  }

  @Get('student')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  getStudentCalls(@CurrentUser('sub') studentId: string) {
    return this.onboardingService.getStudentCalls(studentId);
  }

  @Get('teacher')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getTeacherCalls(@CurrentUser('sub') teacherId: string) {
    return this.onboardingService.getTeacherCalls(teacherId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  updateCallStatus(
    @CurrentUser('sub') teacherId: string,
    @Param('id', ParseUUIDPipe) callId: string,
    @Body() dto: UpdateCallStatusDto,
  ) {
    return this.onboardingService.updateCallStatus(callId, teacherId, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  cancelCall(
    @CurrentUser('sub') studentId: string,
    @Param('id', ParseUUIDPipe) callId: string,
  ) {
    return this.onboardingService.cancelCallAsStudent(callId, studentId);
  }

  @Delete(':id/dismiss')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  dismissCall(
    @CurrentUser('sub') teacherId: string,
    @Param('id', ParseUUIDPipe) callId: string,
  ) {
    return this.onboardingService.dismissCall(callId, teacherId);
  }
}
