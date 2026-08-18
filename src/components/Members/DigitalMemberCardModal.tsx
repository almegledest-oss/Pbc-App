import React, { useEffect } from 'react';
import { Member } from '../../types';
import { DigitalCard } from './DigitalCard';
import { X, ShieldCheck } from 'lucide-react';

interface DigitalMemberCardModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({ member, isOpen, onClose }) => {
  // Allow closing via Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  return (
    <div
      id="digital-card-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="digital-card-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#070D1B] border border-[#D4AF37]/50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white my-auto max-h-[92vh] flex flex-col relative"
      >
        
        {/* Header toolbar (sticky at top) */}
        <div className="p-3.5 sm:p-4 bg-[#0B1528] border-b border-[#D4AF37]/30 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white">
                Official Member PVC ID Card
              </h3>
              <p className="text-[9px] sm:text-[10px] text-amber-300/90 font-mono">
                CR80 PVC (85.60 × 53.98 mm) • Print & Cut Ready
              </p>
            </div>
          </div>
          <button
            id="close-card-modal-btn"
            onClick={onClose}
            aria-label="Close Modal"
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-200 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 hover:border-amber-400 transition cursor-pointer active:scale-95 text-xs font-bold"
          >
            <span>Close (বন্ধ করুন)</span>
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Card Component (Scrollable on small screens) */}
        <div className="p-3 sm:p-6 flex flex-col items-center overflow-y-auto">
          <DigitalCard member={member} showAdminControls={true} />
        </div>

        {/* Footer Quick Close for Mobile */}
        <div className="p-3 bg-[#0B1528]/80 border-t border-[#D4AF37]/20 flex items-center justify-center sm:hidden shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-600 text-xs font-bold flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 text-amber-400" />
            <span>Close Modal (পপআপ বন্ধ করুন)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

