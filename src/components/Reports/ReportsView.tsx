import React, { useState } from 'react';
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
  Building2 
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
  Legend 
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { stats, members, deposits, projects, language } = useApp();
  const labels = t[language];

  const [activeReportTab, setActiveReportTab] = useState<'deposits' | 'members' | 'investments' | 'profit'>('deposits');

  // Monthly deposit breakdown data
  const monthlyData = [
    { month: 'Jan', amount: 1800000 },
    { month: 'Feb', amount: 2200000 },
    { month: 'Mar', amount: 2500000 },
    { month: 'Apr', amount: 3100000 },
    { month: 'May', amount: 3900000 },
    { month: 'Jun', amount: 5000000 }
  ];

  // Yearly deposits data
  const yearlyData = [
    { year: '2022', total: 45000000 },
    { year: '2023', total: 110000000 },
    { year: '2024', total: 185000000 }
  ];

  // Country Demographics
  const countryCounts: Record<string, number> = {};
  members.forEach(m => {
    countryCounts[m.country] = (countryCounts[m.country] || 0) + 1;
  });

  const memberCountryData = Object.entries(countryCounts).map(([country, count]) => ({
    name: country,
    value: count
  }));

  // Property Type Distribution
  const propertyTypeCounts: Record<string, number> = {};
  projects.forEach(p => {
    propertyTypeCounts[p.propertyType] = (propertyTypeCounts[p.propertyType] || 0) + p.investmentAmount;
  });

  const propertyTypeData = Object.entries(propertyTypeCounts).map(([type, value]) => ({
    name: type,
    value
  }));

  const COLORS = ['#D4AF37', '#112244', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Financial & Member Reports
          </h2>
          <p className="text-xs text-slate-300">
            Executive analytics, capital deposit trends, and real estate yield distribution
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition print:hidden cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-950" />
          <span>Print Audit Report</span>
        </button>
      </div>

      {/* Report Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-[#D4AF37]/30 pb-2 overflow-x-auto print:hidden">
        {[
          { id: 'deposits', label: 'Monthly & Yearly Deposits', icon: BarChart2 },
          { id: 'members', label: 'Member Demographics', icon: Globe },
          { id: 'investments', label: 'Real Estate Allocation', icon: Building2 },
          { id: 'profit', label: 'Profit & ROI Share', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#112244] text-amber-300 border border-[#D4AF37] shadow-lg shadow-amber-500/10'
                  : 'text-slate-300 bg-[#0B1528] border border-[#D4AF37]/20 hover:border-amber-400/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Monthly & Yearly Deposits Report */}
      {activeReportTab === 'deposits' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-1">
              Monthly Deposits Growth (BDT ৳)
            </h3>
            <p className="text-xs text-slate-400 mb-4">Cumulative monthly expat contributions</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `৳${v/100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                    formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, 'Amount']} 
                  />
                  <Bar dataKey="amount" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-1">
              Yearly Deposits Comparison
            </h3>
            <p className="text-xs text-slate-400 mb-4">Year-over-year capital acceleration</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `৳${v/100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                    formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, 'Total Deposited']} 
                  />
                  <Bar dataKey="total" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* 2. Member Demographics Report */}
      {activeReportTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-1">
              Expat Members by Country
            </h3>
            <p className="text-xs text-slate-400 mb-4">Probashi representation across chapters</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memberCountryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {memberCountryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white mb-2 uppercase tracking-wide">
                Member Status Overview
              </h3>
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between p-3.5 bg-[#070D1B] rounded-2xl border border-emerald-500/30">
                  <span className="font-bold text-emerald-400">Active Verified Members</span>
                  <span className="font-extrabold text-white">
                    {members.filter(m => m.status === 'active').length}
                  </span>
                </div>

                <div className="flex justify-between p-3.5 bg-[#070D1B] rounded-2xl border border-amber-500/30">
                  <span className="font-bold text-amber-300">Pending Verification</span>
                  <span className="font-extrabold text-white">
                    {members.filter(m => m.status === 'pending').length}
                  </span>
                </div>

                <div className="flex justify-between p-3.5 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/20">
                  <span className="font-bold text-slate-300">Total Registered</span>
                  <span className="font-extrabold text-amber-300">{members.length}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              * Verification includes valid passport submission, phone OTP, and QR membership pass generation.
            </p>
          </div>
        </div>
      )}

      {/* 3. Real Estate Allocation Report */}
      {activeReportTab === 'investments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-1">
              Asset Class Allocation (BDT ৳)
            </h3>
            <p className="text-xs text-slate-400 mb-4">Property type distribution in portfolio</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                    formatter={(v: any) => `৳${Number(v).toLocaleString()}`} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wide">
              Real Estate Portfolio ROI Summary
            </h3>
            <div className="space-y-2.5 text-xs">
              {projects.map(p => (
                <div key={p.id} className="p-3 bg-[#070D1B] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{p.projectName}</span>
                    <span className="text-[10px] text-slate-400">{p.city}, {p.country}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 block">
                      ৳{p.currentValue.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">
                      +৳{(p.currentValue - p.investmentAmount).toLocaleString()} Profit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Profit & Yield Share Report */}
      {activeReportTab === 'profit' && (
        <div className="bg-[#0B1528] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                Member Profit Distribution Share Ledger
              </h3>
              <p className="text-xs text-slate-400">Estimated quarterly yield return per member deposit</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full self-start sm:self-auto">
              Average ROI: {stats.profitPercentage}%
            </span>
          </div>

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
                  const sharePct = stats.totalDeposits > 0 
                    ? ((m.totalDeposit / stats.totalDeposits) * 100).toFixed(2)
                    : 0;
                  const estimatedProfit = Math.round((m.totalDeposit * (stats.profitPercentage / 100)));

                  return (
                    <tr key={m.id} className="hover:bg-[#112244]/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">{m.id}</td>
                      <td className="py-3 px-4 font-bold text-white">{m.fullName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        ৳{m.totalDeposit.toLocaleString()}
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
      )}

    </div>
  );
};
