import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      'FindYourTeacher <onboarding@resend.dev>';
    this.frontendUrl =
      this.configService.getOrThrow<string>('FRONTEND_URL');
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    locale: string = 'fr',
  ): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/${locale}/auth/verify-email?token=${token}`;

    const subject =
      locale === 'fr'
        ? 'Vérifiez votre adresse e-mail'
        : 'Verify your email address';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">${locale === 'fr' ? 'Bienvenue sur FindYourTeacher !' : 'Welcome to FindYourTeacher!'}</h2>
        <p>${locale === 'fr' ? 'Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail :' : 'Click the button below to verify your email address:'}</p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          ${locale === 'fr' ? 'Vérifier mon e-mail' : 'Verify my email'}
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          ${locale === 'fr' ? 'Ce lien expire dans 24 heures.' : 'This link expires in 24 hours.'}
        </p>
        <p style="color: #9ca3af; font-size: 12px;">
          ${locale === 'fr' ? "Si vous n'avez pas créé de compte, ignorez cet e-mail." : "If you didn't create an account, please ignore this email."}
        </p>
      </div>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }
}
