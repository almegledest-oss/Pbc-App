import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BoardDirector } from '../../types';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Crown, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  FileText, 
  Share2, 
  MessageSquare,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface DirectorDetailViewProps {
  directorId: string;
  onBack?: () => void;
}

export const DirectorDetailView: React.FC<DirectorDetailViewProps> = ({ directorId, onBack }) => {
  const { 
    directors, 
    role, 
    accountRole, 
    authUser, 
    currentMember, 
    language, 
    goBack 
  } = useApp();

  const isBn = language === 'bn';
  const isSuperAdmin = role === 'super_admin' || accountRole === 'super_admin' || currentMember?.role === 'super_admin' || authUser?.email === 'fokrulislammir9897@gmail.com' || authUser?.email === 'almegledest@gmail.com';
  
  const director = directors.find(d => d.id === directorId);

  if (!director) {
    return (
      <div className="bg-[#0B1528] rounded-3xl p-8 sm:p-12 text-center border border-[#D4AF37]/30 text-white max-w-2xl mx-auto shadow-2xl">
        <Crown className="w-16 h-16 mx-auto mb-4 text-amber-400/50" />
        <h3 className="text-xl font-bold mb-2">{isBn ? 'ডাইরেক্টর তথ্য পাওয়া যায়নি' : 'Director Not Found'}</h3>
        <p className="text-sm text-slate-400 mb-6">
          {isBn ? `ডাইরেক্টর আইডি (${directorId}) খুঁজে পাওয়া যায়নি।` : `Director ID (${directorId}) was not found.`}
        </p>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : goBack())}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition"
        >
          {isBn ? '← পরিচালনা পর্ষদে ফিরে যান' : '← Back to Directors'}
        </button>
      </div>
    );
  }

  const handleOpenWhatsApp = () => {
    if (!director.mobile) return;
    const cleanPhone = director.mobile.replace(/[^0-9+]/g, '');
    const url = `https://wa.me/${cleanPhone.replace('+', '')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white animate-fadeIn pb-16">
      
      {/* Top Header with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1528] p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : goBack())}
          className="flex items-center gap-2 px-4 py-2 bg-[#070D1B] hover:bg-[#112244] text-amber-300 rounded-xl border border-[#D4AF37]/40 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{isBn ? '← পরিচালনা পর্ষদ' : '← Board of Directors'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono text-xs font-bold">
            {director.id}
          </span>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>{director.designation}</span>
          </span>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative shrink-0">
            <PBCFramedAvatar
              photoUrl={director.photoUrl}
              name={director.name}
              alt={director.name}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-amber-500/60 shadow-2xl"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  {director.name}
                </h1>
                <p className="text-sm font-bold text-amber-300 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{director.designation}</span>
                </p>
                {director.location && (
                  <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{director.location}</span>
                  </p>
                )}
              </div>

              {director.mobile && (
                <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-xl border border-emerald-500/40 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <a
                    href={`tel:${director.mobile}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl border border-amber-500/40 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{isBn ? 'কল করুন' : 'Call'}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Quick Contact Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3 text-xs text-slate-300">
              {director.mobile && (
                <div className="flex items-center gap-1.5 bg-[#070D1B] px-3 py-1.5 rounded-xl border border-slate-800">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{director.mobile}</span>
                </div>
              )}
              {director.email && (
                <div className="flex items-center gap-1.5 bg-[#070D1B] px-3 py-1.5 rounded-xl border border-slate-800">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{director.email}</span>
                </div>
              )}
              {director.nationalId && (
                <div className="flex items-center gap-1.5 bg-[#070D1B] px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">NID:</span>
                  <span className="font-mono">{director.nationalId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Address & Permanent Info Grid */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 p-5 sm:p-7 shadow-xl space-y-4">
        <h3 className="text-base font-black text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-3">
          <Building2 className="w-5 h-5 text-amber-400" />
          <span>{isBn ? 'স্থায়ী ঠিকানা ও নির্বাহী তথ্য' : 'Permanent Address & Executive Details'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'গ্রাম / বাড়ি' : 'Village / House'}</span>
            <p className="font-bold text-white text-sm">{director.village || director.homeAddress || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'উপজেলা / থানা' : 'Sub-District / Thana'}</span>
            <p className="font-bold text-white text-sm">{director.subDistrict || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'জেলা' : 'District'}</span>
            <p className="font-bold text-white text-sm">{director.district || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'পোস্ট কোড' : 'Postal Code'}</span>
            <p className="font-bold text-white font-mono text-sm">{director.postalCode || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'বর্তমান প্রবাস / কর্মস্থল' : 'Current Residence / Location'}</span>
            <p className="font-bold text-white text-sm">{director.location || 'N/A'}</p>
          </div>
          <div className="bg-[#070D1B] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">{isBn ? 'ব্যানার স্লাইড ক্রম' : 'Banner Display Order'}</span>
            <p className="font-bold text-amber-300 text-sm">#{director.displayOrder || 1}</p>
          </div>
        </div>
      </div>

    </div>
  );
};
