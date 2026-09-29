import React, { useState, useEffect } from 'react';
import { Deposit, Member } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  MessageCircle,
  Send,
  Copy,
  Check,
  FileText,
  User,
  Phone,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import {
  generateDepositReceiptWhatsAppMessage,
  openWhatsAppWithMessage,
  cleanPhoneForWhatsApp
} from '../../utils/whatsappUtils';

interface WhatsAppReceiptSendModalProps {
  deposit: Deposit | null;
  isOpen: boolean;
  onClose: () => void;
  onViewVoucher?: (deposit: Deposit) => void;
}

export const WhatsAppReceiptSendModal: React.FC<WhatsAppReceiptSendModalProps> = ({
  deposit,
  isOpen,
  onClose,
  onViewVoucher
}) => {
  const { language, members, systemSettings } = useApp();
  const isBn = language === 'bn';

  const [recipientPhone, setRecipientPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Find member corresponding to this deposit
  const memberObj: Member | undefined = deposit
    ? members.find(
        (m) =>
          m.id === deposit.memberId ||
          (m.fullName &&
            deposit.memberName &&
            m.fullName.toLowerCase().trim() === deposit.memberName.toLowerCase().trim())
      )
    : undefined;

  useEffect(() => {
    if (deposit) {
      const ph = memberObj?.phone || '';
      setRecipientPhone(ph);
      setSentSuccess(false);
      setCopied(false);
    }
  }, [deposit, memberObj]);

  if (!isOpen || !deposit) return null;

  const messageText = generateDepositReceiptWhatsAppMessage({
    deposit,
    member: memberObj,
    systemSettings
  });

  const handleSendWhatsApp = () => {
    openWhatsAppWithMessage(recipientPhone, messageText);
    setSentSuccess(true);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareUnitPrice = deposit.shareUnitPrice || systemSettings?.shareUnitPrice || 5000;
  const shareCount = deposit.shareCount || Math.max(1, Math.round((Number(deposit.amount) || 0) / shareUnitPrice));
  const cleanedPhone = cleanPhoneForWhatsApp(recipientPhone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#070D1B] border-2 border-emerald-500/50 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-4 text-white my-auto relative animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-slate-700/60 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-emerald-500/30">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <MessageCircle className="w-7 h-7 fill-slate-950 stroke-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-extrabold uppercase">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{isBn ? 'স্বয়ংক্রিয় মানি রিসিট ডিসপ্যাচ' : 'Instant Money Receipt Dispatch'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              {isBn ? 'মেম্বারকে WhatsApp-এ মানি রিসিট পাঠান' : 'Send Money Receipt to Member via WhatsApp'}
            </h3>
          </div>
        </div>

        {/* Deposit Quick Summary Box */}
        <div className="bg-[#0B1528] p-3.5 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">{deposit.memberName}</p>
                <p className="text-[10px] font-mono text-slate-400">{deposit.memberId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-mono font-black text-sm">৳{deposit.amount.toLocaleString()} BDT</p>
              <p className="text-[10px] text-amber-300 font-bold">{shareCount} টি শেয়ার</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400">মেথড / Method: </span>
              <strong className="text-amber-300">{deposit.paymentMethod}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400">TrxID: </span>
              <strong className="font-mono text-slate-200">{deposit.referenceNumber || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-400">তারিখ / Date: </span>
              <span>{deposit.depositDate}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">ভাউচার: </span>
              <span className="font-mono font-bold text-emerald-300">{deposit.id}</span>
            </div>
          </div>
        </div>

        {/* Recipient Phone Input */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'মেম্বারের WhatsApp নম্বর:' : 'Member WhatsApp Number:'}</span>
            </span>
            {cleanedPhone && (
              <span className="text-[10px] font-mono text-emerald-400">
                wa.me/{cleanedPhone}
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="e.g. 01712345678 or +8801712345678"
              className="w-full bg-[#0B1528] border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {isBn
              ? '💡 নম্বরটিতে দেশীয় কোড (+৮৮০) স্বয়ংক্রিয়ভাবে যুক্ত হবে। প্রয়োজনে পরিবর্তন করা যাবে।'
              : '💡 International dial code is automatically formatted. You can edit if needed.'}
          </p>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              {isBn ? 'মেসেজ প্রিভিউ (WhatsApp Message):' : 'Formatted Message Preview:'}
            </span>
            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 cursor-pointer font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কপি করুন' : 'Copy')}</span>
            </button>
          </div>
          <div className="bg-[#030712] border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
            {messageText}
          </div>
        </div>

        {sentSuccess && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-bold">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isBn
                ? 'WhatsApp উইন্ডো ওপেন হয়েছে! মেসেজটি সেন্ড করুন।'
                : 'WhatsApp window opened! Click send in WhatsApp.'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span>{isBn ? 'WhatsApp-এ রিসিট পাঠান 🟢' : 'Send Money Receipt on WhatsApp 🟢'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {onViewVoucher && (
              <button
                type="button"
                onClick={() => onViewVoucher(deposit)}
                className="py-2.5 px-3 bg-[#0B1528] hover:bg-[#112244] border border-[#D4AF37]/30 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? 'PDF রিসিট দেখুন' : 'View PDF Receipt'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`py-2.5 px-3 bg-[#0B1528] hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer ${
                !onViewVoucher ? 'col-span-2' : ''
              }`}
            >
              {isBn ? 'সম্পন্ন / বন্ধ করুন' : 'Done / Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
