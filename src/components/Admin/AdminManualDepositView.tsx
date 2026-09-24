import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, Deposit } from '../../types';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { DepositReceiptModal } from '../Deposits/DepositReceiptModal';
import { compressImageToDataUrl } from '../../services/firebaseService';
import { 
  Wallet, 
  Search, 
  CheckCircle2, 
  Building2, 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  User, 
  Tag, 
  Receipt, 
  Upload, 
  FileText, 
  RefreshCw, 
  ShieldCheck, 
  Printer, 
  X, 
  Plus, 
  Minus,
  Sparkles,
  ChevronDown,
  Info,
  Check,
  Building,
  Image as ImageIcon
} from 'lucide-react';

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Generate selectable months for 2024 - 2027
const ALL_MONTH_OPTIONS = [2027, 2026, 2025, 2024].flatMap(year => 
  MONTH_NAMES_EN.map((monthEn, idx) => ({
    value: `${monthEn} ${year}`,
    labelEn: `${monthEn} ${year}`,
    labelBn: `${MONTH_NAMES_BN[idx]} ${year}`,
    year,
    monthIdx: idx
  }))
);

interface AdminManualDepositViewProps {
  onBack?: () => void;
}

export const AdminManualDepositView: React.FC<AdminManualDepositViewProps> = ({ onBack }) => {
  const { 
    members, 
    deposits,
    addDeposit, 
    language, 
    role, 
    currentMember, 
    authUser,
    systemSettings
  } = useApp();

  const isBn = language === 'bn';
  const shareUnitPrice = systemSettings?.shareUnitPrice || 5000;

  // Determine current, next, and previous months
  const currentDate = new Date();
  const currentMonthIdx = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthVal = `${MONTH_NAMES_EN[currentMonthIdx]} ${currentYear}`;
  const currentMonthBn = `${MONTH_NAMES_BN[currentMonthIdx]} ${currentYear}`;

  const nextMonthIdx = (currentMonthIdx + 1) % 12;
  const nextYear = currentMonthIdx === 11 ? currentYear + 1 : currentYear;
  const nextMonthVal = `${MONTH_NAMES_EN[nextMonthIdx]} ${nextYear}`;
  const nextMonthBn = `${MONTH_NAMES_BN[nextMonthIdx]} ${nextYear}`;

  const prevMonthIdx = (currentMonthIdx + 11) % 12;
  const prevYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
  const prevMonthVal = `${MONTH_NAMES_EN[prevMonthIdx]} ${prevYear}`;
  const prevMonthBn = `${MONTH_NAMES_BN[prevMonthIdx]} ${prevYear}`;

  // 1. Member Selection
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 2. Share Count (Defaults to 1 or member's commitment)
  const [shareCount, setShareCount] = useState<number>(1);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState<number | ''>('');

  // 3. Target Month
  const [targetMonth, setTargetMonth] = useState<string>(currentMonthVal);

  // 4. Fund Type / Category (Fund Raising vs Real Estate)
  const [category, setCategory] = useState<'Fund Raising' | 'Real Estate'>('Fund Raising');

  // 5. Payment Method (Bank, bKash, Nagad, Cash)
  const [paymentMethod, setPaymentMethod] = useState<Deposit['paymentMethod']>('Bank');
  const [showAllPaymentMethods, setShowAllPaymentMethods] = useState(false);

  // Optional Details
  const [referenceNumber, setReferenceNumber] = useState<string>(
    `ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [depositDate, setDepositDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [autoApprove, setAutoApprove] = useState<boolean>(true);

  // Submission & Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdDeposit, setCreatedDeposit] = useState<Deposit | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Calculate actual amount in BDT
  const calculatedAmount = isCustomAmount && typeof customAmount === 'number' && customAmount > 0
    ? customAmount
    : shareCount * shareUnitPrice;

  // Filtered members for smart search
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members.slice(0, 8);
    const q = memberSearch.toLowerCase().trim();
    return members.filter(m => 
      m.id.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      (m.fullNameBn && m.fullNameBn.toLowerCase().includes(q)) ||
      m.phone.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.country && m.country.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [members, memberSearch]);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setMemberSearch(`${member.fullName} (${member.id})`);
    setIsDropdownOpen(false);
    
    // Auto-set share count based on member's commitment if available
    const commitment = member.monthlyShareCommitment || 1;
    setShareCount(commitment);
    setIsCustomAmount(false);
    setCustomAmount('');
  };

  // Sync auto notes whenever month, shares, or category changes
  useEffect(() => {
    const monthLabel = targetMonth === 'general' 
      ? (isBn ? 'সাধারণ জমা' : 'General Deposit') 
      : targetMonth;
    const catLabel = category === 'Fund Raising' 
      ? (isBn ? 'তহবিল সংগ্রহ / মূলধন' : 'Fund Raising') 
      : (isBn ? 'রিয়েল এস্টেট' : 'Real Estate');
    
    const autoNote = isBn 
      ? `${monthLabel} - ${shareCount}টি শেয়ার (৳${calculatedAmount.toLocaleString('en-BD')}, ${paymentMethod}) [${catLabel}]` 
      : `${monthLabel} - ${shareCount} Share(s) (৳${calculatedAmount.toLocaleString('en-BD')}, ${paymentMethod}) [${catLabel}]`;
    
    setNotes(autoNote);
  }, [targetMonth, shareCount, calculatedAmount, category, paymentMethod, isBn]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file, 800, 0.7);
      setReceiptImage(compressed);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      alert(isBn ? 'অনুগ্রহ করে প্রথমে একজন সদস্য নির্বাচন করুন।' : 'Please select a member first.');
      return;
    }

    if (!calculatedAmount || calculatedAmount <= 0) {
      alert(isBn ? 'সঠিক জমার পরিমাণ নির্বাচন করুন।' : 'Please specify a valid deposit amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const adminName = currentMember?.fullName || authUser?.displayName || (role === 'super_admin' ? 'Super Admin' : 'Admin');
      const adminId = currentMember?.id || (role === 'super_admin' ? 'PBC-00001' : 'PBC-ADMIN');
      const adminSig = currentMember?.adminSignature || undefined;

      const finalTargetMonth = targetMonth === 'general' ? undefined : targetMonth;
      const monthLabel = finalTargetMonth ? `Contribution Month: ${finalTargetMonth}` : 'General Contribution';

      const fullNotes = [
        monthLabel,
        notes.trim(),
        `Admin Entry by ${adminName} (${adminId})`
      ].filter(Boolean).join(' | ');

      const depositData: Omit<Deposit, 'id' | 'status'> & { 
        status?: 'Approved' | 'Pending' | 'Rejected'; 
        approvedByAdminName?: string; 
        approvedByAdminId?: string;
        approvedByAdminSignature?: string;
      } = {
        memberId: selectedMember.id,
        memberName: selectedMember.fullName,
        amount: calculatedAmount,
        shareCount: shareCount,
        shareUnitPrice: shareUnitPrice,
        monthlyShareCommitment: selectedMember.monthlyShareCommitment || 1,
        monthCount: 1,
        depositMode: targetMonth === 'general' ? 'general' : 'single_month',
        coveredPeriodText: finalTargetMonth,
        category: category,
        currency: 'BDT',
        depositDate: depositDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber || `ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: fullNotes,
        targetMonth: finalTargetMonth,
        receiptUrl: receiptImage || undefined,
        status: autoApprove ? 'Approved' : 'Pending',
        approvedByAdminName: autoApprove ? adminName : undefined,
        approvedByAdminId: autoApprove ? adminId : undefined,
        approvedByAdminSignature: autoApprove ? adminSig : undefined
      };

      await addDeposit(depositData);

      const generatedDeposit: Deposit = {
        id: `DEP-${Math.floor(9000 + Math.random() * 9000)}`,
        ...depositData,
        status: autoApprove ? 'Approved' : 'Pending'
      };

      setCreatedDeposit(generatedDeposit);
      setShowReceiptModal(true);

      // Reset fields for the next entry
      setReferenceNumber(`ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`);
      setReceiptImage('');
    } catch (err: any) {
      console.error('Error recording deposit:', err);
      alert((isBn ? 'ডিপোজিট এন্ট্রি করতে সমস্যা হয়েছে: ' : 'Failed to record deposit: ') + (err?.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNext = () => {
    setShowReceiptModal(false);
    setCreatedDeposit(null);
    setSelectedMember(null);
    setMemberSearch('');
    setShareCount(1);
    setIsCustomAmount(false);
    setCustomAmount('');
    setReceiptImage('');
    setReferenceNumber(`ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#070D1B] via-[#0B1528] to-[#112244] p-6 rounded-3xl text-white border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full uppercase tracking-widest shadow-md">
                {isBn ? 'অ্যাডমিন ডাইরেক্ট এন্ট্রি' : 'ADMIN DIRECT ENTRY'}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {isBn ? '১০ সেকেন্ডে দ্রুত এন্ট্রি' : 'Fast 10s Entry'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300 uppercase flex items-center gap-3">
              <Wallet className="w-7 h-7 text-amber-400 shrink-0" />
              <span>{isBn ? 'অ্যাডমিন ডিপোজিট এন্ট্রি' : 'Admin Deposit Entry'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isBn 
                ? 'মেম্বারদের প্রাপ্ত কিস্তির টাকা মাত্র ৫টি সহজ ধাপে সরাসরি অ্যাডমিন প্যানেল থেকে এন্ট্রি দিন। সিস্টেম স্বয়ংক্রিয়ভাবে সিল ও সিগনেচারযুক্ত পাকা রসিদ তৈরি করে দেবে।'
                : 'Directly credit member shares in 5 simple steps. Automatically calculates amount and issues official signed vouchers.'}
            </p>
          </div>

          {/* Admin Info Badge */}
          <div className="bg-[#070D1B]/90 border border-amber-500/40 p-3.5 rounded-2xl shrink-0 flex items-center gap-3 shadow-inner">
            <PBCFramedAvatar 
              photoUrl={currentMember?.photoUrl} 
              name={currentMember?.fullName || 'Admin'} 
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-400" 
            />
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                {isBn ? 'লগইনকৃত অ্যাডমিন' : 'Authorized Admin'}
              </span>
              <span className="font-extrabold text-amber-300 block text-sm">
                {currentMember?.fullName || authUser?.displayName || 'PBC Admin'}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                {currentMember?.id || 'PBC-ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Streamlined Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* ========================================================= */}
        {/* STEP 1: মেম্বার নির্বাচন (SELECT MEMBER) */}
        {/* ========================================================= */}
        <div className="bg-[#0B1528] text-white p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                ১
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  {isBn ? 'মেম্বার নির্বাচন করুন' : '1. Select Member'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {isBn ? 'নাম, মেম্বার আইডি বা ফোন নম্বর দিয়ে খুঁজে বের করুন' : 'Search by ID, Name or Mobile'}
                </p>
              </div>
            </div>

            {selectedMember && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null);
                  setMemberSearch('');
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                {isBn ? 'পরিবর্তন করুন' : 'Change'}
              </button>
            )}
          </div>

          {!selectedMember ? (
            <div className="relative">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={isBn ? "যেমন: PBC-1001, শাকিল রানা, বা ০১৭১..." : "Type ID (e.g. PBC-1001), Name, or Mobile..."}
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#070D1B] border-2 border-amber-500/40 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-semibold shadow-inner"
                />
              </div>

              {/* Suggestions Dropdown */}
              {isDropdownOpen && filteredMembers.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-2 bg-[#070D1B] border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <div className="p-2 text-[10px] uppercase font-bold text-amber-300/80 bg-[#0B1528] border-b border-slate-800 px-3">
                    {isBn ? 'মেম্বার তালিকা থেকে সিলেক্ট করুন:' : 'Matching Members:'}
                  </div>
                  {filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMember(m)}
                      className="p-3 hover:bg-[#112244] border-b border-slate-800/60 last:border-none flex items-center justify-between gap-3 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <PBCFramedAvatar 
                          photoUrl={m.photoUrl} 
                          name={m.fullName} 
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-amber-400/50" 
                        />
                        <div>
                          <div className="font-extrabold text-white text-xs sm:text-sm">
                            {m.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="text-amber-400 font-mono font-bold">{m.id}</span>
                            <span>•</span>
                            <span>{m.phone}</span>
                            {m.country && (
                              <>
                                <span>•</span>
                                <span>{m.country}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 block">
                          {m.monthlyShareCommitment || 1} {isBn ? 'শেয়ার/মাস' : 'share/mo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Selected Member Card */
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-[#070D1B] to-emerald-500/10 rounded-2xl border-2 border-amber-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <PBCFramedAvatar 
                  photoUrl={selectedMember.photoUrl} 
                  name={selectedMember.fullName} 
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white text-base">
                      {selectedMember.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      ● {selectedMember.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-amber-400 font-mono font-bold">{selectedMember.id}</span>
                    <span>•</span>
                    <span>{selectedMember.phone}</span>
                    {selectedMember.country && (
                      <>
                        <span>•</span>
                        <span>{selectedMember.country}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-700/60 pt-3 sm:pt-0 sm:pl-4">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                    {isBn ? 'প্রতিশ্রুতি' : 'Monthly Rate'}
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    {selectedMember.monthlyShareCommitment || 1} {isBn ? 'টি শেয়ার/মাস' : 'Share(s)/mo'}
                  </span>
                </div>
                <div className="h-7 w-px bg-slate-700" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                    {isBn ? 'পূর্বের মোট জমা' : 'Total Deposit'}
                  </span>
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    ৳{Math.max(
                      deposits
                        .filter(d => (d.memberId === selectedMember.id || (selectedMember.fullName && d.memberName && d.memberName.toLowerCase().trim() === selectedMember.fullName.toLowerCase().trim())) && d.status?.toLowerCase().trim() === 'approved')
                        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
                      Number(selectedMember.totalDeposit) || 0
                    ).toLocaleString('en-BD')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* STEP 2: শেয়ার সংখ্যা নির্বাচন (SELECT SHARE COUNT) */}
        {/* ========================================================= */}
        <div className="bg-[#0B1528] text-white p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                ২
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  {isBn ? 'শেয়ার সংখ্যা নির্বাচন করুন' : '2. Select Share Count'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {isBn ? `১টি শেয়ার = ৳${shareUnitPrice.toLocaleString('en-BD')} (টাকা অটোমেটিক গুণ হবে)` : `1 Share = ৳${shareUnitPrice.toLocaleString('en-BD')} (auto-calculated)`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCustomAmount(!isCustomAmount);
                if (!isCustomAmount) {
                  setCustomAmount(shareCount * shareUnitPrice);
                }
              }}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              {isCustomAmount ? (isBn ? 'শেয়ার মোডে ফিরুন' : 'Back to Shares') : (isBn ? 'কাস্টম টাকার অংক' : 'Custom Amount')}
            </button>
          </div>

          {!isCustomAmount ? (
            <div className="space-y-4">
              {/* Quick Pills for 1, 2, 3, 4, 5, 10 shares */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 10].map((num) => {
                  const isSelected = shareCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setShareCount(num)}
                      className={`py-3 px-2 rounded-2xl border-2 transition font-black text-center cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-300 text-slate-950 shadow-lg scale-[1.02]'
                          : 'bg-[#070D1B] border-slate-700/80 text-white hover:border-amber-400'
                      }`}
                    >
                      <span className="text-base sm:text-lg">{num}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                        {isBn ? 'শেয়ার' : 'Share(s)'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Counter [-] [+] */}
              <div className="flex items-center justify-between p-3.5 bg-[#070D1B] rounded-2xl border border-slate-700/60">
                <span className="text-xs text-slate-300 font-bold">
                  {isBn ? 'অন্য সংখ্যা প্রয়োজন?' : 'Need a different count?'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShareCount(Math.max(1, shareCount - 1))}
                    disabled={shareCount <= 1}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-black text-amber-300 font-mono w-10 text-center">
                    {shareCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShareCount(shareCount + 1)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Auto Total Display */}
              <div className="p-4 bg-gradient-to-r from-[#112244] to-[#070D1B] rounded-2xl border border-amber-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block">
                    {isBn ? `মোট জমার পরিমাণ (${shareCount}টি শেয়ার × ৳${shareUnitPrice.toLocaleString('en-BD')}):` : `Total Amount (${shareCount} share(s) × ৳${shareUnitPrice}):`}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {isBn ? 'সরাসরি মেম্বার অ্যাকাউন্টে ক্রেডিট হবে' : 'Will be directly credited'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  ৳{(shareCount * shareUnitPrice).toLocaleString('en-BD')}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Amount Input */
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                {isBn ? 'কাস্টম জমার পরিমাণ লিখুন (টাকা) *' : 'Enter Custom Deposit Amount (BDT) *'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-400 font-mono">৳</span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5000"
                  value={customAmount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setCustomAmount(val);
                    if (typeof val === 'number') {
                      setShareCount(Math.max(1, Math.round(val / shareUnitPrice)));
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3.5 bg-[#070D1B] border-2 border-amber-500/40 rounded-2xl text-amber-300 font-mono font-black text-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* STEP 3: কোন মাসের কিস্তি/শেয়ার (SELECT MONTH) */}
        {/* ========================================================= */}
        <div className="bg-[#0B1528] text-white p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-amber-500/20">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
              ৩
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {isBn ? 'কোন মাসের শেয়ার বা কিস্তি?' : '3. Contribution Month'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isBn ? '১ ক্লিকে চলতি বা যেকোনো মাস সিলেক্ট করুন' : 'Select target month'}
              </p>
            </div>
          </div>

          {/* Quick Month Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { val: currentMonthVal, label: isBn ? `চলতি মাস (${currentMonthBn})` : `Current (${currentMonthVal})` },
              { val: nextMonthVal, label: isBn ? `পরবর্তী (${nextMonthBn})` : `Next (${nextMonthVal})` },
              { val: prevMonthVal, label: isBn ? `পূর্ববর্তী (${prevMonthBn})` : `Prev (${prevMonthVal})` },
              { val: 'general', label: isBn ? 'সাধারণ জমা (নন-মান্থলি)' : 'General / Non-Monthly' },
            ].map(m => {
              const isSelected = targetMonth === m.val;
              return (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setTargetMonth(m.val)}
                  className={`p-3 rounded-2xl border-2 transition text-center cursor-pointer text-xs font-bold ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-lg scale-[1.02]'
                      : 'bg-[#070D1B] border-slate-700/80 text-slate-300 hover:border-amber-400'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* All Months Dropdown Selector */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{isBn ? 'অন্য কোনো মাস বেছে নিতে ড্রপডাউন ব্যবহার করুন:' : 'Or choose from all months:'}</span>
              <span className="text-[11px] text-amber-400 font-bold">
                {isBn ? 'নির্বাচিত:' : 'Selected:'} {targetMonth === 'general' ? (isBn ? 'সাধারণ জমা' : 'General') : targetMonth}
              </span>
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="w-full px-4 py-3 bg-[#070D1B] border border-amber-500/40 rounded-xl text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="general">{isBn ? 'সাধারণ জমা (নন-মান্থলি)' : 'General / Non-Monthly Deposit'}</option>
              {ALL_MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isBn ? opt.labelBn : opt.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 4: তহবিল টাইপ (FUND RAISING vs REAL ESTATE) */}
        {/* ========================================================= */}
        <div className="bg-[#0B1528] text-white p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-amber-500/20">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
              ৪
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {isBn ? 'তহবিল টাইপ নির্বাচন করুন' : '4. Select Fund Type'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'ফান্ডরেইজিং নাকি রিয়েল এস্টেট প্রজেক্ট' : 'Fund Raising or Real Estate'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Fund Raising */}
            <button
              type="button"
              onClick={() => setCategory('Fund Raising')}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                category === 'Fund Raising'
                  ? 'bg-[#112244] border-amber-400 text-white shadow-xl ring-2 ring-amber-400/30'
                  : 'bg-[#070D1B] border-slate-700/80 text-slate-400 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black ${
                  category === 'Fund Raising' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  🏢
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {isBn ? 'ফান্ডরেইজিং (Fund Raising)' : 'Fund Raising'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isBn ? 'মাসিক নিয়মিত কিস্তি ও ক্লাব মূলধন' : 'Monthly savings & regular club equity'}
                  </p>
                </div>
              </div>
              {category === 'Fund Raising' && <CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" />}
            </button>

            {/* Real Estate */}
            <button
              type="button"
              onClick={() => setCategory('Real Estate')}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                category === 'Real Estate'
                  ? 'bg-[#112244] border-emerald-400 text-white shadow-xl ring-2 ring-emerald-400/30'
                  : 'bg-[#070D1B] border-slate-700/80 text-slate-400 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black ${
                  category === 'Real Estate' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  🏗️
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {isBn ? 'রিয়েল এস্টেট (Real Estate)' : 'Real Estate'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isBn ? 'জমি ক্রয়, আবাসন প্রকল্প ও প্রজেক্ট শেয়ার' : 'Land, project & property capital fund'}
                  </p>
                </div>
              </div>
              {category === 'Real Estate' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 5: পেমেন্ট মেথড (PAYMENT METHOD) */}
        {/* ========================================================= */}
        <div className="bg-[#0B1528] text-white p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                ৫
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  {isBn ? 'পেমেন্ট মাধ্যম সিলেক্ট করুন' : '5. Select Payment Method'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {isBn ? 'টাকা কীভাবে জমা দেওয়া হয়েছে' : 'Payment Channel'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAllPaymentMethods(!showAllPaymentMethods)}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              {showAllPaymentMethods ? (isBn ? 'সংক্ষিপ্ত করুন' : 'Less') : (isBn ? '+ অন্যান্য মাধ্যম' : '+ More Methods')}
            </button>
          </div>

          {/* 4 Primary Payment Methods */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'Bank', label: isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer', icon: '🏦' },
              { id: 'bKash', label: 'bKash / বিকাশ', icon: '📱' },
              { id: 'Nagad', label: 'Nagad / নগদ', icon: '📲' },
              { id: 'Cash', label: isBn ? 'নগদ ক্যাশ' : 'Cash', icon: '💵' },
            ].map((m) => {
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3.5 rounded-2xl border-2 transition text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-300 text-slate-950 font-black shadow-lg scale-[1.02]'
                      : 'bg-[#070D1B] border-slate-700/80 text-white hover:border-amber-400 font-bold'
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Extended Methods if toggled */}
          {showAllPaymentMethods && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 animate-in fade-in">
              {[
                { id: 'Bank Wire', label: isBn ? 'রেমিট্যান্স / ওয়্যার' : 'Bank Wire', icon: '✈️' },
                { id: 'Wise', label: 'Wise / Exchange', icon: '🌐' },
                { id: 'Cheque', label: isBn ? 'চেক (Cheque)' : 'Cheque', icon: '📜' },
                { id: 'Stripe/Card', label: isBn ? 'কার্ড / পিওএস' : 'Card / POS', icon: '💳' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border transition text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                        : 'bg-[#070D1B] border-slate-800 text-slate-300 hover:border-amber-400 font-semibold'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* OPTIONAL DETAILS (Collapsible / Clean) */}
        {/* ========================================================= */}
        <div className="bg-[#0B1528] text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div 
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-300 group-hover:text-amber-300 transition">
                {isBn ? 'অতিরিক্ত ঐচ্ছিক তথ্য (স্লিপ ছবি, TrxID, তারিখ)' : 'Optional Details (Slip photo, TrxID, Date)'}
              </span>
            </div>
            <span className="text-xs text-amber-400 font-bold">
              {showOptionalFields ? (isBn ? 'লুকান ▲' : 'Hide ▲') : (isBn ? 'দেখান ▼' : 'Show ▼')}
            </span>
          </div>

          {showOptionalFields && (
            <div className="space-y-4 pt-3 border-t border-slate-800/80 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* TrxID / Ref */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span>{isBn ? 'TrxID / ভাউচার রেফারেন্স' : 'TrxID / Reference No'}</span>
                    <button
                      type="button"
                      onClick={() => setReferenceNumber(`ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`)}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {isBn ? 'নতুন রেফারেন্স' : 'Refresh'}
                    </button>
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Deposit Date */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isBn ? 'জমার তারিখ' : 'Deposit Date'}
                  </label>
                  <input
                    type="date"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Bank Slip Upload */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between text-xs">
                  <span>{isBn ? 'পেমেন্ট স্লিপের ছবি (ঐচ্ছিক)' : 'Payment Slip Screenshot (Optional)'}</span>
                  {receiptImage && (
                    <button
                      type="button"
                      onClick={() => setReceiptImage('')}
                      className="text-rose-400 hover:underline text-[11px] font-bold"
                    >
                      {isBn ? 'ছবি মুছুন' : 'Remove'}
                    </button>
                  )}
                </label>

                {receiptImage ? (
                  <div className="p-3 bg-[#070D1B] rounded-2xl border border-emerald-500/40 flex items-center gap-3">
                    <img src={receiptImage} alt="Receipt preview" className="w-14 h-14 rounded-xl object-cover border border-amber-400 shadow-md" />
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {isBn ? 'স্লিপের ছবি সংযুক্ত হয়েছে' : 'Slip attached'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isBn ? 'মানি রিসিটে সংরক্ষিত থাকবে' : 'Will be embedded into voucher'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="p-3 bg-[#070D1B] hover:bg-[#112244] rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400 transition flex items-center justify-center gap-2 cursor-pointer text-slate-400 text-xs font-bold">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'ক্লিক করে স্লিপ ছবি আপলোড করুন' : 'Click to attach receipt slip'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-xs">
                  {isBn ? 'অটো-নোটস (ভাউচারে প্রিন্ট হবে)' : 'Notes on Receipt'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SUBMIT BUTTON */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !selectedMember}
            className="w-full sm:flex-1 py-4 sm:py-4.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-2xl shadow-amber-950/40 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>{isBn ? 'ডাটাবেজে যুক্ত হচ্ছে...' : 'Saving Deposit...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                <span>
                  {isBn 
                    ? `৳${calculatedAmount.toLocaleString('en-BD')} জমা কনফার্ম করুন ও রসিদ তৈরি করুন` 
                    : `Confirm ৳${calculatedAmount.toLocaleString('en-BD')} Deposit & Issue Receipt`}
                </span>
              </>
            )}
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-4 bg-[#0B1528] hover:bg-[#112244] text-slate-300 hover:text-white border border-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              {isBn ? 'ফিরে যান' : 'Back'}
            </button>
          )}
        </div>
      </form>

      {/* Generated Money Receipt Modal */}
      {showReceiptModal && createdDeposit && (
        <DepositReceiptModal
          deposit={createdDeposit}
          isOpen={showReceiptModal}
          onClose={handleResetForNext}
        />
      )}

    </div>
  );
};
