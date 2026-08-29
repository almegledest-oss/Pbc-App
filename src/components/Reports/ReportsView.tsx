import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { 
  BarChart2, 
  PieChart as PieIcon, 
  TrendingUp, 
  Globe, 
  Users, 
  Printer, 
  Download, 
  DollarSign, 
  Building2,
  ChevronRight,
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  Award,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { PbcLogo } from '../Common/PbcLogo';

// Helper: Smart currency formatting for Y-Axis without fractions or bugs like 0.00004L
export const formatCompactBDT = (val: number): string => {
  const num = Number(val) || 0;
  if (num === 0) return '৳0';
  if (num >= 10000000) { // 1 Crore
    const cr = (num / 10000000);
    return `৳${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) { // 1 Lakh
    const lakh = (num / 100000);
    return `৳${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
  }
  if (num >= 1000) { // Thousand
    const k = (num / 1000);
    return `৳${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `৳${num.toLocaleString()}`;
};

export const ReportsView: React.FC = () => {
  const { 
    stats, 
    members, 
    deposits, 
    projects, 
    language,
    currentNavState,
    navigateWithHistory,
    goBack,
    systemSettings
  } = useApp();

  const isBn = language === 'bn';
  const labels = t[language];

  // Sub-view from current navigation state
  const currentSubView = currentNavState.subView;

  // Filter state for deposits chart
  const [depositRange, setDepositRange] = useState<'6m' | '12m' | 'all'>('6m');

  // Dynamic monthly deposit breakdown from actual database deposits
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthsCount = depositRange === '12m' ? 12 : 6;
    const monthsList: { month: string; year: number; monthNum: number; fullLabel: string }[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        fullLabel: `${monthNames[d.getMonth()]} ${d.getFullYear()}`
      });
    }

    const approvedDeps = deposits.filter(d => d.status === 'Approved');

    return monthsList.map(({ month, year, monthNum, fullLabel }) => {
      const matchingDeposits = approvedDeps.filter(d => {
        if (!d.date) return false;
        const depDate = new Date(d.date);
        return depDate.getFullYear() === year && depDate.getMonth() === monthNum;
      });

      const amount = matchingDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const count = matchingDeposits.length;

      return { 
        month: depositRange === '12m' ? month : fullLabel,
        shortMonth: month,
        amount, 
        count 
      };
    });
  }, [deposits, depositRange]);

  // Dynamic yearly deposits data
  const yearlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    const approvedDeps = deposits.filter(d => d.status === 'Approved');

    return years.map(y => {
      const matching = approvedDeps.filter(d => {
        if (!d.date) return false;
        return new Date(d.date).getFullYear() === y;
      });
      const total = matching.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      return { 
        year: String(y), 
        total,
        count: matching.length
      };
    });
  }, [deposits]);

  // Country Demographics
  const countryCounts: Record<string, number> = {};
  members.forEach(m => {
    const c = m.country || 'Other';
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });

  const memberCountryData = Object.entries(countryCounts).map(([country, count]) => ({
    name: country,
    value: count
  }));

  // Property Type Distribution
  const propertyTypeCounts: Record<string, number> = {};
  projects.forEach(p => {
    const type = p.propertyType || 'Commercial';
    propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + (Number(p.investmentAmount) || 0);
  });

  const propertyTypeData = Object.entries(propertyTypeCounts).map(([type, value]) => ({
    name: type,
    value
  }));

  const COLORS = ['#D4AF37', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'];

  const handlePrint = () => {
    window.print();
  };

  // Open Sub-View helper
  const openSubView = (subView: string, title: string, titleBn: string) => {
    navigateWithHistory('reports', {
      subView,
      title,
      titleBn
    });
  };

  // Total verified members count
  const activeMembersCount = members.filter(m => m.status === 'active').length;
  const pendingMembersCount = members.filter(m => m.status === 'pending').length;

  // Member deposit calculation map
  const memberDepositMap = useMemo(() => {
    const map: Record<string, number> = {};
    deposits.filter(d => d.status === 'Approved').forEach(d => {
      map[d.memberId] = (map[d.memberId] || 0) + Number(d.amount || 0);
    });
    return map;
  }, [deposits]);

  const totalClubDeposits = useMemo(() => {
    return Object.values(memberDepositMap).reduce((sum: number, val: number) => sum + val, 0);
  }, [memberDepositMap]);

  // Total Real Estate Portfolio Value
  const totalPortfolioValue = useMemo(() => {
    return projects.reduce((sum, p) => sum + (Number(p.currentValue) || Number(p.investmentAmount) || 0), 0);
  }, [projects]);

  // ----------------------------------------------------
  // IF NO SUBVIEW IS ACTIVE: RENDER THE REPORTS HUB MENU
  // ----------------------------------------------------
  if (!currentSubView) {
    return (
      <div className="space-y-6 pb-12">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#070D1B] via-[#0B1528] to-[#112244] p-6 rounded-3xl text-white border-2 border-[#D4AF37]/40 shadow-2xl">
          <div>
            <span className="px-3 py-1 text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full uppercase tracking-widest shadow-md">
              {isBn ? 'এক্সিকিউটিভ অডিট ও অ্যানালিটিক্স' : 'FINANCIAL & AUDIT HUB'}
            </span>
            <h2 className="text-2xl font-black mt-2 tracking-tight uppercase text-amber-300">
              {isBn ? 'পিবিসি ক্লাব রিপোর্টস ও অ্যানালিটিক্স' : 'Financial & Member Reports'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isBn 
                ? 'যেকোনো রিপোর্ট বিস্তারিত দেখতে নিচের তালিকা থেকে নির্বাচন করুন' 
                : 'Select any report module below to view in full-screen analytical focus'}
            </p>
          </div>

          {/* Print Shortcut */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openSubView('audit_print', 'Official Audit Report', 'অফিসিয়াল অডিট রিপোর্ট')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>{isBn ? 'অডিট প্রিন্ট রিপোর্ট' : 'Print Audit Report'}</span>
            </button>
          </div>
        </div>

        {/* The List of Report Modules (Hub Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Monthly & Yearly Deposits */}
          <div
            onClick={() => openSubView('deposits', 'Monthly & Yearly Deposits', 'মাসিক ও বাৎসরিক ডিপোজিট গ্রোথ')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'মাসিক ও বাৎসরিক ডিপোজিট' : 'Monthly & Yearly Deposits'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full font-bold">
                    {formatCompactBDT(totalClubDeposits)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'মাসভিত্তিক ডিপোজিট বৃদ্ধি, বছরভিত্তিক তুলনা ও ক্যাপিটাল ফান্ড ফ্লো চার্ট' 
                    : 'Interactive month-over-month growth, capital acceleration, and yearly trends'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 2. Member Demographics */}
          <div
            onClick={() => openSubView('members', 'Member Demographics', 'সদস্যদের বৈশ্বিক ডেমোগ্রাফিক্স')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <Globe className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'সদস্যদের বৈশ্বিক ডেমোগ্রাফিক্স' : 'Member Demographics'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold">
                    {members.length} {isBn ? 'সদস্য' : 'Members'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'বিশ্বের বিভিন্ন দেশে অবস্থানরত প্রবাসী সদস্যদের অনুপাত ও ভেরিফিকেশন স্ট্যাটাস' 
                    : 'Global expatriate country distribution, passport verification, and member ratios'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 3. Real Estate Allocation */}
          <div
            onClick={() => openSubView('investments', 'Real Estate Allocation', 'রিয়েল এস্টেট পোর্টফোলিও বরাদ্দ')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'রিয়েল এস্টেট পোর্টফোলিও' : 'Real Estate Allocation'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                    {projects.length} {isBn ? 'প্রজেক্ট' : 'Projects'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'সম্পদ ভিত্তিক পোর্টফোলিও ক্যাটাগরি এবং প্রজেক্ট অনুযায়ী অর্জিত লাভের বিবরণ' 
                    : 'Asset class breakdown, project valuations, and direct property yield analysis'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 4. Profit & Yield Share */}
          <div
            onClick={() => openSubView('profit', 'Profit & ROI Share', 'মুনাফা ও লভ্যাংশ লেজার')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'মুনাফা ও লভ্যাংশ লেজার' : 'Profit & Yield Share'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-bold">
                    {stats.profitPercentage}% ROI
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {isBn 
                    ? 'প্রত্যেক সদস্যের শেয়ার শতাংশ, ডিপোজিট অনুপাতে বার্ষিক সম্ভাব্য মুনাফা লেজার' 
                    : 'Member equity distribution share ledger and individual profit calculations'}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#070D1B] text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 border border-[#D4AF37]/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* 5. Official Audit Report Print */}
          <div
            onClick={() => openSubView('audit_print', 'Official Audit Report', 'অফিসিয়াল অডিট রিপোর্ট প্রিন্ট')}
            className="p-5 bg-[#0B1528] hover:bg-[#112244] rounded-3xl border-2 border-[#D4AF37]/30 hover:border-amber-400 shadow-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-4 md:col-span-2"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition shadow-md">
                <Printer className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">
                    {isBn ? 'অফিসিয়াল এক্সিকিউটিভ অডিট রিপোর্ট (Print / PDF)' : 'Official Executive Audit Report (Print / PDF)'}
                  </h3>
                  <span className="px-2.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-black rounded-full uppercase">
                    Audit Ready
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {isBn 
                    ? 'ক্লাবের প্রাতিষ্ঠানিক অডিট স্টেটমেন্ট, অফিসিয়াল সিল ও স্বাক্ষরের জন্য প্রস্তুত সম্পূর্ণ রিপোর্ট' 
                    : 'Generate and print complete institutional audit report with executive summary and signoff'}
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

  // -------------------------------------------------------------------------
  // SUB-VIEW 1: MONTHLY & YEARLY DEPOSITS GROWTH
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-12">
      
      {currentSubView === 'deposits' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-[#0B1528] rounded-2xl border border-[#D4AF37]/30">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'সর্বমোট ডিপোজিট' : 'Total Deposits'}</span>
              <span className="text-lg sm:text-xl font-black text-amber-300">৳{totalClubDeposits.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-[#0B1528] rounded-2xl border border-[#D4AF37]/30">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'অনুমোদিত ভাউচার' : 'Approved Vouchers'}</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{deposits.filter(d => d.status === 'Approved').length}</span>
            </div>
            <div className="p-4 bg-[#0B1528] rounded-2xl border border-[#D4AF37]/30">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'গড় মাসিক ডিপোজিট' : 'Avg Monthly'}</span>
              <span className="text-lg sm:text-xl font-black text-blue-400">
                {formatCompactBDT(Math.round(totalClubDeposits / (monthlyData.length || 1)))}
              </span>
            </div>
            <div className="p-4 bg-[#0B1528] rounded-2xl border border-[#D4AF37]/30">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'পেন্ডিং ভাউচার' : 'Pending Verification'}</span>
              <span className="text-lg sm:text-xl font-black text-amber-400">{deposits.filter(d => d.status === 'Pending').length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Monthly Deposit Chart */}
            <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {isBn ? 'মাসিক ডিপোজিট প্রবাহ (BDT ৳)' : 'Monthly Deposits Growth (BDT ৳)'}
                  </h3>
                  <p className="text-xs text-slate-400">{isBn ? 'প্রবাসী সদস্যদের মাসিক ক্যাপিটাল প্রবাহ' : 'Cumulative monthly expat contributions'}</p>
                </div>

                {/* Range Filter */}
                <div className="flex items-center gap-1 bg-[#070D1B] p-1 rounded-xl border border-[#D4AF37]/20">
                  <button
                    onClick={() => setDepositRange('6m')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      depositRange === '6m' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    6M
                  </button>
                  <button
                    onClick={() => setDepositRange('12m')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      depositRange === '12m' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    12M
                  </button>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey={depositRange === '12m' ? 'shortMonth' : 'month'} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false}
                      tickFormatter={formatCompactBDT}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(212, 175, 55, 0.08)' }}
                      contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                      formatter={(v: any) => [`৳${Number(v).toLocaleString()} BDT`, isBn ? 'ডিপোজিট পরিমাণ' : 'Deposits Amount']} 
                      labelFormatter={(label) => `${isBn ? 'মাস' : 'Month'}: ${label}`}
                    />
                    <Bar dataKey="amount" fill="#D4AF37" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yearly Comparison */}
            <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isBn ? 'বাৎসরিক ডিপোজিট তুলনা' : 'Yearly Deposits Comparison'}
                </h3>
                <p className="text-xs text-slate-400">{isBn ? 'বছরভিত্তিক ক্লাব ফান্ডের প্রবৃদ্ধি' : 'Year-over-year capital acceleration'}</p>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false}
                      tickFormatter={formatCompactBDT}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                      contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                      formatter={(v: any) => [`৳${Number(v).toLocaleString()} BDT`, isBn ? 'মোট জমাকৃত' : 'Total Deposited']} 
                    />
                    <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={55} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          SUB-VIEW 2: MEMBER DEMOGRAPHICS
          ------------------------------------------------------------------------- */}
      {currentSubView === 'members' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Global Expat Pie Chart */}
            <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isBn ? 'দেশভিত্তিক প্রবাসী সদস্য বণ্টন' : 'Expat Members by Country'}
                </h3>
                <p className="text-xs text-slate-400">{isBn ? 'বিভিন্ন দেশে অবস্থানরত সদস্যদের অনুপাত' : 'Probashi representation across chapters'}</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memberCountryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {memberCountryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                      formatter={(val: any) => [`${val} ${isBn ? 'জন সদস্য' : 'Members'}`, isBn ? 'সদস্য সংখ্যা' : 'Count']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Verification Stats & Ratio */}
            <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wide">
                  {isBn ? 'মেম্বারশিপ ভেরিফিকেশন সামারি' : 'Member Status Overview'}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {isBn ? 'পাসপোর্ট ও মোবাইল নম্বর ভেরিফিকেশন অনুপাত' : 'Passport and phone audit status distribution'}
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-4 bg-[#070D1B] rounded-2xl border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-400 block">{isBn ? 'অ্যাক্টিভ ও ভেরিফাইড মেম্বার' : 'Active Verified Members'}</span>
                        <span className="text-[10px] text-slate-400">{isBn ? 'পাসপোর্ট ও ডিপোজিট স্বীকৃত' : 'Full privileges unlocked'}</span>
                      </div>
                    </div>
                    <span className="text-lg font-black text-white">
                      {activeMembersCount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[#070D1B] rounded-2xl border border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-amber-300 block">{isBn ? 'পেন্ডিং ভেরিফিকেশন' : 'Pending Verification'}</span>
                        <span className="text-[10px] text-slate-400">{isBn ? 'অ্যাডমিন অডিটের অপেক্ষায়' : 'Awaiting admin audit'}</span>
                      </div>
                    </div>
                    <span className="text-lg font-black text-white">
                      {pendingMembersCount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-300 block">{isBn ? 'সর্বমোট নিবন্ধিত সদস্য' : 'Total Registered Expatriates'}</span>
                        <span className="text-[10px] text-slate-400">{isBn ? 'গ্লোবাল ডাটাবেজ রেকর্ড' : 'Active and pending in DB'}</span>
                      </div>
                    </div>
                    <span className="text-lg font-black text-amber-300">
                      {members.length}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 border-t border-[#D4AF37]/20 pt-3">
                * {isBn 
                  ? 'সদস্যপদের বৈধতায় পাসপোর্ট কপি, ফোন ওটিপি এবং কিউআর মেম্বারশিপ পাস নিশ্চিত করা হয়।' 
                  : 'Membership verification includes passport validation, mobile OTP, and encrypted QR pass.'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          SUB-VIEW 3: REAL ESTATE ALLOCATION
          ------------------------------------------------------------------------- */}
      {currentSubView === 'investments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Asset Allocation Pie Chart */}
            <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isBn ? 'সম্পদ শ্রেণীভিত্তিক পোর্টফোলিও বণ্টন' : 'Asset Class Allocation (BDT ৳)'}
                </h3>
                <p className="text-xs text-slate-400">{isBn ? 'পোর্টফোলিওতে বিভিন্ন ক্যাটাগরির শেয়ার' : 'Property type distribution in portfolio'}</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                      formatter={(v: any) => [`৳${Number(v).toLocaleString()} BDT`, isBn ? 'বিনিয়োগ' : 'Investment']} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Property ROI Summary List */}
            <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wide">
                    {isBn ? 'প্রজেক্টভিত্তিক মূল্যায়ন ও মুনাফা' : 'Real Estate Portfolio Valuation'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'বর্তমান বাজার দর ও অর্জিত ক্যাপিটাল গ্রোথ' : 'Current asset market valuation & capital growth'}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">
                  {formatCompactBDT(totalPortfolioValue)}
                </span>
              </div>

              <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
                {projects.map(p => {
                  const profit = (Number(p.currentValue) || 0) - (Number(p.investmentAmount) || 0);
                  return (
                    <div key={p.id} className="p-3.5 bg-[#070D1B] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block text-sm">{p.projectName}</span>
                        <span className="text-[11px] text-slate-400">{p.city}, {p.country} • {p.propertyType}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-400 block text-sm">
                          ৳{(Number(p.currentValue) || Number(p.investmentAmount) || 0).toLocaleString()}
                        </span>
                        <span className={`text-[11px] font-bold ${profit >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                          {profit >= 0 ? `+৳${profit.toLocaleString()} Profit` : `-৳${Math.abs(profit).toLocaleString()} Loss`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          SUB-VIEW 4: PROFIT & YIELD SHARE
          ------------------------------------------------------------------------- */}
      {currentSubView === 'profit' && (
        <div className="space-y-6">
          <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                  {isBn ? 'সদস্যভিত্তিক মুনাফা বন্টন ও ইকুইটি লেজার' : 'Member Profit Distribution Share Ledger'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn 
                    ? 'ক্লাব ফান্ডে জমার ওপর ভিত্তি করে আনুমানিক বার্ষিক লভ্যাংশ ও ইকুইটি শেয়ার' 
                    : 'Estimated annual yield return per member deposit based on total equity share'}
                </p>
              </div>
              <span className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold rounded-xl self-start sm:self-auto shadow-sm">
                Average Portfolio ROI: {stats.profitPercentage}%
              </span>
            </div>

            {/* Overall Ledger Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#070D1B] text-amber-300 font-bold border-b border-[#D4AF37]/30 uppercase tracking-wider">
                    <th className="py-3 px-4">Member ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Total Deposit</th>
                    <th className="py-3 px-4">Fund Equity Share %</th>
                    <th className="py-3 px-4 text-right">Estimated Annual Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/20 bg-[#0B1528]">
                  {members.map(m => {
                    const actualDeposit = memberDepositMap[m.id] || 0;
                    const sharePct = totalClubDeposits > 0 
                      ? Math.min(100, (actualDeposit / totalClubDeposits) * 100).toFixed(2)
                      : '0.00';

                    const estimatedProfit = Math.round(actualDeposit * (stats.profitPercentage / 100));

                    return (
                      <tr key={m.id} className="hover:bg-[#112244]/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">{m.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{m.fullName}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          ৳{actualDeposit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-400 font-bold">{sharePct}%</td>
                        <td className="py-3 px-4 font-extrabold text-emerald-400 text-right">
                          +৳{estimatedProfit.toLocaleString()} BDT
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          SUB-VIEW 5: OFFICIAL AUDIT REPORT (PRINT & EXPORT)
          ------------------------------------------------------------------------- */}
      {currentSubView === 'audit_print' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/30 print:hidden">
            <div>
              <h3 className="text-sm font-bold text-white">{isBn ? 'অফিসিয়াল অডিট রিপোর্ট প্রিন্ট প্রিভিউ' : 'Official Audit Report Print Preview'}</h3>
              <p className="text-xs text-slate-400">{isBn ? 'এখান থেকে সরাসরি প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন' : 'Print directly or save as PDF document'}</p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট / PDF ডাউনলোড' : 'Print / Download PDF'}</span>
            </button>
          </div>

          {/* Printable Document Paper Card */}
          <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none">
            
            {/* Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-amber-500 pb-6">
              <div className="flex items-center gap-4">
                <PbcLogo className="w-16 h-16" />
                <div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-wide uppercase">
                    PROBASHI BUSINESS CLUB LTD.
                  </h1>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                    প্রবাসী বিজনেস ক্লাব লিমিটেড • Official Audit Statement
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dhaka, Bangladesh • Certified Expatriate Community & Investment Trust
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-[11px] font-black uppercase rounded-lg border border-amber-300 block">
                  Official Statement
                </span>
                <span className="text-xs text-slate-500 font-mono mt-1 block">
                  Date: {new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            {/* Financial Overview Summary */}
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                1. Executive Financial Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Capital Fund</span>
                  <span className="text-lg font-black text-slate-950">৳{totalClubDeposits.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Assets</span>
                  <span className="text-lg font-black text-slate-950">৳{totalPortfolioValue.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Members</span>
                  <span className="text-lg font-black text-slate-950">{members.length}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Portfolio ROI</span>
                  <span className="text-lg font-black text-emerald-600">{stats.profitPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Property Portfolio Table */}
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                2. Real Estate Assets & Investments
              </h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Project Name</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Asset Type</th>
                      <th className="p-3 text-right">Investment Amount</th>
                      <th className="p-3 text-right">Current Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {projects.map(p => (
                      <tr key={p.id}>
                        <td className="p-3 font-bold text-slate-900">{p.projectName}</td>
                        <td className="p-3 text-slate-600">{p.city}, {p.country}</td>
                        <td className="p-3 text-slate-600">{p.propertyType}</td>
                        <td className="p-3 text-right font-mono font-semibold">৳{(Number(p.investmentAmount) || 0).toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">৳{(Number(p.currentValue) || Number(p.investmentAmount) || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signatures & Verification Seal */}
            <div className="pt-8 border-t-2 border-slate-200 flex justify-between items-end">
              <div>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  This document serves as an audited statement generated by the PBC Club ERP Engine. All deposits and disbursements are verified by appointed board executives.
                </p>
              </div>

              <div className="text-center">
                <div className="w-40 border-b border-slate-400 pb-1">
                  <span className="font-serif italic text-slate-700 text-xs">PBC Executive Board</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 block">
                  Authorized Signatory & Seal
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
