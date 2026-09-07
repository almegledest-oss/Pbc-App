import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Headphones, 
  MessageCircle, 
  Phone, 
  Building, 
  CreditCard, 
  Check, 
  Save, 
  ArrowLeft, 
  Clock, 
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AdminSupportSettingsViewProps {
  onBack: () => void;
}

export const AdminSupportSettingsView: React.FC<AdminSupportSettingsViewProps> = ({ onBack }) => {
  const { systemSettings, updateSystemSettings, language } = useApp();
  const isBn = language === 'bn';

  // Form state initialized from systemSettings
  const [formData, setFormData] = useState({
    // Support info
    supportWhatsAppGroupLink: systemSettings.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/PBC-Official-Club',
    supportOfficialWhatsApp: systemSettings.supportOfficialWhatsApp || '+8801700000000',
    supportRep1Name: systemSettings.supportRep1Name || 'সাপোর্ট প্রতিনিধি ১',
    supportRep1Title: systemSettings.supportRep1Title || 'অফিসিয়াল মেম্বার হেল্পলাইন',
    supportRep1Phone: systemSettings.supportRep1Phone || '+8801700000000',
    supportRep1WhatsApp: systemSettings.supportRep1WhatsApp || '+8801700000000',
    supportRep2Name: systemSettings.supportRep2Name || 'অর্থ বিষয়ক প্রতিনিধি',
    supportRep2Title: systemSettings.supportRep2Title || 'ডিপোজিট ও ভাউচার সাপোর্ট',
    supportRep2Phone: systemSettings.supportRep2Phone || '+8801800000000',
    supportRep2WhatsApp: systemSettings.supportRep2WhatsApp || '+8801800000000',
    supportWorkingHours: systemSettings.supportWorkingHours || 'সকাল ৯:০০ টা - রাত ৯:০০ টা (প্রতিদিন)',
    
    // Deposit accounts
    bkashNumber: systemSettings.bkashNumber || '01700000000',
    bkashName: systemSettings.bkashName || 'Probashi Business Club',
    bkashType: systemSettings.bkashType || 'Personal',
    nagadNumber: systemSettings.nagadNumber || '01800000000',
    nagadName: systemSettings.nagadName || 'Probashi Business Club',
    nagadType: systemSettings.nagadType || 'Personal',
    rocketNumber: systemSettings.rocketNumber || '01900000000',
    rocketName: systemSettings.rocketName || 'Probashi Business Club',
    rocketType: systemSettings.rocketType || 'Personal',
    
    bankName: systemSettings.bankName || 'Islami Bank Bangladesh PLC',
    bankAccountName: systemSettings.bankAccountName || 'Probashi Business Club',
    bankAccountNumber: systemSettings.bankAccountNumber || '2050XXXXXXXXXXXXX',
    bankBranchName: systemSettings.bankBranchName || 'Principal Branch, Dhaka',
    bankRoutingNumber: systemSettings.bankRoutingNumber || '125270000',
    depositInstructions: systemSettings.depositInstructions || 'টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি (TrxID) সংরক্ষণ করুন এবং অ্যাপের ডিপোজিট রিকোয়েস্টে সঠিক তথ্য দিন।'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    updateSystemSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-[#070D1B] hover:bg-[#112244] text-slate-300 hover:text-white border border-[#D4AF37]/30 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <Headphones className="w-6 h-6 text-amber-400" />
                <span>{isBn ? 'হেল্প ডেস্ক ও ডিপোজিট একাউন্টস কনফিগারেশন' : 'Help Desk & Deposit Accounts Settings'}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {isBn 
                  ? 'মেম্বারদের "Help Desk" ভিউতে প্রদর্শিত বিকাশ, নগদ, ব্যাংক ও WhatsApp তথ্য সম্পাদনা করুন' 
                  : 'Manage the official payment credentials and WhatsApp support contact channels seen by members'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-300 transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>{isBn ? 'সংরক্ষিত হয়েছে!' : 'Saved Successfully!'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isBn ? 'ডাটাবেজে সফলভাবে আপডেট সম্পন্ন হয়েছে! সকল মেম্বার তাৎক্ষণিকভাবে নতুন তথ্য দেখতে পাবেন।' : 'Settings updated in Firestore successfully!'}</span>
          </div>
        )}
      </div>

      {/* Form Section 1: Mobile Financial Services (bKash, Nagad, Rocket) */}
      <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-6">
        <div className="border-b border-[#D4AF37]/20 pb-3">
          <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>{isBn ? '১. মোবাইল ব্যাংকিং অ্যাকাউন্টস (MFS Accounts)' : '1. Mobile Banking Accounts'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? 'মেম্বাররা টাকা পাঠানোর জন্য এই নম্বরগুলো কপি করতে পারবে' : 'Members can copy these numbers for deposits'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* bKash */}
          <div className="p-4 bg-[#070D1B] rounded-2xl border border-pink-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-pink-400 text-sm">bKash (বিকাশ)</span>
              <select
                value={formData.bkashType}
                onChange={e => setFormData({ ...formData, bkashType: e.target.value as any })}
                className="bg-[#030712] border border-pink-500/40 rounded-lg text-pink-300 text-xs px-2 py-1 focus:outline-none"
              >
                <option value="Personal">Personal</option>
                <option value="Merchant">Merchant</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isBn ? 'অ্যাকাউন্টের নাম (Account Name):' : 'Account Name:'}
              </label>
              <input
                type="text"
                value={formData.bkashName}
                onChange={e => setFormData({ ...formData, bkashName: e.target.value })}
                placeholder="e.g. Probashi Business Club"
                className="w-full px-3 py-2 bg-[#030712] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">বিকাশ নম্বর (Phone Number):</label>
              <input
                type="text"
                value={formData.bkashNumber}
                onChange={e => setFormData({ ...formData, bkashNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#030712] border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Nagad */}
          <div className="p-4 bg-[#070D1B] rounded-2xl border border-orange-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-400 text-sm">Nagad (নগদ)</span>
              <select
                value={formData.nagadType}
                onChange={e => setFormData({ ...formData, nagadType: e.target.value as any })}
                className="bg-[#030712] border border-orange-500/40 rounded-lg text-orange-300 text-xs px-2 py-1 focus:outline-none"
              >
                <option value="Personal">Personal</option>
                <option value="Merchant">Merchant</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isBn ? 'অ্যাকাউন্টের নাম (Account Name):' : 'Account Name:'}
              </label>
              <input
                type="text"
                value={formData.nagadName}
                onChange={e => setFormData({ ...formData, nagadName: e.target.value })}
                placeholder="e.g. Probashi Business Club"
                className="w-full px-3 py-2 bg-[#030712] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">নগদ নম্বর (Phone Number):</label>
              <input
                type="text"
                value={formData.nagadNumber}
                onChange={e => setFormData({ ...formData, nagadNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#030712] border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Rocket */}
          <div className="p-4 bg-[#070D1B] rounded-2xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-400 text-sm">Rocket (রকেট)</span>
              <select
                value={formData.rocketType}
                onChange={e => setFormData({ ...formData, rocketType: e.target.value as any })}
                className="bg-[#030712] border border-purple-500/40 rounded-lg text-purple-300 text-xs px-2 py-1 focus:outline-none"
              >
                <option value="Personal">Personal</option>
                <option value="Merchant">Merchant</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isBn ? 'অ্যাকাউন্টের নাম (Account Name):' : 'Account Name:'}
              </label>
              <input
                type="text"
                value={formData.rocketName}
                onChange={e => setFormData({ ...formData, rocketName: e.target.value })}
                placeholder="e.g. Probashi Business Club"
                className="w-full px-3 py-2 bg-[#030712] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">রকেট নম্বর (Phone Number):</label>
              <input
                type="text"
                value={formData.rocketNumber}
                onChange={e => setFormData({ ...formData, rocketNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#030712] border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Form Section 2: Official Bank Account Details */}
      <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-6">
        <div className="border-b border-[#D4AF37]/20 pb-3">
          <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <span>{isBn ? '২. ক্লাবের অফিসিয়াল ব্যাংক অ্যাকাউন্ট (Bank Account Details)' : '2. Official Bank Account'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? 'BEFTN, RTGS বা সরাসরি ব্যাংক ডিপোজিটের জন্য' : 'For direct deposits and wire transfers'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {isBn ? 'ব্যাংকের নাম (Bank Name):' : 'Bank Name:'}
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={e => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. Islami Bank Bangladesh PLC"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {isBn ? 'অ্যাকাউন্টের নাম (Account Title):' : 'Account Title:'}
            </label>
            <input
              type="text"
              value={formData.bankAccountName}
              onChange={e => setFormData({ ...formData, bankAccountName: e.target.value })}
              placeholder="e.g. Probashi Business Club"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-amber-300 block mb-1.5">
              {isBn ? 'অ্যাকাউন্ট নম্বর (Account Number):' : 'Account Number:'}
            </label>
            <input
              type="text"
              value={formData.bankAccountNumber}
              onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              placeholder="e.g. 2050XXXXXXXXXXXXX"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border-2 border-amber-500/40 rounded-xl text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {isBn ? 'শাখা / ব্রাঞ্চের নাম (Branch Name):' : 'Branch Name:'}
            </label>
            <input
              type="text"
              value={formData.bankBranchName}
              onChange={e => setFormData({ ...formData, bankBranchName: e.target.value })}
              placeholder="e.g. Principal Branch, Dhaka"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {isBn ? 'রাউটিং নম্বর (Routing Number):' : 'Routing Number:'}
            </label>
            <input
              type="text"
              value={formData.bankRoutingNumber}
              onChange={e => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
              placeholder="e.g. 125270000"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {isBn ? 'ডিপোজিট পরবর্তী নির্দেশনা (Deposit Instructions):' : 'Deposit Instructions:'}
            </label>
            <textarea
              rows={2}
              value={formData.depositInstructions}
              onChange={e => setFormData({ ...formData, depositInstructions: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#070D1B] border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400"
            />
          </div>

        </div>
      </div>

      {/* Form Section 3: WhatsApp Group & Support Representatives */}
      <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-6">
        <div className="border-b border-[#D4AF37]/20 pb-3">
          <h3 className="text-base font-black text-emerald-400 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>{isBn ? '৩. হোয়াটসঅ্যাপ গ্রুপ ও প্রতিনিধি সাপোর্ট' : '3. WhatsApp Group & Support Representatives'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? 'মেম্বাররা সরাসরি গ্রুপে জয়েন করতে পারবে এবং প্রতিনিধিদের ফোন/WhatsApp এ কল দিতে পারবে' : 'Direct group link and click-to-chat contacts'}
          </p>
        </div>

        <div className="space-y-4">
          
          {/* WhatsApp Group Link */}
          <div>
            <label className="text-xs font-bold text-emerald-300 block mb-1.5">
              {isBn ? 'অফিসিয়াল WhatsApp গ্রুপের লিংক (WhatsApp Group Invite Link):' : 'Official WhatsApp Group Invite Link:'}
            </label>
            <input
              type="url"
              value={formData.supportWhatsAppGroupLink}
              onChange={e => setFormData({ ...formData, supportWhatsAppGroupLink: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Working Hours */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {isBn ? 'সাপোর্ট সময়সূচি (Support Working Hours):' : 'Support Working Hours:'}
            </label>
            <input
              type="text"
              value={formData.supportWorkingHours}
              onChange={e => setFormData({ ...formData, supportWorkingHours: e.target.value })}
              placeholder="e.g. সকাল ৯:০০ টা - রাত ৯:০০ টা (প্রতিদিন)"
              className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Representative 1 Grid */}
          <div className="p-4 bg-[#070D1B] rounded-2xl border border-amber-500/20 space-y-3">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              {isBn ? 'সাপোর্ট প্রতিনিধি ১ (Representative 1 - Helpline)' : 'Support Representative 1'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">প্রতিনিধির নাম:</label>
                <input
                  type="text"
                  value={formData.supportRep1Name}
                  onChange={e => setFormData({ ...formData, supportRep1Name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">পদবী / দায়িত্ব:</label>
                <input
                  type="text"
                  value={formData.supportRep1Title}
                  onChange={e => setFormData({ ...formData, supportRep1Title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ফোন নম্বর:</label>
                <input
                  type="text"
                  value={formData.supportRep1Phone}
                  onChange={e => setFormData({ ...formData, supportRep1Phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">WhatsApp নম্বর (International format):</label>
                <input
                  type="text"
                  value={formData.supportRep1WhatsApp}
                  onChange={e => setFormData({ ...formData, supportRep1WhatsApp: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Representative 2 Grid */}
          <div className="p-4 bg-[#070D1B] rounded-2xl border border-amber-500/20 space-y-3">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              {isBn ? 'সাপোর্ট প্রতিনিধি ২ (Representative 2 - Accounts & Deposit)' : 'Support Representative 2'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">প্রতিনিধির নাম:</label>
                <input
                  type="text"
                  value={formData.supportRep2Name}
                  onChange={e => setFormData({ ...formData, supportRep2Name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">পদবী / দায়িত্ব:</label>
                <input
                  type="text"
                  value={formData.supportRep2Title}
                  onChange={e => setFormData({ ...formData, supportRep2Title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ফোন নম্বর:</label>
                <input
                  type="text"
                  value={formData.supportRep2Phone}
                  onChange={e => setFormData({ ...formData, supportRep2Phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">WhatsApp নম্বর (International format):</label>
                <input
                  type="text"
                  value={formData.supportRep2WhatsApp}
                  onChange={e => setFormData({ ...formData, supportRep2WhatsApp: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#030712] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Save Button Bottom Banner */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl bg-[#070D1B] hover:bg-[#112244] text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
        >
          {isBn ? 'ফিরে যান' : 'Cancel / Back'}
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-950/40 border border-amber-300 transition duration-150 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isBn ? 'সকল পরিবর্তন সংরক্ষণ করুন' : 'Save All Settings'}</span>
        </button>
      </div>

    </div>
  );
};
