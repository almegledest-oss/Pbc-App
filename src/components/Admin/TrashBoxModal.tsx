import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrashedItem } from '../../types';
import { 
  Trash2, 
  RotateCcw, 
  X, 
  ShieldAlert, 
  Sparkles, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  Lock, 
  ShieldCheck, 
  Search,
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TrashBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrashBoxModal: React.FC<TrashBoxModalProps> = ({ isOpen, onClose }) => {
  const { 
    trashedItems, 
    restoreTrashedItem, 
    permanentlyDeleteTrashedItem, 
    emptyTrashBox, 
    role, 
    language, 
    systemSettings, 
    updateSystemSettings, 
    users, 
    members,
    authUser,
    currentMember 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAccessControlOpen, setIsAccessControlOpen] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Access Permission Check
  const currentUserEmail = (authUser?.email || currentMember?.email || '').toLowerCase().trim();
  const currentUserId = currentMember?.id || '';
  const allowedAdmins = systemSettings.trashBoxAccessAdmins || [];

  const isSuperAdmin = role === 'super_admin';
  const hasAccess = isSuperAdmin || (
    role === 'admin' && (
      allowedAdmins.includes(currentUserEmail) || 
      allowedAdmins.includes(currentUserId)
    )
  );

  // Filter & Search Items
  const filteredItems = trashedItems.filter(item => {
    const matchesType = activeFilter === 'all' || item.itemType.toLowerCase() === activeFilter.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) ||
      item.reason.toLowerCase().includes(searchLower) ||
      item.deletedByEmail.toLowerCase().includes(searchLower) ||
      item.deletedByName.toLowerCase().includes(searchLower) ||
      item.originalId.toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  const handleRestore = async (item: TrashedItem) => {
    try {
      setProcessingId(item.id);
      await restoreTrashedItem(item.id);
    } catch (err) {
      console.error('Error restoring item:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই আইটেমটি ট্র্যাশ বক্স থেকে স্থায়ীভাবে মুছে ফেলতে চান? এটি আর কখনই ফিরিয়ে আনা যাবে না।' : 'Are you sure you want to permanently delete this item from the Trash Box? This cannot be undone.')) {
      try {
        setProcessingId(id);
        await permanentlyDeleteTrashedItem(id);
      } catch (err) {
        console.error('Error deleting trash item:', err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে সমস্ত ট্র্যাশ আইটেম খালি করে স্থায়ীভাবে মুছে ফেলতে চান?' : 'Are you sure you want to empty the entire Trash Box permanently?')) {
      await emptyTrashBox();
    }
  };

  const toggleAdminAccess = async (adminIdentifier: string) => {
    if (!isSuperAdmin) return;
    const currentList = systemSettings.trashBoxAccessAdmins || [];
    const cleanId = adminIdentifier.toLowerCase().trim();
    let updatedList: string[];

    if (currentList.includes(cleanId)) {
      updatedList = currentList.filter(e => e !== cleanId);
    } else {
      updatedList = [...currentList, cleanId];
    }

    await updateSystemSettings({
      trashBoxAccessAdmins: updatedList
    });
  };

  // Compile list of admins for Super Admin Access Control
  const adminList = members
    .filter(m => m.role === 'admin' || m.role === 'super_admin')
    .map(m => ({
      id: m.id,
      name: m.fullName,
      email: m.email,
      role: m.role
    }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-[#070D1B] rounded-3xl p-5 sm:p-6 max-w-4xl w-full max-h-[92vh] flex flex-col border border-amber-500/40 relative shadow-2xl text-white my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-amber-400 rounded-2xl border border-amber-500/40 shrink-0">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
                <span>{language === 'bn' ? 'ট্র্যাশ বক্স / রিকভারি বিন' : 'Trash Box / Recovery Bin'}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {trashedItems.length} {language === 'bn' ? 'টি আইটেম' : 'Items'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {language === 'bn' ? 'ডিলিট হওয়া সমস্ত ডেটা দেখতে ও প্রয়োজনমত রিস্টোর করতে ট্র্যাশ বক্স ব্যবহার করুন।' : 'View and restore deleted records back to active system.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-[#0B1528] hover:bg-slate-800 text-slate-300 rounded-full border border-[#D4AF37]/30 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        {!hasAccess ? (
          /* Permission Denied Banner */
          <div className="p-8 text-center my-auto space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/40 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-white">
              {language === 'bn' ? 'ট্র্যাশ বক্স এক্সেস সুরক্ষিত' : 'Trash Box Access Restricted'}
            </h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              {language === 'bn'
                ? 'আপনার একাউন্টে ট্র্যাশ বক্স খোলার অনুমতি নেই। ট্র্যাশ বক্স থেকে ডেটা রিস্টোর বা দেখতে চাইলে সিস্টেম অ্যাডমিন (System Admin) এর নিকট এক্সেসের জন্য অনুরোধ করুন।'
                : 'You do not have permission to access the Trash Box. Only System Admin or authorized Admins can view and restore deleted records.'}
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-amber-500/20 text-amber-300 font-extrabold rounded-xl border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
            
            {/* Super Admin Access Control Toggle Card */}
            {isSuperAdmin && (
              <div className="bg-[#0B1528] border border-amber-500/40 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'সিস্টেম অ্যাডমিন: এডমিন ট্র্যাশ বক্স পারমিশন কন্ট্রোল' : 'System Admin: Admin Trash Box Permissions'}</span>
                  </div>
                  <button
                    onClick={() => setIsAccessControlOpen(!isAccessControlOpen)}
                    className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition cursor-pointer"
                  >
                    {isAccessControlOpen ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'পারমিশন পরিবর্তন করুন' : 'Manage Access')}
                  </button>
                </div>

                {isAccessControlOpen && (
                  <div className="pt-2 border-t border-amber-500/20 space-y-2">
                    <p className="text-[11px] text-slate-300">
                      {language === 'bn'
                        ? 'যে সকল এডমিনদের ট্র্যাশ বক্স দেখার ও ডেটা রিস্টোর করার পারমিশন দিতে চান তাদের নির্বাচন করুন:'
                        : 'Select admins who are granted permission to access the Trash Box and restore records:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {adminList.map(admin => {
                        const adminEmailClean = (admin.email || '').toLowerCase().trim();
                        const isGranted = admin.role === 'super_admin' || allowedAdmins.includes(adminEmailClean) || allowedAdmins.includes(admin.id);
                        
                        return (
                          <div
                            key={admin.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition ${
                              isGranted
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                                : 'bg-[#070D1B] border-[#D4AF37]/20 text-slate-400'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{admin.name}</span>
                              <span className="text-[10px] text-slate-400 truncate block">{admin.email} ({admin.id})</span>
                            </div>

                            {admin.role === 'super_admin' ? (
                              <span className="text-[10px] px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-md">
                                System Admin
                              </span>
                            ) : (
                              <button
                                onClick={() => toggleAdminAccess(admin.email)}
                                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border transition cursor-pointer shrink-0 ${
                                  isGranted
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                                    : 'bg-[#0B1528] text-slate-300 border-slate-600 hover:border-amber-400'
                                }`}
                              >
                                {isGranted ? (language === 'bn' ? '✓ পারমিশন দেয়া' : '✓ Allowed') : (language === 'bn' ? '+ পারমিশন দিন' : '+ Grant')}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0B1528] p-3 rounded-2xl border border-[#D4AF37]/30">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: language === 'bn' ? 'সকল (All)' : 'All' },
                  { id: 'deposit', label: language === 'bn' ? 'ডিপোজিট' : 'Deposit' },
                  { id: 'member', label: language === 'bn' ? 'মেম্বার' : 'Member' },
                  { id: 'director', label: language === 'bn' ? 'পরিচালক' : 'Director' },
                  { id: 'project', label: language === 'bn' ? 'প্রকল্প' : 'Project' },
                  { id: 'report', label: language === 'bn' ? 'রিপোর্ট' : 'Report' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-[#070D1B] text-slate-300 hover:text-amber-300 border border-[#D4AF37]/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative shrink-0 sm:w-56">
                <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'ট্র্যাশে খুঁজুন...' : 'Search trash...'}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

            </div>

            {/* Trash Items List */}
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-[#0B1528] rounded-3xl border border-[#D4AF37]/20 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400/80 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">
                  {language === 'bn' ? 'ট্র্যাশ বক্সে কোনো আইটেম পাওয়া যায়নি' : 'No items found in Trash Box'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'কোনো ডিলিট হওয়া রেকর্ড ট্র্যাশে বর্তমানে জমা নেই।' : 'Deleted records will appear here for safety & recovery.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <div 
                    key={item.id}
                    className="p-4 bg-[#0B1528] hover:bg-[#112244] border border-[#D4AF37]/30 rounded-2xl transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Item Meta */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {item.itemType}
                        </span>
                        <span className="text-[11px] font-mono text-amber-300">
                          ID: {item.originalId}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          {new Date(item.deletedAt).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-white tracking-wide break-words">
                        {item.title}
                      </h4>

                      {/* Deletion Reason Display */}
                      <div className="p-2.5 bg-[#070D1B] rounded-xl border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-400 mr-1">
                            {language === 'bn' ? 'ডিলিটের কারণ:' : 'Reason:'}
                          </span>
                          <span>{item.reason}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {language === 'bn' ? 'দ্বারা ডিলিট করা হয়েছে:' : 'Deleted By:'} <span className="text-white font-semibold">{item.deletedByName || item.deletedByEmail}</span> ({item.deletedByRole})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
                      <button
                        onClick={() => handleRestore(item)}
                        disabled={processingId === item.id}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                        title={language === 'bn' ? 'এক্টিভ সিস্টেমে পুনরায় ফিরিয়ে আনুন' : 'Restore to active list'}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ফিরে আনুন (Restore)' : 'Restore'}</span>
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          disabled={processingId === item.id}
                          className="px-3 py-2 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl border border-rose-500/30 transition active:scale-95 cursor-pointer flex items-center gap-1"
                          title={language === 'bn' ? 'ট্র্যাশ থেকে চিরতরে মুছে ফেলুন' : 'Delete permanently'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{language === 'bn' ? 'স্থায়ী মুছুন' : 'Delete'}</span>
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Modal Bottom Bar */}
            {isSuperAdmin && trashedItems.length > 0 && (
              <div className="pt-3 flex items-center justify-between border-t border-amber-500/20">
                <button
                  onClick={handleEmptyTrash}
                  className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সম্পূর্ণ ট্র্যাশ খালি করুন (Empty Trash)' : 'Empty Entire Trash'}</span>
                </button>

                <span className="text-[11px] text-slate-400 italic">
                  {language === 'bn' ? 'ট্র্যাশ বক্সে থাকা সমস্ত ফাইল নিরাপদ রাখা হয়েছে' : 'All trashed items are securely isolated'}
                </span>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
