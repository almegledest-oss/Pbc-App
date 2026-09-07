import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import { PbcLogo } from './Common/PbcLogo';
import { PBCFramedAvatar } from './Common/PBCFramedAvatar';
import { 
  Building2, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Smartphone, 
  Monitor, 
  ShieldAlert, 
  UserCheck, 
  LogOut, 
  Check,
  ChevronDown,
  CreditCard,
  Wallet,
  Users,
  Briefcase,
  Languages
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const { 
    role, 
    accountRole,
    setRole, 
    switchRoleMode,
    language, 
    setLanguage, 
    viewMode, 
    setViewMode, 
    setIsSearchOpen,
    notifications,
    currentMember,
    authUser,
    setActiveTab,
    logout,
    stats,
    members
  } = useApp();
  const { currentTheme, setAppTheme } = useTheme();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const mobileLangDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      const insideDesktop = langDropdownRef.current && langDropdownRef.current.contains(target);
      const insideMobile = mobileLangDropdownRef.current && mobileLangDropdownRef.current.contains(target);
      
      if (!insideDesktop && !insideMobile) {
        setIsLangDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const labels = t[language];
  const unreadCount = notifications.filter(n => !n.read).length;

  const totalDepositsVal = stats?.totalDeposits || 0;
  const totalMembersVal = (members || []).length || stats?.totalMembers || 0;
  const totalInvestedVal = stats?.totalInvestment || 0;

  return (
    <header className={`sticky top-0 z-30 ${currentTheme.mode === 'light' ? 'bg-white/95 text-slate-900 border-b border-amber-500/30' : 'bg-[#070D1B] border-b border-[#D4AF37]/30 text-white'} transition-colors shadow-xl w-full max-w-full pt-safe safe-area-top`}>
      {/* Main Top Header Bar */}
      <div className="h-14 sm:h-20 flex items-center px-3 sm:px-6 lg:px-8 justify-between gap-2 sm:gap-4 min-w-0">
        
        {/* Left: Branding (Mobile view / Header title) */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
          <PbcLogo variant="gold" className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 shadow-md" />
          <div className="flex flex-col">
            <h1 className={`text-xs xs:text-sm sm:text-base font-black tracking-wider ${currentTheme.mode === 'light' ? 'text-slate-900' : 'text-white'} uppercase leading-tight whitespace-nowrap`}>
              PROBASHI <span className="text-[#E5A93C]">BUSINESS CLUB</span>
            </h1>
            <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-amber-500 font-bold tracking-[0.15em] uppercase">
              Official Portal
            </p>
          </div>
        </div>

        {/* Center: Live Quick Stats & Language Button (Desktop/Tablet Only) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Stats Pill */}
          <div className={`flex items-center gap-3.5 px-3.5 py-1.5 rounded-full ${currentTheme.mode === 'light' ? 'bg-slate-50 border border-amber-500/40 text-slate-800' : 'bg-[#0B1528] border border-[#D4AF37]/40'} shadow-md`}>
            {/* Total Deposits */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Wallet className="w-3 h-3" />
              </div>
              <span className="text-slate-400 font-medium">{language === 'bn' ? 'মোট জমা:' : 'Deposits:'}</span>
              <span className="font-extrabold text-emerald-400 tracking-tight">৳{totalDepositsVal.toLocaleString()}</span>
            </div>

            <div className="w-[1px] h-3.5 bg-slate-700" />

            {/* Total Members */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Users className="w-3 h-3" />
              </div>
              <span className="text-slate-400 font-medium">{language === 'bn' ? 'সদস্য:' : 'Members:'}</span>
              <span className="font-extrabold text-blue-400 tracking-tight">{totalMembersVal} {language === 'bn' ? 'জন' : ''}</span>
            </div>

            <div className="w-[1px] h-3.5 bg-slate-700" />

            {/* Total Invested */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Briefcase className="w-3 h-3" />
              </div>
              <span className="text-slate-400 font-medium">{language === 'bn' ? 'বিনিয়োগ:' : 'Invested:'}</span>
              <span className="font-extrabold text-amber-400 tracking-tight">৳{totalInvestedVal.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Language Switcher Dropdown (Desktop/Tablet) */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLangDropdownOpen(!isLangDropdownOpen);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1528] hover:bg-[#112244] border border-[#D4AF37]/60 text-xs font-bold text-amber-400 transition-all cursor-pointer shadow-md group active:scale-95"
              title={language === 'bn' ? 'ভাষা পরিবর্তন করুন (Language)' : 'Change Language'}
            >
              <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:rotate-45 transition-transform">
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
              <span className="text-amber-300 font-extrabold text-xs tracking-wide">
                {language === 'bn' ? 'বাংলা' : 'EN'}
              </span>
              <ChevronDown className={`w-3 h-3 text-amber-400/80 group-hover:text-amber-300 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180 text-amber-300' : ''}`} />
            </button>

            {/* Language Dropdown Menu */}
            {isLangDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-36 bg-[#070D1B] border border-[#D4AF37]/50 rounded-2xl p-1.5 shadow-2xl shadow-black/90 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage('bn');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === 'bn'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#112244]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🇧🇩</span>
                    <span>বাংলা</span>
                  </div>
                  {language === 'bn' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage('en');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all mt-1 cursor-pointer ${
                    language === 'en'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#112244]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌐</span>
                    <span>English</span>
                  </div>
                  {language === 'en' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions & Switches */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Language Button with Globe & ChevronDown (Always visible on mobile in header!) */}
          <div className="relative md:hidden" ref={mobileLangDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLangDropdownOpen(!isLangDropdownOpen);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0B1528] border border-[#D4AF37]/50 text-xs font-bold text-amber-400 active:scale-95 shadow-sm cursor-pointer"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-black text-amber-300">{language === 'bn' ? 'বাং' : 'EN'}</span>
              <ChevronDown className={`w-3 h-3 text-amber-400/80 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Dropdown Menu */}
            {isLangDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-32 bg-[#070D1B] border border-[#D4AF37]/50 rounded-2xl p-1 shadow-2xl shadow-black/90 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage('bn');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === 'bn'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-[#112244]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🇧🇩</span>
                    <span>বাংলা</span>
                  </div>
                  {language === 'bn' && <Check className="w-3 h-3 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage('en');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all mt-1 cursor-pointer ${
                    language === 'en'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-[#112244]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🌐</span>
                    <span>English</span>
                  </div>
                  {language === 'en' && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Quick Theme Toggle Button (Mobile) - Switch between Royal Dark & Ivory White & Gold */}
          <button
            type="button"
            onClick={() => {
              if (currentTheme.mode === 'dark') {
                setAppTheme('pearl-white-gold');
              } else {
                setAppTheme('pbc-royal-gold');
              }
            }}
            className={`md:hidden p-1.5 rounded-xl ${currentTheme.mode === 'light' ? 'bg-amber-50 border-amber-500/50 text-amber-800' : 'bg-[#0B1528] border-[#D4AF37]/50 text-amber-300'} border active:scale-95 transition cursor-pointer shadow-xs`}
            title={currentTheme.mode === 'dark' ? (language === 'bn' ? 'সাদা-গোল্ডেন থিম চালু করুন' : 'Switch to White & Gold Theme') : (language === 'bn' ? 'রয়েল ডার্ক থিমে ফিরে যান' : 'Switch to Royal Dark Theme')}
          >
            {currentTheme.mode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {/* Quick Search Mobile Icon */}
          {(role === 'super_admin' || role === 'admin') && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`md:hidden p-1.5 ${currentTheme.mode === 'light' ? 'text-slate-700 hover:bg-amber-500/10 border-amber-500/30' : 'text-slate-300 hover:bg-[#112244] border-[#D4AF37]/20'} rounded-lg border active:scale-95`}
            >
              <Search className="w-4 h-4 text-amber-500" />
            </button>
          )}

          {/* Desktop/Tablet Quick Theme Toggle (Ivory White & Gold <-> Royal Dark) */}
          <button
            type="button"
            onClick={() => {
              if (currentTheme.mode === 'dark') {
                setAppTheme('pearl-white-gold');
              } else {
                setAppTheme('pbc-royal-gold');
              }
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${
              currentTheme.mode === 'light' 
                ? 'bg-amber-50 hover:bg-amber-100 text-slate-800 border-amber-500/40' 
                : 'bg-[#0B1528] hover:bg-[#112244] text-slate-200 border-[#D4AF37]/40'
            } rounded-xl border transition shadow-sm active:scale-95 cursor-pointer group`}
            title={
              currentTheme.mode === 'dark'
                ? (language === 'bn' ? 'আইভরি হোয়াইট ও গোল্ডেন থিমে স্যুইচ করুন' : 'Switch to Ivory White & Gold Theme')
                : (language === 'bn' ? 'রয়েল ডার্ক থিমে স্যুইচ করুন' : 'Switch to Royal Dark Theme')
            }
          >
            {currentTheme.mode === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="text-amber-300 font-extrabold text-xs tracking-wide">
                  {language === 'bn' ? 'সাদা-গোল্ডেন' : 'White & Gold'}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-600 group-hover:-rotate-12 transition-transform" />
                <span className="text-slate-800 font-extrabold text-xs tracking-wide">
                  {language === 'bn' ? 'রয়েল ডার্ক' : 'Royal Dark'}
                </span>
              </>
            )}
          </button>

          {/* Mobile Frame Simulator Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile_frame' : 'desktop')}
            title={viewMode === 'desktop' ? "Switch to Phone Simulator" : "Switch to Full Desktop"}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#0B1528] hover:bg-[#112244] rounded-xl border border-[#D4AF37]/30 transition"
          >
            {viewMode === 'desktop' ? (
              <>
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Phone View</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>Desktop View</span>
              </>
            )}
          </button>

          {/* Role Mode Switcher Dropdown (Admin / Member Mode) - Desktop Only */}
          {(accountRole === 'super_admin' || accountRole === 'admin' || role === 'super_admin' || role === 'admin') && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#0B1528] hover:bg-[#112244] rounded-xl border border-[#D4AF37]/30 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="capitalize">{role === 'super_admin' ? 'Super Admin' : role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#070D1B] rounded-2xl shadow-2xl border border-[#D4AF37]/40 p-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    ভিউ মোড পরিবর্তন করুন
                  </div>
                  <button
                    onClick={() => {
                      switchRoleMode('admin');
                      setActiveTab('dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold transition ${
                      role !== 'member'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="font-bold">Admin Mode</div>
                        <div className="text-[10px] text-slate-400 font-normal">অ্যাডমিন প্যানেল ও অডিট</div>
                      </div>
                    </div>
                    {role !== 'member' && <Check className="w-4 h-4 text-amber-500" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRoleMode('member');
                      setActiveTab('dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold transition ${
                      role === 'member'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="font-bold">Member Mode</div>
                        <div className="text-[10px] text-slate-400 font-normal">নিজের জমা ও প্রোফাইল</div>
                      </div>
                    </div>
                    {role === 'member' && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Language Toggle (EN / BN) - Desktop/Tablet */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#0B1528] hover:bg-[#112244] rounded-xl border border-[#D4AF37]/30 transition"
            title="Toggle Bangla / English Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 text-slate-300 hover:bg-[#112244] rounded-xl border border-[#D4AF37]/20 transition active:scale-95"
            title={labels.notifications}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Logout Button */}
          <button
            onClick={() => logout()}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-extrabold text-rose-300 bg-rose-500/15 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-500/40 transition cursor-pointer active:scale-95 shadow-xs"
            title={language === 'bn' ? 'সাইন আউট / লগআউট করুন' : 'Sign Out / Logout'}
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] font-bold">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
          </button>

          {/* User Profile Avatar Dropdown - Desktop/Tablet */}
          <div className="relative ml-0.5 hidden sm:block">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <PBCFramedAvatar
                photoUrl={currentMember?.photoUrl}
                name={currentMember?.fullName}
                alt={currentMember?.fullName || 'User Profile'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2E7D32]"
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#070D1B] rounded-2xl shadow-2xl border border-[#D4AF37]/50 py-2 z-50">
                <div className="px-4 py-2 border-b border-amber-500/20">
                  <p className="text-xs font-bold text-white truncate">
                    {currentMember?.fullName || 'PBC Club Member'}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                    <span>{currentMember?.id || 'PBC-1001'}</span>
                    <span className="text-amber-400 font-semibold">{currentMember?.country || 'Global'}</span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('my_profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/10 text-slate-200 hover:text-amber-300 font-medium transition cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>{labels.digitalMemberCard}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('my_profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/10 text-slate-200 hover:text-amber-300 font-medium transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>{labels.myProfile}</span>
                </button>

                {(role === 'super_admin' || role === 'admin') && (
                  <button
                    onClick={() => {
                      setActiveTab('admin_panel');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/20 text-amber-300 font-bold transition cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Admin Panel (অ্যাডমিন প্যানেল)</span>
                  </button>
                )}

                <div className="border-t border-amber-500/20 mt-1.5 pt-1.5 px-2">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-center px-3 py-2 text-xs flex items-center justify-center gap-2 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl font-bold transition cursor-pointer border border-rose-500/40"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{language === 'bn' ? 'সাইন আউট / লগআউট করুন' : 'Sign Out / Logout'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE ONLY LIVE STATS CAPSULE (Floating Rounded Pill on phone screens) */}
      <div className="md:hidden px-3 py-1.5 bg-[#070D1B]">
        <div className="bg-[#0B1528] border border-[#D4AF37]/50 rounded-full px-3 py-1.5 flex items-center justify-around text-xs shadow-lg shadow-black/50">
          {/* Total Deposits */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Wallet className="w-2.5 h-2.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-semibold leading-none">{language === 'bn' ? 'মোট জমা' : 'Deposit'}</span>
              <span className="font-black text-emerald-400 text-[11px] leading-tight tracking-tight">৳{totalDepositsVal.toLocaleString()}</span>
            </div>
          </div>

          <div className="w-[1px] h-4 bg-slate-700/80 shrink-0" />

          {/* Total Members */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <Users className="w-2.5 h-2.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-semibold leading-none">{language === 'bn' ? 'সদস্য' : 'Members'}</span>
              <span className="font-black text-blue-400 text-[11px] leading-tight tracking-tight">{totalMembersVal} {language === 'bn' ? 'জন' : ''}</span>
            </div>
          </div>

          <div className="w-[1px] h-4 bg-slate-700/80 shrink-0" />

          {/* Total Invested */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Briefcase className="w-2.5 h-2.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-semibold leading-none">{language === 'bn' ? 'বিনিয়োগ' : 'Invested'}</span>
              <span className="font-black text-amber-400 text-[11px] leading-tight tracking-tight">৳{totalInvestedVal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
