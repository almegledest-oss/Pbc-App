import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  Send, 
  Check, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  Zap,
  Info,
  Server
} from 'lucide-react';
import { sendTestEmailApi } from '../../services/emailService';

interface AdminEmailSettingsViewProps {
  onBack: () => void;
}

export const AdminEmailSettingsView: React.FC<AdminEmailSettingsViewProps> = ({ onBack }) => {
  const { systemSettings, updateSystemSettings, language, authUser, role, accountRole, currentMember } = useApp();
  const isBn = language === 'bn';

  const isSuperAdmin = role === 'super_admin' || accountRole === 'super_admin' || 
    (authUser?.email && (authUser.email.toLowerCase() === 'almegledest@gmail.com' || authUser.email.toLowerCase() === 'fokrulislammir9897@gmail.com')) ||
    (currentMember?.email && (currentMember.email.toLowerCase() === 'almegledest@gmail.com' || currentMember.email.toLowerCase() === 'fokrulislammir9897@gmail.com')) ||
    currentMember?.id === 'PBC-00000' || currentMember?.id === 'PBC-1001';

  // Guard: Strictly restricted to Super Admin only
  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-[#0B1528] rounded-3xl border border-rose-500/40 text-white space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-white">
          {isBn ? 'নিরাপত্তা সীমাবদ্ধতা (Super Admin Only)' : 'Restricted: Super Admin Only'}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isBn 
            ? 'সার্ভার SMTP কনফিগারেশন ও ক্লাবের অফিশিয়াল ইমেইল পরিবর্তনের অধিকার শুধুমাত্র প্রধান সুপার অ্যাডমিনের কাছে সংরক্ষিত।' 
            : 'Access to SMTP credentials and email delivery configuration is restricted exclusively to the Super Admin.'}
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
        >
          {isBn ? 'পিছনে যান' : 'Go Back'}
        </button>
      </div>
    );
  }

  // Form state
  const [formData, setFormData] = useState({
    enableWelcomeEmail: systemSettings.enableWelcomeEmail ?? true,
    enableDepositReceiptEmail: systemSettings.enableDepositReceiptEmail ?? true,
    senderName: systemSettings.senderName || 'Probashi Business Club (PBC)',
    senderEmail: systemSettings.senderEmail || 'fokrulislammir9897@gmail.com',
    smtpHost: systemSettings.smtpHost || 'smtp.gmail.com',
    smtpPort: systemSettings.smtpPort || 465,
    smtpSecure: systemSettings.smtpSecure ?? true,
    smtpUser: systemSettings.smtpUser || 'fokrulislammir9897@gmail.com',
    smtpPass: systemSettings.smtpPass || 'tqnt cqlj npjb zpal'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test email state
  const [testEmail, setTestEmail] = useState(authUser?.email || formData.senderEmail || 'almegledest@gmail.com');
  const [testLoading, setTestLoading] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [testErrorMessage, setTestErrorMessage] = useState<string | null>(null);

  const handleSave = () => {
    updateSystemSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      setTestErrorMessage(isBn ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid recipient email.');
      return;
    }

    setTestLoading(true);
    setTestSuccessMessage(null);
    setTestErrorMessage(null);

    const result = await sendTestEmailApi(testEmail.trim(), formData);

    setTestLoading(false);
    if (result.success) {
      setTestSuccessMessage(
        isBn 
          ? `সফল হয়েছে! ${testEmail} ঠিকানায় টেস্ট ইমেইল পৌঁছে গেছে। আপনার ইনবক্স চেক করুন।` 
          : `Success! Test email delivered to ${testEmail}. Please check your inbox.`
      );
    } else {
      setTestErrorMessage(
        result.error || (isBn ? 'ইমেইল পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে সেটিংস চেক করুন।' : 'Failed to send test email.')
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1528] p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#070D1B] hover:bg-amber-500/15 text-amber-400 border border-amber-500/30 transition cursor-pointer"
            title={isBn ? 'পিছনে যান' : 'Back'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">
                {isBn ? 'অটোমেটেড ইমেইল ও SMTP সেটিংস' : 'Automated Email & SMTP Settings'}
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isBn 
                ? 'ওয়েলকাম ইমেইল ও ডিপোজিট অনুমোদনের সাথে সাথে স্বয়ংক্রিয় PDF রসিদ পাঠানোর কনফিগারেশন' 
                : 'Configure automated welcome emails and deposit approval PDF receipts'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" />
              <span>{isBn ? 'সংরক্ষিত হয়েছে!' : 'Saved Successfully!'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Email Settings'}</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {isBn 
              ? 'ইমেইল কনফিগারেশন সফলভাবে ক্লাউড ডেটাবেজে সংরক্ষিত হয়েছে।' 
              : 'Email configuration successfully saved to cloud database.'}
          </span>
        </div>
      )}

      {/* Feature Automation Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feature 1: Welcome Email */}
        <div className="bg-[#0B1528] p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableWelcomeEmail}
                onChange={e => setFormData(prev => ({ ...prev, enableWelcomeEmail: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              {isBn ? '১. নতুন ইউজার স্বাগতম ইমেইল (Welcome Email)' : '1. New User Welcome Email'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isBn 
                ? 'নতুন মেম্বার সাইন-আপ করলে স্বয়ংক্রিয়ভাবে তার ইনবক্সে মেম্বার আইডি, ক্লাবের নিয়ম ও ব্যাংক/বিকাশ তথ্য সহ ইমেইল যাবে।' 
                : 'Automatically sends an official welcome email containing Member ID, club rules & deposit accounts upon signup.'}
            </p>
          </div>
          <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{isBn ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}</span>
            <span className={`font-bold ${formData.enableWelcomeEmail ? 'text-emerald-400' : 'text-slate-400'}`}>
              {formData.enableWelcomeEmail ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'বন্ধ (Disabled)' : 'Disabled')}
            </span>
          </div>
        </div>

        {/* Feature 2: Deposit PDF Receipt */}
        <div className="bg-[#0B1528] p-5 rounded-3xl border border-emerald-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableDepositReceiptEmail}
                onChange={e => setFormData(prev => ({ ...prev, enableDepositReceiptEmail: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              {isBn ? '২. ডিপোজিট অ্যাপ্রুভাল: অটোমেটিক PDF রসিদ ইমেইল' : '2. Deposit Approval: Auto PDF Receipt Email'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isBn 
                ? 'অ্যাডমিন ডিপোজিট Approve করলেই মিলি-সেকেন্ডে ভেরিফায়েড সিলযুক্ত ডাইনামিক PDF রসিদ তৈরি হয়ে ইউজারের ইমেইলে অ্যাটাচমেন্ট হিসেবে চলে যাবে।' 
                : 'Instantly generates an official verified PDF receipt and emails it as an attachment to the member upon deposit approval.'}
            </p>
          </div>
          <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{isBn ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}</span>
            <span className={`font-bold ${formData.enableDepositReceiptEmail ? 'text-emerald-400' : 'text-slate-400'}`}>
              {formData.enableDepositReceiptEmail ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'বন্ধ (Disabled)' : 'Disabled')}
            </span>
          </div>
        </div>
      </div>

      {/* SMTP Credentials Form */}
      <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#D4AF37]/30">
          <Server className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
            {isBn ? 'SMTP সার্ভার ও প্রেরক ইমেইল কনফিগারেশন' : 'SMTP Server & Sender Credentials'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              {isBn ? 'প্রেরকের নাম (Sender Display Name)' : 'Sender Display Name'}
            </label>
            <input
              type="text"
              value={formData.senderName}
              onChange={e => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
              placeholder="e.g. Probashi Business Club (PBC)"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              {isBn ? 'প্রেরক ইমেইল (Sender Email / From)' : 'Sender Email Address'}
            </label>
            <input
              type="email"
              value={formData.senderEmail}
              onChange={e => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
              placeholder="almegledest@gmail.com"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              {isBn ? 'SMTP Host' : 'SMTP Host'}
            </label>
            <input
              type="text"
              value={formData.smtpHost}
              onChange={e => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
              placeholder="smtp.gmail.com"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              {isBn ? 'SMTP Port' : 'SMTP Port'}
            </label>
            <input
              type="number"
              value={formData.smtpPort}
              onChange={e => setFormData(prev => ({ ...prev, smtpPort: Number(e.target.value) }))}
              placeholder="465"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              {isBn ? 'SMTP ব্যবহারকারী (Username / Gmail)' : 'SMTP Username / Account'}
            </label>
            <input
              type="email"
              value={formData.smtpUser}
              onChange={e => setFormData(prev => ({ ...prev, smtpUser: e.target.value }))}
              placeholder="almegledest@gmail.com"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span>{isBn ? '১৬ অক্ষরের App Password' : '16-Character App Password'}</span>
              <span className="text-[10px] text-amber-400 font-normal">Google Security App Pass</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.smtpPass}
                onChange={e => setFormData(prev => ({ ...prev, smtpPass: e.target.value }))}
                placeholder="abcd efgh ijkl mnop"
                className="w-full pl-3.5 pr-10 py-2.5 bg-[#070D1B] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-300 leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            {isBn 
              ? 'জিমেইল দিয়ে পাঠানোর জন্য আপনার গুগল একাউন্টে ২-স্টেপ ভেরিফিকেশন অন রেখে ১৬ অক্ষরের App Password ব্যবহার করতে হয়। আপনার দেওয়া পাসওয়ার্ডটি এখানে নিরাপদে এনক্রিপ্টেড আছে।' 
              : 'Gmail SMTP requires an active Google App Password generated from your Google Security console. Your credentials are securely processed on the backend server.'}
          </span>
        </div>
      </div>

      {/* Live Test Email Tool */}
      <div className="bg-[#0B1528] p-6 rounded-3xl border-2 border-emerald-500/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
            {isBn ? 'সরাসরি টেস্ট ইমেইল প্রেরণ (Live Delivery Test)' : 'Send Live Test Email'}
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          {isBn 
            ? 'সার্ভার ও SMTP কানেকশন ঠিকমতো কাজ করছে কিনা তা দেখতে নিচের বক্সে আপনার ইমেইল দিয়ে টেস্ট বাটনে চাপুন।' 
            : 'Verify your SMTP credentials by sending a live branded test email directly to your inbox.'}
        </p>

        <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="Enter your personal email to test"
              className="w-full pl-10 pr-3.5 py-3 bg-[#070D1B] border border-emerald-500/40 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={testLoading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {testLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending Test...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isBn ? 'টেস্ট ইমেইল পাঠান' : 'Send Test Email'}</span>
              </>
            )}
          </button>
        </form>

        {testSuccessMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{testSuccessMessage}</span>
          </div>
        )}

        {testErrorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{testErrorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
