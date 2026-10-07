import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VersionProvider } from './context/VersionContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Splash } from './components/Splash';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FocusTopBar } from './components/Navigation/FocusTopBar';
import { FloatingBackHomeControls } from './components/Navigation/FloatingBackHomeControls';
import { HomeDashboard } from './components/Dashboard/HomeDashboard';
import { MemberList } from './components/Members/MemberList';
import { DepositList } from './components/Deposits/DepositList';
import { ProjectList } from './components/RealEstate/ProjectList';
import { ReportsView } from './components/Reports/ReportsView';
import { AdminPanel } from './components/Admin/AdminPanel';
import { DirectorsManager } from './components/Admin/DirectorsManager';
import { MyProfileView } from './components/Member/MyProfileView';
import { GlobalSearchModal } from './components/Search/GlobalSearchModal';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { AuthModal } from './components/Auth/AuthModal';
import { TrashBoxModal } from './components/Admin/TrashBoxModal';
import { QuotesManagerModal } from './components/Admin/QuotesManagerModal';
import { MobileFrame } from './components/Common/MobileFrame';
import { MaintenanceNoticeScreen } from './components/Common/MaintenanceNoticeScreen';
import { ActiveNowScreen } from './components/Admin/ActiveNowScreen';
import { HelpDeskView } from './components/HelpDesk/HelpDeskView';
import { DepositAccountsView } from './components/HelpDesk/DepositAccountsView';
import { ClubRulesView } from './components/ClubRules/ClubRulesView';
import { LegacyDomainScreen, checkIsLegacyDomain } from './components/Common/LegacyDomainRedirectModal';
import { PbcAssistantWidget } from './components/Assistant/PbcAssistantWidget';
import { PublicClubShowcase } from './components/Auth/PublicClubShowcase';
import { PbcLogo } from './components/Common/PbcLogo';
import { Smartphone, Globe } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    role,
    accountRole,
    switchRoleMode,
    language,
    isLoggedIn,
    canManageDirectors,
    isTrashBoxOpen,
    setIsTrashBoxOpen,
    systemSettings,
    setIsAuthModalOpen,
    updateSystemSettings,
    isFocusMode,
    canGoBack,
    authUser,
    currentMember,
    portalView,
    setPortalView
  } = useApp();
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const { currentTheme } = useTheme();

  const isSuperAdminAccount = role === 'super_admin' || accountRole === 'super_admin' || 
    (authUser?.email && (authUser.email.toLowerCase() === 'almegledest@gmail.com' || authUser.email.toLowerCase() === 'fokrulislammir9897@gmail.com')) ||
    (currentMember?.email && (currentMember.email.toLowerCase() === 'almegledest@gmail.com' || currentMember.email.toLowerCase() === 'fokrulislammir9897@gmail.com')) ||
    currentMember?.id === 'PBC-00000' || currentMember?.id === 'PBC-1001';

  const hasAdminPrivileges = isSuperAdminAccount || role === 'admin' || accountRole === 'admin';

  // Auto-switch to admin mode if super admin or admin navigates to admin_panel
  useEffect(() => {
    if (!isLoggedIn) return;
    if ((activeTab === 'admin_panel' || activeTab === 'active_now') && role === 'member' && hasAdminPrivileges) {
      switchRoleMode(isSuperAdminAccount ? 'super_admin' : 'admin');
    }
  }, [isLoggedIn, activeTab, role, hasAdminPrivileges, isSuperAdminAccount, switchRoleMode]);

  // Requirement 1: Disable guest access completely. Redirect unauthenticated users to Login.
  if (!isLoggedIn) {
    return (
      <>
        <AuthModal />
        <PbcAssistantWidget />
      </>
    );
  }

  // When logged-in member chooses to view the Public Website:
  if (portalView === 'website') {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans w-full overflow-x-hidden relative selection:bg-amber-500/30 selection:text-amber-200">
        {/* Logged-in Member Return Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 px-4 py-2.5 text-xs font-black flex items-center justify-between sticky top-0 z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <span>👋 সম্মানিত সদস্য: <strong>{currentMember?.fullName || authUser?.displayName || 'সদস্য'}</strong> ({currentMember?.id || 'PBC Member'})</span>
            <span className="hidden sm:inline bg-black/20 text-slate-950 px-2 py-0.5 rounded text-[11px] font-bold">
              পাবলিক ওয়েবসাইট ভিউ
            </span>
          </div>
          <button
            onClick={() => setPortalView('app')}
            className="bg-slate-950 text-amber-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>আমার অ্যাপ ড্যাশবোর্ডে ফিরুন ➔</span>
          </button>
        </div>

        {/* Website Header */}
        <header className="sticky top-10 z-40 bg-[#070D1B]/95 backdrop-blur-md border-b border-[#D4AF37]/25 px-4 sm:px-6 py-3 transition shadow-md">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <PbcLogo variant="gold" className="w-9 h-9 sm:w-10 sm:h-10" />
              <div>
                <h1 className="text-sm sm:text-base font-black text-white tracking-wide leading-tight">
                  প্রবাসী বিজনেস ক্লাব
                </h1>
                <p className="text-[10px] sm:text-[11px] text-amber-400 font-bold tracking-widest uppercase">
                  Probashi Business Club
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setPortalView('app')}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>আমার অ্যাপে ফিরুন</span>
              </button>
            </div>
          </div>
        </header>

        {/* Public Showcase */}
        <PublicClubShowcase 
          onScrollToLogin={() => setPortalView('app')} 
          onOpenAppMode={() => setPortalView('app')}
        />
      </div>
    );
  }

  // Maintenance mode block for logged-in non-super-admin users
  if (systemSettings.maintenanceMode && !isSuperAdminAccount) {
    return <MaintenanceNoticeScreen onOpenSuperAdminLogin={() => setIsAuthModalOpen(true)} />;
  }

  // Member role tab restrictions - allow dashboard, my_profile, deposits, real_estate, help_desk, deposit_accounts, club_rules and directors if authorized
  const isMemberAuthorized = role === 'member' && !hasAdminPrivileges
    ? (
        activeTab === 'dashboard' || 
        activeTab === 'my_profile' || 
        activeTab === 'deposits' || 
        activeTab === 'real_estate' || 
        activeTab === 'help_desk' || 
        activeTab === 'deposit_accounts' || 
        activeTab === 'club_rules' || 
        (activeTab === 'directors' && canManageDirectors)
      ) 
    : true;
  const currentTab = !isMemberAuthorized ? 'dashboard' : activeTab;

  return (
    <MobileFrame>
      <div className={`min-h-screen ${currentTheme.mode === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#030712] text-white'} flex flex-col font-sans w-full max-w-full overflow-x-hidden transition-colors duration-200`}>
        
        {/* Super Admin Maintenance Active Banner */}
        {systemSettings.maintenanceMode && role === 'super_admin' && (
          <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-md z-[99999]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              🔴 সিস্টেমে মেইনটেন্যান্স মোড চালু আছে (সাধারণ মেম্বারদের প্রবেশ বন্ধ রয়েছে)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('admin_panel')}
                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-[11px] font-extrabold transition cursor-pointer"
              >
                সেটিংস পরিবর্তন
              </button>
              <button
                onClick={() => updateSystemSettings({ maintenanceMode: false })}
                className="bg-slate-900 hover:bg-black text-white px-2.5 py-1 rounded text-[11px] font-extrabold transition cursor-pointer"
              >
                মেইনটেন্যান্স বন্ধ করুন
              </button>
            </div>
          </div>
        )}

        {/* Admin Previewing as Member Banner */}
        {(accountRole === 'super_admin' || accountRole === 'admin') && role === 'member' && (
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-3 py-2 text-xs font-bold flex items-center justify-between shadow-md z-[9999]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
              <span className="text-[11px] sm:text-xs truncate">
                {language === 'bn' 
                  ? '👁️ আপনি মেম্বার ভিউ মোডে আছেন (Member View Mode)' 
                  : '👁️ You are viewing in Member Mode'}
              </span>
            </div>
            <button
              onClick={() => {
                switchRoleMode(accountRole === 'super_admin' ? 'super_admin' : 'admin');
                setActiveTab('admin_panel');
              }}
              className="bg-black/30 hover:bg-black/50 text-amber-200 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-extrabold border border-amber-400/40 transition cursor-pointer shrink-0 ml-2 active:scale-95"
            >
              {language === 'bn' ? 'এডমিনে ফিরুন ➔' : 'Back to Admin ➔'}
            </button>
          </div>
        )}

        {/* Top Navbar Header - Only visible on main Dashboard */}
        {currentTab === 'dashboard' ? (
          <Navbar onOpenNotifications={() => setIsNotifDrawerOpen(true)} />
        ) : (
          <FocusTopBar onOpenNotifications={() => setIsNotifDrawerOpen(true)} />
        )}

        {/* Main Body Layout: When in sub-feature (e.g. Members, Deposits), 100% full screen with no top clutter */}
        <div className={`flex-1 w-full mx-auto flex overflow-x-hidden ${currentTab !== 'dashboard' ? 'max-w-full px-2 sm:px-4 md:px-6 pt-1 sm:pt-2' : 'max-w-7xl'}`}>
          
          {/* Navigation Sidebar - Only on Main Dashboard */}
          {currentTab === 'dashboard' && <Sidebar />}

          {/* Tab Content Stage - Sub-feature takes 100% full screen */}
          <main className={`flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden w-full max-w-full ${currentTab !== 'dashboard' ? 'pb-28' : 'pb-24 md:pb-8'}`}>
            {currentTab === 'dashboard' && <HomeDashboard />}
            {currentTab === 'members' && <MemberList />}
            {currentTab === 'deposits' && <DepositList />}
            {currentTab === 'real_estate' && <ProjectList />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'admin_panel' && <AdminPanel />}
            {currentTab === 'directors' && <DirectorsManager />}
            {currentTab === 'active_now' && <ActiveNowScreen />}
            {currentTab === 'my_profile' && <MyProfileView />}
            {currentTab === 'help_desk' && <HelpDeskView />}
            {currentTab === 'deposit_accounts' && <DepositAccountsView />}
            {currentTab === 'club_rules' && <ClubRulesView />}
          </main>
        </div>

        {/* Floating Back (1-step) & Home (Full-exit) buttons on bottom-right */}
        <FloatingBackHomeControls />

        {/* Universal Search Modal */}
        <GlobalSearchModal />

        {/* Notifications Drawer */}
        <NotificationDrawer 
          isOpen={isNotifDrawerOpen} 
          onClose={() => setIsNotifDrawerOpen(false)} 
        />

        {/* Trash Box Modal */}
        <TrashBoxModal
          isOpen={isTrashBoxOpen}
          onClose={() => setIsTrashBoxOpen(false)}
        />

        {/* Quotes Manager Modal */}
        <QuotesManagerModal />

        {/* Authentication & Role Modal */}
        <AuthModal />

        {/* PBC Assistant Smart AI Floating Widget */}
        <PbcAssistantWidget />

      </div>
    </MobileFrame>
  );
};

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const isLegacy = checkIsLegacyDomain();

  // If accessed via an old/legacy domain (e.g. vercel.app, pbc-club.ai.studio),
  // completely isolate the app: no database connection, no login forms, no data display.
  // Show only the official notice text.
  if (isLegacy) {
    return <LegacyDomainScreen />;
  }

  return (
    <VersionProvider>
      <AppProvider>
        <ThemeProvider>
          {!isSplashComplete ? (
            <Splash onComplete={() => setIsSplashComplete(true)} />
          ) : (
            <MainContent />
          )}
        </ThemeProvider>
      </AppProvider>
    </VersionProvider>
  );
}
