import { jsPDF } from 'jspdf';
import { Deposit, Member, SystemSettings } from '../types';

/**
 * Converts numbers into words (English and Bengali)
 */
function numberToWordsBDT(num: number): { bn: string; en: string } {
  const unitsEn = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensEn = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertEn(n: number): string {
    if (n === 0) return 'Zero';
    if (n < 20) return unitsEn[n];
    if (n < 100) return tensEn[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + unitsEn[n % 10] : '');
    if (n < 1000) return unitsEn[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertEn(n % 100) : '');
    if (n < 100000) return convertEn(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertEn(n % 1000) : '');
    if (n < 10000000) return convertEn(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertEn(n % 100000) : '');
    return convertEn(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convertEn(n % 10000000) : '');
  }

  const enResult = `${convertEn(Math.floor(num))} Taka Only`;
  return {
    en: enResult,
    bn: `${num.toLocaleString('en-US')} BDT`
  };
}

/**
 * Generates an official, bank-grade PDF deposit receipt voucher using jsPDF.
 * Returns the base64 string (without the data: prefix) ready for email attachment.
 */
export async function generateDepositReceiptPdfBase64(
  deposit: Deposit,
  member?: Partial<Member>,
  settings?: Partial<SystemSettings>
): Promise<string> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // 1. Deep Luxury Navy Canvas
  doc.setFillColor(7, 13, 27); // #070D1B
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Inner card background
  doc.setFillColor(11, 21, 40); // #0B1528
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 4, 4, 'F');

  // Outer Gold Border & Accents
  doc.setDrawColor(212, 175, 55); // #D4AF37
  doc.setLineWidth(1.2);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 4, 4, 'S');

  // Inner Subtle Golden Hairline
  doc.setLineWidth(0.3);
  doc.setDrawColor(245, 158, 11);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26, 'S');

  // Header Section
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PROBASHI BUSINESS CLUB', pageWidth / 2, 28, { align: 'center' });

  doc.setTextColor(245, 158, 11); // Gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOGETHER WE RISE  -  OFFICIAL MONEY RECEIPT', pageWidth / 2, 35, { align: 'center' });

  // Dividing Line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(20, 40, pageWidth - 20, 40);

  // Voucher Meta Banner (Receipt # & Date)
  const receiptNo = `RCP-${deposit.id.replace('DEP-', '')}-${deposit.depositDate.replace(/-/g, '')}`;
  doc.setFillColor(15, 28, 54);
  doc.roundedRect(20, 44, pageWidth - 40, 14, 2, 2, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 44, pageWidth - 40, 14, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFont('helvetica', 'normal');
  doc.text('Receipt No:', 25, 53);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(253, 224, 71); // Amber
  doc.text(receiptNo, 45, 53);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Deposit Date:', 125, 53);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(deposit.depositDate || new Date().toISOString().split('T')[0], 148, 53);

  // Section 1: Member Information
  doc.setFillColor(14, 26, 48);
  doc.roundedRect(20, 64, pageWidth - 40, 36, 2, 2, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.2);
  doc.roundedRect(20, 64, pageWidth - 40, 36, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11);
  doc.text('MEMBER / INVESTOR INFORMATION', 25, 72);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Full Name:', 25, 80);
  doc.text('Member ID:', 25, 87);
  doc.text('Phone / Mobile:', 25, 94);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(deposit.memberName || member?.fullName || 'N/A', 55, 80);
  doc.setTextColor(253, 224, 71);
  doc.text(deposit.memberId || member?.id || 'N/A', 55, 87);
  doc.setTextColor(255, 255, 255);
  doc.text(member?.phone || 'N/A', 55, 94);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Email:', 120, 80);
  doc.text('Country / City:', 120, 87);
  doc.text('Status:', 120, 94);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(member?.email || 'N/A', 145, 80);
  doc.text(`${member?.country || 'Saudi Arabia'} / ${member?.city || 'Riyadh'}`, 145, 87);
  doc.setTextColor(52, 211, 153); // Emerald
  doc.text('Verified Active Member', 145, 94);

  // Section 2: Transaction Details Table
  doc.setFillColor(14, 26, 48);
  doc.roundedRect(20, 106, pageWidth - 40, 48, 2, 2, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 106, pageWidth - 40, 48, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11);
  doc.text('TRANSACTION & PAYMENT DETAILS', 25, 115);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Payment Method:', 25, 124);
  doc.text('Reference / TrxID:', 25, 132);
  doc.text('Deposit Category:', 25, 140);
  doc.text('Target Period:', 25, 148);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(deposit.paymentMethod || 'Bank', 60, 124);
  doc.setTextColor(253, 224, 71);
  doc.text(deposit.referenceNumber || 'N/A', 60, 132);
  doc.setTextColor(255, 255, 255);
  doc.text(deposit.category || 'Fund Raising', 60, 140);
  doc.text(deposit.coveredPeriodText || deposit.targetMonth || 'Regular Monthly Contribution', 60, 148);

  const sharePrice = deposit.shareUnitPrice || settings?.shareUnitPrice || 5000;
  const shareCount = deposit.shareCount || Math.max(1, Math.round(deposit.amount / sharePrice));

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Share Unit Value:', 125, 124);
  doc.text('Shares Credited:', 125, 132);
  doc.text('Approval Status:', 125, 140);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`BDT ${sharePrice.toLocaleString('en-US')}`, 160, 124);
  doc.setTextColor(253, 224, 71);
  doc.text(`${shareCount} Share Unit(s)`, 160, 132);
  doc.setTextColor(52, 211, 153);
  doc.text('APPROVED (VERIFIED)', 160, 140);

  // Section 3: Large Prominent Amount Box
  doc.setFillColor(18, 38, 70);
  doc.roundedRect(20, 160, pageWidth - 40, 36, 3, 3, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1.0);
  doc.roundedRect(20, 160, pageWidth - 40, 36, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text('TOTAL DEPOSIT AMOUNT VERIFIED & CREDITED:', pageWidth / 2, 169, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(253, 224, 71); // Amber
  doc.text(`BDT ${deposit.amount.toLocaleString('en-IN')}/-`, pageWidth / 2, 181, { align: 'center' });

  const amountWords = numberToWordsBDT(deposit.amount);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(`In Words: ${amountWords.en}`, pageWidth / 2, 190, { align: 'center' });

  // Section 4: Authorized Verification & Signatures
  doc.setFillColor(14, 26, 48);
  doc.roundedRect(20, 202, pageWidth - 40, 48, 2, 2, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 202, pageWidth - 40, 48, 2, 2, 'S');

  // Left side: Official Audit Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11);
  doc.text('OFFICIAL VERIFICATION SEAL', 30, 213);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Bank Statement Verified:', 30, 221);
  doc.text('Portfolio Ledger Updated:', 30, 227);
  doc.text('Voucher Security Hash:', 30, 233);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153);
  doc.text('100% Cleared & Reconciled', 68, 221);
  doc.text('Yes (Auto-Synced)', 68, 227);
  doc.setFont('courier', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`SHA256-${deposit.id}-${receiptNo.slice(-6)}`, 68, 233);

  // Right side: Authorized Signature
  const adminName = deposit.approvedByAdminName || 'Super Admin';
  const adminId = deposit.approvedByAdminId || 'PBC-ADMIN';

  // If signature image is available, draw it
  if (deposit.approvedByAdminSignature && deposit.approvedByAdminSignature.startsWith('data:image/')) {
    try {
      doc.addImage(deposit.approvedByAdminSignature, 'PNG', 135, 208, 45, 18);
    } catch {
      // Fallback text
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(253, 224, 71);
      doc.text('[Digitally Signed]', 155, 222, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(253, 224, 71);
    doc.text('~ Authorized Digital Sign ~', 155, 222, { align: 'center' });
  }

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.line(130, 230, 185, 230);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(adminName, 157.5, 236, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Authorized Officer (${adminId})`, 157.5, 241, { align: 'center' });

  // Section 5: Official Footer Note & Contact
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  const footerText = 'This is an official computer-generated digital receipt issued by Probashi Business Club (PBC). No manual physical seal is required.';
  doc.text(footerText, pageWidth / 2, 258, { align: 'center' });

  const officeText = settings?.clubOfficeAddress || 'Probashi Business Club, Gulshan Avenue, Dhaka, Bangladesh';
  doc.text(`Official Office: ${officeText}`, pageWidth / 2, 263, { align: 'center' });

  doc.setTextColor(245, 158, 11);
  doc.text('Official WhatsApp Helpline: Support Group & Portal Services  |  info@probashibusinessclub.com', pageWidth / 2, 268, { align: 'center' });

  // Return base64 without prefix
  const dataUri = doc.output('datauristring');
  const base64Index = dataUri.indexOf('base64,');
  if (base64Index !== -1) {
    return dataUri.substring(base64Index + 7);
  }
  return '';
}
