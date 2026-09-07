import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { PbcLogo } from '../Common/PbcLogo';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  Home, 
  Sparkles, 
  Languages, 
  ShieldAlert, 
  Layers,
  ChevronRight,
  User,
  Sliders
} from 'lucide-react';

interface FocusTopBarProps {
  onOpenNotifications?: () => void;
}

export const FocusTopBar: React.FC<FocusTopBarProps> = ({ onOpenNotifications }) => {
  const { currentTheme } = useTheme();
  const {
    activeTab,
    navigationHistory,
    currentNavState,
    previousNavState,
    canGoBack,
    goBack,
    navigateWithHistory,
    isFocusMode,
    toggleFocusMode,
    language,
    setLanguage,
    role,
    currentMember
  } = useApp();

  const getTabLabel = (tab?: string, isBn?: boolean) => {
    switch (tab) {
      case 'dashboard':
        return isBn ? 'ড্যাশবোর্ড' : 'Dashboard';
      case 'members':
        return isBn ? 'মেম্বারস' : 'Members';
      case 'deposits':
        return isBn ? 'ডিপোজিট হিস্ট্রি' : 'Deposits';
      case 'real_estate':
        return isBn ? 'ইনভেস্টমেন্টস' : 'Investments';
      case 'reports':
        return isBn ? 'রিপোর্টস' : 'Reports';
      case 'admin_panel':
        return isBn ? 'এডমিন প্যানেল' : 'Admin Panel';
      case 'directors':
        return isBn ? 'পরিচালনা পর্ষদ' : 'Directors';
      case 'active_now':
        return isBn ? 'অ্যাক্টিভ নাও' : 'Active Now';
      case 'my_profile':
        return isBn ? 'আমার প্রোফাইল' : 'My Profile';
      case 'help_desk':
        return isBn ? 'মেম্বার হেল্প ডেস্ক ও হোয়াটসঅ্যাপ' : 'Help Desk & WhatsApp Support';
      case 'deposit_accounts':
        return isBn ? 'অফিশিয়াল ডিপোজিট অ্যাকাউন্টসমূহ' : 'Official Deposit Accounts';
      case 'club_rules':
        return isBn ? 'নীতিমালা ও নিয়মাবলী' : 'Club Rules & By-Laws';
      default:
        return isBn ? 'পূর্বের স্ক্রিন' : 'Previous';
    }
  };

  const isBn = language === 'bn';
  const prevTitle = currentNavState.fromMoreMenu
    ? (isBn ? 'ড্যাশবোর্ড (মেনু)' : 'Dashboard (Menu)')
    : (previousNavState
        ? (isBn ? (previousNavState.titleBn || getTabLabel(previousNavState.tab, true)) : (previousNavState.title || getTabLabel(previousNavState.tab, false)))
        : (isBn ? 'ড্যাশবোর্ড' : 'Dashboard'));

  const currentTitle = isBn
    ? (currentNavState.titleBn || getTabLabel(currentNavState.tab, true))
    : (currentNavState.title || getTabLabel(currentNavState.tab, false));

  return (
    <header className={`sticky top-0 z-40 w-full ${currentTheme.mode === 'light' ? 'bg-white/95 text-slate-900 border-b border-amber-500/30' : 'bg-[#070D1B]/95 border-b border-[#D4AF37]/30 text-white'} backdrop-blur-xl shadow-2xl transition-all`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Left Side: Back Button & Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Step-by-Step Back Button */}
          {canGoBack ? (
            <button
              type="button"
              onClick={() => goBack()}
              className={`flex items-center gap-1.5 px-3 py-2 ${
                currentTheme.mode === 'light'
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border-amber-500/40'
                  : 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 text-amber-300 hover:text-amber-200 border-amber-500/40'
              } rounded-xl border shadow-sm transition active:scale-95 cursor-pointer shrink-0 font-bold text-xs sm:text-sm`}
              title={isBn ? `পেছনে যান: ${prevTitle}` : `Go back to ${prevTitle}`}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="font-extrabold flex items-center gap-1">
                <span>{isBn ? 'পেছনে' : 'Back'}</span>
                <span className={`hidden md:inline text-[11px] ${currentTheme.mode === 'light' ? 'text-amber-800' : 'text-amber-400/80'} font-normal`}>
                  ({prevTitle})
                </span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigateWithHistory('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 ${
                currentTheme.mode === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-amber-800 border-amber-500/30'
                  : 'bg-[#0B1528] hover:bg-[#112244] text-slate-300 hover:text-amber-300 border-[#D4AF37]/30'
              } rounded-xl border transition active:scale-95 cursor-pointer shrink-0 text-xs font-bold`}
              title={isBn ? 'ড্যাশবোর্ডে ফিরে যান' : 'Go to Dashboard'}
            >
              <Home className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{isBn ? 'হোম' : 'Home'}</span>
            </button>
          )}

          {/* Breadcrumb Path & Current Section Title */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => navigateWithHistory('dashboard')}
              className={`hidden lg:flex items-center gap-1 text-xs ${currentTheme.mode === 'light' ? 'text-slate-500 hover:text-amber-800' : 'text-slate-400 hover:text-amber-300'} transition shrink-0`}
            >
              <span>PBC</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <h2 className={`text-xs sm:text-sm md:text-base font-black ${currentTheme.mode === 'light' ? 'text-slate-900' : 'text-white'} truncate tracking-wide`}>
                {currentTitle}
              </h2>
            </div>
            {isFocusMode && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-black tracking-wider uppercase shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                Focus Mode
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Simple & Clean Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Home Button */}
          <button
            type="button"
            onClick={() => navigateWithHistory('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${
              currentTheme.mode === 'light'
                ? 'text-slate-700 hover:text-amber-800 bg-slate-50 hover:bg-slate-100 border-amber-500/30'
                : 'text-slate-300 hover:text-amber-300 bg-[#0B1528] hover:bg-[#112244] border-[#D4AF37]/30'
            } rounded-xl border transition cursor-pointer active:scale-95 shadow-sm`}
            title={isBn ? 'ড্যাশবোর্ডে ফিরে যান' : 'Go to Dashboard'}
          >
            <Home className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{isBn ? 'হোম' : 'Home'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
