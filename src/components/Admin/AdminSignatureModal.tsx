import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, PenTool, RotateCcw, X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { Deposit } from '../../types';

interface AdminSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: Deposit | null;
  onConfirmApprove: (signatureDataUrl: string) => Promise<void>;
}

export const AdminSignatureModal: React.FC<AdminSignatureModalProps> = ({
  isOpen,
  onClose,
  deposit,
  onConfirmApprove
}) => {
  const { language, currentMember, authUser, role, triggerSecurityAlert } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'typed'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Determine admin name and ID
  const adminName = currentMember?.fullName || authUser?.displayName || (role === 'super_admin' ? 'Super Admin' : 'PBC Admin');
  const adminId = currentMember?.id || (role === 'super_admin' ? 'PBC-00001' : 'PBC-ADMIN');

  useEffect(() => {
    if (isOpen) {
      setHasDrawn(false);
      setErrorMsg('');
      setTypedSignature(adminName);
      // Wait for canvas element to render
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [isOpen, adminName]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#F59E0B'; // Amber gold ink
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear background
    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  if (!isOpen || !deposit) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMsg('');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  // Generate signature as data URL
  const generateSignatureImage = (): string => {
    if (signatureMode === 'draw' && hasDrawn && canvasRef.current) {
      return canvasRef.current.toDataURL('image/png');
    }

    // Generate canvas from typed text signature
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400;
    tempCanvas.height = 120;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, 400, 120);
      ctx.font = 'bold italic 32px "Brush Script MT", "Dancing Script", cursive, Georgia, serif';
      ctx.fillStyle = '#F59E0B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignature || adminName, 200, 50);

      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`VERIFIED ID: ${adminId}`, 200, 95);
    }
    return tempCanvas.toDataURL('image/png');
  };

  const handleSubmit = async () => {
    const isOwn = currentMember && deposit && (
      deposit.memberId === currentMember.id || 
      (deposit.memberName && currentMember.fullName && deposit.memberName.toLowerCase().trim() === currentMember.fullName.toLowerCase().trim()) ||
      (authUser?.email && deposit.memberEmail && deposit.memberEmail.toLowerCase().trim() === authUser.email.toLowerCase().trim())
    );

    if (isOwn) {
      triggerSecurityAlert();
      onClose();
      return;
    }

    if (signatureMode === 'draw' && !hasDrawn) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে ক্যানভাসে আপনার সাক্ষর প্রদান করুন অথবা টাইপড সাক্ষর নির্বাচন করুন।' : 'Please draw your signature on the canvas or switch to typed signature.');
      return;
    }

    if (signatureMode === 'typed' && !typedSignature.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে এডমিন সাক্ষর নাম লিখুন।' : 'Please enter signature name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const sigDataUrl = generateSignatureImage();
      await onConfirmApprove(sigDataUrl);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Signature authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#070D1B] border-2 border-[#D4AF37]/50 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-white my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-[#D4AF37]/30 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#D4AF37]/30">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
              OFFICIAL DEPOSIT AUDIT
            </span>
            <h3 className="text-base font-black text-white mt-0.5">
              {language === 'bn' ? 'ডিপোজিট অডিট অনুমোদন ও সাক্ষর প্রদান' : 'Deposit Audit Approval & Signature Authorization'}
            </h3>
          </div>
        </div>

        {/* Deposit & Admin Summary Box */}
        <div className="bg-[#0B1528] p-3.5 rounded-2xl border border-[#D4AF37]/30 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Approving Admin (অনুমোদনকারী):</span>
              <span className="font-bold text-amber-300 text-xs">{adminName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Admin Member ID:</span>
              <span className="font-mono font-black text-amber-400 text-xs">{adminId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400">Voucher ID:</span>
              <span className="font-mono font-bold text-white ml-1">{deposit.id}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Amount:</span>
              <span className="font-mono font-black text-emerald-400 text-xs ml-1">৳{deposit.amount.toLocaleString()} BDT</span>
            </div>
            <div>
              <span className="text-slate-400">Member:</span>
              <span className="font-bold text-slate-200 ml-1">{deposit.memberName} ({deposit.memberId})</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Method:</span>
              <span className="font-bold text-amber-300 ml-1">{deposit.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-between text-xs font-bold pt-1">
          <span className="text-slate-300 flex items-center gap-1.5">
            <PenTool className="w-4 h-4 text-amber-400" />
            {language === 'bn' ? 'এডমিন অফিশিয়াল সাক্ষর (Admin Signature)' : 'Admin Official Signature'}
          </span>
          <div className="flex bg-[#0B1528] p-1 rounded-xl border border-[#D4AF37]/30">
            <button
              type="button"
              onClick={() => setSignatureMode('draw')}
              className={`px-3 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                signatureMode === 'draw' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'অঙ্কন করুন (Draw)' : 'Draw'}
            </button>
            <button
              type="button"
              onClick={() => setSignatureMode('typed')}
              className={`px-3 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                signatureMode === 'typed' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'টাইপড সাক্ষর (Typed)' : 'Typed'}
            </button>
          </div>
        </div>

        {/* Signature Box */}
        {signatureMode === 'draw' ? (
          <div className="space-y-2">
            <div className="relative bg-[#040914] border-2 border-dashed border-[#D4AF37]/50 rounded-2xl overflow-hidden group">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-28 cursor-crosshair touch-none"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500 text-xs">
                  <PenTool className="w-5 h-5 mb-1 text-amber-500/50" />
                  <span>{language === 'bn' ? 'মাউস বা আঙুল দিয়ে এখানে আপনার সাক্ষর করুন' : 'Draw your official signature here'}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">
                {language === 'bn' ? 'সাক্ষরটি অফিশিয়াল মানি রিসিটে সংরক্ষিত হবে' : 'Signature will be permanently stored on receipt'}
              </span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                {language === 'bn' ? 'পুনরায় আঁকুন (Clear)' : 'Clear Signature'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Enter signature name"
              className="w-full p-3 bg-[#040914] border border-[#D4AF37]/50 rounded-2xl text-amber-300 font-serif italic text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <p className="text-[10px] text-slate-400 text-center">
              {language === 'bn' ? 'টাইপ করা সাক্ষরটি স্টাইলিশ ক্যালাইগ্রাফি ফন্টে মানি রিসিটে প্রিন্ট হবে।' : 'Typed signature will be rendered in official script font on receipt.'}
            </p>
          </div>
        )}

        {/* Notice Box */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
          <p className="font-bold text-amber-300 mb-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            {language === 'bn' ? 'স্থায়ী রেকর্ডিং সতর্কতা:' : 'Permanent Audit Record:'}
          </p>
          {language === 'bn'
            ? `এই ডিপোজিটটি অনুমোদিত হলে আপনার সাক্ষর এবং এডমিন আইডি (${adminId}) এই মানি রিসিটের সাথে চিরস্থায়ীভাবে (Permanently) যুক্ত হয়ে যাবে। পরবর্তীতে যেকোনো পেজ থেকে এটি ডাউনলোড বা ভিউ করা হলেও এটি অপরিবর্তিত থাকবে।`
            : `Once approved, your signature and Admin ID (${adminId}) will be permanently linked to this deposit receipt. It will remain immutable for all future views and downloads.`
          }
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-1/3 py-2.5 bg-[#0B1528] hover:bg-[#112244] text-slate-300 font-bold text-xs rounded-xl border border-[#D4AF37]/30 transition cursor-pointer"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-2/3 py-2.5 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {language === 'bn' ? 'সাক্ষর সহ অডিট অনুমোদন করুন' : 'Confirm & Sign Deposit Approval'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
