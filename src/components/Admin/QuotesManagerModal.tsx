import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Quote, 
  Sparkles, 
  Eye, 
  TrendingUp, 
  Briefcase, 
  Award, 
  Lightbulb, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle,
  Wand2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QuoteItem } from '../../types';

export const QuotesManagerModal: React.FC = () => {
  const { 
    quotes, 
    addQuote, 
    updateQuote, 
    deleteQuote, 
    isQuotesManagerOpen, 
    setIsQuotesManagerOpen, 
    language,
    addNotification
  } = useApp();

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [quoteText, setQuoteText] = useState('');
  const [author, setAuthor] = useState('');
  const [authorDesignation, setAuthorDesignation] = useState('Director & Investor, PBC');
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState('');
  const [category, setCategory] = useState<'Investment' | 'Business' | 'Savings' | 'Motivation' | 'Leadership'>('Investment');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuotesManagerOpen) return null;

  const resetForm = () => {
    setQuoteText('');
    setAuthor('');
    setAuthorDesignation('Director & Investor, PBC');
    setAuthorPhotoUrl('');
    setCategory('Investment');
    setIsActive(true);
    setDisplayOrder((quotes.length || 0) + 1);
    setEditingQuoteId(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (item: QuoteItem) => {
    setEditingQuoteId(item.id);
    setQuoteText(item.quote);
    setAuthor(item.author);
    setAuthorDesignation(item.authorDesignation || '');
    setAuthorPhotoUrl(item.authorPhotoUrl || '');
    setCategory(item.category || 'Investment');
    setIsActive(item.isActive !== false);
    setDisplayOrder(item.displayOrder ?? 1);
    setShowAddForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim() || !author.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে উক্তি ও লেখকের নাম লিখুন।' : 'Please enter the quote text and author name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingQuoteId) {
        await updateQuote(editingQuoteId, {
          quote: quoteText.trim(),
          quoteBn: quoteText.trim(),
          author: author.trim(),
          authorDesignation: authorDesignation.trim(),
          authorPhotoUrl: authorPhotoUrl.trim(),
          category,
          isActive,
          displayOrder: Number(displayOrder) || 1
        });
        addNotification(
          language === 'bn' ? 'উক্তি আপডেট সম্পন্ন' : 'Quote Updated',
          language === 'bn' ? 'উক্তিটি সফলভাবে আপডেট করা হয়েছে।' : 'Quote updated successfully.',
          'system'
        );
      } else {
        await addQuote({
          quote: quoteText.trim(),
          quoteBn: quoteText.trim(),
          author: author.trim(),
          authorDesignation: authorDesignation.trim(),
          authorPhotoUrl: authorPhotoUrl.trim(),
          category,
          isActive,
          displayOrder: Number(displayOrder) || 1
        });
        addNotification(
          language === 'bn' ? 'নতুন উক্তি যুক্ত হয়েছে' : 'New Quote Added',
          language === 'bn' ? 'নতুন উক্তি সফলভাবে ড্যাশবোর্ডে যোগ করা হয়েছে।' : 'New quote added to dashboard successfully.',
          'system'
        );
      }
      resetForm();
    } catch (err: any) {
      console.error('Failed to save quote:', err);
      alert(err.message || 'Failed to save quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, quoteTitle: string) => {
    const confirmMsg = language === 'bn' 
      ? `আপনি কি নিশ্চিত যে এই উক্তিটি ডিলিট করতে চান?\n"${quoteTitle}"`
      : `Are you sure you want to delete this quote?\n"${quoteTitle}"`;
    
    if (window.confirm(confirmMsg)) {
      await deleteQuote(id);
      addNotification(
        language === 'bn' ? 'উক্তি ডিলিট করা হয়েছে' : 'Quote Deleted',
        language === 'bn' ? 'উক্তিটি তালিকা থেকে মুছে ফেলা হয়েছে।' : 'Quote deleted successfully.',
        'system'
      );
      if (editingQuoteId === id) resetForm();
    }
  };

  const handleToggleActive = async (item: QuoteItem) => {
    const newStatus = item.isActive === false;
    await updateQuote(item.id, { isActive: newStatus });
  };

  const applyTemplate = (templateQuote: string, templateAuthor: string, templateDesig: string, templateCat: any) => {
    setQuoteText(templateQuote);
    setAuthor(templateAuthor);
    setAuthorDesignation(templateDesig);
    setCategory(templateCat);
    setShowAddForm(true);
  };

  const sampleTemplates = [
    {
      quote: 'টাকা শুধু জমালে মূল্য হারায়, কিন্তু দূরদর্শী যৌথ উদ্যোগে খাটালে তা প্রজন্মের সম্পদে পরিণত হয়।',
      author: 'Probashi Business Club',
      desig: 'PBC Investment Advisory',
      cat: 'Investment' as const
    },
    {
      quote: 'সফলতার কোনো গোপনীয় চাবিকাঠি নেই; এটি সঠিক পরিকল্পনা, কঠোর পরিশ্রম ও উপযুক্ত বিনিয়োগের ফল।',
      author: 'Colin Powell',
      desig: 'Leadership Philosophy',
      cat: 'Motivation' as const
    },
    {
      quote: 'ঝুঁকি না নিয়ে কোনো বড় ব্যবসা তৈরি হয় না, তবে সবচেয়ে বড় ঝুঁকি হলো কোনো সুচিন্তিত পরিকল্পনা ছাড়া চলা।',
      author: 'Warren Buffett',
      desig: 'Business Guru',
      cat: 'Business' as const
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/50 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                {language === 'bn' ? 'দৈনিক উক্তি ও মোটিভেশন ম্যানেজমেন্ট' : 'Daily Motivation & Quotes Manager'}
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {language === 'bn' ? 'হোম ড্যাশবোর্ডে প্রদর্শিত অনুপ্রেরণাদায়ক উক্তি পরিচালনা করুন' : 'Manage inspirational quotes shown on the home dashboard banner'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsQuotesManagerOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Top Actions: Add New Quote Button */}
          {!showAddForm && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  {language === 'bn' ? 'নতুন উক্তি যুক্ত করতে চান?' : 'Want to add a new quote?'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'bn' ? `বর্তমান মোট উক্তি: ${quotes.length} টি` : `Total active quotes: ${quotes.length}`}
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-950/40 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন উক্তি লিখুন' : 'Add New Quote'}</span>
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
          {showAddForm && (
            <form onSubmit={handleSave} className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Edit3 className="w-4 h-4" />
                  <span>
                    {editingQuoteId 
                      ? (language === 'bn' ? 'উক্তি সম্পাদনা করুন' : 'Edit Quote') 
                      : (language === 'bn' ? 'নতুন উক্তি ফরম' : 'New Quote Form')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>

              {/* Quote Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'bn' ? 'উক্তির মূল কথা (বাংলা বা ইংরেজি) *' : 'Quote Text *'}
                </label>
                <textarea
                  rows={3}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: আপনি যত বেশি ঘাম ঝরাবেন, শরীর তত ক্লান্ত হবে...' : 'Enter inspirational quote text...'}
                  required
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden transition"
                />
              </div>

              {/* Author & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'লেখকের নাম *' : 'Author Name *'}
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Shakil Rana"
                    required
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পদবি / উপাধি' : 'Author Designation'}
                  </label>
                  <input
                    type="text"
                    value={authorDesignation}
                    onChange={(e) => setAuthorDesignation(e.target.value)}
                    placeholder="e.g. Director & Investor, PBC"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden transition"
                  />
                </div>
              </div>

              {/* Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-hidden transition"
                  >
                    <option value="Investment">Investment (ইনভেস্টমেন্ট)</option>
                    <option value="Business">Business (ব্যবসা)</option>
                    <option value="Motivation">Motivation (মোটিভেশন)</option>
                    <option value="Savings">Savings (সঞ্চয়)</option>
                    <option value="Leadership">Leadership (নেতৃত্ব)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'ক্রম (Order)' : 'Display Order'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                  </label>
                  <div className="flex items-center gap-2 h-9">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        {isActive ? (language === 'bn' ? 'সক্রিয় (Active)' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-950/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') 
                      : (editingQuoteId ? (language === 'bn' ? 'আপডেট করুন' : 'Update Quote') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Quote'))}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Pre-made Templates */}
          {!showAddForm && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-3">
                <Wand2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রেডিমেড বিজনেস মোটিভেশন টেমপ্লেট (১-ক্লিকে যোগ করুন)' : 'Pre-made Templates (1-Click Add)'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sampleTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(t.quote, t.author, t.desig, t.cat)}
                    className="p-3 text-left rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/40 transition group cursor-pointer"
                  >
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-serif group-hover:text-amber-200">
                      "{t.quote}"
                    </p>
                    <div className="mt-2 text-[11px] font-bold text-amber-400 flex items-center justify-between">
                      <span>— {t.author}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-amber-300 font-normal">{t.cat}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quotes List Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>{language === 'bn' ? 'বিদ্যমান উক্তির তালিকা' : 'Existing Quotes'} ({quotes.length})</span>
              <span>{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</span>
            </div>

            {quotes.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/30 rounded-2xl border border-slate-800/60 text-slate-400">
                <Quote className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{language === 'bn' ? 'কোনো উক্তি পাওয়া যায়নি।' : 'No quotes found.'}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {quotes.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      item.isActive !== false
                        ? 'bg-slate-950/60 border-slate-800 hover:border-amber-400/40'
                        : 'bg-slate-950/30 border-slate-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 mt-0.5">
                        {item.displayOrder || idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 font-serif leading-relaxed line-clamp-2">
                          "{item.quote}"
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs font-bold text-amber-300">
                            — {item.author}
                          </span>
                          {item.authorDesignation && (
                            <span className="text-[11px] text-slate-400">
                              ({item.authorDesignation})
                            </span>
                          )}
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                            {item.category || 'Motivation'}
                          </span>
                          {item.isActive !== false ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-rose-950/80 text-rose-300 font-semibold border border-rose-500/30">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          item.isActive !== false
                            ? 'text-emerald-400 hover:bg-emerald-500/15'
                            : 'text-slate-500 hover:bg-slate-800'
                        }`}
                        title={item.isActive !== false ? 'Deactivate quote' : 'Activate quote'}
                      >
                        {item.isActive !== false ? 'Active' : 'Enable'}
                      </button>

                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Quote"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.quote)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'উক্তিগুলো স্বয়ংক্রিয়ভাবে স্লাইড হতে থাকবে' : 'Quotes auto-rotate on the dashboard banner'}</span>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsQuotesManagerOpen(false);
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
