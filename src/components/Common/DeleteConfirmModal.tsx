import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2, MessageSquare, ShieldAlert } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  title: string;
  itemName: string;
  itemType?: string;
  language?: 'en' | 'bn';
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'Item',
  language = 'bn'
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const quickReasons = language === 'bn' ? [
    'ভুল এন্ট্রি (Data Entry Error)',
    'দ্বৈত রেকর্ড (Duplicate Record)',
    'মেম্বার অনুরোধ (Member Request)',
    'অডিট সমস্যা (Audit Issue)',
    'অন্যান্য (Other)'
  ] : [
    'Data Entry Error',
    'Duplicate Record',
    'Member Request',
    'Audit Adjustment',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg(language === 'bn' ? 'ডিলিট করার কারণ প্রদান করা বাধ্যতামূলক।' : 'Providing a reason for deletion is mandatory.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      console.error('Delete confirmation error:', err);
      setErrorMsg(err?.message || (language === 'bn' ? 'ডিলিট করতে সমস্যা হয়েছে।' : 'Error performing deletion.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#070D1B] rounded-3xl p-6 max-w-md w-full border border-rose-500/40 relative shadow-2xl text-white space-y-5 border-x border-rose-500/30">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/40 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-rose-300 tracking-wide uppercase">
                {title || (language === 'bn' ? 'ডিলিট করার নিশ্চিতকরণ' : 'Confirm Deletion')}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'আইটেমটি ট্র্যাশ বক্সে স্থানান্তরিত হবে' : 'Item will be moved to Trash Box'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 bg-[#0B1528] hover:bg-slate-800 text-slate-400 hover:text-white rounded-full border border-[#D4AF37]/30 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="p-3.5 bg-[#0B1528] rounded-2xl border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[10px] uppercase text-rose-400 font-bold">{itemType} Details</span>
            <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {language === 'bn' ? 'ট্র্যাশে সংরক্ষিত হবে' : 'Move to Trash'}
            </span>
          </div>
          <p className="text-sm font-extrabold text-white tracking-wide break-words">
            {itemName}
          </p>
        </div>

        {/* Reason Mandatory Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-amber-300 text-xs font-bold mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'ডিলিট করার কারণ লিখুন (বাধ্যতামূলক) *' : 'Reason for Deletion (Required) *'}</span>
            </label>

            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={
                language === 'bn'
                  ? 'উদা: ভুল অ্যামাউন্ট ইনপুট অথবা মেম্বার অনুরোধে এন্ট্রি বাতিল করা হচ্ছে...'
                  : 'e.g. Incorrect entry amount or member requested record removal...'
              }
              className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-amber-500/40 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-rose-400 placeholder-slate-500"
            />

            {/* Quick Reason Pills */}
            <div className="mt-2.5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {language === 'bn' ? 'দ্রুত নির্বাচন করুন:' : 'Quick Select Reason:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickReasons.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setReason(qr)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                      reason === qr
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-[#0B1528] text-amber-200 border-[#D4AF37]/30 hover:border-amber-400'
                    }`}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-[#0B1528] hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-[#D4AF37]/30 transition cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className={`px-5 py-2.5 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 ${
                !reason.trim() || isSubmitting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border border-rose-400/40 shadow-rose-950/50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'ডিলিট হচ্ছে...' : 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ট্র্যাশে পাঠান (Delete)' : 'Move to Trash'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
