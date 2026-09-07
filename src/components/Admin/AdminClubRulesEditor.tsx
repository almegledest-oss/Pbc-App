import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_CLUB_RULES, ClubRuleCategory, ClubRuleItem } from '../../data/defaultClubRules';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Check, 
  ArrowLeft, 
  Layers, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface AdminClubRulesEditorProps {
  onBack: () => void;
}

export const AdminClubRulesEditor: React.FC<AdminClubRulesEditorProps> = ({ onBack }) => {
  const { systemSettings, updateSystemSettings, language } = useApp();
  const isBn = language === 'bn';

  const [rulesData, setRulesData] = useState<ClubRuleCategory[]>(() => {
    if (systemSettings.clubRules && Array.isArray(systemSettings.clubRules) && systemSettings.clubRules.length > 0) {
      return JSON.parse(JSON.stringify(systemSettings.clubRules));
    }
    return JSON.parse(JSON.stringify(DEFAULT_CLUB_RULES));
  });

  const [lastUpdated, setLastUpdated] = useState<string>(
    systemSettings.clubRulesLastUpdated || new Date().toISOString().split('T')[0]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update Category Title
  const handleUpdateCategory = (catId: string, field: 'nameBn' | 'nameEn' | 'categoryNumber', value: string) => {
    setRulesData(prev => prev.map(cat => {
      if (cat.id === catId) {
        return { ...cat, [field]: value };
      }
      return cat;
    }));
  };

  // Update Specific Rule
  const handleUpdateRule = (catId: string, ruleId: string, field: keyof ClubRuleItem, value: string) => {
    setRulesData(prev => prev.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          rules: cat.rules.map(r => {
            if (r.id === ruleId) {
              return { ...r, [field]: value };
            }
            return r;
          })
        };
      }
      return cat;
    }));
  };

  // Add New Rule to Category
  const handleAddRule = (catId: string) => {
    const targetCat = rulesData.find(c => c.id === catId);
    const count = targetCat ? targetCat.rules.length + 1 : 1;
    const catNum = targetCat ? targetCat.categoryNumber : '১';

    const newRule: ClubRuleItem = {
      id: `rule_${Date.now()}`,
      number: `${catNum}.${count}`,
      titleBn: 'নতুন ধারার শিরোনাম',
      titleEn: 'New Clause Title',
      descriptionBn: 'ধারার বিস্তারিত বিবরণ এখানে বাংলায় লিখুন...',
      descriptionEn: 'Enter detailed clause description in English here...'
    };

    setRulesData(prev => prev.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          rules: [...cat.rules, newRule]
        };
      }
      return cat;
    }));
  };

  // Delete Rule
  const handleDeleteRule = (catId: string, ruleId: string) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিত যে এই ধারাটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this clause?')) {
      return;
    }
    setRulesData(prev => prev.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          rules: cat.rules.filter(r => r.id !== ruleId)
        };
      }
      return cat;
    }));
  };

  // Add New Chapter / Category
  const handleAddCategory = () => {
    const catNum = `${rulesData.length + 1}`;
    const newCat: ClubRuleCategory = {
      id: `cat_${Date.now()}`,
      categoryNumber: catNum,
      nameBn: 'নতুন অধ্যায়ের নাম',
      nameEn: 'New Chapter Name',
      iconName: 'BookOpen',
      rules: [
        {
          id: `rule_${Date.now()}_1`,
          number: `${catNum}.১`,
          titleBn: 'প্রথম ধারার শিরোনাম',
          titleEn: 'First Clause Title',
          descriptionBn: 'ধারার বিস্তারিত নিয়মাবলী এখানে লিখুন...',
          descriptionEn: 'Detailed description here...'
        }
      ]
    };
    setRulesData(prev => [...prev, newCat]);
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (!window.confirm(isBn ? 'এই অধ্যায়টি সম্পূর্ণ মুছে ফেলতে চান?' : 'Delete this entire chapter?')) {
      return;
    }
    setRulesData(prev => prev.filter(c => c.id !== catId));
  };

  // Reset to Default Constitution
  const handleResetToDefault = () => {
    if (window.confirm(isBn ? 'আপনি কি পূর্বনির্ধারিত গঠনতন্ত্র ও নীতিমালায় ফিরে যেতে চান? (সব পরিবর্তন রিসেট হবে)' : 'Reset to original default constitution? All custom changes will be overwritten.')) {
      setRulesData(JSON.parse(JSON.stringify(DEFAULT_CLUB_RULES)));
    }
  };

  // Save changes to SystemSettings in Firestore
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await updateSystemSettings({
        clubRules: rulesData,
        clubRulesLastUpdated: todayDate
      });
      setLastUpdated(todayDate);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save rules:', e);
      alert(isBn ? 'সংরক্ষণে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' : 'Failed to save rules. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      
      {/* Top Bar with Back & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1528] border-2 border-[#D4AF37]/30 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#070D1B] hover:bg-[#112244] text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                {isBn ? 'ক্লাবের নীতিমালা ও গঠনতন্ত্র এডিটর' : 'Club By-Laws & Constitution Editor'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn 
                ? 'এখান থেকে যেকোনো অধ্যায় বা ধারার নাম, বর্ণনা পরিবর্তন, নতুন ধারা যোগ বা ডিলিট করতে পারবেন' 
                : 'Modify clauses, titles, create new chapters, or delete outdated rules'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-3 py-2.5 bg-[#070D1B] hover:bg-[#112244] text-slate-300 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title={isBn ? 'ডিফল্ট নীতিমালায় রিসেট' : 'Reset to Default'}
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset'}</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-lg ${
              saveSuccess
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>{isBn ? 'সংরক্ষিত হয়েছে!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? (isBn ? 'সেভ হচ্ছে...' : 'Saving...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Rules')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-[#070D1B] rounded-2xl border border-amber-500/20 flex items-center gap-3 text-xs text-slate-300">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          {isBn 
            ? 'সতর্কতা: এখানে কোনো নিয়ম পরিবর্তন বা যোগ করার পর "পরিবর্তন সংরক্ষণ করুন" বাটনে ক্লিক করুন। সাথে সাথে সকল মেম্বার তাঁদের অ্যাপে সংশোধিত নিয়মটি দেখতে পাবেন।'
            : 'Notice: After updating or adding rules, click "Save Rules". Changes will be reflected immediately to all club members.'}
        </span>
      </div>

      {/* Chapters / Categories Loop */}
      <div className="space-y-6">
        {rulesData.map((category, catIdx) => (
          <div 
            key={category.id} 
            className="p-5 sm:p-6 rounded-3xl bg-[#0B1528] border-2 border-[#D4AF37]/30 space-y-5 shadow-xl"
          >
            {/* Category Top Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-sm flex items-center justify-center shrink-0">
                  {category.categoryNumber}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  <input
                    type="text"
                    value={category.nameBn}
                    onChange={(e) => handleUpdateCategory(category.id, 'nameBn', e.target.value)}
                    placeholder="অধ্যায়ের নাম (বাংলা)..."
                    className="w-full px-3 py-1.5 bg-[#070D1B] border border-amber-500/30 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={category.nameEn}
                    onChange={(e) => handleUpdateCategory(category.id, 'nameEn', e.target.value)}
                    placeholder="Chapter Name (English)..."
                    className="w-full px-3 py-1.5 bg-[#070D1B] border border-slate-700 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => handleAddRule(category.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ধারা যোগ' : 'Add Clause'}</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs transition cursor-pointer"
                  title={isBn ? 'অধ্যায় মুছুন' : 'Delete Chapter'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rules in this category */}
            <div className="space-y-4">
              {category.rules.map((rule, rIdx) => (
                <div 
                  key={rule.id}
                  className="p-4 bg-[#070D1B] rounded-2xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={rule.number}
                        onChange={(e) => handleUpdateRule(category.id, rule.id, 'number', e.target.value)}
                        placeholder="১.১"
                        className="w-16 px-2 py-1 bg-[#030712] border border-amber-500/40 rounded-lg text-amber-300 font-mono font-bold text-xs text-center focus:outline-none"
                      />
                      <input
                        type="text"
                        value={rule.titleBn}
                        onChange={(e) => handleUpdateRule(category.id, rule.id, 'titleBn', e.target.value)}
                        placeholder="ধারার শিরোনাম (বাংলা)..."
                        className="flex-1 px-3 py-1 bg-[#030712] border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteRule(category.id, rule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                      title={isBn ? 'ধারা মুছুন' : 'Delete Clause'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bangla Description */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {isBn ? 'ধারার বিবরণ (বাংলা):' : 'Clause Description (Bangla):'}
                    </label>
                    <textarea
                      rows={2}
                      value={rule.descriptionBn}
                      onChange={(e) => handleUpdateRule(category.id, rule.id, 'descriptionBn', e.target.value)}
                      className="w-full px-3 py-2 bg-[#030712] border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* English Description */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {isBn ? 'ধারার বিবরণ (English - ঐচ্ছিক):' : 'Clause Description (English - Optional):'}
                    </label>
                    <textarea
                      rows={2}
                      value={rule.descriptionEn}
                      onChange={(e) => handleUpdateRule(category.id, rule.id, 'descriptionEn', e.target.value)}
                      className="w-full px-3 py-2 bg-[#030712] border border-slate-800 rounded-xl text-slate-300 text-xs leading-relaxed focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add New Chapter Button */}
        <button
          onClick={handleAddCategory}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{isBn ? '+ নতুন অধ্যায় যুক্ত করুন' : '+ Add New Chapter'}</span>
        </button>
      </div>

    </div>
  );
};
