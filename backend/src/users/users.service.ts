import { Injectable, OnModuleInit, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Role } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    try {
      const superAdminExists = await this.userModel.findOne({ role: Role.SUPER_ADMIN }).exec();
      if (!superAdminExists) {
        const passwordHashSA = await bcrypt.hash('superadmin123', 10);
        await this.userModel.create({
          name: 'Super Administrateur',
          email: 'superadmin@mbc-suarl.com',
          passwordHash: passwordHashSA,
          role: Role.SUPER_ADMIN,
        });
        
        const passwordHashA = await bcrypt.hash('admin123', 10);
        await this.userModel.create({
          name: 'Administrateur',
          email: 'admin@mbc-suarl.com',
          passwordHash: passwordHashA,
          role: Role.ADMIN,
        });

        const passwordHashU = await bcrypt.hash('user123', 10);
        await this.userModel.create({
          name: 'Client Utilisateur',
          email: 'user@mbc-suarl.com',
          passwordHash: passwordHashU,
          role: Role.USER,
        });
        this.logger.log('Default accounts created (Super Admin, Admin, User).');
      }
    } catch (error) {
      this.logger.error('Failed to create default accounts', error);
    }
  }

  async create(createUserDto: any): Promise<UserDocument> {
    const emailNormalized = createUserDto.email ? createUserDto.email.trim().toLowerCase() : '';
    if (!emailNormalized) {
      throw new HttpException('L\'adresse email est requise.', HttpStatus.BAD_REQUEST);
    }
    const existingUser = await this.userModel.findOne({ email: emailNormalized }).exec();
    if (existingUser) {
      throw new HttpException('Cet email est déjà utilisé.', HttpStatus.BAD_REQUEST);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);
    
    const createdUser = new this.userModel({
      name: createUserDto.name,
      email: emailNormalized,
      passwordHash,
      role: createUserDto.role || Role.USER,
      phone: createUserDto.phone,
      address: createUserDto.address,
      avatarUrl: createUserDto.avatarUrl,
    });
    return createdUser.save();
  }

  async findOne(email: string): Promise<UserDocument | null> {
    const emailNormalized = email ? email.trim().toLowerCase() : '';
    return this.userModel.findOne({ email: emailNormalized }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRole(id: string, role: Role): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
      return this.userModel.find().exec();
  }

  async updateByEmail(email: string, updateData: any): Promise<UserDocument | null> {
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }
    const emailNormalized = email ? email.trim().toLowerCase() : '';
    return this.userModel.findOneAndUpdate({ email: emailNormalized }, updateData, { new: true }).exec();
  }

  async changePassword(userId: string, oldPass: string, newPass: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isMatch) throw new Error('Invalid current password');

    const passwordHash = await bcrypt.hash(newPass, 10);
    return this.userModel.findByIdAndUpdate(userId, { passwordHash }, { new: true }).exec();
  }
  async generate2FASecret(userId: string): Promise<{ secret: string; otpauthUrl: string; qrCodeDataUrl: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Makhamaat Platform', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Temp save secret (not enabled yet)
    await this.userModel.findByIdAndUpdate(userId, { twoFactorSecret: secret }).exec();

    return { secret, otpauthUrl, qrCodeDataUrl };
  }

  async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.twoFactorSecret) return false;

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (isValid) {
      await this.userModel.findByIdAndUpdate(userId, { isTwoFactorEnabled: true }).exec();
    }

    return isValid;
  }

  async disable2FA(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, {
      isTwoFactorEnabled: false,
      twoFactorSecret: null,
    }, { new: true }).exec();
  }
}
