import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  CreditCard, 
  Copy, 
  Check, 
  Building, 
  ShieldCheck, 
  Wallet, 
  ArrowRight,
  Info,
  Sparkles,
  MessageCircle
} from 'lucide-react';

export const DepositAccountsView: React.FC = () => {
  const { systemSettings, language, navigateWithHistory, currentMember } = useApp();
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
  const bkashNumber = systemSettings.bkashNumber || '01700000000';
  const bkashName = systemSettings.bkashName || 'Probashi Business Club';
  const bkashType = systemSettings.bkashType || 'Personal';
  const nagadNumber = systemSettings.nagadNumber || '01800000000';
  const nagadName = systemSettings.nagadName || 'Probashi Business Club';
  const nagadType = systemSettings.nagadType || 'Personal';
  const rocketNumber = systemSettings.rocketNumber || '01900000000';
  const rocketName = systemSettings.rocketName || 'Probashi Business Club';
  const rocketType = systemSettings.rocketType || 'Personal';

  const bankName = systemSettings.bankName || 'Islami Bank Bangladesh PLC';
  const bankAccountName = systemSettings.bankAccountName || 'Probashi Business Club Ltd';
  const bankAccountNumber = systemSettings.bankAccountNumber || '2050XXXXXXXXXXXXX';
  const bankBranchName = systemSettings.bankBranchName || 'Principal Branch, Dhaka';
  const bankRoutingNumber = systemSettings.bankRoutingNumber || '125270000';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner - ONLY Deposit Accounts */}
      <div className="bg-gradient-to-r from-amber-950/60 via-[#0B1528] to-[#070D1B] rounded-3xl border-2 border-amber-500/40 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'অফিসিয়াল ডিপোজিট অ্যাকাউন্টস' : 'Official Deposit Accounts'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{isBn ? 'অফিসিয়াল ডিপোজিট অ্যাকাউন্টসমূহ' : 'Official Deposit Accounts'}</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isBn 
                ? 'টাকা জমা দেওয়ার অফিশিয়াল বিকাশ, নগদ, রকেট এবং ব্যাংক অ্যাকাউন্ট নম্বর। নম্বর কপি করে সরাসরি টাকা পাঠিয়ে স্লিপটি আমাদের অফিশিয়াল WhatsApp-এ পাঠিয়ে দিন। অ্যাডমিন ভেরিফাই করে সরাসরি আপনার অ্যাকাউন্টে পাকা রসিদ যুক্ত করে দেবে।'
                : 'Official bKash, Nagad, Rocket and Bank account details for depositing club shares. After sending funds, send the slip to our WhatsApp for direct receipt verification.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 flex items-center gap-3 flex-wrap">
            {(() => {
              const targetWhatsApp = systemSettings?.adminWhatsApp || systemSettings?.supportOfficialWhatsApp || systemSettings?.supportRep1WhatsApp || '+8801700000000';
              const cleanPhone = targetWhatsApp.replace(/[^0-9]/g, '');
              const defaultMsg = encodeURIComponent(
                `আসসালামু আলাইকুম, আমি Probashi Business Club-এর মেম্বার ${currentMember?.fullName || ''} (ID: ${currentMember?.id || ''})। আমি আমার শেয়ার/কিস্তির টাকা পাঠিয়েছি, দয়া করে আমার ডিপোজিট এন্ট্রি করে রসিদ প্রদান করবেন। স্লিপ সংযুক্ত করা হলো।`
              );
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${defaultMsg}`;
              return (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-950/40 border border-emerald-400/40 transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{isBn ? 'WhatsApp-এ স্লিপ পাঠান' : 'Send Slip via WhatsApp'}</span>
                </a>
              );
            })()}

            <button
              onClick={() => navigateWithHistory('deposits')}
              className="px-4 py-3.5 bg-[#070D1B] hover:bg-[#112244] text-amber-300 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-amber-500/40 transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{isBn ? 'ডিপোজিট হিস্টোরি' : 'Deposit Ledger'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACCOUNTS CONTENT */}
      <div className="space-y-6">
        
        {/* Mobile Financial Services (bKash, Nagad, Rocket) */}
        <div className="space-y-3">
          <h2 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>{isBn ? 'মোবাইল ব্যাংকিং অ্যাকাউন্টস (MFS Accounts)' : 'Mobile Financial Accounts (MFS)'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* bKash Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1b0816] via-[#0B1528] to-[#070D1B] border-2 border-rose-500/40 hover:border-rose-400 shadow-xl space-y-4 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-black text-xs">
                    bKash
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">bKash (বিকাশ)</h3>
                    <span className="text-[11px] font-bold text-pink-300 px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/30">
                      {bkashType} Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Holder Name */}
              <div className="px-3.5 py-2 rounded-xl bg-pink-950/40 border border-pink-500/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-pink-200/80 font-bold uppercase tracking-wider">
                  {isBn ? 'অ্যাকাউন্টের নাম:' : 'Account Name:'}
                </span>
                <span className="text-xs font-black text-white truncate text-right">
                  {bkashName}
                </span>
              </div>

              <div className="p-3 bg-[#030712] rounded-2xl border border-pink-500/30 flex items-center justify-between gap-3">
                <span className="font-mono text-lg font-black tracking-widest text-white">
                  {bkashNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(bkashNumber, 'bkash')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    copiedField === 'bkash'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40'
                  }`}
                >
                  {copiedField === 'bkash' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isBn 
                  ? 'বিকাশ অ্যাপ থেকে "Send Money" অথবা ক্যাশ ইন করে সাথে সাথে TrxID সংগ্রহ করুন।' 
                  : 'Send funds via bKash App or USSD and copy your TrxID.'}
              </p>
            </div>

            {/* Nagad Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1d0d07] via-[#0B1528] to-[#070D1B] border-2 border-orange-500/40 hover:border-orange-400 shadow-xl space-y-4 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-xs">
                    Nagad
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Nagad (নগদ)</h3>
                    <span className="text-[11px] font-bold text-orange-300 px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30">
                      {nagadType} Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Holder Name */}
              <div className="px-3.5 py-2 rounded-xl bg-orange-950/40 border border-orange-500/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-orange-200/80 font-bold uppercase tracking-wider">
                  {isBn ? 'অ্যাকাউন্টের নাম:' : 'Account Name:'}
                </span>
                <span className="text-xs font-black text-white truncate text-right">
                  {nagadName}
                </span>
              </div>

              <div className="p-3 bg-[#030712] rounded-2xl border border-orange-500/30 flex items-center justify-between gap-3">
                <span className="font-mono text-lg font-black tracking-widest text-white">
                  {nagadNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(nagadNumber, 'nagad')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    copiedField === 'nagad'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40'
                  }`}
                >
                  {copiedField === 'nagad' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isBn 
                  ? 'নগদ ওয়ালেট থেকে সেন্ড মানি করুন এবং সফল হওয়ার পর ট্রানজেকশন আইডি নোট করুন।' 
                  : 'Transfer via Nagad mobile banking and preserve transaction ID.'}
              </p>
            </div>

            {/* Rocket Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#120724] via-[#0B1528] to-[#070D1B] border-2 border-purple-500/40 hover:border-purple-400 shadow-xl space-y-4 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-xs">
                    Rocket
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Rocket (রকেট)</h3>
                    <span className="text-[11px] font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                      {rocketType} Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Holder Name */}
              <div className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-purple-200/80 font-bold uppercase tracking-wider">
                  {isBn ? 'অ্যাকাউন্টের নাম:' : 'Account Name:'}
                </span>
                <span className="text-xs font-black text-white truncate text-right">
                  {rocketName}
                </span>
              </div>

              <div className="p-3 bg-[#030712] rounded-2xl border border-purple-500/30 flex items-center justify-between gap-3">
                <span className="font-mono text-lg font-black tracking-widest text-white">
                  {rocketNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(rocketNumber, 'rocket')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    copiedField === 'rocket'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {copiedField === 'rocket' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isBn 
                  ? 'রকেট অ্যাপ বা ইউএসএসডি কোড ব্যবহার করে টাকা জমা দিন।' 
                  : 'Transfer via Rocket mobile banking and submit voucher.'}
              </p>
            </div>

          </div>
        </div>

        {/* Official Bank Account Details Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0B1528] border-2 border-[#D4AF37]/50 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">
                  {isBn ? 'ক্লাবের অফিশিয়াল ব্যাংক অ্যাকাউন্ট' : 'Official Club Bank Account'}
                </h3>
                <p className="text-xs text-slate-300">
                  {isBn ? 'সরাসরি ব্যাংক ডিপোজিট, BEFTN বা NPSB ট্রান্সফারের জন্য' : 'For direct bank deposits, BEFTN, RTGS or NPSB transfer'}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ভেরিফাইড ব্যাংক অ্যাকাউন্ট' : 'Verified PBC Account'}</span>
            </div>
          </div>

          {/* Bank Info Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Bank Name */}
            <div className="p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20 space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {isBn ? 'ব্যাংকের নাম (Bank Name)' : 'Bank Name'}
              </span>
              <div className="font-black text-base text-white">
                {bankName}
              </div>
            </div>

            {/* Account Name */}
            <div className="p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20 space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {isBn ? 'অ্যাকাউন্টের নাম (Account Title)' : 'Account Name'}
              </span>
              <div className="font-black text-base text-white">
                {bankAccountName}
              </div>
            </div>

            {/* Account Number with Copy */}
            <div className="p-4 bg-[#070D1B] rounded-2xl border-2 border-amber-500/40 space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  {isBn ? 'অ্যাকাউন্ট নম্বর (Account Number)' : 'Account Number'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isBn ? 'ক্লিক করে কপি করুন' : 'Click button to copy'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-[#030712] p-3 rounded-xl border border-amber-500/30">
                <span className="font-mono text-lg sm:text-xl font-black text-amber-300 tracking-widest">
                  {bankAccountNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(bankAccountNumber, 'bankAcc')}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer ${
                    copiedField === 'bankAcc'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {copiedField === 'bankAcc' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isBn ? 'কপি সম্পন্ন' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isBn ? 'কপি করুন' : 'Copy Number'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Branch Name */}
            <div className="p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20 space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {isBn ? 'শাখা (Branch Name)' : 'Branch Name'}
              </span>
              <div className="font-black text-sm text-slate-200">
                {bankBranchName}
              </div>
            </div>

            {/* Routing Number */}
            <div className="p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  {isBn ? 'রাউটিং নম্বর (Routing Number)' : 'Routing Number'}
                </span>
                <button
                  onClick={() => copyToClipboard(bankRoutingNumber, 'routing')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  {copiedField === 'routing' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
                </button>
              </div>
              <div className="font-mono font-bold text-sm text-amber-300">
                {bankRoutingNumber}
              </div>
            </div>

          </div>

          {/* Instruction Notice Banner */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-amber-300 block mb-1">
                {isBn ? 'টাকা পাঠানোর পরবর্তী নির্দেশনা:' : 'Next Steps After Transfer:'}
              </span>
              <p className="leading-relaxed">
                {systemSettings.depositInstructions || (
                  isBn 
                    ? 'টাকা পাঠানোর পর প্রাপ্ত ব্যাংক ডিপোজিট স্লিপ অথবা মোবাইল ব্যাংকিং TrxID দিয়ে অ্যাপের "Deposits" অপশনে গিয়ে "Submit Deposit" বাটনে ক্লিক করে রিকোয়েস্ট পাঠিয়ে দিন। অ্যাডমিন যাচাই করে তা এপ্রুভ করবেন।'
                    : 'After transfer, submit your deposit voucher with TrxID from the Deposits menu for official admin verification.'
                )}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
