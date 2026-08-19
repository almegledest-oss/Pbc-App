import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useVersion } from '../context/VersionContext';
import { t } from '../utils/translations';
import { PbcLogo } from './Common/PbcLogo';
import { PBCFramedAvatar } from './Common/PBCFramedAvatar';
import { AppUpdateSettingCard } from './Common/AppUpdateSettingCard';
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
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
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
    activeSessions = []
  } = useApp();
  
  const { hasNewVersion } = useVersion();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
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
        { id: 'real_estate', label: 'Approved Investments', icon: Building2 }
      ]
    : [
        { id: 'dashboard', label: labels.dashboard, icon: LayoutDashboard },
        { id: 'members', label: labels.members, icon: Users },
        { id: 'deposits', label: labels.deposits, icon: Wallet },
        { id: 'real_estate', label: 'Investments', icon: Building2 },
        { id: 'reports', label: labels.reports, icon: PieChart },
        ...(role === 'super_admin' || role === 'admin'
          ? [
              { id: 'admin_panel', label: labels.adminPanel, icon: Shield },
              { id: 'active_now', label: language === 'bn' ? `অ্যাক্টিভ নাও (${onlineCount})` : `Active Now (${onlineCount})`, icon: Activity }
            ]
          : []),
        { id: 'my_profile', label: labels.myProfile, icon: User }
      ];

  // Fixed 5 items for Mobile Bottom Nav
  // For Admins: Dashboard, Members, Deposits, Admin Panel, More
  // For Regular Members: Dashboard, Members, Deposits, Investments, More
  const mobileBottomNavItems = [
    { id: 'dashboard', label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: language === 'bn' ? 'মেম্বারস' : 'Members', icon: Users },
    { id: 'deposits', label: language === 'bn' ? 'ডিপোজিটস' : 'Deposits', icon: Wallet },
    ...(isAdmin
      ? [{ id: 'admin_panel', label: language === 'bn' ? 'এডমিন প্যানেল' : 'Admin Panel', icon: Shield }]
      : [{ id: 'real_estate', label: language === 'bn' ? 'ইনভেস্টমেন্ট' : 'Investments', icon: Building2 }]
    ),
  ];

  return (
    <>
      {/* Desktop Navigation Sidebar - Royal Navy & Gold Theme */}
      <aside className="hidden md:flex flex-col w-64 bg-[#070D1B] text-white shrink-0 border-r border-[#D4AF37]/20 shadow-2xl transition-colors">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#D4AF37]/20 bg-[#030712]/50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <PbcLogo variant="gold" className="w-12 h-12 shrink-0" />
            <div>
              <h1 className="text-white font-extrabold text-sm sm:text-base tracking-wider leading-tight uppercase">
                PROBASHI <span className="text-[#E5A93C]">BUSINESS CLUB</span>
              </h1>
              <p className="text-[10px] text-amber-300/80 font-bold tracking-[0.2em] uppercase mt-0.5">
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
                    ? 'bg-gradient-to-r from-[#112244] to-[#0E1B38] text-amber-300 border border-[#D4AF37]/80 shadow-lg shadow-amber-500/10 font-bold'
                    : 'text-slate-300 hover:bg-amber-500/10 hover:text-amber-200'
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
          <div className="bg-[#030816] rounded-2xl p-4 border border-[#D4AF37]/30 space-y-2">
            {(accountRole === 'super_admin' || accountRole === 'admin') ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Active Mode
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 capitalize">
                    {role === 'member' ? 'Member Mode' : 'Admin Mode'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextMode = role === 'member' ? (accountRole === 'super_admin' ? 'super_admin' : 'admin') : 'member';
                    switchRoleMode(nextMode);
                    setActiveTab(nextMode === 'member' ? 'dashboard' : 'admin_panel');
                  }}
                  className="w-full mt-1.5 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer"
                >
                  <span>Switch to {role === 'member' ? 'Admin Mode' : 'Member Mode'}</span>
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 pt-2 border-t border-amber-500/20">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[11px] text-slate-300 font-medium">System Online</span>
                </div>
              </div>

              {/* Desktop App Version Card */}
              <div className="py-1">
                <AppUpdateSettingCard compact />
              </div>

              <button 
                onClick={() => logout()}
                className="w-full py-2 px-3 bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-rose-500/30 cursor-pointer shadow-xs active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'bn' ? 'সাইন আউট করুন' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Strict 5 Buttons: Dashboard, Members, Deposits, Admin/Investment, More) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070D1B]/95 backdrop-blur-xl border-t border-[#D4AF37]/40 px-1 py-1.5 flex items-center justify-around text-white shadow-2xl">
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
            {hasNewVersion && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight whitespace-nowrap font-bold">
            {language === 'bn' ? 'আরো' : 'More'}
          </span>
        </button>
      </nav>

      {/* Mobile MORE Drawer Popup Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          {/* Backdrop Click */}
          <div className="flex-1" onClick={() => setIsMoreOpen(false)} />

          {/* Drawer Box */}
          <div className="bg-[#070D1B] border-t-2 border-[#D4AF37]/60 rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 shadow-2xl text-white space-y-5 animate-slideUp border-x border-[#D4AF37]/20">
            
            {/* Header / Close handle */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                <h3 className="font-extrabold text-base text-amber-300 tracking-wide uppercase">
                  {language === 'bn' ? 'সকল মেনু ও অপশনসমূহ' : 'All Menus & Options'}
                </h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full border border-amber-500/30 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Summary Card */}
            <div 
              onClick={() => {
                setActiveTab('my_profile');
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
                    <span className="font-bold">{currentMember?.id || 'PBC-1001'}</span>
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
                    setActiveTab('real_estate');
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left ${
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
                    setActiveTab('my_profile');
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left ${
                    activeTab === 'my_profile'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-[#0B1528] border-[#D4AF37]/20 text-slate-200 hover:bg-[#112244]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'মাই প্রোফাইল ও আইডি' : 'My Profile & ID'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>

                {/* Reports: ONLY for Admins & Super Admins */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab('reports');
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left ${
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
                      setActiveTab('admin_panel');
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left ${
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
                      setActiveTab('active_now');
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left col-span-2 ${
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
                      setActiveTab('directors');
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left col-span-2 ${
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
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-extrabold rounded-xl border border-amber-500/40 cursor-pointer transition active:scale-95"
                    >
                      {role === 'member' ? 'Switch to Admin' : 'Switch to Member'}
                    </button>
                  </div>
                )}

                {/* Language Switcher */}
                <div className="p-3 bg-[#0B1528] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {language === 'bn' ? 'ভাষা নির্বাচন (Language)' : 'System Language'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === 'bn' ? 'বর্তমান: বাংলা' : 'Current: English'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-extrabold rounded-xl border border-amber-500/40 cursor-pointer transition active:scale-95 flex items-center gap-1"
                  >
                    <span>{language === 'en' ? 'বাংলা রূপান্তর' : 'Switch to English'}</span>
                  </button>
                </div>

                {/* Theme Switcher */}
                <div className="p-3 bg-[#0B1528] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {theme === 'light' ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <div>
                      <div className="text-xs font-bold text-white">
                        {language === 'bn' ? 'কালার থিম (Theme)' : 'Display Theme'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {theme === 'light' ? 'Light Mode Active' : 'Dark Mode Active'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-extrabold rounded-xl border border-amber-500/30 cursor-pointer transition active:scale-95"
                  >
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </div>

              </div>
            </div>

            {/* Section 3: App Version & Updates */}
            <div>
              <p className="text-[11px] font-extrabold text-amber-400/80 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'অ্যাপ ভার্সন ও আপডেট সেটিংস' : 'App Version & Update'}
              </p>
              <AppUpdateSettingCard />
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


