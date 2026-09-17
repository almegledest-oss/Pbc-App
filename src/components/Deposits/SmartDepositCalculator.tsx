import React, { useEffect } from 'react';
import { 
  Calendar, 
  Layers, 
  Sparkles, 
  Clock, 
  UserPlus, 
  ChevronRight, 
  Plus, 
  Minus,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  GENERATED_MONTH_OPTIONS, 
  formatMonthDisplay, 
  getOffsetMonth, 
  getBackdatedStartMonth, 
  getMonthsBetween, 
  generateAutoDepositNotes 
} from '../../utils/depositCalculator';

export type DepositMode = 'single_month' | 'advance_multi_month' | 'new_member_backdated' | 'general';

interface SmartDepositCalculatorProps {
  isBn: boolean;
  shareUnitPrice?: number;
  memberCommitment?: number;
  depositMode: DepositMode;
  onDepositModeChange: (mode: DepositMode) => void;
  monthlyRate: number; // e.g. 1 share/month or 2 shares/month
  onMonthlyRateChange: (rate: number) => void;
  monthsCount: number; // e.g. 1, 2, 4 months
  onMonthsCountChange: (count: number) => void;
  startMonth: string; // e.g. 'August 2026'
  onStartMonthChange: (month: string) => void;
  endMonth: string; // e.g. 'September 2026'
  onEndMonthChange: (month: string) => void;
  totalShares?: number;
  shareCount?: number;
  onTotalSharesChange?: (shares: number) => void;
  onShareCountChange?: (shares: number) => void;
  amountBDT: number;
  onAmountBDTChange: (amt: number) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  onAutoNotesGenerated?: (notes: string) => void;
  onPeriodTextChange?: (periodText: string) => void;
  memberJoinDate?: string;
}

