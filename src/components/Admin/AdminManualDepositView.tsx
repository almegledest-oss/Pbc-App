import React, { useState, useMemo } from 'react';
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
  Building, 
  Calendar, 
  User, 
  Tag, 
  Receipt, 
  Upload, 
  FileText, 
  RefreshCw, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Printer, 
  Share2, 
  X, 
  Plus, 
  Sparkles,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  defaultRate: number; // approximate rate to BDT
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Helper to generate selectable contribution months
const GENERATED_MONTH_OPTIONS = [2027, 2026, 2025, 2024].flatMap(year => 
  MONTH_NAMES_EN.map((monthEn, idx) => ({
    value: `${monthEn} ${year}`,
    labelEn: `${monthEn} ${year}`,
    labelBn: `${MONTH_NAMES_BN[idx]} ${year}`,
    year,
    monthIdx: idx
  }))
);

const QUICK_MONTH_PRESETS = [
  { value: 'August 2026', labelEn: 'Aug 2026', labelBn: 'আগস্ট ২০২৬' },
  { value: 'September 2026', labelEn: 'Sep 2026', labelBn: 'সেপ্টেম্বর ২০২৬' },
  { value: 'October 2026', labelEn: 'Oct 2026', labelBn: 'অক্টোবর ২০২৬' },
  { value: 'general', labelEn: 'Non-Monthly', labelBn: 'সাধারণ জমা' },
];

const POPULAR_CURRENCIES: CurrencyRate[] = [
  { code: 'BDT', name: 'Bangladeshi Taka (৳)', symbol: '৳', defaultRate: 1 },
  { code: 'AED', name: 'UAE Dirham (د.إ)', symbol: 'AED', defaultRate: 32.8 },
  { code: 'SAR', name: 'Saudi Riyal (﷼)', symbol: 'SAR', defaultRate: 32.1 },
  { code: 'QAR', name: 'Qatari Riyal (﷼)', symbol: 'QAR', defaultRate: 33.0 },
  { code: 'KWD', name: 'Kuwaiti Dinar (د.ك)', symbol: 'KWD', defaultRate: 391.0 },
  { code: 'OMR', name: 'Omani Rial (﷼)', symbol: 'OMR', defaultRate: 312.0 },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$', defaultRate: 121.5 },
  { code: 'EUR', name: 'Euro (€)', symbol: '€', defaultRate: 131.0 },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£', defaultRate: 153.5 },
  { code: 'MYR', name: 'Malaysian Ringgit (RM)', symbol: 'MYR', defaultRate: 27.5 },
  { code: 'SGD', name: 'Singapore Dollar (S$)', symbol: 'SGD', defaultRate: 90.5 },
];

