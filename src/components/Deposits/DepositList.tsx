import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Deposit } from '../../types';
import { DepositReceiptModal } from './DepositReceiptModal';
import { AdminSignatureModal } from '../Admin/AdminSignatureModal';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';
import { compressImageToDataUrl } from '../../services/firebaseService';
import { 
  Wallet, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  DollarSign, 
  CreditCard,
  Building,
  Edit3,
  Trash2,
  Printer,
  Check,
  XCircle,
  Upload,
  Image as ImageIcon,
  ShieldAlert,
  ArrowRight,
  Lock
} from 'lucide-react';

export const DepositList: React.FC = () => {
  const { 
    deposits, 
    addDeposit, 
    deleteDeposit, 
    deleteDepositWithReason,
    approveDeposit,
    rejectDeposit,
    members, 
    language, 
    role, 
    switchRoleMode,
    currentMember,
    authUser,
    triggerSecurityAlert
  } = useApp();

  const labels = t[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminNoticeOpen, setIsAdminNoticeOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Deposit | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [signatureModalDeposit, setSignatureModalDeposit] = useState<Deposit | null>(null);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    memberId: members[0]?.id || 'PBC-1001',
    amount: 5000,
    currency: 'BDT' as const,
    depositDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank' as const,
    referenceNumber: `TXN-BD-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: 'Monthly Capital Contribution'
  });

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      try {
        const compressed = await compressImageToDataUrl(file, 800, 0.7);
        setReceiptPreview(compressed);
      } catch (err) {
        console.warn('Receipt compression failed, falling back to raw reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Filter deposits based on role: if Member role, show only their own deposits or all if admin
  const userDeposits = role === 'member' 
    ? deposits.filter(d => d.memberId === currentMember?.id)
    : deposits;

  const filteredDeposits = userDeposits.filter(d => {
    const matchesSearch = 
      d.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'All' || d.paymentMethod === methodFilter;
    const matchesCurrency = currencyFilter === 'All' || d.currency === currencyFilter;

    return matchesSearch && matchesMethod && matchesCurrency;
  });

  const totalFilteredAmount = filteredDeposits.reduce((sum, d) => sum + d.amount, 0);

  const handleAddDepositClick = () => {
    if (role === 'admin' || role === 'super_admin') {
      // Prompt admin to switch to member mode to deposit
      setIsAdminNoticeOpen(true);
    } else {
      if (currentMember) {
        setFormData(prev => ({
          ...prev,
          memberId: currentMember.id
        }));
      }
      setIsAddModalOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMemberId = role === 'member' && currentMember ? currentMember.id : formData.memberId;
    const memberObj = members.find(m => m.id === targetMemberId) || currentMember || members[0];

    if (!memberObj) {
      alert('Error: Member record not found.');
      return;
    }

    const isMemberSubmit = role === 'member';

    addDeposit({
      memberId: memberObj.id,
      memberName: memberObj.fullName,
      amount: Number(formData.amount),
      currency: formData.currency,
      depositDate: formData.depositDate,
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes,
      receiptUrl: receiptPreview || undefined,
      status: isMemberSubmit ? 'pending' : 'Approved',
      approvedByAdminName: isMemberSubmit ? undefined : (currentMember?.fullName || 'PBC Admin'),
      approvedByAdminId: isMemberSubmit ? undefined : (currentMember?.id || 'PBC-ADMIN')
    });

    setIsAddModalOpen(false);

    if (isMemberSubmit) {
      alert(`আপনার জমা ভাউচার (৳${Number(formData.amount).toLocaleString()} BDT) এবং মানি রিসিট সফলভাবে জমা হয়েছে!\n\nএটি প্রশাসনিক অডিটের (Admin Verification) জন্য "Pending Deposit Vouchers" সেকশনে জমা রয়েছে। অ্যাডমিন অনুমোদন (Approve) করলে আপনার একাউন্টের মেইন ব্যালেন্সে যুক্ত হবে।`);
    } else {
      alert('Deposit recorded successfully.');
    }

    setFormData({
      memberId: currentMember?.id || members[0]?.id || 'PBC-1001',
      amount: 5000,
      currency: 'BDT',
      depositDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Wire',
      referenceNumber: `TXN-BD-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: isMemberSubmit ? 'Monthly Capital Contribution' : 'Real Estate Capital Fund Injection'
    });
    setReceiptPreview('');
  };

  const exportToCsv = () => {
    const headers = ['Deposit ID', 'Member ID', 'Member Name', 'Amount BDT', 'Currency', 'Date', 'Method', 'Ref Number', 'Status'];
    const rows = filteredDeposits.map(d => [
      d.id, d.memberId, `"${d.memberName}"`, d.amount, d.currency, d.depositDate, d.paymentMethod, d.referenceNumber, d.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PBC_Deposits_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            {labels.depositHistory}
          </h2>
          <p className="text-xs text-slate-300">
            Comprehensive ledger of member capital contributions & bank receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'super_admin' || role === 'admin') && (
            <button
              onClick={exportToCsv}
              className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-[48px] bg-[#0B1528] hover:bg-[#112244] text-amber-300 text-xs font-bold rounded-xl border border-[#D4AF37]/50 transition shrink-0 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{labels.exportCsv}</span>
            </button>
          )}

          {((role === 'super_admin' || role === 'admin') || (role === 'member' && currentMember?.status === 'active')) && (
            <button
              onClick={handleAddDepositClick}
              className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {role === 'member'
                  ? (language === 'bn' ? 'জমা ভাউচার দিন' : 'Submit Deposit Voucher')
                  : (language === 'bn' ? 'জমা যুক্ত করুন' : 'Add Deposit')}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Banner Card */}
      <div className="bg-[#0B1528] p-5 rounded-3xl border border-[#D4AF37]/40 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30">
            <Wallet className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-xs text-amber-300/80 font-bold tracking-wider uppercase">FILTERED LEDGER TOTAL</span>
            <h3 className="text-2xl font-black text-amber-300 mt-0.5">
              ৳{totalFilteredAmount.toLocaleString()} BDT
            </h3>
          </div>
        </div>

        {(role === 'super_admin' || role === 'admin') && (
          <span className="text-xs font-mono bg-[#070D1B] px-3 py-1.5 rounded-xl text-amber-300 border border-[#D4AF37]/30 hidden sm:inline-block font-bold">
            {filteredDeposits.length} Records
          </span>
        )}
      </div>

      {/* Filter & Search Controls */}
      {(role === 'super_admin' || role === 'admin') && (
        <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder="Search Deposit ID, Member, Ref No..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 touch-pan-x">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
            >
              <option value="All" className="bg-[#070D1B] text-white">All Payment Methods</option>
              <option value="Bank Wire" className="bg-[#070D1B] text-white">Bank Wire</option>
              <option value="bKash/Nagad" className="bg-[#070D1B] text-white">bKash/Nagad</option>
              <option value="Wise" className="bg-[#070D1B] text-white">Wise</option>
              <option value="Stripe/Card" className="bg-[#070D1B] text-white">Stripe/Card</option>
              <option value="Cheque" className="bg-[#070D1B] text-white">Cheque</option>
            </select>

            <select
              value={currencyFilter}
              onChange={e => setCurrencyFilter(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
            >
              <option value="All" className="bg-[#070D1B] text-white">All Currencies</option>
              <option value="BDT" className="bg-[#070D1B] text-white">BDT (৳)</option>
            </select>
          </div>
        </div>
      )}

      {/* Deposits Table */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 shadow-xl overflow-hidden">
        <div className="overflow-x-auto touch-pan-x overscroll-x-contain">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070D1B] text-amber-300 font-bold border-b border-[#D4AF37]/30 uppercase tracking-wider">
                {(role === 'super_admin' || role === 'admin') && <th className="py-4 px-4">{labels.depositId}</th>}
                <th className="py-4 px-4">{labels.memberName}</th>
                <th className="py-4 px-4">{labels.amount}</th>
                <th className="py-4 px-4">{labels.depositDate}</th>
                {(role === 'super_admin' || role === 'admin') && <th className="py-4 px-4">{labels.paymentMethod}</th>}
                {(role === 'super_admin' || role === 'admin') && <th className="py-4 px-4">{labels.referenceNumber}</th>}
                <th className="py-4 px-4">{labels.status}</th>
                <th className="py-4 px-4 text-right">{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {filteredDeposits.map((d) => (
                <tr key={d.id} className="hover:bg-[#112244] transition">
                  {(role === 'super_admin' || role === 'admin') && (
                    <td className="py-4 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                      {d.id}
                    </td>
                  )}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-bold text-white block">
                      {d.memberName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.memberId}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-extrabold text-amber-300">
                      ৳{d.amount.toLocaleString()} BDT
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                    {d.depositDate}
                  </td>
                  {(role === 'super_admin' || role === 'admin') && (
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#070D1B] text-amber-200 border border-[#D4AF37]/20 font-medium">
                        {d.paymentMethod}
                      </span>
                    </td>
                  )}
                  {(role === 'super_admin' || role === 'admin') && (
                    <td className="py-4 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {d.referenceNumber}
                    </td>
                  )}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full capitalize ${
                      d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : d.status?.toLowerCase() === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {(role === 'super_admin' || role === 'admin') && (
                        <>
                          <button
                            onClick={() => {
                              const isOwn = currentMember && (
                                d.memberId === currentMember.id || 
                                (d.memberName && currentMember.fullName && d.memberName.toLowerCase().trim() === currentMember.fullName.toLowerCase().trim()) ||
                                (authUser?.email && d.memberEmail && d.memberEmail.toLowerCase().trim() === authUser.email.toLowerCase().trim())
                              );
                              if (isOwn) {
                                triggerSecurityAlert();
                                return;
                              }
                              setSignatureModalDeposit(d);
                            }}
                            className={`min-w-[40px] min-h-[40px] p-2 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer ${
                              d.status?.toLowerCase() === 'approved'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950'
                            }`}
                            title={language === 'bn' ? "সাক্ষর সহ অনুমোদন করুন" : "Approve Deposit with Signature"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(language === 'bn' ? 'আপনি কি এই ডিপোজিটটি বাতিল করতে নিশ্চিত?' : 'Are you sure you want to reject this deposit?')) {
                                await rejectDeposit(d.id);
                              }
                            }}
                            className={`min-w-[40px] min-h-[40px] p-2 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer ${
                              d.status?.toLowerCase() === 'rejected'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white'
                            }`}
                            title="Reject Deposit (বাতিল করুন)"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {((role === 'super_admin' || role === 'admin') || d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'active') ? (
                        <>
                          {d.receiptUrl && (
                            <button
                              onClick={() => setSelectedReceipt(d)}
                              className="min-h-[40px] px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition border border-amber-500/30 active:scale-95 cursor-pointer"
                              title={language === 'bn' ? "মানি রিসিট স্লিপ দেখুন" : "View Money Receipt Image"}
                            >
                              <ImageIcon className="w-4 h-4 text-amber-400" />
                              <span>{language === 'bn' ? 'মানি রিসিট' : 'Receipt Image'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedReceipt(d)}
                            className="min-h-[40px] px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-1.5 text-xs transition border border-emerald-500/40 shadow-sm cursor-pointer active:scale-95"
                            title={language === 'bn' ? "অফিসিয়াল জমা রসিদ ডাউনলোড / দেখুন" : "View & Download Official Receipt"}
                          >
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span>{language === 'bn' ? 'রসিদ (Receipt)' : 'Receipt'}</span>
                          </button>
                        </>
                      ) : (
                        <div 
                          className="min-h-[40px] px-3 py-2 bg-[#070D1B] text-slate-400 font-semibold rounded-xl flex items-center justify-center gap-1.5 text-xs border border-[#D4AF37]/20 cursor-not-allowed"
                          title={language === 'bn' ? "অ্যাডমিন অনুমোদনের পর মানি রিসিট পাবেন" : "Receipt available after admin approval"}
                        >
                          <Lock className="w-3.5 h-3.5 opacity-60 text-amber-400" />
                          <span>{language === 'bn' ? (d.status?.toLowerCase() === 'rejected' ? 'বাতিলকৃত' : 'অনুমোদনের অপেক্ষায়') : (d.status?.toLowerCase() === 'rejected' ? 'Rejected' : 'Pending Approval')}</span>
                        </div>
                      )}

                      {(role === 'super_admin' || role === 'admin') && (
                        <button
                          onClick={() => setDepositToDelete(d)}
                          className="min-w-[40px] min-h-[40px] p-2 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 flex items-center justify-center active:scale-95 border border-transparent hover:border-rose-500/30"
                          title="Delete Deposit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Deposit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#070D1B] rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/40 relative shadow-2xl text-white my-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-[#D4AF37]/30 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center justify-between pr-8">
              <span>
                {role === 'member' 
                  ? (language === 'bn' ? 'জমা ভাউচার প্রেরণ করুন' : 'Submit Deposit Voucher') 
                  : (language === 'bn' ? 'ক্যাপিটাল জমা রেকর্ড করুন' : 'Record Member Capital Deposit')}
              </span>
              {role === 'member' && (
                <span className="text-[11px] px-2.5 py-0.5 font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  {language === 'bn' ? 'যাচাইকরণের অপেক্ষায়' : 'Pending Verification'}
                </span>
              )}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  {role === 'member' 
                    ? (language === 'bn' ? 'মেম্বার তথ্য' : 'Member Details') 
                    : (language === 'bn' ? 'মেম্বার নির্বাচন করুন *' : 'Select Member *')}
                </label>
                {role === 'member' && currentMember ? (
                  <div className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center justify-between">
                    <span>{currentMember.fullName} ({currentMember.id})</span>
                    <span className="text-[10px] font-mono bg-emerald-600/80 text-white px-2 py-0.5 rounded-md">Active Member</span>
                  </div>
                ) : (
                  <select
                    value={formData.memberId}
                    onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#0B1528] text-white">
                        {m.fullName} ({m.id} - {m.country})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-amber-300 font-bold mb-1">
                    {language === 'bn' ? 'জমার পরিমাণ (BDT) *' : 'Deposit Amount (BDT) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount === 0 ? '' : formData.amount}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, amount: val === '' ? 0 : Number(val) });
                    }}
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-[#D4AF37]/40 rounded-xl text-amber-300 font-black text-base focus:outline-none focus:border-amber-400"
                  />
                  {/* Preset Quick Select Amount Buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[5000, 10000, 25000, 50000, 100000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormData({ ...formData, amount: amt })}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                          formData.amount === amt
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-[#0B1528] text-amber-200 border-[#D4AF37]/30 hover:border-amber-400'
                        }`}
                      >
                        ৳{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-amber-300 font-semibold mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white"
                  >
                    <option value="BDT" className="bg-[#0B1528] text-white">BDT (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white font-medium"
                  >
                    <option value="Bank" className="bg-[#0B1528]">Bank</option>
                    <option value="bKash" className="bg-[#0B1528]">bKash</option>
                    <option value="Nagad" className="bg-[#0B1528]">Nagad</option>
                    <option value="Bank Wire" className="bg-[#0B1528]">Bank Wire</option>
                    <option value="Wise" className="bg-[#0B1528]">Wise</option>
                    <option value="Cheque" className="bg-[#0B1528]">Cheque</option>
                    <option value="Cash" className="bg-[#0B1528]">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Deposit Date</label>
                  <input
                    type="date"
                    value={formData.depositDate}
                    onChange={e => setFormData({ ...formData, depositDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  Bank Reference No / Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.referenceNumber}
                  onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white font-mono"
                  placeholder="e.g. TXN98726352"
                />
              </div>

              {/* Upload Money Receipt Voucher */}
              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  {language === 'bn' ? 'মানি রিসিট / জমা স্লিপের ছবি আপলোড করুন' : 'Upload Money Receipt / Voucher Image'}
                </label>
                <div className="border-2 border-dashed border-[#D4AF37]/40 rounded-2xl p-3 text-center hover:border-amber-400 transition bg-[#0B1528]">
                  {receiptPreview ? (
                    <div className="relative inline-block">
                      <img src={receiptPreview} alt="Receipt Voucher Preview" className="max-h-36 rounded-xl border border-[#D4AF37]/40 shadow-md object-contain" />
                      <button
                        type="button"
                        onClick={() => setReceiptPreview('')}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1 py-1">
                      <Upload className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold text-amber-200">
                        {language === 'bn' ? 'ব্যাংক জমা স্লিপ বা রিসিট ছবি আপলোড করুন' : 'Click or Drag to Upload Receipt Image'}
                      </span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B1528] border border-[#D4AF37]/30 rounded-xl text-white"
                  placeholder="Monthly deposit or project capital details"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#0B1528] border border-[#D4AF37]/30 text-slate-300 hover:text-white font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {role === 'member'
                      ? (language === 'bn' ? 'জমা ভাউচার দিন' : 'Submit Voucher')
                      : (language === 'bn' ? 'জমা তৈরি করুন' : 'Record Deposit')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Deposit Notice Modal (Redirect to Member Mode) */}
      {isAdminNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#070D1B] border border-[#D4AF37]/40 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 text-white my-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                অ্যাডমিন মোডে সরাসরি জমা তৈরি বন্ধ
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                অ্যাডমিন প্যানেল মোড থেকে সরাসরি ডিপোজিট এন্ট্রি নিষ্ক্রিয় করা হয়েছে। নিজের জমার টাকা পাঠাতে ও ভাউচার আপলোড করতে ওপরের সুইচ থেকে <strong>Member Mode (মেম্বার মোড)</strong>-এ গিয়ে জমা ভাউচার তৈরি করুন।
              </p>
            </div>

            <div className="p-3 bg-[#0B1528] border border-[#D4AF37]/30 rounded-2xl text-left text-xs space-y-1">
              <span className="font-bold text-amber-300 block">কার্যপ্রণালী (Steps):</span>
              <p className="text-slate-300">১. "Switch to Member Mode"-এ ক্লিক করুন।</p>
              <p className="text-slate-300">২. আপনার নিজস্ব মেম্বার একাউন্ট থেকে জমার ভাউচার ও মানি রিসিট জমা দিন।</p>
              <p className="text-slate-300">৩. এটি অ্যাডমিন প্যানেলের "Pending Deposit Vouchers" এ অডিটের জন্য আসবে।</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdminNoticeOpen(false)}
                className="px-4 py-2.5 bg-[#0B1528] border border-[#D4AF37]/30 text-slate-300 hover:text-white font-bold rounded-xl text-xs"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdminNoticeOpen(false);
                  switchRoleMode('member');
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              >
                <span>Switch to Member Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Deposit Receipt Modal */}
      <DepositReceiptModal
        deposit={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Admin Signature Modal for Audit Approval */}
      <AdminSignatureModal
        isOpen={!!signatureModalDeposit}
        onClose={() => setSignatureModalDeposit(null)}
        deposit={signatureModalDeposit}
        onConfirmApprove={async (sigUrl) => {
          if (signatureModalDeposit) {
            await approveDeposit(signatureModalDeposit.id, sigUrl);
            setSignatureModalDeposit(null);
          }
        }}
      />

      {/* Delete Deposit Confirmation Modal */}
      {depositToDelete && (
        <DeleteConfirmModal
          isOpen={!!depositToDelete}
          title="ডিপোজিট ডিলিট নিশ্চিতকরণ (Delete Deposit)"
          itemName={`Deposit Voucher ${depositToDelete.id} - ৳${(depositToDelete.amount || 0).toLocaleString()} (${depositToDelete.memberName})`}
          onClose={() => setDepositToDelete(null)}
          onConfirm={async (reason) => {
            await deleteDepositWithReason(depositToDelete.id, reason);
            setDepositToDelete(null);
          }}
        />
      )}

    </div>
  );
};
