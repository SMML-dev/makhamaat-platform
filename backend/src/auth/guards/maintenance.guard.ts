import { Injectable, CanActivate, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppService } from '../../app.service';
import { Role } from '../../users/schemas/user.schema';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private appService: AppService,
    private reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    if (!this.appService.isMaintenance()) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Always allow public routes during maintenance (like login)
    if (isPublic) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Only SUPER_ADMIN can bypass maintenance mode for protected routes
    if (user && user.role === Role.SUPER_ADMIN) {
      return true;
    }

    throw new ServiceUnavailableException('La plateforme est en maintenance. Seul le Super Administrateur peut y accéder.');
  }
}