export const SmartDepositCalculator: React.FC<SmartDepositCalculatorProps> = ({
  isBn,
  shareUnitPrice = 5000,
  memberCommitment,
  depositMode,
  onDepositModeChange,
  monthlyRate,
  onMonthlyRateChange,
  monthsCount,
  onMonthsCountChange,
  startMonth,
  onStartMonthChange,
  endMonth,
  onEndMonthChange,
  totalShares,
  shareCount,
  onTotalSharesChange,
  onShareCountChange,
  amountBDT,
  onAmountBDTChange,
  notes = '',
  onNotesChange,
  onAutoNotesGenerated,
  onPeriodTextChange,
  memberJoinDate
}) => {
  const currentShares = shareCount !== undefined ? shareCount : (totalShares !== undefined ? totalShares : Math.max(1, monthlyRate * (depositMode === 'general' ? 1 : monthsCount)));

  const triggerSharesChange = (shares: number) => {
    if (typeof onShareCountChange === 'function') {
      onShareCountChange(shares);
    }
    if (typeof onTotalSharesChange === 'function') {
      onTotalSharesChange(shares);
    }
  };

  const triggerNotesChange = (autoNotes: string) => {
    if (typeof onAutoNotesGenerated === 'function') {
      onAutoNotesGenerated(autoNotes);
    }
    if (typeof onNotesChange === 'function') {
      onNotesChange(autoNotes);
    }
  };

  // Sync calculation whenever parameters change
  const applyCalculation = (
    mode: DepositMode,
    mRate: number,
    mCount: number,
    sMonth: string,
    eMonth: string
  ) => {
    let computedShares = currentShares;
    let computedAmount = amountBDT;
    let computedPeriodText = sMonth;

    if (mode === 'general') {
      computedPeriodText = isBn ? 'সাধারণ জমা' : 'General Deposit';
      computedShares = Math.max(1, currentShares);
      computedAmount = computedShares * shareUnitPrice;
    } else if (mode === 'single_month') {
      computedShares = Math.max(1, mRate * 1);
      computedAmount = computedShares * shareUnitPrice;
      computedPeriodText = sMonth;
    } else if (mode === 'advance_multi_month' || mode === 'new_member_backdated') {
      computedShares = Math.max(1, mRate * mCount);
      computedAmount = computedShares * shareUnitPrice;
      computedPeriodText = `${sMonth} - ${eMonth} (${mCount} ${isBn ? 'মাস' : (mCount === 1 ? 'Month' : 'Months')})`;
    }

    triggerSharesChange(computedShares);
    if (typeof onAmountBDTChange === 'function') {
      onAmountBDTChange(computedAmount);
    }
    if (typeof onPeriodTextChange === 'function') {
      onPeriodTextChange(computedPeriodText);
    }

    const autoNotes = generateAutoDepositNotes({
      depositMode: mode,
      monthlyRate: mRate,
      monthsCount: mCount,
      startMonth: sMonth,
      endMonth: eMonth,
      totalShares: computedShares,
      isBn
    });
    triggerNotesChange(autoNotes);
  };

  // Handle Mode Switch
  const handleModeSelect = (newMode: DepositMode) => {
    onDepositModeChange(newMode);
    if (newMode === 'single_month') {
      onMonthsCountChange(1);
      onEndMonthChange(startMonth);
      applyCalculation(newMode, monthlyRate, 1, startMonth, startMonth);
    } else if (newMode === 'advance_multi_month') {
      const count = 2;
      const computedEnd = getOffsetMonth(startMonth, count - 1);
      onMonthsCountChange(count);
      onEndMonthChange(computedEnd);
      applyCalculation(newMode, monthlyRate, count, startMonth, computedEnd);
    } else if (newMode === 'new_member_backdated') {
      const count = 4; // default 4 months backdated joining
      const computedStart = getBackdatedStartMonth(endMonth || startMonth, count);
      onMonthsCountChange(count);
      onStartMonthChange(computedStart);
      applyCalculation(newMode, monthlyRate, count, computedStart, endMonth || startMonth);
    } else if (newMode === 'general') {
      applyCalculation(newMode, monthlyRate, 1, 'general', 'general');
    }
  };

  // Handle Monthly Commitment Rate Change (e.g. 1 share/mo vs 2 shares/mo)
  const handleRateChange = (newRate: number) => {
    const validRate = Math.max(1, newRate);
    onMonthlyRateChange(validRate);
    applyCalculation(depositMode, validRate, monthsCount, startMonth, endMonth);
  };

  // Handle Quick Advance Months Preset (e.g. 2, 3, 4, 6 months)
  const handleAdvanceMonthsPreset = (count: number) => {
    onMonthsCountChange(count);
    const computedEnd = getOffsetMonth(startMonth, count - 1);
    onEndMonthChange(computedEnd);
    applyCalculation(depositMode, monthlyRate, count, startMonth, computedEnd);
  };

  // Handle Quick Backdated Joining Months Preset (e.g. 3, 4, 6 months past)
  const handleBackdatedMonthsPreset = (count: number) => {
    onMonthsCountChange(count);
    const referenceEnd = endMonth || startMonth;
    const computedStart = getBackdatedStartMonth(referenceEnd, count);
    onStartMonthChange(computedStart);
    applyCalculation(depositMode, monthlyRate, count, computedStart, referenceEnd);
  };

  // Handle Start Month Dropdown Change
  const handleStartMonthSelect = (selectedMonth: string) => {
    onStartMonthChange(selectedMonth);
    if (depositMode === 'single_month') {
      onEndMonthChange(selectedMonth);
      applyCalculation(depositMode, monthlyRate, 1, selectedMonth, selectedMonth);
    } else if (depositMode === 'advance_multi_month') {
      const computedEnd = getOffsetMonth(selectedMonth, monthsCount - 1);
      onEndMonthChange(computedEnd);
      applyCalculation(depositMode, monthlyRate, monthsCount, selectedMonth, computedEnd);
    } else if (depositMode === 'new_member_backdated') {
      const diff = getMonthsBetween(selectedMonth, endMonth);
      onMonthsCountChange(diff);
      applyCalculation(depositMode, monthlyRate, diff, selectedMonth, endMonth);
    }
  };

  // Handle End Month Dropdown Change
  const handleEndMonthSelect = (selectedMonth: string) => {
    onEndMonthChange(selectedMonth);
    if (depositMode === 'advance_multi_month') {
      const diff = getMonthsBetween(startMonth, selectedMonth);
      onMonthsCountChange(diff);
      applyCalculation(depositMode, monthlyRate, diff, startMonth, selectedMonth);
    } else if (depositMode === 'new_member_backdated') {
      const computedStart = getBackdatedStartMonth(selectedMonth, monthsCount);
      onStartMonthChange(computedStart);
      applyCalculation(depositMode, monthlyRate, monthsCount, computedStart, selectedMonth);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Deposit Purpose / Mode Selection Tabs */}
      <div>
        <label className="block text-amber-300 font-bold mb-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            {isBn ? 'জমার ধরণ ও উদ্দেশ্য নির্বাচন করুন *' : 'Select Deposit Purpose & Category *'}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {isBn ? 'অগ্রিম, বকেয়া বা নিয়মিত কিস্তি' : 'Advance, Backdated or Regular'}
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Mode 1: Single Month */}
          <button
            type="button"
            onClick={() => handleModeSelect('single_month')}
            className={`p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
              depositMode === 'single_month'
                ? 'bg-[#112244] border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                : 'bg-[#0B1528] border-[#D4AF37]/30 text-slate-300 hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">📅</span>
              {depositMode === 'single_month' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="mt-2">
              <h5 className="font-bold text-xs text-amber-200">
                {isBn ? '১ মাসের কিস্তি' : 'Single Month'}
              </h5>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'চলতি ১ মাসের নিয়মিত জমা' : '1 Month regular'}
              </p>
            </div>
          </button>

          {/* Mode 2: Advance Multi-Month */}
          <button
            type="button"
            onClick={() => handleModeSelect('advance_multi_month')}
            className={`p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
              depositMode === 'advance_multi_month'
                ? 'bg-[#112244] border-sky-400 text-white shadow-lg ring-1 ring-sky-400'
                : 'bg-[#0B1528] border-[#D4AF37]/30 text-slate-300 hover:border-sky-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">⏩</span>
              {depositMode === 'advance_multi_month' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
            </div>
            <div className="mt-2">
              <h5 className="font-bold text-xs text-sky-200">
                {isBn ? 'অগ্রিম কিস্তি (একাধিক মাস)' : 'Advance Deposit'}
              </h5>
              <p className="text-[10px] text-slate-400">
                {isBn ? '২ বা তার বেশি মাসের জমা' : '2+ Months in advance'}
              </p>
            </div>
          </button>

          {/* Mode 3: New Member Backdated Dues */}
          <button
            type="button"
            onClick={() => handleModeSelect('new_member_backdated')}
            className={`p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
              depositMode === 'new_member_backdated'
                ? 'bg-[#112244] border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                : 'bg-[#0B1528] border-[#D4AF37]/30 text-slate-300 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">⏳</span>
              {depositMode === 'new_member_backdated' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="mt-2">
              <h5 className="font-bold text-xs text-amber-300">
                {isBn ? 'নতুন সদস্যের বকেয়া কিস্তি' : 'New Member Dues'}
              </h5>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'পূর্বের ৩-৪ মাস বা তার বেশি' : 'Past months backdated'}
              </p>
            </div>
          </button>

          {/* Mode 4: General Deposit */}
          <button
            type="button"
            onClick={() => handleModeSelect('general')}
            className={`p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
              depositMode === 'general'
                ? 'bg-[#112244] border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                : 'bg-[#0B1528] border-[#D4AF37]/30 text-slate-300 hover:border-emerald-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">💼</span>
              {depositMode === 'general' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="mt-2">
              <h5 className="font-bold text-xs text-emerald-200">
                {isBn ? 'সাধারণ জমা' : 'General Deposit'}
              </h5>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'মাস ছাড়া এককালীন জমা' : 'Non-monthly capital'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Monthly Share Commitment Rate (সদস্যের মাসিক শেয়ার হার) */}
      <div className="p-4 bg-[#070D1B] border border-amber-500/40 rounded-2xl space-y-3 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {isBn ? 'প্রতি মাসে মেম্বার কয়টি শেয়ার নেন? (Monthly Rate)' : 'Monthly Share Commitment Rate'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isBn ? 'মেম্বার প্রতি মাসে ১, ২, ৩ বা ততোধিক শেয়ার নিতে পারেন' : 'Member can subscribe to 1, 2, 3 or more shares per month'}
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/40 rounded-full">
            <span className="text-[11px] font-bold text-amber-300 font-mono">
              ৳{shareUnitPrice.toLocaleString('en-BD')} / {isBn ? 'শেয়ার' : 'Share'}
            </span>
          </div>
        </div>

        {/* Counter & Rate Preset Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRateChange(monthlyRate - 1)}
              disabled={monthlyRate <= 1}
              className="w-8 h-8 rounded-xl bg-[#0B1528] hover:bg-[#112244] disabled:opacity-30 disabled:cursor-not-allowed border border-amber-500/40 flex items-center justify-center text-amber-300 transition active:scale-95 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                value={monthlyRate}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleRateChange(isNaN(val) || val < 1 ? 1 : val);
                }}
                className="w-16 text-center py-1 bg-[#0B1528] border-2 border-amber-500/50 rounded-xl text-amber-300 font-mono font-black text-sm focus:outline-none"
              />
              <span className="ml-2 text-xs font-bold text-slate-300">
                {isBn ? 'শেয়ার/মাস' : 'Shares/mo'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleRateChange(monthlyRate + 1)}
              className="w-8 h-8 rounded-xl bg-[#0B1528] hover:bg-[#112244] border border-amber-500/40 flex items-center justify-center text-amber-300 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Rate Selection Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold mr-0.5">{isBn ? 'রেট:' : 'Rate:'}</span>
            {[1, 2, 3, 4, 5].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleRateChange(cnt)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  monthlyRate === cnt
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
                    : 'bg-[#0B1528] text-amber-300 border-amber-500/30 hover:border-amber-400'
                }`}
              >
                {cnt} {isBn ? 'শেয়ার' : (cnt === 1 ? 'Share' : 'Shares')}
                <span className="text-[10px] opacity-80 block text-[9px] font-mono">
                  (৳{(cnt * shareUnitPrice).toLocaleString('en-BD')})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Period & Month Range Selection (Based on chosen mode) */}
      {depositMode !== 'general' && (
        <div className="p-4 bg-[#0B1528] border border-[#D4AF37]/30 rounded-2xl space-y-3">
          {/* Header depending on mode */}
          <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              {depositMode === 'single_month' && (isBn ? 'কিস্তির মাস নির্বাচন করুন' : 'Select Contribution Month')}
              {depositMode === 'advance_multi_month' && (isBn ? 'অগ্রিম জমার সময়কাল ও মাসের সংখ্যা' : 'Advance Period & Number of Months')}
              {depositMode === 'new_member_backdated' && (isBn ? 'নতুন সদস্যের বকেয়া কিস্তির সময়কাল (৩-৪ মাস বা তার বেশি)' : 'New Member Joining Backdated Months')}
            </span>

            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {monthsCount} {isBn ? 'মাস' : (monthsCount === 1 ? 'Month' : 'Months')}
            </span>
          </div>

          {/* Mode 1: Single Month Selector */}
          {depositMode === 'single_month' && (
            <div className="space-y-2">
              <select
                value={startMonth}
                onChange={(e) => handleStartMonthSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                {GENERATED_MONTH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
                    {isBn ? `${opt.labelBn} (${opt.value})` : opt.labelEn}
                  </option>
                ))}
              </select>

              {/* Quick Month Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 font-bold mr-1">{isBn ? 'কুইক মাস:' : 'Quick:'}</span>
                {['August 2026', 'September 2026', 'October 2026', 'November 2026'].map(mStr => (
                  <button
                    key={mStr}
                    type="button"
                    onClick={() => handleStartMonthSelect(mStr)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                      startMonth === mStr
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                        : 'bg-[#070D1B] text-slate-300 border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {formatMonthDisplay(mStr, isBn)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: Advance Multi-Month Selector */}
          {depositMode === 'advance_multi_month' && (
            <div className="space-y-3">
              {/* Quick Advance Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-amber-300 font-bold mr-1">
                  {isBn ? 'কয় মাসের অগ্রিম দিতে চান?' : 'Months in Advance:'}
                </span>
                {[2, 3, 4, 5, 6, 12].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleAdvanceMonthsPreset(count)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer active:scale-95 ${
                      monthsCount === count
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black ring-1 ring-sky-300'
                        : 'bg-[#070D1B] text-sky-200 border-sky-500/30 hover:border-sky-400'
                    }`}
                  >
                    {count} {isBn ? 'মাস' : (count === 1 ? 'Month' : 'Months')} {count === 12 ? (isBn ? '(১ বছর)' : '(1 Yr)') : ''}
                  </button>
                ))}
              </div>

              {/* Start & End Month Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">
                    {isBn ? 'শুরুর মাস (From Month):' : 'Starting Month:'}
                  </label>
                  <select
                    value={startMonth}
                    onChange={(e) => handleStartMonthSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    {GENERATED_MONTH_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
                        {isBn ? `${opt.labelBn} (${opt.value})` : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">
                    {isBn ? 'পরিশোধিত শেষ মাস (To Month):' : 'Ending Month:'}
                  </label>
                  <select
                    value={endMonth}
                    onChange={(e) => handleEndMonthSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    {GENERATED_MONTH_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
                        {isBn ? `${opt.labelBn} (${opt.value})` : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: New Member Backdated Dues Selector */}
          {depositMode === 'new_member_backdated' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'নতুন সদস্যরা ক্লাবে যোগদানের পর পূর্ববর্তী ৩, ৪ বা ততোধিক মাসের বকেয়া কিস্তির শেয়ার একসাথে পরিশোধ করতে পারবেন।'
                    : 'New members joining late can pay their backdated joining shares for past 3, 4 or more months in one voucher.'}
                </span>
              </div>

              {/* Quick Backdated Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-amber-300 font-bold mr-1">
                  {isBn ? 'কত মাসের বকেয়া?' : 'Backdated Months:'}
                </span>
                {[2, 3, 4, 5, 6, 8, 12].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleBackdatedMonthsPreset(count)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer active:scale-95 ${
                      monthsCount === count
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black ring-1 ring-amber-300'
                        : 'bg-[#070D1B] text-amber-200 border-amber-500/30 hover:border-amber-400'
                    }`}
                  >
                    {count} {isBn ? 'মাস বকেয়া' : `${count} Mos`}
                  </button>
                ))}
              </div>

              {/* Range Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">
                    {isBn ? 'বকেয়া শুরুর মাস (Backdated From):' : 'Backdated From:'}
                  </label>
                  <select
                    value={startMonth}
                    onChange={(e) => handleStartMonthSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    {GENERATED_MONTH_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
                        {isBn ? `${opt.labelBn} (${opt.value})` : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">
                    {isBn ? 'চলতি / যোগদানের মাস (Joining / To Month):' : 'Joining / Current Month:'}
                  </label>
                  <select
                    value={endMonth}
                    onChange={(e) => handleEndMonthSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    {GENERATED_MONTH_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
                        {isBn ? `${opt.labelBn} (${opt.value})` : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Transparent Live Breakdown Card & Total BDT */}
      <div className="p-4 rounded-2xl border-2 space-y-3 shadow-xl" style={{ backgroundColor: '#0B1528', borderColor: '#D4AF37' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-amber-300 uppercase tracking-wide">
                {isBn ? 'স্বচ্ছ জমা ও রসিদ হিসাব বিবরণী (Live Breakdown)' : 'Transparent Deposit & Receipt Breakdown'}
              </h4>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'রসিদে এবং মেম্বার লেজারে ঠিক এই তথ্য সংরক্ষিত হবে' : 'This exact formula will be recorded on the official receipt'}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider self-start sm:self-auto" style={{ backgroundColor: '#064E3B', color: '#34D399', border: '1px solid #10B981' }}>
            ● {depositMode === 'new_member_backdated' ? (isBn ? 'বকেয়া সমন্বয়' : 'Backdated Dues') : depositMode === 'advance_multi_month' ? (isBn ? 'অগ্রিম সঞ্চয়' : 'Advance') : (isBn ? 'নিয়মিত কিস্তি' : 'Regular')}
          </span>
        </div>

        {/* Calculation Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-[#070D1B] rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isBn ? 'মাসিক হার:' : 'Monthly Rate:'}</span>
            <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">
              {monthlyRate} {isBn ? 'শেয়ার/মাস' : 'Sh/mo'}
            </span>
          </div>

          <div className="p-2.5 bg-[#070D1B] rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isBn ? 'মাসের সংখ্যা:' : 'Months Count:'}</span>
            <span className="font-mono font-bold text-sky-300 text-sm mt-0.5 block">
              {depositMode === 'general' ? '১' : monthsCount} {isBn ? 'মাস' : 'Months'}
            </span>
          </div>

          <div className="p-2.5 bg-[#070D1B] rounded-xl border border-amber-500/40">
            <span className="text-[10px] text-amber-300/80 block">{isBn ? 'রসিদে মোট শেয়ার:' : 'Total Paid Shares:'}</span>
            <span className="font-mono font-black text-amber-300 text-sm mt-0.5 block">
              {currentShares} {isBn ? 'টি শেয়ার' : (currentShares === 1 ? 'Share' : 'Shares')}
            </span>
          </div>

          <div className="p-2.5 bg-[#064E3B]/30 rounded-xl border border-emerald-500/50">
            <span className="text-[10px] text-emerald-400 block">{isBn ? 'মোট প্রদেয় BDT:' : 'Total Amount:'}</span>
            <span className="font-mono font-black text-emerald-300 text-sm mt-0.5 block">
              ৳{amountBDT.toLocaleString('en-BD')}
            </span>
          </div>
        </div>

        {/* Highlight Banner with exact formula */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-200">
            <span className="font-bold text-white">
              {depositMode === 'general' ? (
                isBn ? `সাধারণ জমা: ${currentShares} শেয়ার × ৳${shareUnitPrice.toLocaleString('en-BD')}` : `General Deposit: ${currentShares} Shares × ৳${shareUnitPrice.toLocaleString('en-BD')}`
              ) : (
                isBn
                  ? `হিসাব: (${monthlyRate} শেয়ার/মাস × ${monthsCount} মাস) = মোট ${currentShares}টি শেয়ার × ৳${shareUnitPrice.toLocaleString('en-BD')}`
                  : `Formula: (${monthlyRate} Sh/mo × ${monthsCount} Mos) = ${currentShares} Shares × ৳${shareUnitPrice.toLocaleString('en-BD')}`
              )}
            </span>
          </div>
          <span className="font-mono font-black text-amber-300 text-base">
            = ৳{amountBDT.toLocaleString('en-BD')} BDT
          </span>
        </div>
      </div>
    </div>
  );
};
