import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupFiltersDto } from './dto/group-filters.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  // ─── Literal paths first (before :id) ──────────────────────

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  createGroup(@CurrentUser('sub') userId: string, @Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(userId, dto);
  }

  @Get('teacher')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getTeacherGroups(@CurrentUser('sub') userId: string) {
    return this.groupsService.getTeacherGroups(userId);
  }

  @Get('mine')
  @UseGuards(JwtAccessGuard)
  getMyMemberships(@CurrentUser('sub') userId: string) {
    return this.groupsService.getStudentMemberships(userId);
  }

  @Patch('memberships/:id/approve')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  approveMembership(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) membershipId: string,
  ) {
    return this.groupsService.approveMembership(userId, membershipId);
  }

  @Patch('memberships/:id/remove')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  removeMember(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) membershipId: string,
  ) {
    return this.groupsService.removeMember(userId, membershipId);
  }

  // ─── Public routes ─────────────────────────────────────────

  @Get()
  listGroups(@Query() filters: GroupFiltersDto) {
    return this.groupsService.listGroups(filters);
  }

  @Get(':id')
  getGroupDetail(@Param('id', ParseUUIDPipe) groupId: string) {
    return this.groupsService.getGroupDetail(groupId);
  }

  // ─── Parameterized routes ──────────────────────────────────

  @Patch(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  updateGroup(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) groupId: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.updateGroup(userId, groupId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  deactivateGroup(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) groupId: string,
  ) {
    return this.groupsService.deactivateGroup(userId, groupId);
  }

  @Post(':id/join')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  joinGroup(
    @CurrentUser('sub') studentId: string,
    @Param('id', ParseUUIDPipe) groupId: string,
  ) {
    return this.groupsService.joinGroup(studentId, groupId);
  }

  @Patch(':id/leave')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  leaveGroup(
    @CurrentUser('sub') studentId: string,
    @Param('id', ParseUUIDPipe) groupId: string,
  ) {
    return this.groupsService.leaveGroup(studentId, groupId);
  }

  @Get(':id/members')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getGroupMembers(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) groupId: string,
  ) {
    return this.groupsService.getGroupMembers(userId, groupId);
  }
}
