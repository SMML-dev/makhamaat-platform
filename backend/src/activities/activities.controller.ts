import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';

import { UsersService } from '../users/users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly usersService: UsersService
  ) {}

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Post()
  async create(@Req() req, @Body() createActivityDto: any) {
    const user = await this.usersService.findOne(req.user.email);
    if (user) {
      // Force actorId for standard users, but preserve it for Admins if provided
      if (req.user.role === Role.USER || !createActivityDto.actorId) {
        createActivityDto.actorId = user._id;
      }
    }
    return this.activitiesService.create(createActivityDto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get('logs')
  findLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('filter') filter: string = ''
  ) {
    return this.activitiesService.findLogs(parseInt(page), parseInt(limit), filter);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get('stats/:actorId')
  getStats(@Param('actorId') actorId: string) {
    return this.activitiesService.getStats(actorId);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get('my-orders')
  findMyOrders(@Req() req) {
    return this.activitiesService.findByUserId(req.user.userId);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get('my-stats')
  getMyStats(@Req() req) {
    return this.activitiesService.getUserStats(req.user.userId);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Put(':id/cancel')
  async cancelUserOrder(@Param('id') id: string, @Req() req) {
    const activity = await this.activitiesService.findOne(id);
    if (!activity) {
      throw new NotFoundException('Commande introuvable.');
    }
    
    // Only verify ownership if it's a standard USER
    if (req.user.role === Role.USER) {
      if (!activity.actorId || activity.actorId.toString() !== req.user.userId) {
         throw new ForbiddenException('Vous ne pouvez annuler que vos propres commandes.');
      }
    }
    
    // Important: Prevent cancellation of already shipped orders
    if (activity.status === 'COMPLETED') {
        throw new ForbiddenException('Impossible d\'annuler une commande déjà livrée.');
    }

    return this.activitiesService.update(id, { status: 'CANCELLED' });
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateActivityDto: any, @Req() req) {
    return this.activitiesService.update(id, updateActivityDto, req.user.userId);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
