import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MailService } from './mail/mail.service';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
  private resetOtpCache: Map<string, { code: string; expiresAt: number }> = new Map();
  private maintenanceMode: boolean = false;

  constructor(
    @InjectConnection() private connection: Connection,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async requestResetOtp(email: string, role: string, passwordAttempt: string): Promise<{ success: boolean; message: string; emailSent?: boolean; otpFallback?: string }> {
    if (role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Seul un Super Administrateur peut réinitialiser la plateforme.');
    }
    if (!passwordAttempt) {
      throw new BadRequestException('Le mot de passe est requis.');
    }

    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const isPasswordValid = await bcrypt.compare(passwordAttempt, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEV] Platform Reset OTP for ${email}: ${otp}`);
    this.resetOtpCache.set(email, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const emailSent = await this.mailService.sendResetOtpEmail(email, otp);
    
    // Return success even if email fails to allow dev fallback via otpFallback
    return { 
      success: true, 
      emailSent,
      otpFallback: otp,
      message: emailSent 
        ? 'Un code OTP a été envoyé à votre adresse email.' 
        : "L'envoi par email a échoué (problème SMTP local). Utilisez le code de secours affiché sur votre écran."
    };
  }

  async resetPlatform(email: string, role: string, otp: string): Promise<{ success: boolean; message: string }> {
    if (role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Seul un Super Administrateur peut réinitialiser la plateforme.');
    }

    const cachedOtp = this.resetOtpCache.get(email);
    if (!cachedOtp) {
      throw new BadRequestException('Aucun code OTP demandé ou code expiré.');
    }
    if (Date.now() > cachedOtp.expiresAt) {
      this.resetOtpCache.delete(email);
      throw new BadRequestException('Le code OTP a expiré.');
    }
    if (cachedOtp.code !== otp) {
      throw new BadRequestException('Le code OTP est invalide.');
    }

    try {
      await this.connection.db.collection('products').deleteMany({});
      await this.connection.db.collection('activities').deleteMany({});
      await this.connection.db.collection('actors').deleteMany({});
      await this.connection.db.collection('messages').deleteMany({});
      
      this.resetOtpCache.delete(email);
      return { success: true, message: 'La plateforme a été réinitialisée avec succès.' };
    } catch (error) {
      console.error('Error during platform reset:', error);
      throw new Error('Failed to reset platform');
    }
  }

  isMaintenance(): boolean {
    return this.maintenanceMode;
  }

  setMaintenance(status: boolean): boolean {
    this.maintenanceMode = status;
    return this.maintenanceMode;
  }

  async getPlatformBackup(): Promise<string> {
    const users = await this.connection.db.collection('users').find({}).toArray();
    const products = await this.connection.db.collection('products').find({}).toArray();
    const activities = await this.connection.db.collection('activities').find({}).toArray();
    const actors = await this.connection.db.collection('actors').find({}).toArray();
    const messages = await this.connection.db.collection('messages').find({}).toArray();

    let sql = `-- ==========================================\n`;
    sql += `-- SAUVEGARDE INTÉGRALE PLATEFORME MBC-SUARL\n`;
    sql += `-- Générée le : ${new Date().toLocaleString('fr-FR')}\n`;
    sql += `-- Format : SQL EXPLICITE (v1.1)\n`;
    sql += `-- ==========================================\n\n`;

    const formatValue = (val: any) => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      if (typeof val === 'number' || typeof val === 'boolean') return val;
      if (val instanceof Date) return `'${val.toISOString()}'`;
      // Handle MongoDB ObjectIDs
      if (typeof val === 'object' && val._bsontype === 'ObjectID') return `'${val.toString()}'`;
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    const generateInserts = (collectionName: string, docs: any[]) => {
      if (docs.length === 0) return `-- COLLECTION: ${collectionName.toUpperCase()} (AUCUNE DONNÉE)\n\n`;
      let output = `-- ------------------------------------------\n`;
      output += `-- TABLE: ${collectionName.toUpperCase()}\n`;
      output += `-- ------------------------------------------\n`;
      docs.forEach(doc => {
        const columns = Object.keys(doc);
        const values = columns.map(col => formatValue(doc[col]));
        output += `INSERT INTO ${collectionName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      });
      return output + '\n';
    };

    sql += generateInserts('users', users);
    sql += generateInserts('products', products);
    sql += generateInserts('activities', activities);
    sql += generateInserts('actors', actors);
    sql += generateInserts('messages', messages);

    return sql;
  }
  
  async rotateMasterKeys(role: string): Promise<{ success: boolean; message: string }> {
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Seul un administrateur peut effectuer cette action.');
    }

    try {
      const newSecret = crypto.randomBytes(32).toString('hex');
      const envPath = path.resolve(process.cwd(), '.env');
      
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        const jwtSecretRegex = /^JWT_SECRET=.*$/m;
        
        if (jwtSecretRegex.test(envContent)) {
          envContent = envContent.replace(jwtSecretRegex, `JWT_SECRET=${newSecret}`);
        } else {
          envContent += `\nJWT_SECRET=${newSecret}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        // Force update in current process memory too
        process.env.JWT_SECRET = newSecret;
        
        return { 
          success: true, 
          message: 'Les clés maîtres ont été rotatées avec succès. Le système va maintenant invalider toutes les sessions existantes.' 
        };
      } else {
        throw new Error("Fichier .env introuvable.");
      }
    } catch (error) {
      console.error('Error during key rotation:', error);
      throw new Error('Échec de la rotation des clés.');
    }
  }

}
