import React, { useState } from 'react';
import { Member, CardFieldPosition } from '../../types';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { BarcodeSVG } from './BarcodeSVG';
import { CardTemplateEditorModal } from './CardTemplateEditorModal';
import { 
  Building2, 
  ShieldCheck, 
  Download, 
  Printer, 
  RotateCw, 
  Sparkles, 
  Sliders, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { PbcLogo } from '../Common/PbcLogo';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { captureElementToCanvas } from '../../utils/pdfUtils';

interface DigitalCardProps {
  member: Member;
  showAdminControls?: boolean;
}

export const DigitalCard: React.FC<DigitalCardProps> = ({ member, showAdminControls = false }) => {
  const { role, cardTemplate } = useApp();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isAdminUser = role === 'super_admin' || role === 'admin';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloading(true);

    try {
      const frontEl = document.getElementById(`card-front-${member.id}`);
      const backEl = document.getElementById(`card-back-${member.id}`);

      if (!frontEl) return;

      // Save original styles
      const origFrontTransform = frontEl.style.transform;
      const origFrontOpacity = frontEl.style.opacity;
      const origBackTransform = backEl ? backEl.style.transform : '';
      const origBackOpacity = backEl ? backEl.style.opacity : '';

      // Set clean unrotated styles for capture
      frontEl.style.transform = 'none';
      frontEl.style.opacity = '1';

      if (backEl) {
        backEl.style.transform = 'none';
        backEl.style.opacity = '1';
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.60, 53.98]
      });

      const canvasFront = await captureElementToCanvas(frontEl, {
        scale: 4
      });
      const imgFront = canvasFront.toDataURL('image/png');
      pdf.addImage(imgFront, 'PNG', 0, 0, 85.60, 53.98);

      if (backEl) {
        pdf.addPage([85.60, 53.98], 'landscape');
        const canvasBack = await captureElementToCanvas(backEl, {
          scale: 4
        });
        const imgBack = canvasBack.toDataURL('image/png');
        pdf.addImage(imgBack, 'PNG', 0, 0, 85.60, 53.98);
      }

      // Restore original styles
      frontEl.style.transform = origFrontTransform;
      frontEl.style.opacity = origFrontOpacity;
      if (backEl) {
        backEl.style.transform = origBackTransform;
        backEl.style.opacity = origBackOpacity;
      }

      pdf.save(`PBC_Member_ID_Card_${member.id}.pdf`);
    } catch (err) {
      console.error('Failed to download ID card PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const renderFieldValue = (field: CardFieldPosition, side: 'front' | 'back') => {
    switch (field.id) {
      case 'logoHeader':
        return (
          <div className="flex items-center gap-2">
            <PbcLogo className="w-8 h-8" showContainer={false} />
            <div>
              <h3 className="text-[12px] font-black tracking-wider text-amber-400 uppercase leading-none">
                PBC
              </h3>
              <p className="text-[8px] text-slate-300 font-semibold tracking-tight leading-none mt-0.5">
                PROBASHI BUSINESS CLUB
              </p>
            </div>
          </div>
        );

      case 'vipBadge':
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-400/15 border border-amber-400/40 rounded-full shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
            <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-widest">
              VIP MEMBER
            </span>
          </div>
        );

      case 'photo':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <PBCFramedAvatar
              photoUrl={member.photoUrl}
              name={member.fullName}
              className="w-full h-full rounded-full"
            />
          </div>
        );

      case 'fullName':
        return (
          <div>
            <span className="truncate block font-black text-white">{member.fullName}</span>
            {member.fullNameBn && (
              <span className="text-[10px] text-amber-300/90 font-serif block truncate">
                {member.fullNameBn}
              </span>
            )}
          </div>
        );

      case 'country':
      case 'countryBack':
        return (
          <div className="flex items-center gap-1 text-[11px]">
            <span className="truncate font-semibold text-slate-200">
              Country: {member.country} {member.city ? `(${member.city})` : ''}
            </span>
          </div>
        );

      case 'issueDate':
        return (
          <div className="text-[10px]">
            <span className="text-slate-400 block text-[8px] font-sans">ISSUE DATE</span>
            <span className="font-bold text-white">01/01/2024</span>
          </div>
        );

      case 'expiryDate':
        return (
          <div className="text-[10px]">
            <span className="text-slate-400 block text-[8px] font-sans">EXPIRY DATE</span>
            <span className="font-bold text-amber-300">31/12/2028</span>
          </div>
        );

      case 'authorizedSignature':
        return (
          <div className="text-[10px]">
            <div className="border-b border-amber-300/60 pb-0.5 text-amber-300 font-serif italic font-bold text-[11px] leading-none">
              PBC Auth
            </div>
            <span className="text-slate-400 block text-[7px] uppercase mt-0.5">Signature</span>
          </div>
        );

      case 'qrCodeFront':
      case 'qrCodeBack':
        return (
          <div className="p-1 bg-white rounded-xl shadow-md border-2 border-amber-400 flex items-center justify-center">
            <QRCodeSVG value={member.qrCodeData || member.id} size={44} level="H" />
          </div>
        );

      case 'barcodeFront':
      case 'barcodeBack':
        return (
          <div className="bg-white px-2 py-0.5 rounded-lg shadow-sm border border-amber-400/60 flex flex-col items-center justify-center overflow-hidden w-full h-full">
            <BarcodeSVG value={member.barcodeData || member.idCardNumber || member.id} width={1.4} height={20} fontSize={8} />
          </div>
        );

      case 'passportNumber':
        return (
          <div className="text-[10px]">
            <span className="text-slate-400 block text-[8px] font-sans">NID / PASSPORT</span>
            <span className="font-mono text-slate-300">{member.passportNumber || 'N/A'}</span>
          </div>
        );

      case 'idCardPhoto':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <PBCFramedAvatar
              photoUrl={member.idCardPhotoUrl || member.photoUrl}
              name={member.fullName}
              className="w-full h-full rounded-lg"
            />
          </div>
        );

      case 'memberId':
        return (
          <div className="text-[11px]">
            <span className="text-slate-400 block text-[9px] font-sans">MEMBER ID</span>
            <span className="font-mono font-bold text-amber-300">{member.id}</span>
          </div>
        );

      case 'dateOfBirth':
        return (
          <div className="text-[11px]">
            <span className="text-slate-400 block text-[9px] font-sans">DATE OF BIRTH</span>
            <span className="font-bold text-white">{member.dateOfBirth || '15/01/1988'}</span>
          </div>
        );

      case 'bloodGroup':
        return (
          <div className="text-[11px]">
            <span className="text-slate-400 block text-[9px] font-sans">BLOOD GROUP</span>
            <span className="font-bold text-rose-400">{member.bloodGroup || 'B+'}</span>
          </div>
        );

      case 'phone':
        return (
          <div className="text-[11px]">
            <span className="text-slate-400 block text-[9px] font-sans">PHONE NUMBER</span>
            <span className="font-mono font-bold text-white">{member.phone}</span>
          </div>
        );

      case 'email':
        return (
          <div className="text-[11px] truncate">
            <span className="text-slate-400 block text-[9px] font-sans">EMAIL ADDRESS</span>
            <span className="font-mono text-amber-300 font-medium truncate block">{member.email}</span>
          </div>
        );

      case 'idCardNumber':
        return (
          <div className="text-[10px]">
            <span className="text-slate-400 block text-[8px] font-sans">CARD NO.</span>
            <span className="font-mono text-slate-300">{member.idCardNumber || `PBC-ID-${member.id}`}</span>
          </div>
        );

      default:
        return <span>{field.label}</span>;
    }
  };

  const frontFields = cardTemplate?.frontFields || [];
  const backFields = cardTemplate?.backFields || [];

  return (
    <div className="flex flex-col items-center space-y-5 my-3 select-none">
      
      {/* Printable CSS container with standard CR80 size (85.60 × 53.98 mm) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-card-wrapper-${member.id}, #printable-card-wrapper-${member.id} * {
            visibility: visible !important;
          }
          #printable-card-wrapper-${member.id} {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 85.60mm !important;
            height: 53.98mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: 85.60mm 53.98mm;
            margin: 0;
          }
        }
      `}</style>

      {/* Main Interactive Card Container */}
      <div 
        id={`printable-card-wrapper-${member.id}`}
        className="relative w-[360px] h-[227px] rounded-3xl cursor-pointer perspective-1000 transition-transform duration-700 shadow-2xl shrink-0"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* ==================== FRONT SIDE OF CARD ==================== */}
          <div 
            id={`card-front-${member.id}`}
            className={`absolute inset-0 w-full h-full rounded-[22px] p-3 text-white border-2 border-[#D4AF37]/90 shadow-2xl overflow-hidden backface-hidden transition-opacity duration-300 flex flex-col justify-between ${
              isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{
              backgroundColor: '#071220',
              backgroundImage: 'linear-gradient(135deg, #071220 0%, #0B1C30 50%, #050D18 100%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {/* Top Right Metallic Gold Wave Shapes */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#FCE38A] via-[#D4AF37] to-[#8C6B11] rounded-full blur-[0.5px] opacity-90 pointer-events-none transform rotate-12" />
            <div className="absolute top-0 right-0 w-32 h-16 bg-gradient-to-bl from-[#DFB338] via-[#B88B1E] to-transparent opacity-40 rounded-bl-full pointer-events-none" />
            
            {/* Bottom Right Metallic Gold Curve */}
            <div className="absolute -bottom-10 -right-10 w-36 h-28 bg-gradient-to-tl from-[#FCE38A] via-[#D4AF37] to-transparent rounded-full opacity-80 pointer-events-none" />

            {/* TOP HEADER */}
            <div className="relative z-10 flex items-center justify-between pb-1 border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8C6B11] via-[#D4AF37] to-[#FCE38A] p-[1.5px] shadow-md flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-[#071220] rounded-[6px] flex items-center justify-center">
                    <PbcLogo className="w-6 h-6" showContainer={false} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FCE38A] via-[#D4AF37] to-[#DFB338] tracking-wider leading-none">
                      PBC
                    </span>
                    <span className="text-[10px] font-extrabold text-white tracking-wider leading-none uppercase">
                      PROBASHI BUSINESS CLUB
                    </span>
                  </div>
                  <p className="text-[7.5px] font-bold text-[#D4AF37] tracking-[0.2em] leading-none mt-0.5 uppercase">
                    — TOGETHER WE RISE —
                  </p>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION: PHOTO + QR CODE + MEMBER ID */}
            <div className="relative z-10 flex items-start justify-between gap-2 my-0.5">
              
              {/* PHOTO FRAME (LEFT) */}
              <div className="relative w-20 h-24 rounded-xl p-[2px] bg-gradient-to-b from-[#FCE38A] via-[#D4AF37] to-[#8C6B11] shadow-xl shrink-0">
                <div className="w-full h-full bg-[#071220] rounded-[10px] overflow-hidden">
                  <PBCFramedAvatar
                    photoUrl={member.photoUrl}
                    name={member.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* RIGHT SIDE: QR CODE + MEMBER ID PILL */}
              <div className="flex flex-col items-end justify-between h-24 shrink-0">
                {/* QR CODE BOX */}
                <div className="bg-white p-1 rounded-xl border-2 border-[#D4AF37] shadow-lg flex items-center justify-center">
                  <QRCodeSVG value={member.qrCodeData || `PBC-MEMBER:${member.id}:${member.fullName}`} size={46} level="H" />
                </div>

                {/* MEMBER ID GOLD PILL */}
                <div className="bg-gradient-to-r from-[#DFB338] via-[#FCE38A] to-[#C89B27] rounded-lg px-2 py-0.5 text-center shadow-md border border-[#FCE38A]/50 w-24">
                  <span className="text-[6.5px] font-black text-slate-900 uppercase tracking-widest block leading-none">
                    MEMBER ID
                  </span>
                  <span className="text-[12px] font-black text-slate-950 font-mono tracking-wider leading-none block mt-0.5">
                    {member.id.replace(/^PBC-/, '').padStart(5, '0')}
                  </span>
                </div>
              </div>

            </div>

            {/* MEMBER NAME & STATUS */}
            <div className="relative z-10 -mt-2 mb-0.5 text-left">
              <h2 className="text-[13px] font-black text-white tracking-wide uppercase truncate leading-none">
                {member.fullName}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest leading-none">
                  — ACTIVE MEMBER —
                </span>
              </div>
            </div>

            {/* MEMBER DETAILS LIST */}
            <div className="relative z-10 bg-[#09182A]/95 border border-[#D4AF37]/50 rounded-xl p-1.5 backdrop-blur-xs space-y-0.5 text-[8.5px]">
              
              <div className="grid grid-cols-[14px_72px_8px_1fr] items-center py-0.2 border-b border-[#D4AF37]/20">
                <span className="text-[#D4AF37]">🌐</span>
                <span className="font-extrabold text-[#D4AF37] uppercase tracking-wider">COUNTRY</span>
                <span className="text-[#D4AF37] font-bold">:</span>
                <span className="font-bold text-white truncate">{member.country || 'Saudi Arabia'}</span>
              </div>

              <div className="grid grid-cols-[14px_72px_8px_1fr] items-center py-0.2 border-b border-[#D4AF37]/20">
                <span className="text-[#D4AF37]">🩸</span>
                <span className="font-extrabold text-[#D4AF37] uppercase tracking-wider">BLOOD GROUP</span>
                <span className="text-[#D4AF37] font-bold">:</span>
                <span className="font-bold text-white truncate">{member.bloodGroup || 'O+'}</span>
              </div>

              <div className="grid grid-cols-[14px_72px_8px_1fr] items-center py-0.2 border-b border-[#D4AF37]/20">
                <span className="text-[#D4AF37]">📅</span>
                <span className="font-extrabold text-[#D4AF37] uppercase tracking-wider">DATE OF BIRTH</span>
                <span className="text-[#D4AF37] font-bold">:</span>
                <span className="font-bold text-white truncate">{member.dateOfBirth || '05.06.1997'}</span>
              </div>

              <div className="grid grid-cols-[14px_72px_8px_1fr] items-center py-0.2 border-b border-[#D4AF37]/20">
                <span className="text-[#D4AF37]">📞</span>
                <span className="font-extrabold text-[#D4AF37] uppercase tracking-wider">MOBILE</span>
                <span className="text-[#D4AF37] font-bold">:</span>
                <span className="font-mono font-bold text-white truncate">{member.phone || '0503342655'}</span>
              </div>

              <div className="grid grid-cols-[14px_72px_8px_1fr] items-center py-0.2">
                <span className="text-[#D4AF37]">✉️</span>
                <span className="font-extrabold text-[#D4AF37] uppercase tracking-wider">EMAIL</span>
                <span className="text-[#D4AF37] font-bold">:</span>
                <span className="font-mono text-[8px] font-semibold text-slate-200 truncate">{member.email || 'rakib.ahamed318749@gmail.com'}</span>
              </div>

            </div>

            {/* BOTTOM FOOTER BADGE & CREST */}
            <div className="relative z-10 flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FCE38A] flex items-center justify-center p-[1px] shadow-sm">
                  <div className="w-full h-full bg-[#071220] rounded-full flex items-center justify-center text-[7px] font-black text-[#D4AF37]">
                    PBC
                  </div>
                </div>
                <div>
                  <span className="text-[7.5px] font-black text-[#D4AF37] block leading-none uppercase">
                    PBC FAMILY
                  </span>
                  <span className="text-[6.5px] font-semibold text-slate-300 block leading-none mt-0.5">
                    ONE CLUB • ONE FAMILY
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ==================== BACK SIDE OF CARD ==================== */}
          <div 
            id={`card-back-${member.id}`}
            className={`absolute inset-0 w-full h-full rounded-[22px] text-white border-2 border-[#D4AF37]/90 shadow-2xl overflow-hidden rotate-y-180 backface-hidden transition-opacity duration-300 flex flex-col justify-between ${
              !isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{
              backgroundColor: '#071220',
              backgroundImage: 'linear-gradient(135deg, #071220 0%, #0B1C30 50%, #050D18 100%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {/* Background Faint Watermark Logo */}
            <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
              <PbcLogo className="w-36 h-36" showContainer={false} />
            </div>

            <div className="p-3 flex flex-col justify-between h-full">
              
              {/* TOP HEADER */}
              <div className="relative z-10 flex items-center justify-between pb-1 border-b border-[#D4AF37]/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8C6B11] via-[#D4AF37] to-[#FCE38A] p-[1.5px] flex items-center justify-center">
                    <div className="w-full h-full bg-[#071220] rounded-[6px] flex items-center justify-center">
                      <PbcLogo className="w-5 h-5" showContainer={false} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FCE38A] via-[#D4AF37] to-[#DFB338] tracking-wider leading-none">
                        PBC
                      </span>
                      <span className="text-[9px] font-black text-white tracking-wider leading-none uppercase">
                        PROBASHI BUSINESS CLUB
                      </span>
                    </div>
                    <p className="text-[7px] font-bold text-[#D4AF37] tracking-[0.2em] leading-none uppercase mt-0.5">
                      — TOGETHER WE RISE —
                    </p>
                  </div>
                </div>
              </div>

              {/* FAMILY INFORMATION SECTION */}
              <div className="relative z-10 my-1 space-y-1">
                
                {/* GOLD PILL BADGE HEADER */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#DFB338] via-[#FCE38A] to-[#C89B27] text-slate-950 shadow-md">
                  <span className="text-[9px]">👥</span>
                  <span className="text-[8.5px] font-black uppercase tracking-wider">
                    FAMILY INFORMATION
                  </span>
                </div>

                {/* WHITE INFO CARD BOX */}
                <div className="bg-white rounded-xl border-2 border-[#D4AF37] p-2 text-slate-900 shadow-md space-y-0.5">
                  
                  <div className="grid grid-cols-[14px_65px_8px_1fr] items-center text-[8.5px] py-0.5 border-b border-slate-200">
                    <span className="text-[#071220] font-bold">👤</span>
                    <span className="font-extrabold text-slate-800 uppercase">N. NAME</span>
                    <span className="font-bold text-slate-700">:</span>
                    <span className="font-bold text-slate-900 truncate">
                      {member.familyInfoName || member.nomineeName || 'Bristi Akter'}
                    </span>
                  </div>

                  <div className="grid grid-cols-[14px_65px_8px_1fr] items-center text-[8.5px] py-0.5 border-b border-slate-200">
                    <span className="text-[#071220] font-bold">👥</span>
                    <span className="font-extrabold text-slate-800 uppercase">RELATION</span>
                    <span className="font-bold text-slate-700">:</span>
                    <span className="font-bold text-slate-900 truncate">
                      {member.familyInfoRelation || member.nomineeRelation || 'Wife'}
                    </span>
                  </div>

                  <div className="grid grid-cols-[14px_65px_8px_1fr] items-center text-[8.5px] py-0.5 border-b border-slate-200">
                    <span className="text-[#071220] font-bold">📞</span>
                    <span className="font-extrabold text-slate-800 uppercase">MOBILE</span>
                    <span className="font-bold text-slate-700">:</span>
                    <span className="font-mono font-bold text-slate-900 truncate">
                      {member.familyInfoMobile || member.nomineeMobile || '01871713907'}
                    </span>
                  </div>

                  <div className="grid grid-cols-[14px_65px_8px_1fr] items-center text-[8.5px] py-0.5">
                    <span className="text-[#071220] font-bold">🏠</span>
                    <span className="font-extrabold text-slate-800 uppercase">ADDRESS</span>
                    <span className="font-bold text-slate-700">:</span>
                    <span className="font-semibold text-slate-800 truncate">
                      {member.familyInfoAddress || member.nomineeAddress || 'Gojaria,Nawabgonj,Dhaka'}
                    </span>
                  </div>

                </div>

              </div>

              {/* SIGNATURE & GOLDEN STAMP */}
              <div className="relative z-10 flex items-center justify-between px-1 my-0.5">
                <div>
                  <div className="font-serif italic text-amber-300 font-extrabold text-[11px] leading-none border-b border-[#D4AF37]/50 pb-0.5">
                    PBC Admin
                  </div>
                  <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                    AUTHORIZED SIGNATURE
                  </span>
                </div>

                {/* GOLD SEAL STAMP BADGE */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C89B27] via-[#FCE38A] to-[#DFB338] p-[1.5px] shadow-md flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-full border border-dashed border-slate-950/40 bg-[#DFB338] flex flex-col items-center justify-center text-slate-950 p-[1px]">
                    <span className="text-[5px] leading-none font-bold">⭐⭐⭐⭐⭐</span>
                    <span className="text-[8px] font-black leading-none uppercase tracking-tighter my-0.5">
                      PBC
                    </span>
                    <span className="text-[5px] font-extrabold leading-none tracking-tighter">
                      EST. 2025
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM BANNER */}
              <div className="relative z-10 -mx-3 -mb-3 p-1 bg-gradient-to-r from-[#C89B27] via-[#FCE38A] to-[#DFB338] text-slate-950 text-center border-t border-[#FCE38A]">
                <p className="text-[6.5px] font-black uppercase tracking-widest leading-none">
                  PROUD MEMBER OF
                </p>
                <h4 className="text-[9.5px] font-black uppercase tracking-wider leading-tight my-0.5">
                  PROBASHI BUSINESS CLUB
                </h4>
                <p className="text-[6px] font-extrabold uppercase tracking-wider leading-none">
                  LEARN • DEVELOP • CONNECT • GROW TOGETHER
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Flip Card</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>Download PDF</span>
        </button>

        {/* Super Admin & Admin Edit Template Button */}
        {showAdminControls && isAdminUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-md transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Template</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-400 text-center max-w-xs">
        Tap card to flip between Front & Back. Standard CR80 PVC Card (85.60 × 53.98 mm) format.
      </p>

      {/* Card Template Editor Modal */}
      {isEditorOpen && (
        <CardTemplateEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
