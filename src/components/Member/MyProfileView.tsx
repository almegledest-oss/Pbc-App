import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { DigitalCard } from '../Members/DigitalCard';
import { uploadMemberPhoto } from '../../services/firebaseService';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { AppUpdateSettingCard } from '../Common/AppUpdateSettingCard';
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
  Users
} from 'lucide-react';

export const MyProfileView: React.FC = () => {
  const { currentMember, setCurrentMember, updateMember, deposits, language, setActiveTab, role } = useApp();
  const labels = t[language];
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  const isAdmin = role === 'super_admin' || role === 'admin';

  // Form state for member editable fields (Personal & Family details only - photo is locked for members)
  const [formData, setFormData] = useState({
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

  // Filter deposits for current member
  const myDeposits = deposits.filter(d => d.memberId === currentMember.id);
  const myTotalDeposited = myDeposits.reduce((sum, d) => sum + d.amount, 0);

  const openEditModal = () => {
    setFormData({
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
    setSavingInfo(true);

    try {
      const updatedData = {
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
      alert('আপনার তথ্য সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      console.error('Failed to update member info:', err);
      alert('Error updating profile: ' + (err.message || 'Failed'));
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert('প্রোফাইল ছবি পরিবর্তন শুধুমাত্র ক্লাব অ্যাডমিন দ্বারা সম্পন্ন করা যাবে।');
      return;
    }

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
            {isAdmin ? (
              <label 
                className="absolute -bottom-1 -right-1 p-2 bg-[#112244] hover:bg-[#1A3366] text-amber-300 rounded-full shadow-lg border-2 border-[#D4AF37] cursor-pointer transition transform hover:scale-105 active:scale-95 flex items-center justify-center"
                title="Change Profile Photo (Admin Only)"
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
                className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900/90 text-amber-400 rounded-full shadow-md border border-[#D4AF37]/60 flex items-center justify-center"
                title="প্রোফাইল ছবি সুরক্ষিত (Admin Managed)"
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
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit My Info (তথ্য এডিট করুন)</span>
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
            <span className="text-xs text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Official Pass
            </span>
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

        {/* App Version & System Updates */}
        <div className="pt-1">
          <AppUpdateSettingCard />
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
              
              {/* Note on Locked Photo */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong className="block text-amber-300">নিরাপত্তা ও নিয়মকানুন:</strong>
                  আইডি কার্ডের প্রোফাইল ছবি এবং সদস্যপদ নম্বর লক করা থাকে। আপনি কেবল যোগাযোগ ও ফ্যামিলি তথ্য পরিবর্তন করতে পারবেন।
                </div>
              </div>

              {/* Personal Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Personal Details (ব্যক্তিগত তথ্য)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                      placeholder="e.g. Bristi Akter"
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
                      placeholder="e.g. 01871713907"
                      className="w-full bg-[#071220] border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Permanent Address (স্থায়ী ঠিকানা)</label>
                    <textarea
                      rows={2}
                      value={formData.familyInfoAddress}
                      onChange={(e) => setFormData({ ...formData, familyInfoAddress: e.target.value })}
                      placeholder="e.g. Gojaria, Nawabgonj, Dhaka"
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
