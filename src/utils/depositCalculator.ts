export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export interface MonthOption {
  value: string; // e.g. 'August 2026'
  labelEn: string;
  labelBn: string;
  year: number;
  monthIdx: number; // 0-indexed
}

export const GENERATED_MONTH_OPTIONS: MonthOption[] = [2027, 2026, 2025, 2024].flatMap(year => 
  MONTH_NAMES_EN.map((monthEn, idx) => ({
    value: `${monthEn} ${year}`,
    labelEn: `${monthEn} ${year}`,
    labelBn: `${MONTH_NAMES_BN[idx]} ${year}`,
    year,
    monthIdx: idx
  }))
);

/**
 * Parses month string like "August 2026" to { monthIdx: 7, year: 2026 }
 */
export function parseMonthStr(monthStr: string): { monthIdx: number; year: number } | null {
  if (!monthStr || monthStr === 'general') return null;
  const parts = monthStr.trim().split(' ');
  if (parts.length < 2) return null;
  const monthName = parts[0];
  const year = parseInt(parts[1], 10);
  if (isNaN(year)) return null;

  const idx = MONTH_NAMES_EN.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (idx !== -1) return { monthIdx: idx, year };

  const bnIdx = MONTH_NAMES_BN.findIndex(m => m === monthName);
  if (bnIdx !== -1) return { monthIdx: bnIdx, year };

  return null;
}

/**
 * Formats a month string into Bengali or English display
 */
export function formatMonthDisplay(monthStr: string, isBn: boolean): string {
  if (!monthStr) return '';
  if (monthStr === 'general') return isBn ? 'সাধারণ জমা' : 'General Deposit';
  const parsed = parseMonthStr(monthStr);
  if (!parsed) return monthStr;
  return isBn ? `${MONTH_NAMES_BN[parsed.monthIdx]} ${parsed.year}` : `${MONTH_NAMES_EN[parsed.monthIdx]} ${parsed.year}`;
}

/**
 * Calculates month with positive offset (e.g. August 2026 + 1 month = September 2026)
 */
export function getOffsetMonth(baseMonth: string, offsetMonths: number): string {
  const parsed = parseMonthStr(baseMonth) || { monthIdx: 7, year: 2026 };
  const totalMonths = parsed.year * 12 + parsed.monthIdx + offsetMonths;
  const newYear = Math.floor(totalMonths / 12);
  const newMonthIdx = ((totalMonths % 12) + 12) % 12;
  return `${MONTH_NAMES_EN[newMonthIdx]} ${newYear}`;
}

/**
 * Calculates start month for backdated joining dues (e.g. Current August 2026, total 4 months => May 2026)
 */
export function getBackdatedStartMonth(currentOrEndMonth: string, totalMonths: number): string {
  return getOffsetMonth(currentOrEndMonth, -(totalMonths - 1));
}

/**
 * Calculates number of months between start and end month inclusive
 */
export function getMonthsBetween(startMonthStr: string, endMonthStr: string): number {
  const p1 = parseMonthStr(startMonthStr);
  const p2 = parseMonthStr(endMonthStr);
  if (!p1 || !p2) return 1;
  const diff = (p2.year * 12 + p2.monthIdx) - (p1.year * 12 + p1.monthIdx) + 1;
  return Math.max(1, diff);
}

/**
 * Generates an automated description / remarks for the deposit voucher
 */
export function generateAutoDepositNotes(params: {
  depositMode: 'single_month' | 'advance_multi_month' | 'new_member_backdated' | 'general';
  monthlyRate: number;
  monthsCount: number;
  startMonth: string;
  endMonth: string;
  totalShares: number;
  isBn: boolean;
}): string {
  const { depositMode, monthlyRate, monthsCount, startMonth, endMonth, totalShares, isBn } = params;

  if (depositMode === 'general') {
    return isBn ? 'সাধারণ জমা / শেয়ার মূলধন' : 'General Deposit / Capital Share';
  }

  const startLabel = formatMonthDisplay(startMonth, isBn);
  const endLabel = formatMonthDisplay(endMonth, isBn);

  if (depositMode === 'single_month' || monthsCount <= 1) {
    return isBn
      ? `মাসিক মূলধন কিস্তি - ${startLabel} (${monthlyRate}টি শেয়ার)`
      : `Monthly Contribution - ${startMonth} (${monthlyRate} ${monthlyRate === 1 ? 'Share' : 'Shares'})`;
  }

  if (depositMode === 'new_member_backdated') {
    return isBn
      ? `নতুন সদস্যের পূর্ববর্তী বকেয়া কিস্তি: ${startLabel} হতে ${endLabel} (মাসিক ${monthlyRate} শেয়ার × ${monthsCount} মাস = মোট ${totalShares} শেয়ার)`
      : `New Member Joining Dues: ${startMonth} to ${endMonth} (${monthlyRate} ${monthlyRate === 1 ? 'Share' : 'Shares'}/mo × ${monthsCount} mos = ${totalShares} Shares)`;
  }

  // advance_multi_month
  return isBn
    ? `অগ্রিম মাসিক সঞ্চয়: ${startLabel} হতে ${endLabel} (মাসিক ${monthlyRate} শেয়ার × ${monthsCount} মাস = মোট ${totalShares} শেয়ার)`
    : `Advance Monthly Contribution: ${startMonth} to ${endMonth} (${monthlyRate} ${monthlyRate === 1 ? 'Share' : 'Shares'}/mo × ${monthsCount} mos = ${totalShares} Shares)`;
}
