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
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  createRecommendation(
    @CurrentUser('sub') studentId: string,
    @Body() dto: CreateRecommendationDto,
  ) {
    return this.recommendationsService.createRecommendation(studentId, dto);
  }

  @Get('teacher/:teacherId')
  getTeacherRecommendations(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
  ) {
    return this.recommendationsService.getTeacherRecommendations(teacherId);
  }

  @Get('admin/pending')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPendingRecommendations() {
    return this.recommendationsService.getPendingRecommendations();
  }

  @Patch('admin/:id/approve')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approveRecommendation(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.recommendationsService.approveRecommendation(adminId, id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  rejectRecommendation(@Param('id', ParseUUIDPipe) id: string) {
    return this.recommendationsService.rejectRecommendation(id);
  }
}
