import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Headphones, 
  MessageCircle, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  Building, 
  Clock, 
  Users,
  Send,
  CheckCircle2
} from 'lucide-react';

export const HelpDeskView: React.FC = () => {
  const { systemSettings, language } = useApp();
  const { currentTheme } = useTheme();
  const isBn = language === 'bn';

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Safe fallback values
  const waGroupLink = systemSettings.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/sample-pbc-link';
  const officialWhatsApp = systemSettings.supportOfficialWhatsApp || '+8801700000000';
  const workingHours = systemSettings.supportWorkingHours || 'সকাল ১০:০০ - রাত ১০:০০ (বাংলাদেশ সময়)';

  const rep1 = {
    name: systemSettings.supportRep1Name || 'Md. Shakil Rana',
    title: systemSettings.supportRep1Title || 'Customer Care & Verification Officer',
    phone: systemSettings.supportRep1Phone || '+880 1700-000001',
    whatsapp: systemSettings.supportRep1WhatsApp || '+8801700000001'
  };

  const rep2 = {
    name: systemSettings.supportRep2Name || 'Farhan Ahmed',
    title: systemSettings.supportRep2Title || 'Finance & Accounts Helpdesk',
    phone: systemSettings.supportRep2Phone || '+880 1800-000002',
    whatsapp: systemSettings.supportRep2WhatsApp || '+8801800000002'
  };

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'Deposit' | 'Account' | 'Investment' | 'General'>('Deposit');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isTicketSent, setIsTicketSent] = useState(false);

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    const formattedText = `*PBC Help Desk Query*\n\n*Subject:* ${ticketSubject || 'General Query'}\n*Category:* ${ticketCategory}\n*Details:* ${ticketMessage}`;
    const cleanNum = officialWhatsApp.replace(/[^0-9+]/g, '');
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(formattedText)}`;
    
    setIsTicketSent(true);
    setTimeout(() => {
      setIsTicketSent(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 3000);

    window.open(url, '_blank');
  };

  const getWhatsAppUrl = (phone: string, customText?: string) => {
    const cleanNum = phone.replace(/[^0-9+]/g, '');
    const defaultMsg = encodeURIComponent(
      isBn 
        ? 'আসসালামু আলাইকুম, আমি প্রবাসী বিজনেস ক্লাবের (PBC) একজন মেম্বার। আমার সহায়তা প্রয়োজন।' 
        : 'Hello, I am a member of Probashi Business Club (PBC). I need assistance.'
    );
    const msg = customText ? encodeURIComponent(customText) : defaultMsg;
    return `https://wa.me/${cleanNum}?text=${msg}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      
      {/* Top Welcome & Navigation Header - ONLY WhatsApp & Member Support */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#0B1528] to-[#070D1B] text-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'অফিসিয়াল হেল্প ডেস্ক ও মেম্বার সাপোর্ট' : 'Official Help Desk & Member Support'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{isBn ? 'মেম্বার হেল্প ডেস্ক ও হোয়াটসঅ্যাপ সহায়তা' : 'Help Desk & WhatsApp Support'}</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isBn 
                ? 'যেকোনো জিজ্ঞাসা, তথ্য বা কারিগরি সহায়তার জন্য ক্লাবের অফিসিয়াল WhatsApp কমিউনিটি গ্রুপে যুক্ত হোন এবং নিয়োজিত প্রতিনিধিদের সাথে যোগাযোগ করুন।' 
                : 'Official WhatsApp community group and dedicated customer service representatives available 24/7 for club members.'}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="shrink-0">
            <a
              href={waGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-950/40 border border-emerald-300 transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{isBn ? 'হোয়াটসঅ্যাপ গ্রুপে জয়েন' : 'Join WhatsApp Group'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* WHATSAPP GROUP & SUPPORT REPRESENTATIVES */}
      <div className="space-y-6">
        
        {/* Official WhatsApp Group Join Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#072418] via-[#0B1528] to-[#072418] border-2 border-emerald-500/50 shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'অফিসিয়াল হোয়াটসঅ্যাপ কমিউনিটি' : 'Official WhatsApp Community'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isBn ? 'প্রবাসী বিজনেস ক্লাব মেম্বার্স হোয়াটসঅ্যাপ গ্রুপ' : 'PBC Official Members WhatsApp Group'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {isBn 
                  ? 'ক্লাবের সকল সর্বশেষ নোটিশ, বিনিয়োগ আপডেট, বার্ষিক লভ্যাংশ তথ্য এবং সদস্য আলোচনা সবার আগে পেতে এখনই যুক্ত হোন।' 
                  : 'Join the verified official community group to receive announcements, project dividends, and discuss with fellow members.'}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <a
                href={waGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/60 border border-emerald-300 transition duration-150 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{isBn ? 'গ্রুপে জয়েন করুন (Join WhatsApp Group)' : 'Join WhatsApp Group'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => copyToClipboard(waGroupLink, 'groupLink')}
                className="px-4 py-4 bg-[#070D1B] hover:bg-[#112244] text-slate-200 border border-emerald-500/30 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                {copiedField === 'groupLink' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? 'লিংক কপি হয়েছে' : 'Link Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>{isBn ? 'লিংক কপি' : 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-emerald-500/20 text-xs text-emerald-300">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{isBn ? 'সাপোর্ট সময়সূচি:' : 'Support Hours:'}</strong> {workingHours}
            </span>
          </div>
        </div>

        {/* Support Representatives Contacts */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>{isBn ? 'সরাসরি যোগাযোগ ও সাপোর্ট প্রতিনিধি' : 'Direct Helpline Representatives'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Representative 1 */}
            <div className="p-6 rounded-3xl bg-[#0B1528] border-2 border-[#D4AF37]/30 hover:border-amber-400/50 shadow-xl space-y-4 transition">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-black text-base">
                  01
                </div>
                <div>
                  <h4 className="font-black text-white text-base">{rep1.name}</h4>
                  <p className="text-xs text-amber-300 font-bold">{rep1.title}</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'ফোন / WhatsApp নম্বর' : 'Phone / WhatsApp'}</span>
                  <span className="font-mono text-base font-bold text-white tracking-wider">{rep1.phone}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(rep1.phone, 'rep1')}
                  className="p-2 text-slate-400 hover:text-amber-300 cursor-pointer"
                  title={isBn ? 'নম্বর কপি করুন' : 'Copy Number'}
                >
                  {copiedField === 'rep1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`tel:${rep1.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isBn ? 'সরাসরি কল' : 'Call Now'}</span>
                </a>

                <a
                  href={getWhatsAppUrl(rep1.whatsapp || rep1.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Representative 2 */}
            <div className="p-6 rounded-3xl bg-[#0B1528] border-2 border-[#D4AF37]/30 hover:border-amber-400/50 shadow-xl space-y-4 transition">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-black text-base">
                  02
                </div>
                <div>
                  <h4 className="font-black text-white text-base">{rep2.name}</h4>
                  <p className="text-xs text-amber-300 font-bold">{rep2.title}</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'ফোন / WhatsApp নম্বর' : 'Phone / WhatsApp'}</span>
                  <span className="font-mono text-base font-bold text-white tracking-wider">{rep2.phone}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(rep2.phone, 'rep2')}
                  className="p-2 text-slate-400 hover:text-amber-300 cursor-pointer"
                  title={isBn ? 'নম্বর কপি করুন' : 'Copy Number'}
                >
                  {copiedField === 'rep2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`tel:${rep2.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isBn ? 'সরাসরি কল' : 'Call Now'}</span>
                </a>

                <a
                  href={getWhatsAppUrl(rep2.whatsapp || rep2.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Message Box to WhatsApp */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0B1528] border-2 border-emerald-500/30 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">
                {isBn ? 'দ্রুত মেসেজ পাঠান (Send Direct Inquiry)' : 'Send Direct Message to Hotline'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? 'এখানে লিখে সরাসরি অফিশিয়াল হোয়াটসঅ্যাপে পাঠিয়ে দিন' : 'Type your issue and it will open directly in WhatsApp'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSendToWhatsApp} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isBn ? 'বিষয় (Subject)' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder={isBn ? 'যেমন: ডিপোজিট জমা সংক্রান্ত' : 'e.g. Deposit Verification'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1B] border border-slate-700 focus:border-emerald-400 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isBn ? 'ক্যাটাগরি (Category)' : 'Category'}
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1B] border border-slate-700 focus:border-emerald-400 text-white text-xs outline-none"
                >
                  <option value="Deposit">Deposit & Payment (টাকা জমা)</option>
                  <option value="Account">Member Profile & Login (প্রোফাইল)</option>
                  <option value="Investment">Investment & Project (প্রজেক্ট)</option>
                  <option value="General">General Inquiry (সাধারণ জিজ্ঞাসা)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                {isBn ? 'আপনার বার্তা লিখুন (Message)' : 'Message'}
              </label>
              <textarea
                rows={3}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder={isBn ? 'আপনার বার্তা বা সমস্যার বিবরণ লিখুন...' : 'Type your details here...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1B] border border-slate-700 focus:border-emerald-400 text-white text-xs outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-95"
            >
              {isTicketSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{isBn ? 'পাঠানো হয়েছে...' : 'Opened in WhatsApp...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'হোয়াটসঅ্যাপে পাঠান' : 'Send via WhatsApp'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Club Office Address */}
        <div className="p-5 rounded-2xl bg-[#070D1B] border border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>{isBn ? 'অফিসিয়াল পরামর্শ:' : 'Official Notice:'}</strong> {isBn ? 'যেকোনো সহযোগিতার জন্য সর্বদা ক্লাবের ভেরিফাইড হেল্পলাইন ও অফিশিয়াল হোয়াটসঅ্যাপে যোগাযোগ করুন।' : 'Always verify through official WhatsApp or verified helpdesk.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[11px]">
              SSL Secured Portal
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
