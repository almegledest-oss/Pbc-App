import React, { useState } from 'react';
import { Deposit } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, Receipt, CheckCircle, Loader2, Eye, ShieldCheck, Maximize2, Minimize2, QrCode, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { captureElementToCanvas, urlToSafeDataUrl } from '../../utils/pdfUtils';
import { PbcLogo } from '../Common/PbcLogo';
import { OfficialSeal } from '../Common/OfficialSeal';

interface DepositReceiptModalProps {
  deposit: Deposit | null;
  isOpen: boolean;
  onClose: () => void;
}

// Convert numbers into words (English and Bengali)
function numberToWordsBDT(num: number): { bn: string; en: string } {
  const unitsEn = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensEn = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const unitsBn = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ'];

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
    bn: `কথায়: ${num.toLocaleString('bn-BD')} টাকা মাত্র`
  };
}

export const DepositReceiptModal: React.FC<DepositReceiptModalProps> = ({ deposit, isOpen, onClose }) => {
  const { language, currentMember } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen || !deposit) return null;

  const isBn = language === 'bn';
  const receiptNumber = `RCP-${deposit.id.replace('DEP-', '')}-${deposit.depositDate.replace(/-/g, '')}`;
  const amountWords = numberToWordsBDT(deposit.amount);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const voucherEl = document.getElementById('deposit-receipt-voucher');
      if (!voucherEl) {
        window.print();
        return;
      }

      // Convert attached receipt and signature to safe base64 if needed
      let safeReceiptUrl = deposit.receiptUrl;
      let safeSignatureUrl = deposit.approvedByAdminSignature;

      if (deposit.receiptUrl && !deposit.receiptUrl.startsWith('data:image/')) {
        try {
          safeReceiptUrl = await urlToSafeDataUrl(deposit.receiptUrl);
        } catch (e) {
          console.warn('Could not convert receipt URL:', e);
        }
      }
      if (deposit.approvedByAdminSignature && !deposit.approvedByAdminSignature.startsWith('data:image/')) {
        try {
          safeSignatureUrl = await urlToSafeDataUrl(deposit.approvedByAdminSignature);
        } catch (e) {
          console.warn('Could not convert signature URL:', e);
        }
      }

      // Standard A4 proportions: width 794px, height 1123px (1:1.4142 A4 aspect ratio)
      const a4WidthPx = 794;
      const a4HeightPx = 1123;

      const canvas = await captureElementToCanvas(voucherEl, {
        scale: 2.2,
        width: a4WidthPx,
        height: a4HeightPx,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#070D1B',
        scrollY: 0,
        scrollX: 0,
        onclone: (clonedDoc) => {
          const clonedVoucher = clonedDoc.getElementById('deposit-receipt-voucher');
          if (clonedVoucher) {
            clonedVoucher.scrollTop = 0;
            clonedVoucher.style.width = `${a4WidthPx}px`;
            clonedVoucher.style.minWidth = `${a4WidthPx}px`;
            clonedVoucher.style.maxWidth = `${a4WidthPx}px`;
            clonedVoucher.style.height = `${a4HeightPx}px`;
            clonedVoucher.style.minHeight = `${a4HeightPx}px`;
            clonedVoucher.style.maxHeight = `${a4HeightPx}px`;
            clonedVoucher.style.overflow = 'hidden';
            clonedVoucher.style.backgroundColor = '#070D1B';
            clonedVoucher.style.color = '#FFFFFF';
            clonedVoucher.style.padding = '36px 36px 30px 36px';
            clonedVoucher.style.borderRadius = '0px';
            clonedVoucher.style.border = '3px solid #D4AF37';
            clonedVoucher.style.boxSizing = 'border-box';
            clonedVoucher.style.display = 'flex';
            clonedVoucher.style.flexDirection = 'column';
            clonedVoucher.style.justifyContent = 'space-between';

            const attachedImg = clonedVoucher.querySelector('img[alt="Bank Deposit Receipt Voucher"]') as HTMLImageElement;
            if (attachedImg) {
              attachedImg.style.maxHeight = '200px';
              if (safeReceiptUrl) attachedImg.src = safeReceiptUrl;
            }

            const sigImg = clonedVoucher.querySelector('img[alt="Authorized Admin Signature"]') as HTMLImageElement;
            if (sigImg && safeSignatureUrl) {
              sigImg.src = safeSignatureUrl;
            }

            // Remove any overflow and height limits on all parent ancestors in the cloned DOM
            let curr = clonedVoucher.parentElement;
            while (curr) {
              curr.scrollTop = 0;
              curr.style.maxHeight = 'none';
              curr.style.height = 'auto';
              curr.style.minHeight = 'auto';
              curr.style.overflow = 'visible';
              curr = curr.parentElement;
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Fill Full Page A4 without blank gaps at top/bottom
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      pdf.save(`PBC_Official_Deposit_Receipt_${deposit.id}.pdf`);
    } catch (err) {
      console.error('Failed to download deposit receipt PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-[#070D1B] border-2 border-[#D4AF37]/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white my-auto transition-all ${
        isFullScreen ? 'w-full h-[98vh] max-w-5xl' : 'w-full max-w-2xl max-h-[94vh]'
      }`}>
        {/* Header bar - Sticky top */}
        <div className="p-3 sm:p-4 bg-[#0B1528] border-b border-[#D4AF37]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isBn ? 'অফিসিয়াল টাকা জমার রসিদ (Official Voucher)' : 'Official Deposit Receipt Voucher'}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Full Screen Toggle Button */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-300 hover:text-amber-300 bg-[#070D1B] hover:bg-[#112244] rounded-xl transition border border-amber-500/30 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={isFullScreen ? (isBn ? "ছোট করুন" : "Exit Full Screen") : (isBn ? "ফুল স্ক্রিন দেখুন" : "Full Screen")}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullScreen ? (isBn ? 'মিনিমাইজ' : 'Minimize') : (isBn ? 'ফুল স্ক্রিন' : 'Full Screen')}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-[#070D1B] hover:bg-rose-600 rounded-xl transition flex items-center gap-1 text-xs font-bold border border-amber-500/20 cursor-pointer"
              title={isBn ? "বন্ধ করুন" : "Close"}
            >
              <X className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">{isBn ? 'বন্ধ করুন' : 'Close'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scroll Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#040D1B]/80 flex justify-center items-start">
          
          {/* Printable Deposit Receipt Voucher Document Card (Naturally Compact & Elegant Spacing) */}
          <div 
            id="deposit-receipt-voucher" 
            className="official-document-isolated p-5 sm:p-7 space-y-4 sm:space-y-5 text-white rounded-3xl shadow-2xl w-full max-w-xl sm:max-w-2xl" 
            style={{ 
              backgroundColor: '#070D1B', 
              color: '#FFFFFF', 
              border: '2px solid rgba(212, 175, 55, 0.5)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.15)',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
            }}
          >
            {/* Top Header */}
            <div>
              {/* Club Header Banner */}
              <div className="flex items-center justify-between pb-3.5 border-b-2" style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}>
                <div className="flex items-center gap-3">
                  <PbcLogo variant="gold" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
                  <div>
                    <h2 className="text-base sm:text-xl font-black tracking-wider uppercase leading-tight" style={{ color: '#FFFFFF' }}>
                      PROBASHI <span style={{ color: '#F59E0B' }}>BUSINESS CLUB</span>
                    </h2>
                    <p className="text-xs font-bold tracking-wide mt-0.5" style={{ color: '#FCD34D' }}>
                      TOGETHER WE RISE • {deposit.category}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: '#94A3B8' }}>
                      GOVT. REG / CLUB CENTRAL TREASURY
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#064E3B',
                    border: '1.5px solid #10B981',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{ color: '#34D399', fontWeight: '900', fontSize: '11px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>✔</span>
                    <span style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '10.5px', letterSpacing: '0.8px', display: 'inline-block', verticalAlign: 'middle' }}>
                      OFFICIAL RECEIPT
                    </span>
                  </div>
                  <p className="text-xs font-mono font-black mt-1" style={{ color: '#FFD700' }}>
                    {receiptNumber}
                  </p>
                  <span className="text-[9px] block font-mono" style={{ color: '#94A3B8' }}>
                    ISSUED: {deposit.depositDate}
                  </span>
                </div>
              </div>

              {/* Receipt Details Grid Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl text-xs mt-3.5" style={{ backgroundColor: '#0B1528', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}>
                {/* Member Name */}
                <div className="sm:col-span-2 lg:col-span-2 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#94A3B8' }}>
                    Member Name / সদস্যের নাম:
                  </span>
                  <span className="font-black text-sm sm:text-base mt-0.5 tracking-wide" style={{ color: '#FFFFFF' }}>
                    {deposit.memberName}
                  </span>
                </div>

                {/* Member ID */}
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#94A3B8' }}>
                    Member ID / মেম্বার আইডি:
                  </span>
                  <span 
                    className="font-mono font-black text-sm sm:text-base mt-0.5 tracking-wider" 
                    style={{ color: '#FCD34D' }}
                  >
                    {deposit.memberId}
                  </span>
                </div>

                {/* Deposit Date */}
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#94A3B8' }}>
                    Deposit Date / জমার তারিখ:
                  </span>
                  <span className="font-bold text-xs sm:text-sm mt-0.5" style={{ color: '#F8FAFC' }}>
                    {deposit.depositDate}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#94A3B8' }}>
                    Payment Method / মাধ্যম:
                  </span>
                  <span 
                    className="font-bold text-xs sm:text-sm mt-0.5" 
                    style={{ color: '#FFFFFF' }}
                  >
                    {deposit.paymentMethod}
                  </span>
                </div>

                {/* Fund Category */}
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#94A3B8' }}>
                    Fund Category / তহবিল:
                  </span>
                  <span 
                    className="font-bold text-xs sm:text-sm mt-0.5" 
                    style={{ color: '#38BDF8' }}
                  >
                    {deposit.category}
                  </span>
                </div>

                {/* Target Month (if present) */}
                {deposit.targetMonth && (
                  <div className="flex flex-col justify-center">
                    <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#94A3B8' }}>
                      For Month / কিস্তির মাস:
                    </span>
                    <span 
                      className="font-bold text-xs sm:text-sm mt-0.5 flex items-center gap-1" 
                      style={{ color: '#FCD34D' }}
                    >
                      <span>📅</span> {deposit.targetMonth}
                    </span>
                  </div>
                )}

                {/* Reference Number & Status Bar */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2.5 mt-0.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1.5" style={{ borderColor: 'rgba(212, 175, 55, 0.25)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[11px]" style={{ color: '#94A3B8' }}>Reference / Trx ID / রেফারেন্স নম্বর:</span>
                    <span 
                      className="font-mono font-bold text-xs sm:text-sm" 
                      style={{ color: '#34D399' }}
                    >
                      {deposit.referenceNumber}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono tracking-wide" style={{ color: '#94A3B8' }}>
                      PORTFOLIO STATUS: <span className="font-black" style={{ color: '#34D399' }}>● {deposit.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Paid Highlight Banner */}
              <div className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-xl mt-3.5" style={{ background: 'linear-gradient(135deg, #0D2A52 0%, #112244 50%, #0F3820 100%)', border: '2px solid #D4AF37' }}>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block" style={{ color: '#FFD700' }}>
                    TOTAL AMOUNT RECEIVED / মোট জমার পরিমাণ
                  </span>
                  <span className="text-xs font-medium mt-0.5 block" style={{ color: '#E2E8F0' }}>
                    Currency: BDT (Bangladeshi Taka ৳)
                  </span>
                  {/* Amount in words */}
                  <span className="text-[11px] font-semibold mt-0.5 block italic" style={{ color: '#FDE68A' }}>
                    {amountWords.en}
                  </span>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight" style={{ color: '#FFD700' }}>
                    ৳{deposit.amount.toLocaleString('en-BD')}
                  </span>
                </div>
              </div>

              {/* Optional Attached Voucher Slip Photo */}
              {deposit.receiptUrl && (
                <div className="space-y-1 mt-3">
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1" style={{ color: '#FFD700' }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                    {isBn ? 'সংযুক্ত জমা মানি রসিদ ভাউচার স্লিপ:' : 'Attached Bank Money Receipt Voucher:'}
                  </span>
                  <div 
                    onClick={() => setIsZoomed(true)}
                    className="p-2.5 rounded-2xl cursor-pointer group relative overflow-hidden flex items-center justify-center bg-[#0B1528] border border-[#D4AF37]/40"
                    title={isBn ? "ক্লিক করে বড় করে দেখুন" : "Click to expand Money Receipt"}
                  >
                    <img src={deposit.receiptUrl} alt="Bank Deposit Receipt Voucher" className="max-h-36 rounded-xl mx-auto object-contain shadow-md group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold gap-1.5 backdrop-blur-xs" style={{ color: '#FFD700' }}>
                      <Eye className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      <span>{isBn ? 'ক্লিক করে বড় করে দেখুন' : 'Click to View Full Size'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Notes */}
              {deposit.notes && (
                <div className="text-xs p-2.5 rounded-xl mt-3" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', color: '#FDE68A' }}>
                  <span className="font-bold" style={{ color: '#F59E0B' }}>Transaction Notes:</span> {deposit.notes}
                </div>
              )}
            </div>

            {/* Official Footer, Blue Ink Stamp Seal & Authorized Signature (Now naturally placed right below the content) */}
            <div className="pt-4 border-t-2 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 relative mt-4" style={{ borderColor: 'rgba(212, 175, 55, 0.35)' }}>
              
              {/* Left Wing: Audit & Compliance info */}
              <div className="text-[10px] space-y-0.5 text-center sm:text-left max-w-xs">
                <p className="font-bold text-xs" style={{ color: '#FCD34D' }}>PBC Treasury & Finance Audit Department</p>
                <p style={{ color: '#CBD5E1' }}>Official entry digitally verified & recorded into Member Portfolio Ledger.</p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[9px] font-mono font-bold pt-0.5" style={{ color: '#34D399' }}>
                  <span>🔒 SECURE CRYPTOGRAPHIC VERIFICATION</span>
                </div>
              </div>

              {/* Center: Authentic Hand-Stamped Blue Ink Rubber Seal */}
              <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:-bottom-1 pointer-events-none opacity-95 scale-95 sm:scale-105 z-20 my-1 sm:my-0">
                <OfficialSeal 
                  size={120} 
                  title="PROBASHI BUSINESS CLUB" 
                  subtitle="AUDIT & TREASURY WING" 
                  statusText={deposit.status === 'Approved' ? "PAID & APPROVED" : "PENDING AUDIT"}
                  colorTheme="real_blue_ink"
                  angle={-14}
                  dateText={deposit.depositDate}
                />
              </div>

              {/* Right Wing: Authorized Signature */}
              <div className="text-center min-w-[170px] relative z-10">
                {deposit.approvedByAdminSignature ? (
                  <div 
                    className="h-12 flex items-center justify-center mb-1 rounded-lg px-2 py-0.5" 
                    style={{ 
                      backgroundColor: 'rgba(245, 158, 11, 0.08)', 
                      border: '1px solid rgba(245, 158, 11, 0.25)' 
                    }}
                  >
                    <img 
                      src={deposit.approvedByAdminSignature} 
                      alt="Authorized Admin Signature" 
                      className="max-h-11 max-w-[150px] object-contain" 
                      style={{ display: 'block', margin: '0 auto' }}
                    />
                  </div>
                ) : (
                  <div className="h-10 flex items-center justify-center mb-1">
                    <span className="font-serif italic font-bold text-sm tracking-wider" style={{ color: '#FFD700' }}>
                      {deposit.approvedByAdminName || (deposit.status === 'Approved' ? (currentMember?.fullName || 'PBC Finance Admin') : 'Pending Verification')}
                    </span>
                  </div>
                )}

                <p className="text-[11px] font-extrabold uppercase leading-tight mt-0.5" style={{ color: '#FCD34D' }}>
                  {deposit.approvedByAdminName || (deposit.status === 'Approved' ? (currentMember?.fullName || 'PBC Finance Admin') : 'Pending Verification')}
                </p>
                <p className="text-[9px] font-mono font-bold" style={{ color: '#94A3B8' }}>
                  {deposit.approvedByAdminId ? `ID: ${deposit.approvedByAdminId}` : (deposit.status === 'Approved' ? `ID: ${currentMember?.id || 'PBC-ADMIN'}` : 'Awaiting Approval')}
                </p>
                <div className="w-36 my-0.5 mx-auto" style={{ borderBottom: '1.5px solid rgba(245, 158, 11, 0.7)' }}></div>
                <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#F59E0B' }}>Authorized Signatory</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions - Sticky Bottom */}
        <div className="p-3 sm:p-4 bg-[#0B1528] border-t border-[#D4AF37]/30 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold bg-[#070D1B] hover:bg-slate-800 text-slate-300 rounded-xl transition border border-amber-500/20 active:scale-95 cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold bg-[#112244] hover:bg-[#182e5c] text-amber-300 border border-amber-500/30 rounded-xl transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{isBn ? 'প্রিন্ট রসিদ' : 'Print Voucher'}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg transition disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isBn ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Image Zoom Modal for attached voucher */}
      {isZoomed && deposit.receiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full border rounded-3xl p-4 text-center space-y-3" style={{ backgroundColor: '#070D1B', borderColor: 'rgba(212, 175, 55, 0.4)' }}>
            <div className="flex items-center justify-between border-b pb-2 text-white" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
              <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>
                {isBn ? 'সংযুক্ত মানি রিসিট ভাউচার' : 'Attached Money Receipt'}
              </span>
              <button onClick={() => setIsZoomed(false)} className="p-1.5 hover:bg-rose-600 rounded-lg text-slate-300 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-black p-2 border border-slate-800">
              <img src={deposit.receiptUrl} alt="Receipt Full Zoom" className="max-h-[70vh] object-contain mx-auto rounded-lg" />
            </div>
            <div className="text-right">
              <button onClick={() => setIsZoomed(false)} className="px-4 py-2 font-extrabold text-xs rounded-xl cursor-pointer" style={{ backgroundColor: '#F59E0B', color: '#0F172A' }}>
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
