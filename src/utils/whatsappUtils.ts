import { Deposit, Member, SystemSettings } from '../types';

/**
 * Normalizes phone numbers to clean international format suitable for WhatsApp wa.me links
 * e.g., "01712-345678" -> "8801712345678"
 * "+880 1812-345678" -> "8801812345678"
 * "+971 50 123 4567" -> "971501234567"
 */
export function cleanPhoneForWhatsApp(rawPhone?: string): string {
  if (!rawPhone) return '';
  // Strip all non-digit characters
  let digits = rawPhone.replace(/\D/g, '');

  if (!digits) return '';

  // Handle leading 00 (e.g. 008801... -> 8801...)
  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }

  // Handle Bangladeshi national 11-digit numbers (013, 014, 015, 016, 017, 018, 019)
  if (digits.length === 11 && digits.startsWith('01')) {
    digits = '88' + digits;
  } else if (digits.length === 10 && digits.startsWith('1')) {
    // Sometimes entered without leading 0 in BD (e.g. 1712345678)
    digits = '880' + digits;
  }

  return digits;
}

/**
 * Builds an official, elegant Bengali & English receipt message formatted for WhatsApp with emojis
 */
export function generateDepositReceiptWhatsAppMessage(params: {
  deposit: Deposit;
  member?: Member | null;
  systemSettings?: SystemSettings | null;
}): string {
  const { deposit, member, systemSettings } = params;

  const clubName = systemSettings?.clubName || 'Platform Business Club (PBC)';
  const sharePrice = deposit.shareUnitPrice || systemSettings?.shareUnitPrice || 5000;
  const shareCount = deposit.shareCount || Math.max(1, Math.round((Number(deposit.amount) || 0) / sharePrice));
  const receiptNumber = `RCP-${deposit.id.replace('DEP-', '')}-${(deposit.depositDate || '').replace(/-/g, '')}`;
  const memberName = deposit.memberName || member?.fullName || 'সম্মানিত সদস্য';
  const memberId = deposit.memberId || member?.id || 'PBC-MEMBER';
  const memberPhone = member?.phone || 'N/A';
  const adminName = deposit.approvedByAdminName || 'Finance Audit Admin';
  const adminId = deposit.approvedByAdminId ? `(ID: ${deposit.approvedByAdminId})` : '';

  const lines = [
    `🌟 *${clubName.toUpperCase()}* 🌟`,
    `📜 *অফিসিয়াল মানি রিসিট ভাউচার (Official Money Receipt)*`,
    `═════════════════════════`,
    ``,
    `✅ *স্ট্যাটাস (Status):* অনুমোদিত (Approved)`,
    `📄 *রিসিট নম্বর (Receipt No):* ${receiptNumber}`,
    `📅 *জমার তারিখ (Deposit Date):* ${deposit.depositDate}`,
    ``,
    `👤 *সদস্যের নাম (Member Name):* ${memberName}`,
    `🆔 *সদস্য আইডি (Member ID):* ${memberId}`,
    `📞 *ফোন নম্বর (Phone):* ${memberPhone}`,
    ``,
    `─────────────────────────`,
    `💰 *অনুমোদিত পরিমাণ (Amount):* ৳${(Number(deposit.amount) || 0).toLocaleString()} BDT`,
    `📊 *শেয়ার সংখ্যা (Shares):* ${shareCount} টি শেয়ার`,
    `💳 *পেমেন্ট মেথড (Payment):* ${deposit.paymentMethod || 'Bank Wire / MFS'}`,
    `🔢 *TrxID / রেফারেন্স:* ${deposit.referenceNumber || 'N/A'}`,
    `🏷️ *জমার খাত (Category):* ${deposit.category || 'Fund Raising'}`,
    deposit.coveredPeriodText ? `🗓️ *মেয়াদ (Period):* ${deposit.coveredPeriodText}` : '',
    `─────────────────────────`,
    ``,
    `✍️ *অনুমোদনকারী (Approved By):* ${adminName} ${adminId}`,
    `🏛️ *সিস্টেম ভাউচার আইডি:* ${deposit.id}`,
    ``,
    `🎉 *অভিনন্দন!* আপনার অ্যাকাউন্টে ডিপোজিটটি সফলভাবে নিশ্চিত ও রেকর্ড করা হয়েছে।`,
    `ক্লাবের সাথে সক্রিয় থাকার জন্য আপনাকে আন্তরিক ধন্যবাদ।`,
    `═════════════════════════`,
    `🌐 *Platform Business Club (PBC)*`
  ].filter(line => line !== '');

  return lines.join('\n');
}

/**
 * Opens WhatsApp directly with a prefilled message to the specified phone number
 */
export function openWhatsAppWithMessage(rawPhone: string, message: string): void {
  const cleanPhone = cleanPhoneForWhatsApp(rawPhone);
  const encodedText = encodeURIComponent(message);

  let url: string;
  if (cleanPhone) {
    url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  } else {
    // If no phone number is provided, open WhatsApp share dialogue
    url = `https://wa.me/?text=${encodedText}`;
  }

  // Open in new window or mobile WhatsApp app
  window.open(url, '_blank', 'noopener,noreferrer');
}
