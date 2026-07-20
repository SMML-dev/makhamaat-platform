import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id/role')
  @Roles(Role.SUPER_ADMIN)
  async updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  @Post('avatar-upload')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadAvatar(@UploadedFile() file: any, @Req() req: any) {
    const protocol = req.protocol;
    const host = req.get('host');
    return {
      url: `${protocol}://${host}/uploads/${file.filename}`
    };
  }

  @Put('profile')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  async updateProfile(@Req() req, @Body() updateData: any) {
    return this.usersService.updateByEmail(req.user.email, updateData);
  }

  @Post('change-password')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  async changePassword(@Req() req, @Body() body: any) {
    try {
      await this.usersService.changePassword(req.user.userId, body.currentPassword, body.newPassword);
      return { success: true, message: 'Mot de passe mis à jour avec succès.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('2fa/generate')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  async generate2FA(@Req() req: any) {
    return this.usersService.generate2FASecret(req.user.userId);
  }

  @Post('2fa/confirm')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  async confirm2FA(@Req() req: any, @Body('token') token: string) {
    const isValid = await this.usersService.verify2FAToken(req.user.userId, token);
    return { success: isValid, message: isValid ? '2FA activée avec succès.' : 'Code invalide.' };
  }

  @Post('2fa/disable')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  async disable2FA(@Req() req: any) {
    await this.usersService.disable2FA(req.user.userId);
    return { success: true, message: '2FA désactivée.' };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
