import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { UpsertTeacherProfileDto } from './dto/upsert-teacher-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { TeacherFiltersDto } from './dto/teacher-filters.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  // ─── Protected teacher routes ──────────────────────────────

  @Get('profile')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getProfile(@CurrentUser('sub') userId: string) {
    return this.teachersService.getProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  upsertProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpsertTeacherProfileDto,
  ) {
    return this.teachersService.upsertProfile(userId, dto);
  }

  @Get('availability')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getAvailability(@CurrentUser('sub') userId: string) {
    return this.teachersService.getAvailability(userId);
  }

  @Post('availability')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  createSlot(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAvailabilitySlotDto,
  ) {
    return this.teachersService.createSlot(userId, dto);
  }

  @Delete('availability/:id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  deleteSlot(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) slotId: string,
  ) {
    return this.teachersService.deleteSlot(userId, slotId);
  }

  // ─── Public routes ─────────────────────────────────────────

  @Get()
  listTeachers(@Query() filters: TeacherFiltersDto) {
    return this.teachersService.listTeachers(filters);
  }

  @Get(':id')
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.getPublicProfile(id);
  }
}
