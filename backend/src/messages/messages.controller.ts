import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { Public } from '../auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ─── Public / Contact ──────────────────────────────────────────────────────

  @Public()
  @Post('contact')
  createContact(@Body() createContactMessageDto: CreateContactMessageDto) {
    return this.messagesService.createContactMessage(createContactMessageDto);
  }

  // ─── Admin Messaging ───────────────────────────────────────────────────────

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createMessageDto: any) {
    return this.messagesService.create(createMessageDto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get('my-messages')
  findMyMessages(@Req() req) {
    return this.messagesService.findMyMessages(req.user.email);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin-inbox')
  findAdminInbox() {
    return this.messagesService.findAdminInbox();
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  findAll(@Query('folder') folder?: string) {
    if (folder) {
      return this.messagesService.findByFolder(folder);
    }
    return this.messagesService.findAll();
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: any) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }

  // ─── Super Admin — Broadcasts ──────────────────────────────────────────────

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('broadcast')
  createBroadcast(@Body() createBroadcastDto: CreateBroadcastDto, @Req() req) {
    const senderName = req.user?.name || req.user?.firstName || 'Admin';
    return this.messagesService.createBroadcast(createBroadcastDto, senderName);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('broadcasts')
  findBroadcasts() {
    return this.messagesService.findBroadcasts();
  }
}
