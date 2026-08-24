import React, { useState, useMemo } from 'react';
import { RealEstateProject, Member, Deposit, ProjectMemberAllocation } from '../../types';
import { 
  X, 
  Users, 
  DollarSign, 
  Check, 
  Search, 
  Percent, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Building2,
  CheckCircle2,
  RefreshCw,
  Wallet
} from 'lucide-react';

interface ProjectAllocationModalProps {
  project: RealEstateProject;
  members: Member[];
  deposits: Deposit[];
  onClose: () => void;
  onSave: (updatedAllocations: ProjectMemberAllocation[], totalAllocated: number) => void;
}

export const ProjectAllocationModal: React.FC<ProjectAllocationModalProps> = ({
  project,
  members,
  deposits,
  onClose,
  onSave
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'allocated' | 'unallocated'>('all');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Calculate actual approved deposit per member
  const memberDepositMap = useMemo(() => {
    const map = new Map<string, number>();
    
    // First from deposits table
    deposits
      .filter(d => d.status === 'Approved')
      .forEach(d => {
        const cur = map.get(d.memberId) || 0;
        map.set(d.memberId, cur + (Number(d.amount) || 0));
      });

    // Fallback from member.totalDeposit if deposits collection is empty for that member
    members.forEach(m => {
      if (!map.has(m.id) && m.totalDeposit > 0) {
        map.set(m.id, Number(m.totalDeposit) || 0);
      }
    });

    return map;
  }, [deposits, members]);

  // Initial state of allocations mapping memberId -> allocatedAmount
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (project.memberAllocations && project.memberAllocations.length > 0) {
      project.memberAllocations.forEach(alloc => {
        initial[alloc.memberId] = Number(alloc.allocatedAmount) || 0;
      });
    }
    return initial;
  });

  // Filter members who have a deposit > 0 or are already allocated
  const eligibleMembers = useMemo(() => {
    return members
      .map(m => {
        const availableDeposit = memberDepositMap.get(m.id) || 0;
        const currentAllocated = allocations[m.id] || 0;
        return {
          ...m,
          availableDeposit,
          currentAllocated
        };
      })
      .filter(m => m.availableDeposit > 0 || m.currentAllocated > 0);
  }, [members, memberDepositMap, allocations]);

  // Filter by search term & allocation tab
  const displayedMembers = useMemo(() => {
    return eligibleMembers.filter(m => {
      const matchesSearch = 
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm));

      if (!matchesSearch) return false;

      if (filterType === 'allocated') {
        return (allocations[m.id] || 0) > 0;
      }
      if (filterType === 'unallocated') {
        return (allocations[m.id] || 0) === 0;
      }
      return true;
    });
  }, [eligibleMembers, searchTerm, filterType, allocations]);

  // Summary Metrics
  const totalAllocatedAmount = useMemo(() => {
    return Object.values(allocations).reduce<number>((sum, amt) => sum + (Number(amt) || 0), 0);
  }, [allocations]);

  const allocatedMembersCount = useMemo(() => {
    return Object.values(allocations).filter((amt): amt is number => Number(amt) > 0).length;
  }, [allocations]);

  const totalClubDeposits = useMemo(() => {
    return Array.from(memberDepositMap.values()).reduce<number>((sum, amt) => sum + (Number(amt) || 0), 0);
  }, [memberDepositMap]);

  // Allocation Handlers
  const handleSetAmount = (memberId: string, amount: number) => {
    const validAmount = Math.max(0, Math.round(amount));
    setAllocations(prev => ({
      ...prev,
      [memberId]: validAmount
    }));
  };

  const handleBulkAllocate = (percentage: number) => {
    const updated: Record<string, number> = {};
    eligibleMembers.forEach(m => {
      if (percentage === 0) {
        updated[m.id] = 0;
      } else {
        updated[m.id] = Math.round(m.availableDeposit * (percentage / 100));
      }
    });
    setAllocations(updated);
  };

  const handleSave = () => {
    const finalAllocations: ProjectMemberAllocation[] = [];

    eligibleMembers.forEach(m => {
      const amount = allocations[m.id] || 0;
      if (amount > 0) {
        const sharePct = totalAllocatedAmount > 0 
          ? Number(((amount / totalAllocatedAmount) * 100).toFixed(2))
          : 0;

        finalAllocations.push({
          memberId: m.id,
          memberName: m.fullName,
          memberEmail: m.email,
          memberPhone: m.phone,
          allocatedAmount: amount,
          availableDeposit: m.availableDeposit,
          sharePercentage: sharePct,
          allocationDate: new Date().toISOString().split('T')[0]
        });
      }
    });

    onSave(finalAllocations, totalAllocatedAmount);
    setShowSuccessToast(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0B1528] text-white rounded-3xl border-2 border-[#D4AF37]/60 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/30 flex items-center justify-between bg-gradient-to-r from-[#070D1B] via-[#0E1C38] to-[#070D1B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 uppercase">
                  Dynamic Fund Allocation
                </span>
                <span className="text-xs text-slate-400">• {project.category}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {project.projectName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-[#070D1B] border border-slate-700 hover:border-amber-400 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Summary Stats Bar */}
        <div className="bg-[#070D1B] px-5 py-3 border-b border-[#D4AF37]/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0B1528] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Project Cost</span>
            <span className="text-sm sm:text-base font-black text-white font-mono">
              ৳{(project.investmentAmount || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-[#0B1528] p-2.5 rounded-xl border border-amber-500/40 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 uppercase font-semibold">Total Allocated</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
              ৳{totalAllocatedAmount.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#0B1528] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Investors Joined</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
              {allocatedMembersCount} / {eligibleMembers.length} Members
            </span>
          </div>

          <div className="bg-[#0B1528] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Club Capital</span>
            <span className="text-sm sm:text-base font-bold text-slate-300 font-mono">
              ৳{totalClubDeposits.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Bulk Action Buttons & Search Filter */}
        <div className="p-4 border-b border-slate-800 bg-[#0B1528] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide shrink-0">Quick Action:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleBulkAllocate(100)}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition cursor-pointer"
                title="Allocate 100% of each member's available deposit"
              >
                100% All Members
              </button>
              <button
                type="button"
                onClick={() => handleBulkAllocate(50)}
                className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold transition cursor-pointer"
                title="Allocate 50% of each member's available deposit"
              >
                50% All
              </button>
              <button
                type="button"
                onClick={() => handleBulkAllocate(0)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                title="Reset all member allocations to 0"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member name or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#070D1B] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center bg-[#070D1B] p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${filterType === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All ({eligibleMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('allocated')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${filterType === 'allocated' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Allocated ({allocatedMembersCount})
              </button>
            </div>
          </div>
        </div>

        {/* Member Allocation Rows List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {displayedMembers.length === 0 ? (
            <div className="p-10 text-center text-slate-400 bg-[#070D1B] rounded-2xl border border-slate-800">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold text-white">No Depositing Members Found</p>
              <p className="text-xs text-slate-400 mt-1">
                Ensure members have approved deposits in the club account to allocate them to this investment.
              </p>
            </div>
          ) : (
            displayedMembers.map(m => {
              const allocated = allocations[m.id] || 0;
              const isAllocated = allocated > 0;
              const sharePct = totalAllocatedAmount > 0 
                ? ((allocated / totalAllocatedAmount) * 100).toFixed(1)
                : '0.0';

              return (
                <div
                  key={m.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                    isAllocated
                      ? 'bg-[#0E1C38] border-amber-500/60 shadow-lg'
                      : 'bg-[#070D1B] border-slate-800/80 hover:border-slate-700 opacity-80'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Member Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={m.fullName}
                          className="w-11 h-11 rounded-xl object-cover border border-amber-400/40"
                        />
                        {isAllocated && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{m.fullName}</h4>
                          <span className="px-2 py-0.5 bg-[#070D1B] text-amber-300 font-mono text-[10px] font-bold rounded border border-amber-400/30">
                            {m.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-0.5">
                          <span className="text-slate-400">
                            Available Deposit: <strong className="text-white font-mono">৳{m.availableDeposit.toLocaleString()}</strong>
                          </span>
                          {isAllocated && (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <Percent className="w-3 h-3" />
                              {sharePct}% Share
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Allocation Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Quick Percentage Presets */}
                      <div className="flex items-center gap-1 bg-[#070D1B] p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleSetAmount(m.id, m.availableDeposit)}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="Allocate 100% of this member's deposit"
                        >
                          100% Full
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetAmount(m.id, Math.round(m.availableDeposit * 0.5))}
                          className="px-2 py-1 hover:bg-slate-800 text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="Allocate 50%"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetAmount(m.id, Math.round(m.availableDeposit * 0.25))}
                          className="px-2 py-1 hover:bg-slate-800 text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="Allocate 25%"
                        >
                          25%
                        </button>
                        {isAllocated && (
                          <button
                            type="button"
                            onClick={() => handleSetAmount(m.id, 0)}
                            className="px-2 py-1 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            title="Remove from this project"
                          >
                            ৳0
                          </button>
                        )}
                      </div>

                      {/* Manual Amount Input */}
                      <div className="relative w-36">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 font-mono">
                          ৳
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={m.availableDeposit}
                          step="1000"
                          value={allocated || ''}
                          placeholder="0"
                          onChange={e => handleSetAmount(m.id, Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-1.5 bg-[#070D1B] border border-amber-500/40 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400 text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D4AF37]/30 bg-gradient-to-r from-[#070D1B] via-[#0E1C38] to-[#070D1B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            <span>Allocated: </span>
            <strong className="text-amber-300 font-mono font-bold text-sm">
              ৳{totalAllocatedAmount.toLocaleString()}
            </strong>
            <span className="text-slate-400"> ({allocatedMembersCount} Expat Investors Participating)</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Confirm & Save Allocations</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
