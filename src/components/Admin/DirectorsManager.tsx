import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BoardDirector, Member } from '../../types';
import { compressImageFile, compressDataUrl } from '../../utils/imageCompressor';
import { generatePBCFrameImage } from '../../utils/pbcFrameGenerator';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
  Check, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Upload, 
  UserCheck, 
  Search, 
  Sparkles, 
  Save, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Lock,
  Clock
} from 'lucide-react';

export const DirectorsManager: React.FC = () => {
  const { 
    directors, 
    addDirector, 
    updateDirector, 
    deleteDirector, 
    deleteDirectorWithReason,
    canManageDirectors, 
    role, 
    accountRole, 
    members, 
    language, 
    authUser,
    currentMember 
  } = useApp();

  const isSuperAdmin = role === 'super_admin' || accountRole === 'super_admin' || currentMember?.role === 'super_admin' || authUser?.email === 'fokrulislammir9897@gmail.com';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState<BoardDirector | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isAccessControlOpen, setIsAccessControlOpen] = useState(false);
  const [accessSearch, setAccessSearch] = useState('');
  const [directorToDelete, setDirectorToDelete] = useState<BoardDirector | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [slideIntervalMs, setSlideIntervalMs] = useState<number>(() => {
    const saved = localStorage.getItem('pbc_director_slide_interval');
    return saved ? parseInt(saved, 10) : 4500;
  });
  const [slideEffect, setSlideEffect] = useState<string>(() => {
    return localStorage.getItem('pbc_director_slide_effect') || 'slide';
  });

  const handleSpeedChange = (ms: number) => {
    setSlideIntervalMs(ms);
    localStorage.setItem('pbc_director_slide_interval', ms.toString());
  };

  const handleEffectChange = (effect: string) => {
    setSlideEffect(effect);
    localStorage.setItem('pbc_director_slide_effect', effect);
  };

  // Form State for 11 fields + photo
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    photoUrl: '',
    location: '',
    mobile: '',
    nationalId: '',
    email: '',
    homeAddress: '',
    village: '',
    subDistrict: '',
    district: '',
    postalCode: '',
    displayOrder: 1,
    isActive: true,
    allowedAccessUsers: [] as string[]
  });

  const [photoError, setPhotoError] = useState(false);

  // If user has no permission to manage directors
  if (!canManageDirectors) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-[#070D1B] rounded-3xl border border-rose-500/40 text-center shadow-2xl my-8">
        <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-500/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-rose-400 uppercase tracking-wide mb-2">
          {language === 'bn' ? 'অ্যাক্সেস সংরক্ষিত (System Admin Restricted)' : 'Access Restricted to System Admin'}
        </h2>
        <p className="text-sm text-slate-300 max-w-lg mx-auto mb-6 leading-relaxed">
          {language === 'bn' 
            ? 'বোর্ড অব ডাইরেক্টরস ফিচারটি পরিচালনা করার ক্ষমতা শুধুমাত্র সিস্টেম এডমিন বা তার অনুমোদিত সদস্যদের জন্য বরাদ্দ। আপনার এই অপশনটি দেখার পারমিশন নেই।' 
            : 'Board of Directors management is restricted strictly to the System Admin or explicitly permitted administrators.'}
        </p>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingDirector(null);
    setSelectedMemberId('');
    setFormData({
      name: 'Fokrul Islam Mir',
      designation: 'Director',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      location: 'Riyadh, Saudi Arabia',
      mobile: '0590647043',
      nationalId: '',
      email: 'fokrulislammir89@gmail.com',
      homeAddress: 'Riyadh, Saudi Arabia',
      village: '',
      subDistrict: '',
      district: 'Riyadh',
      postalCode: '',
      displayOrder: directors.length + 1,
      isActive: true,
      allowedAccessUsers: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (director: BoardDirector) => {
    setEditingDirector(director);
    setSelectedMemberId('');
    setFormData({
      name: director.name || '',
      designation: director.designation || '',
      photoUrl: director.photoUrl || '',
      location: director.location || '',
      mobile: director.mobile || '',
      nationalId: director.nationalId || '',
      email: director.email || '',
      homeAddress: director.homeAddress || '',
      village: director.village || '',
      subDistrict: director.subDistrict || '',
      district: director.district || '',
      postalCode: director.postalCode || '',
      displayOrder: director.displayOrder ?? 1,
      isActive: director.isActive !== false,
      allowedAccessUsers: director.allowedAccessUsers || []
    });
    setIsModalOpen(true);
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!memberId) return;

    const m = members.find(mem => mem.id === memberId);
    if (m) {
      setFormData(prev => ({
        ...prev,
        name: m.fullName || prev.name,
        email: m.email || prev.email,
        mobile: m.phone || prev.mobile,
        photoUrl: m.photoUrl || prev.photoUrl,
        location: m.city ? `${m.city}, ${m.country}` : prev.location,
        nationalId: m.idCardNumber || prev.nationalId
      }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert(language === 'bn' ? 'ছবি ১০ মেগাবাইটের বেশি হতে পারবে না' : 'Image size must be less than 10MB');
        return;
      }
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.75);
        setFormData(prev => ({ ...prev, photoUrl: compressed }));
      } catch (err) {
        console.error('Image compression failed:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে নাম এবং পদবি প্রদান করুন' : 'Please provide Name and Designation');
      return;
    }

    try {
      let payload = { ...formData };
      if (payload.photoUrl && payload.photoUrl.startsWith('data:image/')) {
        payload.photoUrl = await compressDataUrl(payload.photoUrl, 800, 800, 0.75);
      }

      if (editingDirector) {
        await updateDirector(editingDirector.id, payload);
      } else {
        await addDirector(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving director:', err);
      const errMsg = err?.message || '';
      alert(language === 'bn' 
        ? `পরিচালক সংরক্ষণে সমস্যা হয়েছে: ${errMsg}` 
        : `Failed to save director data: ${errMsg}`);
    }
  };

  const handleDeleteClick = (director: BoardDirector) => {
    setDirectorToDelete(director);
  };

  const handleConfirmDelete = async () => {
    if (!directorToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDirector(directorToDelete.id);
      setDirectorToDelete(null);
    } catch (err) {
      console.error('Error deleting director:', err);
      alert('Failed to delete director');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (director: BoardDirector) => {
    await updateDirector(director.id, { isActive: !director.isActive });
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= directors.length) return;

    const currentDir = directors[index];
    const targetDir = directors[targetIdx];

    await updateDirector(currentDir.id, { displayOrder: targetDir.displayOrder ?? targetIdx + 1 });
    await updateDirector(targetDir.id, { displayOrder: currentDir.displayOrder ?? index + 1 });
  };

  // Toggle user access in allowedAccessUsers list
  const handleToggleUserAccess = async (userEmail: string) => {
    const cleanUser = userEmail.toLowerCase().trim();
    // Update across all director records so permission is synced
    for (const d of directors) {
      const currentList = d.allowedAccessUsers || [];
      let updatedList = [...currentList];
      if (updatedList.some(u => u.toLowerCase().trim() === cleanUser)) {
        updatedList = updatedList.filter(u => u.toLowerCase().trim() !== cleanUser);
      } else {
        updatedList.push(cleanUser);
      }
      await updateDirector(d.id, { allowedAccessUsers: updatedList });
    }
  };

  // Filtered members for access control
  const filteredMembersForAccess = members.filter(m => 
    m.fullName.toLowerCase().includes(accessSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(accessSearch.toLowerCase()) ||
    m.phone.includes(accessSearch)
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#070D1B] via-[#0E1C38] to-[#0A1326] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold uppercase mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'সিস্টেম এডমিন কন্ট্রোল' : 'System Admin Control'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            {language === 'bn' ? 'বোর্ড অব ডাইরেক্টরস ব্যবস্থাপনা' : 'Board of Directors Management'}
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            {language === 'bn' ? 'লাইভ স্লাইডার ডাইরেক্টর তালিকা, তথ্য ও অ্যাক্সেস নিয়ন্ত্রণ করুন' : 'Manage live banner slider directors, portfolio details, and system admin access'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {/* Slide Speed Duration Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0B1528] rounded-xl border border-amber-500/30 text-amber-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">
              {language === 'bn' ? 'স্লাইড টাইম:' : 'Slide Interval:'}
            </span>
            <select
              value={slideIntervalMs}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="bg-slate-900 text-amber-300 font-bold text-xs rounded-lg px-2 py-1 border border-amber-500/40 focus:outline-none cursor-pointer"
            >
              <option value={2000}>{language === 'bn' ? '২ সেকেন্ড' : '2 Seconds'}</option>
              <option value={3000}>{language === 'bn' ? '৩ সেকেন্ড' : '3 Seconds'}</option>
              <option value={4500}>{language === 'bn' ? '৪.৫ সেকেন্ড (ডিফল্ট)' : '4.5 Sec (Default)'}</option>
              <option value={7000}>{language === 'bn' ? '৭ সেকেন্ড' : '7 Seconds'}</option>
              <option value={10000}>{language === 'bn' ? '১০ সেকেন্ড' : '10 Seconds'}</option>
              <option value={15000}>{language === 'bn' ? '১৫ সেকেন্ড' : '15 Seconds'}</option>
              <option value={30000}>{language === 'bn' ? '৩০ সেকেন্ড' : '30 Seconds'}</option>
              <option value={60000}>{language === 'bn' ? '১ মিনিট' : '1 Minute'}</option>
              <option value={120000}>{language === 'bn' ? '২ মিনিট' : '2 Minutes'}</option>
              <option value={300000}>{language === 'bn' ? '৫ মিনিট' : '5 Minutes'}</option>
            </select>
          </div>

          {/* Slide Transition Effect Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0B1528] rounded-xl border border-amber-500/30 text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin-slow" />
            <span className="text-xs font-bold whitespace-nowrap">
              {language === 'bn' ? 'ইফেক্ট:' : 'Effect:'}
            </span>
            <select
              value={slideEffect}
              onChange={(e) => handleEffectChange(e.target.value)}
              className="bg-slate-900 text-amber-300 font-bold text-xs rounded-lg px-2 py-1 border border-amber-500/40 focus:outline-none cursor-pointer"
            >
              <option value="slide">{language === 'bn' ? '↔️ Slide / স্লাইড (ডিফল্ট)' : '↔️ Slide (Default)'}</option>
              <option value="whirl">{language === 'bn' ? '🌀 Whirl / ঘূর্ণি' : '🌀 Whirl / Spin'}</option>
              <option value="bounce">{language === 'bn' ? '🎾 Bounce / বাউন্স' : '🎾 Bounce'}</option>
              <option value="cube">{language === 'bn' ? '🧊 3D Cube / কিউব' : '🧊 3D Cube'}</option>
              <option value="blur">{language === 'bn' ? '🌫️ Blur Glow / ব্লার' : '🌫️ Blur Glow'}</option>
            </select>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsAccessControlOpen(!isAccessControlOpen)}
              className="px-4 py-2.5 text-xs font-extrabold bg-[#0B1528] hover:bg-[#112244] text-amber-300 rounded-xl border border-amber-500/40 shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'অ্যাক্সেস পারমিশন' : 'Manage Permissions'}</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>{language === 'bn' ? 'নতুন ডাইরেক্টর যোগ করুন' : 'Add New Director'}</span>
          </button>
        </div>
      </div>

      {/* Access Permission Drawer for Super Admin */}
      {isAccessControlOpen && isSuperAdmin && (
        <div className="bg-[#0B1528] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2 text-amber-300 font-black text-base uppercase">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>{language === 'bn' ? 'যাদের কে ডাইরেক্টর ম্যানেজ করার পারমিশন দেওয়া হয়েছে' : 'Granted Director Management Access'}</span>
            </div>
            <button onClick={() => setIsAccessControlOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {language === 'bn' 
              ? 'সিস্টেম এডমিন হিসেবে আপনি যেকোনো মেম্বার বা এডমিনকে বোর্ড অব ডাইরেক্টরস অপশনটি দেখা ও পরিচালনা করার অধিকার দিতে পারেন।' 
              : 'As System Admin, you can grant specific members or admins access to view and manage the Board of Directors.'}
          </p>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'সদস্য খুঁজুন (নাম বা ইমেইল)...' : 'Search members by name or email...'}
              value={accessSearch}
              onChange={(e) => setAccessSearch(e.target.value)}
              className="w-full bg-[#030816] border border-amber-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredMembersForAccess.map(m => {
              const emailClean = m.email.toLowerCase().trim();
              const isAllowed = directors.some(d => d.allowedAccessUsers && d.allowedAccessUsers.some(u => u.toLowerCase().trim() === emailClean));

              return (
                <div key={m.id} className="p-3 bg-[#030816] rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PBCFramedAvatar photoUrl={m.photoUrl} name={m.fullName} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-xs font-bold text-white">{m.fullName} <span className="text-[10px] text-amber-400 font-semibold">({m.id})</span></div>
                      <div className="text-[10px] text-slate-400">{m.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleUserAccess(m.email)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isAllowed 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                        : 'bg-slate-800 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300'
                    }`}
                  >
                    {isAllowed ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{isAllowed ? 'Access Granted' : 'Grant Access'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Directors Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {directors.map((director, index) => (
          <div 
            key={director.id}
            className={`bg-[#0B1528] rounded-2xl border ${
              director.isActive !== false ? 'border-[#D4AF37]/40 shadow-lg' : 'border-slate-800 opacity-60'
            } p-5 relative overflow-hidden transition hover:border-[#D4AF37] flex flex-col justify-between`}
          >
            <div>
              {/* Order Badge & Active Toggle */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full">
                  #{index + 1} Slide
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(director)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                      director.isActive !== false
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {director.isActive !== false ? 'Live Active' : 'Hidden'}
                  </button>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-0.5 bg-[#030816] rounded-lg border border-slate-800 p-0.5">
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-amber-300 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === directors.length - 1}
                      className="p-1 text-slate-400 hover:text-amber-300 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Director Overview Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#8A6A1C] via-[#F3CF60] to-[#9A7B1C] shadow-md shrink-0">
                  <PBCFramedAvatar 
                    photoUrl={director.photoUrl}
                    name={director.name}
                    designation={director.designation}
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white truncate uppercase">{director.name}</h3>
                  <div className="text-xs font-bold text-amber-300">{director.designation}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{director.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Key Quick Fields */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                {director.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{director.mobile}</span>
                  </div>
                )}
                {director.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{director.email}</span>
                  </div>
                )}
                {director.district && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{director.district}, {director.subDistrict || ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEditModal(director)}
                className="flex-1 py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'এডিট করুন' : 'Edit Info'}</span>
              </button>

              <button
                onClick={() => handleDeleteClick(director)}
                className="p-2 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 rounded-xl border border-rose-500/30 transition cursor-pointer"
                title="Delete Director"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Director Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-[#070D1B] border-2 border-[#D4AF37]/60 rounded-3xl max-w-2xl w-full my-auto shadow-2xl text-white relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Form Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#030816] via-[#0E1C38] to-[#0A1326] border-b border-[#D4AF37]/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-amber-300 uppercase tracking-wide">
                    {editingDirector 
                      ? (language === 'bn' ? 'ডাইরেক্টর তথ্য এডিট করুন' : 'Edit Director Profile') 
                      : (language === 'bn' ? 'নতুন ডাইরেক্টর তথ্য যোগ করুন' : 'Add New Board Director')}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {language === 'bn' ? 'লাইভ বেনার ও পোর্টফোলিওর ১১টি ফিল্ড পূরণ করুন' : 'Fill all 11 fields for live slider & portfolio'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Optional: Pre-fill from existing Club Members */}
              {!editingDirector && members.length > 0 && (
                <div className="p-4 bg-[#0B1528] rounded-2xl border border-amber-500/30 space-y-2">
                  <label className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'ক্লাব মেম্বারদের তালিকা থেকে সিলেক্ট করুন (অপশনাল)' : 'Pre-fill from Existing Club Member (Optional)'}</span>
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    className="w-full bg-[#030816] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- {language === 'bn' ? 'মেম্বার নির্বাচন করুন' : 'Select a member'} --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.id}) - {m.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Photo Upload Section */}
              <div className="p-4 bg-[#030816] rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ডাইরেক্টর ফটো আপলোড / ছবি লিঙ্ক' : 'Director Photo Upload / Image URL'}</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#8A6A1C] via-[#F3CF60] to-[#9A7B1C] shadow-md shrink-0">
                    <PBCFramedAvatar
                      photoUrl={formData.photoUrl}
                      name={formData.name}
                      className="w-full h-full rounded-full"
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d..."
                      value={formData.photoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                      className="w-full bg-[#070D1B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />

                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-bold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন' : 'Upload photo file'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* 11 Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">1. Name (নাম) <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. FOKRUL ISLAM MIR"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                {/* 2. Designation */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">2. Designation (পদবি) <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g. Director"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                {/* 3. Location */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">3. Location (লোকেশন)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Riyadh, Saudi Arabia"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 4. Mobile */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">4. Mobile (মোবাইল)</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder="e.g. 0590647043"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 5. National ID */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">5. National ID (এনআইডি/পাসপোর্ট)</label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                    placeholder="e.g. 19889123456789012"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* 6. Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">6. Email (ইমেইল)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. fokrulislammir89@gmail.com"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 7. Home Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">7. Home Address (বাড়ির ঠিকানা)</label>
                  <input
                    type="text"
                    value={formData.homeAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, homeAddress: e.target.value }))}
                    placeholder="e.g. House 12, Road 5, Block C, Gulshan-1"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 8. Village */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">8. Village (গ্রাম)</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                    placeholder="e.g. Paschim Para"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 9. Sub-District */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">9. Sub-District (উপজিলা/উপজেলা)</label>
                  <input
                    type="text"
                    value={formData.subDistrict}
                    onChange={(e) => setFormData(prev => ({ ...prev, subDistrict: e.target.value }))}
                    placeholder="e.g. Gulshan / Panchlaish"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 10. District */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">10. District (জিলা/জেলা)</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="e.g. Dhaka / Chittagong / Sylhet"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 11. Postal Code */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">11. Postal Code (পোস্টাল কোড)</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="e.g. 1212"
                    className="w-full bg-[#030816] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

              </div>

              {/* Status and Display Order Controls */}
              <div className="p-4 bg-[#030816] rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-emerald-300">
                    {language === 'bn' ? 'হোমপেজ লাইভ ব্যেনারে দেখাও (Live Active)' : 'Show in Homepage Live Banner'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">Slide Order Position:</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                    className="w-16 bg-[#070D1B] border border-amber-500/40 rounded-lg px-2 py-1 text-center font-bold text-amber-300"
                  />
                </div>
              </div>

              {/* Form Action Submit */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingDirector ? (language === 'bn' ? 'আপডেট সেভ করুন' : 'Save Changes') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Director')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {directorToDelete && (
        <DeleteConfirmModal
          isOpen={!!directorToDelete}
          title="ডাইরেক্টর ডিলিট নিশ্চিতকরণ (Delete Director)"
          itemName={`${directorToDelete.name} (${directorToDelete.designation || 'Board Director'})`}
          onClose={() => setDirectorToDelete(null)}
          onConfirm={async (reason) => {
            await deleteDirectorWithReason(directorToDelete.id, reason);
            setDirectorToDelete(null);
          }}
        />
      )}

    </div>
  );
};
