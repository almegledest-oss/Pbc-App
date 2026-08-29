import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RealEstateProject, resolveProjectCategory } from '../../types';
import { ProjectAllocationModal } from './ProjectAllocationModal';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Layers, 
  FileText, 
  Sparkles, 
  Maximize2,
  Percent,
  Wallet,
  Shield
} from 'lucide-react';

interface ProjectDetailViewProps {
  projectId: string;
  onBack?: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId, onBack }) => {
  const { 
    projects, 
    members, 
    role, 
    language, 
    goBack, 
    navigateWithHistory,
    updateProject 
  } = useApp();

  const isBn = language === 'bn';
  const isAdmin = role === 'super_admin' || role === 'admin';
  const project = projects.find(p => p.id === projectId);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="bg-[#0B1528] rounded-3xl p-8 sm:p-12 text-center border border-[#D4AF37]/30 text-white max-w-2xl mx-auto shadow-2xl">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-amber-400/50" />
        <h3 className="text-xl font-bold mb-2">{isBn ? 'প্রজেক্ট পাওয়া যায়নি' : 'Project Not Found'}</h3>
        <p className="text-sm text-slate-400 mb-6">
          {isBn ? `প্রজেক্ট আইডি (${projectId}) সিস্টেমে খুঁজে পাওয়া যায়নি।` : `Project ID (${projectId}) was not found.`}
        </p>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : goBack())}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition"
        >
          {isBn ? '← ইনভেস্টমেন্ট তালিকায় ফিরুন' : '← Back to Projects'}
        </button>
      </div>
    );
  }

  const photos = project.photos && project.photos.length > 0
    ? project.photos
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  const totalAllocated = project.memberAllocations?.reduce((sum, a) => sum + (Number(a.allocatedAmount) || 0), 0) || 0;
  const targetAmount = Number(project.investmentAmount) || 0;
  const fundedPercent = targetAmount > 0 ? Math.min(100, (totalAllocated / targetAmount) * 100) : 0;
  const projectRoi = project.expectedRoiPercent || (targetAmount > 0 ? (((project.profit || 0) / targetAmount) * 100).toFixed(1) : 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-white animate-fadeIn pb-16">
      
      {/* Top Header with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1528] p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : goBack())}
          className="flex items-center gap-2 px-4 py-2 bg-[#070D1B] hover:bg-[#112244] text-amber-300 rounded-xl border border-[#D4AF37]/40 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{isBn ? '← সকল ইনভেস্টমেন্ট প্রজেক্ট' : '← All Projects'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono text-xs font-bold">
            {project.id}
          </span>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold capitalize">
            {resolveProjectCategory(project)}
          </span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
            project.status === 'Active' || project.status === 'Acquired'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Main Image Carousel & Overview */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 overflow-hidden shadow-2xl">
        <div className="relative h-72 sm:h-96 w-full bg-slate-950 overflow-hidden group">
          <img
            src={photos[activePhotoIdx]}
            alt={project.projectName}
            className="w-full h-full object-cover transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-black/40" />

          {/* Photo navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActivePhotoIdx(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Photo thumbnails counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-amber-300 border border-amber-500/30">
                Photo {activePhotoIdx + 1} / {photos.length}
              </div>
            </>
          )}
        </div>

        {/* Project Title and Stats Header */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                {project.projectName}
              </h1>
              {project.projectNameBn && (
                <h2 className="text-base font-bold text-amber-300/90 mt-1">
                  {project.projectNameBn}
                </h2>
              )}
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{[project.address, project.city, project.country].filter(Boolean).join(', ')}</span>
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAllocationModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>{isBn ? 'মেম্বার ইনভেস্টমেন্ট অ্যালোকেশন' : 'Allocate Members'}</span>
              </button>
            )}
          </div>

          {/* 4 Core Financial Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#070D1B] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? 'মোট ইনভেস্টমেন্ট বাজেট' : 'Total Investment'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                ৳{Number(project.investmentAmount).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">BDT Target Capital</span>
            </div>

            <div className="bg-[#070D1B] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? 'বর্তমান বাজার মূল্য' : 'Current Valuation'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
                ৳{Number(project.currentValue || project.investmentAmount).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">BDT Estimated Market Value</span>
            </div>

            <div className="bg-[#070D1B] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? 'প্রত্যাশিত বা অর্জিত লাভ' : 'Profit / Return'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                ৳{Number(project.profit || 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-500 block mt-0.5">ROI: ~{projectRoi}%</span>
            </div>

            <div className="bg-[#070D1B] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? 'মোট অংশীদার (Investors)' : 'Total Investors'}
              </span>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">
                {project.memberAllocations?.length || project.totalInvestors || 0}
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Club Members Allocated</span>
            </div>
          </div>

          {/* Funding Progress Bar */}
          <div className="bg-[#070D1B] p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">
                {isBn ? 'ফান্ডিং অগ্রগতি (Allocated Fund):' : 'Funding Progress:'}
              </span>
              <span className="text-amber-300">
                ৳{totalAllocated.toLocaleString()} / ৳{targetAmount.toLocaleString()} ({fundedPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, fundedPercent)}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="bg-[#070D1B] p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'প্রজেক্টের বিবরণ ও পটভূমি' : 'Project Overview & Objectives'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Member Allocations Table */}
      <div className="bg-[#0B1528] rounded-3xl border border-[#D4AF37]/30 p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>{isBn ? 'এই প্রজেক্টে যুক্ত সম্মানিত মেম্বারদের তালিকা' : 'Allocated Member Investors'}</span>
          </h3>
          <span className="px-3 py-1 bg-[#070D1B] text-amber-300 rounded-xl text-xs font-bold border border-slate-800">
            {project.memberAllocations?.length || 0} Investors
          </span>
        </div>

        {(!project.memberAllocations || project.memberAllocations.length === 0) ? (
          <div className="text-center py-8 text-slate-400 bg-[#070D1B] rounded-2xl border border-slate-800">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-xs sm:text-sm">{isBn ? 'এই প্রজেক্টে এখনো কোনো মেম্বার এলোকেট করা হয়নি।' : 'No members allocated to this project yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070D1B] text-amber-300 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Allocated Amount</th>
                  <th className="py-3 px-4">Share %</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {project.memberAllocations.map(alloc => (
                  <tr key={alloc.memberId} className="hover:bg-[#112244]/50 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      {alloc.memberName} <span className="text-[10px] text-amber-400">({alloc.memberId})</span>
                    </td>
                    <td className="py-3 px-4 font-black text-amber-300">
                      ৳{Number(alloc.allocatedAmount).toLocaleString()} BDT
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      {targetAmount > 0 ? `${((Number(alloc.allocatedAmount) / targetAmount) * 100).toFixed(2)}%` : '0%'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {alloc.allocationDate || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          navigateWithHistory({
                            tab: 'members',
                            subView: 'member_detail',
                            subId: alloc.memberId,
                            title: alloc.memberName,
                            titleBn: alloc.memberName,
                            isFocusMode: true
                          });
                        }}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        {isBn ? 'মেম্বার প্রোফাইল' : 'View Profile'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Modal for Admins */}
      {isAllocationModalOpen && (
        <ProjectAllocationModal
          project={project}
          isOpen={isAllocationModalOpen}
          onClose={() => setIsAllocationModalOpen(false)}
        />
      )}

    </div>
  );
};
