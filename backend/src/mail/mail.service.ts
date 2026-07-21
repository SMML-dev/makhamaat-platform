import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Prioritize LWS SMTP from environment variables
      const host = process.env.SMTP_HOST || 'mail.mbc-suarl.com';
      const port = parseInt(process.env.SMTP_PORT || '465');
      const user = process.env.SMTP_USER || 'contact@mbc-suarl.com';
      const pass = process.env.SMTP_PASS;

      if (pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465, // SSL for 465, STARTTLS for 587
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        this.logger.log(`MailService initialized with SMTP (${host}:${port}). Mode: ${port === 465 ? 'SSL' : 'STARTTLS'}`);
      } else {
        this.transporter = undefined;
        this.logger.warn('MailService not initialized: no SMTP_PASS environment variable found.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Nodemailer', error);
    }
  }

  async sendResetOtpEmail(userEmail: string, otp: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send OTP email to ${userEmail}: mail transport not configured.`);
      return false;
    }

    try {
      this.logger.log(`Sending Platform Reset OTP to ${userEmail}...`);
      
      const info = await this.transporter.sendMail({
        from: '"Makhamaat Security" <contact@mbc-suarl.com>',
        to: userEmail,
        subject: '⚠️ Code OTP pour Réinitialisation de la Plateforme',
        text: `Voici votre code OTP pour réinitialiser la plateforme : ${otp}\n\nSi vous n'avez pas demandé cette action, ignorez ce message.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #d9534f;">⚠️ Alerte de Sécurité</h2>
            <p>Une demande de <strong>réinitialisation complète (Factory Reset)</strong> a été initiée pour votre plateforme Makhamaat.</p>
            <p>Pour confirmer cette action, veuillez utiliser le code OTP suivant :</p>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #6c757d; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
          </div>
        `,
      });

      this.logger.log(`OTP E-mail sent successfully to ${userEmail}.`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${userEmail}: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendPasswordResetEmail(userEmail: string, otp: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send password reset email to ${userEmail}: mail transport not configured.`);
      return false;
    }

    try {
      this.logger.log(`Sending Password Reset OTP to ${userEmail}...`);
      
      const info = await this.transporter.sendMail({
        from: '"Makhamaat Security" <contact@mbc-suarl.com>',
        to: userEmail,
        subject: '🔐 Code de Récupération de Mot de Passe',
        text: `Votre code de récupération de mot de passe est : ${otp}\n\nSi vous n'êtes pas à l'origine de cette demande, veuillez sécuriser votre compte.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 20px; max-width: 500px; margin: 0 auto; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0d3b2e; margin: 0; font-size: 24px;">MAKHAMAAT</h1>
              <p style="color: #888; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Sécurité du compte</p>
            </div>
            <h2 style="color: #2e7d32; text-align: center; font-size: 20px;">Récupération de mot de passe</h2>
            <p style="color: #555; text-align: center; line-height: 1.6;">Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code confidentiel suivant pour procéder :</p>
            <div style="background-color: #f1f8e9; padding: 20px; text-align: center; border-radius: 15px; font-size: 32px; letter-spacing: 8px; font-weight: 900; color: #2e7d32; margin: 30px 0; border: 1px dashed #c5e1a5;">
              ${otp}
            </div>
            <p style="color: #999; font-size: 11px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
              Ce code est valable pendant 10 minutes. Si vous n'avez pas demandé ce code, ignorez simplement cet e-mail ou contactez notre support technique.
            </p>
          </div>
        `,
      });

      this.logger.log(`Password reset E-mail sent successfully to ${userEmail}.`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      return false;
    }
  }

  async sendContactNotification(contactData: { sender: string; email: string; subject: string; content: string }): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Cannot send contact notification: mail transport not configured.');
      return false;
    }

    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'contact@mbc-suarl.com';
      this.logger.log(`Sending Contact Notification to ${adminEmail}...`);

      await this.transporter.sendMail({
        from: '"Makhamaat Platform" <contact@mbc-suarl.com>',
        to: adminEmail,
        subject: `📬 Nouveau Message : ${contactData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 20px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2e7d32; padding-bottom: 20px;">
              <h1 style="color: #0d3b2e; margin: 0; font-size: 24px;">MAKHAMAAT BUSINESS CORP</h1>
              <p style="color: #2e7d32; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Notification de Contact</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="margin: 5px 0;"><strong style="color: #2e7d32;">Expéditeur :</strong> ${contactData.sender}</p>
              <p style="margin: 5px 0;"><strong style="color: #2e7d32;">Email :</strong> ${contactData.email}</p>
              <p style="margin: 5px 0;"><strong style="color: #2e7d32;">Sujet :</strong> ${contactData.subject}</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 15px; border-left: 5px solid #2e7d32; margin: 20px 0;">
              <p style="color: #444; line-height: 1.6; white-space: pre-wrap;">${contactData.content}</p>
            </div>

            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Ce message a été envoyé via le formulaire de contact de votre plateforme.
              <br/>Vous pouvez répondre directement à l'expéditeur en utilisant son adresse email ci-dessus.
            </p>
          </div>
        `,
      });

      this.logger.log('Contact notification e-mail sent successfully.');
      return true;
    } catch (error) {
      this.logger.error('Failed to send contact notification email', error);
      return false;
    }
  }
}
