import { Controller, Get, Post, Delete, UseGuards, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppService } from './app.service';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { Role } from './users/schemas/user.schema';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset/request-otp')
  async requestResetOtp(@Req() req, @Body('password') passwordAttempt: string) {
    // req.user contains the decoded JWT token payload
    return this.appService.requestResetOtp(req.user.email, req.user.role, passwordAttempt);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('reset')
  async resetPlatform(@Req() req, @Body('otp') otp: string) {
    if (!otp) {
      throw new Error("L'OTP est requis.");
    }
    return this.appService.resetPlatform(req.user.email, req.user.role, otp);
  }

  @Public()
  @Get('maintenance')
  getMaintenanceStatus() {
    return { isMaintenance: this.appService.isMaintenance() };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('maintenance')
  toggleMaintenance(@Body('status') status: boolean) {
    return { isMaintenance: this.appService.setMaintenance(status) };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('backup')
  getBackup() {
    return this.appService.getPlatformBackup();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('security/rotate-keys')
  async rotateKeys(@Req() req) {
    return this.appService.rotateMasterKeys(req.user.role);
  }
}
