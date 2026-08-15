import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  CreditCard
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
    theme, 
    setTheme, 
    viewMode, 
    setViewMode, 
    setIsSearchOpen,
    notifications,
    currentMember,
    authUser,
    setActiveTab,
    logout
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const labels = t[language];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#070D1B] border-b border-[#D4AF37]/30 h-16 sm:h-20 flex items-center px-3 sm:px-6 lg:px-8 transition-colors text-white shadow-xl w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-full flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        
        {/* Left: Branding (Mobile view / Header title) */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer md:hidden shrink-0" onClick={() => setActiveTab('dashboard')}>
          <PbcLogo variant="gold" className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 shadow-md" />
          <div className="flex flex-col">
            <h1 className="text-xs xs:text-sm sm:text-base font-black tracking-wider text-white uppercase leading-tight whitespace-nowrap">
              PROBASHI <span className="text-[#E5A93C]">BUSINESS CLUB</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-amber-300/80 font-bold tracking-[0.15em] uppercase">
              Official Portal
            </p>
          </div>
        </div>

        {/* Center: Search Trigger Bar */}
        {(role === 'super_admin' || role === 'admin') && (
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-300 bg-[#0B1528] hover:bg-[#112244] rounded-full border border-[#D4AF37]/30 transition shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-400">{labels.searchPlaceholder}</span>
              </div>
              <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#070D1B] border border-amber-500/30 rounded-md text-amber-300 shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Right Actions & Switches */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">

          {/* Quick Search Mobile Icon */}
          {(role === 'super_admin' || role === 'admin') && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-1.5 text-slate-300 hover:bg-[#112244] rounded-lg border border-[#D4AF37]/20"
            >
              <Search className="w-4 h-4 text-amber-400" />
            </button>
          )}

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

          {/* Role Mode Switcher Dropdown (Admin / Member Mode) - Desktop Only (on mobile accessible via More) */}
          {(accountRole === 'super_admin' || accountRole === 'admin' || role === 'super_admin' || role === 'admin') && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs border ${
                  role === 'member'
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
                title="Switch between Admin Mode and Member Mode"
              >
                {role === 'member' ? (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{role === 'member' ? (language === 'bn' ? 'মেম্বার' : 'Member') : (role === 'super_admin' ? (language === 'bn' ? 'সিস্টেম অ্যাডমিন' : 'System Admin') : 'Admin')}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Switch Mode (রোল নির্বাচন)</p>
                    <p className="text-slate-200 font-bold truncate">
                      {authUser?.displayName || (accountRole === 'super_admin' ? 'Fokrul Islam Mir' : currentMember?.fullName) || 'Admin User'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      switchRoleMode(accountRole === 'super_admin' ? 'super_admin' : 'admin');
                      setActiveTab('admin_panel');
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

          {/* Theme Switcher (Dark / Light) - Desktop/Tablet */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#0B1528] hover:bg-[#112244] rounded-xl border border-[#D4AF37]/30 transition cursor-pointer"
            title={theme === 'light' ? "Switch to Dark Mode (ডার্ক মোড)" : "Switch to Light Mode (লাইট মোড)"}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-slate-200">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="text-amber-400">Light</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 text-slate-300 hover:bg-[#112244] rounded-xl border border-[#D4AF37]/20 transition"
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
    </header>
  );
};
