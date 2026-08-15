import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Users, Building2, Wallet, ArrowRight } from 'lucide-react';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    members, 
    projects, 
    deposits, 
    setActiveTab, 
    setSelectedMemberId 
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const matchedMembers = query.trim() 
    ? members.filter(m => 
        m.fullName.toLowerCase().includes(query.toLowerCase()) ||
        m.id.toLowerCase().includes(query.toLowerCase()) ||
        m.phone.includes(query)
      )
    : [];

  const matchedProjects = query.trim()
    ? projects.filter(p =>
        p.projectName.toLowerCase().includes(query.toLowerCase()) ||
        p.city.toLowerCase().includes(query.toLowerCase()) ||
        p.country.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedDeposits = query.trim()
    ? deposits.filter(d =>
        d.id.toLowerCase().includes(query.toLowerCase()) ||
        d.memberName.toLowerCase().includes(query.toLowerCase()) ||
        d.referenceNumber.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="bg-[#0B1528] text-white rounded-3xl max-w-xl w-full border-2 border-[#D4AF37]/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-[#070D1B] border-b border-[#D4AF37]/30 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search Member ID, Name, Phone, Real Estate Project..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-[#0B1528] border border-[#D4AF37]/30 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {!query.trim() && (
            <p className="text-slate-400 text-center py-8">
              Type to search across members, deposit vouchers, or real estate projects.
            </p>
          )}

          {/* Members Results */}
          {matchedMembers.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Members ({matchedMembers.length})</span>
              </div>
              <div className="space-y-1">
                {matchedMembers.map(m => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMemberId(m.id);
                      setActiveTab('members');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[#070D1B] hover:bg-[#112244] border border-[#D4AF37]/20 hover:border-amber-400 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <PBCFramedAvatar photoUrl={m.photoUrl} name={m.fullName} alt={m.fullName} className="w-8 h-8 rounded-full object-cover border border-amber-400/40" />
                      <div>
                        <span className="font-bold text-white block">{m.fullName}</span>
                        <span className="text-[10px] text-slate-400">{m.id} • {m.country}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Estate Projects Results */}
          {matchedProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Real Estate Projects ({matchedProjects.length})</span>
              </div>
              <div className="space-y-1">
                {matchedProjects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveTab('real_estate');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[#070D1B] hover:bg-[#112244] border border-[#D4AF37]/20 hover:border-amber-400 flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <span className="font-bold text-white block">{p.projectName}</span>
                      <span className="text-[10px] text-slate-400">{p.city}, {p.country} • {p.propertyType}</span>
                    </div>
                    <span className="font-bold text-emerald-400">৳{p.currentValue.toLocaleString()} BDT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deposits Results */}
          {matchedDeposits.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>Deposits ({matchedDeposits.length})</span>
              </div>
              <div className="space-y-1">
                {matchedDeposits.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setActiveTab('deposits');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[#070D1B] hover:bg-[#112244] border border-[#D4AF37]/20 hover:border-amber-400 flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <span className="font-bold text-white block">{d.memberName}</span>
                      <span className="text-[10px] text-slate-400">{d.id} • {d.paymentMethod}</span>
                    </div>
                    <span className="font-bold text-amber-300">+৳{d.amount.toLocaleString()} BDT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