export const AdminManualDepositView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { 
    members, 
    addDeposit, 
    language, 
    role, 
    currentMember, 
    authUser,
    navigateWithHistory,
    goBack
  } = useApp();

  const isBn = language === 'bn';

  // Member Selection State
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Deposit Form State
  const [category, setCategory] = useState<'Fund Raising' | 'Real Estate'>('Fund Raising');
  const [paymentMethod, setPaymentMethod] = useState<Deposit['paymentMethod']>('Cash');
  const [amountBDT, setAmountBDT] = useState<number | ''>(5000);
  const [depositDate, setDepositDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState<string>(
    `ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [bankOrBranch, setBankOrBranch] = useState<string>('');
  const [targetMonth, setTargetMonth] = useState<string>('August 2026');
  const [notes, setNotes] = useState<string>(
    isBn ? 'মাসিক কিস্তি ও সঞ্চয় - আগস্ট ২০২৬' : 'Monthly Contribution - August 2026'
  );
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [autoApprove, setAutoApprove] = useState<boolean>(true);

  const handleTargetMonthChange = (selected: string) => {
    setTargetMonth(selected);
    if (
      !notes || 
      notes.includes('Monthly Contribution') || 
      notes.includes('মাসিক কিস্তি') || 
      notes === 'Admin Manual Deposit Entry' || 
      notes.includes('General Deposit') || 
      notes.includes('সাধারণ জমা')
    ) {
      if (selected === 'general') {
        setNotes(isBn ? 'সাধারণ জমা / নন-মান্থলি অ্যাডমিন এন্ট্রি' : 'General Deposit / Non-Monthly Entry');
      } else {
        const found = GENERATED_MONTH_OPTIONS.find(m => m.value === selected);
        const displayLabel = isBn && found ? found.labelBn : selected;
        setNotes(isBn ? `মাসিক কিস্তি ও সঞ্চয় - ${displayLabel}` : `Monthly Contribution - ${selected}`);
      }
    }
  };

  // Expatriate Currency Conversion Helper State
  const [enableCurrencyCalculator, setEnableCurrencyCalculator] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyRate>(POPULAR_CURRENCIES[1]); // AED by default
  const [foreignAmount, setForeignAmount] = useState<number | ''>('');
  const [exchangeRate, setExchangeRate] = useState<number>(32.8);

  // Submission & Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdDeposit, setCreatedDeposit] = useState<Deposit | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Filtered members for smart search
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members.slice(0, 10);
    const q = memberSearch.toLowerCase().trim();
    return members.filter(m => 
      m.id.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      (m.fullNameBn && m.fullNameBn.toLowerCase().includes(q)) ||
      m.phone.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setMemberSearch(`${member.fullName} (${member.id})`);
    setIsDropdownOpen(false);
  };

  const handleQuickAmount = (val: number) => {
    setAmountBDT(prev => {
      const current = typeof prev === 'number' ? prev : 0;
      return current + val;
    });
  };

  const handleForeignAmountChange = (val: number | '') => {
    setForeignAmount(val);
    if (typeof val === 'number' && val > 0 && exchangeRate > 0) {
      const calculatedBDT = Math.round(val * exchangeRate);
      setAmountBDT(calculatedBDT);
      setNotes(`Admin Manual Deposit: ${val} ${selectedCurrency.code} @ ৳${exchangeRate}/unit = ৳${calculatedBDT.toLocaleString('en-BD')}`);
    }
  };

  const handleCurrencyChange = (currCode: string) => {
    const found = POPULAR_CURRENCIES.find(c => c.code === currCode) || POPULAR_CURRENCIES[0];
    setSelectedCurrency(found);
    setExchangeRate(found.defaultRate);
    if (typeof foreignAmount === 'number' && foreignAmount > 0) {
      const calculatedBDT = Math.round(foreignAmount * found.defaultRate);
      setAmountBDT(calculatedBDT);
      setNotes(`Admin Manual Deposit: ${foreignAmount} ${found.code} @ ৳${found.defaultRate}/unit = ৳${calculatedBDT.toLocaleString('en-BD')}`);
    }
  };

  const handleExchangeRateChange = (rate: number) => {
    setExchangeRate(rate);
    if (typeof foreignAmount === 'number' && foreignAmount > 0) {
      const calculatedBDT = Math.round(foreignAmount * rate);
      setAmountBDT(calculatedBDT);
      setNotes(`Admin Manual Deposit: ${foreignAmount} ${selectedCurrency.code} @ ৳${rate}/unit = ৳${calculatedBDT.toLocaleString('en-BD')}`);
    }
  };

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

    const numAmount = Number(amountBDT);
    if (!numAmount || numAmount <= 0) {
      alert(isBn ? 'সঠিক জমার পরিমাণ (টাকা) প্রদান করুন।' : 'Please enter a valid deposit amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const adminName = currentMember?.fullName || authUser?.displayName || (role === 'super_admin' ? 'Super Admin' : 'Admin');
      const adminId = currentMember?.id || (role === 'super_admin' ? 'PBC-00001' : 'PBC-ADMIN');

      const monthLabel = targetMonth && targetMonth !== 'general' ? `Contribution Month: ${targetMonth}` : null;
      const fullNotes = [
        monthLabel,
        notes.trim(),
        bankOrBranch ? `Channel Details: ${bankOrBranch}` : null,
        `Manual Entry recorded by ${adminName} (${adminId})`
      ].filter(Boolean).join(' | ');

      const depositData: Omit<Deposit, 'id' | 'status'> & { 
        status?: 'Approved' | 'Pending' | 'Rejected'; 
        approvedByAdminName?: string; 
        approvedByAdminId?: string 
      } = {
        memberId: selectedMember.id,
        memberName: selectedMember.fullName,
        amount: numAmount,
        category: category,
        currency: 'BDT',
        depositDate: depositDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber || `ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: fullNotes,
        targetMonth: targetMonth !== 'general' ? targetMonth : undefined,
        receiptUrl: receiptImage || undefined,
        status: autoApprove ? 'Approved' : 'Pending',
        approvedByAdminName: autoApprove ? adminName : undefined,
        approvedByAdminId: autoApprove ? adminId : undefined
      };

      await addDeposit(depositData);

      const generatedDeposit: Deposit = {
        id: `DEP-${Math.floor(9000 + Math.random() * 9000)}`,
        ...depositData,
        status: autoApprove ? 'Approved' : 'Pending'
      };

      setCreatedDeposit(generatedDeposit);
      setSuccessToast(true);
      setShowReceiptModal(true);

      // Reset Form fields for next entry
      setReferenceNumber(`ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`);
      setBankOrBranch('');
      setReceiptImage('');
      setForeignAmount('');
    } catch (err: any) {
      console.error('Error recording manual deposit:', err);
      alert((isBn ? 'ডিপোজিট অ্যান্ট্রি করতে সমস্যা হয়েছে: ' : 'Failed to record manual deposit: ') + (err?.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewDeposit = () => {
    setShowReceiptModal(false);
    setCreatedDeposit(null);
    setSelectedMember(null);
    setMemberSearch('');
    setAmountBDT(5000);
    setTargetMonth('August 2026');
    setNotes(isBn ? 'মাসিক কিস্তি ও সঞ্চয় - আগস্ট ২০২৬' : 'Monthly Contribution - August 2026');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Top Banner / Header Card */}
      <div className="bg-gradient-to-r from-[#070D1B] via-[#0B1528] to-[#112244] p-6 rounded-3xl text-white border-2 border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full uppercase tracking-widest shadow-md">
                {isBn ? 'অ্যাডমিন কন্ট্রোল পোর্টাল' : 'ADMIN CONTROL PORTAL'}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {isBn ? 'ডাইরেক্ট ক্রেডিট সিস্টেম' : 'Direct Credit Engine'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300 uppercase flex items-center gap-3">
              <Wallet className="w-8 h-8 text-amber-400" />
              <span>{isBn ? 'অ্যাডমিন ম্যানুয়াল ডিপোজিট' : 'Admin Manual Deposit'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isBn 
                ? 'প্রবাসী ও সাধারণ সদস্যগণ যারা সরাসরি অ্যাপে পেমেন্ট করতে পারেন না, তাদের ব্যাংক ড্রাফট, ক্যাশ, বা রেমিট্যান্সের মাধ্যমে প্রাপ্ত টাকা অ্যাডমিন সরাসরি সদস্যের নামে জমা করে দিতে পারবেন।'
                : 'Directly credit funds received via Cash, Bank Wire, Remittance, or Mobile Banking for expatriate & club members.'}
            </p>
          </div>

          {/* Admin Info Badge */}
          <div className="bg-[#070D1B]/90 border border-[#D4AF37]/40 p-4 rounded-2xl shrink-0 flex items-center gap-3 shadow-inner">
            <PBCFramedAvatar 
              photoUrl={currentMember?.photoUrl} 
              name={currentMember?.fullName || 'Admin'} 
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400" 
            />
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                {isBn ? 'লগইনকৃত অ্যাডমিন' : 'Authorized Admin'}
              </span>
              <span className="font-extrabold text-amber-300 block text-sm">
                {currentMember?.fullName || authUser?.displayName || 'PBC Admin'}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                {currentMember?.id || 'PBC-ADMIN'} • {role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Member Selection */}
        <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
                ১
              </div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {isBn ? 'সদস্য নির্বাচন করুন (Select Member)' : 'Select Member'}
              </h2>
            </div>
            {selectedMember && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {isBn ? 'সদস্য নির্বাচিত' : 'Member Selected'}
              </span>
            )}
          </div>

          {/* Search Box with Live Dropdown */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{isBn ? 'মেম্বার আইডি, নাম বা ফোন নম্বর দিয়ে সার্চ করুন *' : 'Search by Member ID, Full Name, or Phone *'}</span>
              <span className="text-[10px] text-amber-400 font-mono">{members.length} {isBn ? 'জন সদস্য ডাটাবেজে রয়েছে' : 'Total Members'}</span>
            </label>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? "যেমন: PBC-1001, Shakil Rana, বা 017..." : "Type ID (e.g. PBC-1001), Name, or Mobile..."}
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setIsDropdownOpen(true);
                  if (selectedMember && e.target.value !== `${selectedMember.fullName} (${selectedMember.id})`) {
                    setSelectedMember(null);
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full pl-11 pr-10 py-3.5 bg-[#070D1B] border-2 border-[#D4AF37]/40 focus:border-amber-400 rounded-2xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none transition shadow-inner"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearch('');
                    setSelectedMember(null);
                    setIsDropdownOpen(true);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Smart Interactive Dropdown Menu */}
            {isDropdownOpen && filteredMembers.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-[#070D1B] border-2 border-[#D4AF37]/50 rounded-2xl shadow-2xl divide-y divide-[#D4AF37]/20 backdrop-blur-md">
                {filteredMembers.map((m) => {
                  const isSelected = selectedMember?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMember(m)}
                      className={`p-3.5 flex items-center justify-between gap-3 hover:bg-[#112244] transition cursor-pointer ${
                        isSelected ? 'bg-[#112244] border-l-4 border-amber-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <PBCFramedAvatar 
                          photoUrl={m.photoUrl} 
                          name={m.fullName} 
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-amber-400/50 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{m.fullName}</span>
                            <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold">
                              {m.id}
                            </span>
                            {m.role === 'super_admin' && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded">👑 SUPER</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {m.phone} • {m.country}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">{isBn ? 'বর্তমান জমা' : 'Current Deposit'}</span>
                        <span className="text-xs font-black text-amber-300 font-mono">
                          ৳{(m.totalDeposit || 0).toLocaleString('en-BD')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Member Detail Summary Card */}
          {selectedMember && (
            <div className="p-4 bg-gradient-to-r from-[#070D1B] to-[#0A182F] rounded-2xl border-2 border-amber-400/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3.5">
                <PBCFramedAvatar 
                  photoUrl={selectedMember.photoUrl} 
                  name={selectedMember.fullName} 
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0 shadow-md" 
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{selectedMember.fullName}</h3>
                    {selectedMember.fullNameBn && (
                      <span className="text-xs text-amber-300 font-semibold">({selectedMember.fullNameBn})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                    <span className="font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold">
                      {selectedMember.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {selectedMember.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {selectedMember.city}, {selectedMember.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balances */}
              <div className="flex items-center gap-3 bg-[#070D1B]/80 p-3 rounded-xl border border-[#D4AF37]/30 shrink-0 justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                    {isBn ? 'বর্তমান মোট ব্যালেন্স' : 'Total Deposit'}
                  </span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    ৳{(selectedMember.totalDeposit || 0).toLocaleString('en-BD')}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                    {isBn ? 'স্ট্যাটাস' : 'Status'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 capitalize">
                    ● {selectedMember.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Deposit Amount & Category */}
        <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
                ২
              </div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {isBn ? 'জমার ক্যাটাগরি ও পরিমাণ (Deposit Amount & Category)' : 'Amount & Category'}
              </h2>
            </div>

            {/* Currency Converter Toggle */}
            <button
              type="button"
              onClick={() => setEnableCurrencyCalculator(!enableCurrencyCalculator)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                enableCurrencyCalculator
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                  : 'bg-[#070D1B] text-amber-400 border-[#D4AF37]/40 hover:bg-[#112244]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রবাসী কারেন্সি কনভার্টার' : 'Expat Currency Calculator'}</span>
            </button>
          </div>

          {/* Expatriate Currency Conversion Calculator Box */}
          {enableCurrencyCalculator && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-[#070D1B] to-amber-500/10 rounded-2xl border-2 border-dashed border-amber-400/50 space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  {isBn ? 'প্রবাসী মুদ্রা থেকে টাকায় হিসাব (Foreign Currency to BDT)' : 'Expatriate Currency Converter'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isBn ? 'স্বয়ংক্রিয়ভাবে টাকায় কনভার্ট হবে' : 'Auto-calculates BDT total'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Currency Selector */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isBn ? 'মুদ্রা (Currency)' : 'Foreign Currency'}
                  </label>
                  <select
                    value={selectedCurrency.code}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {POPULAR_CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Foreign Amount */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isBn ? `পরিমাণ (${selectedCurrency.code})` : `Amount in ${selectedCurrency.code}`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={foreignAmount}
                    onChange={(e) => handleForeignAmountChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-amber-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Exchange Rate */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isBn ? 'রেট (১ ইউনিট = কত টাকা)' : 'Rate (BDT per unit)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={exchangeRate}
                    onChange={(e) => handleExchangeRateChange(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {isBn ? 'জমার তহবিল ক্যাটাগরি নির্বাচন করুন *' : 'Select Deposit Fund Category *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('Fund Raising')}
                className={`p-4 rounded-2xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                  category === 'Fund Raising'
                    ? 'bg-[#112244] border-amber-400 text-white shadow-lg'
                    : 'bg-[#070D1B] border-[#D4AF37]/30 text-slate-400 hover:border-[#D4AF37]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    category === 'Fund Raising' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    ৳
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isBn ? 'তহবিল সংগ্রহ (Fund Raising)' : 'Fund Raising / General Fund'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isBn ? 'মাসিক নিয়মিত সঞ্চয় ও শেয়ার মূলধন' : 'Monthly savings & regular club equity'}
                    </p>
                  </div>
                </div>
                {category === 'Fund Raising' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setCategory('Real Estate')}
                className={`p-4 rounded-2xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                  category === 'Real Estate'
                    ? 'bg-[#112244] border-emerald-400 text-white shadow-lg'
                    : 'bg-[#070D1B] border-[#D4AF37]/30 text-slate-400 hover:border-[#D4AF37]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    category === 'Real Estate' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isBn ? 'রিয়েল এস্টেট বিনিয়োগ (Real Estate)' : 'Real Estate Investment'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isBn ? 'জমি, বিল্ডিং ও প্রজেক্ট ইনভেস্টমেন্ট ফান্ড' : 'Land, project & property capital fund'}
                    </p>
                  </div>
                </div>
                {category === 'Real Estate' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Amount in BDT */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>{isBn ? 'জমার পরিমাণ (টাকা - BDT) *' : 'Deposit Amount in BDT (৳) *'}</span>
              <span className="text-xs font-black text-amber-300 font-mono">
                ৳{typeof amountBDT === 'number' ? amountBDT.toLocaleString('en-BD') : '0'}
              </span>
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg text-amber-400">৳</span>
              <input
                type="number"
                required
                min="100"
                placeholder="5000"
                value={amountBDT}
                onChange={(e) => setAmountBDT(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3.5 bg-[#070D1B] border-2 border-[#D4AF37]/40 focus:border-amber-400 rounded-2xl text-white font-mono font-black text-xl placeholder-slate-600 focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-bold mr-1">{isBn ? 'কুইক যোগ:' : 'Quick add:'}</span>
              {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickAmount(preset)}
                  className="px-3 py-1 bg-[#070D1B] hover:bg-[#112244] border border-[#D4AF37]/30 hover:border-amber-400 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                >
                  +৳{preset >= 100000 ? `${preset / 100000} Lakh` : `${preset / 1000}k`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountBDT('')}
                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {isBn ? 'মুছুন' : 'Clear'}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Payment Method & Reference Details */}
        <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D4AF37]/20">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
              ৩
            </div>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              {isBn ? 'পেমেন্ট চ্যানেল ও রেফারেন্স (Payment Details)' : 'Payment Channel & Reference'}
            </h2>
          </div>

          {/* Payment Method Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {isBn ? 'পেমেন্ট গ্রহণের মাধ্যম (Payment Method) *' : 'Payment Method *'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'Cash', label: isBn ? 'নগদ ক্যাশ গ্রহণ' : 'Cash', icon: '💵', desc: 'Direct Cash' },
                { id: 'Bank', label: isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer', icon: '🏦', desc: 'Bank Deposit' },
                { id: 'Bank Wire', label: isBn ? 'রেমিট্যান্স / ওয়্যার' : 'Remittance Wire', icon: '✈️', desc: 'Expat Wire' },
                { id: 'bKash', label: 'bKash / বিকাশ', icon: '📱', desc: 'Mobile Banking' },
                { id: 'Nagad', label: 'Nagad / নগদ', icon: '📱', desc: 'Mobile Banking' },
                { id: 'Wise', label: 'Wise / Exchange', icon: '🌐', desc: 'Money Exchange' },
                { id: 'Cheque', label: isBn ? 'চেক (Cheque)' : 'Bank Cheque', icon: '📜', desc: 'Clearing Cheque' },
                { id: 'Stripe/Card', label: isBn ? 'কার্ড / পিওএস' : 'Card / POS', icon: '💳', desc: 'Debit/Credit Card' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#112244] border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                        : 'bg-[#070D1B] border-[#D4AF37]/30 text-slate-400 hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{m.icon}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-bold text-xs text-white block truncate">{m.label}</span>
                      <span className="text-[10px] text-slate-400 block">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference & Deposit Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>{isBn ? 'রেফারেন্স / ট্রানজেকশন / স্লিপ নম্বর *' : 'Reference / TrxID / Slip No *'}</span>
                <button
                  type="button"
                  onClick={() => setReferenceNumber(`ADM-DEP-${Math.floor(100000 + Math.random() * 900000)}`)}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  {isBn ? 'নতুন আইডি' : 'Auto Generate'}
                </button>
              </label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3.5 py-3 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {isBn ? 'জমার তারিখ (Deposit Date) *' : 'Deposit Date *'}
              </label>
              <input
                type="date"
                required
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="w-full px-3.5 py-3 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Bank / Branch / Money Exchange Office (Optional) */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-300 mb-1">
              {isBn ? 'ব্যাংক শাখা / এক্সচেঞ্জ হাউস / কাউন্টার বিবরণ (ঐচ্ছিক)' : 'Bank Branch / Exchange House / Counter Details (Optional)'}
            </label>
            <input
              type="text"
              placeholder={isBn ? "যেমন: আল আনসারি এক্সচেঞ্জ দুবাই, অথবা ইসলামী ব্যাংক প্রিন্সিপাল শাখা" : "e.g. Al Ansari Exchange Deira, or Cash Counter PBC Office"}
              value={bankOrBranch}
              onChange={(e) => setBankOrBranch(e.target.value)}
              className="w-full px-3.5 py-3 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Deposit Slip / Voucher Photo Upload (Optional) */}
          <div className="text-xs space-y-2">
            <label className="block font-semibold text-slate-300 flex items-center justify-between">
              <span>{isBn ? 'ব্যাংক স্লিপ / ভাউচার রসিদের ছবি (ঐচ্ছিক)' : 'Upload Bank Deposit Slip / Voucher Photo (Optional)'}</span>
              {receiptImage && (
                <button
                  type="button"
                  onClick={() => setReceiptImage('')}
                  className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                >
                  {isBn ? 'ছবি মুছুন' : 'Remove Image'}
                </button>
              )}
            </label>

            {receiptImage ? (
              <div className="p-3 bg-[#070D1B] rounded-2xl border border-emerald-500/40 flex items-center gap-4">
                <img src={receiptImage} alt="Voucher Preview" className="w-16 h-16 rounded-xl object-cover border border-amber-400 shadow-md" />
                <div>
                  <span className="text-emerald-400 font-bold block flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {isBn ? 'ছবি সফলভাবে সংযুক্ত হয়েছে' : 'Voucher attached successfully'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isBn ? 'মানি রিসিটে এটি সংরক্ষিত থাকবে' : 'Will be embedded into official digital receipt'}
                  </span>
                </div>
              </div>
            ) : (
              <label className="p-4 bg-[#070D1B] hover:bg-[#112244] rounded-2xl border-2 border-dashed border-[#D4AF37]/40 hover:border-amber-400 transition flex items-center justify-center gap-3 cursor-pointer text-slate-300">
                <Upload className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xs">
                  {isBn ? 'স্লিপ বা রসিদের ছবি নির্বাচন করুন (গ্যালারি বা ক্যামেরা)' : 'Click to upload bank slip / receipt voucher'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Contribution Month (পদ্ধতি ২) & Remarks / Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contribution Month Dropdown */}
            <div className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isBn ? 'কোন মাসের কিস্তি / জমা (Contribution Month)' : 'For Month / Deposit Period'}
                  </span>
                </label>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  {isBn ? 'পদ্ধতি ২: মাস নির্বাচন' : 'Target Month'}
                </span>
              </div>

              <div className="relative">
                <select
                  value={targetMonth}
                  onChange={(e) => handleTargetMonthChange(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer pr-10"
                >
                  <optgroup label={isBn ? "চলতি ও সাম্প্রতিক মাসসমূহ (Months)" : "Select Contribution Month"}>
                    {GENERATED_MONTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
                        {isBn ? `${opt.labelBn} (${opt.value})` : opt.labelEn}
                      </option>
                    ))}
                  </optgroup>
                  <option value="general" className="bg-[#0B1528] text-amber-300 font-semibold">
                    {isBn ? '📌 সাধারণ জমা (কোনো নির্দিষ্ট মাসের কিস্তি নয়)' : '📌 General Deposit (Non-Monthly)'}
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Quick Select Preset Buttons */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium mr-0.5">
                  {isBn ? 'কুইক সিলেক্ট:' : 'Quick:'}
                </span>
                {QUICK_MONTH_PRESETS.map((preset) => {
                  const isSelected = targetMonth === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleTargetMonthChange(preset.value)}
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-sm ring-1 ring-amber-400/40'
                          : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      {isBn ? preset.labelBn : preset.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks / Notes */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-300 mb-1">
                {isBn ? 'অ্যাডমিন মন্তব্য / নোট (Admin Remarks / Notes)' : 'Admin Notes / Remarks'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isBn ? "যেমনঃ মাসিক কিস্তি বা দুবাই অফিস জমা" : "e.g. Monthly contribution received at Dubai office"}
                className="w-full px-3.5 py-3 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400/80 shrink-0" />
                <span>
                  {isBn 
                    ? 'মাস পরিবর্তন করলে মন্তব্য স্বয়ংক্রিয়ভাবে আপডেট হয় এবং আপনি প্রয়োজনমতো সম্পাদনাও করতে পারবেন।' 
                    : 'Auto-syncs with selected month; editable anytime.'}
                </span>
              </p>
            </div>
          </div>

          {/* Instant Credit Toggle */}
          <div className="p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                {isBn ? 'তাৎক্ষণিক কার্যকর ও ব্যালেন্সে যোগ (Instant Direct Credit)' : 'Instant Direct Credit & Approval'}
              </span>
              <p className="text-[11px] text-slate-400">
                {isBn 
                  ? 'চালু থাকলে সাথে সাথে মেম্বারের মোট জমা ও ক্লাবের তহবিলে টাকাটি যুক্ত হয়ে যাবে।'
                  : 'Immediately approves deposit & updates member balance without waiting in audit queue.'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-slate-700"></div>
            </label>
          </div>
        </div>

        {/* Submit Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !selectedMember}
            className="w-full sm:flex-1 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>{isBn ? 'ডাটাবেজে যুক্ত হচ্ছে...' : 'Crediting Account...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>
                  {isBn 
                    ? `৳${typeof amountBDT === 'number' ? amountBDT.toLocaleString('en-BD') : '0'} জমা চূড়ান্ত করুন ও রসিদ তৈরি করুন` 
                    : `Submit ৳${typeof amountBDT === 'number' ? amountBDT.toLocaleString('en-BD') : '0'} Deposit & Generate Receipt`}
                </span>
              </>
            )}
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-4 bg-[#0B1528] hover:bg-[#112244] text-slate-300 hover:text-white border border-[#D4AF37]/30 font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              {isBn ? 'ফিরে যান' : 'Back to Hub'}
            </button>
          )}
        </div>
      </form>

      {/* Success Notification / Generated Money Receipt Modal */}
      {showReceiptModal && createdDeposit && (
        <DepositReceiptModal
          deposit={createdDeposit}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
};
