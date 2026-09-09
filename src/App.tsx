import React, { useState } from 'react';
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
    canGoBack
  } = useApp();
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const { currentTheme } = useTheme();

  // Requirement 1: Disable guest access completely. Redirect unauthenticated users to Login.
  if (!isLoggedIn) {
    return <AuthModal />;
  }

  // Maintenance mode block for logged-in non-super-admin users
  if (systemSettings.maintenanceMode && role !== 'super_admin') {
    return <MaintenanceNoticeScreen onOpenSuperAdminLogin={() => setIsAuthModalOpen(true)} />;
  }

  // Member role tab restrictions - allow dashboard, my_profile, deposits, real_estate, help_desk, deposit_accounts, club_rules and directors if authorized
  const isMemberAuthorized = role === 'member' 
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

      </div>
    </MobileFrame>
  );
};

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

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
