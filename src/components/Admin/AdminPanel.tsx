import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { DepositReceiptModal } from '../Deposits/DepositReceiptModal';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { AdminSignatureModal } from './AdminSignatureModal';
import { AppUpdateSettingCard } from '../Common/AppUpdateSettingCard';
import { Deposit } from '../../types';
import { 
  ShieldCheck, 
  Send, 
  Bell, 
  Users, 
  Wallet, 
  Building2, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  Sliders, 
  AlertTriangle,
  UserCheck,
  UserX,
  History,
  Download,
  Upload,
  UserPlus,
  Trash2,
  Check,
  XCircle,
  FileText,
  Clock,
  Calendar,
  Eye,
  X,
  CreditCard,
  Image as ImageIcon,
  ArrowLeft,
  ChevronRight,
  Quote
} from 'lucide-react';
import { exportBackupData, restoreBackupData, compressImageToDataUrl } from '../../services/firebaseService';
import { PbcLogo } from '../Common/PbcLogo';
import { PbcAirplaneHeaderLogo } from '../Members/PbcCardGraphics';
import { safeStorage } from '../../utils/safeStorage';
import { ThemeSelectorCard } from './ThemeSelectorCard';

export const AdminPanel: React.FC = () => {
  const { 
    members, 
    deposits, 
    projects, 
    users,
    activityLogs,
    systemSettings,
    addNotification, 
    approveMember,
    rejectMember,
    approveDeposit,
    rejectDeposit,
    createAdminUser,
    removeAdminUser,
    updateUserRole,
    updateMember,
    updateSystemSettings,
    quotes,
    setIsQuotesManagerOpen,
    language, 
    role,
    currentMember,
    authUser,
    triggerSecurityAlert,
    setActiveTab,
    currentNavState,
    navigateWithHistory,
    goBack
  } = useApp();

  const labels = t[language];
  const isBn = language === 'bn';

  // Push Notification Form State
  const [notifTitle, setNotifTitle] = useState('Quarterly Fund Dividend Announcement');
  const [notifMessage, setNotifMessage] = useState('Q3 profit distribution has been released to active members.');
  const [notifType, setNotifType] = useState<'deposit' | 'project' | 'profit' | 'system'>('profit');
  const [toastSuccess, setToastSuccess] = useState(false);

  // New Admin Form
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const [selectedMemberForAdmin, setSelectedMemberForAdmin] = useState('');

  // Voucher Audit States
  const [previewVoucherImage, setPreviewVoucherImage] = useState<string | null>(null);
  const [selectedAuditDeposit, setSelectedAuditDeposit] = useState<Deposit | null>(null);
  const [voucherFilter, setVoucherFilter] = useState<'pending' | 'all_receipts'>('pending');
  const [signatureModalDeposit, setSignatureModalDeposit] = useState<Deposit | null>(null);

  // Backup & Restore States
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [restoreResultModal, setRestoreResultModal] = useState<{
    counts: { members: number; deposits: number; projects: number; reports: number; users: number; directors: number; total: number };
    errors: string[];
  } | null>(null);

  const pendingMembers = members.filter(m => m.status === 'pending');
  const pendingDeposits = deposits.filter(d => 
    d.status?.toLowerCase() === 'pending' || 
    d.status?.toLowerCase() === 'pending_audit' || 
    d.status === 'Pending'
  );
  const totalPending = pendingMembers.length + pendingDeposits.length;
  const depositsWithReceipts = deposits.filter(d => !!d.receiptUrl);
  const displayedVouchers = voucherFilter === 'pending' ? pendingDeposits : depositsWithReceipts;

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    addNotification(notifTitle, notifMessage, notifType);
    setToastSuccess(true);
    setTimeout(() => setToastSuccess(false), 3000);
  };

  const handleSelectMemberForAdmin = (mId: string) => {
    setSelectedMemberForAdmin(mId);
    if (mId) {
      const found = members.find(m => m.id === mId);
      if (found) {
        setNewAdminName(found.fullName || '');
        setNewAdminEmail(found.email || '');
      }
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;
    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (cleanEmail === 'fokrulislammir9897@gmail.com') {
      alert('Security Restriction: Fokrul Islam Mir is already the Super Admin and cannot be duplicated.');
      return;
    }

    // Update member record if matched
    const targetMem = members.find(m => m.id === selectedMemberForAdmin || (m.email && m.email.toLowerCase().trim() === cleanEmail));
    if (targetMem) {
      await updateMember(targetMem.id, { role: 'admin' });
    }

    await createAdminUser(cleanEmail, newAdminName.trim(), 'admin');
    setNewAdminName('');
    setNewAdminEmail('');
    setSelectedMemberForAdmin('');
    alert(`Admin user account for ${newAdminName} created or updated successfully.`);
  };

  const handleExportBackup = async () => {
    try {
      const data = await exportBackupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PBC_Club_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Error creating backup: ' + err.message);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be chosen again if needed
    const fileInput = e.target;

    setIsRestoring(true);
    setRestoreStatus(isBn ? 'ব্যাকআপ ফাইলটি পড়া হচ্ছে...' : 'Reading backup file...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        if (!content || !content.trim()) {
          throw new Error('Selected backup file is completely empty.');
        }

        const parsed = JSON.parse(content);
        setRestoreStatus(isBn ? 'ফায়ারবেস ডাটাবেজে রেকর্ডগুলো যুক্ত করা হচ্ছে...' : 'Writing records to Firebase Firestore...');

        const result = await restoreBackupData(parsed);
        setRestoreStatus('');
        setIsRestoring(false);
        fileInput.value = '';

        setRestoreResultModal({
          counts: result.counts,
          errors: result.errors
        });
      } catch (err: any) {
        setIsRestoring(false);
        setRestoreStatus('');
        fileInput.value = '';
        alert((isBn ? "ব্যাকআপ ফাইল আপলোড করতে সমস্যা হয়েছে: " : "Error uploading backup file: ") + (err?.message || err));
      }
    };

    reader.onerror = () => {
      setIsRestoring(false);
      setRestoreStatus('');
      fileInput.value = '';
      alert(isBn ? "ফাইলটি পড়তে ব্যর্থ হয়েছে।" : "Failed to read file.");
    };

    reader.readAsText(file);
  };

  const openSubView = (
    subViewKey: 'approvals' | 'users' | 'logs' | 'broadcast' | 'settings' | 'backup',
    title: string,
    titleBn: string
  ) => {
    navigateWithHistory({
      tab: 'admin_panel',
      subView: subViewKey,
      title,
      titleBn,
      isFocusMode: true
    });
  };

  const currentSubView = currentNavState.subView;



  // If no subView is active, render the requested HUB MENU LIST
  if (!currentSubView) {
    return (
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#070D1B] via-[#0B1528] to-[#112244] p-6 rounded-3xl text-white border-2 border-[#D4AF37]/40 shadow-2xl">
          <div>
            <span className="px-3 py-1 text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full uppercase tracking-widest shadow-md">
              {role.toUpperCase()} CONTROL CENTER
            </span>
            <h2 className="text-2xl font-black mt-2 tracking-tight uppercase text-amber-300">
              PBC Club System Administration
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isBn 
                ? 'সিস্টেমের যেকোনো মডিউলে প্রবেশ করতে নিচের তালিকা থেকে নির্বাচন করুন' 
                : 'Select any administrative module below to manage in dedicated full-screen view'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="px-3 py-2 bg-[#070D1B]/90 border border-[#D4AF37]/30 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Pending</span>
              <span className={`text-base font-black ${totalPending > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                {totalPending}
              </span>
            </div>
            <div className="px-3 py-2 bg-[#070D1B]/90 border border-[#D4AF37]/30 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Admins</span>
              <span className="text-base font-black text-amber-300">
                {users.length}
              </span>
            </div>
          </div>
        </div>

        {/* The List of Super Admin Modules (Formulated List View) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Approval Queue */}
          <div
            onClick={() => openSubView('approvals', 'Approval Queue', 'অনুমোদন কিউ (সদস্য ও ডিপোজিট)')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'অনুমোদন কিউ (Approval Queue)' : 'Approval Queue'}
                  </h3>
                  {totalPending > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-amber-400 text-slate-950 rounded-full font-black animate-pulse">
                      {totalPending}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'পেন্ডিং মেম্বার ভেরিফিকেশন ও মানি রিসিট ভাউচার স্বাক্ষর অডিট' 
                    : 'Review & verify pending member registrations and money receipt vouchers'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 2. Role Management */}
          {role === 'super_admin' && (
            <div
              onClick={() => openSubView('users', 'Role Management', 'ভূমিকা ও অ্যাডমিন ব্যবস্থাপনা')}
              className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                      {isBn ? 'রোল ম্যানেজমেন্ট (Role Management)' : 'Role Management'}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold">
                      {users.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {isBn 
                      ? 'নতুন অ্যাডমিন তৈরি, পারমিশন লেভেল নির্ধারণ ও ইউজার অ্যাকাউন্ট ব্যবস্থাপনা' 
                      : 'Create admin accounts, assign roles, and configure system permissions'}
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* 3. Activity Log */}
          <div
            onClick={() => openSubView('logs', 'Activity Log', 'কার্যক্রম লগ ও অডিট ট্রেইল')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <History className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'কার্যক্রম লগ (Activity Log)' : 'Activity Log'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-bold">
                    {activityLogs.length}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'সিস্টেমের রিয়েল-টাইম ইভেন্ট হিস্ট্রি, অ্যাডমিন একশন ও নিরাপত্তা অডিট লগ' 
                    : 'Real-time audit trail, admin action logs, and system events tracking'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 4. Push Broadcast */}
          <div
            onClick={() => openSubView('broadcast', 'Push Broadcast', 'পুশ নোটিফিকেশন ব্রডকাস্ট')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <Bell className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'পুশ ব্রডকাস্ট (Push Broadcast)' : 'Push Broadcast'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'সকল মেম্বারদের কাছে তাৎক্ষণিক জরুরি নোটিশ, লভ্যাংশ ও সাধারণ ঘোষণা প্রেরণ' 
                    : 'Dispatch instant push announcements, dividend alerts & notices to all members'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 5. System Settings */}
          {role === 'super_admin' && (
            <div
              onClick={() => openSubView('settings', 'System Settings', 'সিস্টেম কনফিগারেশন ও থিম')}
              className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition shadow-md">
                  <Sliders className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                      {isBn ? 'সিস্টেম সেটিংস (System Settings)' : 'System Settings'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {isBn 
                      ? 'ক্লাব ব্র্যান্ডিং লোগো, আইডি কার্ড হেডার, থিম কাস্টমাইজেশন ও মেইনটেন্যান্স মোড' 
                      : 'Club logo branding, ID card graphics, theme selection, maintenance mode'}
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* 6. Database Backup & Restore */}
          <div
            onClick={() => openSubView('backup', 'Database Backup & Restore', 'ডাটাবেজ ব্যাকআপ ও রিস্টোর')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <Database className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'ডাটাবেজ ব্যাকআপ ও রিস্টোর' : 'Export & Restore Backup'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-bold">
                    JSON
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'ক্লাবের সকল মেম্বার, ডিপোজিট ও ইনভেস্টমেন্টের পূর্ণাঙ্গ ডাটা এক্সপোর্ট এবং রিস্টোর' 
                    : 'Download complete system backup file and restore database anytime'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 7. Daily Motivation & Quotes Management */}
          <div
            onClick={() => setIsQuotesManagerOpen(true)}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <Quote className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'দৈনিক উক্তি ও অনুপ্রেরণা (Daily Quotes)' : 'Daily Motivation & Quotes'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
                    {quotes.length}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'ড্যাশবোর্ডের গোল্ডেন ব্যানারে প্রদর্শিত অনুপ্রেরণাদায়ক উক্তি যোগ, এডিট ও পরিচালনা করুন' 
                    : 'Add, edit, reorder & manage business and investment quotes on the dashboard'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

        </div>

      </div>
    );
  }

  // If a subView is active, render the dedicated Sub-View in full screen
  return (
    <div className="space-y-6 pb-12">
      {/* Sub-View: Approval Queue */}
      {currentSubView === 'approvals' && (
        <div className="space-y-6">

          {/* Pending Members Section */}
          <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>Pending Member Approvals ({pendingMembers.length})</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Expatriate applicants waiting for admin verification
                </p>
              </div>
            </div>

            {pendingMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-[#070D1B] rounded-2xl border border-dashed border-[#D4AF37]/30">
                No pending member registrations. All member accounts are verified.
              </div>
            ) : (
              <div className="divide-y divide-[#D4AF37]/20">
                {pendingMembers.map((m, idx) => (
                  <div key={m.id || `pending-member-${idx}`} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <PBCFramedAvatar photoUrl={m.photoUrl} name={m.fullName} alt={m.fullName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{m.fullName}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md font-bold">{m.id}</span>
                        </div>
                        <p className="text-xs text-slate-300">{m.email} • {m.phone} • {m.city}, {m.country}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Applied: {m.joinDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveMember(m.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => rejectMember(m.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Deposits & Voucher Audit Section */}
          <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D4AF37]/30">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  <span>Deposit Vouchers & Receipt Audit (মানি রিসিট ভাউচার)</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Bank wire & online receipts submitted by members for verification
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-[#070D1B] p-1 rounded-2xl border border-[#D4AF37]/30 shrink-0">
                <button
                  type="button"
                  onClick={() => setVoucherFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    voucherFilter === 'pending'
                      ? 'bg-[#112244] text-amber-300 border border-[#D4AF37] shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Pending ({pendingDeposits.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVoucherFilter('all_receipts')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    voucherFilter === 'all_receipts'
                      ? 'bg-[#112244] text-amber-300 border border-[#D4AF37] shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>With Receipts ({depositsWithReceipts.length})</span>
                </button>
              </div>
            </div>

            {displayedVouchers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-[#070D1B] rounded-2xl border border-dashed border-[#D4AF37]/30">
                {voucherFilter === 'pending'
                  ? 'No pending deposit vouchers in queue. All payments reconciled.'
                  : 'No deposit records found with uploaded money receipt images.'}
              </div>
            ) : (
              <div className="divide-y divide-[#D4AF37]/20">
                {displayedVouchers.map((d, idx) => (
                  <div key={d.id || `pending-dep-${idx}`} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {d.receiptUrl ? (
                        <div 
                          onClick={() => setPreviewVoucherImage(d.receiptUrl || null)}
                          className="relative w-16 h-16 rounded-2xl border-2 border-amber-400/50 overflow-hidden bg-[#070D1B] shrink-0 cursor-pointer group shadow-lg"
                          title="Click to zoom Money Receipt Voucher"
                        >
                          <img src={d.receiptUrl} alt="Voucher Receipt" className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-amber-300">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#070D1B] border border-[#D4AF37]/30 flex items-center justify-center text-amber-400 shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-amber-300">{d.id}</span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            ৳{d.amount.toLocaleString()} BDT
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            d.status?.toLowerCase() === 'approved' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : d.status?.toLowerCase() === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {d.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-bold mt-0.5">
                          {d.memberName} <span className="text-slate-400 font-mono text-[11px]">({d.memberId})</span>
                        </p>
                        <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                          Method: <strong className="text-amber-300">{d.paymentMethod}</strong> • Ref: <strong className="text-slate-200">{d.referenceNumber || 'N/A'}</strong> • Date: {d.depositDate}
                        </p>
                        {d.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewVoucherImage(d.receiptUrl || null)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{language === 'bn' ? 'আপলোডকৃত মানি রসিদ দেখুন' : 'Inspect Money Receipt Image'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedAuditDeposit(d)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#070D1B] hover:bg-[#112244] text-amber-300 font-bold text-xs rounded-xl transition border border-[#D4AF37]/30 cursor-pointer"
                        title={language === 'bn' ? "অফিসিয়াল ভাউচার শিট দেখুন" : "View Official Voucher Sheet"}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'bn' ? 'ভাউচার শিট' : 'Voucher Sheet'}</span>
                      </button>

                      <button
                        onClick={() => {
                          const isOwn = currentMember && (
                            d.memberId === currentMember.id || 
                            (d.memberName && currentMember.fullName && d.memberName.toLowerCase().trim() === currentMember.fullName.toLowerCase().trim()) ||
                            (authUser?.email && d.memberEmail && d.memberEmail.toLowerCase().trim() === authUser.email.toLowerCase().trim())
                          );
                          if (isOwn) {
                            triggerSecurityAlert();
                            return;
                          }
                          setSignatureModalDeposit(d);
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition border active:scale-95 cursor-pointer ${
                          d.status?.toLowerCase() === 'approved'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/40'
                        }`}
                        title={language === 'bn' ? "সাক্ষর প্রদান ও অনুমোদন করুন" : "Approve with Signature"}
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {d.status?.toLowerCase() === 'approved' 
                            ? (language === 'bn' ? 'অনুমোদিত' : 'Approved') 
                            : (language === 'bn' ? 'অনুমোদন করুন' : 'Approve')}
                        </span>
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(language === 'bn' ? 'আপনি কি এই জমাটি বাতিল বা রিজেক্ট করতে নিশ্চিত?' : 'Are you sure you want to reject this deposit?')) {
                            await rejectDeposit(d.id);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition border active:scale-95 cursor-pointer ${
                          d.status?.toLowerCase() === 'rejected'
                            ? 'bg-rose-600 text-white border-rose-500 shadow-lg'
                            : 'bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border-rose-500/40'
                        }`}
                        title={language === 'bn' ? "বাতিল করুন" : "Reject Deposit"}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>
                          {d.status?.toLowerCase() === 'rejected' 
                            ? (language === 'bn' ? 'বাতিলকৃত' : 'Rejected') 
                            : (language === 'bn' ? 'বাতিল করুন' : 'Reject')}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Money Receipt Voucher Image */}
      {previewVoucherImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewVoucherImage(null);
          }}
        >
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Uploaded Money Receipt / Bank Deposit Voucher</span>
              </span>
              <button
                onClick={() => setPreviewVoucherImage(null)}
                className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1 text-xs font-bold"
              >
                <X className="w-5 h-5" />
                <span>বন্ধ করুন</span>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black p-2 flex items-center justify-center">
              <img src={previewVoucherImage} alt="Voucher Full Preview" className="max-h-[65vh] object-contain rounded-lg shadow-lg mx-auto" />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewVoucherImage(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700 active:scale-95"
              >
                Close Preview (বন্ধ করুন)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Receipt Modal for Audit Voucher Sheet */}
      <DepositReceiptModal
        deposit={selectedAuditDeposit}
        isOpen={!!selectedAuditDeposit}
        onClose={() => setSelectedAuditDeposit(null)}
      />

      {/* Admin Signature Modal for Audit Approval */}
      <AdminSignatureModal
        isOpen={!!signatureModalDeposit}
        onClose={() => setSignatureModalDeposit(null)}
        deposit={signatureModalDeposit}
        onConfirmApprove={async (sigUrl) => {
          if (signatureModalDeposit) {
            await approveDeposit(signatureModalDeposit.id, sigUrl);
            setSignatureModalDeposit(null);
          }
        }}
      />

      {/* Sub-View 2: Admin Users & Security Controls (Role Management) */}
      {currentSubView === 'users' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Admin Form */}
            <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Create New Admin</span>
              </h3>

              {role !== 'super_admin' ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs">
                  Only <strong>System Admin</strong> role can create or remove administrative accounts.
                </div>
              ) : (
                <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Select Registered Member (মেম্বার নির্বাচন করুন)</span>
                      <span className="text-[10px] text-amber-400 font-bold">List ({members.length})</span>
                    </label>
                    <select
                      value={selectedMemberForAdmin}
                      onChange={e => handleSelectMemberForAdmin(e.target.value)}
                      className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="" className="bg-[#070D1B]">-- Choose Member from Club List --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id} className="bg-[#070D1B]">
                          {m.fullName} ({m.id}) {m.role === 'super_admin' ? '👑 System Admin' : m.role === 'admin' ? '★ Admin' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Admin Rahman"
                      value={newAdminName}
                      onChange={e => setNewAdminName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@pbcclub.org"
                      value={newAdminEmail}
                      onChange={e => setNewAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Admin Level</label>
                    <select
                      value="admin"
                      disabled
                      className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/20 rounded-xl text-amber-300 font-bold cursor-not-allowed opacity-90"
                    >
                      <option value="admin" className="bg-[#070D1B]">Admin</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Rule: Standard Admin accounts can be created. There is strictly only ONE System Admin in the application.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-slate-950" />
                    <span>Create / Assign Admin Role</span>
                  </button>
                </form>
              )}
            </div>

            {/* Admin User List */}
            <div className="lg:col-span-2 bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Active System Administrators ({users.length})</span>
              </h3>

              <div className="divide-y divide-[#D4AF37]/20">
                {users.map((u, idx) => {
                  const isSuperAdminAccount = u.role === 'super_admin' || u.email.toLowerCase() === 'fokrulislammir9897@gmail.com';
                  return (
                    <div key={u.uid || `user-${idx}`} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-white text-xs block">{u.displayName}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {role === 'super_admin' && !isSuperAdminAccount ? (
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.uid, e.target.value as any)}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-[#070D1B] border border-[#D4AF37]/30 text-amber-300"
                            title="Change User Role"
                          >
                            <option value="member" className="bg-[#070D1B]">Member</option>
                            <option value="admin" className="bg-[#070D1B]">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            isSuperAdminAccount
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {isSuperAdminAccount ? 'SYSTEM ADMIN' : u.role.replace('_', ' ')}
                          </span>
                        )}

                        {role === 'super_admin' && !isSuperAdminAccount && (
                          <button
                            onClick={() => removeAdminUser(u.uid)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                            title="Remove Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: System Settings */}
      {currentSubView === 'settings' && (
        <div className="space-y-6">

          <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Global PBC Club Configuration</span>
              </h3>
              <p className="text-xs text-slate-300">
                System governance, auto approval rules, maintenance modes
              </p>
            </div>

            {role !== 'super_admin' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs">
                System Settings and global parameters are locked. Only <strong>System Admin</strong> can modify global club settings.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Theme Customizer Box */}
                <ThemeSelectorCard />

                {/* App Logo Customization Box */}
                <div className="p-5 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>Application Branding Logo (অ্যাপের কাস্টম লোগো)</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Upload your custom logo image to display across the Navbar, Sidebar, Member Cards, and Splash Screen.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                    {/* Logo Preview */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="p-2 bg-[#0B1528] rounded-2xl shadow-md border border-[#D4AF37]/30">
                        <PbcLogo className="w-20 h-20" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">Current Logo Preview</span>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Select Image File (PNG / JPG / SVG / WebP)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('Please select an image smaller than 5MB');
                                return;
                              }
                              try {
                                const compressedUrl = await compressImageToDataUrl(file, 300, 0.82);
                                if (compressedUrl && compressedUrl.length < 100 * 1024) {
                                  safeStorage.setItem('pbc_cached_custom_logo', compressedUrl);
                                }
                                await updateSystemSettings({ customLogoUrl: compressedUrl });
                              } catch (err) {
                                console.error('Failed to compress logo image:', err);
                                alert('Failed to process logo image.');
                              }
                            }
                          }}
                          className="block w-full text-xs text-slate-300
                            file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0
                            file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300
                            hover:file:bg-amber-500/30 file:cursor-pointer cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {systemSettings.customLogoUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              safeStorage.removeItem('pbc_cached_custom_logo');
                              updateSystemSettings({ customLogoUrl: '' });
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl border border-rose-500/30 transition cursor-pointer"
                          >
                            Reset to Default Official Logo
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            ✓ Currently using default official circular emblem (/logo.svg)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Dedicated ID Card Header Logo (Horizontal Luxury Banner) */}
                <div className="p-4 bg-[#070D1B] border border-[#D4AF37]/30 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span>Dedicated ID Card Header Logo (আইডি কার্ডের বিশেষ লোগো)</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Only used for the luxury horizontal header at the top of the Member PVC ID Card (Airplane + PBC Monogram + PROBASHI BUSINESS CLUB).
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                    {/* Card Logo Preview */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="p-3 bg-[#040D1B] rounded-2xl shadow-md border border-[#D4AF37]/40 w-52 h-16 flex items-center justify-center">
                        <PbcAirplaneHeaderLogo className="w-44 h-10" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">ID Card Header Preview</span>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Select Custom ID Card Logo (PNG / SVG / WebP)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('Please select an image smaller than 5MB');
                                return;
                              }
                              try {
                                const compressedUrl = await compressImageToDataUrl(file, 1200, 0.95);
                                if (compressedUrl && compressedUrl.length < 250 * 1024) {
                                  safeStorage.setItem('pbc_cached_custom_card_logo', compressedUrl);
                                }
                                await updateSystemSettings({ customCardLogoUrl: compressedUrl });
                              } catch (err) {
                                console.error('Failed to compress ID card logo:', err);
                                alert('Failed to process image.');
                              }
                            }
                          }}
                          className="block w-full text-xs text-slate-300
                            file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0
                            file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300
                            hover:file:bg-amber-500/30 file:cursor-pointer cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {systemSettings.customCardLogoUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              safeStorage.removeItem('pbc_cached_custom_card_logo');
                              updateSystemSettings({ customCardLogoUrl: '' });
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl border border-rose-500/30 transition cursor-pointer"
                          >
                            Reset to Built-in Vector Header
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            ✓ Currently using built-in high-definition Golden Airplane & PBC monogram vector
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Club Title</label>
                    <input
                      type="text"
                      value={systemSettings.clubName ?? ''}
                      onChange={e => updateSystemSettings({ clubName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Primary Operating Currency</label>
                    <input
                      type="text"
                      disabled
                      value={systemSettings.currency ?? 'BDT'}
                      className="w-full px-3 py-2 bg-[#070D1B]/50 border border-[#D4AF37]/20 rounded-xl text-amber-300 font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30">
                    <div>
                      <span className="font-bold text-white block">Require Admin Approval</span>
                      <span className="text-[11px] text-slate-400">Hold new member registrations for review</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!systemSettings.requireAdminApproval}
                      onChange={e => updateSystemSettings({ requireAdminApproval: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30">
                    <div>
                      <span className="font-bold text-white block">Expat Registration Portal</span>
                      <span className="text-[11px] text-slate-400">Allow new users to sign up online</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!systemSettings.registrationOpen}
                      onChange={e => updateSystemSettings({ registrationOpen: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-4 bg-[#070D1B] rounded-2xl border border-rose-500/40 col-span-1 md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm block">System Maintenance Mode (মেইনটেন্যান্স মোড)</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            systemSettings.maintenanceMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {systemSettings.maintenanceMode ? '🔴 Active (মেইনটেন্যান্স চালু)' : '🟢 App Live (অ্যাপ সচল)'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          সিস্টেম আপডেট চলাকালীন সাধারণ মেম্বারদের প্রবেশ রুদ্ধ করে নোটিশ প্রদর্শন করবে। (System Admin ব্যতীত কেউ লগইন করতে পারবে না)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!systemSettings.maintenanceMode}
                        onChange={e => updateSystemSettings({ maintenanceMode: e.target.checked })}
                        className="w-6 h-6 accent-rose-500 rounded cursor-pointer"
                      />
                    </div>

                    {systemSettings.maintenanceMode && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-amber-300">
                            মেইনটেন্যান্স নোটিশ বার্তা (Maintenance Notice Message):
                          </label>
                          <button
                            type="button"
                            onClick={() => updateSystemSettings({
                              maintenanceMessage: `সম্মানিত মেম্বারবৃন্দ,\nঅ্যাপটির নতুন নিরাপত্তা আপডেট ও পারফরম্যান্স উন্নয়নের কাজ চলমান রয়েছে। সাময়িকভাবে সাধারণ মেম্বারদের জন্য লগইন ও অ্যাপ ব্যবহারের সেবা স্থগিত রাখা হয়েছে।\n\nকাজ শেষ হওয়া মাত্রই অ্যাপটি পুনরায় স্বাভাবিকভাবে সচল করা হবে। আপনার ধৈর্য ও সহযোগিতার জন্য ধন্যবাদ।`
                            })}
                            className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-500/40 transition cursor-pointer"
                          >
                            ✨ স্ট্যান্ডার্ড নোটিশ লোড করুন
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={systemSettings.maintenanceMessage ?? ''}
                          onChange={e => updateSystemSettings({ maintenanceMessage: e.target.value })}
                          placeholder="এখানে মেম্বারদের দেখার জন্য নোটিশ লিখুন..."
                          className="w-full px-3 py-2 bg-[#02050A] border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Application Version & Update Control */}
                  <div className="pt-2 col-span-1 md:col-span-2">
                    <AppUpdateSettingCard />
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-View 4: Activity Log */}
      {currentSubView === 'logs' && (
        <div className="space-y-6">

          <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                <History className="w-5 h-5 text-amber-400" />
                <span>Audit Trail & Activity Logs ({activityLogs.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Real-time system events</span>
            </div>

            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {activityLogs.map((log, idx) => {
                const logDate = new Date(log.timestamp);
                const isValidDate = !isNaN(logDate.getTime());
                const dateStr = isValidDate 
                  ? logDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '';
                const timeStr = isValidDate
                  ? logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : log.timestamp;

                return (
                  <div 
                    key={log.id || `log-${idx}`} 
                    className="p-3.5 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[#D4AF37]/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{log.action}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                          {log.userEmail || 'system@pbcclub.org'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{log.details}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono shrink-0 bg-[#0B1528] px-3 py-1.5 rounded-xl border border-[#D4AF37]/20 self-start sm:self-auto">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dateStr && (
                          <>
                            <span className="text-amber-300 font-semibold">{dateStr}</span>
                            <span className="text-slate-600 font-bold">•</span>
                          </>
                        )}
                        <span className="text-slate-300">{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 5: Push Broadcast */}
      {currentSubView === 'broadcast' && (
        <div className="space-y-6">

          <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white uppercase tracking-wide">
                  Broadcast Push Notification
                </h3>
              </div>
              {toastSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Broadcast Sent Live to All Members!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Notification Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={notifType}
                    onChange={e => setNotifType(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white font-medium"
                  >
                    <option value="deposit" className="bg-[#070D1B]">Deposit Alert</option>
                    <option value="profit" className="bg-[#070D1B]">Profit Dividend</option>
                    <option value="project" className="bg-[#070D1B]">Real Estate Acquisition</option>
                    <option value="system" className="bg-[#070D1B]">System Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={2}
                  required
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>Send Push Alert Now</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub-View 6: Database Backup & Restore */}
      {currentSubView === 'backup' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Card */}
            <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    {isBn ? 'ডাটাবেজ ব্যাকআপ ডাউনলোড (Export)' : 'Export Full Backup'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {isBn ? 'বর্তমান সমস্ত রেকর্ড JSON ফাইল হিসেবে সেভ করুন' : 'Generate & download complete JSON snapshot'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#070D1B] p-4 rounded-2xl border border-[#D4AF37]/20">
                {isBn 
                  ? 'এই অপশনের মাধ্যমে ক্লাবের সকল সদস্যের তথ্য, জমা হওয়া ডিপোজিট, প্রকল্পসমূহ, অডিট হিস্ট্রি এবং সিস্টেম কনফিগারেশন একটি সুরক্ষিত JSON ফাইল হিসেবে আপনার ডিভাইসে ডাউনলোড হবে।' 
                  : 'Exports all verified members, transaction records, investment portfolios, audit logs, and club settings into a clean, portable JSON format.'}
              </p>

              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isBn ? 'ব্যাকআপ ফাইল ডাউনলোড করুন (.json)' : 'Download Backup File (.json)'}</span>
              </button>
            </div>

            {/* Restore Card */}
            <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    {isBn ? 'ডাটাবেজ রিস্টোর (Restore)' : 'Restore From Backup'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {isBn ? 'পূর্বের সেভ করা JSON ফাইল আপলোড করুন' : 'Upload backup JSON file to restore database'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#070D1B] p-4 rounded-2xl border border-[#D4AF37]/20">
                {isBn 
                  ? '⚠️ সতর্কতা: ব্যাকআপ রিস্টোর করলে বর্তমান সমস্ত রেকর্ড ফাইলটির তথ্য দিয়ে প্রতিস্থাপিত হবে। শুধুমাত্র সুপার অ্যাডমিন এই কাজটি সম্পাদন করতে পারবে।' 
                  : '⚠️ Notice: Restoring from a backup will replace the current live database state with the data from the uploaded file. Only authorized Super Admins can execute this action.'}
              </p>

              {role === 'super_admin' ? (
                <div className="space-y-3">
                  {isRestoring ? (
                    <div className="p-4 bg-cyan-950/40 border border-cyan-500/50 rounded-2xl flex items-center justify-center gap-3 text-cyan-300 animate-pulse">
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                      <span className="font-bold text-xs">{restoreStatus || (isBn ? 'ডাটাবেজে রিস্টোর হচ্ছে...' : 'Restoring to database...')}</span>
                    </div>
                  ) : (
                    <label className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#070D1B] hover:bg-[#112244] text-cyan-300 hover:text-cyan-200 border-2 border-dashed border-cyan-500/50 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>{isBn ? 'JSON ব্যাকআপ ফাইল নির্বাচন করুন' : 'Select Backup JSON File'}</span>
                      <input 
                        type="file" 
                        accept=".json,application/json" 
                        onChange={handleRestoreBackup} 
                        className="hidden" 
                        disabled={isRestoring}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center font-bold">
                  Restricted to Super Admin Only
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Restore Result Modal */}
      {restoreResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1528] border-2 border-emerald-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {isBn ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!' : 'Backup Restored Successfully!'}
                </h3>
                <p className="text-xs text-slate-300">
                  {isBn ? 'Firestore ডাটাবেজে সকল রেকর্ড আপডেট হয়েছে' : 'Records synchronized into Firebase Firestore'}
                </p>
              </div>
            </div>

            <div className="bg-[#070D1B] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">{isBn ? 'মেম্বার প্রোফাইল:' : 'Members:'}</span>
                <span className="font-mono font-bold text-amber-300">{restoreResultModal.counts.members}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">{isBn ? 'ডিপোজিট ও ভাউচার:' : 'Deposits:'}</span>
                <span className="font-mono font-bold text-emerald-400">{restoreResultModal.counts.deposits}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">{isBn ? 'রিয়েল এস্টেট প্রজেক্ট:' : 'Projects:'}</span>
                <span className="font-mono font-bold text-cyan-300">{restoreResultModal.counts.projects}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">{isBn ? 'বোর্ড অফ ডিরেক্টরস:' : 'Board Directors:'}</span>
                <span className="font-mono font-bold text-purple-300">{restoreResultModal.counts.directors}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-white font-bold">{isBn ? 'সর্বমোট রেকর্ড:' : 'Total Restored:'}</span>
                <span className="font-mono font-black text-base text-yellow-400">{restoreResultModal.counts.total}</span>
              </div>
            </div>

            {restoreResultModal.errors.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300">
                <p className="font-bold">{restoreResultModal.errors.length} non-fatal item notices:</p>
                <p className="truncate">{restoreResultModal.errors[0]}</p>
              </div>
            )}

            <button
              onClick={() => {
                setRestoreResultModal(null);
                window.location.reload();
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              {isBn ? 'অ্যাপ রিফ্রেশ করে নতুন ডেটা দেখুন' : 'Refresh App & View Live Records'}
            </button>
          </div>
        </div>
      )}

      {/* Admin Signature Modal for Audit Approval */}
      <AdminSignatureModal
        isOpen={!!signatureModalDeposit}
        onClose={() => setSignatureModalDeposit(null)}
        deposit={signatureModalDeposit}
        onConfirmApprove={async (sigUrl) => {
          if (signatureModalDeposit) {
            await approveDeposit(signatureModalDeposit.id, sigUrl);
            setSignatureModalDeposit(null);
          }
        }}
      />

    </div>
  );
};

