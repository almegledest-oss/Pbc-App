import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import { PbcLogo } from './Common/PbcLogo';
import { PBCFramedAvatar } from './Common/PBCFramedAvatar';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Building2, 
  PieChart, 
  Shield, 
  User, 
  CreditCard,
  LogOut,
  MoreHorizontal,
  X,
  Globe,
  Moon,
  Sun,
  ShieldAlert,
  UserCheck,
  Trash2,
  ChevronRight,
  Crown,
  Activity,
  Camera,
  Sparkles,
  Headphones,
  MessageCircle,
  BookOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    navigateWithHistory,
    role, 
    accountRole, 
    canManageDirectors,
    setIsTrashBoxOpen,
    canAccessTrashBox,
    switchRoleMode, 
    language, 
    setLanguage,
    theme,
    setTheme,
    currentMember,
    authUser,
    logout,
    activeSessions = [],
    isMoreMenuOpen: isMoreOpen,
    setIsMoreMenuOpen: setIsMoreOpen
  } = useApp();
  const { currentTheme, setAppTheme } = useTheme();
  
  const labels = t[language];

  // Check if user has admin/super_admin privileges
  const isAdmin = role === 'super_admin' || role === 'admin' || accountRole === 'super_admin' || accountRole === 'admin';

  // Calculate live online users count
  const nowMs = new Date().getTime();
  const onlineCount = activeSessions.filter(s => s.isOnline && (nowMs - new Date(s.lastActive).getTime()) <= 10 * 60 * 1000).length;

  // Desktop Navigation Items
  const desktopNavItems = role === 'member'
    ? [
        { id: 'dashboard', label: labels.dashboard, icon: LayoutDashboard },
        { id: 'my_profile', label: labels.myProfile, icon: User },
        { id: 'deposits', label: 'My Deposits', icon: Wallet },
        { id: 'real_estate', label: 'Approved Investments', icon: Building2 },
        { id: 'club_rules', label: language === 'bn' ? 'নীতিমালা ও গঠনতন্ত্র' : 'Club Rules & By-Laws', icon: BookOpen },
        { id: 'help_desk', label: language === 'bn' ? 'হেল্প ডেস্ক ও অ্যাকাউন্টস' : 'Help Desk & Accounts', icon: Headphones }
      ]
    : [
        { id: 'dashboard', label: labels.dashboard, icon: LayoutDashboard },
        { id: 'members', label: labels.members, icon: Users },
        { id: 'deposits', label: labels.deposits, icon: Wallet },
        { id: 'real_estate', label: 'Investments', icon: Building2 },
        { id: 'club_rules', label: language === 'bn' ? 'নীতিমালা ও গঠনতন্ত্র' : 'Club Rules & By-Laws', icon: BookOpen },
        { id: 'reports', label: labels.reports, icon: PieChart },
        ...(role === 'super_admin' || role === 'admin'
          ? [
              { id: 'admin_panel', label: labels.adminPanel, icon: Shield },
              { id: 'active_now', label: language === 'bn' ? `অ্যাক্টিভ নাও (${onlineCount})` : `Active Now (${onlineCount})`, icon: Activity }
            ]
          : []),
        { id: 'help_desk', label: language === 'bn' ? 'হেল্প ডেস্ক ও অ্যাকাউন্টস' : 'Help Desk & Accounts', icon: Headphones },
        { id: 'my_profile', label: labels.myProfile, icon: User }
      ];

  // Fixed 5 items for Mobile Bottom Nav:
  // 1. Dashboard (ড্যাশবোর্ড)
  // 2. Members (মেম্বারস)
  // 3. Deposits (ডিপোজিটস)
  // 4. Investments (ইনভেস্টমেন্ট)
  // 5. More (আরো)
  const mobileBottomNavItems = [
    { id: 'dashboard', label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: language === 'bn' ? 'মেম্বারস' : 'Members', icon: Users },
    { id: 'deposits', label: language === 'bn' ? 'ডিপোজিটস' : 'Deposits', icon: Wallet },
    { id: 'real_estate', label: language === 'bn' ? 'ইনভেস্টমেন্ট' : 'Investments', icon: Building2 },
  ];

  return (
    <>
      {/* Desktop Navigation Sidebar - Royal Navy & Gold Theme */}
      <aside className={`hidden md:flex flex-col w-64 ${currentTheme.mode === 'light' ? 'bg-white text-slate-900 border-r border-amber-500/30' : 'bg-[#070D1B] text-white border-r border-[#D4AF37]/20'} shrink-0 shadow-2xl transition-colors`}>
        {/* Brand Header */}
        <div className={`p-5 border-b ${currentTheme.mode === 'light' ? 'bg-slate-50 border-amber-500/20' : 'border-[#D4AF37]/20 bg-[#030712]/50'}`}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <PbcLogo variant="gold" className="w-12 h-12 shrink-0" />
            <div>
              <h1 className={`${currentTheme.mode === 'light' ? 'text-slate-900' : 'text-white'} font-extrabold text-sm sm:text-base tracking-wider leading-tight uppercase`}>
                PROBASHI <span className="text-[#E5A93C]">BUSINESS CLUB</span>
              </h1>
              <p className="text-[10px] text-amber-500 font-bold tracking-[0.2em] uppercase mt-0.5">
                Official Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? (currentTheme.mode === 'light' 
                        ? 'bg-amber-50 text-amber-900 border border-amber-500/80 shadow-md font-bold' 
                        : 'bg-gradient-to-r from-[#112244] to-[#0E1B38] text-amber-300 border border-[#D4AF37]/80 shadow-lg shadow-amber-500/10 font-bold')
                    : (currentTheme.mode === 'light' 
                        ? 'text-slate-600 hover:bg-amber-500/10 hover:text-amber-800' 
                        : 'text-slate-300 hover:bg-amber-500/10 hover:text-amber-200')
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}



          {/* Trash Box Button for Super Admin and Allowed Admins */}
          {(role === 'super_admin' || canAccessTrashBox) && (
            <button
              onClick={() => setIsTrashBoxOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-rose-500/20 text-amber-300 border border-amber-500/40 shadow-sm mt-3"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-amber-400" />
                <span>{language === 'bn' ? 'ট্র্যাশ বক্স' : 'Trash Box'}</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-md font-extrabold border border-amber-500/30">
                Recovery
              </span>
            </button>
          )}
        </nav>

        {/* Current Role & Mode Switcher Badge */}
        <div className="p-4">
          <div className={`${currentTheme.mode === 'light' ? 'bg-slate-50 border-amber-500/30 text-slate-800' : 'bg-[#030816] border-[#D4AF37]/30 text-white'} rounded-2xl p-4 border space-y-2`}>
            {(accountRole === 'super_admin' || accountRole === 'admin') ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] ${currentTheme.mode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest font-bold`}>
                    Active Mode
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 capitalize">
                    {role === 'member' ? 'Member Mode' : 'Admin Mode'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextMode = role === 'member' ? (accountRole === 'super_admin' ? 'super_admin' : 'admin') : 'member';
                    switchRoleMode(nextMode);
                    setActiveTab(nextMode === 'member' ? 'dashboard' : 'admin_panel');
                  }}
                  className="w-full mt-1.5 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer"
                >
                  <span>Switch to {role === 'member' ? 'Admin Mode' : 'Member Mode'}</span>
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 pt-2 border-t border-amber-500/20">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className={`text-[11px] ${currentTheme.mode === 'light' ? 'text-slate-600 font-semibold' : 'text-slate-300 font-medium'}`}>System Online</span>
                </div>
              </div>

              {/* Theme Toggle Button in Desktop Sidebar */}
              <button
                type="button"
                onClick={() => {
                  if (currentTheme.mode === 'dark') {
                    setAppTheme('pearl-white-gold');
                  } else {
                    setAppTheme('pbc-royal-gold');
                  }
                }}
                className={`w-full py-2 px-3 ${currentTheme.mode === 'light' ? 'bg-amber-50 hover:bg-amber-100/80 text-slate-800 border-amber-500/40' : 'bg-[#0B1528] hover:bg-[#112244] text-slate-200 hover:text-amber-300 border-[#D4AF37]/30'} font-bold text-xs rounded-xl transition flex items-center justify-between border cursor-pointer shadow-xs active:scale-95 group`}
                title={currentTheme.mode === 'dark' ? (language === 'bn' ? 'সাদা-গোল্ডেন থিম চালু করুন' : 'Switch to White & Gold Theme') : (language === 'bn' ? 'রয়েল ডার্ক থিমে ফিরে যান' : 'Switch to Royal Dark Theme')}
              >
                <div className="flex items-center gap-2">
                  {currentTheme.mode === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-amber-600 group-hover:-rotate-12 transition-transform" />
                  )}
                  <span>
                    {currentTheme.mode === 'dark'
                      ? (language === 'bn' ? 'সাদা-গোল্ডেন থিম' : 'White & Gold Theme')
                      : (language === 'bn' ? 'রয়েল ডার্ক থিম' : 'Royal Dark Theme')}
                  </span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                  {currentTheme.mode === 'dark' ? 'Light' : 'Dark'}
                </span>
              </button>

              <button 
                onClick={() => logout()}
                className="w-full py-2 px-3 bg-rose-500/15 hover:bg-rose-600 text-rose-500 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-rose-500/30 cursor-pointer shadow-xs active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>{language === 'bn' ? 'সাইন আউট করুন' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Strict 5 Buttons: Dashboard, Members, Deposits, Admin/Investment, More) */}
      {activeTab === 'dashboard' && (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${currentTheme.mode === 'light' ? 'bg-white/95 text-slate-800 border-t border-amber-500/40 shadow-slate-200' : 'bg-[#070D1B]/95 text-white border-t border-[#D4AF37]/40'} backdrop-blur-xl px-1 py-1.5 flex items-center justify-around shadow-2xl`}>
          {mobileBottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isMoreOpen;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsMoreOpen(false);
                  // If member clicks Admin Panel, ensure appropriate tab action or prompt
                  if (item.id === 'admin_panel' && role === 'member' && (accountRole === 'super_admin' || accountRole === 'admin')) {
                    switchRoleMode(accountRole === 'super_admin' ? 'super_admin' : 'admin');
                  }
                  setActiveTab(item.id as any);
                }}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition shrink-0 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50 shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-[10px] tracking-tight whitespace-nowrap font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* 5th Button: MORE (মোর) with Update Badge */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition shrink-0 ${
              isMoreOpen
                ? 'bg-amber-500/25 text-amber-300 font-extrabold border border-amber-400/60 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className={`w-5 h-5 ${isMoreOpen ? 'text-amber-300 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <span className="text-[10px] tracking-tight whitespace-nowrap font-bold">
              {language === 'bn' ? 'আরো' : 'More'}
            </span>
          </button>
        </nav>
      )}

      {/* Mobile MORE Drawer Popup Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          {/* Backdrop Click */}
          <div className="flex-1" onClick={() => setIsMoreOpen(false)} />

          {/* Drawer Box */}
          <div className={`${currentTheme.mode === 'light' ? 'bg-white text-slate-900 border-t-2 border-amber-500 border-x border-amber-500/20' : 'bg-[#070D1B] text-white border-t-2 border-[#D4AF37]/60 border-x border-[#D4AF37]/20'} rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5 animate-slideUp`}>
            
            {/* Header / Close handle */}
            <div className={`flex items-center justify-between pb-3 border-b ${currentTheme.mode === 'light' ? 'border-amber-500/30' : 'border-amber-500/20'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                <h3 className={`font-extrabold text-base ${currentTheme.mode === 'light' ? 'text-amber-800' : 'text-amber-300'} tracking-wide uppercase`}>
                  {language === 'bn' ? 'সকল মেনু ও অপশনসমূহ' : 'All Menus & Options'}
                </h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className={`p-1.5 ${currentTheme.mode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-amber-500/30'} rounded-full border transition cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Summary Card */}
            <div 
              onClick={() => {
                navigateWithHistory('my_profile', { fromMoreMenu: true });
                setIsMoreOpen(false);
              }}
              className="bg-gradient-to-r from-[#0B1528] to-[#112244] border border-[#D4AF37]/50 hover:border-[#D4AF37] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg cursor-pointer group transition duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <PBCFramedAvatar
                    photoUrl={currentMember?.photoUrl}
                    name={currentMember?.fullName}
                    alt={currentMember?.fullName || 'Profile'}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/80 shadow-md group-hover:scale-105 transition"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full shadow-md border border-amber-300">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-white truncate group-hover:text-amber-300 transition">
                    {currentMember?.fullName || authUser?.displayName || 'PBC Club Member'}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-amber-300">
                    <span className="font-bold">{currentMember?.id || (role === 'super_admin' ? 'PBC-ADMIN' : 'PBC-MEMBER')}</span>
                    <span>•</span>
                    <span className="capitalize px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-md font-semibold text-[10px] border border-amber-500/30">
                      {role === 'super_admin' ? (language === 'bn' ? 'সিস্টেম অ্যাডমিন' : 'System Admin') : (role === 'admin' ? 'Admin' : 'Member')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-2.5 py-1.5 bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-bold shrink-0 flex items-center gap-1">
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold">{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
              </div>
            </div>

            {/* Section 1: Additional Views */}
            <div>
              <p className="text-[11px] font-extrabold text-amber-400/80 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'অন্যান্য সেকশনস' : 'Other Sections'}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigateWithHistory('real_estate', { fromMoreMenu: true });
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'real_estate'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-[#0B1528] border-[#D4AF37]/20 text-slate-200 hover:bg-[#112244]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'বিনিয়োগ প্রজেক্ট' : 'Investments'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>

                <button
                  onClick={() => {
                    navigateWithHistory('deposits', { 
                      fromMoreMenu: true,
                      title: role === 'member' ? 'My Deposits & Receipts' : 'Deposit & Payment Management',
                      titleBn: role === 'member' ? 'আমার জমা ও পেমেন্ট হিস্ট্রি' : 'পেমেন্ট ও ডিপোজিট হিস্ট্রি'
                    });
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'deposits'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-[#0B1528] border-[#D4AF37]/20 text-slate-200 hover:bg-[#112244]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'পেমেন্ট হিস্ট্রি' : 'Payment History'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>

                {/* Club Rules & By-Laws */}
                <button
                  onClick={() => {
                    navigateWithHistory('club_rules', { fromMoreMenu: true, title: 'Club By-Laws', titleBn: 'ক্লাবের নীতিমালা' });
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                    !isAdmin ? 'col-span-2 shadow-sm' : ''
                  } ${
                    activeTab === 'club_rules'
                      ? 'bg-amber-500/25 border-amber-500/80 text-amber-300'
                      : 'bg-[#0B1528] border-[#D4AF37]/30 text-slate-200 hover:bg-[#112244] hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xs flex items-center gap-1.5">
                        <span>{language === 'bn' ? 'ক্লাবের নীতিমালা ও গঠনতন্ত্র' : 'Club Rules & By-Laws'}</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                          {language === 'bn' ? 'সবার জন্য' : 'All Members'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {language === 'bn' ? 'সকল সদস্যের অধিকার, কিস্তি ও শরিয়াহ শর্তাবলী পড়ুন' : 'Read official member terms and by-laws'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70 text-amber-400" />
                </button>

                {/* Reports: ONLY for Admins & Super Admins */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigateWithHistory('reports', { fromMoreMenu: true });
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                      activeTab === 'reports'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-[#0B1528] border-[#D4AF37]/20 text-slate-200 hover:bg-[#112244]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PieChart className="w-4 h-4 text-amber-400" />
                      <span>{language === 'bn' ? 'রিপোর্ট ও হিসাব' : 'Reports'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                )}

                {/* Admin Panel: ONLY for Admins & Super Admins */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigateWithHistory('admin_panel', { fromMoreMenu: true });
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                      activeTab === 'admin_panel'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-[#0B1528] border-[#D4AF37]/20 text-slate-200 hover:bg-[#112244]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>{language === 'bn' ? 'এডমিন অডিট প্যানেল' : 'Admin Panel'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                )}

                {/* Active Now Option: ONLY for Admins & Super Admins */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigateWithHistory('active_now', { fromMoreMenu: true });
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left col-span-2 cursor-pointer ${
                      activeTab === 'active_now'
                        ? 'bg-emerald-500/25 border-emerald-500/80 text-emerald-300 shadow-md'
                        : 'bg-gradient-to-r from-emerald-950/40 via-[#070D1B] to-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-[#112244]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Activity className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div>
                        <div className="font-extrabold text-emerald-300 flex items-center gap-2">
                          <span>{language === 'bn' ? 'অ্যাক্টিভ নাও (Active Now)' : 'Active Now'}</span>
                          <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30">
                            🟢 {onlineCount} {language === 'bn' ? 'অনলাইনে' : 'Online'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === 'bn' ? 'কারেন্টলি লগইন থাকা সকল মেম্বার দেখুন' : 'See who is currently logged in'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 text-emerald-400" />
                  </button>
                )}

                {/* Board of Directors: ONLY for Super Admin or Permitted Users */}
                {canManageDirectors && (
                  <button
                    onClick={() => {
                      navigateWithHistory('directors', { fromMoreMenu: true });
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left col-span-2 cursor-pointer ${
                      activeTab === 'directors'
                        ? 'bg-amber-500/25 border-amber-500/80 text-amber-300 shadow-md'
                        : 'bg-[#070D1B] border-[#D4AF37]/40 text-amber-300 hover:bg-[#112244]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                      <div>
                        <div className="font-extrabold text-amber-300">
                          {language === 'bn' ? 'বোর্ড অব ডাইরেক্টরস' : 'Board of Directors'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === 'bn' ? 'সিস্টেম এডমিন প্যানেল' : 'System Admin Controlled'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 text-amber-400" />
                  </button>
                )}

                {/* Trash Box Option */}
                {(role === 'super_admin' || canAccessTrashBox) && (
                  <button
                    onClick={() => {
                      setIsTrashBoxOpen(true);
                      setIsMoreOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left col-span-2 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/40 text-amber-200 hover:border-amber-400 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <Trash2 className="w-4.5 h-4.5 text-amber-400" />
                      <div>
                        <div className="font-extrabold text-amber-300">
                          {language === 'bn' ? 'ট্র্যাশ বক্স (Trash Box)' : 'Trash Box'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === 'bn' ? 'ডিলিট হওয়া ডাটা রিকভারি ও ম্যানেজমেন্ট' : 'Recover & restore deleted records'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 text-amber-400" />
                  </button>
                )}

                {/* Separated Cards: 1. Deposit Accounts (bKash/Nagad/Bank), 2. Help Desk & Support (WhatsApp/Helpline) */}
                <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                  
                  {/* Card 1: Deposit Accounts */}
                  <button
                    onClick={() => {
                      navigateWithHistory('deposit_accounts', { 
                        fromMoreMenu: true,
                        title: 'Official Deposit Accounts',
                        titleBn: 'অফিসিয়াল ডিপোজিট অ্যাকাউন্টসমূহ'
                      });
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 text-xs font-black transition text-left cursor-pointer shadow-md ${
                      activeTab === 'deposit_accounts'
                        ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 border-amber-400 text-white shadow-amber-500/10'
                        : 'bg-gradient-to-r from-amber-950/40 via-[#0B1528] to-[#070D1B] border-amber-500/40 hover:border-amber-400 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <CreditCard className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-amber-300">
                            {language === 'bn' ? 'ডিপোজিট অ্যাকাউন্টস' : 'Deposit Accounts'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 text-[9px] font-bold border border-amber-500/40">
                            Payment
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 font-normal mt-0.5">
                          {language === 'bn' ? 'বিকাশ, নগদ ও ব্যাংক নম্বর' : 'bKash, Nagad & Bank info'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 opacity-80 shrink-0" />
                  </button>

                  {/* Card 2: Help Desk & Support */}
                  <button
                    onClick={() => {
                      navigateWithHistory('help_desk', { 
                        fromMoreMenu: true,
                        subView: 'whatsapp',
                        title: 'Help Desk & Support',
                        titleBn: 'হেল্প ডেস্ক ও সহায়তা'
                      });
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 text-xs font-black transition text-left cursor-pointer shadow-md ${
                      activeTab === 'help_desk'
                        ? 'bg-gradient-to-r from-emerald-500/25 to-teal-600/20 border-emerald-400 text-white shadow-emerald-500/10'
                        : 'bg-gradient-to-r from-emerald-950/40 via-[#0B1528] to-[#070D1B] border-emerald-500/40 hover:border-emerald-400 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <Headphones className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-emerald-300">
                            {language === 'bn' ? 'হেল্প ডেস্ক ও সাপোর্ট' : 'Help Desk & Support'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                            WhatsApp
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 font-normal mt-0.5">
                          {language === 'bn' ? 'হটলাইন ও ২৪/৭ প্রতিনিধি' : 'Hotline & Representatives'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 opacity-80 shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Control Switches (Language, Role, Theme) */}
            <div>
              <p className="text-[11px] font-extrabold text-amber-400/80 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'সিস্টেম ও রোল সেটিংস' : 'System & Role Settings'}
              </p>
              <div className="space-y-2">
                
                {/* Admin Mode Switcher */}
                {(accountRole === 'super_admin' || accountRole === 'admin' || role === 'super_admin' || role === 'admin') && (
                  <div className="p-3 bg-[#0B1528] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {role === 'member' ? (
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">
                          {language === 'bn' ? 'সিস্টেম রোল মোড' : 'System Role Mode'}
                        </div>
                        <div className="text-[10px] text-amber-300 font-medium">
                          {role === 'member' ? 'Member Mode Active' : `${role === 'super_admin' ? (language === 'bn' ? 'সিস্টেম অ্যাডমিন' : 'System Admin') : 'Admin'} Mode Active`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const nextMode = role === 'member' ? (accountRole === 'super_admin' ? 'super_admin' : 'admin') : 'member';
                        switchRoleMode(nextMode);
                        setActiveTab(nextMode === 'member' ? 'dashboard' : 'admin_panel');
                        setIsMoreOpen(false);
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-extrabold rounded-xl border border-amber-500/40 cursor-pointer transition active:scale-95"
                    >
                      {role === 'member' ? 'Switch to Admin' : 'Switch to Member'}
                    </button>
                  </div>
                )}

                {/* Language Switcher */}
                <div className={`p-3 ${currentTheme.mode === 'light' ? 'bg-amber-50/70 border-amber-500/30' : 'bg-[#0B1528] border-[#D4AF37]/30'} border rounded-2xl flex items-center justify-between gap-2`}>
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className={`text-xs font-bold ${currentTheme.mode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {language === 'bn' ? 'ভাষা নির্বাচন (Language)' : 'System Language'}
                      </div>
                      <div className={`text-[10px] ${currentTheme.mode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {language === 'bn' ? 'বর্তমান: বাংলা' : 'Current: English'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                    className={`px-3 py-1.5 ${currentTheme.mode === 'light' ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border-amber-500/40' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'} text-xs font-extrabold rounded-xl border cursor-pointer transition active:scale-95 flex items-center gap-1`}
                  >
                    <span>{language === 'en' ? 'বাংলা রূপান্তর' : 'Switch to English'}</span>
                  </button>
                </div>

                {/* Theme Switcher */}
                <div className={`p-3 ${currentTheme.mode === 'light' ? 'bg-amber-50/90 border-amber-500/40 shadow-xs' : 'bg-[#0B1528] border-[#D4AF37]/30'} border rounded-2xl flex items-center justify-between gap-2`}>
                  <div className="flex items-center gap-2.5">
                    {currentTheme.mode === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-amber-400" />}
                    <div>
                      <div className={`text-xs font-bold ${currentTheme.mode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {language === 'bn' ? 'কালার থিম (Theme)' : 'Display Theme'}
                      </div>
                      <div className={`text-[10px] ${currentTheme.mode === 'light' ? 'text-amber-800 font-semibold' : 'text-slate-400'}`}>
                        {currentTheme.mode === 'light' 
                          ? (language === 'bn' ? 'হোয়াইট ও গোল্ড সক্রিয়' : 'White & Gold Active') 
                          : (language === 'bn' ? 'রয়েল ডার্ক সক্রিয়' : 'Royal Dark Active')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (currentTheme.mode === 'light') {
                        setAppTheme('pbc-royal-gold');
                      } else {
                        setAppTheme('pearl-white-gold');
                      }
                    }}
                    className={`px-3 py-1.5 ${
                      currentTheme.mode === 'light'
                        ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700 shadow-xs'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md border-amber-400'
                    } text-xs font-extrabold rounded-xl border cursor-pointer transition active:scale-95`}
                  >
                    {currentTheme.mode === 'light' 
                      ? (language === 'bn' ? 'ডার্ক মোড' : 'Royal Dark') 
                      : (language === 'bn' ? 'হোয়াইট ও গোল্ড' : 'White & Gold')}
                  </button>
                </div>

              </div>
            </div>

            {/* Section 4: Sign Out Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  logout();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-950/60 border border-rose-400/40 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'bn' ? 'লগআউট / সাইন আউট করুন' : 'Sign Out / Logout Account'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};


