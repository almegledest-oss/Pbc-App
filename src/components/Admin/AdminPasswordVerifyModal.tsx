import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Deposit } from '../../types';

interface AdminPasswordVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: Deposit | null;
  actionType: 'approve' | 'reject' | null;
  onSuccess: () => Promise<void>;
}

export const AdminPasswordVerifyModal: React.FC<AdminPasswordVerifyModalProps> = ({
  isOpen,
  onClose,
  deposit,
  actionType,
  onSuccess
}) => {
  const { verifyAdminPassword, language } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !deposit || !actionType) return null;

  const handleVerifyAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আপনার এডমিন লগইন পাসওয়ার্ড প্রবেশ করান।' : 'Please enter your admin login password.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        await onSuccess();
        setPassword('');
        setErrorMsg('');
        onClose();
      } else {
        setErrorMsg(
          language === 'bn' 
            ? 'ভুল পাসওয়ার্ড! আপনার সঠিক এডমিন লগইন পাসওয়ার্ড প্রদান করুন।' 
            : 'Incorrect password! Please enter your valid admin login password.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const isApprove = actionType === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#070D1B] border-2 border-[#D4AF37]/50 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-white my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-[#D4AF37]/30 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-[#D4AF37]/30">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isApprove 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
              : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
              Admin Audit Authorization
            </span>
            <h3 className="text-base font-black text-white mt-0.5">
              {isApprove
                ? (language === 'bn' ? 'ডিপোজিট অডিট অনুমোদন' : 'Approve Deposit Voucher')
                : (language === 'bn' ? 'ডিপোজিট অডিট বাতিল' : 'Reject Deposit Voucher')
              }
            </h3>
          </div>
        </div>

        {/* Deposit Summary Box */}
        <div className="bg-[#0B1528] p-3.5 rounded-2xl border border-[#D4AF37]/30 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Voucher ID:</span>
            <span className="font-mono font-bold text-amber-300">{deposit.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Member:</span>
            <span className="font-bold text-white">{deposit.memberName} <span className="text-slate-400">({deposit.memberId})</span></span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Amount (পরিমাণ):</span>
            <span className="font-mono font-black text-emerald-400 text-sm">৳{deposit.amount.toLocaleString()} BDT</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">Payment Method:</span>
            <span className="text-amber-300 font-bold">{deposit.paymentMethod}</span>
          </div>
        </div>

        <form onSubmit={handleVerifyAndProceed} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-300">
                <Lock className="w-3.5 h-3.5" />
                {language === 'bn' ? 'এডমিন লগইন পাসওয়ার্ড লিখুন *' : 'Enter Admin Password *'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড প্রবেশ করান' : 'Enter your password'}
                className="w-full pl-3 pr-10 py-2.5 bg-[#0B1528] border border-[#D4AF37]/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'bn' 
                ? 'অডিট সম্পন্ন করার জন্য আপনার নিজস্ব এডমিন লগইন পাসওয়ার্ড দ্বারা ভেরিফাই করা আবশ্যক।' 
                : 'Your unique admin login password is required to authorize audit operations.'
              }
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="w-1/2 py-2.5 bg-[#0B1528] hover:bg-[#112244] text-slate-300 font-bold text-xs rounded-xl border border-[#D4AF37]/30 transition"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className={`w-1/2 py-2.5 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer ${
                isApprove 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isApprove 
                      ? (language === 'bn' ? 'অনুমোদন করুন' : 'Confirm Approval') 
                      : (language === 'bn' ? 'বাতিল করুন' : 'Confirm Rejection')
                    }
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
