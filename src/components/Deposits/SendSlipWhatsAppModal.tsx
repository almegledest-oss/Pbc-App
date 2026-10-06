import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  ShieldCheck, 
  Phone, 
  ExternalLink, 
  Settings,
  Sparkles,
  User,
  ArrowRight
} from 'lucide-react';
import { cleanPhoneForWhatsApp } from '../../utils/whatsappUtils';

interface SendSlipWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendSlipWhatsAppModal: React.FC<SendSlipWhatsAppModalProps> = ({
  isOpen,
  onClose
}) => {
  const { systemSettings, language, currentMember, role, navigateWithHistory } = useApp();
  const isBn = language === 'bn';

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen) return null;

  // Retrieve the 2 configured numbers with robust fallbacks
  const phone1 = (systemSettings?.depositSlipWhatsApp1 || systemSettings?.adminWhatsApp || systemSettings?.supportOfficialWhatsApp || '+8801700000000').trim();
  const label1 = (systemSettings?.depositSlipWhatsApp1Label || (isBn ? 'অফিসিয়াল একাউন্টস ও ডিপোজিট ডেস্ক (Admin 1)' : 'Official Accounts Desk (Admin 1)')).trim();

  const phone2 = (systemSettings?.depositSlipWhatsApp2 || systemSettings?.supportRep2WhatsApp || '+8801800000000').trim();
  const label2 = (systemSettings?.depositSlipWhatsApp2Label || (isBn ? 'ফাইন্যান্স ও ভেরিফিকেশন ডেস্ক (Admin 2)' : 'Finance Verification Desk (Admin 2)')).trim();

  const cleanPhone1 = cleanPhoneForWhatsApp(phone1);
  const cleanPhone2 = cleanPhoneForWhatsApp(phone2);

  const defaultMsg = `আসসালামু আলাইকুম, আমি Probashi Business Club-এর মেম্বার ${currentMember?.fullName || ''} (ID: ${currentMember?.id || ''})। আমি আমার শেয়ার/কিস্তির টাকা পাঠিয়েছি, দয়া করে আমার ডিপোজিট এন্ট্রি করে রসিদ প্রদান করবেন। স্লিপ সংযুক্ত করা হলো।`;
  const encodedMsg = encodeURIComponent(defaultMsg);

  const url1 = `https://wa.me/${cleanPhone1}?text=${encodedMsg}`;
  const url2 = `https://wa.me/${cleanPhone2}?text=${encodedMsg}`;

  const handleCopyPhone = (phoneStr: string, idx: number) => {
    navigator.clipboard.writeText(phoneStr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyMsg = () => {
    navigator.clipboard.writeText(defaultMsg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-b from-[#0B1528] via-[#070D1B] to-[#030712] border-2 border-emerald-500/50 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-5 text-white my-auto relative animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-slate-700/60 transition cursor-pointer hover:bg-slate-800"
          title={isBn ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-emerald-500/30">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <MessageCircle className="w-6 h-6 fill-slate-950 stroke-emerald-100" />
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {isBn ? 'হোয়াটসঅ্যাপে জমার স্লিপ পাঠান' : 'Send Deposit Slip via WhatsApp'}
            </h3>
            <p className="text-xs text-emerald-300 font-medium mt-0.5">
              {isBn ? 'যে কোনো একটি অফিসিয়াল নম্বরে স্লিপ পাঠান' : 'Choose an official WhatsApp channel to send your slip'}
            </p>
          </div>
        </div>

        {/* Info callout */}
        <div className="p-3.5 rounded-2xl bg-[#030712]/80 border border-amber-500/30 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            {isBn 
              ? 'টাকা পাঠানোর পর প্রাপ্ত স্লিপ বা TrxID-এর স্ক্রিনশট নিচের যেকোনো একটি WhatsApp নম্বরে পাঠিয়ে দিন। আমাদের অ্যাডমিন টিম ভেরিফাই করে সরাসরি সিলযুক্ত মানি রিসিট ইস্যু করবে।'
              : 'After transferring funds, send your receipt screenshot to either official WhatsApp number below for verification.'}
          </p>
        </div>

        {/* Two WhatsApp Channels */}
        <div className="space-y-3.5">
          
          {/* Channel 1 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1f35] to-[#071324] border-2 border-emerald-500/40 hover:border-emerald-400 transition-all space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {isBn ? 'নম্বর ১ (Primary)' : 'Number 1'}
                  </span>
                  <span className="text-xs font-bold text-slate-300 truncate">
                    {label1}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-base font-black text-white tracking-wider">
                    {phone1}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyPhone(phone1, 1)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0B1528] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                title={isBn ? 'নম্বর কপি করুন' : 'Copy phone'}
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{isBn ? 'কপি' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={url1}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{isBn ? 'WhatsApp ১-এ স্লিপ পাঠান' : 'Send Slip to WhatsApp 1'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Channel 2 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1f35] to-[#071324] border-2 border-teal-500/40 hover:border-teal-400 transition-all space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {isBn ? 'নম্বর ২ (Secondary)' : 'Number 2'}
                  </span>
                  <span className="text-xs font-bold text-slate-300 truncate">
                    {label2}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span className="font-mono text-base font-black text-white tracking-wider">
                    {phone2}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyPhone(phone2, 2)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0B1528] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                title={isBn ? 'নম্বর কপি করুন' : 'Copy phone'}
              >
                {copiedIndex === 2 ? (
                  <>
                    <Check className="w-3 h-3 text-teal-400" />
                    <span className="text-teal-300">{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{isBn ? 'কপি' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={url2}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-teal-950/40 border border-teal-400/50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{isBn ? 'WhatsApp ২-এ স্লিপ পাঠান' : 'Send Slip to WhatsApp 2'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

        </div>

        {/* Member preview message box */}
        <div className="p-3 bg-[#030712] rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{isBn ? 'অটোমেটিক মেসেজ প্রিভিউ:' : 'Pre-composed Message:'}</span>
            <button
              onClick={handleCopyMsg}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedMsg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMsg ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'মেসেজ কপি' : 'Copy')}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-3">
            {defaultMsg}
          </p>
        </div>

        {/* Footer with Admin shortcut */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigateWithHistory({
                  tab: 'admin_panel',
                  subView: 'support_settings',
                  title: 'Help Desk & WhatsApp Settings',
                  titleBn: 'হেল্প ডেস্ক ও হোয়াটসঅ্যাপ সেটিংস',
                  isFocusMode: true
                });
              }}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isBn ? 'অ্যাডমিন: এই ২টা নম্বর পরিবর্তন করুন' : 'Admin: Edit these 2 numbers'}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">
              PBC Official Support Gateway
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
