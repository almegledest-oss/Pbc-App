import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { DigitalCard } from '../Members/DigitalCard';
import { uploadMemberPhoto } from '../../services/firebaseService';
import { generatePBCFrameImage } from '../../utils/pbcFrameGenerator';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { 
  User, 
  Wallet, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  CreditCard,
  Camera,
  Loader2,
  Sparkles
} from 'lucide-react';

export const MyProfileView: React.FC = () => {
  const { currentMember, setCurrentMember, updateMember, deposits, projects, stats, language, setActiveTab, role } = useApp();
  const labels = t[language];
  const [uploading, setUploading] = useState(false);

  if (!currentMember) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
        Loading member profile...
      </div>
    );
  }

  // Filter deposits for current member
  const myDeposits = deposits.filter(d => d.memberId === currentMember.id);
  const myTotalDeposited = myDeposits.reduce((sum, d) => sum + d.amount, 0);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const downloadUrl = await uploadMemberPhoto(file, currentMember.id);
      await updateMember(currentMember.id, { photoUrl: downloadUrl });
      setCurrentMember({ ...currentMember, photoUrl: downloadUrl });
    } catch (err: any) {
      alert('Error uploading photo: ' + (err.message || 'Failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#070D1B] via-[#0B1528] to-[#112244] p-6 rounded-3xl text-white border-2 border-[#D4AF37]/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 group">
            <PBCFramedAvatar
              photoUrl={currentMember.photoUrl}
              name={currentMember.fullName}
              alt={currentMember.fullName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#D4AF37] shadow-lg"
            />
            <label 
              className="absolute -bottom-1 -right-1 p-2 bg-[#112244] hover:bg-[#1A3366] text-amber-300 rounded-full shadow-lg border-2 border-[#D4AF37] cursor-pointer transition transform hover:scale-105 active:scale-95 flex items-center justify-center"
              title="Change Profile Photo"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <Camera className="w-4 h-4 text-amber-300" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono bg-[#D4AF37] text-slate-950 rounded-full uppercase tracking-wider">
                {currentMember.id}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full capitalize">
                {currentMember.status} Member
              </span>
            </div>

            <h2 className="text-2xl font-black mt-1 text-white uppercase tracking-wide">
              {currentMember.fullName}
            </h2>
            <p className="text-xs text-amber-300 font-serif dir-rtl mt-0.5">
              {currentMember.fullNameAr}
            </p>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentMember.city}, {currentMember.country}</span>
            </p>
          </div>
        </div>

        {/* Member Financial KPI Summary */}
        <div className="bg-[#070D1B]/80 backdrop-blur-md p-4 rounded-2xl border border-[#D4AF37]/30 text-xs space-y-2 min-w-[220px]">
          <div className="flex justify-between">
            <span className="text-slate-300">My Cumulative Deposit:</span>
            <span className="font-extrabold text-amber-300">৳{myTotalDeposited.toLocaleString()} BDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Join Date:</span>
            <span className="font-bold text-white">{currentMember.joinDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Club Pass Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Digital Pass Generator & Personal Deposit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Digital Membership Pass Box */}
        <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 w-full justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>{labels.digitalMemberCard}</span>
            </h3>
            <span className="text-xs text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">QR Pass Ready</span>
          </div>

          <DigitalCard member={currentMember} />
        </div>

        {/* Personal Deposit History */}
        <div className="bg-[#0B1528] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <Wallet className="w-5 h-5 text-amber-400" />
              <span>My Deposit Receipts ({myDeposits.length})</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('deposits')}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Submit Deposit Voucher (জমা ভাউচার দিন)</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#D4AF37]/20 text-xs">
            {myDeposits.map(d => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-amber-300 block">{d.id}</span>
                  <span className="text-[10px] text-slate-400">{d.paymentMethod} • Ref: {d.referenceNumber}</span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 block text-sm">
                    +৳{d.amount.toLocaleString()} {d.currency || 'BDT'}
                  </span>
                  <span className="text-[10px] text-slate-400">{d.depositDate}</span>
                </div>
              </div>
            ))}

            {myDeposits.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No deposit receipts recorded for this member profile yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
