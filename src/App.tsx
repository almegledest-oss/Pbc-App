import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Splash } from './components/Splash';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
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
import { MobileFrame } from './components/Common/MobileFrame';
import { MaintenanceNoticeScreen } from './components/Common/MaintenanceNoticeScreen';
import { ActiveNowScreen } from './components/Admin/ActiveNowScreen';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    role,
    isLoggedIn,
    canManageDirectors,
    isTrashBoxOpen,
    setIsTrashBoxOpen,
    systemSettings,
    setIsAuthModalOpen,
    updateSystemSettings
  } = useApp();
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Requirement 1: Disable guest access completely. Redirect unauthenticated users to Login.
  if (!isLoggedIn) {
    return <AuthModal />;
  }

  // Maintenance mode block for logged-in non-super-admin users
  if (systemSettings.maintenanceMode && role !== 'super_admin') {
    return <MaintenanceNoticeScreen onOpenSuperAdminLogin={() => setIsAuthModalOpen(true)} />;
  }

  // Member role tab restrictions - allow dashboard, my_profile, deposits, real_estate and directors if authorized
  const isMemberAuthorized = role === 'member' 
    ? (activeTab === 'dashboard' || activeTab === 'my_profile' || activeTab === 'deposits' || activeTab === 'real_estate' || (activeTab === 'directors' && canManageDirectors)) 
    : true;
  const currentTab = !isMemberAuthorized ? 'dashboard' : activeTab;

  return (
    <MobileFrame>
      <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans w-full max-w-full overflow-x-hidden">
        
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

        {/* Top Navbar Header */}
        <Navbar onOpenNotifications={() => setIsNotifDrawerOpen(true)} />

        {/* Main Body Layout with Sidebar */}
        <div className="flex-1 max-w-7xl w-full mx-auto flex overflow-x-hidden">
          
          {/* Navigation Sidebar */}
          <Sidebar />

          {/* Tab Content Stage */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden w-full max-w-full">
            {currentTab === 'dashboard' && <HomeDashboard />}
            {currentTab === 'members' && <MemberList />}
            {currentTab === 'deposits' && <DepositList />}
            {currentTab === 'real_estate' && <ProjectList />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'admin_panel' && <AdminPanel />}
            {currentTab === 'directors' && <DirectorsManager />}
            {currentTab === 'active_now' && <ActiveNowScreen />}
            {currentTab === 'my_profile' && <MyProfileView />}
          </main>
        </div>

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

        {/* Authentication & Role Modal */}
        <AuthModal />

      </div>
    </MobileFrame>
  );
};

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  return (
    <AppProvider>
      {!isSplashComplete ? (
        <Splash onComplete={() => setIsSplashComplete(true)} />
      ) : (
        <MainContent />
      )}
    </AppProvider>
  );
}
