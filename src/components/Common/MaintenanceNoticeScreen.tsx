import React, { useState } from 'react';
import { Wrench, ShieldAlert, RefreshCw, Lock, Sparkles, AlertTriangle, CheckCircle2, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PbcLogo } from './PbcLogo';

interface MaintenanceNoticeScreenProps {
  onOpenSuperAdminLogin?: () => void;
}

export const MaintenanceNoticeScreen: React.FC<MaintenanceNoticeScreenProps> = ({ onOpenSuperAdminLogin }) => {
  const { systemSettings, language, role, logout } = useApp();
  const [checkingStatus, setCheckingStatus] = useState(false);

  const defaultBnMessage = `সম্মানিত মেম্বারবৃন্দ,
অ্যাপটির নতুন সিকিউরিটি আপডেট ও সিস্টেম উন্নয়নের কাজ চলমান রয়েছে। সাময়িকভাবে সাধারণ মেম্বারদের জন্য লগইন ও অ্যাপের সেবা স্থগিত রাখা হয়েছে।

কাজ সম্পন্ন হওয়া মাত্রই অ্যাপটি পুনরায় স্বাভাবিকভাবে সচল করা হবে। আপনার ধৈর্য ও সহযোগিতার জন্য আন্তরিক ধন্যবাদ।`;

  const defaultEnMessage = `Dear Members,
Scheduled system maintenance & security updates are currently underway. Application access for general members is temporarily paused.

Normal service will resume as soon as the updates are complete. Thank you for your patience and cooperation.`;

  const displayMessage = systemSettings.maintenanceMessage || (language === 'bn' ? defaultBnMessage : defaultEnMessage);

  const handleRefresh = () => {
    setCheckingStatus(true);
    setTimeout(() => {
      setCheckingStatus(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-[#030712]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-[#09101E] border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 text-center overflow-hidden">
        
        {/* Top Header Logo & Badge */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-[#02050A] rounded-2xl border border-[#D4AF37]/30 shadow-inner">
            <PbcLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-black uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Wrench className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'bn' ? 'সিস্টেম আপডেট ও মেইনটেন্যান্স চলমান' : 'System Maintenance & Update Active'}</span>
          </div>
        </div>

        {/* Animated Icon Container */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/20 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-rose-500/30 to-amber-500/30 border-2 border-rose-500/60 rounded-3xl flex items-center justify-center text-rose-400 shadow-xl">
            <Wrench className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Notice Title */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
            {language === 'bn' ? '🛠️ অ্যাপ এ আপডেটের কাজ চলছে' : '🛠️ App Scheduled Maintenance'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-400 font-semibold">
            {language === 'bn' 
              ? 'সাময়িকভাবে সাধারণ মেম্বারদের জন্য অ্যাপ ব্যবহারের সেবা বন্ধ রাখা হয়েছে'
              : 'App access is temporarily restricted for general members'}
          </p>
        </div>

        {/* Main Custom Notice Message Box */}
        <div className="bg-[#040914] border border-slate-800 rounded-2xl p-5 text-left text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 shadow-inner">
          <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800/80 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'জরুরী নোটিশ (Maintenance Notice):' : 'Official Notice:'}</span>
          </div>
          <div className="whitespace-pre-line text-slate-300 font-medium">
            {displayMessage}
          </div>
        </div>

        {/* Expected Details Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                {language === 'bn' ? 'নতুন পারফরম্যান্স আপডেট' : 'Performance Upgrade'}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'bn' ? 'সিস্টেমের গতি ও নিরাপত্তা বাড়াতে স্পেশাল কাজ চলছে।' : 'Enhancing app speed and data security.'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                {language === 'bn' ? 'ডাটা সুরক্ষিত আছে' : 'Data Protected'}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'bn' ? 'আপনার সকল আমানত ও তথ্য ১০০% নিরাপদ ও অপরিবর্তিত আছে।' : 'All deposits and records remain 100% safe.'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={checkingStatus}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin text-amber-400' : ''}`} />
            <span>{checkingStatus ? (language === 'bn' ? 'চেক করা হচ্ছে...' : 'Checking...') : (language === 'bn' ? 'পুনরায় চেক করুন' : 'Refresh Status')}</span>
          </button>

          {onOpenSuperAdminLogin && (
            <button
              onClick={() => {
                if (role && role !== 'super_admin') {
                  logout();
                }
                onOpenSuperAdminLogin();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>{language === 'bn' ? 'এডমিন হিসেবে প্রবেশ করুন' : 'Super Admin Login'}</span>
            </button>
          )}

          {role && (
            <button
              onClick={logout}
              className="w-full sm:w-auto px-5 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-500 pt-1">
          Probashi Business Club (PBC) • System Maintenance Engine
        </p>
      </div>
    </div>
  );
};
