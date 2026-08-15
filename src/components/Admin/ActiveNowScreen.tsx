import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveSession } from '../../types';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { clearActiveSessionDoc } from '../../services/firebaseService';
import { 
  Users, 
  Search, 
  Activity, 
  Smartphone, 
  Monitor, 
  Clock, 
  LogOut, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  X,
  Compass
} from 'lucide-react';

interface ActiveNowScreenProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const ActiveNowScreen: React.FC<ActiveNowScreenProps> = ({ onClose, isModal = false }) => {
  const { activeSessions, role, language, addNotification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [terminatingEmail, setTerminatingEmail] = useState<string | null>(null);

  // Filter online sessions (active within last 5 minutes)
  const now = new Date().getTime();
  const onlineSessions = activeSessions.filter(session => {
    if (!session.isOnline) return false;
    const lastActiveTime = new Date(session.lastActive).getTime();
    const diffMinutes = (now - lastActiveTime) / (1000 * 60);
    return diffMinutes <= 10; // Considered active if pinged in last 10 minutes
  });

  const filteredSessions = onlineSessions.filter(session => {
    const matchesSearch = 
      session.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.memberId && session.memberId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || session.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleTerminateSession = async (email: string, name: string) => {
    if (!email) return;
    setTerminatingEmail(email);
    try {
      await clearActiveSessionDoc(email);
      addNotification(
        language === 'bn' ? 'সেশন টার্মিনেট করা হয়েছে' : 'Session Terminated',
        language === 'bn' ? `${name} এর সেশন সফলভাবে বন্ধ করা হয়েছে` : `Terminated active session for ${name}`,
        'system'
      );
    } catch (err) {
      console.error('Error terminating session:', err);
      addNotification(
        'Error',
        'Could not disconnect user session.',
        'system'
      );
    } finally {
      setTerminatingEmail(null);
    }
  };

  const getTimeAgo = (isoString: string) => {
    try {
      const time = new Date(isoString).getTime();
      const diffSec = Math.floor((now - time) / 1000);
      if (diffSec < 15) return language === 'bn' ? 'ঠিক এখনই' : 'Just now';
      if (diffSec < 60) return language === 'bn' ? `${diffSec} সেকেন্ড আগে` : `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return language === 'bn' ? `${diffMin} মিনিট আগে` : `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      return language === 'bn' ? `${diffHrs} ঘণ্টা আগে` : `${diffHrs}h ago`;
    } catch (e) {
      return language === 'bn' ? 'সম্প্রতি' : 'Recently';
    }
  };

  const getTabLabel = (tabKey?: string) => {
    switch (tabKey) {
      case 'dashboard': return language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard';
      case 'members': return language === 'bn' ? 'সদস্য তালিকা' : 'Members List';
      case 'deposits': return language === 'bn' ? 'ডিপোজিট পেজ' : 'Deposits';
      case 'real_estate': return language === 'bn' ? 'ইনভেস্টমেন্ট প্রজেক্ট' : 'Investments';
      case 'reports': return language === 'bn' ? 'রিপোর্ট ও হিসাব' : 'Reports';
      case 'admin_panel': return language === 'bn' ? 'এডমিন অডিট প্যানেল' : 'Admin Panel';
      case 'my_profile': return language === 'bn' ? 'মাই প্রোফাইল' : 'My Profile';
      case 'directors': return language === 'bn' ? 'ডাইরেক্টরস প্যানেল' : 'Directors Panel';
      case 'active_now': return language === 'bn' ? 'অ্যাক্টিভ নাও সেকশন' : 'Active Now';
      default: return language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard';
    }
  };

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'p-4 sm:p-6'} text-white space-y-6 max-w-6xl mx-auto`}>
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#0E1E3D] to-[#122852] p-5 sm:p-6 rounded-2xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl shadow-lg relative">
              <Activity className="w-7 h-7 text-emerald-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-4 ring-[#0B1528] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase">
                  {language === 'bn' ? 'অ্যাক্টিভ মেম্বারসমূহ' : 'Active Now (Live Sessions)'}
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineSessions.length} {language === 'bn' ? 'জন অনলাইনে' : 'Online'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'bn' 
                  ? 'বর্তমানে যেসব মেম্বার ও এডমিন অ্যাপ ব্যবহার করছেন তাদের রিয়েল-টাইম তথ্য'
                  : 'Real-time overview of members and admins currently active on the platform'}
              </p>
            </div>
          </div>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-amber-500/30 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Field */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'নাম, ইমেইল বা আইডি দিয়ে সার্চ করুন...' : 'Search by name, email or ID...'}
            className="w-full pl-10 pr-4 py-2.5 bg-[#070D1B] border border-amber-500/30 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#070D1B] border border-amber-500/30 focus:border-amber-400 rounded-xl text-xs text-amber-300 font-bold focus:outline-none transition cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল রোল (All Roles)' : 'All Roles'}</option>
            <option value="super_admin">Super Admin Only</option>
            <option value="admin">Admin Only</option>
            <option value="member">{language === 'bn' ? 'সাধারণ মেম্বার' : 'General Members'}</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-[#070D1B] border border-amber-500/20 rounded-2xl space-y-3">
          <Users className="w-12 h-12 text-slate-500 mx-auto opacity-40" />
          <h3 className="font-bold text-slate-300 text-sm">
            {language === 'bn' ? 'কোনো একটিভ মেম্বার পাওয়া যায়নি' : 'No Active Sessions Found'}
          </h3>
          <p className="text-xs text-slate-400">
            {searchQuery || roleFilter !== 'all'
              ? (language === 'bn' ? 'আপনার সার্চ বা ফিল্টার অনুযায়ী কোনো মেম্বার অনলাইনে নেই।' : 'No sessions match your search or filter criteria.')
              : (language === 'bn' ? 'বর্তমানে কোনো ব্যবহারকারী অনলাইনে নেই।' : 'There are currently no online members.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const isSuperAdminUser = session.role === 'super_admin' || session.email === 'fokrulislammir9897@gmail.com' || session.email === 'almegledest@gmail.com';
            
            return (
              <div
                key={session.id}
                className="bg-gradient-to-b from-[#0B1528] to-[#070D1B] border border-amber-500/30 hover:border-amber-400/70 rounded-2xl p-4 transition-all shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                {/* Active Indicator Strip */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />

                {/* Top User Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <PBCFramedAvatar
                        photoUrl={session.photoUrl}
                        name={session.memberName}
                        className="w-12 h-12 rounded-full"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-[#070D1B] z-20" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                        {session.memberName}
                      </h4>
                      <p className="text-[11px] text-amber-300/80 truncate font-mono">
                        {session.email}
                      </p>
                      {session.memberId && (
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          ID: {session.memberId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="shrink-0">
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${
                      isSuperAdminUser
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : session.role === 'admin'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    }`}>
                      {isSuperAdminUser ? 'Super Admin' : (session.role === 'admin' ? 'Admin' : 'Member')}
                    </span>
                  </div>
                </div>

                {/* Session Context Details */}
                <div className="bg-[#030712]/60 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      {language === 'bn' ? 'বর্তমান পেজ:' : 'Active Page:'}
                    </span>
                    <span className="font-bold text-amber-300 truncate max-w-[130px]">
                      {getTabLabel(session.activeTab)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      {session.deviceInfo?.includes('Mobile') ? (
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      {language === 'bn' ? 'ডিভাইস:' : 'Device:'}
                    </span>
                    <span className="font-semibold text-slate-200 text-[11px]">
                      {session.deviceInfo || 'Web Browser'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {language === 'bn' ? 'শেষ এক্টিভিটি:' : 'Last Active:'}
                    </span>
                    <span className="font-bold text-emerald-300 text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {getTimeAgo(session.lastActive)}
                    </span>
                  </div>
                </div>

                {/* Super Admin Action: Force Terminate Session */}
                {role === 'super_admin' && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleTerminateSession(session.email, session.memberName)}
                      disabled={terminatingEmail === session.email}
                      className="w-full py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl border border-rose-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>
                        {terminatingEmail === session.email 
                          ? (language === 'bn' ? 'ডিসকানেক্ট করা হচ্ছে...' : 'Disconnecting...') 
                          : (language === 'bn' ? 'সেশন ডিসকানেক্ট করুন' : 'Force Disconnect Session')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
