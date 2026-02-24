import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  createSession(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.createSession(userId, dto);
  }

  @Get('teacher')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getTeacherSessions(@CurrentUser('sub') userId: string) {
    return this.sessionsService.getTeacherSessions(userId);
  }

  @Get('student')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  getStudentSessions(@CurrentUser('sub') studentId: string) {
    return this.sessionsService.getStudentSessions(studentId);
  }

  @Get(':id')
  @UseGuards(JwtAccessGuard)
  getSessionDetail(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionsService.getSessionDetail(sessionId, userId);
  }

  @Patch(':id/start')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  startSession(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionsService.startSession(userId, sessionId);
  }

  @Patch(':id/end')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  endSession(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionsService.endSession(userId, sessionId);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  cancelSession(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionsService.cancelSession(userId, sessionId);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  deleteSession(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionsService.deleteSession(userId, sessionId);
  }
}
