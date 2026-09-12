import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (env.SMTP_HOST) {
      const transportConfig = {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
      };
      if (env.SMTP_USER && env.SMTP_PASS) {
        transportConfig.auth = {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        };
      }
      transporter = nodemailer.createTransport(transportConfig);
    } else {
      // In development or test without live SMTP credentials, log to console
      transporter = {
        sendMail: async (mailOptions) => {
          if (env.NODE_ENV !== 'test') {
            console.log(`[MAILER DEV MOCK] To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
            console.log(`[MAILER DEV MOCK] Body: ${mailOptions.text || mailOptions.html}`);
          }
          return { messageId: 'mock-mail-id' };
        },
      };
    }
  }
  return transporter;
};

export const sendOtpEmail = async (email, otpCode) => {
  const mail = getTransporter();
  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'ToyxonaHub - Your Email Verification OTP',
    text: `Your verification code is: ${otpCode}. It will expire in ${env.OTP_EXPIRES_MINUTES} minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>ToyxonaHub Verification Code</h2>
        <p>Your one-time email verification code is:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">
          ${otpCode}
        </div>
        <p>This code will expire in <strong>${env.OTP_EXPIRES_MINUTES} minutes</strong>.</p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  return mail.sendMail(mailOptions);
};
