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
    const { recipientEmail, recipientName, deposit, member, settings, pdfBase64, filename, config } = body;

    if (!recipientEmail || !deposit) {
      return res.status(400).json({ success: false, error: 'Recipient email and deposit data are required.' });
    }

    const transporter = createTransporter(config);
    const senderName = config?.senderName || DEFAULT_SENDER_NAME;
    const senderEmail = config?.senderEmail || config?.smtpUser || DEFAULT_SENDER_EMAIL;

    const memberDisplayName = recipientName || deposit.memberName || member?.fullName || 'সম্মানিত সদস্য';
    const amountFormatted = Number(deposit.amount || 0).toLocaleString('en-IN');
    const sharePrice = deposit.shareUnitPrice || settings?.shareUnitPrice || 5000;
    const shareCount = deposit.shareCount || Math.max(1, Math.round(deposit.amount / sharePrice));
    const receiptNo = `RCP-${deposit.id.replace('DEP-', '')}-${(deposit.depositDate || '').replace(/-/g, '')}`;
    const adminName = deposit.approvedByAdminName || 'Super Admin';
    const waLink = settings?.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/PBC-Official-Club';

    const receiptHtml = `
      <div style="background-color: #070D1B; padding: 30px 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #0C182F; border: 2px solid #D4AF37; border-radius: 18px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #070D1B 0%, #102040 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #D4AF37;">
            <div style="display: inline-block; width: 64px; height: 64px; border-radius: 50%; background: rgba(52, 211, 153, 0.15); border: 2px solid #34D399; line-height: 64px; font-size: 28px; margin-bottom: 10px;">
              ✓
            </div>
            <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
              PROBASHI <span style="color: #F59E0B;">BUSINESS CLUB</span>
            </h1>
            <p style="margin: 6px 0 0 0; color: #34D399; font-size: 13px; font-weight: bold; letter-spacing: 1.5px;">
              ★ ডিপোজিট ভাউচার সফলভাবে অনুমোদিত হয়েছে ★
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 30px 25px;">
            <p style="font-size: 16px; color: #F59E0B; font-weight: bold; margin-top: 0;">
              আসসালামু আলাইকুম, ${memberDisplayName} ভাই!
            </p>
            <p style="color: #CBD5E1; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
              আলহামদুলিল্লাহ! প্রবাসী বিজনেস ক্লাবে আপনার জমাকৃত ডিপোজিট অডিট নিরীক্ষা শেষে ক্লাবের হিসাব শাখায় সফলভাবে অনুমোদিত ও পোর্টফোলিওতে ক্রেডিট করা হয়েছে।
            </p>

            <!-- Prominent Amount Display -->
            <div style="background: linear-gradient(135deg, #0B1933 0%, #152C59 100%); border: 2px solid #F59E0B; border-radius: 14px; padding: 22px; text-align: center; margin: 25px 0;">
              <span style="color: #94A3B8; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">
                TOTAL APPROVED & CREDITED AMOUNT
              </span>
              <span style="color: #FCD34D; font-size: 32px; font-weight: 900; letter-spacing: 1px; display: block; font-family: 'Segoe UI', Tahoma, sans-serif;">
                ৳${amountFormatted} BDT
              </span>
              <span style="display: inline-block; background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); color: #34D399; font-size: 11px; font-weight: bold; padding: 3px 12px; border-radius: 20px; margin-top: 10px;">
                +${shareCount} টি শেয়ার ইউনিট অর্জিত
              </span>
            </div>

            <!-- Receipt Breakdown Table -->
            <div style="background-color: #070D1B; border: 1.5px solid rgba(212, 175, 55, 0.4); border-radius: 14px; padding: 20px; margin: 25px 0;">
              <div style="border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #F59E0B; font-weight: bold; font-size: 12.5px; text-transform: uppercase; letter-spacing: 1px;">লেনদেন ও রসিদ তথ্য</span>
                <span style="font-family: monospace; color: #CBD5E1; font-size: 11px;">${receiptNo}</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #E2E8F0;">
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8; width: 42%;">সদস্যের নাম:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #FFFFFF;">${memberDisplayName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">সদস্য আইডি:</td>
                  <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #FCD34D;">${deposit.memberId || member?.id || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">পেমেন্ট মেথড:</td>
                  <td style="padding: 6px 0; color: #FFFFFF;">${deposit.paymentMethod || 'Bank'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">TrxID / রেফারেন্স:</td>
                  <td style="padding: 6px 0; font-family: monospace; color: #FCD34D; font-weight: bold;">${deposit.referenceNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">জমার তারিখ:</td>
                  <td style="padding: 6px 0; color: #CBD5E1;">${deposit.depositDate || new Date().toISOString().split('T')[0]}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">অনুমোদনকারী কর্মকর্তা:</td>
                  <td style="padding: 6px 0; color: #34D399; font-weight: bold;">${adminName} (Audit Cleared)</td>
                </tr>
              </table>
            </div>

            <!-- PDF Attachment Callout -->
            <div style="background-color: #061A14; border: 1.5px solid #10B981; border-radius: 14px; padding: 18px; margin: 25px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 40px; vertical-align: top; font-size: 24px;">📎</td>
                  <td style="vertical-align: top;">
                    <h4 style="margin: 0 0 5px 0; color: #34D399; font-size: 13.5px; font-weight: bold;">
                      অফিসিয়াল PDF মানি রসিদ সংযুক্ত রয়েছে!
                    </h4>
                    <p style="margin: 0; font-size: 12px; color: #A7F3D0; line-height: 1.5;">
                      এই ইমেইলের সাথে ক্লাবের সিলমোহর ও অডিট স্বাক্ষরযুক্ত <strong>${filename || 'PBC_Deposit_Receipt.pdf'}</strong> ফাইলটি Attachment হিসেবে যুক্ত করা হয়েছে। আপনি ভবিষ্যতে যেকোনো প্রমাণের জন্য এটি সংরক্ষণ বা প্রিন্ট করতে পারবেন।
                    </p>
                  </td>
                </tr>
              </table>
            </div>

            <!-- WhatsApp Action Button -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="${waLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 13.5px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);">
                💬 অফিসিয়াল WhatsApp হেল্পডেস্ক
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #070D1B; padding: 20px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.25); font-size: 11px; color: #64748B; line-height: 1.6;">
            <p style="margin: 0 0 4px 0; color: #94A3B8;">
              <strong>প্রবাসী বিজনেস ক্লাব (Probashi Business Club - PBC)</strong>
            </p>
            <p style="margin: 0; font-size: 10px;">
              অফিসিয়াল ঠিকানা: ${settings?.clubOfficeAddress || 'লেভেল ৪, গুলশান এভিনিউ, ঢাকা, বাংলাদেশ'}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 9.5px; color: #475569;">
              এই কম্পিউটার রসিদটি PBC অ্যাপ দ্বারা জেনারেট করা হয়েছে। এটি বৈধ আর্থিক স্বীকৃতি দলিল।
            </p>
          </div>
        </div>
      </div>
    `;

    // Process attachments
    const mailAttachments: any[] = [];
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      try {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        mailAttachments.push({
          filename: filename || `PBC_Receipt_${deposit.id}.pdf`,
          content: Buffer.from(cleanBase64, 'base64'),
          contentType: 'application/pdf'
        });
      } catch (attErr) {
        console.warn('PDF attachment buffer conversion error:', attErr);
      }
    }

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      subject: `[অনুমোদিত রসিদ] ৳${amountFormatted} BDT ডিপোজিট কনফার্মেশন ও অফিসিয়াল ভাউচার - PBC Club`,
      html: receiptHtml,
      attachments: mailAttachments
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Deposit receipt email dispatched successfully with PDF attachment!'
    });
  } catch (error: any) {
    console.error('Vercel Deposit Receipt Email Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to dispatch deposit receipt email.'
    });
  }
}
