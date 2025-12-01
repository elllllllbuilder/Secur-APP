import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração do transporter (use suas credenciais SMTP)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendExpirationWarning(
    email: string,
    name: string,
    planName: string,
    daysRemaining: number,
    expirationDate: Date,
  ) {
    const subject = `⚠️ Seu plano ${planName} expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #00a9ff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #00a9ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Aviso de Vencimento</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${name}</strong>!</p>
            
            <div class="warning">
              <strong>⚠️ Atenção!</strong><br>
              Seu plano <strong>${planName}</strong> expira em <strong>${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}</strong>.
            </div>
            
            <p><strong>Data de expiração:</strong> ${expirationDate.toLocaleDateString('pt-BR')}</p>
            
            <p>Para continuar aproveitando todos os benefícios, renove sua assinatura antes do vencimento.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://app.secur.com.br'}/associate" class="button">
              Renovar Agora
            </a>
            
            <p>Se você já renovou, desconsidere este aviso.</p>
            
            <p>Qualquer dúvida, estamos à disposição!</p>
            
            <p>Atenciosamente,<br><strong>Equipe Secur APP</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Secur APP" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
      
      this.logger.log(`Email de aviso enviado para ${email} (${daysRemaining} dias)`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${email}:`, error);
    }
  }

  async sendExpirationNotice(
    email: string,
    name: string,
    planName: string,
    expirationDate: Date,
  ) {
    const subject = `❌ Seu plano ${planName} expirou`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #00a9ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Plano Expirado</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${name}</strong>!</p>
            
            <div class="alert">
              <strong>Seu plano ${planName} expirou em ${expirationDate.toLocaleDateString('pt-BR')}</strong>
            </div>
            
            <p>Seu acesso aos benefícios foi suspenso. Para reativar sua assinatura, faça uma nova contratação.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://app.secur.com.br'}/associate" class="button">
              Renovar Agora
            </a>
            
            <p>Sentiremos sua falta! Esperamos vê-lo de volta em breve.</p>
            
            <p>Atenciosamente,<br><strong>Equipe Secur APP</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Secur APP" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
      
      this.logger.log(`Email de expiração enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${email}:`, error);
    }
  }

  async sendPaymentConfirmation(
    email: string,
    name: string,
    planName: string,
    amount: number,
    expirationDate: Date,
  ) {
    const subject = `✅ Pagamento confirmado - Plano ${planName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .info { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pagamento Confirmado!</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${name}</strong>!</p>
            
            <div class="success">
              <strong>Seu pagamento foi aprovado com sucesso!</strong>
            </div>
            
            <div class="info">
              <p><strong>Plano:</strong> ${planName}</p>
              <p><strong>Valor:</strong> R$ ${(amount / 100).toFixed(2)}</p>
              <p><strong>Válido até:</strong> ${expirationDate.toLocaleDateString('pt-BR')}</p>
            </div>
            
            <p>Agora você tem acesso a todos os benefícios do seu plano!</p>
            
            <p>Aproveite e explore todas as funcionalidades disponíveis.</p>
            
            <p>Atenciosamente,<br><strong>Equipe Secur APP</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Secur APP" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
      
      this.logger.log(`Email de confirmação enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${email}:`, error);
    }
  }
}
