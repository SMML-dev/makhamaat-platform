import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req, Res, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';

import { UsersService } from '../users/users.service';
import { Response } from 'express';
import PDFDocument from 'pdfkit';

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

    return this.activitiesService.update(id, { status: 'CANCELLED', cancelledBy: req.user.role === Role.USER ? 'USER' : 'ADMIN' });
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateActivityDto: any, @Req() req) {
    const activity = await this.activitiesService.findOne(id);
    if (!activity) {
      throw new NotFoundException('Commande introuvable.');
    }
    if (activity.cancelledBy === 'USER') {
      throw new ForbiddenException('Une commande annulée par l\'utilisateur ne peut plus être modifiée.');
    }
    if (updateActivityDto.status === 'CANCELLED' && !updateActivityDto.cancelledBy) {
      updateActivityDto.cancelledBy = 'ADMIN';
    }
    return this.activitiesService.update(id, updateActivityDto, req.user.userId);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get(':id/receipt')
  async generateReceipt(@Param('id') id: string, @Req() req, @Res() res: Response) {
    const activity = await this.activitiesService.findOne(id);
    if (!activity) {
      throw new NotFoundException('Commande introuvable.');
    }
    if (req.user.role === Role.USER && activity.actorId?.toString?.() !== req.user.userId) {
      throw new ForbiddenException('Vous ne pouvez accéder qu\'à vos propres reçus.');
    }
    const user = await this.usersService.findById(activity.actorId?.toString?.() || req.user.userId);
    const product: any = activity.productId;
    const quantity = activity.quantity || 1;
    const unitPrice = product?.price || 0;
    const total = unitPrice * quantity;
    const fmt = (n: number) => n.toLocaleString('en-US');
    const paymentLabel = activity.status === 'CANCELLED' ? 'NOT PAID' : activity.paymentStatus === 'PAID' || activity.status === 'COMPLETED' ? 'PAID' : 'PENDING';
    const unitLabel = product?.unit ? ` ${product.unit}` : '';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${activity.orderNumber || id}.pdf"`);
    const doc = new (PDFDocument as any)();
    doc.pipe(res);
    doc.fontSize(20).text('Makhamaat', 50, 50);
    doc.fontSize(14).text(`Receipt: ${activity.orderNumber || id}`, 50, 90);
    doc.fontSize(10).text(`Date: ${new Date((activity as any).createdAt).toLocaleString()}`, 50, 120);
    doc.text(`Customer: ${user?.name || 'N/A'} (${user?.email || activity.actorId || 'N/A'})`, 50, 135);
    doc.text(`Payment method: ${activity.paymentMethod}`, 50, 150);
    doc.text(`Status: ${activity.status} / Payment: ${paymentLabel}`, 50, 165);
    doc.moveDown();
    doc.text(`Product: ${product?.localizedName || product?.name || 'N/A'}`, 50, 200);
    doc.text(`Quantity: ${quantity}${unitLabel}`, 50, 215);
    doc.text(`Unit price: ${fmt(unitPrice)} FCFA`, 50, 230);
    doc.fontSize(12).text(`Total: ${fmt(total)} FCFA`, 50, 250);
    doc.end();
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
