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
  CheckCircle2,
  Facebook,
  Bot,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const HelpDeskView: React.FC = () => {
  const { systemSettings, language, setIsAssistantOpen, openAssistantWithPrompt } = useApp();
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
  const fbGroupLink = systemSettings.supportFacebookGroupLink || 'https://www.facebook.com/groups/probashibusinessclub';
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

    const formattedText = `*PBC Help Desk Query*\n*Subject:* ${ticketSubject || 'General Query'}\n*Category:* ${ticketCategory}\n*Details:* ${ticketMessage}`;
    
    try {
      navigator.clipboard.writeText(formattedText);
    } catch (_e) {}
    
    setIsTicketSent(true);
    setTimeout(() => {
      setIsTicketSent(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 3000);

    window.open(waGroupLink, '_blank');
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

      {/* Dedicated PBC Member Helpdesk Card in Help Desk */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0B1528] to-[#070D1B] border-2 border-amber-500/40 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 border border-amber-200">
              <Headphones className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{isBn ? '২৪/৭ ডিজিটাল মেম্বার সাপোর্ট ও বাস্তব এআই' : '24/7 Digital Member Support & AI'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{isBn ? 'PBC মেম্বার হেল্পডেস্ক (ফুলস্ক্রিন)' : 'PBC Member Helpdesk (Fullscreen)'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {isBn
                  ? 'ডিপোজিট পেন্ডিং ও বিলম্ব অনুসন্ধান, রিজেকশন কারণ, ব্যাংকিং তথ্য এবং ক্লাবের যেকোনো প্রশ্নের জন্য সরাসরি ফুলস্ক্রিনে বাস্তবসম্মত উত্তর পান।'
                  : 'Get instant, realistic answers covering pending deposits, rejection inquiries, banking info, and club queries in full-scene view.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAssistantOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-950/40 border border-amber-200 transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Headphones className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>{isBn ? 'ফুলস্ক্রিন হেল্পডেস্ক ওপেন করুন' : 'Open Fullscreen Helpdesk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Shortcut Inquiry Chips */}
        <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-[11px] font-bold text-amber-300/80 mr-1">
            {isBn ? 'দ্রুত জিজ্ঞাসা:' : 'Quick Prompts:'}
          </span>
          {[
            { label: '💳 ডিপোজিট পেন্ডিং কেন?', prompt: 'আমার ডিপোজিট পেন্ডিং কেন? অনুমোদন হচ্ছে না কেন?' },
            { label: '❌ ডিপোজিট রিজেক্ট হলো কেন?', prompt: 'আমার ডিপোজিট রিজেক্ট হলো কেন? কারণ কী?' },
            { label: '🏦 ডিপোজিট একাউন্ট নম্বর', prompt: 'ডিপোজিট করার বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর দিন' },
            { label: '📜 মানি রিসিট ডাউনলোড নিয়ম', prompt: 'মানি রিসিট ডাউনলোড করার নিয়ম কী?' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => openAssistantWithPrompt(item.prompt)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 hover:text-white border border-amber-500/30 text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* COMMUNITY GROUPS & SUPPORT REPRESENTATIVES */}
      <div className="space-y-6">
        
        {/* Official Facebook Group Join Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d234a] via-[#0B1528] to-[#0d234a] border-2 border-blue-500/50 shadow-2xl relative overflow-hidden space-y-5">
          {/* Subtle glow effect */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider">
                <Facebook className="w-4 h-4 text-blue-400" />
                <span>{isBn ? 'অফিসিয়াল ফেসবুক কমিউনিটি' : 'Official Facebook Community'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <span>{isBn ? 'প্রবাসী বিজনেস ক্লাব অফিসিয়াল ফেসবুক গ্রুপ' : 'PBC Official Members Facebook Group'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {isBn 
                  ? 'ক্লাবের সকল সর্বশেষ নোটিশ, বিনিয়োগ আপডেট, প্রজেক্টের ছবি, বার্ষিক লভ্যাংশ তথ্য এবং সদস্য উন্মুক্ত আলোচনার জন্য আমাদের অফিসিয়াল ফেসবুক গ্রুপে যুক্ত হোন।' 
                  : 'Join the verified official community Facebook group to receive announcements, project photos, dividend reports, and discuss with fellow members.'}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <a
                href={fbGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-950/60 border border-blue-400 transition duration-150 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Facebook className="w-5 h-5 fill-current" />
                <span>{isBn ? 'গ্রুপে জয়েন করুন (Join Facebook Group)' : 'Join Facebook Group'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => copyToClipboard(fbGroupLink, 'fbGroupLink')}
                className="px-4 py-4 bg-[#070D1B] hover:bg-[#112244] text-slate-200 border border-blue-500/30 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                {copiedField === 'fbGroupLink' ? (
                  <>
                    <Check className="w-4 h-4 text-blue-400" />
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
        </div>

        {/* Dedicated WhatsApp Group Support Team Card - Sole Official Support Channel */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0B1528] to-[#070D1B] border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'একমাত্র অফিসিয়াল সাপোর্ট চ্যানেল' : 'Sole Official Support Channel'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <MessageCircle className="w-6 h-6 text-emerald-400 fill-current" />
                <span>{isBn ? 'PBC অফিসিয়াল সাপোর্ট টিম (WhatsApp)' : 'PBC Official Support Team (WhatsApp)'}</span>
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#070D1B] border border-emerald-500/30 text-xs text-emerald-300 w-fit">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>{isBn ? 'সাপোর্ট সময়সূচি:' : 'Helpline Hours:'}</strong> {workingHours}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isBn 
              ? 'প্রবাসী বিজনেস ক্লাবের (PBC) সকল সদস্যের ডিপোজিট ভেরিফিকেশন, প্রশাসনিক সহায়তা, TrxID অনুসন্ধান ও সকল সমস্যার সমাধানে ক্লাবের ডেডিকেটেড সাপোর্ট টিম সার্বক্ষণিক এই WhatsApp গ্রুপেই সক্রিয়। অন্য কোনো ব্যক্তিগত অ্যাকাউন্ট বা নম্বরে যোগাযোগের প্রয়োজন নেই।'
              : 'Our dedicated customer service and administration team operates exclusively within this official WhatsApp group to assist club members with deposit clearance, account inquiries, and general assistance.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={waGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-950/50 border border-emerald-300 transition duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4.5 h-4.5 fill-current" />
              <span>{isBn ? 'অফিসিয়াল WhatsApp গ্রুপে যোগ দিন' : 'Join Official WhatsApp Group'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => copyToClipboard(waGroupLink, 'waGroupLink')}
              className="px-4 py-3.5 bg-[#070D1B] hover:bg-[#112244] text-slate-200 border border-emerald-500/30 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              {copiedField === 'waGroupLink' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isBn ? 'গ্রুপ লিংক কপি হয়েছে' : 'Group Link Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>{isBn ? 'গ্রুপ লিংক কপি করুন' : 'Copy Group Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Message Box to WhatsApp Group */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0B1528] border-2 border-emerald-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  {isBn ? 'সাপোর্ট টিমের জন্য বার্তা ড্রাফট করুন' : 'Send Inquiry to Support Team'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn ? 'এখানে লিখে সরাসরি অফিশিয়াল হোয়াটসঅ্যাপ গ্রুপে শেয়ার করুন' : 'Draft your question and share directly in the official WhatsApp group'}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#070D1B] border border-emerald-500/30 text-xs text-emerald-300 w-fit">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              <span className="text-[11px] text-slate-400">{isBn ? 'সাপোর্ট:' : 'Support:'}</span>
              <span className="font-bold text-emerald-300">Official WhatsApp Group</span>
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
                  <span>{isBn ? 'গ্রুপে কপি ও ওপেন হয়েছে...' : 'Copied & Opening Group...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'হোয়াটসঅ্যাপ গ্রুপে পাঠান' : 'Send to WhatsApp Group'}</span>
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
