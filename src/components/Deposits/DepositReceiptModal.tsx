import React, { useState } from 'react';
import { Deposit } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, Receipt, CheckCircle, Loader2, Eye, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import { captureElementToCanvas, urlToSafeDataUrl } from '../../utils/pdfUtils';
import { PbcLogo } from '../Common/PbcLogo';

interface DepositReceiptModalProps {
  deposit: Deposit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DepositReceiptModal: React.FC<DepositReceiptModalProps> = ({ deposit, isOpen, onClose }) => {
  const { language, currentMember } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !deposit) return null;

  const receiptNumber = `RCP-${deposit.id.replace('DEP-', '')}-${deposit.depositDate.replace(/-/g, '')}`;

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
        safeReceiptUrl = await urlToSafeDataUrl(deposit.receiptUrl);
      }
      if (deposit.approvedByAdminSignature && !deposit.approvedByAdminSignature.startsWith('data:image/')) {
        safeSignatureUrl = await urlToSafeDataUrl(deposit.approvedByAdminSignature);
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const canvas = await captureElementToCanvas(voucherEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#070D1B',
        scrollY: 0,
        scrollX: 0,
        onclone: (clonedDoc) => {
          const clonedVoucher = clonedDoc.getElementById('deposit-receipt-voucher');
          if (clonedVoucher) {
            clonedVoucher.scrollTop = 0;
            clonedVoucher.style.maxHeight = 'none';
            clonedVoucher.style.height = 'auto';
            clonedVoucher.style.overflow = 'visible';
            clonedVoucher.style.backgroundColor = '#070D1B';
            clonedVoucher.style.color = '#FFFFFF';
            clonedVoucher.style.padding = '20px';
            clonedVoucher.style.borderRadius = '20px';
            clonedVoucher.style.boxSizing = 'border-box';

            const attachedImg = clonedVoucher.querySelector('img[alt="Bank Deposit Receipt Voucher"]') as HTMLImageElement;
            if (attachedImg) {
              attachedImg.style.maxHeight = '140px';
              if (safeReceiptUrl) attachedImg.src = safeReceiptUrl;
            }

            const sigImg = clonedVoucher.querySelector('img[alt="Authorized Admin Signature"]') as HTMLImageElement;
            if (sigImg && safeSignatureUrl) {
              sigImg.src = safeSignatureUrl;
            }

            if (clonedVoucher.parentElement) {
              clonedVoucher.parentElement.scrollTop = 0;
              clonedVoucher.parentElement.style.maxHeight = 'none';
              clonedVoucher.parentElement.style.height = 'auto';
              clonedVoucher.parentElement.style.overflow = 'visible';
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgProps = pdf.getImageProperties(imgData);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);

      let renderWidth = maxWidth;
      let renderHeight = (imgProps.height * renderWidth) / imgProps.width;

      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = (imgProps.width * renderHeight) / imgProps.height;
      }

      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#070D1B] border-2 border-[#D4AF37]/40 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white my-auto">
        {/* Header bar - Sticky top */}
        <div className="p-3 sm:p-4 bg-[#0B1528] border-b border-[#D4AF37]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {language === 'bn' ? 'অফিসিয়াল জমা টাকা জমার রসিদ' : 'Official Deposit Voucher / Receipt'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-[#070D1B] hover:bg-rose-600 rounded-full transition flex items-center gap-1 text-xs font-bold border border-amber-500/20"
            title={language === 'bn' ? "বন্ধ করুন" : "Close"}
          >
            <X className="w-5 h-5" />
            <span className="sr-only sm:not-sr-only">{language === 'bn' ? 'বন্ধ করুন' : 'Close'}</span>
          </button>
        </div>

        {/* Printable Deposit Receipt Voucher - Scrollable middle */}
        <div id="deposit-receipt-voucher" className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-white" style={{ backgroundColor: '#070D1B', color: '#FFFFFF', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          {/* Club Header Banner */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}>
            <div className="flex items-center gap-3">
              <PbcLogo variant="gold" className="w-14 h-14" />
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-wider uppercase leading-snug" style={{ color: '#FFFFFF' }}>
                  PROBASHI <span style={{ color: '#F59E0B' }}>BUSINESS CLUB</span>
                </h2>
                <p className="text-[11px] font-bold tracking-wide leading-snug" style={{ color: '#FCD34D' }}>
                  TOGETHER WE RISE<br />
                  Fund Raising
                </p>
              </div>
            </div>
            <div className="text-right">
              <div style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#064E3B',
                border: '1.2px solid #10B981',
                boxSizing: 'border-box',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ color: '#34D399', fontWeight: '900', fontSize: '11px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>✔</span>
                <span style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '10px', letterSpacing: '0.5px', display: 'inline-block', verticalAlign: 'middle' }}>
                  OFFICIAL RECEIPT
                </span>
              </div>
              <p className="text-[12px] font-mono font-extrabold mt-1.5" style={{ color: '#FFD700' }}>
                {receiptNumber}
              </p>
            </div>
          </div>

          {/* Receipt Details Box */}
          <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl text-xs" style={{ backgroundColor: '#0B1528', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}>
            <div>
              <span className="block font-bold text-[11px]" style={{ color: '#94A3B8' }}>Member Name / নাম:</span>
              <span className="font-black text-sm" style={{ color: '#FFFFFF' }}>{deposit.memberName}</span>
            </div>
            <div>
              <span className="block font-bold text-[11px]" style={{ color: '#94A3B8' }}>Member ID / মেম্বার আইডি:</span>
              <span className="font-mono font-black text-sm" style={{ color: '#F59E0B' }}>{deposit.memberId}</span>
            </div>
            <div>
              <span className="block font-bold text-[11px]" style={{ color: '#94A3B8' }}>Deposit Date / জমার তারিখ:</span>
              <span className="font-bold text-xs" style={{ color: '#F8FAFC' }}>{deposit.depositDate}</span>
            </div>
            <div>
              <span className="block font-bold text-[11px]" style={{ color: '#94A3B8' }}>Payment Method / মাধ্যম:</span>
              <span className="font-bold text-xs" style={{ color: '#F8FAFC' }}>{deposit.paymentMethod}</span>
            </div>
            <div className="col-span-2 pt-1.5 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.25)' }}>
              <span className="block font-bold text-[11px]" style={{ color: '#94A3B8' }}>Reference / Trx ID / রেফারেন্স নম্বর:</span>
              <span className="font-mono font-extrabold text-xs" style={{ color: '#34D399' }}>{deposit.referenceNumber}</span>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="p-5 rounded-2xl flex items-center justify-between shadow-xl" style={{ background: 'linear-gradient(135deg, #0D2A52 0%, #112244 50%, #0F3820 100%)', border: '1.5px solid #D4AF37' }}>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block" style={{ color: '#FFD700' }}>Total Amount Received / মোট জমার পরিমাণ</span>
              <span className="text-[11px] font-medium" style={{ color: '#E2E8F0' }}>Currency: BDT (Bangladeshi Taka ৳)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black" style={{ color: '#FFD700' }}>
                ৳{deposit.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {deposit.receiptUrl && (
            <div className="space-y-1.5">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1" style={{ color: '#FFD700' }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                {language === 'bn' ? 'সংযুক্ত জমা মানি রসিদ ভাউচার:' : 'Attached Bank Money Receipt Voucher:'}
              </span>
              <div 
                onClick={() => setIsZoomed(true)}
                className="p-2.5 rounded-2xl cursor-pointer group relative overflow-hidden"
                style={{ backgroundColor: '#0B1528', border: '1.5px solid rgba(212, 175, 55, 0.35)' }}
                title={language === 'bn' ? "ক্লিক করে বড় করে দেখুন" : "Click to expand Money Receipt"}
              >
                <img src={deposit.receiptUrl} alt="Bank Deposit Receipt Voucher" className="max-h-52 rounded-xl mx-auto object-contain shadow-md group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold gap-1.5 backdrop-blur-xs" style={{ color: '#FFD700' }}>
                  <Eye className="w-4 h-4" style={{ color: '#F59E0B' }} />
                  <span>{language === 'bn' ? 'ক্লিক করে বড় করে দেখুন' : 'Click to View Full Size'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Image Zoom Modal */}
          {isZoomed && deposit.receiptUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <div className="relative max-w-4xl w-full border rounded-3xl p-4 text-center space-y-3" style={{ backgroundColor: '#070D1B', borderColor: 'rgba(212, 175, 55, 0.4)' }}>
                <div className="flex items-center justify-between border-b pb-2 text-white" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>
                    {language === 'bn' ? 'সংযুক্ত মানি রিসিট ভাউচার' : 'Attached Money Receipt'}
                  </span>
                  <button onClick={() => setIsZoomed(false)} className="p-1.5 hover:bg-rose-600 rounded-lg text-slate-300 hover:text-white transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="max-h-[75vh] overflow-auto rounded-2xl bg-black p-2 border border-slate-800">
                  <img src={deposit.receiptUrl} alt="Receipt Full Zoom" className="max-h-[70vh] object-contain mx-auto rounded-lg" />
                </div>
                <div className="text-right">
                  <button onClick={() => setIsZoomed(false)} className="px-4 py-2 font-extrabold text-xs rounded-xl" style={{ backgroundColor: '#F59E0B', color: '#0F172A' }}>
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {deposit.notes && (
            <div className="text-xs p-3 rounded-xl" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', color: '#FDE68A' }}>
              <span className="font-bold" style={{ color: '#F59E0B' }}>Transaction Notes:</span> {deposit.notes}
            </div>
          )}

          {/* Footer & Signature line */}
          <div className="pt-4 border-t flex items-end justify-between" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
            <div className="text-[10px] space-y-0.5">
              <p className="font-bold text-xs" style={{ color: '#FCD34D' }}>PBC Treasury & Finance Audit Department</p>
              <p style={{ color: '#CBD5E1' }}>Verified & Audited Entry into Member Portfolio Ledger</p>
            </div>
            <div className="text-center min-w-[170px]">
              {deposit.approvedByAdminSignature ? (
                <div className="h-14 flex items-center justify-center mb-1 bg-amber-500/10 rounded-lg border border-amber-500/20 px-2 py-1">
                  <img 
                    src={deposit.approvedByAdminSignature} 
                    alt="Authorized Admin Signature" 
                    className="max-h-12 max-w-[160px] object-contain" 
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

              <p className="text-[11px] font-extrabold uppercase leading-tight mt-1" style={{ color: '#FCD34D' }}>
                {deposit.approvedByAdminName || (deposit.status === 'Approved' ? (currentMember?.fullName || 'PBC Finance Admin') : 'Pending Verification')}
              </p>
              <p className="text-[9px] font-mono font-bold" style={{ color: '#94A3B8' }}>
                {deposit.approvedByAdminId ? `ID: ${deposit.approvedByAdminId}` : (deposit.status === 'Approved' ? `ID: ${currentMember?.id || 'PBC-ADMIN'}` : 'Awaiting Approval')}
              </p>
              <div className="w-40 my-1 mx-auto" style={{ borderBottom: '1.5px solid rgba(245, 158, 11, 0.7)' }}></div>
              <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#F59E0B' }}>Authorized Admin</span>
            </div>
          </div>
        </div>

        {/* Modal Actions - Sticky Bottom */}
        <div className="p-3 sm:p-4 bg-[#0B1528] border-t border-[#D4AF37]/30 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#070D1B] hover:bg-slate-800 text-slate-300 rounded-xl transition border border-amber-500/20 active:scale-95 cursor-pointer"
          >
            Close (বন্ধ করুন)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold bg-[#112244] hover:bg-[#182e5c] text-amber-300 border border-amber-500/30 rounded-xl transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Print Voucher</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg transition disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

