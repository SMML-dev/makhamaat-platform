import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private passwordResetCache: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user._id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, phone: user.phone, address: user.address, createdAt: (user as any).createdAt }
    };
  }

  async signUp(createUserDto: any): Promise<any> {
    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user._id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, phone: user.phone, address: user.address, createdAt: (user as any).createdAt }
    };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      // For security, don't reveal if user exists, but here we can be helpful or silent.
      // Usually, silence is better, but for this platform let's be helpful.
      throw new NotFoundException('Aucun utilisateur trouvé avec cet e-mail.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.passwordResetCache.set(email, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const emailSent = await this.mailService.sendPasswordResetEmail(email, otp);
    if (!emailSent) {
      throw new BadRequestException("Échec de l'envoi de l'e-mail de récupération.");
    }

    return { success: true, message: 'Un code de récupération a été envoyé par e-mail.' };
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const cachedOtp = this.passwordResetCache.get(email);
    
    if (!cachedOtp) {
      throw new BadRequestException('Aucune demande de récupération en cours.');
    }

    if (Date.now() > cachedOtp.expiresAt) {
      this.passwordResetCache.delete(email);
      throw new BadRequestException('Le code de récupération a expiré.');
    }

    if (cachedOtp.code !== otp) {
      throw new BadRequestException('Le code de récupération est invalide.');
    }

    // Update password
    await this.usersService.updateByEmail(email, { password: newPassword });
    
    // Clear cache
    this.passwordResetCache.delete(email);

    return { success: true, message: 'Votre mot de passe a été réinitialisé avec succès.' };
  }
}
