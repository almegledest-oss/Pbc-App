import React from 'react';
import { Member } from '../../types';
import { DigitalCard } from './DigitalCard';
import { X, ShieldCheck } from 'lucide-react';

interface DigitalMemberCardModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({ member, isOpen, onClose }) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#070D1B] border border-[#D4AF37]/40 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        
        {/* Header toolbar */}
        <div className="p-4 bg-[#0B1528] border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Official Member PVC ID Card
              </h3>
              <p className="text-[10px] text-amber-300/80 font-mono">
                CR80 PVC (85.60 × 53.98 mm) • 300 DPI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#070D1B] border border-[#D4AF37]/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Component */}
        <div className="p-6 flex flex-col items-center">
          <DigitalCard member={member} showAdminControls={true} />
        </div>

      </div>
    </div>
  );
};
