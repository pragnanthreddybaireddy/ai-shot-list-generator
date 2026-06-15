const logger = require('./logger');

async function sendPasswordResetEmail(toEmail, resetLink) {
  try {
    const senderEmail = process.env.SMTP_USER || 'noreply@digiquest.studio';
    const apiKey = process.env.BREVO_API_KEY;

    // Fallback if no API key is provided so we don't crash the server
    if (!apiKey) {
      logger.info(`[MOCK EMAIL] Password reset email would have been sent to ${toEmail}. Link: ${resetLink}`);
      logger.info('To send real emails, please configure BREVO_API_KEY in Render.');
      return true; 
    }

    const payload = {
      sender: { name: "Digiquest Studio", email: senderEmail },
      to: [{ email: toEmail }],
      subject: 'Reset Your Password - Digiquest Studio',
      htmlContent: `
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

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Brevo API Error: ${errorData}`);
    }

    logger.info(`Password reset email sent to ${toEmail} via Brevo HTTP API`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email. Please check your Brevo configuration.');
  }
}

module.exports = {
  sendPasswordResetEmail
};
