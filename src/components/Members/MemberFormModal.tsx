import React, { useState, useEffect } from 'react';
import { Member, StatusType, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { uploadMemberPhoto } from '../../services/firebaseService';
import { generatePBCFrameImage } from '../../utils/pbcFrameGenerator';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { 
  X, 
  Camera, 
  Loader2, 
  Check, 
  QrCode, 
  CreditCard,
  User,
  Mail,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit
}) => {
  const { members, addMember, updateMember, role, triggerSecurityAlert, language } = useApp();

  const isEditMode = !!memberToEdit;

  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    fullNameBn: '',
    phone: '',
    email: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    dateOfBirth: '',
    bloodGroup: 'B+',
    passportNumber: '',
    idCardNumber: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as StatusType,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    idCardPhotoUrl: '',
    idCardFrontPhotoUrl: '',
    idCardBackPhotoUrl: '',
    qrCodeData: '',
    barcodeData: '',
    totalDeposit: 0,
    userRole: 'member' as UserRole,
    notes: 'Expat Investor',
    familyInfoName: '',
    familyInfoRelation: '',
    familyInfoMobile: '',
    familyInfoAddress: ''
  });

  const [errors, setErrors] = useState<{ email?: string; phone?: string; fullName?: string }>({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingIdFront, setIsUploadingIdFront] = useState(false);
  const [isUploadingIdBack, setIsUploadingIdBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        id: memberToEdit.id || '',
        fullName: memberToEdit.fullName || '',
        fullNameBn: memberToEdit.fullNameBn || '',
        phone: memberToEdit.phone || '',
        email: memberToEdit.email || '',
        country: memberToEdit.country || 'United Arab Emirates',
        city: memberToEdit.city || 'Dubai',
        dateOfBirth: memberToEdit.dateOfBirth || '',
        bloodGroup: memberToEdit.bloodGroup || 'B+',
        passportNumber: memberToEdit.passportNumber || '',
        idCardNumber: memberToEdit.idCardNumber || '',
        joinDate: memberToEdit.joinDate || new Date().toISOString().split('T')[0],
        status: memberToEdit.status || 'active',
        photoUrl: memberToEdit.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        idCardPhotoUrl: memberToEdit.idCardPhotoUrl || memberToEdit.idCardFrontPhotoUrl || '',
        idCardFrontPhotoUrl: memberToEdit.idCardFrontPhotoUrl || memberToEdit.idCardPhotoUrl || '',
        idCardBackPhotoUrl: memberToEdit.idCardBackPhotoUrl || '',
        qrCodeData: memberToEdit.qrCodeData || '',
        barcodeData: memberToEdit.barcodeData || '',
        totalDeposit: memberToEdit.totalDeposit || 0,
        userRole: memberToEdit.role || 'member',
        notes: memberToEdit.notes || '',
        password: memberToEdit.password || 'PBC-Pass-1234',
        familyInfoName: memberToEdit.familyInfoName || memberToEdit.nomineeName || '',
        familyInfoRelation: memberToEdit.familyInfoRelation || memberToEdit.nomineeRelation || '',
        familyInfoMobile: memberToEdit.familyInfoMobile || memberToEdit.nomineeMobile || '',
        familyInfoAddress: memberToEdit.familyInfoAddress || memberToEdit.nomineeAddress || ''
      });
    } else {
      const nextId = `PBC-${1000 + members.length + 1}`;
      const autoPass = `PBC-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData({
        id: nextId,
        fullName: '',
        fullNameBn: '',
        phone: '',
        email: '',
        country: 'United Arab Emirates',
        city: 'Dubai',
        dateOfBirth: '1988-01-15',
        bloodGroup: 'B+',
        passportNumber: '',
        idCardNumber: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        idCardPhotoUrl: '',
        idCardFrontPhotoUrl: '',
        idCardBackPhotoUrl: '',
        qrCodeData: '',
        barcodeData: '',
        totalDeposit: 0,
        userRole: 'member',
        notes: 'Expat Investor',
        password: autoPass,
        familyInfoName: 'Bristi Akter',
        familyInfoRelation: 'Wife',
        familyInfoMobile: '01871713907',
        familyInfoAddress: 'Gojaria,Nawabgonj,Dhaka'
      });
    }
    setErrors({});
  }, [memberToEdit, isOpen, members.length]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { email?: string; phone?: string; fullName?: string } = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || digitsOnly.length < 7) {
      errs.phone = 'Please enter a valid phone number with at least 7 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const rawUrl = await uploadMemberPhoto(file, (formData.id || 'new_member') + '_profile');
      setFormData(prev => ({ ...prev, photoUrl: rawUrl }));
    } catch (err: any) {
      alert('Profile photo upload failed: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleIdCardFrontPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingIdFront(true);
    try {
      const url = await uploadMemberPhoto(file, (formData.id || 'new_member') + '_idfront');
      setFormData(prev => ({ ...prev, idCardFrontPhotoUrl: url, idCardPhotoUrl: url }));
    } catch (err: any) {
      alert('ID Card Front photo upload failed: ' + err.message);
    } finally {
      setIsUploadingIdFront(false);
    }
  };

  const handleIdCardBackPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingIdBack(true);
    try {
      const url = await uploadMemberPhoto(file, (formData.id || 'new_member') + '_idback');
      setFormData(prev => ({ ...prev, idCardBackPhotoUrl: url }));
    } catch (err: any) {
      alert('ID Card Back photo upload failed: ' + err.message);
    } finally {
      setIsUploadingIdBack(false);
    }
  };

  const handleAutoGenerateCodes = () => {
    const memberId = formData.id.trim() || `PBC-${1000 + members.length + 1}`;
    const qr = `PBC-MEMBER:${memberId}:${formData.fullName}:${formData.status}`;
    const barcode = `PBC-BC-${memberId}`;
    setFormData(prev => ({
      ...prev,
      id: prev.id || memberId,
      qrCodeData: qr,
      barcodeData: barcode
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalMemberId = formData.id.trim() || `PBC-${1000 + members.length + 1}`;
      const finalQr = formData.qrCodeData.trim() || `PBC-MEMBER:${finalMemberId}:${formData.fullName}:${formData.status}`;
      const finalBarcode = formData.barcodeData.trim() || `PBC-BC-${finalMemberId}`;

      const payload = {
        id: finalMemberId,
        fullName: formData.fullName.trim(),
        fullNameBn: formData.fullNameBn.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        passportNumber: formData.passportNumber.trim(),
        idCardNumber: formData.idCardNumber.trim(),
        joinDate: formData.joinDate,
        status: formData.status,
        photoUrl: formData.photoUrl,
        idCardPhotoUrl: formData.idCardFrontPhotoUrl || formData.idCardPhotoUrl,
        idCardFrontPhotoUrl: formData.idCardFrontPhotoUrl || formData.idCardPhotoUrl,
        idCardBackPhotoUrl: formData.idCardBackPhotoUrl,
        qrCodeData: finalQr,
        barcodeData: finalBarcode,
        totalDeposit: Number(formData.totalDeposit) || 0,
        role: formData.userRole,
        notes: formData.notes,
        password: formData.password,
        familyInfoName: formData.familyInfoName.trim(),
        familyInfoRelation: formData.familyInfoRelation.trim(),
        familyInfoMobile: formData.familyInfoMobile.trim(),
        familyInfoAddress: formData.familyInfoAddress.trim(),
        nomineeName: formData.familyInfoName.trim(),
        nomineeRelation: formData.familyInfoRelation.trim(),
        nomineeMobile: formData.familyInfoMobile.trim(),
        nomineeAddress: formData.familyInfoAddress.trim()
      };

      if (isEditMode && memberToEdit) {
        await updateMember(memberToEdit.id, payload);
      } else {
        await addMember(payload);
      }

      onClose();
    } catch (err: any) {
      alert('Error saving member details: ' + (err.message || 'Failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#070D1B] rounded-3xl p-6 max-w-2xl w-full border border-[#D4AF37]/40 relative max-h-[90vh] overflow-y-auto shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#0B1528] border border-[#D4AF37]/30 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-white mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>{isEditMode ? `Edit Member Details (${formData.id || memberToEdit?.id})` : 'Enroll New Expat Member'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Section 1: Basic Information */}
          <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-3">
            <h4 className="font-bold uppercase text-[10px] tracking-wider text-amber-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Basic Member Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eng. Mohammad Al-Rashid"
                  value={formData.fullName}
                  onChange={e => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                  }}
                  className={`w-full px-3 py-2.5 bg-[#070D1B] border ${errors.fullName ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400`}
                />
                {errors.fullName && <p className="text-[10px] text-rose-400 mt-1 font-medium">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Name in Bangla (Optional)
                </label>
                <input
                  type="text"
                  placeholder="বাংলায় নাম"
                  value={formData.fullNameBn}
                  onChange={e => setFormData({ ...formData, fullNameBn: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Member ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PBC-1005"
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2.5 font-mono font-bold bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Membership Status *
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as StatusType })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
                >
                  <option value="active" className="bg-[#070D1B]">Active (সক্রিয়)</option>
                  <option value="pending" className="bg-[#070D1B]">Pending (অপেক্ষমান)</option>
                  <option value="suspended" className="bg-[#070D1B]">Suspended (স্থগিত)</option>
                  <option value="rejected" className="bg-[#070D1B]">Rejected (বাতিল)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-3">
            <h4 className="font-bold uppercase text-[10px] tracking-wider text-amber-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Contact & Location Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="member@pbcclub.org"
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full px-3 py-2.5 bg-[#070D1B] border ${errors.email ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400`}
                />
                {errors.email && <p className="text-[10px] text-rose-400 mt-1 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+971 50 123 4567"
                  value={formData.phone}
                  onChange={e => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  className={`w-full px-3 py-2.5 bg-[#070D1B] border ${errors.phone ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400`}
                />
                {errors.phone && <p className="text-[10px] text-rose-400 mt-1 font-medium">{errors.phone}</p>}
              </div>

              {/* Member Password Section */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Member Login Password *</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, password: `PBC-${Math.floor(100000 + Math.random() * 900000)}` })}
                    className="text-[10px] text-amber-300 font-bold hover:underline"
                  >
                    Regenerate
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={(showPassword && role === 'super_admin') ? 'text' : 'password'}
                    required
                    value={formData.password || ''}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="e.g. PBC-849201"
                    className="w-full pl-3 pr-10 py-2.5 font-mono font-bold text-xs bg-[#070D1B] border border-[#D4AF37]/40 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (role !== 'super_admin') {
                        triggerSecurityAlert(language === 'bn' 
                          ? 'সিকিউরিটি অ্যালার্ট: শুধুমাত্র সুপার এডমিন মেম্বারদের পাসওয়ার্ড দেখতে পারবেন।' 
                          : 'Security Alert: Only Super Admin can view plain text member passwords.'
                        );
                        return;
                      }
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-300 transition cursor-pointer"
                    title={role === 'super_admin' ? 'Toggle Password Visibility' : 'Only Super Admin can view passwords'}
                  >
                    {(showPassword && role === 'super_admin') ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {role === 'super_admin'
                    ? (language === 'bn' ? 'সুপার এডমিন হিসেবে আপনি পাসওয়ার্ড দেখতে ও পরিবর্তন করতে পারেন।' : 'As Super Admin, you can view and edit member passwords.')
                    : (language === 'bn' ? 'সিকিউরিটি পলিসি: শুধুমাত্র সুপার এডমিন মেম্বারদের পাসওয়ার্ড দেখতে পারবেন। সাধারণ এডমিন কেবল পাসওয়ার্ড রিসেট করতে পারবেন।' : 'Security Policy: Only Super Admin can view plain text passwords.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Personal Verification & ID Cards */}
          <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-3">
            <h4 className="font-bold uppercase text-[10px] tracking-wider text-amber-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Personal & Identification Credentials
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="A+" className="bg-[#070D1B]">A+</option>
                  <option value="A-" className="bg-[#070D1B]">A-</option>
                  <option value="B+" className="bg-[#070D1B]">B+</option>
                  <option value="B-" className="bg-[#070D1B]">B-</option>
                  <option value="AB+" className="bg-[#070D1B]">AB+</option>
                  <option value="AB-" className="bg-[#070D1B]">AB-</option>
                  <option value="O+" className="bg-[#070D1B]">O+</option>
                  <option value="O-" className="bg-[#070D1B]">O-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">National ID / Passport Number</label>
                <input
                  type="text"
                  placeholder="e.g. A01928374 / 1988273645"
                  value={formData.passportNumber}
                  onChange={e => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full px-3 py-2.5 font-mono bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ID Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. PBC-ID-8821"
                  value={formData.idCardNumber}
                  onChange={e => setFormData({ ...formData, idCardNumber: e.target.value })}
                  className="w-full px-3 py-2.5 font-mono bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Family Information (ID Card Back) */}
          <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-3">
            <h4 className="font-bold uppercase text-[10px] tracking-wider text-amber-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Family Information (ID Card Back)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nominee / Family Name (N. Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Bristi Akter"
                  value={formData.familyInfoName}
                  onChange={e => setFormData({ ...formData, familyInfoName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Wife / Mother / Brother"
                  value={formData.familyInfoRelation}
                  onChange={e => setFormData({ ...formData, familyInfoRelation: e.target.value })}
                  className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Family Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 01871713907"
                  value={formData.familyInfoMobile}
                  onChange={e => setFormData({ ...formData, familyInfoMobile: e.target.value })}
                  className="w-full px-3 py-2 font-mono bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Family Address</label>
                <input
                  type="text"
                  placeholder="e.g. Gojaria,Nawabgonj,Dhaka"
                  value={formData.familyInfoAddress}
                  onChange={e => setFormData({ ...formData, familyInfoAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Photo Uploads */}
          <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-3">
            <h4 className="font-bold uppercase text-[10px] tracking-wider text-amber-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Photo Uploads
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Profile Photo */}
              <div className="bg-[#070D1B] p-3 rounded-xl border border-[#D4AF37]/30 space-y-2">
                <span className="block text-xs font-semibold text-slate-300">Profile Photo</span>
                <div className="flex items-center gap-2">
                  {formData.photoUrl ? (
                    <PBCFramedAvatar photoUrl={formData.photoUrl} name={formData.fullName} className="w-10 h-10 rounded-xl" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#0B1528] flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <label className="cursor-pointer px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold text-[11px] flex items-center gap-1 transition shrink-0 active:scale-95">
                    {isUploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin text-slate-950" /> : <Camera className="w-3 h-3 text-slate-950" />}
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or enter image URL"
                  value={formData.photoUrl}
                  onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-2 py-1 text-[10px] bg-[#0B1528] border border-[#D4AF37]/30 rounded-lg text-slate-200"
                />
              </div>

              {/* ID Card Front Photo */}
              <div className="bg-[#070D1B] p-3 rounded-xl border border-[#D4AF37]/30 space-y-2">
                <span className="block text-xs font-semibold text-slate-300">ID Card Front Photo</span>
                <div className="flex items-center gap-2">
                  {(formData.idCardFrontPhotoUrl || formData.idCardPhotoUrl) ? (
                    <img src={formData.idCardFrontPhotoUrl || formData.idCardPhotoUrl} alt="ID Front" className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#0B1528] flex items-center justify-center text-slate-400">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                  <label className="cursor-pointer px-2.5 py-1.5 bg-[#0B1528] border border-[#D4AF37]/40 text-amber-300 rounded-xl font-bold text-[11px] flex items-center gap-1 transition shrink-0 active:scale-95">
                    {isUploadingIdFront ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-amber-400" />}
                    <span>{isUploadingIdFront ? 'Uploading...' : 'ID Front'}</span>
                    <input type="file" accept="image/*" onChange={handleIdCardFrontPhotoUpload} disabled={isUploadingIdFront} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or enter Front ID URL"
                  value={formData.idCardFrontPhotoUrl || formData.idCardPhotoUrl}
                  onChange={e => setFormData({ ...formData, idCardFrontPhotoUrl: e.target.value, idCardPhotoUrl: e.target.value })}
                  className="w-full px-2 py-1 text-[10px] bg-[#0B1528] border border-[#D4AF37]/30 rounded-lg text-slate-200"
                />
              </div>

              {/* ID Card Back Photo */}
              <div className="bg-[#070D1B] p-3 rounded-xl border border-[#D4AF37]/30 space-y-2">
                <span className="block text-xs font-semibold text-slate-300">ID Card Back Photo</span>
                <div className="flex items-center gap-2">
                  {formData.idCardBackPhotoUrl ? (
                    <img src={formData.idCardBackPhotoUrl} alt="ID Back" className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#0B1528] flex items-center justify-center text-slate-400">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                  <label className="cursor-pointer px-2.5 py-1.5 bg-[#0B1528] border border-[#D4AF37]/40 text-blue-300 rounded-xl font-bold text-[11px] flex items-center gap-1 transition shrink-0 active:scale-95">
                    {isUploadingIdBack ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-blue-400" />}
                    <span>{isUploadingIdBack ? 'Uploading...' : 'ID Back'}</span>
                    <input type="file" accept="image/*" onChange={handleIdCardBackPhotoUpload} disabled={isUploadingIdBack} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or enter Back ID URL"
                  value={formData.idCardBackPhotoUrl}
                  onChange={e => setFormData({ ...formData, idCardBackPhotoUrl: e.target.value })}
                  className="w-full px-2 py-1 text-[10px] bg-[#0B1528] border border-[#D4AF37]/30 rounded-lg text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 5: QR Code & Barcode */}
          <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase text-[10px] tracking-wider text-amber-300 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" /> Security Codes (QR Code & Barcode)
              </h4>
              <button
                type="button"
                onClick={handleAutoGenerateCodes}
                className="text-[10px] font-bold text-amber-400 hover:underline"
              >
                Auto-generate codes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">QR Code Data</label>
                <input
                  type="text"
                  placeholder="e.g. PBC-MEMBER:PBC-1001:Name:active"
                  value={formData.qrCodeData}
                  onChange={e => setFormData({ ...formData, qrCodeData: e.target.value })}
                  className="w-full px-3 py-2 font-mono text-[11px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Barcode Data</label>
                <input
                  type="text"
                  placeholder="e.g. PBC-BC-1001"
                  value={formData.barcodeData}
                  onChange={e => setFormData({ ...formData, barcodeData: e.target.value })}
                  className="w-full px-3 py-2 font-mono text-[11px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-[#D4AF37]/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-[#0B1528] hover:bg-[#112244] text-slate-300 font-semibold rounded-xl text-xs border border-[#D4AF37]/30 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Saving to Firebase...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>{isEditMode ? 'Save Changes' : 'Save & Register Member'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
