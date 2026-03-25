import nodemailer from 'nodemailer';
import Setting from '../models/Setting.js';

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const smtpSetting = await Setting.findOne({ key: 'smtp_config' });
    
    if (!smtpSetting || !smtpSetting.value) {
      console.warn('⚠️ SMTP settings not found in database. Email will not be sent.');
      return { success: false, message: 'SMTP not configured' };
    }

    const config = smtpSetting.value;

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port),
      secure: parseInt(config.port) === 465, // True for 465, False for 587
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${config.fromName || 'Hinguland'}" <${config.fromEmail || config.user}>`,
      to: to || config.toEmail || config.user, // Fallback to user email if toEmail is missing
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, message: error.message };
  }
};
