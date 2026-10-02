import { Deposit, Member, SystemSettings } from '../types';
import { generateDepositReceiptPdfBase64 } from '../utils/receiptPdfGenerator';

export interface SmtpConfigParams {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  senderName?: string;
  senderEmail?: string;
}

/**
 * Sends a test email to verify SMTP configuration
 */
export async function sendTestEmailApi(
  recipientEmail: string,
  config?: SmtpConfigParams
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail,
        config
      })
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while contacting email service.'
    };
  }
}

/**
 * Sends automated Welcome Email upon member registration
 */
export async function sendWelcomeEmailApi(
  member: Partial<Member> & { fullName: string; email: string },
  settings?: Partial<SystemSettings>
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!member.email || !member.email.includes('@')) {
      return { success: false, error: 'Recipient has no valid email address.' };
    }

    const config: SmtpConfigParams = {
      smtpHost: settings?.smtpHost,
      smtpPort: settings?.smtpPort,
      smtpSecure: settings?.smtpSecure,
      smtpUser: settings?.smtpUser,
      smtpPass: settings?.smtpPass,
      senderName: settings?.senderName,
      senderEmail: settings?.senderEmail
    };

    const res = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member: {
          id: member.id || 'PBC-Applicant',
          fullName: member.fullName,
          email: member.email,
          phone: member.phone || '',
          country: member.country || '',
          city: member.city || ''
        },
        settings: {
          supportWhatsAppGroupLink: settings?.supportWhatsAppGroupLink,
          bkashNumber: settings?.bkashNumber,
          nagadNumber: settings?.nagadNumber,
          bankName: settings?.bankName,
          bankAccountName: settings?.bankAccountName,
          bankAccountNumber: settings?.bankAccountNumber,
          bankBranchName: settings?.bankBranchName,
          bankRoutingNumber: settings?.bankRoutingNumber,
          clubOfficeAddress: (settings as any)?.clubOfficeAddress
        },
        config
      })
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Welcome email dispatch notice:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Network error while dispatching welcome email.'
    };
  }
}

/**
 * Generates dynamic PDF receipt and sends automated confirmation email upon deposit approval
 */
export async function sendDepositReceiptEmailApi(
  deposit: Deposit,
  member?: Partial<Member>,
  settings?: Partial<SystemSettings>
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const recipientEmail = deposit.receiptUrl && deposit.receiptUrl.includes('@')
      ? deposit.receiptUrl
      : member?.email;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn('Deposit recipient has no valid email address for receipt dispatch.');
      return { success: false, error: 'Recipient has no valid email address.' };
    }

    // 1. Generate high-resolution official vector PDF receipt in base64
    let pdfBase64 = '';
    try {
      pdfBase64 = await generateDepositReceiptPdfBase64(deposit, member, settings);
    } catch (pdfErr) {
      console.warn('PDF generation notice:', pdfErr);
    }

    const config: SmtpConfigParams = {
      smtpHost: settings?.smtpHost,
      smtpPort: settings?.smtpPort,
      smtpSecure: settings?.smtpSecure,
      smtpUser: settings?.smtpUser,
      smtpPass: settings?.smtpPass,
      senderName: settings?.senderName,
      senderEmail: settings?.senderEmail
    };

    const filename = `PBC_Deposit_Receipt_${deposit.id}.pdf`;

    const res = await fetch('/api/email/deposit-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail,
        recipientName: deposit.memberName || member?.fullName || 'Valued Member',
        deposit,
        member: {
          id: deposit.memberId || member?.id,
          fullName: deposit.memberName || member?.fullName,
          phone: member?.phone,
          country: member?.country,
          city: member?.city,
          totalDeposit: member?.totalDeposit
        },
        settings: {
          supportWhatsAppGroupLink: settings?.supportWhatsAppGroupLink,
          shareUnitPrice: settings?.shareUnitPrice,
          clubOfficeAddress: (settings as any)?.clubOfficeAddress
        },
        pdfBase64,
        filename,
        config
      })
    });

    return await res.json();
  } catch (err: any) {
    console.warn('Deposit receipt email dispatch notice:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Network error while dispatching deposit receipt email.'
    };
  }
}
