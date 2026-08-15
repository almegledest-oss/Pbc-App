import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { RealEstateProject, InvestmentCategory, ProjectStatus, INVESTMENT_CATEGORIES } from '../../types';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  Plus, 
  X, 
  Calendar, 
  Users, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Archive,
  FileText,
  Warehouse,
  Hotel,
  Home,
  Utensils,
  HeartPulse,
  Factory,
  Tractor,
  Layers,
  FolderKanban
} from 'lucide-react';

export const ProjectList: React.FC = () => {
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    deleteProjectWithReason,
    language, 
    role 
  } = useApp();

  const labels = t[language];

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<RealEstateProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<RealEstateProject | null>(null);
  const [selectedGalleryProject, setSelectedGalleryProject] = useState<RealEstateProject | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    projectNameBn: '',
    category: 'Land' as InvestmentCategory,
    country: 'Bangladesh',
    city: 'Dhaka',
    address: '',
    investmentAmount: 0,
    currentValue: 0,
    profit: 0,
    investmentDate: new Date().toISOString().split('T')[0],
    status: 'Acquired' as ProjectStatus,
    photosStr: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    docName: '',
    docUrl: '',
    description: '',
    expectedRoiPercent: 0,
    totalInvestors: 1
  });

  const categoryIcons: Record<InvestmentCategory, React.ComponentType<{ className?: string }>> = {
    'Real Estate': Building2,
    'Land': MapPin,
    'Building': Building2,
    'Restaurant': Utensils,
    'Hospital': HeartPulse,
    'Hotel': Hotel,
    'Factory': Factory,
    'Agriculture': Tractor,
    'Warehouse': Warehouse,
    'Transport': Layers,
    'Other': FolderKanban
  };

  const countries = ['All', ...Array.from(new Set(projects.map(p => p.country).filter(Boolean)))];

  const filteredProjects = projects.filter(p => {
    if (role === 'member' && p.isArchived) {
      return false;
    }
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesCountry = countryFilter === 'All' || p.country === countryFilter;
    return matchesCat && matchesCountry;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName) return;

    const photosList = formData.photosStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const docs = (formData.docName && formData.docUrl) 
      ? [{ name: formData.docName, url: formData.docUrl }]
      : [];

    const calculatedProfit = formData.profit || (formData.currentValue - formData.investmentAmount);

    addProject({
      projectName: formData.projectName,
      projectNameBn: formData.projectNameBn,
      category: formData.category,
      country: formData.country,
      city: formData.city,
      address: formData.address,
      investmentAmount: Number(formData.investmentAmount),
      currentValue: Number(formData.currentValue),
      profit: Number(calculatedProfit),
      investmentDate: formData.investmentDate,
      purchaseDate: formData.investmentDate,
      status: formData.status,
      photos: photosList.length > 0 ? photosList : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
      documents: docs,
      description: formData.description,
      expectedRoiPercent: Number(formData.expectedRoiPercent),
      totalInvestors: Number(formData.totalInvestors)
    });

    setIsAddModalOpen(false);
    setFormData({
      projectName: '',
      projectNameBn: '',
      category: 'Land',
      country: 'Bangladesh',
      city: 'Dhaka',
      address: '',
      investmentAmount: 0,
      currentValue: 0,
      profit: 0,
      investmentDate: new Date().toISOString().split('T')[0],
      status: 'Acquired',
      photosStr: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      docName: '',
      docUrl: '',
      description: '',
      expectedRoiPercent: 0,
      totalInvestors: 1
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    updateProject(editingProject.id, editingProject);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Investment Portfolio {(role === 'super_admin' || role === 'admin') && `(${projects.length})`}
          </h2>
          <p className="text-xs text-slate-300">
            PBC Club premier investment categories, land, and asset acquisitions
          </p>
        </div>

        {(role === 'super_admin' || role === 'admin') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment</span>
          </button>
        )}
      </div>

      {/* 10 Investment Category Summary Grid */}
      <div>
        <h3 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2 uppercase tracking-wide">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Investment Categories</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {INVESTMENT_CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat] || Building2;
            const catProjects = projects.filter(p => p.category === cat && !p.isArchived);
            const projCount = catProjects.length;
            const totalInv = catProjects.reduce((sum, p) => sum + (p.investmentAmount || 0), 0);
            const totalProfit = catProjects.reduce((sum, p) => sum + (p.profit || 0), 0);
            const isSelected = categoryFilter === cat;

            return (
              <div
                key={cat}
                onClick={() => setCategoryFilter(isSelected ? 'All' : cat)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#112244] text-amber-300 border-[#D4AF37] shadow-xl'
                    : 'bg-[#0B1528] border-[#D4AF37]/30 hover:border-amber-400 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'bg-[#070D1B] text-amber-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-[#070D1B] text-slate-400'}`}>
                    Projects: {projCount}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold truncate text-white">{cat}</h4>
                  <div className="mt-1 space-y-0.5 text-[10px]">
                    <p className="text-slate-300">
                      Investment: <span className="font-semibold text-amber-300">৳{totalInv.toLocaleString()}</span>
                    </p>
                    <p className="text-emerald-400">
                      Profit: <span className="font-semibold">৳{totalProfit.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-lg flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-amber-300/80 shrink-0 uppercase tracking-wider">Filter Category:</span>
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              categoryFilter === 'All'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-[#070D1B] text-slate-300 border border-[#D4AF37]/20 hover:border-amber-400'
            }`}
          >
            All
          </button>
          {INVESTMENT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-[#070D1B] text-slate-300 border border-[#D4AF37]/20 hover:border-amber-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="px-3 py-1.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-amber-200 font-medium"
        >
          {countries.map(c => <option key={c} value={c} className="bg-[#070D1B] text-white">{c}</option>)}
        </select>
      </div>

      {/* Projects List Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#0B1528] rounded-3xl p-12 text-center border border-[#D4AF37]/30 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-amber-400/50" />
          <h4 className="text-base font-bold text-white">No Investments Found</h4>
          <p className="text-xs text-slate-400 mt-1">There are currently no investment projects listed in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            return (
              <div
                key={project.id}
                className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 shadow-xl hover:border-[#D4AF37] transition duration-300 overflow-hidden flex flex-col justify-between group text-white"
              >
                {/* Photo Banner with Badges */}
                <div 
                  className="relative h-52 overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedGalleryProject(project);
                    setGalleryIndex(0);
                  }}
                >
                  <img
                    src={project.photos?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                    alt={project.projectName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-black/30 to-transparent p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-[#070D1B]/90 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold rounded-lg border border-[#D4AF37]/40">
                        {project.id} • {project.category}
                      </span>

                      <span className="px-2.5 py-1 bg-emerald-500/80 backdrop-blur-md text-slate-950 font-black text-[10px] rounded-full">
                        {project.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-white leading-tight">
                        {project.projectName}
                      </h3>
                      <p className="text-xs text-amber-200 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{project.address ? `${project.address}, ` : ''}{project.city}, {project.country}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-[#070D1B] p-3 rounded-2xl border border-[#D4AF37]/20 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">INVESTMENT</span>
                      <span className="font-bold text-amber-300">
                        ৳{(project.investmentAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">CURRENT VALUE</span>
                      <span className="font-bold text-emerald-400">
                        ৳{(project.currentValue || 0).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">PROFIT / LOSS</span>
                      <span className="font-extrabold text-amber-400 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3 text-amber-400" />
                        ৳{(project.profit || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Documents list if present */}
                  {project.documents && project.documents.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] text-amber-300 font-bold block mb-1">PDF DOCUMENTS:</span>
                      <div className="flex flex-wrap gap-2">
                        {project.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold hover:bg-amber-500/30 transition"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{doc.name || 'Document PDF'}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investors & Date info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-300">{project.totalInvestors || 1} Expat Investors</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Date: {project.investmentDate || project.purchaseDate || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="px-5 py-3 bg-[#070D1B] border-t border-[#D4AF37]/20 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedGalleryProject(project);
                      setGalleryIndex(0);
                    }}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>View Photos ({(project.photos || []).length})</span>
                  </button>

                  {(role === 'super_admin' || role === 'admin') && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => updateProject(project.id, { isArchived: !project.isArchived })}
                        className="p-1.5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 rounded-md transition"
                        title={project.isArchived ? "Restore Investment" : "Archive Investment"}
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      {(role === 'super_admin' || role === 'admin') && (
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-md transition cursor-pointer"
                          title="Delete Investment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Gallery Modal */}
      {selectedGalleryProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-2xl w-full border border-slate-800 relative">
            <button
              onClick={() => setSelectedGalleryProject(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1">
              {selectedGalleryProject.projectName}
            </h3>
            <p className="text-xs text-amber-400 mb-4">
              {selectedGalleryProject.city}, {selectedGalleryProject.country} • {selectedGalleryProject.category}
            </p>

            <div className="relative h-72 rounded-2xl overflow-hidden mb-4 bg-black flex items-center justify-center">
              <img
                src={selectedGalleryProject.photos?.[galleryIndex] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                alt="Project Photo"
                className="w-full h-full object-cover"
              />

              {(selectedGalleryProject.photos || []).length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIndex((prev) => (prev > 0 ? prev - 1 : selectedGalleryProject.photos.length - 1))}
                    className="absolute left-2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGalleryIndex((prev) => (prev < selectedGalleryProject.photos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedGalleryProject.description}
            </p>
          </div>
        </div>
      )}

      {/* Add Investment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1528] text-white rounded-3xl p-6 max-w-lg w-full border-2 border-[#D4AF37]/40 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#070D1B] border border-[#D4AF37]/30"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-amber-300 mb-4 uppercase tracking-wider">
              Add New Investment
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Investment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PBC Purbachal Commercial Land"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as InvestmentCategory })}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    {INVESTMENT_CATEGORIES.map(c => (
                      <option key={c} value={c} className="bg-[#070D1B] text-white">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Approved" className="bg-[#070D1B] text-white">Approved</option>
                    <option value="Pending" className="bg-[#070D1B] text-white">Pending</option>
                    <option value="Planning" className="bg-[#070D1B] text-white">Planning</option>
                    <option value="Acquired" className="bg-[#070D1B] text-white">Acquired</option>
                    <option value="Under Construction" className="bg-[#070D1B] text-white">Under Construction</option>
                    <option value="Generating Yield" className="bg-[#070D1B] text-white">Generating Yield</option>
                    <option value="Sold" className="bg-[#070D1B] text-white">Sold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 21, Purbachal, Dhaka"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Investment Amount (৳)</label>
                  <input
                    type="number"
                    value={formData.investmentAmount === 0 ? '' : formData.investmentAmount}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, investmentAmount: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Value (৳)</label>
                  <input
                    type="number"
                    value={formData.currentValue === 0 ? '' : formData.currentValue}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, currentValue: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Profit/Loss (৳)</label>
                  <input
                    type="number"
                    value={formData.profit === 0 ? '' : formData.profit}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, profit: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Investment Date</label>
                <input
                  type="date"
                  value={formData.investmentDate}
                  onChange={e => setFormData({ ...formData, investmentDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URLs (comma separated)</label>
                <input
                  type="text"
                  value={formData.photosStr}
                  onChange={e => setFormData({ ...formData, photosStr: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PDF Document Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Deed Agreement"
                    value={formData.docName}
                    onChange={e => setFormData({ ...formData, docName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PDF Document URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.docUrl}
                    onChange={e => setFormData({ ...formData, docUrl: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-md transition cursor-pointer"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Investment Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1528] text-white rounded-3xl p-6 max-w-md w-full border-2 border-[#D4AF37]/40 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#070D1B] border border-[#D4AF37]/30"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-amber-300 mb-4 uppercase tracking-wider">
              Edit Investment
            </h3>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Investment Name</label>
                <input
                  type="text"
                  value={editingProject.projectName}
                  onChange={e => setEditingProject({ ...editingProject, projectName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={editingProject.category}
                  onChange={e => setEditingProject({ ...editingProject, category: e.target.value as InvestmentCategory })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  {INVESTMENT_CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#070D1B] text-white">{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Investment Amount (৳)</label>
                  <input
                    type="number"
                    value={editingProject.investmentAmount === 0 ? '' : editingProject.investmentAmount}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingProject({ ...editingProject, investmentAmount: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Value (৳)</label>
                  <input
                    type="number"
                    value={editingProject.currentValue === 0 ? '' : editingProject.currentValue}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingProject({ ...editingProject, currentValue: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Profit/Loss (৳)</label>
                  <input
                    type="number"
                    value={editingProject.profit === 0 ? '' : editingProject.profit}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingProject({ ...editingProject, profit: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={e => setEditingProject({ ...editingProject, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Approved" className="bg-[#070D1B] text-white">Approved</option>
                    <option value="Pending" className="bg-[#070D1B] text-white">Pending</option>
                    <option value="Planning" className="bg-[#070D1B] text-white">Planning</option>
                    <option value="Acquired" className="bg-[#070D1B] text-white">Acquired</option>
                    <option value="Under Construction" className="bg-[#070D1B] text-white">Under Construction</option>
                    <option value="Generating Yield" className="bg-[#070D1B] text-white">Generating Yield</option>
                    <option value="Sold" className="bg-[#070D1B] text-white">Sold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProject.description || ''}
                  onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
        <DeleteConfirmModal
          isOpen={!!projectToDelete}
          title="প্রজেক্ট ডিলিট নিশ্চিতকরণ (Delete Project)"
          itemName={`Project ${projectToDelete.projectName} (${projectToDelete.id})`}
          onClose={() => setProjectToDelete(null)}
          onConfirm={async (reason) => {
            await deleteProjectWithReason(projectToDelete.id, reason);
            setProjectToDelete(null);
          }}
        />
      )}

    </div>
  );
};
