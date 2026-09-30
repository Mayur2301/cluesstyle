// PATH: app/lib/emailService.ts
import nodemailer from 'nodemailer';
// Was creating its own separate `mysql.createPool()` here, on top of the
// shared pool in app/lib/db.ts — every module that did this opened its own
// extra 10-connection pool, and all of them together were a major
// contributor to "Too many connections" against MySQL. Use the one shared
// pool instead, same as every other module in the app.
import { getPool } from './db';

const pool = getPool();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class EmailOTPService {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(email: string, name: string = '', userType: string = ''): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Store OTP in web_users table
      await pool.execute(
        `UPDATE web_users SET otp_code = ?, otp_expires_at = ? WHERE email = ?`,
        [otp, expiresAt, email]
      );

      // If email doesn't exist, insert temporary record
      const [existing] = await pool.execute(`SELECT id FROM web_users WHERE email = ?`, [email]);
      if ((existing as any[]).length === 0) {
        await pool.execute(
          `INSERT INTO web_users (name, email, otp_code, otp_expires_at, account_type) VALUES (?, ?, ?, ?, ?)`,
          [name, email, otp, expiresAt, userType]
        );
      }

      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Email Verification - CluesStyle</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; color: white; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { background: #fff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; border: 2px dashed #667eea; }
            .otp-code h2 { font-size: 36px; letter-spacing: 5px; color: #667eea; margin: 0; font-family: monospace; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CluesStyle</h1>
              <p style="color: white;">Email Verification</p>
            </div>
            <div class="content">
              <h2>Hello${name ? ' ' + name : '!'}</h2>
              <p>Your verification code is:</p>
              <div class="otp-code">
                <h2>${otp}</h2>
              </div>
              <p>This code is valid for <strong>10 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CluesStyle. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"CluesStyle" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification - CluesStyle',
        html: htmlTemplate,
      });

      console.log(`OTP sent to ${email}: ${otp}`);
      return { success: true, message: 'OTP sent to your email' };
    } catch (error) {
      console.error('Send email OTP error:', error);
      return { success: false, message: 'Failed to send OTP email' };
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string; name?: string; userType?: string }> {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM web_users 
         WHERE email = ? AND otp_code = ? AND otp_expires_at > NOW()`,
        [email, otp]
      );

      const users = rows as any[];

      if (users.length === 0) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      const user = users[0];

      // Mark email as verified
      await pool.execute(
        `UPDATE web_users SET email_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE email = ?`,
        [email]
      );

      return { 
        success: true, 
        message: 'Email verified successfully',
        name: user.name,
        userType: user.account_type
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
}