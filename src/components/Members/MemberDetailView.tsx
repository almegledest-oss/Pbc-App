import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, Deposit } from '../../types';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { DigitalMemberCardModal } from './DigitalMemberCardModal';
import { MemberFormModal } from './MemberFormModal';
import { DepositReceiptModal } from '../Deposits/DepositReceiptModal';
import { 
  ArrowLeft, 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Shield, 
  Wallet, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  Share2, 
  FileText, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  UserCheck, 
  Receipt, 
  Layers,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';

interface MemberDetailViewProps {
  memberId: string;
  onBack?: () => void;
}

export const MemberDetailView: React.FC<MemberDetailViewProps> = ({ memberId, onBack }) => {
  const { 
    members, 
    deposits, 
    projects, 
    role, 
    language, 
    goBack, 
    navigateWithHistory, 
    updateMember, 
    approveMember, 
    rejectMember,
    deleteDeposit,
    deleteDepositWithReason,
    resetMemberDeposits,
    accountRole,
    authUser,
    currentMember
  } = useApp();

  const isBn = language === 'bn';
  const member = members.find(m => m.id === memberId);

  // Strict Super Admin Verification
  const isSuperAdminOnly = 
    role === 'super_admin' || 
    accountRole === 'super_admin' || 
    currentMember?.role === 'super_admin' ||
    authUser?.email === 'almegledest@gmail.com' ||
    authUser?.email === 'fokrulislammir9897@gmail.com';

  // Sub-modal states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Deposit | null>(null);

  if (!member) {
    return (
      <div className="bg-[#0B1528] rounded-3xl p-8 sm:p-12 text-center border border-[#D4AF37]/30 text-white max-w-2xl mx-auto shadow-2xl">
        <Shield className="w-16 h-16 mx-auto mb-4 text-amber-400/50" />
        <h3 className="text-xl font-bold mb-2">{isBn ? 'মেম্বার তথ্য পাওয়া যায়নি' : 'Member Record Not Found'}</h3>
        <p className="text-sm text-slate-400 mb-6">
          {isBn ? `সদস্য আইডি (${memberId}) খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে।` : `Member ID (${memberId}) was not found or has been removed.`}
        </p>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : goBack())}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition"
        >
          {isBn ? '← মেম্বার তালিকায় ফিরে যান' : '← Back to Members List'}
        </button>
      </div>
    );
  }

  // Filter member deposits
  const isApproved = (s?: string) => s?.toLowerCase().trim() === 'approved';
  const memberDeposits = deposits.filter(
    d => d.memberId === member.id || (member.fullName && d.memberName && d.memberName.toLowerCase().trim() === member.fullName.toLowerCase().trim())
  );

  const approvedDeposits = memberDeposits.filter(d => isApproved(d.status));
  const pendingDeposits = memberDeposits.filter(d => d.status?.toLowerCase().trim() === 'pending');

  const totalVoucherSum = approvedDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalDepositAmount = Math.max(totalVoucherSum, Number(member.totalDeposit) || 0);
  const unvoucheredBalance = Math.max(0, totalDepositAmount - totalVoucherSum);

  const fundRaisingAmount = approvedDeposits
    .filter(d => d.category === 'Fund Raising' || !d.category)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0) + unvoucheredBalance;
  const realEstateAmount = approvedDeposits
    .filter(d => d.category === 'Real Estate')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Projects member is invested in
  const memberProjects = projects.filter(p => 
    p.memberAllocations && p.memberAllocations.some(a => a.memberId === member.id)
  );

  const handleOpenVoucher = (deposit: Deposit) => {
    navigateWithHistory({
      tab: 'deposits',
      subView: 'voucher',
      subId: deposit.id,
      title: `Voucher #${deposit.id}`,
      titleBn: `ভাউচার #${deposit.id}`,
      isFocusMode: true
    });
    setSelectedVoucher(deposit);
  };

  const handleOpenWhatsApp = () => {
    if (!member.phone) return;
    const cleanPhone = member.phone.replace(/[^0-9+]/g, '');
    const url = `https://wa.me/${cleanPhone.replace('+', '')}`;
    window.open(url, '_blank');
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    setResetFeedback(null);
    try {
      await resetMemberDeposits(member.id, 'Reset member deposits to ৳0 by admin');
      setResetFeedback({
        type: 'success',
        message: isBn 
          ? '✓ সফলভাবে সমস্ত ভাউচার মুছে ফেলা হয়েছে এবং মোট জমা ৳০ করা হয়েছে!' 
          : '✓ All vouchers permanently removed and total deposit reset to ৳0!'
      });
      setShowResetConfirm(false);
      setTimeout(() => {
        setIsAuditModalOpen(false);
        setResetFeedback(null);
      }, 1600);
    } catch (err: any) {
      setResetFeedback({
        type: 'error',
        message: (isBn ? 'ডিলিট করতে সমস্যা হয়েছে: ' : 'Error during reset: ') + (err?.message || 'Failed')
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSyncWithVouchers = async () => {
    setIsResetting(true);
    setResetFeedback(null);
    try {
      await updateMember(member.id, {
        totalDeposit: totalVoucherSum
      });
      setResetFeedback({
        type: 'success',
        message: isBn 
          ? `✓ সফলভাবে ভাউচারের সাথে মোট জমা (৳${totalVoucherSum.toLocaleString()}) সিঙ্ক করা হয়েছে!` 
          : `✓ Synced total deposit with vouchers (৳${totalVoucherSum.toLocaleString()}) successfully!`
      });
      setTimeout(() => {
        setIsAuditModalOpen(false);
        setResetFeedback(null);
      }, 1600);
    } catch (err: any) {
      setResetFeedback({
        type: 'error',
        message: (isBn ? 'সিঙ্ক করতে ব্যর্থ হয়েছে: ' : 'Error syncing: ') + (err?.message || 'Failed')
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-white animate-fadeIn pb-16">
      
      {/* Detail Header & Action Breadcrumb */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/40 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top bar with back button & member status badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : goBack())}
            className="flex items-center gap-2 px-4 py-2 bg-[#070D1B] hover:bg-[#112244] text-amber-300 rounded-xl border border-[#D4AF37]/40 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>{isBn ? '← মেম্বার তালিকা' : '← All Members'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-black rounded-full capitalize flex items-center gap-1.5 ${
              member.role === 'super_admin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : member.role === 'admin'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                : 'bg-slate-700/30 text-slate-300 border border-slate-600/40'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>{member.role === 'super_admin' ? 'Super Admin' : member.role === 'admin' ? 'Admin' : 'Member'}</span>
            </span>

            <span className={`px-3 py-1 text-xs font-black rounded-full capitalize flex items-center gap-1.5 ${
              member.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : member.status === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
            }`}>
              {member.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{member.status}</span>
            </span>
          </div>
        </div>

        {/* Member Profile Banner Card */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative shrink-0">
            <PBCFramedAvatar
              photoUrl={member.photoUrl}
              name={member.fullName}
              alt={member.fullName}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-amber-500/60 shadow-2xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-[#070D1B] border border-amber-500/60 text-amber-300 font-mono font-black text-xs rounded-lg shadow-lg">
              {member.id}
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span>{member.fullName}</span>
                  {member.batchNumber && (
                    <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full tracking-wider">
                      BATCH: {member.batchNumber}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-amber-300/90 font-medium flex items-center justify-center md:justify-start gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{member.city ? `${member.city}, ` : ''}{member.country}</span>
                  {member.bloodGroup && (
                    <span className="ml-2 px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-md text-[11px] font-bold">
                      🩸 {member.bloodGroup}
                    </span>
                  )}
                </p>
              </div>

              {/* Quick Actions Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-slate-950" />
                  <span>{isBn ? 'ডিজিটাল আইডি কার্ড' : 'Digital ID Card'}</span>
                </button>

                {(role === 'super_admin' || role === 'admin') && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#070D1B] hover:bg-[#112244] text-amber-300 rounded-xl border border-amber-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isBn ? 'এডিট প্রোফাইল' : 'Edit'}</span>
                  </button>
                )}

                {member.phone && (
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-xl border border-emerald-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

            {/* Contact pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-[#070D1B] px-3 py-1.5 rounded-xl border border-slate-800">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{member.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#070D1B] px-3 py-1.5 rounded-xl border border-slate-800">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{member.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#070D1B] px-3 py-1.5 rounded-xl border border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? `যোগদান: ${member.joinDate || 'N/A'}` : `Joined: ${member.joinDate || 'N/A'}`}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B1528] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'সর্বমোট ডিপোজিট' : 'Total Approved Deposit'}
            </span>
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-300">
            ৳{totalDepositAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">BDT</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {isBn 
              ? `${approvedDeposits.length} টি অনুমোদিত ট্রানজ্যাকশন${unvoucheredBalance > 0 ? ` (+৳${unvoucheredBalance.toLocaleString()} প্রোফাইল ব্যালেন্স)` : ''}`
              : `${approvedDeposits.length} approved transaction(s)${unvoucheredBalance > 0 ? ` (+৳${unvoucheredBalance.toLocaleString()} profile balance)` : ''}`}
          </p>

          {isSuperAdminOnly && (
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'ডিপোজিট অডিট ও রিসেট (সুপার অ্যাডমিন)' : 'Audit & Reset Deposit (Super Admin)'}</span>
            </button>
          )}
        </div>

        <div className="bg-[#0B1528] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'ফান্ড রেইজিং ডিপোজিট' : 'Fund Raising Deposit'}
            </span>
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-400">
            ৳{fundRaisingAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">BDT</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalDepositAmount > 0 ? `${((fundRaisingAmount / totalDepositAmount) * 100).toFixed(1)}% of total fund` : '0%'}
          </p>
        </div>

        <div className="bg-[#0B1528] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'রিয়েল এস্টেট ডিপোজিট' : 'Real Estate Deposit'}
            </span>
            <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-cyan-400">
            ৳{realEstateAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">BDT</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalDepositAmount > 0 ? `${((realEstateAmount / totalDepositAmount) * 100).toFixed(1)}% of total fund` : '0%'}
          </p>
        </div>
      </div>

      {/* Member Full Personal & Family Details Breakdown */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 p-5 sm:p-7 shadow-xl space-y-6">
        <h3 className="text-base font-black text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>{isBn ? 'সদস্যের সম্পূর্ণ তথ্য ও প্রোফাইল বিবরণ' : 'Personal & Nominee Information'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'পিতার নাম' : "Father's Name"}</span>
            <p className="font-bold text-white text-sm">{member.fatherName || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'মাতার নাম' : "Mother's Name"}</span>
            <p className="font-bold text-white text-sm">{member.motherName || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'জন্ম তারিখ' : 'Date of Birth'}</span>
            <p className="font-bold text-white text-sm">{member.dateOfBirth || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'জাতীয় পরিচয়পত্র (NID / Passport)' : 'NID / Passport'}</span>
            <p className="font-bold text-amber-300 font-mono text-sm">{member.nidOrPassport || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'স্থায়ী ঠিকানা (বাংলাদেশ)' : 'Permanent Address (BD)'}</span>
            <p className="font-bold text-white text-sm">
              {[member.permanentVillage, member.permanentSubDistrict, member.permanentDistrict, member.permanentPostalCode].filter(Boolean).join(', ') || member.permanentAddress || 'N/A'}
            </p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'প্রবাসের ঠিকানা' : 'Expat Resident Address'}</span>
            <p className="font-bold text-white text-sm">
              {[member.expatAddress, member.city, member.country].filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'নমিনীর নাম ও সম্পর্ক' : 'Nominee Name & Relation'}</span>
            <p className="font-bold text-white text-sm">
              {member.nomineeName ? `${member.nomineeName} (${member.nomineeRelation || 'Nominee'})` : 'N/A'}
            </p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'নমিনীর মোবাইল' : 'Nominee Phone'}</span>
            <p className="font-bold text-white text-sm">{member.nomineeMobile || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'নমিনীর ঠিকানা' : 'Nominee Address'}</span>
            <p className="font-bold text-white text-sm">{member.nomineeAddress || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Member Deposit Transactions Ledger Table (Master-Detail link to Vouchers) */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div>
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span>{isBn ? 'মেম্বারের ডিপোজিট লেজার ও ডিজিটাল ভাউচার' : 'Member Deposit Ledger & Digital Vouchers'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn ? 'ভাউচার দেখতে যেকোনো ট্রানজ্যাকশনে ক্লিক করুন' : 'Click on any deposit to inspect digital voucher & audit trail'}
            </p>
          </div>
          <span className="px-3 py-1 bg-[#070D1B] text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold">
            Total Records: {memberDeposits.length}
          </span>
        </div>

        {memberDeposits.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-[#070D1B] rounded-2xl border border-slate-800">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold">{isBn ? 'এই মেম্বারের কোনো ডিপোজিট রেকর্ড নেই' : 'No deposits recorded for this member yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070D1B] text-amber-300 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Voucher ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {memberDeposits.map((dep) => (
                  <tr 
                    key={dep.id} 
                    onClick={() => handleOpenVoucher(dep)}
                    className="hover:bg-[#112244]/60 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-300 group-hover:text-amber-200">
                      {dep.id}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {dep.depositDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dep.category === 'Real Estate' 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {dep.category || 'Fund Raising'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {dep.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-black text-amber-300">
                      ৳{dep.amount.toLocaleString()} BDT
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        dep.status?.toLowerCase() === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : dep.status?.toLowerCase() === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenVoucher(dep);
                          }}
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          {isBn ? 'ভাউচার দেখুন' : 'View Voucher'}
                        </button>
                        {(role === 'admin' || role === 'super_admin') && (
                          <button
                            type="button"
                            title={isBn ? 'ভাউচার ডিলিট করুন' : 'Delete voucher'}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDepositToDelete(dep);
                            }}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition cursor-pointer border border-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Projects Invested Section */}
      {memberProjects.length > 0 && (
        <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 p-5 sm:p-7 shadow-xl space-y-4">
          <h3 className="text-base font-black text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>{isBn ? 'বিনিয়োগকৃত প্রজেক্টসমূহ' : 'Allocated Investment Projects'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memberProjects.map(proj => {
              const alloc = proj.memberAllocations?.find(a => a.memberId === member.id);
              return (
                <div 
                  key={proj.id}
                  onClick={() => {
                    navigateWithHistory({
                      tab: 'real_estate',
                      subView: 'project_detail',
                      subId: proj.id,
                      title: proj.projectName,
                      titleBn: proj.projectName,
                      isFocusMode: true
                    });
                  }}
                  className="p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30 hover:border-amber-400 transition cursor-pointer flex items-center gap-4 group"
                >
                  <img 
                    src={proj.photos?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'} 
                    alt={proj.projectName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="overflow-hidden flex-1">
                    <h4 className="font-bold text-white group-hover:text-amber-300 text-sm truncate">
                      {proj.projectName}
                    </h4>
                    <p className="text-xs text-amber-300/80 mt-0.5">
                      Allocated: <span className="font-black text-amber-300">৳{alloc?.allocatedAmount?.toLocaleString() || 0} BDT</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {proj.city}, {proj.country} • {proj.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Digital Member Card Modal */}
      <DigitalMemberCardModal
        member={member}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />

      {/* Member Form Modal for Editing */}
      <MemberFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        memberToEdit={member}
      />

      {/* Deposit Voucher Slip Modal */}
      {selectedVoucher && (
        <DepositReceiptModal
          deposit={selectedVoucher}
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}

      {/* Individual Deposit Delete Confirm Modal */}
      {depositToDelete && (
        <DeleteConfirmModal
          isOpen={!!depositToDelete}
          title={isBn ? 'ডিপোজিট ভাউচার ডিলিট (Delete Voucher)' : 'Delete Deposit Voucher'}
          itemName={`Voucher ${depositToDelete.id} - ৳${(depositToDelete.amount || 0).toLocaleString()} (${depositToDelete.memberName})`}
          language={language}
          onClose={() => setDepositToDelete(null)}
          onConfirm={async (reason) => {
            await deleteDepositWithReason(depositToDelete.id, reason);
            setDepositToDelete(null);
          }}
        />
      )}

      {/* Admin Deposit Audit & Reset Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B1528] border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => {
                setIsAuditModalOpen(false);
                setShowResetConfirm(false);
                setResetFeedback(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {isBn ? 'ডিপোজিট অডিট ও রিসেট কন্ট্রোল' : 'Deposit Audit & Reset Control'}
                </h3>
                <p className="text-xs text-slate-400">
                  {member.fullName} ({member.id})
                </p>
              </div>
            </div>

            {/* Status Feedback Banner */}
            {resetFeedback && (
              <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-fadeIn ${
                resetFeedback.type === 'success' 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}>
                {resetFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{resetFeedback.message}</span>
              </div>
            )}

            {/* Breakdown Information Box */}
            <div className="bg-[#070D1B] rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">{isBn ? 'মেম্বার প্রোফাইল মোট জমা (members কালেকশন):' : 'Member Profile Total (members collection):'}</span>
                <span className="font-mono font-bold text-amber-300">৳{Number(member.totalDeposit || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">{isBn ? `অনুমোদিত ভাউচার মোট (${approvedDeposits.length}টি ভাউচার):` : `Approved Vouchers Sum (${approvedDeposits.length} vouchers):`}</span>
                <span className="font-mono font-bold text-emerald-400">৳{totalVoucherSum.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-200 font-bold">{isBn ? 'অ্যাপে প্রদর্শিত বর্তমান মোট জমা:' : 'Current Calculated Total in App:'}</span>
                <span className="font-mono font-black text-amber-400 text-sm">৳{totalDepositAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
              <p>
                {isBn 
                  ? '💡 ব্যাখ্যা: ফায়ারবেসে মেম্বারের প্রোফাইল ব্যালেন্স এবং জমা তালিকার ভাউচার দুটি ভিন্ন জায়গায় থাকে। নিচের বাটন দিয়ে আপনি সমস্ত ভাউচার নিশ্চিতভাবে মুছে ফেলতে পারেন এবং মেম্বার ব্যালেন্স স্থায়ীভাবে ৳০ করতে পারেন।'
                  : '💡 Note: Deposits exist in both member documents and deposit vouchers. The red action below will permanently delete all vouchers from Firebase and reset deposit balance to ৳0.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {showResetConfirm ? (
                <div className="p-4 rounded-2xl bg-rose-950/70 border-2 border-rose-500/80 space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-rose-200 uppercase tracking-wider">
                        {isBn ? 'চূড়ান্ত নিশ্চয়তা প্রয়োজন (Confirm Permanent Reset)' : 'Confirm Permanent Reset'}
                      </h4>
                      <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                        {isBn 
                          ? `${member.fullName} (${member.id})-এর সমস্ত ভাউচার (${memberDeposits.length}টি) ফায়ারবেস থেকে স্থায়ীভাবে মুছে ফেলা হবে এবং মোট জমা ৳০ হয়ে যাবে।`
                          : `All ${memberDeposits.length} voucher(s) for ${member.fullName} (${member.id}) will be deleted from Firebase and total deposit will become ৳0.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={handleExecuteReset}
                      className="flex-1 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      <span>{isResetting ? (isBn ? 'ডিলিট হচ্ছে...' : 'Deleting...') : (isBn ? 'হ্যাঁ, নিশ্চিতভাবে সব মুছে ৳০ করুন' : 'Yes, Delete All & Reset to ৳0')}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={() => setShowResetConfirm(false)}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isBn ? 'সব ভাউচার ডিলিট ও মোট জমা ৳০ করুন' : 'Delete All Vouchers & Reset Total to ৳0'}</span>
                </button>
              )}

              <button
                type="button"
                disabled={isResetting || totalVoucherSum === Number(member.totalDeposit)}
                onClick={handleSyncWithVouchers}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isBn ? 'ভাউচারের সাথে প্রোফাইল ব্যালেন্স সিঙ্ক করুন' : 'Sync Profile Balance to Vouchers'}</span>
              </button>

              <button
                type="button"
                disabled={isResetting}
                onClick={() => {
                  setIsAuditModalOpen(false);
                  setShowResetConfirm(false);
                  setResetFeedback(null);
                }}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition font-semibold cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
