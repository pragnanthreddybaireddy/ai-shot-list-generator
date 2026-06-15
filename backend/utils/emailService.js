const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

async function initTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Automatically generate a testing account if no credentials are provided
    logger.info('No SMTP credentials found, generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    logger.info('Ethereal test account generated successfully.');
  }
}

// Initialize on startup
initTransporter().catch(console.error);

async function sendPasswordResetEmail(toEmail, resetLink) {
  try {
    const senderEmail = process.env.SMTP_USER || 'noreply@digiquest.studio';
    const mailOptions = {
      from: `"Digiquest Studio" <${senderEmail}>`,
      to: toEmail,
      subject: 'Reset Your Password - Digiquest Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; border-radius: 8px; padding: 40px; text-align: center;">
          <h1 style="color: #00f0ff; letter-spacing: 2px;">DIGIQUEST STUDIO</h1>
          <h2 style="color: #e2e8f0; margin-top: 30px;">Password Reset Request</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.5; margin-top: 20px;">
            We received a request to reset the password for your Digiquest Studio account.
            If you didn't make this request, you can safely ignore this email.
          </p>
          <a href="${resetLink}" style="display: inline-block; background-color: #00f0ff; color: #000000; text-decoration: none; font-weight: bold; padding: 15px 30px; border-radius: 8px; margin-top: 30px; letter-spacing: 1px;">
            RESET PASSWORD NOW
          </a>
          <p style="color: #64748b; font-size: 12px; margin-top: 40px;">
            This link will expire in 15 minutes.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${toEmail}: ${info.messageId}`);
    
    // If we're using Ethereal, print the preview URL
    if (info.messageId && !process.env.SMTP_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`✉️ PREVIEW EMAIL HERE: ${previewUrl}`);
    }
    
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email. Please check your SMTP configuration.');
  }
}

module.exports = {
  sendPasswordResetEmail
};
