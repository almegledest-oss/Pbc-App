import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { DigitalCard } from '../Members/DigitalCard';
import { uploadMemberPhoto } from '../../services/firebaseService';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { 
  User, 
  Wallet, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  CreditCard,
  Camera,
  Loader2,
  Lock,
  Edit3,
  X,
  Check,
  Globe,
  Droplet,
  Home,
  Users,
  BookOpen,
  ChevronRight
} from 'lucide-react';

export const MyProfileView: React.FC = () => {
  const { currentMember, setCurrentMember, updateMember, deposits, language, setActiveTab, role, systemSettings } = useApp();
  const labels = t[language];
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  const isAdmin = role === 'super_admin' || role === 'admin';
  const canUploadPhoto = isAdmin || (systemSettings?.allowMemberPhotoUpload !== false);
  const canEditInfo = isAdmin || (systemSettings?.allowMemberSelfEdit !== false);
  const canDownloadCard = isAdmin || (systemSettings?.allowMemberCardDownload !== false);

  // Form state for member editable fields (Personal, Batch & Family details)
  const [formData, setFormData] = useState({
    batchNumber: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    dateOfBirth: '',
    bloodGroup: '',
    familyInfoName: '',
    familyInfoRelation: '',
    familyInfoMobile: '',
    familyInfoAddress: ''
  });

  if (!currentMember) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
        Loading member profile...
      </div>
    );
  }

  // Filter deposits for current member (Approved deposits only count towards active balance)
  const isApproved = (s?: string) => s?.toLowerCase().trim() === 'approved';
  const myDeposits = deposits.filter(d => d.memberId === currentMember.id);
  const myApprovedSum = myDeposits
    .filter(d => isApproved(d.status))
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const myTotalDeposited = Math.max(myApprovedSum, Number(currentMember.totalDeposit) || 0);

  const openEditModal = () => {
    if (!canEditInfo) {
      alert('সদস্য তথ্য পরিবর্তন সাময়িকভাবে অ্যাডমিন প্যানেল থেকে লক রয়েছে।');
      return;
    }
    setFormData({
      batchNumber: currentMember.batchNumber || '',
      phone: currentMember.phone || '',
      email: currentMember.email || '',
      country: currentMember.country || '',
      city: currentMember.city || '',
      dateOfBirth: currentMember.dateOfBirth || '',
      bloodGroup: currentMember.bloodGroup || 'O+',
      familyInfoName: currentMember.familyInfoName || currentMember.nomineeName || '',
      familyInfoRelation: currentMember.familyInfoRelation || currentMember.nomineeRelation || '',
      familyInfoMobile: currentMember.familyInfoMobile || currentMember.nomineeMobile || '',
      familyInfoAddress: currentMember.familyInfoAddress || currentMember.nomineeAddress || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditInfo) {
      alert('সদস্য তথ্য পরিবর্তন সাময়িকভাবে অ্যাডমিন প্যানেল থেকে লক রয়েছে।');
      return;
    }
    setSavingInfo(true);

    try {
      const updatedData = {
        batchNumber: formData.batchNumber.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        bloodGroup: formData.bloodGroup.trim(),
        familyInfoName: formData.familyInfoName.trim(),
        familyInfoRelation: formData.familyInfoRelation.trim(),
        familyInfoMobile: formData.familyInfoMobile.trim(),
        familyInfoAddress: formData.familyInfoAddress.trim(),
        // Keep nominee fields synced for backward compatibility
        nomineeName: formData.familyInfoName.trim(),
        nomineeRelation: formData.familyInfoRelation.trim(),
        nomineeMobile: formData.familyInfoMobile.trim(),
        nomineeAddress: formData.familyInfoAddress.trim()
      };

      await updateMember(currentMember.id, updatedData);
      setCurrentMember({ ...currentMember, ...updatedData });
      setIsEditModalOpen(false);
      alert('আপনার তথ্য ও ব্যাচ নম্বর সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      console.error('Failed to update member info:', err);
      alert('Error updating profile: ' + (err.message || 'Failed'));
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadPhoto) {
      alert('প্রোফাইল ছবি পরিবর্তন বর্তমানে অ্যাডমিন কর্তৃক লক করা রয়েছে।');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const downloadUrl = await uploadMemberPhoto(file, currentMember.id);
      await updateMember(currentMember.id, { photoUrl: downloadUrl });
      setCurrentMember({ ...currentMember, photoUrl: downloadUrl });
      alert('প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!');
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
            {canUploadPhoto ? (
              <label 
                className="absolute -bottom-1 -right-1 p-2 bg-[#112244] hover:bg-[#1A3366] text-amber-300 rounded-full shadow-lg border-2 border-[#D4AF37] cursor-pointer transition transform hover:scale-105 active:scale-95 flex items-center justify-center"
                title="Change Profile Photo (ছবি পরিবর্তন করুন)"
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
            ) : (
              <div 
                className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900/90 text-amber-400 rounded-full shadow-md border border-[#D4AF37]/60 flex items-center justify-center cursor-not-allowed"
                title="প্রোফাইল ছবি পরিবর্তন সাময়িকভাবে অ্যাডমিন কর্তৃক লক রয়েছে"
              >
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono bg-[#D4AF37] text-slate-950 rounded-full uppercase tracking-wider">
                {currentMember.id}
              </span>
              {currentMember.batchNumber && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider">
                  BATCH: {currentMember.batchNumber}
                </span>
              )}
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

        {/* Member Action & Financial Summary */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={openEditModal}
            className={`px-4 py-2.5 font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              canEditInfo 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-95' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {canEditInfo ? <Edit3 className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
            <span>{canEditInfo ? 'Edit Personal & Family Info' : 'Info Edit Locked'}</span>
          </button>

          <div className="bg-[#070D1B]/80 backdrop-blur-md p-4 rounded-2xl border border-[#D4AF37]/30 text-xs space-y-2 min-w-[200px]">
            <div className="flex justify-between">
              <span className="text-slate-300">Total Deposit:</span>
              <span className="font-extrabold text-amber-300">৳{myTotalDeposited.toLocaleString()} BDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Club Pass Status:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Official Pass
              </span>
              {!canDownloadCard && (
                <span className="text-[11px] text-rose-300 font-bold bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" />
                  ডাউনলোড লক
                </span>
              )}
            </div>
          </div>

          <DigitalCard member={currentMember} />

          {/* Quick link to Club Rules & By-Laws */}
          <button
            onClick={() => setActiveTab('club_rules')}
            className="w-full mt-4 p-3.5 bg-gradient-to-r from-[#070D1B] to-[#112244] hover:from-[#112244] hover:to-[#1a3366] text-amber-300 rounded-2xl border border-amber-500/30 font-bold text-xs flex items-center justify-between transition cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-white font-bold">{language === 'bn' ? 'ক্লাবের নীতিমালা ও গঠনতন্ত্র পড়ুন' : 'Read PBC Rules & By-Laws'}</span>
                <span className="text-[10px] text-slate-400 font-normal">{language === 'bn' ? 'সকল সদস্যদের জন্য অফিসিয়াল নিয়মাবলী' : 'Official club constitution for members'}</span>
              </div>
            </div>
            <span className="text-xs text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
              <span>{language === 'bn' ? 'দেখুন' : 'Open'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>
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

      {/* Member Editable Info Modal (Personal & Family Data Only) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0B1528] border-2 border-[#D4AF37]/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#D4AF37]/30 flex items-center justify-between bg-gradient-to-r from-[#070D1B] to-[#122240]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Edit Personal & Family Info</h3>
                  <p className="text-[11px] text-slate-300">প্রয়োজনীয় ব্যক্তিগত ও ফ্যামিলি তথ্য আপডেট করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveInfo} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Photo Upload Box (When Unlocked by Admin) */}
              {canUploadPhoto ? (
                <div className="p-3.5 bg-gradient-to-r from-[#0B1528] to-[#112244] border border-[#D4AF37]/40 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <PBCFramedAvatar
                      photoUrl={currentMember.photoUrl}
                      name={currentMember.fullName}
                      alt={currentMember.fullName}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#D4AF37] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Profile Photo (প্রোফাইল ছবি)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          Unlocked
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        আইডি কার্ড ও প্রোফাইলের ছবি আপডেট করতে পাশের বাটনে চাপুন
                      </p>
                    </div>
                  </div>
                  <label className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5 shrink-0 active:scale-95">
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    <span>{uploading ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300">প্রোফাইল ছবি লক করা রয়েছে:</strong>
                    প্রোফাইল ছবি পরিবর্তন সাময়িকভাবে অ্যাডমিন প্যানেল থেকে লক রয়েছে।
                  </div>
                </div>
              )}

              {/* Personal Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Personal Details (ব্যক্তিগত ও সদস্যপদ তথ্য)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Batch Number */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Batch Number (ব্যাচ নম্বর)</span>
                      <span className="text-[10px] text-amber-400 font-mono">Digital Card Batch</span>
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      placeholder="e.g. 01, Batch-2, 2024"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mobile / Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 0503342655"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@example.com"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Country (বর্তমান দেশ)</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. Saudi Arabia"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">City (শহর)</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Riyadh"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date of Birth (জন্মতারিখ)</label>
                    <input
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      placeholder="DD.MM.YYYY (e.g. 05.06.1997)"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Blood Group (রক্তের গ্রুপ)</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden cursor-pointer"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Family Section */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Family & Nominee Info (কার্ডের পেছনের তথ্য)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nominee / Family Name (নাম)</label>
                    <input
                      type="text"
                      value={formData.familyInfoName}
                      onChange={(e) => setFormData({ ...formData, familyInfoName: e.target.value })}
                      placeholder="e.g. Fatema Begum"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Relation (সম্পর্ক)</label>
                    <input
                      type="text"
                      value={formData.familyInfoRelation}
                      onChange={(e) => setFormData({ ...formData, familyInfoRelation: e.target.value })}
                      placeholder="e.g. Wife, Father, Brother"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Family Mobile Number (ফোন নম্বর)</label>
                    <input
                      type="text"
                      value={formData.familyInfoMobile}
                      onChange={(e) => setFormData({ ...formData, familyInfoMobile: e.target.value })}
                      placeholder="e.g. +880 1800-000000"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Permanent Address (স্থায়ী ঠিকানা)</label>
                    <textarea
                      rows={2}
                      value={formData.familyInfoAddress}
                      onChange={(e) => setFormData({ ...formData, familyInfoAddress: e.target.value })}
                      placeholder="e.g. Village, Post, District"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInfo}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {savingInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes (সংরক্ষণ করুন)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
