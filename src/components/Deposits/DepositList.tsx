import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Deposit } from '../../types';
import { DepositReceiptModal } from './DepositReceiptModal';
import { AdminSignatureModal } from '../Admin/AdminSignatureModal';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';
import { compressImageToDataUrl } from '../../services/firebaseService';
import { 
  Wallet, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  DollarSign, 
  CreditCard,
  Building,
  Edit3,
  Trash2,
  Printer,
  Check,
  XCircle,
  Upload,
  Image as ImageIcon,
  ShieldAlert,
  ArrowRight,
  Lock,
  Calendar,
  User,
  Tag,
  Receipt,
  Headphones,
  Landmark,
  ChevronDown,
  Info,
  AlertTriangle,
  Minus,
  Layers,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

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

/**
 * Normalizes any supported date string (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, D-M-YYYY)
 * into a standardized 'YYYY-MM-DD' format for exact comparison.
 */
function normalizeDateStr(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // DD-MM-YYYY or DD/MM/YYYY or D-M-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return trimmed;
}

/**
 * Checks if a deposit belongs to the selected month (e.g., 'August 2026').
 * Supports direct targetMonth matching, depositDate (YYYY-MM) matching, and notes fallback.
 */
function matchesDepositMonth(d: Deposit, selectedMonth: string): boolean {
  if (selectedMonth === 'All' || !selectedMonth) return true;
  
  // 1. Direct targetMonth match (case-insensitive)
  if (d.targetMonth && d.targetMonth.toLowerCase().trim() === selectedMonth.toLowerCase().trim()) {
    return true;
  }

  // 2. Parse "Month Year" (e.g. "August 2026") and compare with depositDate
  const parts = selectedMonth.trim().split(' ');
  if (parts.length === 2) {
    const monthName = parts[0];
    const year = parts[1];
    const monthIdx = MONTH_NAMES_EN.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (monthIdx !== -1) {
      const yearMonth = `${year}-${String(monthIdx + 1).padStart(2, '0')}`; // e.g. "2026-08"
      const normalizedDepDate = normalizeDateStr(d.depositDate);
      if (normalizedDepDate && normalizedDepDate.startsWith(yearMonth)) {
        return true;
      }
    }
  }

  // 3. Fallback: check if notes mention selectedMonth
  if (d.notes && d.notes.toLowerCase().includes(selectedMonth.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Checks if a deposit date falls within fromDate and toDate range.
 * Supports flexible formats (e.g. YYYY-MM-DD or DD-MM-YYYY).
 */
function matchesDateRange(depositDate?: string, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const normDep = normalizeDateStr(depositDate);
  if (!normDep) return false;

  const normFrom = normalizeDateStr(from);
  const normTo = normalizeDateStr(to);

  if (normFrom && normTo) {
    const min = normFrom <= normTo ? normFrom : normTo;
    const max = normFrom <= normTo ? normTo : normFrom;
    return normDep >= min && normDep <= max;
  }
  if (normFrom) return normDep >= normFrom;
  if (normTo) return normDep <= normTo;
  return true;
}

/**
 * Parses a search term like "01-01-2026 to 20-02-2026" or "01-01-2026 - 20-02-2026"
 */
function parseSearchDateRange(searchTerm: string): { from: string; to: string } | null {
  if (!searchTerm) return null;
  const parts = searchTerm.trim().split(/\s+(?:to|TO|থেকে|পর্যন্ত|-|➔)\s+/);
  if (parts.length === 2) {
    const d1 = normalizeDateStr(parts[0]);
    const d2 = normalizeDateStr(parts[1]);
    if (d1 && d2) {
      return { from: d1 <= d2 ? d1 : d2, to: d1 <= d2 ? d2 : d1 };
    }
  }
  return null;
}

/**
 * Human readable formatted date: e.g. '01 Aug 2026' or '০১ আগস্ট ২০২৬'
 */
function formatDisplayDate(dateStr?: string, isBn: boolean = false): string {
  if (!dateStr) return '-';
  const norm = normalizeDateStr(dateStr);
  if (/^\d{4}-\d{2}-\d{2}$/.test(norm)) {
    const [y, m, d] = norm.split('-');
    const day = parseInt(d, 10);
    const monthIdx = parseInt(m, 10) - 1;
    const monthName = isBn ? MONTH_NAMES_BN[monthIdx] || m : MONTH_NAMES_EN[monthIdx] || m;
    return `${day} ${monthName} ${y}`;
  }
  return dateStr;
}

export const DepositList: React.FC = () => {
  const { 
    deposits, 
    addDeposit, 
    deleteDeposit, 
    deleteDepositWithReason,
    approveDeposit,
    rejectDeposit,
    members, 
    language, 
    role, 
    switchRoleMode,
    currentMember,
    authUser,
    triggerSecurityAlert,
    navigateWithHistory,
    systemSettings
  } = useApp();

  const labels = t[language];
  const isBn = language === 'bn';

  const shareUnitPrice = systemSettings?.shareUnitPrice || 5000;

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [quickPreset, setQuickPreset] = useState<string>('All');
  const [dateSortOrder, setDateSortOrder] = useState<'desc' | 'asc'>('desc');

  const handleSelectQuickPreset = (preset: string) => {
    setQuickPreset(preset);
    if (preset === 'All') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'today') {
      const today = new Date().toISOString().split('T')[0];
      setFromDate(today);
      setToDate(today);
    } else if (preset === 'thisMonth') {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      setFromDate(`${y}-${m}-01`);
      setToDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    } else {
      // Month Year format (e.g. "August 2026")
      const parts = preset.trim().split(' ');
      if (parts.length === 2) {
        const mName = parts[0];
        const y = parts[1];
        const mIdx = MONTH_NAMES_EN.findIndex(m => m.toLowerCase() === mName.toLowerCase());
        if (mIdx !== -1) {
          const mStr = String(mIdx + 1).padStart(2, '0');
          const lastDay = new Date(parseInt(y, 10), mIdx + 1, 0).getDate();
          setFromDate(`${y}-${mStr}-01`);
          setToDate(`${y}-${mStr}-${String(lastDay).padStart(2, '0')}`);
        }
      }
    }
  };

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminNoticeOpen, setIsAdminNoticeOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Deposit | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [signatureModalDeposit, setSignatureModalDeposit] = useState<Deposit | null>(null);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<Deposit | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejectingSubmitting, setIsRejectingSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    memberId: currentMember?.id || (members.length > 0 ? members[0]?.id : ''),
    shareCount: 1,
    shareUnitPrice: shareUnitPrice,
    amount: shareUnitPrice,
    category: 'Fund Raising' as 'Fund Raising' | 'Real Estate',
    currency: 'BDT' as const,
    depositDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank' as const,
    referenceNumber: `TXN-BD-${Math.floor(100000 + Math.random() * 900000)}`,
    targetMonth: 'August 2026',
    notes: language === 'bn' ? 'মাসিক মূলধন কিস্তি - আগস্ট ২০২৬' : 'Monthly Capital Contribution - August 2026'
  });

  const handleShareCountChange = (count: number) => {
    const validCount = Math.max(1, count);
    setFormData(prev => ({
      ...prev,
      shareCount: validCount,
      amount: validCount * shareUnitPrice
    }));
  };

  const handleModalMonthChange = (selected: string) => {
    setFormData(prev => {
      const prevNotes = prev.notes;
      let newNotes = prevNotes;
      if (
        !prevNotes ||
        prevNotes === 'Monthly Capital Contribution' ||
        prevNotes.includes('Monthly Capital Contribution') ||
        prevNotes.includes('মাসিক মূলধন কিস্তি') ||
        prevNotes.includes('সাধারণ জমা') ||
        prevNotes.includes('General Deposit')
      ) {
        if (selected === 'general') {
          newNotes = language === 'bn' ? 'সাধারণ জমা / মূলধন বিনিয়োগ' : 'General Deposit / Capital Investment';
        } else {
          const found = GENERATED_MONTH_OPTIONS.find(m => m.value === selected);
          const displayLabel = language === 'bn' && found ? found.labelBn : selected;
          newNotes = language === 'bn' ? `মাসিক মূলধন কিস্তি - ${displayLabel}` : `Monthly Capital Contribution - ${selected}`;
        }
      }
      return {
        ...prev,
        targetMonth: selected,
        notes: newNotes
      };
    });
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      try {
        const compressed = await compressImageToDataUrl(file, 800, 0.7);
        setReceiptPreview(compressed);
      } catch (err) {
        console.warn('Receipt compression failed, falling back to raw reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Filter deposits based on role: if Member role, show only their own deposits or all if admin
  const userDeposits = role === 'member' 
    ? deposits.filter(d => d.memberId === currentMember?.id)
    : deposits;

  const isDepositApproved = (s?: string) => s?.toLowerCase().trim() === 'approved';

  const filteredDeposits = userDeposits.filter(d => {
    // 1. Search term: matches text fields OR matches parsed date range / single date
    const searchRange = parseSearchDateRange(searchTerm);
    const searchSingle = normalizeDateStr(searchTerm);
    const depNormalized = normalizeDateStr(d.depositDate);

    let isSearchDateMatch = false;
    if (searchRange) {
      isSearchDateMatch = Boolean(depNormalized && depNormalized >= searchRange.from && depNormalized <= searchRange.to);
    } else if (searchSingle && depNormalized && searchSingle === depNormalized) {
      isSearchDateMatch = true;
    }

    const matchesSearch = 
      !searchTerm ||
      isSearchDateMatch ||
      (d.memberName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.memberId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.depositDate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.targetMonth || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Date Range Filter (From Date to To Date, e.g. 01-01-2026 to 20-02-2026)
    let inDateRange = matchesDateRange(d.depositDate, fromDate, toDate);
    // If a specific target month preset like "August 2026" was selected, also include if targetMonth matches
    if (quickPreset && quickPreset !== 'All' && quickPreset !== 'today' && quickPreset !== 'thisMonth' && quickPreset !== 'Custom') {
      if (d.targetMonth && d.targetMonth.toLowerCase().trim() === quickPreset.toLowerCase().trim()) {
        inDateRange = true;
      }
    }

    // 3. Payment Method filter with flexible aliases
    const matchesMethod = methodFilter === 'All' || (
      d.paymentMethod === methodFilter ||
      (methodFilter === 'Bank Wire' && (d.paymentMethod === 'Bank' || d.paymentMethod === 'Bank Wire')) ||
      (methodFilter === 'Bank' && (d.paymentMethod === 'Bank' || d.paymentMethod === 'Bank Wire')) ||
      (methodFilter === 'bKash/Nagad' && (d.paymentMethod === 'bKash' || d.paymentMethod === 'Nagad' || d.paymentMethod === 'bKash/Nagad')) ||
      (methodFilter === 'bKash' && (d.paymentMethod === 'bKash' || d.paymentMethod === 'bKash/Nagad'))
    );

    // 4. Currency filter
    const matchesCurrency = currencyFilter === 'All' || d.currency === currencyFilter;

    // 5. Fund Category filter
    const matchesCategory = categoryFilter === 'All' 
      || (categoryFilter === 'Fund Raising' && (d.category === 'Fund Raising' || !d.category))
      || (categoryFilter === 'Real Estate' && d.category === 'Real Estate');

    // 6. Status filter
    const matchesStatus = statusFilter === 'All' || (
      statusFilter === 'Approved' ? isDepositApproved(d.status) :
      statusFilter === 'Pending' ? (d.status?.toLowerCase().trim() === 'pending') :
      statusFilter === 'Rejected' ? (d.status?.toLowerCase().trim() === 'rejected') : true
    );

    return matchesSearch && inDateRange && matchesMethod && matchesCurrency && matchesCategory && matchesStatus;
  });

  // Calculate overall counts and totals for Approved and Pending switch tabs
  const approvedTotalAmount = userDeposits
    .filter(d => isDepositApproved(d.status))
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const approvedCount = userDeposits.filter(d => isDepositApproved(d.status)).length;

  const pendingTotalAmount = userDeposits
    .filter(d => d.status?.toLowerCase().trim() === 'pending')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const pendingCount = userDeposits.filter(d => d.status?.toLowerCase().trim() === 'pending').length;

  const userAllCount = userDeposits.length;

  // Strict chronological date sorting helper
  const getDepositTimestamp = (d: Deposit): number => {
    if (d.depositDate) {
      const normalized = normalizeDateStr(d.depositDate);
      const parsed = Date.parse(normalized || d.depositDate);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  // Sort deposits chronologically by depositDate (serial order)
  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    const timeA = getDepositTimestamp(a);
    const timeB = getDepositTimestamp(b);
    if (timeA !== timeB) {
      return dateSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    }
    // Fallback: compare ID numerically/lexicographically
    return dateSortOrder === 'desc'
      ? (b.id || '').localeCompare(a.id || '', undefined, { numeric: true })
      : (a.id || '').localeCompare(b.id || '', undefined, { numeric: true });
  });

  // CRITICAL RULE: "Pending" deposits must NEVER be counted in the ledger total or user balance!
  // Only officially "Approved" deposits are included in the ledger total.
  const totalFilteredAmount = sortedDeposits
    .filter(d => isDepositApproved(d.status))
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const pendingFilteredAmount = sortedDeposits
    .filter(d => d.status?.toLowerCase().trim() === 'pending')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const rejectedFilteredAmount = sortedDeposits
    .filter(d => d.status?.toLowerCase().trim() === 'rejected')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const handleAddDepositClick = () => {
    if (role === 'admin' || role === 'super_admin') {
      // Prompt admin to switch to member mode to deposit
      setIsAdminNoticeOpen(true);
    } else {
      if (currentMember) {
        setFormData(prev => ({
          ...prev,
          memberId: currentMember.id
        }));
      }
      setIsAddModalOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMemberId = role === 'member' && currentMember ? currentMember.id : formData.memberId;
    const memberObj = members.find(m => m.id === targetMemberId) || currentMember || members[0];

    if (!memberObj) {
      alert('Error: Member record not found.');
      return;
    }

    const isMemberSubmit = role === 'member';

    const monthLabel = formData.targetMonth && formData.targetMonth !== 'general' 
      ? `Contribution Month: ${formData.targetMonth}` 
      : null;
    const finalNotes = [
      monthLabel,
      formData.notes?.trim()
    ].filter(Boolean).join(' | ');

    addDeposit({
      memberId: memberObj.id,
      memberName: memberObj.fullName,
      amount: Number(formData.amount),
      shareCount: formData.shareCount || Math.max(1, Math.round(Number(formData.amount) / shareUnitPrice)),
      shareUnitPrice: shareUnitPrice,
      category: formData.category,
      currency: formData.currency,
      depositDate: formData.depositDate,
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      notes: finalNotes,
      targetMonth: formData.targetMonth !== 'general' ? formData.targetMonth : undefined,
      receiptUrl: receiptPreview || undefined,
      status: isMemberSubmit ? 'pending' : 'Approved',
      approvedByAdminName: isMemberSubmit ? undefined : (currentMember?.fullName || 'PBC Admin'),
      approvedByAdminId: isMemberSubmit ? undefined : (currentMember?.id || 'PBC-ADMIN')
    });

    setIsAddModalOpen(false);

    if (isMemberSubmit) {
      alert(`আপনার জমা ভাউচার (৳${Number(formData.amount).toLocaleString()} BDT) এবং মানি রিসিট সফলভাবে জমা হয়েছে!\n\nএটি প্রশাসনিক অডিটের (Admin Verification) জন্য "Pending Deposit Vouchers" সেকশনে জমা রয়েছে। অ্যাডমিন অনুমোদন (Approve) করলে আপনার একাউন্টের মেইন ব্যালেন্সে যুক্ত হবে।`);
    } else {
      alert('Deposit recorded successfully.');
    }

    setFormData({
      memberId: currentMember?.id || (members.length > 0 ? members[0]?.id : ''),
      shareCount: 1,
      shareUnitPrice: shareUnitPrice,
      amount: shareUnitPrice,
      category: 'Fund Raising',
      currency: 'BDT',
      depositDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Wire',
      referenceNumber: `TXN-BD-${Math.floor(100000 + Math.random() * 900000)}`,
      targetMonth: 'August 2026',
      notes: language === 'bn' ? 'মাসিক মূলধন কিস্তি - আগস্ট ২০২৬' : 'Monthly Capital Contribution - August 2026'
    });
    setReceiptPreview('');
  };

  // Export to genuine Microsoft Excel Spreadsheet (.xlsx)
  const exportToExcel = () => {
    const reportDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const reportTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const activeFilterLabel = statusFilter === 'All' ? 'All Records (সকল রেকর্ড)' : statusFilter;

    // 1. Prepare worksheet rows (AOA: Array of Arrays)
    const worksheetData: (string | number)[][] = [
      ['PROBASHI BUSINESS CLUB (প্রবাসী বিজনেস ক্লাব)'],
      ['Official Capital Deposits Ledger & Member Transaction Statement'],
      [
        `Generated Date: ${reportDate} ${reportTime}`,
        '',
        `Filter: ${activeFilterLabel}`,
        '',
        `Total Records: ${sortedDeposits.length}`,
        '',
        `Total Approved Ledger: ৳${totalFilteredAmount.toLocaleString()} BDT`
      ],
      [], // Spacing row
      [
        'SL',
        'Deposit ID',
        'Member ID',
        'Member Name',
        'Shares',
        'Category',
        'Deposit Date',
        'Payment Method',
        'Transaction Ref',
        'Status',
        'Amount (BDT)'
      ]
    ];

    // 2. Add deposit records
    sortedDeposits.forEach((d, index) => {
      worksheetData.push([
        index + 1,
        d.id || '',
        d.memberId || '',
        d.memberName || '',
        d.shareCount || 1,
        d.category || 'Fund Raising',
        d.depositDate || '-',
        d.paymentMethod || '-',
        d.referenceNumber || '-',
        d.status || '',
        Number(d.amount) || 0
      ]);
    });

    // 3. Add total summary row
    worksheetData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'TOTAL APPROVED LEDGER:',
      totalFilteredAmount
    ]);

    // 4. Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge title and subtitle rows across all 11 columns
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }
    ];

    // Column widths for clean readability on desktop and mobile
    ws['!cols'] = [
      { wch: 6 },   // SL
      { wch: 18 },  // Deposit ID
      { wch: 14 },  // Member ID
      { wch: 28 },  // Member Name
      { wch: 8 },   // Shares
      { wch: 16 },  // Category
      { wch: 14 },  // Deposit Date
      { wch: 18 },  // Payment Method
      { wch: 22 },  // Transaction Ref
      { wch: 12 },  // Status
      { wch: 18 }   // Amount (BDT)
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Deposits Ledger');

    // 5. Generate binary XLSX output and trigger download safely
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PBC_Deposits_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportToCsv = () => {
    const headers = ['SL', 'Deposit ID', 'Member ID', 'Member Name', 'Shares', 'Category', 'Amount BDT', 'Currency', 'Date', 'Method', 'Ref Number', 'Status'];
    const rows = sortedDeposits.map((d, index) => [
      index + 1,
      d.id,
      d.memberId,
      `"${d.memberName.replace(/"/g, '""')}"`,
      d.shareCount || 1,
      `"${d.category || 'Fund Raising'}"`,
      d.amount,
      d.currency,
      d.depositDate,
      d.paymentMethod,
      `"${(d.referenceNumber || '').replace(/"/g, '""')}"`,
      d.status
    ]);
    // Prepend UTF-8 BOM \uFEFF so Excel opens CSV with proper encoding
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PBC_Deposits_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            {labels.depositHistory}
          </h2>
          <p className="text-xs text-slate-300">
            Comprehensive ledger of member capital contributions & bank receipts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              navigateWithHistory('deposit_accounts');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/50 transition shrink-0 active:scale-95 cursor-pointer shadow-md"
            title={language === 'bn' ? 'অফিসিয়াল বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর' : 'Official bKash, Nagad & Bank Accounts'}
          >
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'bn' ? 'বিকাশ ও ব্যাংক একাউন্ট নম্বর' : 'bKash & Bank Accounts'}
            </span>
          </button>

          {(role === 'super_admin' || role === 'admin') && (
            <button
              onClick={() => {
                navigateWithHistory({
                  tab: 'admin_panel',
                  subView: 'manual_deposit',
                  title: 'Admin Manual Deposit',
                  titleBn: 'অ্যাডমিন ম্যানুয়াল ডিপোজিট অ্যান্ট্রি',
                  isFocusMode: true
                });
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-[48px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition shrink-0 active:scale-95 cursor-pointer"
            >
              <Wallet className="w-4 h-4 stroke-[2.5]" />
              <span>
                {language === 'bn' ? 'ম্যানুয়াল ডিপোজিট' : 'Admin Manual Deposit'}
              </span>
            </button>
          )}

          {(role === 'super_admin' || role === 'admin') && (
            <div className="flex items-center gap-2">
              {/* Primary Formatted Excel Sheet Export */}
              <button
                type="button"
                id="btn-export-excel"
                onClick={exportToExcel}
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/50 transition shrink-0 active:scale-95 cursor-pointer"
                title={language === 'bn' ? 'মাইক্রোসফট এক্সেলে সরাসরি পরিচ্ছন্ন শীট ওপেন করুন' : 'Export genuine spreadsheet for Microsoft Excel (.xlsx)'}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
                <span>{language === 'bn' ? 'Excel শীট ডাউনলোড' : 'Download Excel (.xlsx)'}</span>
              </button>

              {/* Plain CSV Export */}
              <button
                type="button"
                id="btn-export-csv"
                onClick={exportToCsv}
                className="flex items-center justify-center gap-1.5 px-3 py-3 min-h-[48px] bg-[#0B1528] hover:bg-[#112244] text-amber-300 text-xs font-bold rounded-xl border border-[#D4AF37]/50 transition shrink-0 active:scale-95 cursor-pointer"
                title={language === 'bn' ? 'সাধারণ সিএসভি ফাইল ডাউনলোড' : 'Download plain CSV file'}
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>CSV</span>
              </button>
            </div>
          )}

          {role === 'member' && currentMember?.status === 'active' && (
            <button
              onClick={handleAddDepositClick}
              className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'জমা ভাউচার দিন' : 'Submit Deposit Voucher'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Banner Card */}
      <div className="bg-[#0B1528] p-5 rounded-3xl border border-[#D4AF37]/40 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30">
            <Wallet className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300/80 font-bold tracking-wider uppercase">
                {statusFilter === 'Pending'
                  ? (language === 'bn' ? 'অপেক্ষমাণ ভাউচার মোট (PENDING TOTAL)' : 'PENDING TOTAL')
                  : statusFilter === 'Rejected'
                  ? (language === 'bn' ? 'বাতিলকৃত মোট (REJECTED TOTAL)' : 'REJECTED TOTAL')
                  : (language === 'bn' ? 'অনুমোদিত লেজার টোটাল (APPROVED TOTAL)' : 'APPROVED LEDGER TOTAL')}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : statusFilter === 'Rejected'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {statusFilter === 'Pending'
                  ? (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending Only')
                  : statusFilter === 'Rejected'
                  ? (language === 'bn' ? 'বাতিলকৃত' : 'Rejected Only')
                  : (language === 'bn' ? 'শুধুমাত্র অনুমোদিত' : 'Approved Only')}
              </span>
            </div>
            <h3 className="text-2xl font-black text-amber-300 mt-0.5">
              ৳{(statusFilter === 'Pending' ? pendingFilteredAmount : totalFilteredAmount).toLocaleString()} BDT
            </h3>
          </div>
        </div>

        {/* Records Count Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono bg-[#070D1B] px-3.5 py-2 rounded-xl text-amber-300 border border-[#D4AF37]/30 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{sortedDeposits.length} {language === 'bn' ? 'টি রেকর্ড' : 'Records'}</span>
          </span>
        </div>
      </div>

      {/* Two Prominent Switch Tabs: Approved vs Pending (Directly as requested by user) */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Approved Switch Tab */}
          <button
            type="button"
            id="tab-approved-deposits"
            onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'All' : 'Approved')}
            className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] ${
              statusFilter === 'Approved'
                ? 'bg-gradient-to-br from-emerald-950/90 via-[#071F18] to-[#0A1628] border-emerald-400/90 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-400/40'
                : 'bg-[#0B1528] border-emerald-500/30 hover:border-emerald-400/60 hover:bg-[#0E1E34]'
            }`}
          >
            {statusFilter === 'Approved' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500" />
            )}

            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl transition ${
                  statusFilter === 'Approved' 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black tracking-wide text-white uppercase block">
                    {language === 'bn' ? 'অনুমোদিত' : 'Approved'}
                  </span>
                  <span className="text-[10px] text-emerald-400/90 font-bold block">
                    {approvedCount} {language === 'bn' ? 'টি ডিপোজিট' : 'Deposits'}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                statusFilter === 'Approved'
                  ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {statusFilter === 'Approved' ? (language === 'bn' ? 'ফিল্টারড' : 'Active') : (language === 'bn' ? 'দেখুন' : 'Filter')}
              </span>
            </div>

            <div className="mt-1">
              <div className="text-base sm:text-xl font-black text-emerald-400 tracking-tight">
                ৳{approvedTotalAmount.toLocaleString()} <span className="text-[10px] font-bold text-emerald-400/70">BDT</span>
              </div>
            </div>
          </button>

          {/* Pending Switch Tab */}
          <button
            type="button"
            id="tab-pending-deposits"
            onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
            className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] ${
              statusFilter === 'Pending'
                ? 'bg-gradient-to-br from-amber-950/90 via-[#281A05] to-[#0A1628] border-amber-400/90 shadow-xl shadow-amber-950/60 ring-2 ring-amber-400/40'
                : 'bg-[#0B1528] border-amber-500/30 hover:border-amber-400/60 hover:bg-[#0E1E34]'
            }`}
          >
            {statusFilter === 'Pending' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
            )}

            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl transition ${
                  statusFilter === 'Pending' 
                    ? 'bg-amber-400 text-slate-950' 
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black tracking-wide text-white uppercase block">
                    {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-bold block">
                    {pendingCount} {language === 'bn' ? 'টি ভাউচার' : 'Vouchers'}
                  </span>
                </div>
              </div>

              {pendingCount > 0 ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                  statusFilter === 'Pending'
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  {pendingCount}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                  0
                </span>
              )}
            </div>

            <div className="mt-1">
              <div className="text-base sm:text-xl font-black text-amber-300 tracking-tight">
                ৳{pendingTotalAmount.toLocaleString()} <span className="text-[10px] font-bold text-amber-300/70">BDT</span>
              </div>
            </div>
          </button>
        </div>

        {/* Quick status filter info & Date Chronological Sorting indicator */}
        <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            {statusFilter !== 'All' ? (
              <button
                type="button"
                id="btn-show-all-status"
                onClick={() => setStatusFilter('All')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-[#D4AF37]/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3 text-amber-400" />
                <span>{language === 'bn' ? 'সবগুলো দেখুন (Show All)' : 'Show All'} ({userAllCount})</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>{language === 'bn' ? 'সকল ডিপোজিট প্রদর্শিত হচ্ছে' : 'Showing all deposits'} ({userAllCount})</span>
              </span>
            )}
          </div>

          {/* Date Sort Toggle */}
          <button
            type="button"
            id="btn-toggle-date-sort"
            onClick={() => setDateSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 rounded-xl bg-[#0B1528] hover:bg-[#112244] border border-[#D4AF37]/40 text-amber-300 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto active:scale-95"
            title={language === 'bn' ? 'ডিপোজিট তারিখ অনুযায়ী সিরিয়াল পরিবর্তন করুন' : 'Toggle date chronological sort order'}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'bn'
                ? (dateSortOrder === 'desc' ? 'তারিখ সিরিয়াল: নতুন আগে' : 'তারিখ সিরিয়াল: পুরোনো আগে')
                : (dateSortOrder === 'desc' ? 'Date Order: Newest First' : 'Date Order: Oldest First')}
            </span>
            <span className="font-mono text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-400 font-black">
              {dateSortOrder === 'desc' ? '↓' : '↑'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      {(role === 'super_admin' || role === 'admin') && (
        <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-lg flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder={language === 'bn' ? "মেম্বার, আইডি, বা তারিখ (যেমন 01-01-2026 to 20-02-2026)..." : "Search Member, ID, Ref, or Date (e.g. 01-01-2026 to 20-02-2026)..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 touch-pan-x flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className={`px-3 py-3 min-h-[48px] bg-[#070D1B] border rounded-xl text-xs font-bold shrink-0 transition ${
                statusFilter === 'Pending' 
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : statusFilter === 'Approved'
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                  : statusFilter === 'Rejected'
                  ? 'border-rose-400 text-rose-300 bg-rose-500/10'
                  : 'border-[#D4AF37]/30 text-amber-200'
              }`}
            >
              <option value="All" className="bg-[#070D1B] text-white">
                {language === 'bn' ? 'সকল স্ট্যাটাস (All Status)' : 'All Status'}
              </option>
              <option value="Pending" className="bg-[#070D1B] text-amber-300">
                ⏳ {language === 'bn' ? 'অপেক্ষমাণ (Pending)' : 'Pending'}
              </option>
              <option value="Approved" className="bg-[#070D1B] text-emerald-400">
                ✅ {language === 'bn' ? 'অনুমোদিত (Approved)' : 'Approved'}
              </option>
              <option value="Rejected" className="bg-[#070D1B] text-rose-400">
                ❌ {language === 'bn' ? 'বাতিলকৃত (Rejected)' : 'Rejected'}
              </option>
            </select>

            {/* Unified Date Range: From [Date] To [Date] */}
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 min-h-[48px] bg-[#070D1B] border rounded-xl shrink-0 transition ${
                (fromDate || toDate)
                  ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                  : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
              }`}
            >
              <Calendar className={`w-4 h-4 shrink-0 ${(fromDate || toDate) ? 'text-amber-400' : 'text-slate-400'}`} />
              
              {/* From Date */}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/90 leading-none">
                  {language === 'bn' ? 'শুরু (From):' : 'From:'}
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => {
                    setFromDate(e.target.value);
                    setQuickPreset('Custom');
                  }}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer [color-scheme:dark] pt-0.5"
                  title={language === 'bn' ? 'শুরুর তারিখ (যেমন: 01-01-2026)' : 'From date (e.g. 01-01-2026)'}
                />
              </div>

              <span className="text-slate-500 font-bold px-0.5 text-xs">➔</span>

              {/* To Date */}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/90 leading-none">
                  {language === 'bn' ? 'শেষ (To):' : 'To:'}
                </span>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => {
                    setToDate(e.target.value);
                    setQuickPreset('Custom');
                  }}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer [color-scheme:dark] pt-0.5"
                  title={language === 'bn' ? 'শেষের তারিখ (যেমন: 20-02-2026)' : 'To date (e.g. 20-02-2026)'}
                />
              </div>

              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setQuickPreset('All');
                  }}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition shrink-0 ml-1 cursor-pointer"
                  title={language === 'bn' ? 'তারিখ ফিল্টার মুছুন' : 'Clear date range'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Month / Range Preset Selector */}
            <select
              value={quickPreset}
              onChange={e => handleSelectQuickPreset(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
              title={language === 'bn' ? 'দ্রুত মাস বা সময় নির্বাচন' : 'Quick date preset'}
            >
              <option value="All" className="bg-[#070D1B] text-white">
                {language === 'bn' ? 'সকল সময় (All Time)' : 'All Time / Any Date'}
              </option>
              <option value="today" className="bg-[#070D1B] text-white">
                ⚡ {language === 'bn' ? 'আজকের জমা (Today)' : 'Today'}
              </option>
              <option value="thisMonth" className="bg-[#070D1B] text-white">
                📅 {language === 'bn' ? 'চলতি মাস (This Month)' : 'This Month'}
              </option>
              {GENERATED_MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value} className="bg-[#070D1B] text-white">
                  📅 {language === 'bn' ? m.labelBn : m.labelEn}
                </option>
              ))}
              {quickPreset === 'Custom' && (
                <option value="Custom" className="bg-[#070D1B] text-amber-300">
                  ✏️ {language === 'bn' ? 'কাস্টম রেঞ্জ (Custom)' : 'Custom Range'}
                </option>
              )}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
            >
              <option value="All" className="bg-[#070D1B] text-white">All Fund Categories</option>
              <option value="Fund Raising" className="bg-[#070D1B] text-white">🌱 Fund Raising</option>
              <option value="Real Estate" className="bg-[#070D1B] text-white">🏢 Real Estate</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
            >
              <option value="All" className="bg-[#070D1B] text-white">{language === 'bn' ? 'সকল পেমেন্ট মেথড' : 'All Payment Methods'}</option>
              <option value="Bank Wire" className="bg-[#070D1B] text-white">Bank Wire / ব্যাংক</option>
              <option value="bKash/Nagad" className="bg-[#070D1B] text-white">bKash / Nagad</option>
              <option value="Wise" className="bg-[#070D1B] text-white">Wise (রেমিট্যান্স)</option>
              <option value="Stripe/Card" className="bg-[#070D1B] text-white">Stripe/Card</option>
              <option value="Cheque" className="bg-[#070D1B] text-white">Cheque (চেক)</option>
              <option value="Cash" className="bg-[#070D1B] text-white">Cash (নগদ)</option>
            </select>

            {/* Currency Filter */}
            <select
              value={currencyFilter}
              onChange={e => setCurrencyFilter(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
            >
              <option value="All" className="bg-[#070D1B] text-white">All Currencies</option>
              <option value="BDT" className="bg-[#070D1B] text-white">BDT (৳)</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Indicators & Quick Reset */}
      {(fromDate || toDate || (quickPreset !== 'All' && quickPreset !== 'Custom') || searchTerm || statusFilter !== 'All' || methodFilter !== 'All' || categoryFilter !== 'All' || currencyFilter !== 'All') && (
        <div className="flex flex-wrap items-center gap-2 bg-[#0B1528] px-4 py-2.5 rounded-2xl border border-[#D4AF37]/30 text-xs shadow-md">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-300">{language === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}</span>
          </span>

          {(fromDate || toDate) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-lg shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {fromDate && toDate && fromDate === toDate
                  ? `${language === 'bn' ? 'তারিখ: ' : 'Date: '}${formatDisplayDate(fromDate, isBn)}`
                  : fromDate && toDate
                  ? `${formatDisplayDate(fromDate, isBn)} ➔ ${formatDisplayDate(toDate, isBn)}`
                  : fromDate
                  ? `${language === 'bn' ? 'শুরু: ' : 'From: '}${formatDisplayDate(fromDate, isBn)}`
                  : `${language === 'bn' ? 'পর্যন্ত: ' : 'To: '}${formatDisplayDate(toDate, isBn)}`
                }
              </span>
              <button 
                type="button"
                onClick={() => { setFromDate(''); setToDate(''); setQuickPreset('All'); }} 
                className="hover:text-rose-400 hover:bg-amber-500/30 p-0.5 rounded transition cursor-pointer"
                title="Remove date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {!fromDate && !toDate && quickPreset !== 'All' && quickPreset !== 'Custom' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{quickPreset}</span>
              <button 
                type="button"
                onClick={() => setQuickPreset('All')} 
                className="hover:text-rose-400 hover:bg-emerald-500/30 p-0.5 rounded transition cursor-pointer"
                title="Remove preset"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold rounded-lg shadow-sm">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>"{searchTerm}"</span>
              <button 
                type="button"
                onClick={() => setSearchTerm('')} 
                className="hover:text-rose-400 hover:bg-sky-500/30 p-0.5 rounded transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {statusFilter !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold rounded-lg shadow-sm">
              <span>{statusFilter}</span>
              <button 
                type="button"
                onClick={() => setStatusFilter('All')} 
                className="hover:text-rose-400 hover:bg-purple-500/30 p-0.5 rounded transition cursor-pointer"
                title="Clear status filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <div className="ml-auto flex items-center gap-2.5">
            <span className="text-amber-200 font-bold">
              {filteredDeposits.length} {language === 'bn' ? 'টি রেকর্ড পাওয়া গেছে' : 'records found'}
            </span>
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setQuickPreset('All');
                setSearchTerm('');
                setStatusFilter('All');
                setMethodFilter('All');
                setCategoryFilter('All');
                setCurrencyFilter('All');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset all'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Transaction Cards Feed (< md screens) */}
      <div className="block md:hidden space-y-3">
        {sortedDeposits.length > 0 ? (
          sortedDeposits.map((d) => (
            <div 
              key={d.id} 
              className="bg-[#0B1528] rounded-2xl border border-[#D4AF37]/35 p-4 shadow-lg shadow-black/40 text-white relative transition active:scale-[0.99]"
            >
              {/* Header: Member Name & Amount */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-sm tracking-tight truncate">
                      {d.memberName}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                      {d.memberId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: <span className="text-amber-300/90 font-bold">{d.id}</span>
                    </span>
                  </div>
                </div>

                {/* Amount & Status Badge */}
                <div className="text-right shrink-0">
                  <div className="font-black text-emerald-400 text-sm sm:text-base tracking-tight">
                    ৳{d.amount.toLocaleString()} <span className="text-[10px] font-bold text-emerald-400/80">BDT</span>
                  </div>
                  {d.shareCount && d.shareCount > 0 ? (
                    <div className="text-[10px] font-bold text-amber-300">
                      {d.shareCount} {language === 'bn' ? 'টি শেয়ার' : (d.shareCount === 1 ? 'Share' : 'Shares')}
                    </div>
                  ) : null}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-1 border ${
                    d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'active'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : d.status?.toLowerCase() === 'pending'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                  }`}>
                    {d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'active' ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                      </>
                    ) : d.status?.toLowerCase() === 'pending' ? (
                      <>
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        <span>{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-2.5 h-2.5 text-rose-400" />
                        <span>{language === 'bn' ? 'বাতিল' : 'Rejected'}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Transaction Meta Details */}
              <div className="grid grid-cols-2 gap-2 py-2.5 text-xs border-b border-slate-800/80">
                {/* Category */}
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${
                    d.category === 'Real Estate'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {d.category === 'Real Estate' ? '🏢 Real Estate' : '🌱 Fund Raising'}
                  </span>
                </div>

                {/* Date & Month */}
                <div className="flex flex-col items-end justify-center text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{d.depositDate}</span>
                  </div>
                  {d.targetMonth && (
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md mt-0.5">
                      {d.targetMonth}
                    </span>
                  )}
                </div>

                {/* Payment Method & Ref */}
                <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-300 bg-[#070D1B] px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold">{d.paymentMethod}</span>
                  </div>
                  {d.referenceNumber && (
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                      Ref: {d.referenceNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2.5 flex items-center justify-between gap-2 flex-wrap">
                {/* Left: Receipt actions */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {((role === 'super_admin' || role === 'admin') || d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'active') ? (
                    <>
                      <button
                        onClick={() => setSelectedReceipt(d)}
                        className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition border border-emerald-500/40 shadow-sm active:scale-95 cursor-pointer"
                        title={language === 'bn' ? "অফিসিয়াল জমা রসিদ ডাউনলোড / দেখুন" : "View & Download Official Receipt"}
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{language === 'bn' ? 'রসিদ (Receipt)' : 'View Receipt'}</span>
                      </button>

                      {d.receiptUrl && (
                        <button
                          onClick={() => setSelectedReceipt(d)}
                          className="py-2 px-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold rounded-xl flex items-center justify-center gap-1 text-xs transition border border-amber-500/30 active:scale-95 cursor-pointer shrink-0"
                          title={language === 'bn' ? "মানি রিসিট স্লিপ দেখুন" : "View Money Receipt Image"}
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'bn' ? 'স্লিপ' : 'Slip'}</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div 
                      className="py-1.5 px-2.5 bg-[#070D1B] text-slate-400 font-medium rounded-xl flex items-center gap-1.5 text-[11px] border border-[#D4AF37]/20"
                    >
                      <Lock className="w-3 h-3 text-amber-400/80" />
                      <span>{language === 'bn' ? (d.status?.toLowerCase() === 'rejected' ? 'বাতিলকৃত' : 'অনুমোদনের পর রসিদ') : (d.status?.toLowerCase() === 'rejected' ? 'Rejected' : 'Pending Approval')}</span>
                    </div>
                  )}
                </div>

                {/* Right: Admin Approve/Reject/Delete Controls */}
                {(role === 'super_admin' || role === 'admin') && (
                  <div className="flex items-center gap-1 shrink-0">
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
                      className={`p-2 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer ${
                        d.status?.toLowerCase() === 'approved'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30'
                      }`}
                      title={language === 'bn' ? "সাক্ষর সহ অনুমোদন করুন" : "Approve Deposit with Signature"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setRejectingDeposit(d);
                        setRejectReason('');
                      }}
                      className={`p-2 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer ${
                        d.status?.toLowerCase() === 'rejected'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30'
                      }`}
                      title={language === 'bn' ? "ডিপোজিট বাতিল / রিজেক্ট করুন" : "Reject Deposit"}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDepositToDelete(d)}
                      className="p-2 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 flex items-center justify-center active:scale-95 border border-transparent hover:border-rose-500/30"
                      title="Delete Deposit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#0B1528] rounded-2xl border border-[#D4AF37]/30 p-8 text-center text-slate-400">
            {language === 'bn' ? 'কোনো ডিপোজিট রেকর্ড পাওয়া যায়নি।' : 'No deposit records found.'}
          </div>
        )}
      </div>

      {/* Desktop Deposits Table (>= md screens) */}
      <div className="hidden md:block bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 shadow-xl overflow-hidden">
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070D1B] text-amber-300 font-bold border-b border-[#D4AF37]/30 uppercase tracking-wider">
                {(role === 'super_admin' || role === 'admin') && <th className="py-4 px-4">{labels.depositId}</th>}
                <th className="py-4 px-4">{labels.memberName}</th>
                <th className="py-4 px-4">{labels.amount}</th>
                <th className="py-4 px-4">{language === 'bn' ? 'ফান্ডের ধরণ' : 'Fund Type'}</th>
                <th 
                  className="py-4 px-4 cursor-pointer select-none hover:text-amber-200 transition"
                  onClick={() => setDateSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  title={language === 'bn' ? 'তারিখ অনুযায়ী সিরিয়াল পরিবর্তন করুন' : 'Click to toggle date sort order'}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{labels.depositDate}</span>
                    <span className="text-[11px] text-amber-400 font-mono bg-amber-500/20 px-1 py-0.5 rounded">
                      {dateSortOrder === 'desc' ? '↓' : '↑'}
                    </span>
                  </div>
                </th>
                {(role === 'super_admin' || role === 'admin') && <th className="py-4 px-4">{labels.paymentMethod}</th>}
                {(role === 'super_admin' || role === 'admin') && <th className="py-4 px-4">{labels.referenceNumber}</th>}
                <th className="py-4 px-4">{labels.status}</th>
                <th className="py-4 px-4 text-right">{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {sortedDeposits.map((d) => (
                <tr key={d.id} className="hover:bg-[#112244] transition">
                  {(role === 'super_admin' || role === 'admin') && (
                    <td className="py-4 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                      {d.id}
                    </td>
                  )}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-bold text-white block">
                      {d.memberName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.memberId}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-extrabold text-amber-300 block">
                      ৳{d.amount.toLocaleString()} BDT
                    </span>
                    {d.shareCount && d.shareCount > 0 ? (
                      <span className="text-[10px] font-bold text-amber-400/90 block">
                        {d.shareCount} {language === 'bn' ? 'টি শেয়ার' : (d.shareCount === 1 ? 'Share' : 'Shares')}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                      d.category === 'Real Estate'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {d.category === 'Real Estate' ? '🏢 Real Estate' : '🌱 Fund Raising'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                    <div>{d.depositDate}</div>
                    {d.targetMonth && (
                      <span className="inline-block text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md mt-1">
                        {d.targetMonth}
                      </span>
                    )}
                  </td>
                  {(role === 'super_admin' || role === 'admin') && (
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#070D1B] text-amber-200 border border-[#D4AF37]/20 font-medium">
                        {d.paymentMethod}
                      </span>
                    </td>
                  )}
                  {(role === 'super_admin' || role === 'admin') && (
                    <td className="py-4 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {d.referenceNumber}
                    </td>
                  )}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full capitalize ${
                      d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : d.status?.toLowerCase() === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {(role === 'super_admin' || role === 'admin') && (
                        <>
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
                            className={`min-w-[40px] min-h-[40px] p-2 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer ${
                              d.status?.toLowerCase() === 'approved'
                                ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950'
                            }`}
                            title={language === 'bn' ? "সাক্ষর সহ অনুমোদন করুন" : "Approve Deposit with Signature"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectingDeposit(d);
                              setRejectReason('');
                            }}
                            className={`min-w-[40px] min-h-[40px] p-2 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer ${
                              d.status?.toLowerCase() === 'rejected'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white'
                            }`}
                            title={language === 'bn' ? "ডিপোজিট বাতিল / রিজেক্ট করুন" : "Reject Deposit (বাতিল করুন)"}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {((role === 'super_admin' || role === 'admin') || d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'active') ? (
                        <>
                          {d.receiptUrl && (
                            <button
                              onClick={() => setSelectedReceipt(d)}
                              className="min-h-[40px] px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition border border-amber-500/30 active:scale-95 cursor-pointer"
                              title={language === 'bn' ? "মানি রিসিট স্লিপ দেখুন" : "View Money Receipt Image"}
                            >
                              <ImageIcon className="w-4 h-4 text-amber-400" />
                              <span>{language === 'bn' ? 'মানি রিসিট' : 'Receipt Image'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedReceipt(d)}
                            className="min-h-[40px] px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-1.5 text-xs transition border border-emerald-500/40 shadow-sm cursor-pointer active:scale-95"
                            title={language === 'bn' ? "অফিসিয়াল জমা রসিদ ডাউনলোড / দেখুন" : "View & Download Official Receipt"}
                          >
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span>{language === 'bn' ? 'রসিদ (Receipt)' : 'Receipt'}</span>
                          </button>
                        </>
                      ) : (
                        <div 
                          className="min-h-[40px] px-3 py-2 bg-[#070D1B] text-slate-400 font-semibold rounded-xl flex items-center justify-center gap-1.5 text-xs border border-[#D4AF37]/20 cursor-not-allowed"
                          title={language === 'bn' ? "অ্যাডমিন অনুমোদনের পর মানি রিসিট পাবেন" : "Receipt available after admin approval"}
                        >
                          <Lock className="w-3.5 h-3.5 opacity-60 text-amber-400" />
                          <span>{language === 'bn' ? (d.status?.toLowerCase() === 'rejected' ? 'বাতিলকৃত' : 'অনুমোদনের অপেক্ষায়') : (d.status?.toLowerCase() === 'rejected' ? 'Rejected' : 'Pending Approval')}</span>
                        </div>
                      )}

                      {(role === 'super_admin' || role === 'admin') && (
                        <button
                          onClick={() => setDepositToDelete(d)}
                          className="min-w-[40px] min-h-[40px] p-2 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 flex items-center justify-center active:scale-95 border border-transparent hover:border-rose-500/30"
                          title="Delete Deposit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Deposit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#070D1B] rounded-3xl p-5 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/40 relative shadow-2xl text-white my-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-[#D4AF37]/30 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-2 flex items-center justify-between pr-8">
              <span>
                {role === 'member' 
                  ? (language === 'bn' ? 'জমা ভাউচার প্রেরণ করুন' : 'Submit Deposit Voucher') 
                  : (language === 'bn' ? 'ক্যাপিটাল জমা রেকর্ড করুন' : 'Record Member Capital Deposit')}
              </span>
              {role === 'member' && (
                <span className="text-[11px] px-2.5 py-0.5 font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  {language === 'bn' ? 'যাচাইকরণের অপেক্ষায়' : 'Pending Verification'}
                </span>
              )}
            </h3>

            {/* Quick helper banner: View official payment accounts */}
            <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] text-emerald-300">
                <Landmark className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? 'ক্লাবের বিকাশ, নগদ ও ব্যাংক একাউন্ট প্রয়োজন?' : 'Need club bKash or Bank details?'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  navigateWithHistory('deposit_accounts');
                }}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] rounded-lg border border-emerald-500/40 transition cursor-pointer shrink-0"
              >
                {language === 'bn' ? 'নম্বর দেখুন' : 'View Accounts'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  {role === 'member' 
                    ? (language === 'bn' ? 'মেম্বার তথ্য' : 'Member Details') 
                    : (language === 'bn' ? 'মেম্বার নির্বাচন করুন *' : 'Select Member *')}
                </label>
                {role === 'member' && currentMember ? (
                  <div className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center justify-between">
                    <span>{currentMember.fullName} ({currentMember.id})</span>
                    <span className="text-[10px] font-mono bg-emerald-600/80 text-white px-2 py-0.5 rounded-md">Active Member</span>
                  </div>
                ) : (
                  <select
                    value={formData.memberId}
                    onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#0B1528] text-white">
                        {m.fullName} ({m.id} - {m.country})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Fund Category Selection (Fund Raising vs Real Estate) */}
              <div>
                <label className="block text-amber-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>{language === 'bn' ? 'ফান্ডের ধরণ নির্বাচন করুন *' : 'Select Fund Category *'}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {formData.category === 'Real Estate' ? '🏢 Real Estate Project Fund' : '🌱 Club Fund Raising'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'Fund Raising' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-left cursor-pointer ${
                      formData.category === 'Fund Raising'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md ring-1 ring-emerald-400'
                        : 'bg-[#0B1528] border-[#D4AF37]/30 text-slate-300 hover:border-emerald-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Fund Raising</span>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center">ক্লাব ফান্ড রেইজিং / সাধারণ জমা</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'Real Estate' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-left cursor-pointer ${
                      formData.category === 'Real Estate'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                        : 'bg-[#0B1528] border-[#D4AF37]/30 text-slate-300 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>Real Estate</span>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center">রিয়েল এস্টেট প্রকল্প তহবিল</span>
                  </button>
                </div>
              </div>

              {/* Share Selection & Unit Calculator */}
              <div className="p-3.5 bg-[#070D1B] border border-amber-500/40 rounded-2xl space-y-3 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {language === 'bn' ? 'শেয়ার সংখ্যা নির্বাচন করুন (Share Selection)' : 'Select Share Count'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {language === 'bn' ? 'প্রতি শেয়ারের নির্ধারিত মূল্য অনুযায়ী স্বয়ংক্রিয় হিসাব' : 'Auto-calculated based on share unit price'}
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/40 rounded-full self-start sm:self-auto">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] font-bold text-amber-300">
                      {language === 'bn' ? `রেট: ৳${shareUnitPrice.toLocaleString('en-BD')} / শেয়ার` : `Rate: ৳${shareUnitPrice.toLocaleString('en-BD')} / Share`}
                    </span>
                  </div>
                </div>

                {/* Counter Control */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareCountChange((formData.shareCount || 1) - 1)}
                      disabled={(formData.shareCount || 1) <= 1}
                      className="w-9 h-9 rounded-xl bg-[#0B1528] hover:bg-[#112244] disabled:opacity-30 disabled:cursor-not-allowed border border-amber-500/40 flex items-center justify-center text-amber-300 hover:text-amber-200 transition active:scale-95 shadow-sm"
                      title={language === 'bn' ? 'কমিয়ে দিন' : 'Decrease'}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={formData.shareCount || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleShareCountChange(isNaN(val) || val < 1 ? 1 : val);
                        }}
                        className="w-16 text-center py-1.5 bg-[#0B1528] border-2 border-amber-500/50 rounded-xl text-amber-300 font-mono font-black text-base focus:outline-none focus:border-amber-400 shadow-inner"
                      />
                      <span className="ml-2 text-xs font-bold text-slate-300">
                        {language === 'bn' ? 'টি শেয়ার' : ((formData.shareCount || 1) === 1 ? 'Share' : 'Shares')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleShareCountChange((formData.shareCount || 1) + 1)}
                      className="w-9 h-9 rounded-xl bg-[#0B1528] hover:bg-[#112244] border border-amber-500/40 flex items-center justify-center text-amber-300 hover:text-amber-200 transition active:scale-95 shadow-sm"
                      title={language === 'bn' ? 'বাড়িয়ে দিন' : 'Increase'}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2">
                    <span className="text-[11px] text-emerald-300/80 font-mono">
                      {(formData.shareCount || 1)} × ৳{shareUnitPrice.toLocaleString('en-BD')} =
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-300">
                      ৳{((formData.shareCount || 1) * shareUnitPrice).toLocaleString('en-BD')}
                    </span>
                  </div>
                </div>

                {/* Quick Share Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
                    {language === 'bn' ? 'কুইক সিলেক্ট:' : 'Quick Select:'}
                  </span>
                  {[1, 2, 3, 4, 5, 10].map((count) => {
                    const isSelected = (formData.shareCount || 1) === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => handleShareCountChange(count)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                            : 'bg-[#0B1528] text-amber-300 border-amber-500/30 hover:border-amber-400 hover:bg-[#112244]'
                        }`}
                      >
                        {count} {language === 'bn' ? 'টি' : (count === 1 ? 'Share' : 'Shares')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-amber-300 font-bold mb-1">
                    {language === 'bn' ? 'জমার পরিমাণ (BDT) *' : 'Deposit Amount (BDT) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount === 0 ? '' : formData.amount}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      const numVal = val === '' ? 0 : Number(val);
                      setFormData(prev => ({
                        ...prev,
                        amount: numVal,
                        shareCount: numVal > 0 ? Math.max(1, Math.round(numVal / shareUnitPrice)) : 1
                      }));
                    }}
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-[#D4AF37]/40 rounded-xl text-amber-300 font-black text-base focus:outline-none focus:border-amber-400"
                  />
                  {/* Preset Quick Select Amount Buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[5000, 10000, 25000, 50000, 100000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            amount: amt,
                            shareCount: Math.max(1, Math.round(amt / shareUnitPrice))
                          }));
                        }}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                          formData.amount === amt
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-[#0B1528] text-amber-200 border-[#D4AF37]/30 hover:border-amber-400'
                        }`}
                      >
                        ৳{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-amber-300 font-semibold mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white"
                  >
                    <option value="BDT" className="bg-[#0B1528] text-white">BDT (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white font-medium"
                  >
                    <option value="Bank" className="bg-[#0B1528]">Bank</option>
                    <option value="bKash" className="bg-[#0B1528]">bKash</option>
                    <option value="Nagad" className="bg-[#0B1528]">Nagad</option>
                    <option value="Bank Wire" className="bg-[#0B1528]">Bank Wire</option>
                    <option value="Wise" className="bg-[#0B1528]">Wise</option>
                    <option value="Cheque" className="bg-[#0B1528]">Cheque</option>
                    <option value="Cash" className="bg-[#0B1528]">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Deposit Date</label>
                  <input
                    type="date"
                    value={formData.depositDate}
                    onChange={e => setFormData({ ...formData, depositDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  Bank Reference No / Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.referenceNumber}
                  onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white font-mono"
                  placeholder="e.g. TXN98726352"
                />
              </div>

              {/* Upload Money Receipt Voucher */}
              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  {language === 'bn' ? 'মানি রিসিট / জমা স্লিপের ছবি আপলোড করুন' : 'Upload Money Receipt / Voucher Image'}
                </label>
                <div className="border-2 border-dashed border-[#D4AF37]/40 rounded-2xl p-3 text-center hover:border-amber-400 transition bg-[#0B1528]">
                  {receiptPreview ? (
                    <div className="relative inline-block">
                      <img src={receiptPreview} alt="Receipt Voucher Preview" className="max-h-36 rounded-xl border border-[#D4AF37]/40 shadow-md object-contain" />
                      <button
                        type="button"
                        onClick={() => setReceiptPreview('')}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1 py-1">
                      <Upload className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold text-amber-200">
                        {language === 'bn' ? 'ব্যাংক জমা স্লিপ বা রিসিট ছবি আপলোড করুন' : 'Click or Drag to Upload Receipt Image'}
                      </span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Contribution Month (পদ্ধতি ২) & Remarks / Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Contribution Month Dropdown */}
                <div className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {language === 'bn' ? 'কোন মাসের কিস্তি / জমা' : 'Contribution Month / Period'}
                      </span>
                    </label>
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      {language === 'bn' ? 'মাস নির্বাচন' : 'Target Month'}
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={formData.targetMonth}
                      onChange={(e) => handleModalMonthChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer pr-10"
                    >
                      <optgroup label={language === 'bn' ? "চলতি ও সাম্প্রতিক মাসসমূহ" : "Select Contribution Month"}>
                        {GENERATED_MONTH_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
                            {language === 'bn' ? `${opt.labelBn} (${opt.value})` : opt.labelEn}
                          </option>
                        ))}
                      </optgroup>
                      <option value="general" className="bg-[#0B1528] text-amber-300 font-semibold">
                        {language === 'bn' ? '📌 সাধারণ জমা (কোনো নির্দিষ্ট মাসের নয়)' : '📌 General Deposit (Non-Monthly)'}
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Quick Select Preset Buttons */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium mr-0.5">
                      {language === 'bn' ? 'কুইক:' : 'Quick:'}
                    </span>
                    {QUICK_MONTH_PRESETS.map((preset) => {
                      const isSelected = formData.targetMonth === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handleModalMonthChange(preset.value)}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-sm ring-1 ring-amber-400/40'
                              : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                          }`}
                        >
                          {language === 'bn' ? preset.labelBn : preset.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Remarks / Notes */}
                <div className="text-xs">
                  <label className="block text-amber-300 font-semibold mb-1">
                    {language === 'bn' ? 'মন্তব্য / বিবরণ (Notes / Remarks)' : 'Notes / Remarks'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Monthly deposit or project capital details"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-400/80 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? 'মাস পরিবর্তন করলে মন্তব্য স্বয়ংক্রিয়ভাবে আপডেট হয়।'
                        : 'Notes auto-sync with selected month.'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#0B1528] border border-[#D4AF37]/30 text-slate-300 hover:text-white font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {role === 'member'
                      ? (language === 'bn' ? 'জমা ভাউচার দিন' : 'Submit Voucher')
                      : (language === 'bn' ? 'জমা তৈরি করুন' : 'Record Deposit')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Deposit Notice Modal (Redirect to Member Mode) */}
      {isAdminNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#070D1B] border border-[#D4AF37]/40 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 text-white my-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                অ্যাডমিন মোডে সরাসরি জমা তৈরি বন্ধ
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                অ্যাডমিন প্যানেল মোড থেকে সরাসরি ডিপোজিট এন্ট্রি নিষ্ক্রিয় করা হয়েছে। নিজের জমার টাকা পাঠাতে ও ভাউচার আপলোড করতে ওপরের সুইচ থেকে <strong>Member Mode (মেম্বার মোড)</strong>-এ গিয়ে জমা ভাউচার তৈরি করুন।
              </p>
            </div>

            <div className="p-3 bg-[#0B1528] border border-[#D4AF37]/30 rounded-2xl text-left text-xs space-y-1">
              <span className="font-bold text-amber-300 block">কার্যপ্রণালী (Steps):</span>
              <p className="text-slate-300">১. "Switch to Member Mode"-এ ক্লিক করুন।</p>
              <p className="text-slate-300">২. আপনার নিজস্ব মেম্বার একাউন্ট থেকে জমার ভাউচার ও মানি রিসিট জমা দিন।</p>
              <p className="text-slate-300">৩. এটি অ্যাডমিন প্যানেলের "Pending Deposit Vouchers" এ অডিটের জন্য আসবে।</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdminNoticeOpen(false)}
                className="px-4 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 text-slate-300 hover:text-white font-bold rounded-xl text-xs"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdminNoticeOpen(false);
                  switchRoleMode('member');
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              >
                <span>Switch to Member Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Deposit Receipt Modal */}
      <DepositReceiptModal
        deposit={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
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

      {/* Delete Deposit Confirmation Modal */}
      {depositToDelete && (
        <DeleteConfirmModal
          isOpen={!!depositToDelete}
          title="ডিপোজিট ডিলিট নিশ্চিতকরণ (Delete Deposit)"
          itemName={`Deposit Voucher ${depositToDelete.id} - ৳${(depositToDelete.amount || 0).toLocaleString()} (${depositToDelete.memberName})`}
          onClose={() => setDepositToDelete(null)}
          onConfirm={async (reason) => {
            await deleteDepositWithReason(depositToDelete.id, reason);
            setDepositToDelete(null);
          }}
        />
      )}

      {/* Reject Deposit Modal with Reason */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B1528] border border-rose-500/40 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl shadow-rose-950/40 relative">
            <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {language === 'bn' ? 'ডিপোজিট বাতিল / রিজেক্ট নিশ্চিতকরণ' : 'Confirm Deposit Rejection'}
                  </h3>
                  <p className="text-xs text-rose-300/80">
                    {rejectingDeposit.id} • ৳{(rejectingDeposit.amount || 0).toLocaleString()} BDT
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRejectingDeposit(null);
                  setRejectReason('');
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#070D1B] border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3.5 bg-[#070D1B] rounded-2xl border border-rose-500/30 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'মেম্বার নাম:' : 'Member:'}</span>
                  <span className="text-white font-bold">{rejectingDeposit.memberName} ({rejectingDeposit.memberId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'পরিমাণ:' : 'Amount:'}</span>
                  <span className="text-amber-300 font-bold">৳{(rejectingDeposit.amount || 0).toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'বর্তমান অবস্থা:' : 'Current Status:'}</span>
                  <span className="text-rose-400 font-semibold">{rejectingDeposit.status || 'Pending'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'bn' ? 'বাতিলের সুনির্দিষ্ট কারণ লিখুন (মেম্বার নোটিফিকেশন পাবেন):' : 'Reason for rejection (Member will be notified):'}</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={language === 'bn' ? "উদা: ভাউচার/ট্রানজ্যাকশন আইডি মেলেনি, ভুল একাউন্টে টাকা পাঠানো ইত্যাদি..." : "e.g., Transaction ID did not match bank statement..."}
                  rows={3}
                  className="w-full p-3 bg-[#070D1B] border border-rose-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isRejectingSubmitting}
                  onClick={() => {
                    setRejectingDeposit(null);
                    setRejectReason('');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#070D1B] text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition"
                >
                  {language === 'bn' ? 'না, বাতিল নয়' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isRejectingSubmitting}
                  onClick={async () => {
                    if (!rejectingDeposit) return;
                    setIsRejectingSubmitting(true);
                    try {
                      await rejectDeposit(rejectingDeposit.id, rejectReason.trim() || undefined);
                      setRejectingDeposit(null);
                      setRejectReason('');
                    } finally {
                      setIsRejectingSubmitting(false);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isRejectingSubmitting ? (language === 'bn' ? 'বাতিল হচ্ছে...' : 'Rejecting...') : (language === 'bn' ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
