import React from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { BoardOfDirectorsBanner } from './BoardOfDirectorsBanner';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { 
  Users, 
  Wallet, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  ArrowUpRight, 
  PlusCircle, 
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  MapPin,
  X,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const HomeDashboard: React.FC = () => {
  const { stats, deposits, projects, members, language, setActiveTab, setSelectedMemberId, role } = useApp();
  const labels = t[language];

  const [isInvestmentsModalOpen, setIsInvestmentsModalOpen] = React.useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<{ [key: string]: number }>({});
  const [activePreviewProject, setActivePreviewProject] = React.useState<any | null>(null);

  const getMemberTotalDeposit = (member: any) => {
    const memberDeps = deposits.filter(
      d => (d.memberId === member.id || (member.fullName && d.memberName?.toLowerCase() === member.fullName.toLowerCase())) && d.status === 'Approved'
    );
    return memberDeps.reduce((sum, d) => sum + d.amount, 0);
  };

  const [activeChartMetric, setActiveChartMetric] = React.useState<'deposits' | 'totalFund' | 'investment' | 'profit'>('deposits');

  // Chart data for monthly growth metrics
  const chartData = [
    { month: 'Jan', deposits: 920000, totalFund: 1030000, investment: 800000, profit: 110000 },
    { month: 'Feb', deposits: 1100000, totalFund: 1240000, investment: 950000, profit: 140000 },
    { month: 'Mar', deposits: 1350000, totalFund: 1540000, investment: 1100000, profit: 190000 },
    { month: 'Apr', deposits: 1500000, totalFund: 1740000, investment: 1300000, profit: 240000 },
    { month: 'May', deposits: 1680000, totalFund: 1970000, investment: 1450000, profit: 290000 },
    { month: 'Jun', deposits: 1850000, totalFund: 2190000, investment: 1650000, profit: 340000 },
    { month: 'Jul', deposits: 2100000, totalFund: 2520000, investment: 1850000, profit: 420000 },
    { month: 'Aug', deposits: stats.totalDeposits || 2400000, totalFund: stats.totalFund || 2920000, investment: stats.totalInvestment || 2100000, profit: stats.totalProfit || 520000 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#070D1B] via-[#0E1C38] to-[#0B1528] p-6 sm:p-7 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-[#D4AF37]/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-amber-500/10 via-amber-400/5 to-transparent blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3.5 py-1 text-xs font-extrabold bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/30 backdrop-blur-xs tracking-wider uppercase">
            ❖ PBC Executive Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2.5 tracking-tight text-white uppercase">
            Probashi <span className="text-[#E5A93C]">Business Club</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl font-medium">
            Real Estate Fund Management & Expat Capital Growth Platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          {(role === 'super_admin' || role === 'admin') && (
            <>
              <button
                onClick={() => setActiveTab('deposits')}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Deposit</span>
              </button>
              <button
                onClick={() => setActiveTab('real_estate')}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-[#0B1528] hover:bg-[#112244] text-amber-300 rounded-xl shadow-md transition border border-[#D4AF37]/50 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>New Project</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Board of Directors Live Sliced Banner */}
      <BoardOfDirectorsBanner />

      {/* Primary KPI Metric Cards Grid - Strictly 3 metrics as per PBC requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Members */}
        <div 
          onClick={() => setActiveTab('members')}
          className="bg-[#0B1528] dark:bg-[#070D1B] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37]/60 transition cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{labels.totalMembers}</span>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">
            {stats.totalMembers}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active Expat Club Members</span>
          </div>
        </div>

        {/* Total Deposits (BDT) */}
        <div 
          onClick={() => setActiveTab('deposits')}
          className="bg-[#0B1528] dark:bg-[#070D1B] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37]/60 transition cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Deposits (BDT)</span>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ৳{stats.totalDeposits.toLocaleString()} BDT
          </div>
          <div className="text-xs font-medium text-amber-400/90 mt-1">
            ৳{(stats.totalDeposits / 100000).toFixed(2)} Lakh BDT Verified Capital
          </div>
        </div>

        {/* Total Investments (BDT) */}
        <div 
          onClick={() => setIsInvestmentsModalOpen(true)}
          className="bg-[#0B1528] dark:bg-[#070D1B] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] transition cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Investments (BDT)</span>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">
            ৳{stats.totalInvestment.toLocaleString()} BDT
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mt-1">
            <span>{projects.length} Active Real Estate Projects</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
              <span>{language === 'bn' ? 'ছবি ও বিবরণ দেখুন' : 'View Projects'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Financial Performance Chart & Real Estate Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Deposit, Fund, Investment & Profit Growth Trend Chart */}
        <div className="lg:col-span-2 bg-[#0B1528] dark:bg-[#070D1B] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span>Financial Analytics & Growth Trends</span>
              </h3>
              <p className="text-xs text-slate-300">
                Performance tracking across capital metrics
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 bg-[#030712] p-1 rounded-xl border border-amber-500/20">
              <button
                onClick={() => setActiveChartMetric('deposits')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${activeChartMetric === 'deposits' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Deposits
              </button>
              <button
                onClick={() => setActiveChartMetric('totalFund')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${activeChartMetric === 'totalFund' ? 'bg-[#112244] text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Total Fund
              </button>
              <button
                onClick={() => setActiveChartMetric('investment')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${activeChartMetric === 'investment' ? 'bg-purple-900/80 text-purple-200 border border-purple-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Investment
              </button>
              <button
                onClick={() => setActiveChartMetric('profit')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${activeChartMetric === 'profit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Profit Growth
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={
                      activeChartMetric === 'deposits' ? '#F59E0B' :
                      activeChartMetric === 'totalFund' ? '#3B82F6' :
                      activeChartMetric === 'investment' ? '#A855F7' : '#10B981'
                    } stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={
                      activeChartMetric === 'deposits' ? '#F59E0B' :
                      activeChartMetric === 'totalFund' ? '#3B82F6' :
                      activeChartMetric === 'investment' ? '#A855F7' : '#10B981'
                    } stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `৳${val/100000}L`} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`৳${Number(value).toLocaleString()} BDT`, activeChartMetric.toUpperCase()]}
                  contentStyle={{ backgroundColor: '#070D1B', borderColor: '#D4AF37', borderRadius: '12px', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeChartMetric} 
                  stroke={
                    activeChartMetric === 'deposits' ? '#F59E0B' :
                    activeChartMetric === 'totalFund' ? '#3B82F6' :
                    activeChartMetric === 'investment' ? '#A855F7' : '#10B981'
                  } 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                  name={activeChartMetric} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Featured Real Estate Spotlight Card */}
        <div className="bg-[#0B1528] dark:bg-[#070D1B] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 rounded-full uppercase tracking-wider border border-amber-500/40">
                ❖ Spotlight Project
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{projects[0]?.expectedRoiPercent}% ROI
              </span>
            </div>

            <div className="relative h-36 rounded-2xl overflow-hidden mb-3 border border-amber-500/20">
              <img
                src={projects[0]?.photos[0]}
                alt={projects[0]?.projectName}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-3">
                <div>
                  <h4 className="text-sm font-bold text-white truncate">
                    {projects[0]?.projectName}
                  </h4>
                  <p className="text-[11px] text-amber-200/90 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {projects[0]?.city}, {projects[0]?.country}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Investment Value:</span>
                <span className="font-bold text-white">
                  ৳{projects[0]?.investmentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Appraisal:</span>
                <span className="font-bold text-emerald-400">
                  ৳{projects[0]?.currentValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('real_estate')}
            className="mt-4 w-full py-2.5 bg-[#070D1B] hover:bg-[#112244] text-amber-300 border border-[#D4AF37]/60 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Explore Real Estate Portfolio
          </button>
        </div>

      </div>

      {/* Bottom Tables Grid: Recent Deposits & Members Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Deposits Widget */}
        <div className="bg-[#0B1528] dark:bg-[#070D1B] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">
              {labels.recentDeposits}
            </h3>
            <button
              onClick={() => setActiveTab('deposits')}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-amber-500/10">
            {deposits.slice(0, 5).map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[160px]">
                      {d.memberName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {d.id} • {d.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-300">
                    +৳{d.amount.toLocaleString()} BDT
                  </span>
                  <p className="text-[10px] text-slate-400">{d.depositDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Members & Expat Leaders */}
        <div className="bg-[#0B1528] dark:bg-[#070D1B] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">
              Expat Member Leaders
            </h3>
            <button
              onClick={() => setActiveTab('members')}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>{labels.members} ({members.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-amber-500/10">
            {members.slice(0, 5).map((m) => (
              <div 
                key={m.id} 
                onClick={() => {
                  setSelectedMemberId(m.id);
                  setActiveTab('members');
                }}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/5 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <PBCFramedAvatar
                    photoUrl={m.photoUrl}
                    name={m.fullName}
                    alt={m.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {m.fullName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {m.id} • {m.country} ({m.city})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-300">
                    ৳{getMemberTotalDeposit(m).toLocaleString()} BDT
                  </span>
                  <span className="block text-[10px] font-semibold text-emerald-400">
                    Verified ID Pass
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Investments Modal for Members & Admins */}
      {isInvestmentsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B1528] text-white rounded-3xl border border-[#D4AF37]/50 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#070D1B]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span>PBC Investment Portfolio</span>
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full font-bold border border-amber-500/30">
                      {projects.filter(p => !p.isArchived).length} {projects.filter(p => !p.isArchived).length === 1 ? 'Project' : 'Projects'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Total Club Investment: <span className="font-extrabold text-amber-300">৳{stats.totalInvestment.toLocaleString()} BDT</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsInvestmentsModalOpen(false);
                    setActiveTab('real_estate');
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#112244] hover:bg-[#1a3366] text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Portfolio</span>
                </button>
                <button
                  onClick={() => setIsInvestmentsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-full bg-[#070D1B] border border-slate-800 hover:border-amber-400/40 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Projects Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1">
              {projects.filter(p => !p.isArchived).length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Building2 className="w-12 h-12 mx-auto text-amber-400/40" />
                  <p className="font-bold text-white">No Investments Listed Yet</p>
                  <p className="text-xs">Projects will appear here once registered by executive management.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {projects.filter(p => !p.isArchived).map((project) => {
                    const photos = project.photos && project.photos.length > 0
                      ? project.photos
                      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'];
                    const currentIdx = selectedPhotoIndex[project.id] || 0;

                    return (
                      <div
                        key={project.id}
                        className="bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30 shadow-lg overflow-hidden flex flex-col justify-between group hover:border-[#D4AF37] transition"
                      >
                        {/* Project Photo with carousel controls */}
                        <div 
                          onClick={() => setActivePreviewProject(project)}
                          className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={photos[currentIdx] || photos[0]}
                            alt={project.projectName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#070D1B] via-transparent to-black/40 p-3 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 bg-[#070D1B]/90 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold rounded-lg border border-[#D4AF37]/40">
                                {project.category || 'Real Estate'}
                              </span>
                              <span className="px-2.5 py-1 bg-emerald-500/90 text-slate-950 font-black text-[10px] rounded-full">
                                {project.status || 'Active'}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-base font-extrabold text-white leading-tight drop-shadow-md">
                                {project.projectName}
                              </h4>
                              <p className="text-xs text-amber-200 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{project.city || 'Dhaka'}, {project.country || 'Bangladesh'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Multi-photo pagination arrows */}
                          {photos.length > 1 && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10 bg-black/60 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPhotoIndex(prev => ({
                                    ...prev,
                                    [project.id]: (currentIdx - 1 + photos.length) % photos.length
                                  }));
                                }}
                                className="p-0.5 text-white hover:text-amber-300 transition cursor-pointer"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[10px] font-bold text-white px-1">
                                {currentIdx + 1}/{photos.length}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPhotoIndex(prev => ({
                                    ...prev,
                                    [project.id]: (currentIdx + 1) % photos.length
                                  }));
                                }}
                                className="p-0.5 text-white hover:text-amber-300 transition cursor-pointer"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Project Financial Stats */}
                        <div className="p-4 space-y-3">
                          <p className="text-xs text-slate-300 line-clamp-2">
                            {project.description || 'Verified PBC Club capital asset investment.'}
                          </p>

                          <div className="grid grid-cols-2 gap-2 bg-[#0B1528] p-3 rounded-xl border border-[#D4AF37]/20 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium uppercase">Investment Amount</span>
                              <span className="font-black text-amber-300 text-sm">
                                ৳{(project.investmentAmount || 0).toLocaleString()} BDT
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium uppercase">Current Valuation</span>
                              <span className="font-bold text-emerald-400 text-sm">
                                ৳{(project.currentValue || 0).toLocaleString()} BDT
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                            <span className="text-slate-400">
                              Expected Return: <span className="text-emerald-400 font-bold">+{project.expectedRoiPercent || 0}% ROI</span>
                            </span>
                            <button
                              onClick={() => setActivePreviewProject(project)}
                              className="text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition"
                            >
                              <span>View Full Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D4AF37]/20 bg-[#070D1B] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Authorized for PBC Club Members
              </span>
              <button
                onClick={() => {
                  setIsInvestmentsModalOpen(false);
                  setActiveTab('real_estate');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Go to Investment Portfolio
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Full Detailed Project Inspection Modal */}
      {activePreviewProject && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#0B1528] text-white rounded-3xl border border-[#D4AF37]/60 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Detailed Header */}
            <div className="p-4 sm:p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#070D1B]">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                  {activePreviewProject.category || 'Asset'} • {activePreviewProject.status || 'Active'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {activePreviewProject.projectName}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewProject(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-slate-700 hover:border-amber-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detailed Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Photo Banner */}
              <div className="h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 relative border border-[#D4AF37]/30 shadow-inner">
                <img
                  src={activePreviewProject.photos?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                  alt={activePreviewProject.projectName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#070D1B]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D4AF37]/40 flex items-center gap-1.5 text-xs text-amber-200">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">{activePreviewProject.address ? `${activePreviewProject.address}, ` : ''}{activePreviewProject.city}, {activePreviewProject.country}</span>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#070D1B] p-3 rounded-xl border border-[#D4AF37]/20">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Total Investment</span>
                  <span className="text-base font-black text-amber-300">
                    ৳{(activePreviewProject.investmentAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="bg-[#070D1B] p-3 rounded-xl border border-[#D4AF37]/20">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Current Valuation</span>
                  <span className="text-base font-black text-emerald-400">
                    ৳{(activePreviewProject.currentValue || 0).toLocaleString()}
                  </span>
                </div>

                <div className="bg-[#070D1B] p-3 rounded-xl border border-[#D4AF37]/20">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Expected Return</span>
                  <span className="text-base font-black text-amber-400">
                    +{activePreviewProject.expectedRoiPercent || 0}% ROI
                  </span>
                </div>

                <div className="bg-[#070D1B] p-3 rounded-xl border border-[#D4AF37]/20">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Investment Date</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {activePreviewProject.investmentDate || activePreviewProject.purchaseDate || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#070D1B] p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Project Description & Overview
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {activePreviewProject.description || 'Verified PBC Club capital asset investment and community growth venture.'}
                </p>
              </div>

              {/* PDF Documents */}
              {activePreviewProject.documents && activePreviewProject.documents.length > 0 && (
                <div className="bg-[#070D1B] p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                    Verified Documents
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePreviewProject.documents.map((doc: any, i: number) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{doc.name || `Document #${i + 1}`}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Footer */}
            <div className="p-4 border-t border-[#D4AF37]/20 bg-[#070D1B] flex justify-end">
              <button
                onClick={() => setActivePreviewProject(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
