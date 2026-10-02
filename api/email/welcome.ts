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
    const { member, settings, config } = body;

    if (!member || !member.email) {
      return res.status(400).json({ success: false, error: 'Member profile with email is required.' });
    }

    const transporter = createTransporter(config);
    const senderName = config?.senderName || DEFAULT_SENDER_NAME;
    const senderEmail = config?.senderEmail || config?.smtpUser || DEFAULT_SENDER_EMAIL;

    const waLink = settings?.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/PBC-Official-Club';
    const memberId = member.id || 'PBC-Applicant';
    const memberName = member.fullName || 'সম্মানিত সদস্য';

    const welcomeHtml = `
      <div style="background-color: #070D1B; padding: 30px 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0C182F; border: 2px solid #D4AF37; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="background: linear-gradient(135deg, #070D1B 0%, #112244 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #D4AF37;">
            <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
              PROBASHI <span style="color: #F59E0B;">BUSINESS CLUB</span>
            </h1>
            <p style="margin: 5px 0 0 0; color: #D4AF37; font-size: 13px; font-weight: 600; letter-spacing: 1px;">
              ঐক্য, আস্থা ও প্রবাসীদের সমৃদ্ধির প্ল্যাটফর্ম
            </p>
          </div>

          <div style="padding: 30px 25px;">
            <h2 style="color: #F59E0B; margin-top: 0; font-size: 18px;">
              অভিনন্দন ও শুভস্বাগতম, ${memberName}! 🎉
            </h2>
            <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">
              প্রবাসী বিজনেস ক্লাবে আপনার সদস্যপদ নিবন্ধন আবেদনটি সফলভাবে গৃহীত হয়েছে। ক্লাবের সম্মানিত সদস্যদের পরিবারে আপনাকে পেয়ে আমরা আনন্দিত ও গর্বিত।
            </p>

            <div style="background-color: #070D1B; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 12px; padding: 18px; margin: 25px 0;">
              <h3 style="color: #34D399; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                আপনার মেম্বারশিপ সারসংক্ষেপ:
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #E2E8F0;">
                <tr>
                  <td style="padding: 5px 0; color: #94A3B8; width: 40%;">সদস্যের নাম:</td>
                  <td style="padding: 5px 0; font-weight: bold; color: #FFFFFF;">${memberName}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #94A3B8;">মেম্বার আইডি:</td>
                  <td style="padding: 5px 0; font-weight: bold; font-family: monospace; color: #F59E0B;">${memberId}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #94A3B8;">ইমেইল:</td>
                  <td style="padding: 5px 0; color: #CBD5E1;">${member.email}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #94A3B8;">ফোন/মোবাইল:</td>
                  <td style="padding: 5px 0; color: #CBD5E1;">${member.phone || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0 15px 0;">
              <a href="${waLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);">
                💬 অফিসিয়াল WhatsApp গ্রুপে যুক্ত হোন
              </a>
            </div>
          </div>

          <div style="background-color: #070D1B; padding: 20px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.25); font-size: 11.5px; color: #64748B; line-height: 1.6;">
            <p style="margin: 0 0 5px 0; color: #94A3B8;">
              <strong>প্রবাসী বিজনেস ক্লাব (Probashi Business Club - PBC)</strong>
            </p>
            <p style="margin: 0; font-size: 10.5px;">
              অফিসিয়াল ঠিকানা: ${settings?.clubOfficeAddress || 'লেভেল ৪, গুলশান এভিনিউ, ঢাকা, বাংলাদেশ'}
            </p>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: member.email,
      subject: `প্রবাসী বিজনেস ক্লাবে (PBC) স্বাগতম! [সদস্য আইডি: ${memberId}]`,
      html: welcomeHtml
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Welcome email sent successfully!'
    });
  } catch (error: any) {
    console.error('Vercel Welcome Email Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to send welcome email.'
    });
  }
}
