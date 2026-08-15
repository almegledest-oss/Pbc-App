import React, { useState, useRef } from 'react';
import { CardTemplateConfig, CardFieldPosition } from '../../types';
import { useApp } from '../../context/AppContext';
import { DEFAULT_CARD_TEMPLATE } from '../../data/defaultCardTemplate';
import { uploadMemberPhoto } from '../../services/firebaseService';
import { QRCodeSVG } from 'qrcode.react';
import { BarcodeSVG } from './BarcodeSVG';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { 
  X, 
  Save, 
  RotateCcw, 
  Move, 
  Type, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  Check, 
  Layers, 
  Sliders, 
  Upload, 
  Palette,
  Sparkles,
  Building2,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface CardTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardTemplateEditorModal: React.FC<CardTemplateEditorModalProps> = ({ isOpen, onClose }) => {
  const { cardTemplate, updateCardTemplate, currentMember } = useApp();

  const [localTemplate, setLocalTemplate] = useState<CardTemplateConfig>(() => ({
    ...cardTemplate
  }));

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('fullName');
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const cardCanvasRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; fieldX: number; fieldY: number }>({ x: 0, y: 0, fieldX: 0, fieldY: 0 });

  if (!isOpen) return null;

  const fields = activeSide === 'front' ? localTemplate.frontFields : localTemplate.backFields;
  const selectedField = fields.find(f => f.id === selectedFieldId);

  const updateField = (fieldId: string, changes: Partial<CardFieldPosition>) => {
    setLocalTemplate(prev => {
      const isFront = activeSide === 'front';
      const targetFields = isFront ? prev.frontFields : prev.backFields;
      const updatedFields = targetFields.map(f => {
        if (f.id === fieldId) {
          return { ...f, ...changes };
        }
        return f;
      });

      return {
        ...prev,
        [isFront ? 'frontFields' : 'backFields']: updatedFields
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCardTemplate(localTemplate);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset card template to default layout?')) {
      setLocalTemplate(DEFAULT_CARD_TEMPLATE);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBg(true);
    try {
      const url = await uploadMemberPhoto(file, `bg_${side}`);
      setLocalTemplate(prev => ({
        ...prev,
        [side === 'front' ? 'frontBgUrl' : 'backBgUrl']: url
      }));
    } catch (err) {
      console.error('Failed to upload background:', err);
    } finally {
      setUploadingBg(false);
    }
  };

  // Drag logic for visual positioning
  const handleMouseDown = (e: React.MouseEvent, field: CardFieldPosition) => {
    setSelectedFieldId(field.id);
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      fieldX: field.x,
      fieldY: field.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !selectedField || !cardCanvasRef.current) return;

    const rect = cardCanvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(90, Math.round(dragStartRef.current.fieldX + deltaX)));
    const newY = Math.max(0, Math.min(90, Math.round(dragStartRef.current.fieldY + deltaY)));

    updateField(selectedField.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Sample data fallback for preview
  const previewMember = currentMember || {
    id: 'PBC-1001',
    fullName: 'Mohammad Rashid',
    country: 'United States',
    city: 'New York',
    phone: '+1 212 555 0199',
    email: 'm.rashid@pbcclub.org',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    qrCodeData: 'PBC-1001-MEMBER-VERIFIED',
    dateOfBirth: '15 Jan 1988',
    bloodGroup: 'B+',
    idCardNumber: 'PBC-ID-884920'
  };

  const renderFieldValue = (field: CardFieldPosition) => {
    switch (field.id) {
      case 'logoHeader':
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-[10px]">
              PBC
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider text-amber-300 uppercase leading-none">
                PBC
              </p>
              <p className="text-[7px] text-slate-300 font-medium leading-none">Probashi Pass</p>
            </div>
          </div>
        );
      case 'vipBadge':
        return (
          <div className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/40 rounded-full flex items-center gap-1 text-[8px] font-bold text-amber-300 uppercase tracking-widest">
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
            <span>VIP MEMBER</span>
          </div>
        );
      case 'photo':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <PBCFramedAvatar
              photoUrl={previewMember.photoUrl}
              name={previewMember.fullName}
              className="w-full h-full rounded-full"
            />
          </div>
        );
      case 'fullName':
        return <span className="truncate block">{previewMember.fullName}</span>;
      case 'country':
      case 'countryBack':
        return <span className="truncate block">Country: {previewMember.country}</span>;
      case 'issueDate':
        return <span>Issue: <strong>01/01/2024</strong></span>;
      case 'expiryDate':
        return <span>Expiry: <strong className="text-amber-300">31/12/2028</strong></span>;
      case 'authorizedSignature':
        return <span className="text-amber-300 font-serif italic font-bold">PBC Authorized</span>;
      case 'qrCodeFront':
      case 'qrCodeBack':
        return (
          <div className="p-1 bg-white rounded-lg shadow-xs border border-amber-400/40 flex items-center justify-center">
            <QRCodeSVG value={previewMember.qrCodeData || previewMember.id} size={36} level="M" />
          </div>
        );
      case 'barcodeFront':
      case 'barcodeBack':
        return (
          <div className="bg-white p-1 rounded-sm shadow-xs border border-slate-300 overflow-hidden flex flex-col items-center justify-center">
            <BarcodeSVG value={previewMember.idCardNumber || previewMember.id} width={1.2} height={18} fontSize={8} />
          </div>
        );
      case 'memberId':
        return <span>ID: <strong className="text-amber-300">{previewMember.id}</strong></span>;
      case 'dateOfBirth':
        return <span>DOB: <strong>{previewMember.dateOfBirth || '15/01/1988'}</strong></span>;
      case 'bloodGroup':
        return <span>Blood: <strong className="text-rose-400">{previewMember.bloodGroup || 'B+'}</strong></span>;
      case 'phone':
        return <span>Ph: <strong>{previewMember.phone}</strong></span>;
      case 'email':
        return <span className="truncate block">{previewMember.email}</span>;
      case 'idCardNumber':
        return <span>CARD #: <strong>{previewMember.idCardNumber || 'PBC-884920'}</strong></span>;
      default:
        return <span>{field.label}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-500 dark:text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Member ID Card Template Studio</span>
                <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono rounded-full border border-emerald-400/30">
                  CR80 PVC (85.6 × 53.98mm)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Super Admin / Admin drag-and-drop template editor. All member cards update in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Canvas & Preview Panel (7 cols) */}
          <div className="lg:col-span-7 p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-between border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
            
            {/* Side Switcher Controls */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-4">
              <button
                onClick={() => {
                  setActiveSide('front');
                  setSelectedFieldId('fullName');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                  activeSide === 'front'
                    ? 'bg-[#0D2A52] text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Front Side Card</span>
              </button>
              <button
                onClick={() => {
                  setActiveSide('back');
                  setSelectedFieldId('memberId');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                  activeSide === 'back'
                    ? 'bg-[#0D2A52] text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Back Side Card</span>
              </button>
            </div>

            {/* Interactive Drag Canvas Box (Scaled CR80 Ratio ~1.586) */}
            <div className="w-full flex justify-center items-center my-auto py-4">
              <div
                ref={cardCanvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative w-[360px] h-[227px] rounded-2xl shadow-2xl border-2 border-amber-400/40 overflow-hidden select-none cursor-crosshair transition-all"
                style={{
                  backgroundColor: activeSide === 'front' ? localTemplate.frontBgColor : localTemplate.backBgColor,
                  backgroundImage: activeSide === 'front' && localTemplate.frontBgUrl ? `url(${localTemplate.frontBgUrl})` : activeSide === 'back' && localTemplate.backBgUrl ? `url(${localTemplate.backBgUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Default Hologram Ambient Waves if no custom BG */}
                {!localTemplate.frontBgUrl && activeSide === 'front' && (
                  <>
                    <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0D2A52] via-[#081B36] to-[#040E1D] opacity-90 pointer-events-none" />
                  </>
                )}

                {!localTemplate.backBgUrl && activeSide === 'back' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#081B36] via-[#040E1D] to-[#0D2A52] opacity-95 pointer-events-none" />
                )}

                {/* Render All Canvas Fields */}
                {fields.filter(f => f.visible !== false).map((field) => {
                  const isSelected = selectedFieldId === field.id;
                  return (
                    <div
                      key={field.id}
                      onMouseDown={(e) => handleMouseDown(e, field)}
                      className={`absolute z-20 cursor-move transition-shadow rounded-sm ${
                        isSelected 
                          ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 bg-amber-400/15' 
                          : 'hover:ring-1 hover:ring-amber-300/60'
                      }`}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: field.width ? `${field.width}%` : 'auto',
                        height: field.height ? `${field.height}%` : 'auto',
                        fontSize: field.fontSize ? `${field.fontSize}px` : '12px',
                        fontFamily: field.fontFamily || 'sans-serif',
                        color: field.color || '#FFFFFF',
                        fontWeight: field.fontWeight || 'normal',
                        textAlign: field.textAlign || 'left'
                      }}
                    >
                      {renderFieldValue(field)}
                    </div>
                  );
                })}

                {/* Grid Overlay Hint */}
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-amber-300/70 pointer-events-none">
                  {activeSide.toUpperCase()} CARD • CR80 PVC
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center gap-1 mt-2">
              <Move className="w-3.5 h-3.5 text-amber-500" />
              <span>Click and drag any field on the card to adjust position X/Y.</span>
            </p>
          </div>

          {/* Right Field Inspector & Styling Controls (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-white dark:bg-slate-900 overflow-y-auto space-y-5">
            
            {/* Field Selection Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Field to Customise
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {fields.map(field => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedFieldId === field.id
                        ? 'border-amber-400 bg-amber-400/10 text-slate-900 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{field.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateField(field.id, { visible: field.visible === false ? true : false });
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      {field.visible !== false ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Detail Controls */}
            {selectedField ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-amber-500" />
                    <span>{selectedField.label} Properties</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {selectedField.id}</span>
                </div>

                {/* X and Y Position Sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1">
                      <span>Position X</span>
                      <span className="font-mono text-amber-500">{selectedField.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={selectedField.x}
                      onChange={(e) => updateField(selectedField.id, { x: parseInt(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1">
                      <span>Position Y</span>
                      <span className="font-mono text-amber-500">{selectedField.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={selectedField.y}
                      onChange={(e) => updateField(selectedField.id, { y: parseInt(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                {/* Width & Font Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Font Size (px)
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={selectedField.fontSize || 12}
                      onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) || 12 })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Font Weight
                    </label>
                    <select
                      value={selectedField.fontWeight || 'normal'}
                      onChange={(e) => updateField(selectedField.id, { fontWeight: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="bold">Bold</option>
                      <option value="extrabold">Extra Bold</option>
                    </select>
                  </div>
                </div>

                {/* Font Family & Text Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Font Family
                    </label>
                    <select
                      value={selectedField.fontFamily || 'sans-serif'}
                      onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="serif">Serif (Playfair)</option>
                      <option value="monospace">Monospace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedField.color || '#FFFFFF'}
                        onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                      />
                      <input
                        type="text"
                        value={selectedField.color || '#FFFFFF'}
                        onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                        className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Select a field above to inspect and customize parameters.</p>
            )}

            {/* Custom Background Image Uploader */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Card Background Image ({activeSide.toUpperCase()})</span>
              </h4>

              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer px-4 py-2.5 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 rounded-xl text-center transition">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                    {uploadingBg ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Upload className="w-4 h-4 text-amber-500" />}
                    <span>Upload Background Image</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBgUpload(e, activeSide)}
                    disabled={uploadingBg}
                    className="hidden"
                  />
                </label>

                {(activeSide === 'front' ? localTemplate.frontBgUrl : localTemplate.backBgUrl) && (
                  <button
                    onClick={() => setLocalTemplate(prev => ({ ...prev, [activeSide === 'front' ? 'frontBgUrl' : 'backBgUrl']: undefined }))}
                    className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Template successfully saved to Firebase!
              </span>
            ) : (
              'Changes saved here will immediately apply to all member cards across the club.'
            )}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold bg-[#2E7D32] hover:bg-emerald-600 text-white rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Template to Firebase</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
