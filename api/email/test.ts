import nodemailer from 'nodemailer';

const DEFAULT_SMTP_USER = process.env.SMTP_USER || 'fokrulislammir9897@gmail.com';
const DEFAULT_SMTP_PASS = (process.env.SMTP_PASS || 'tqnt cqlj npjb zpal').replace(/\s+/g, '');
const DEFAULT_SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const DEFAULT_SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const DEFAULT_SENDER_NAME = process.env.SENDER_NAME || 'Probashi Business Club (PBC)';
const DEFAULT_SENDER_EMAIL = process.env.SENDER_EMAIL || DEFAULT_SMTP_USER;

function createTransporter(options?: any) {
  const host = options?.smtpHost || DEFAULT_SMTP_HOST;
  const port = options?.smtpPort ? Number(options.smtpPort) : DEFAULT_SMTP_PORT;
  const secure = options?.smtpSecure !== undefined ? Boolean(options.smtpSecure) : (port === 465);
  const user = options?.smtpUser || DEFAULT_SMTP_USER;
  const pass = (options?.smtpPass || DEFAULT_SMTP_PASS).replace(/\s+/g, '');

  if (!user || !pass) {
    throw new Error('SMTP user or password not configured.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { recipientEmail, config } = body;

    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid recipient email is required.' });
    }

    const transporter = createTransporter(config);
    const senderName = config?.senderName || DEFAULT_SENDER_NAME;
    const senderEmail = config?.senderEmail || config?.smtpUser || DEFAULT_SENDER_EMAIL;

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      subject: `[PBC Test] SMTP Configuration Verified`,
      text: `Hello,\n\nThis is a test email verifying that Probashi Business Club SMTP email system is operational.\nSent at: ${new Date().toISOString()}`
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: `Test email sent successfully to ${recipientEmail}!`
    });
  } catch (error: any) {
    console.error('Vercel Test Email Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to send test email.'
    });
  }
}
