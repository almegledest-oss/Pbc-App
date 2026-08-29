import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Member } from '../../types';
import { DigitalCard } from './DigitalCard';
import { DigitalMemberCardModal } from './DigitalMemberCardModal';
import { CardTemplateEditorModal } from './CardTemplateEditorModal';
import { MemberFormModal } from './MemberFormModal';
import { MemberDetailView } from './MemberDetailView';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { uploadMemberPhoto } from '../../services/firebaseService';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  QrCode,
  Check,
  XCircle,
  Download,
  Camera,
  Loader2,
  Sliders,
  Archive,
  LayoutGrid,
  Table,
  Shield,
  UserCog,
  Eye,
  ChevronRight
} from 'lucide-react';

export const MemberList: React.FC = () => {
  const { 
    members, 
    deposits,
    addMember, 
    updateMember, 
    deleteMember, 
    deleteMemberWithReason,
    approveMember,
    rejectMember,
    language, 
    role,
    selectedMemberId,
    setSelectedMemberId,
    currentNavState,
    navigateWithHistory,
    goBack
  } = useApp();

  const labels = t[language];

  // If we are in the member_detail subView, show the full-screen MemberDetailView
  if (currentNavState.subView === 'member_detail' && (currentNavState.subId || selectedMemberId)) {
    const activeId = currentNavState.subId || selectedMemberId || '';
    return <MemberDetailView memberId={activeId} onBack={() => goBack()} />;
  }

  const handleOpenMemberDetail = (member: Member) => {
    setSelectedMemberId(member.id);
    navigateWithHistory({
      tab: 'members',
      subView: 'member_detail',
      subId: member.id,
      title: member.fullName,
      titleBn: member.fullName,
      isFocusMode: true
    });
  };

  const getMemberDepositBreakdown = (member: Member) => {
    const isApproved = (s?: string) => s?.toLowerCase().trim() === 'approved';
    const memberDeps = deposits.filter(
      d => (d.memberId === member.id || (member.fullName && d.memberName && d.memberName.toLowerCase().trim() === member.fullName.toLowerCase().trim())) && 
      isApproved(d.status)
    );
    const total = memberDeps.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const fundRaising = memberDeps
      .filter(d => d.category === 'Fund Raising' || !d.category)
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const realEstate = memberDeps
      .filter(d => d.category === 'Real Estate')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    return { total, fundRaising, realEstate };
  };

  const getMemberTotalDeposit = (member: Member) => {
    return getMemberDepositBreakdown(member).total;
  };

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [activeCardMember, setActiveCardMember] = useState<Member | null>(null);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);

  // Member Delete Confirmation State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    } catch (err: any) {
      alert('Failed to delete member: ' + (err.message || 'Error occurred'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAdminRole = async (member: Member) => {
    const isCurrentlyAdmin = member.role === 'admin';
    const newRole = isCurrentlyAdmin ? 'member' : 'admin';
    const confirmMsg = isCurrentlyAdmin
      ? `আপনি কি ${member.fullName} (${member.id})-কে এডমিন থেকে সাধারণ মেম্বার রোলে পরিবর্তন করতে চান?`
      : `আপনি কি ${member.fullName} (${member.id})-কে ক্লাব এডমিন (Admin) হিসেবে উন্নীত করতে চান?`;

    if (window.confirm(confirmMsg)) {
      try {
        await updateMember(member.id, { role: newRole });
      } catch (err: any) {
        alert('Failed to update member role: ' + (err.message || 'Error'));
      }
    }
  };

  // Form State for New Member
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameBn: '',
    phone: '',
    email: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as const,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    totalDeposit: 0,
    role: 'member' as const,
    notes: 'Expat Investor'
  });

  const countries = ['All', ...Array.from(new Set(members.map(m => m.country)))];

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = countryFilter === 'All' || m.country === countryFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

    return matchesSearch && matchesCountry && matchesStatus;
  });

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return;

    addMember({
      fullName: formData.fullName,
      fullNameBn: formData.fullNameBn,
      phone: formData.phone,
      email: formData.email,
      country: formData.country,
      city: formData.city,
      joinDate: formData.joinDate,
      status: formData.status,
      photoUrl: formData.photoUrl,
      totalDeposit: Number(formData.totalDeposit),
      role: formData.role,
      notes: formData.notes
    });

    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      fullNameBn: '',
      phone: '',
      email: '',
      country: 'United Arab Emirates',
      city: 'Dubai',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      totalDeposit: 1000000,
      role: 'member',
      notes: ''
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMember(editingMember.id, editingMember);
    setEditingMember(null);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Member ID',
      'Full Name',
      'Name (Bangla)',
      'Email',
      'Phone',
      'Country',
      'City',
      'Status',
      'Total Deposit (BDT)',
      'Share Percentage',
      'Join Date',
      'Role',
      'Notes'
    ];

    const rows = filteredMembers.map(m => [
      m.id || '',
      `"${(m.fullName || '').replace(/"/g, '""')}"`,
      `"${(m.fullNameBn || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${(m.country || '').replace(/"/g, '""')}"`,
      `"${(m.city || '').replace(/"/g, '""')}"`,
      m.status || '',
      getMemberTotalDeposit(m),
      m.sharePercentage || 0,
      m.joinDate || '',
      m.role || '',
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PBC_Members_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            {labels.members} {(role === 'super_admin' || role === 'admin') && `(${members.length})`}
          </h2>
          <p className="text-xs text-slate-300">
            Registered Probashi Business Club expatriate investors worldwide
          </p>
        </div>

        {(role === 'super_admin' || role === 'admin') && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-[48px] bg-[#0B1528] hover:bg-[#112244] text-amber-300 font-bold text-xs rounded-xl border border-[#D4AF37]/50 shadow-md transition shrink-0 active:scale-95 cursor-pointer"
              title="Export member list to CSV format"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{labels.addMember}</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      {(role === 'super_admin' || role === 'admin') && (
        <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder={labels.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 touch-pan-x">
            <div className="flex items-center gap-1 text-xs text-amber-300/80 shrink-0 font-bold">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Filters:</span>
            </div>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
            >
              {countries.map(c => <option key={c} value={c} className="bg-[#070D1B] text-white">{c}</option>)}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-3 min-h-[48px] bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium shrink-0"
            >
              <option value="All" className="bg-[#070D1B] text-white">All Statuses</option>
              <option value="active" className="bg-[#070D1B] text-white">Active</option>
              <option value="pending" className="bg-[#070D1B] text-white">Pending</option>
              <option value="suspended" className="bg-[#070D1B] text-white">Suspended</option>
            </select>

            <div className="flex items-center gap-1 bg-[#070D1B] p-1 rounded-xl shrink-0 border border-[#D4AF37]/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg flex items-center justify-center transition active:scale-95 ${
                  viewMode === 'grid'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg flex items-center justify-center transition active:scale-95 ${
                  viewMode === 'table'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
                title="Table View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Content: Grid vs Table */}
      {viewMode === 'table' ? (
        <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 shadow-xl overflow-hidden">
          <div className="overflow-x-auto touch-pan-x overscroll-x-contain">
            <table className="w-full min-w-[780px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070D1B] text-amber-300 font-bold border-b border-[#D4AF37]/30 uppercase tracking-wider">
                  <th className="py-4 px-4">Member</th>
                  <th className="py-4 px-4">Member ID</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Phone</th>
                  <th className="py-4 px-4">Total Deposit</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    onClick={() => handleOpenMemberDetail(member)}
                    className="hover:bg-[#112244] transition cursor-pointer group"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <PBCFramedAvatar
                          photoUrl={member.photoUrl}
                          name={member.fullName}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/50 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block group-hover:text-amber-300 transition">
                            {member.fullName}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                      {member.id}
                    </td>
                    <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                      {member.city}, {member.country}
                    </td>
                    <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                      {member.phone}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-amber-300 block">
                        ৳{getMemberTotalDeposit(member).toLocaleString()} BDT
                      </span>
                      {getMemberTotalDeposit(member) > 0 ? (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          🌱 ৳{getMemberDepositBreakdown(member).fundRaising.toLocaleString()} | 🏢 ৳{getMemberDepositBreakdown(member).realEstate.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic block mt-0.5">
                          ৳0 (No Deposit)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full capitalize flex items-center gap-1 w-max ${
                        member.role === 'super_admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : member.role === 'admin'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{member.role === 'super_admin' ? 'Super Admin' : member.role === 'admin' ? 'Admin' : 'Member'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full capitalize ${
                        member.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : member.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenMemberDetail(member)}
                          className="min-h-[40px] px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 font-bold flex items-center justify-center gap-1 text-xs active:scale-95"
                          title="View Member Full Profile & Statement"
                        >
                          <Eye className="w-4 h-4 text-amber-400" />
                          <span>{language === 'bn' ? 'বিবরণ' : 'Details'}</span>
                        </button>
                        {member.status === 'pending' && (role === 'super_admin' || role === 'admin') && (
                          <>
                            <button
                              onClick={() => approveMember(member.id)}
                              className="min-w-[40px] min-h-[40px] p-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 rounded-xl transition flex items-center justify-center active:scale-95"
                              title="Approve Member"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectMember(member.id)}
                              className="min-w-[40px] min-h-[40px] p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl transition flex items-center justify-center active:scale-95"
                              title="Reject Member"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setActiveCardMember(member)}
                          className="min-h-[40px] px-3 py-2 bg-[#070D1B] hover:bg-amber-500/20 border border-slate-700 rounded-xl text-slate-300 hover:text-amber-300 font-bold flex items-center justify-center gap-1 text-xs active:scale-95"
                          title="Card Pass"
                        >
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          <span>Card</span>
                        </button>
                        {(role === 'super_admin' || role === 'admin') && (
                          <>
                            {member.role !== 'super_admin' && (
                              <button
                                onClick={() => handleToggleAdminRole(member)}
                                className={`min-h-[40px] px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 ${
                                  member.role === 'admin'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                                }`}
                                title={member.role === 'admin' ? "Demote to Member" : "Promote to Admin (এডমিন বানান)"}
                              >
                                <Shield className="w-3.5 h-3.5" />
                                <span>{member.role === 'admin' ? "Admin" : "+ Admin"}</span>
                              </button>
                            )}
                            <button
                              onClick={() => setEditingMember(member)}
                              className="min-w-[40px] min-h-[40px] p-2 hover:bg-[#070D1B] rounded-xl text-slate-300 hover:text-amber-300 flex items-center justify-center active:scale-95 border border-transparent hover:border-[#D4AF37]/30"
                              title="Edit Member"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateMember(member.id, { status: member.status === 'suspended' ? 'active' : 'suspended' })}
                              className="min-w-[40px] min-h-[40px] p-2 hover:bg-[#070D1B] rounded-xl text-slate-400 hover:text-amber-400 flex items-center justify-center active:scale-95 border border-transparent hover:border-[#D4AF37]/30"
                              title={member.status === 'suspended' ? "Restore Member" : "Archive / Suspend Member"}
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setMemberToDelete(member)}
                              className="min-w-[40px] min-h-[40px] p-2 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 flex items-center justify-center active:scale-95 border border-transparent hover:border-rose-500/30"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Members Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => handleOpenMemberDetail(member)}
            className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 p-5 shadow-xl hover:border-[#D4AF37] hover:shadow-amber-500/10 transition duration-200 flex flex-col justify-between relative group cursor-pointer"
          >
            {/* Top Row: Status badge & Actions */}
            <div>
              <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#070D1B] text-amber-300 border border-[#D4AF37]/30">
                    {member.id}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize flex items-center gap-1 ${
                    member.role === 'super_admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : member.role === 'admin'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    <Shield className="w-2.5 h-2.5" />
                    <span>{member.role === 'super_admin' ? 'Super Admin' : member.role === 'admin' ? 'Admin' : 'Member'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                    member.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : member.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {member.status}
                  </span>

                  {(role === 'super_admin' || role === 'admin') && (
                    <div className="flex items-center gap-1">
                      {member.status === 'pending' && (
                        <div className="flex items-center gap-1 mr-1">
                          <button
                            onClick={() => approveMember(member.id)}
                            className="min-w-[36px] min-h-[36px] p-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 rounded-xl transition flex items-center justify-center active:scale-95"
                            title="Approve Member"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectMember(member.id)}
                            className="min-w-[36px] min-h-[36px] p-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl transition flex items-center justify-center active:scale-95"
                            title="Reject Member"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                        {member.role !== 'super_admin' && (
                          <button
                            onClick={() => handleToggleAdminRole(member)}
                            className={`min-w-[36px] min-h-[36px] p-1.5 rounded-xl text-xs font-bold flex items-center justify-center transition active:scale-95 ${
                              member.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950'
                            }`}
                            title={member.role === 'admin' ? "Remove Admin Role" : "Make Admin (এডমিন বানান)"}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingMember(member)}
                          className="min-w-[36px] min-h-[36px] p-1.5 hover:bg-[#070D1B] rounded-xl text-slate-300 hover:text-amber-300 flex items-center justify-center active:scale-95 border border-transparent hover:border-[#D4AF37]/30"
                          title="Edit Member"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateMember(member.id, { status: member.status === 'suspended' ? 'active' : 'suspended' })}
                          className="min-w-[36px] min-h-[36px] p-1.5 hover:bg-[#070D1B] rounded-xl text-slate-400 hover:text-amber-400 flex items-center justify-center active:scale-95 border border-transparent hover:border-[#D4AF37]/30"
                          title={member.status === 'suspended' ? "Restore Member" : "Archive / Suspend Member"}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        {(role === 'super_admin' || role === 'admin') && (
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="min-w-[36px] min-h-[36px] p-1.5 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 flex items-center justify-center active:scale-95 border border-transparent hover:border-rose-500/30"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                <PBCFramedAvatar
                  photoUrl={member.photoUrl}
                  name={member.fullName}
                  alt={member.fullName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/50 shadow-md shrink-0"
                />
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                    {member.fullName}
                  </h3>
                  <p className="text-xs text-amber-300/80 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{member.city}, {member.country}</span>
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-1.5 text-[11px] text-slate-300 bg-[#070D1B] p-2.5 rounded-xl border border-[#D4AF37]/20 mb-4">
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                  <span>Joined: {member.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Deposit Total & Action Triggers */}
            <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">TOTAL DEPOSIT</span>
                <p className="text-sm font-extrabold text-amber-300">
                  ৳{getMemberTotalDeposit(member).toLocaleString()} BDT
                </p>
                {/* Breakdown */}
                {getMemberTotalDeposit(member) > 0 ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                    <span className="text-emerald-400 font-medium">🌱 ৳{getMemberDepositBreakdown(member).fundRaising.toLocaleString()}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-400 font-medium">🏢 ৳{getMemberDepositBreakdown(member).realEstate.toLocaleString()}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 italic block mt-0.5">No approved deposit</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenMemberDetail(member)}
                  className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition active:scale-95 cursor-pointer"
                  title="View Profile"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'bn' ? 'বিবরণ' : 'Details'}</span>
                </button>

                <button
                  onClick={() => setActiveCardMember(member)}
                  className="flex items-center justify-center gap-1 px-3.5 py-2 min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                  <span>Card</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
      )}

      {/* Digital Member Card Modal */}
      <DigitalMemberCardModal
        member={activeCardMember}
        isOpen={!!activeCardMember}
        onClose={() => setActiveCardMember(null)}
      />

      {/* Member Form Modal (Handles Create & Edit with All 16 Fields) */}
      <MemberFormModal
        isOpen={isAddModalOpen || !!editingMember}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMember(null);
        }}
        memberToEdit={editingMember}
      />

      {/* Card Template Editor Modal */}
      {isTemplateEditorOpen && (
        <CardTemplateEditorModal
          isOpen={isTemplateEditorOpen}
          onClose={() => setIsTemplateEditorOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <DeleteConfirmModal
          isOpen={!!memberToDelete}
          title="মেম্বার ডিলিট নিশ্চিতকরণ (Delete Member)"
          itemName={`${memberToDelete.fullName} (${memberToDelete.id})`}
          onClose={() => setMemberToDelete(null)}
          onConfirm={async (reason) => {
            await deleteMemberWithReason(memberToDelete.id, reason);
            setMemberToDelete(null);
          }}
        />
      )}

    </div>
  );
};
