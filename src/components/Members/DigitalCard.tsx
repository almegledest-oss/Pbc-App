import React, { useState, useEffect } from 'react';
import { Member } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  Printer, 
  RotateCw, 
  Loader2,
  Globe,
  Droplet,
  Calendar,
  Phone,
  Mail,
  User,
  Users,
  Home,
  Image as ImageIcon,
  Scissors
} from 'lucide-react';
import { 
  PbcAirplaneHeaderLogo, 
  PbcCircularLogo,
  PbcShieldCrest, 
  PbcGoldSealMedallion,
  PbcWatermarkLogo
} from './PbcCardGraphics';
import jsPDF from 'jspdf';
import { captureElementToCanvas, urlToSafeDataUrl, triggerFileDownload } from '../../utils/pdfUtils';

interface DigitalCardProps {
  member: Member;
  showAdminControls?: boolean;
}

export const DigitalCard: React.FC<DigitalCardProps> = ({ member }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingA4, setDownloadingA4] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [safeMemberPhoto, setSafeMemberPhoto] = useState<string>(member.photoUrl || '');

  // Pre-convert member photo to safe base64 Data URL to prevent mobile CORS / taint canvas crashes
  useEffect(() => {
    let isMounted = true;
    if (member.photoUrl) {
      urlToSafeDataUrl(member.photoUrl).then((safeUrl) => {
        if (isMounted && safeUrl) {
          setSafeMemberPhoto(safeUrl);
        }
      });
    } else {
      setSafeMemberPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    }
    return () => {
      isMounted = false;
    };
  }, [member.photoUrl]);

  const handlePrint = () => {
    window.print();
  };

  // 1. Download Standard CR80 2-Page PDF (Wallet/PVC Card Size: 53.98mm × 85.60mm)
  const handleDownloadPDF = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloading(true);

    try {
      // Ensure photo is converted if not already
      if (member.photoUrl && !safeMemberPhoto.startsWith('data:image/')) {
        const prePhoto = await urlToSafeDataUrl(member.photoUrl);
        if (prePhoto) setSafeMemberPhoto(prePhoto);
      }

      const frontEl = document.getElementById(`export-front-${member.id}`);
      const backEl = document.getElementById(`export-back-${member.id}`);

      if (!frontEl || !backEl) {
        throw new Error('Export elements not found');
      }

      // CR80 Portrait Card format: 53.98mm × 85.60mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [53.98, 85.60]
      });

      // Canvas Capture (Mobile-optimized crisp resolution without memory overflow)
      const canvasFront = await captureElementToCanvas(frontEl);
      const imgFront = canvasFront.toDataURL('image/png', 0.95);
      pdf.addImage(imgFront, 'PNG', 0, 0, 53.98, 85.60, undefined, 'FAST');

      pdf.addPage([53.98, 85.60], 'portrait');
      const canvasBack = await captureElementToCanvas(backEl);
      const imgBack = canvasBack.toDataURL('image/png', 0.95);
      pdf.addImage(imgBack, 'PNG', 0, 0, 53.98, 85.60, undefined, 'FAST');

      // Universal Mobile & Desktop Blob Download
      const pdfBlob = pdf.output('blob');
      triggerFileDownload(pdfBlob, `PBC_Member_Card_${displayMemberId}.pdf`);
    } catch (err) {
      console.error('Failed to download ID card PDF:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // 2. Download A4 Print Sheet with Cut Marks & Fold Line
  const handleDownloadA4Sheet = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingA4(true);

    try {
      if (member.photoUrl && !safeMemberPhoto.startsWith('data:image/')) {
        const prePhoto = await urlToSafeDataUrl(member.photoUrl);
        if (prePhoto) setSafeMemberPhoto(prePhoto);
      }

      const frontEl = document.getElementById(`export-front-${member.id}`);
      const backEl = document.getElementById(`export-back-${member.id}`);

      if (!frontEl || !backEl) {
        throw new Error('Export elements not found');
      }

      // A4 format: 210mm × 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const canvasFront = await captureElementToCanvas(frontEl);
      const imgFront = canvasFront.toDataURL('image/png', 0.95);

      const canvasBack = await captureElementToCanvas(backEl);
      const imgBack = canvasBack.toDataURL('image/png', 0.95);

      // Card Dimensions in mm
      const cardW = 54;
      const cardH = 85.6;

      // Header on A4 Sheet
      pdf.setFontSize(16);
      pdf.setTextColor(11, 28, 48);
      pdf.text('PROBASHI BUSINESS CLUB (PBC) - MEMBER ID CARD', 105, 22, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Member Name: ${member.fullName}  |  ID: ${displayMemberId}  |  Ready for Print & Cut`, 105, 29, { align: 'center' });

      // Layout 1: Side-by-Side with Cut Guides
      const yPos = 42;
      const xFront = 45;
      const xBack = 111;

      // Draw Front Card
      pdf.addImage(imgFront, 'PNG', xFront, yPos, cardW, cardH, undefined, 'FAST');

      // Draw Back Card
      pdf.addImage(imgBack, 'PNG', xBack, yPos, cardW, cardH, undefined, 'FAST');

      // Draw Cutting Crop Marks & Dashed Guides
      pdf.setDrawColor(180, 190, 205);
      pdf.setLineDashPattern([2, 2], 0);

      // Outer bounding box around both cards
      pdf.rect(xFront - 2, yPos - 2, (cardW * 2) + 16, cardH + 4);
      
      // Cut line between front and back
      pdf.line(xFront + cardW + 6, yPos - 5, xFront + cardW + 6, yPos + cardH + 5);

      // Crop corner ticks for Front Card
      pdf.setDrawColor(212, 175, 55); // Gold
      pdf.setLineDashPattern([], 0); // Solid
      pdf.line(xFront - 3, yPos, xFront + cardW + 3, yPos); // Top line
      pdf.line(xFront - 3, yPos + cardH, xFront + cardW + 3, yPos + cardH); // Bottom line
      pdf.line(xFront, yPos - 3, xFront, yPos + cardH + 3); // Left line
      pdf.line(xFront + cardW, yPos - 3, xFront + cardW, yPos + cardH + 3); // Right line

      // Crop corner ticks for Back Card
      pdf.line(xBack - 3, yPos, xBack + cardW + 3, yPos);
      pdf.line(xBack - 3, yPos + cardH, xBack + cardW + 3, yPos + cardH);
      pdf.line(xBack, yPos - 3, xBack, yPos + cardH + 3);
      pdf.line(xBack + cardW, yPos - 3, xBack + cardW, yPos + cardH + 3);

      // Instructions block on A4
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text('✂️ CUTTING INSTRUCTIONS / কাটার নিয়মাবলী:', 105, 140, { align: 'center' });
      pdf.text('1. ডটেড ও গোল্ডেন লাইনের ভেতরের কার্ড দুটি কাঁচি (Scissor) দিয়ে সাবধানে কেটে নিন।', 105, 147, { align: 'center' });
      pdf.text('2. পেপার বা পিভিসি কার্ড প্রিন্টারে উভয় পাশ একসাথে প্রিন্ট অথবা লেমিনেশন করতে পারেন।', 105, 153, { align: 'center' });
      pdf.text('3. স্ট্যান্ডার্ড CR80 সাইজ: 54.0 mm × 85.6 mm (সব ধরণের আইডি কার্ড হোল্ডারে একদম পারফেক্ট)।', 105, 159, { align: 'center' });

      // Layout 2: Vertical Foldable Card version at bottom of A4
      const yFold = 180;
      const xFold = 78;

      pdf.setFontSize(10);
      pdf.setTextColor(11, 28, 48);
      pdf.text('FOLDABLE VERSION (ভাজ করে লেমিনেশন করার জন্য):', 105, yFold - 6, { align: 'center' });

      pdf.addImage(imgFront, 'PNG', xFold, yFold, cardW, cardH, undefined, 'SLOW');
      pdf.addImage(imgBack, 'PNG', xFold + cardW, yFold, cardW, cardH, undefined, 'SLOW');

      pdf.setDrawColor(212, 175, 55);
      pdf.setLineDashPattern([2, 1], 0);
      pdf.line(xFold + cardW, yFold - 3, xFold + cardW, yFold + cardH + 3); // Fold line
      
      pdf.setFontSize(7.5);
      pdf.setTextColor(180, 83, 9);
      pdf.text('FOLD HERE (ভাজের দাগ) ⮯', xFold + cardW, yFold - 4, { align: 'center' });

      const pdfBlob = pdf.output('blob');
      triggerFileDownload(pdfBlob, `PBC_Member_Card_A4_PrintSheet_${displayMemberId}.pdf`);
    } catch (err) {
      console.error('Failed to download A4 Print Sheet:', err);
      alert('Could not generate A4 sheet. Please try again.');
    } finally {
      setDownloadingA4(false);
    }
  };

  // 3. Download Clean PNG Images
  const handleDownloadPNG = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingImage(true);

    try {
      if (member.photoUrl && !safeMemberPhoto.startsWith('data:image/')) {
        const prePhoto = await urlToSafeDataUrl(member.photoUrl);
        if (prePhoto) setSafeMemberPhoto(prePhoto);
      }

      const activeEl = isFlipped 
        ? document.getElementById(`export-back-${member.id}`)
        : document.getElementById(`export-front-${member.id}`);

      if (!activeEl) {
        throw new Error('Active export element not found');
      }

      const canvas = await captureElementToCanvas(activeEl);

      canvas.toBlob((blob) => {
        if (blob) {
          triggerFileDownload(blob, `PBC_Member_Card_${isFlipped ? 'Back' : 'Front'}_${displayMemberId}.png`);
        } else {
          const dataUrl = canvas.toDataURL('image/png', 0.95);
          const link = document.createElement('a');
          link.download = `PBC_Member_Card_${isFlipped ? 'Back' : 'Front'}_${displayMemberId}.png`;
          link.href = dataUrl;
          link.click();
        }
      }, 'image/png', 0.95);
    } catch (err) {
      console.error('Failed to download ID card image:', err);
      alert('Could not generate image. Please try again.');
    } finally {
      setDownloadingImage(false);
    }
  };

  // Extract candidate ID string from all possible member ID fields
  const candidateId = String(
    member.id || 
    (member as any).memberId || 
    (member as any).membershipId || 
    member.idCardNumber || 
    ''
  ).trim();

  // Extract pure digits
  const pureDigits = candidateId.replace(/^PBC-?/i, '').replace(/\D/g, '');
  
  let formattedMemberId = '00010';
  if (pureDigits) {
    formattedMemberId = pureDigits.length < 5 ? pureDigits.padStart(5, '0') : pureDigits;
  } else if (candidateId) {
    formattedMemberId = candidateId.toUpperCase();
  }

  const numericMemberId = pureDigits ? (pureDigits.length < 5 ? pureDigits.padStart(5, '0') : pureDigits) : (formattedMemberId.replace(/^PBC-?/i, '') || '00010');
  const displayMemberId = formattedMemberId.startsWith('PBC') ? formattedMemberId : `PBC-${formattedMemberId}`;

  // Format date helper
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '05.06.1997';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Safe fallback photo with pre-converted Base64 URL support
  const memberPhotoSrc = safeMemberPhoto || member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="flex flex-col items-center space-y-4 my-2 select-none w-full max-w-sm">
      
      {/* Printable CSS container with standard CR80 Vertical format (53.98 × 85.60 mm) */}
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
            width: 53.98mm !important;
            height: 85.60mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: 53.98mm 85.60mm;
            margin: 0;
          }
        }
      `}</style>

      {/* Main Interactive Portrait Card Container */}
      <div 
        id={`printable-card-wrapper-${member.id}`}
        className="relative w-[340px] h-[525px] rounded-[24px] cursor-pointer perspective-1000 transition-transform duration-700 shadow-2xl shrink-0"
        onClick={() => setIsFlipped(!isFlipped)}
        title="কার্ড উল্টাতে ক্লিক করুন (Tap to flip)"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        <div className={`relative w-full h-full duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* ==================== ON-SCREEN FRONT ==================== */}
          <div 
            id={`card-front-${member.id}`}
            className={`absolute inset-0 w-[340px] h-[525px] rounded-[24px] p-[16px] text-white border-2 border-[#D4AF37] shadow-2xl overflow-hidden backface-hidden transition-opacity duration-300 flex flex-col justify-between box-border ${
              isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{
              backgroundColor: '#040D1B',
              backgroundImage: 'radial-gradient(circle at 85% 10%, #0D2342 0%, #040D1B 70%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              fontFamily: 'Arial, Helvetica, sans-serif',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Right Flowing Metallic Gold Ribbon Waves */}
            <div 
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #FFF0A5 0%, #DFB338 45%, #8C6514 100%)',
                opacity: 0.88
              }}
            />
            <div 
              className="absolute top-0 right-0 w-40 h-28 rounded-bl-[100px] pointer-events-none"
              style={{
                background: 'linear-gradient(220deg, #DFB338 0%, #B88B1E 55%, transparent 100%)',
                opacity: 0.45
              }}
            />
            {/* Thin Glowing Gold Wave Lines */}
            <div 
              className="absolute top-8 right-12 w-32 h-32 rounded-full border border-amber-300/40 pointer-events-none"
            />
            <div 
              className="absolute top-16 right-20 w-40 h-40 rounded-full border border-amber-400/25 pointer-events-none"
            />
            
            {/* Bottom Left Metallic Gold Arc Ribbon */}
            <div 
              className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, #FFF0A5 0%, #DFB338 60%, transparent 100%)',
                opacity: 0.75
              }}
            />
            <div 
              className="absolute bottom-6 left-10 w-36 h-36 rounded-full border border-amber-400/20 pointer-events-none"
            />

            {/* Official PBC Circular Watermark Logo behind Member Details (Image 1 placement) */}
            <div className="absolute top-[310px] left-1/2 -translate-x-1/2 w-44 h-44 pointer-events-none z-0 flex items-center justify-center">
              <PbcWatermarkLogo className="w-full h-full" opacity={0.16} />
            </div>

            {/* 1. TOP HEADER */}
            <div className="relative z-10 text-center pb-1">
              <div className="flex items-center justify-center">
                <PbcAirplaneHeaderLogo className="w-[260px] max-w-[92%] h-[52px]" />
              </div>

              {/* TOGETHER WE RISE Slogan with flanking lines */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#DFB338] to-[#FDF0A6]"></div>
                <span className="text-[8.5px] font-black text-[#FDF0A6] uppercase tracking-wider px-1 leading-normal" style={{ letterSpacing: '0.8px' }}>
                  TOGETHER WE RISE
                </span>
                <div className="w-10 h-[1.5px] bg-gradient-to-r from-[#FDF0A6] via-[#DFB338] to-transparent"></div>
              </div>
            </div>

            {/* 2. MIDDLE SECTION: PHOTO (LEFT) + QR CODE + MEMBER ID (RIGHT) */}
            <div className="relative z-10 flex items-center justify-between gap-3 my-1">
              
              {/* PHOTO FRAME (LEFT) - Crisp Portrait Frame */}
              <div 
                className="relative w-[132px] h-[145px] rounded-2xl p-[2.5px] shadow-xl shrink-0"
                style={{ background: 'linear-gradient(180deg, #FFF0A5 0%, #DFB338 50%, #8C6514 100%)' }}
              >
                <div className="w-full h-full bg-[#040D1B] rounded-[13px] overflow-hidden">
                  <img
                    src={memberPhotoSrc}
                    alt={member.fullName}
                    className="w-full h-full object-cover object-top"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* RIGHT SIDE: QR CODE + MEMBER ID BADGE */}
              <div className="flex-1 flex flex-col items-center justify-between h-[145px] py-0.5">
                
                {/* QR CODE BOX */}
                <div className="bg-white p-1.5 rounded-xl border-2 border-[#DFB338] shadow-xl flex items-center justify-center w-[86px] h-[86px] shrink-0">
                  <QRCodeSVG 
                    value={member.qrCodeData || `PBC-MEMBER:${member.id}:${member.fullName}:active`} 
                    size={74} 
                    level="H"
                    className="w-full h-full"
                  />
                </div>

                {/* MEMBER ID TWO-TONE BOX */}
                <div className="w-[110px] rounded-lg overflow-hidden shadow-lg border border-[#DFB338] shrink-0 flex flex-col">
                  <div className="bg-[#061224] h-[18px] px-1 text-center border-b border-[#DFB338] flex items-center justify-center">
                    <span className="text-[8px] font-black text-[#FDF0A6] uppercase tracking-wider block leading-none" style={{ letterSpacing: '0.8px' }}>
                      MEMBER ID
                    </span>
                  </div>
                  <div 
                    className="h-[26px] px-1 text-center flex items-center justify-center"
                    style={{ background: 'linear-gradient(90deg, #DFB338 0%, #FFF0A5 50%, #C89722 100%)' }}
                  >
                    <span className="text-[15px] font-black text-[#040D1B] font-mono tracking-widest block leading-none" style={{ letterSpacing: '1px' }}>
                      {numericMemberId}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* 3. MEMBER NAME (Centered & Large with clear margin and line clearance) */}
            <div className="relative z-10 text-left my-1 pb-1 border-b-[1.5px] border-[#DFB338]">
              <h2 
                className="text-[17.5px] font-black text-white uppercase tracking-wide block leading-normal truncate" 
                style={{ letterSpacing: '0.5px', lineHeight: '1.3' }}
              >
                {member.fullName || 'RAKIB HOSSAIN'}
              </h2>
            </div>

            {/* 4. MEMBER DETAILS LIST TABLE (Larger, beautifully spaced & vertically centered) */}
            <div className="relative z-10 my-0.5 text-[10px] flex flex-col space-y-0.5">
              
              {/* Country */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
                <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                  <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                    <Globe className="w-2.5 h-2.5 text-[#FDF0A6]" />
                  </div>
                  <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>COUNTRY</span>
                </div>
                <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
                <span className="font-bold text-white flex-1 text-left leading-normal block truncate" style={{ letterSpacing: '0px' }}>
                  {member.country || 'Saudi Arabia'}
                </span>
              </div>

              {/* Blood Group */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
                <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                  <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                    <Droplet className="w-2.5 h-2.5 text-[#FDF0A6]" />
                  </div>
                  <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>BLOOD GROUP</span>
                </div>
                <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
                <span className="font-bold text-white flex-1 text-left leading-normal block" style={{ letterSpacing: '0px' }}>
                  {member.bloodGroup || 'O+'}
                </span>
              </div>

              {/* Date of Birth */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
                <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                  <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                    <Calendar className="w-2.5 h-2.5 text-[#FDF0A6]" />
                  </div>
                  <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>DATE OF BIRTH</span>
                </div>
                <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
                <span className="font-bold text-white flex-1 text-left leading-normal block" style={{ letterSpacing: '0px' }}>
                  {formatDateDisplay(member.dateOfBirth)}
                </span>
              </div>

              {/* Mobile */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
                <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                  <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                    <Phone className="w-2.5 h-2.5 text-[#FDF0A6]" />
                  </div>
                  <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>MOBILE</span>
                </div>
                <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
                <span className="font-mono font-bold text-white flex-1 text-left leading-normal block truncate" style={{ letterSpacing: '0px' }}>
                  {member.phone || '0503342655'}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                  <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                    <Mail className="w-2.5 h-2.5 text-[#FDF0A6]" />
                  </div>
                  <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>EMAIL</span>
                </div>
                <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
                <span className="font-mono text-[9.5px] font-semibold text-[#F1F5F9] flex-1 text-left leading-normal block truncate" style={{ letterSpacing: '0px' }}>
                  {member.email || 'rakib.ahamed318749@gmail.com'}
                </span>
              </div>

            </div>

            {/* 5. BOTTOM FOOTER (With Official Logo) */}
            <div className="relative z-10 flex items-center gap-2.5 pt-1.5 border-t border-[#DFB338]/40 pb-0.5">
              
              {/* PBC Official Circular Logo */}
              <div className="shrink-0">
                <PbcCircularLogo className="w-8 h-8 rounded-full shadow-md border border-[#DFB338]/80 bg-[#061224]" />
              </div>

              <div className="w-[1.5px] h-7 bg-gradient-to-b from-[#DFB338] to-transparent"></div>

              <div className="text-left">
                <span className="text-[9.5px] font-black text-[#FDF0A6] block leading-tight uppercase" style={{ letterSpacing: '0.5px' }}>
                  PBC FAMILY
                </span>
                <span className="text-[8px] font-bold text-[#E2E8F0] block leading-tight uppercase tracking-wider" style={{ letterSpacing: '0.5px' }}>
                  ONE CLUB • ONE FAMILY
                </span>
              </div>

            </div>

          </div>

          {/* ==================== ON-SCREEN BACK ==================== */}
          <div 
            id={`card-back-${member.id}`}
            className={`absolute inset-0 w-[340px] h-[525px] rounded-[24px] text-white border-2 border-[#D4AF37] shadow-2xl overflow-hidden rotate-y-180 backface-hidden transition-opacity duration-300 flex flex-col justify-between box-border ${
              !isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{
              backgroundColor: '#040D1B',
              backgroundImage: 'radial-gradient(circle at 20% 20%, #0D2342 0%, #040D1B 75%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              fontFamily: 'Arial, Helvetica, sans-serif',
              boxSizing: 'border-box'
            }}
          >
            {/* Official PBC Circular Watermark Logo in lower-middle area (Image 2 placement) */}
            <div className="absolute top-[320px] left-1/2 -translate-x-1/2 w-44 h-44 pointer-events-none z-0 flex items-center justify-center">
              <PbcWatermarkLogo className="w-full h-full" opacity={0.16} />
            </div>

            <div className="p-[16px] pb-0 flex flex-col justify-between h-full relative z-10 box-border">
              
              {/* 1. TOP HEADER (Identical to Front) */}
              <div className="text-center pb-1">
                <div className="flex items-center justify-center">
                  <PbcAirplaneHeaderLogo className="w-[260px] max-w-[92%] h-[52px]" />
                </div>

                {/* TOGETHER WE RISE Slogan */}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="w-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#DFB338] to-[#FDF0A6]"></div>
                  <span className="text-[8.5px] font-black text-[#FDF0A6] uppercase tracking-wider px-1 leading-normal" style={{ letterSpacing: '0.8px' }}>
                    TOGETHER WE RISE
                  </span>
                  <div className="w-10 h-[1.5px] bg-gradient-to-r from-[#FDF0A6] via-[#DFB338] to-transparent"></div>
                </div>
              </div>

              {/* 2. FAMILY INFORMATION SECTION */}
              <div className="my-0.5 space-y-1.5">
                
                {/* Gold Capsule Header Badge with guaranteed high-contrast dark text */}
                <div 
                  className="inline-flex items-center px-3 py-1 rounded-full shadow-md border border-[#DFB338] relative"
                  style={{
                    background: 'linear-gradient(90deg, #DFB338 0%, #FFF0A5 50%, #C89722 100%)',
                    backgroundColor: '#DFB338'
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded-full bg-[#040D1B] flex items-center justify-center shrink-0 mr-1.5"
                    style={{ backgroundColor: '#040D1B' }}
                  >
                    <Users className="w-2.5 h-2.5 text-[#FDF0A6]" style={{ color: '#FDF0A6' }} />
                  </div>
                  <span 
                    className="text-[10px] font-black uppercase tracking-wide inline-block leading-normal" 
                    style={{ 
                      color: '#040D1B', 
                      letterSpacing: '0.5px',
                      fontWeight: 900
                    }}
                  >
                    FAMILY INFORMATION
                  </span>
                </div>

                {/* White Rounded Info Card */}
                <div className="bg-white rounded-2xl border-2 border-[#DFB338] p-3.5 text-slate-900 shadow-xl space-y-1">
                  
                  {/* Nominee Name */}
                  <div className="flex items-center text-[10px] py-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                      <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>N. NAME</span>
                    </div>
                    <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                    <span className="font-extrabold text-slate-900 leading-normal flex-1 truncate text-[10.5px]" style={{ letterSpacing: '0px', color: '#040D1B' }}>
                      {member.familyInfoName || member.nomineeName || 'Bristi Akter'}
                    </span>
                  </div>

                  {/* Relation */}
                  <div className="flex items-center text-[10px] py-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                      <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                        <Users className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>RELATION</span>
                    </div>
                    <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                    <span className="font-extrabold text-slate-900 leading-normal flex-1 text-[10.5px]" style={{ letterSpacing: '0px', color: '#040D1B' }}>
                      {member.familyInfoRelation || member.nomineeRelation || 'Wife'}
                    </span>
                  </div>

                  {/* Mobile */}
                  <div className="flex items-center text-[10px] py-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                      <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                        <Phone className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>MOBILE</span>
                    </div>
                    <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                    <span className="font-mono font-bold text-slate-900 leading-normal flex-1 text-[10.5px]" style={{ letterSpacing: '0px', color: '#040D1B' }}>
                      {member.familyInfoMobile || member.nomineeMobile || '01871713907'}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center text-[10px] pt-1.5">
                    <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                      <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                        <Home className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>ADDRESS</span>
                    </div>
                    <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                    <span className="font-bold text-slate-800 text-[10px] leading-normal flex-1 truncate" style={{ letterSpacing: '0px', color: '#1E293B' }}>
                      {member.familyInfoAddress || member.nomineeAddress || 'Gojaria,Nawabgonj,Dhaka'}
                    </span>
                  </div>

                </div>

              </div>

              {/* 3. SIGNATURE & OFFICIAL LOGO BADGE */}
              <div className="flex items-center justify-between px-1 my-0.5">
                
                {/* Authorized Signature */}
                <div className="text-left">
                  <div 
                    className="italic text-[#E0F2FE] font-bold text-[15px] leading-tight pb-0.5" 
                    style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}
                  >
                    PBC Admin
                  </div>
                  <div className="h-[1px] w-28 bg-[#DFB338] mb-1"></div>
                  <span className="text-[7.5px] font-bold text-[#FDF0A6] uppercase block leading-normal" style={{ letterSpacing: '0.5px' }}>
                    AUTHORIZED SIGNATURE
                  </span>
                </div>

                {/* Official PBC Circular Logo Badge with EST. 2025 */}
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    <PbcCircularLogo className="w-11 h-11 rounded-full shadow-md border-2 border-[#DFB338] bg-[#061224]" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] font-bold text-[#CBD5E1] block leading-none">EST.</span>
                    <span className="text-[13px] font-black text-[#FDF0A6] block leading-tight font-mono">2025</span>
                  </div>
                </div>

              </div>

              {/* 4. BOTTOM METALLIC GOLD WAVE BANNER */}
              <div 
                className="-mx-[16px] mt-1 py-2 px-3 text-center border-t border-[#FDF0A6] shadow-lg rounded-b-[22px]"
                style={{
                  background: 'linear-gradient(90deg, #C89722 0%, #FFF0A5 50%, #DFB338 100%)',
                  color: '#040D1B'
                }}
              >
                <p className="text-[7.5px] font-black uppercase leading-normal text-[#040D1B]" style={{ letterSpacing: '0.5px' }}>
                  PROUD MEMBER OF
                </p>
                <h4 className="text-[11px] font-black uppercase leading-tight my-0.5 text-[#040D1B]" style={{ letterSpacing: '0.5px' }}>
                  PROBASHI BUSINESS CLUB
                </h4>
                <p className="text-[7px] font-black uppercase leading-normal text-[#040D1B]" style={{ letterSpacing: '0.5px' }}>
                  LEARN • DEVELOP • CONNECT • GROW TOGETHER
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Action Buttons Toolbar (Flip, Download, Print) */}
      <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-2">
        <button
          id="btn-flip-card-view"
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'সামনের পাশ (Front)' : 'পেছনের পাশ (Back)'}</span>
        </button>

        <button
          id="btn-download-cr80-pdf"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-amber-400 shadow-md transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
          <span>PVC PDF (CR80)</span>
        </button>

        <button
          id="btn-download-a4-sheet"
          onClick={handleDownloadA4Sheet}
          disabled={downloadingA4}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-amber-400 shadow-md transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
        >
          {downloadingA4 ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Scissors className="w-3.5 h-3.5 text-amber-400" />}
          <span>A4 শিট (কাটার দাগ সহ)</span>
        </button>

        <button
          id="btn-download-png-image"
          onClick={handleDownloadPNG}
          disabled={downloadingImage}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-amber-400 shadow-md transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
        >
          {downloadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <ImageIcon className="w-3.5 h-3.5 text-amber-400" />}
          <span>ছবি (PNG)</span>
        </button>

        <button
          id="btn-print-card-direct"
          onClick={handlePrint}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-amber-400 shadow-md transition active:scale-95 flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-amber-400" />
          <span>প্রিন্ট (Print)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* HIDDEN OFF-SCREEN PERFECT RENDER NODES (Guaranteed 0% Transform distortion) */}
      {/* ========================================================================= */}
      <div 
        className="fixed top-0 left-[-9999px] pointer-events-none opacity-100" 
        aria-hidden="true"
        style={{ zIndex: -9999 }}
      >
        {/* EXPORT FRONT */}
        <div 
          id={`export-front-${member.id}`}
          className="relative w-[340px] h-[525px] rounded-[24px] p-[16px] text-white border-2 border-[#D4AF37] overflow-hidden flex flex-col justify-between box-border"
          style={{
            position: 'relative',
            backgroundColor: '#040D1B',
            backgroundImage: 'radial-gradient(circle at 85% 10%, #0D2342 0%, #040D1B 70%)',
            fontFamily: 'Arial, Helvetica, sans-serif',
            boxSizing: 'border-box'
          }}
        >
          {/* Top Right Flowing Metallic Gold Ribbon Waves */}
          <div 
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #FFF0A5 0%, #DFB338 45%, #8C6514 100%)',
              opacity: 0.88
            }}
          />
          <div 
            className="absolute top-0 right-0 w-40 h-28 rounded-bl-[100px]"
            style={{
              background: 'linear-gradient(220deg, #DFB338 0%, #B88B1E 55%, transparent 100%)',
              opacity: 0.45
            }}
          />
          {/* Thin Glowing Gold Wave Lines */}
          <div 
            className="absolute top-8 right-12 w-32 h-32 rounded-full border border-amber-300/40"
          />
          <div 
            className="absolute top-16 right-20 w-40 h-40 rounded-full border border-amber-400/25"
          />
          
          {/* Bottom Left Metallic Gold Arc Ribbon */}
          <div 
            className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full"
            style={{
              background: 'linear-gradient(45deg, #FFF0A5 0%, #DFB338 60%, transparent 100%)',
              opacity: 0.75
            }}
          />

          {/* Official PBC Circular Watermark Logo behind Member Details (Image 1 placement) */}
          <div className="absolute top-[310px] left-1/2 -translate-x-1/2 w-44 h-44 pointer-events-none z-0 flex items-center justify-center">
            <PbcWatermarkLogo className="w-full h-full" opacity={0.16} />
          </div>

          {/* 1. TOP HEADER */}
          <div className="relative z-10 text-center pb-1">
            <div className="flex items-center justify-center">
              <PbcAirplaneHeaderLogo className="w-[260px] max-w-[92%] h-[52px]" />
            </div>

            {/* TOGETHER WE RISE Slogan with flanking lines */}
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="w-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#DFB338] to-[#FDF0A6]"></div>
              <span className="text-[8.5px] font-black text-[#FDF0A6] uppercase tracking-wider px-1 leading-normal" style={{ letterSpacing: '0.8px' }}>
                TOGETHER WE RISE
              </span>
              <div className="w-10 h-[1.5px] bg-gradient-to-r from-[#FDF0A6] via-[#DFB338] to-transparent"></div>
            </div>
          </div>

          {/* 2. MIDDLE SECTION: PHOTO (LEFT) + QR CODE + MEMBER ID (RIGHT) */}
          <div className="relative z-10 flex items-center justify-between gap-3 my-1">
            
            {/* PHOTO FRAME (LEFT) */}
            <div 
              className="relative w-[132px] h-[145px] rounded-2xl p-[2.5px] shrink-0"
              style={{ background: 'linear-gradient(180deg, #FFF0A5 0%, #DFB338 50%, #8C6514 100%)' }}
            >
              <div className="w-full h-full bg-[#040D1B] rounded-[13px] overflow-hidden">
                <img
                  src={memberPhotoSrc}
                  alt={member.fullName}
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            {/* RIGHT SIDE: QR CODE + MEMBER ID BADGE */}
            <div className="flex-1 flex flex-col items-center justify-between h-[145px] py-0.5">
              
              {/* QR CODE BOX */}
              <div className="bg-white p-1.5 rounded-xl border-2 border-[#DFB338] flex items-center justify-center w-[86px] h-[86px] shrink-0">
                <QRCodeSVG 
                  value={member.qrCodeData || `PBC-MEMBER:${member.id}:${member.fullName}:active`} 
                  size={74} 
                  level="H"
                  className="w-full h-full"
                />
              </div>

              {/* MEMBER ID TWO-TONE BOX */}
              <div className="w-[110px] rounded-lg overflow-hidden border border-[#DFB338] shrink-0 flex flex-col">
                <div className="bg-[#061224] h-[18px] px-1 text-center border-b border-[#DFB338] flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#FDF0A6] uppercase tracking-wider block leading-none" style={{ letterSpacing: '0.8px' }}>
                    MEMBER ID
                  </span>
                </div>
                <div 
                  className="h-[26px] px-1 text-center flex items-center justify-center"
                  style={{ background: 'linear-gradient(90deg, #DFB338 0%, #FFF0A5 50%, #C89722 100%)' }}
                >
                  <span className="text-[15px] font-black text-[#040D1B] font-mono tracking-widest block leading-none" style={{ letterSpacing: '1px' }}>
                    {numericMemberId}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* 3. MEMBER NAME (Centered & Large with clear margin and line clearance) */}
          <div className="relative z-10 text-left my-1 pb-1 border-b-[1.5px] border-[#DFB338]">
            <h2 
              className="text-[17.5px] font-black text-white uppercase tracking-wide block leading-normal truncate" 
              style={{ letterSpacing: '0.5px', lineHeight: '1.3' }}
            >
              {member.fullName || 'RAKIB HOSSAIN'}
            </h2>
          </div>

          {/* 4. MEMBER DETAILS LIST TABLE (Larger, beautifully spaced & vertically centered) */}
          <div className="relative z-10 my-0.5 text-[10px] flex flex-col space-y-0.5">
            
            {/* Country */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
              <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                  <Globe className="w-2.5 h-2.5 text-[#FDF0A6]" />
                </div>
                <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>COUNTRY</span>
              </div>
              <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
              <span className="font-bold text-white flex-1 text-left leading-normal block truncate" style={{ letterSpacing: '0px' }}>
                {member.country || 'Saudi Arabia'}
              </span>
            </div>

            {/* Blood Group */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
              <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                  <Droplet className="w-2.5 h-2.5 text-[#FDF0A6]" />
                </div>
                <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>BLOOD GROUP</span>
              </div>
              <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
              <span className="font-bold text-white flex-1 text-left leading-normal block" style={{ letterSpacing: '0px' }}>
                {member.bloodGroup || 'O+'}
              </span>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
              <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                  <Calendar className="w-2.5 h-2.5 text-[#FDF0A6]" />
                </div>
                <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>DATE OF BIRTH</span>
              </div>
              <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
              <span className="font-bold text-white flex-1 text-left leading-normal block" style={{ letterSpacing: '0px' }}>
                {formatDateDisplay(member.dateOfBirth)}
              </span>
            </div>

            {/* Mobile */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#DFB338]/30">
              <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                  <Phone className="w-2.5 h-2.5 text-[#FDF0A6]" />
                </div>
                <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>MOBILE</span>
              </div>
              <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
              <span className="font-mono font-bold text-white flex-1 text-left leading-normal block truncate" style={{ letterSpacing: '0px' }}>
                {member.phone || '0503342655'}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 min-w-[115px] shrink-0">
                <div className="w-4 h-4 rounded-[4px] border border-[#DFB338] flex items-center justify-center shrink-0 bg-[#061224]">
                  <Mail className="w-2.5 h-2.5 text-[#FDF0A6]" />
                </div>
                <span className="font-extrabold text-[#FDF0A6] uppercase leading-normal block" style={{ letterSpacing: '0.3px' }}>EMAIL</span>
              </div>
              <span className="text-[#DFB338] font-black px-1.5 leading-normal">:</span>
              <span className="font-mono text-[9.5px] font-semibold text-[#F1F5F9] flex-1 text-left leading-normal block truncate" style={{ letterSpacing: '0px' }}>
                {member.email || 'rakib.ahamed318749@gmail.com'}
              </span>
            </div>

          </div>

          {/* 5. BOTTOM FOOTER (With Official Logo) */}
          <div className="relative z-10 flex items-center gap-2.5 pt-1.5 border-t border-[#DFB338]/40 pb-0.5">
            
            {/* PBC Official Circular Logo */}
            <div className="shrink-0">
              <PbcCircularLogo className="w-8 h-8 rounded-full shadow-md border border-[#DFB338]/80 bg-[#061224]" />
            </div>

            <div className="w-[1.5px] h-7 bg-gradient-to-b from-[#DFB338] to-transparent"></div>

            <div className="text-left">
              <span className="text-[9.5px] font-black text-[#FDF0A6] block leading-tight uppercase" style={{ letterSpacing: '0.5px' }}>
                PBC FAMILY
              </span>
              <span className="text-[8px] font-bold text-[#E2E8F0] block leading-tight uppercase tracking-wider" style={{ letterSpacing: '0.5px' }}>
                ONE CLUB • ONE FAMILY
              </span>
            </div>

          </div>

        </div>

        {/* EXPORT BACK */}
        <div 
          id={`export-back-${member.id}`}
          className="relative w-[340px] h-[525px] rounded-[24px] text-white border-2 border-[#D4AF37] overflow-hidden flex flex-col justify-between box-border"
          style={{
            position: 'relative',
            backgroundColor: '#040D1B',
            backgroundImage: 'radial-gradient(circle at 20% 20%, #0D2342 0%, #040D1B 75%)',
            fontFamily: 'Arial, Helvetica, sans-serif',
            boxSizing: 'border-box'
          }}
        >
          {/* Official PBC Circular Watermark Logo in lower-middle area (Image 2 placement) */}
          <div className="absolute top-[320px] left-1/2 -translate-x-1/2 w-44 h-44 pointer-events-none z-0 flex items-center justify-center">
            <PbcWatermarkLogo className="w-full h-full" opacity={0.16} />
          </div>

          <div className="p-[16px] pb-0 flex flex-col justify-between h-full relative z-10 box-border">
            
            {/* 1. TOP HEADER (Identical to Front) */}
            <div className="text-center pb-1">
              <div className="flex items-center justify-center">
                <PbcAirplaneHeaderLogo className="w-[260px] max-w-[92%] h-[52px]" />
              </div>

              {/* TOGETHER WE RISE Slogan */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#DFB338] to-[#FDF0A6]"></div>
                <span className="text-[8.5px] font-black text-[#FDF0A6] uppercase tracking-wider px-1 leading-normal" style={{ letterSpacing: '0.8px' }}>
                  TOGETHER WE RISE
                </span>
                <div className="w-10 h-[1.5px] bg-gradient-to-r from-[#FDF0A6] via-[#DFB338] to-transparent"></div>
              </div>
            </div>

            {/* 2. FAMILY INFORMATION SECTION */}
            <div className="my-0.5 space-y-1.5">
              
              {/* Gold Capsule Header Badge with guaranteed high-contrast dark text */}
              <div 
                className="inline-flex items-center px-3 py-1 rounded-full shadow-md border border-[#DFB338] relative"
                style={{
                  background: 'linear-gradient(90deg, #DFB338 0%, #FFF0A5 50%, #C89722 100%)',
                  backgroundColor: '#DFB338'
                }}
              >
                <div 
                  className="w-4 h-4 rounded-full bg-[#040D1B] flex items-center justify-center shrink-0 mr-1.5"
                  style={{ backgroundColor: '#040D1B' }}
                >
                  <Users className="w-2.5 h-2.5 text-[#FDF0A6]" style={{ color: '#FDF0A6' }} />
                </div>
                <span 
                  className="text-[10px] font-black uppercase tracking-wide inline-block leading-normal" 
                  style={{ 
                    color: '#040D1B', 
                    letterSpacing: '0.5px',
                    fontWeight: 900
                  }}
                >
                  FAMILY INFORMATION
                </span>
              </div>

              {/* White Rounded Info Card */}
              <div className="bg-white rounded-2xl border-2 border-[#DFB338] p-3.5 text-slate-900 shadow-xl space-y-1">
                
                {/* Nominee Name */}
                <div className="flex items-center text-[10px] py-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                    <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                      <User className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>N. NAME</span>
                  </div>
                  <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                  <span className="font-extrabold text-slate-900 leading-normal flex-1 truncate text-[10.5px]" style={{ letterSpacing: '0px', color: '#040D1B' }}>
                    {member.familyInfoName || member.nomineeName || 'Bristi Akter'}
                  </span>
                </div>

                {/* Relation */}
                <div className="flex items-center text-[10px] py-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                    <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                      <Users className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>RELATION</span>
                  </div>
                  <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                  <span className="font-extrabold text-slate-900 leading-normal flex-1 text-[10.5px]" style={{ letterSpacing: '0px', color: '#040D1B' }}>
                    {member.familyInfoRelation || member.nomineeRelation || 'Wife'}
                  </span>
                </div>

                {/* Mobile */}
                <div className="flex items-center text-[10px] py-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                    <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                      <Phone className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>MOBILE</span>
                  </div>
                  <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                  <span className="font-mono font-bold text-slate-900 leading-normal flex-1 text-[10.5px]" style={{ letterSpacing: '0px', color: '#040D1B' }}>
                    {member.familyInfoMobile || member.nomineeMobile || '01871713907'}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center text-[10px] pt-1.5">
                  <div className="flex items-center gap-1.5 min-w-[90px] shrink-0">
                    <div className="w-4 h-4 rounded-[4px] bg-[#061224] flex items-center justify-center text-white shrink-0">
                      <Home className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="font-extrabold text-slate-800 uppercase leading-normal" style={{ letterSpacing: '0px', color: '#0F172A' }}>ADDRESS</span>
                  </div>
                  <span className="font-bold text-slate-500 leading-normal px-1.5">:</span>
                  <span className="font-bold text-slate-800 text-[10px] leading-normal flex-1 truncate" style={{ letterSpacing: '0px', color: '#1E293B' }}>
                    {member.familyInfoAddress || member.nomineeAddress || 'Gojaria,Nawabgonj,Dhaka'}
                  </span>
                </div>

              </div>

            </div>

            {/* 3. SIGNATURE & OFFICIAL LOGO BADGE */}
            <div className="flex items-center justify-between px-1 my-0.5">
              
              {/* Authorized Signature */}
              <div className="text-left">
                <div 
                  className="italic text-[#E0F2FE] font-bold text-[15px] leading-tight pb-0.5" 
                  style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}
                >
                  PBC Admin
                </div>
                <div className="h-[1px] w-28 bg-[#DFB338] mb-1"></div>
                <span className="text-[7.5px] font-bold text-[#FDF0A6] uppercase block leading-normal" style={{ letterSpacing: '0.5px' }}>
                  AUTHORIZED SIGNATURE
                </span>
              </div>

              {/* Official PBC Circular Logo Badge with EST. 2025 */}
              <div className="flex items-center gap-2">
                <div className="shrink-0">
                  <PbcCircularLogo className="w-11 h-11 rounded-full shadow-md border-2 border-[#DFB338] bg-[#061224]" />
                </div>
                <div className="text-left">
                  <span className="text-[8px] font-bold text-[#CBD5E1] block leading-none">EST.</span>
                  <span className="text-[13px] font-black text-[#FDF0A6] block leading-tight font-mono">2025</span>
                </div>
              </div>

            </div>

            {/* 4. BOTTOM METALLIC GOLD WAVE BANNER */}
            <div 
              className="-mx-[16px] mt-1 py-2 px-3 text-center border-t border-[#FDF0A6] shadow-lg rounded-b-[22px]"
              style={{
                background: 'linear-gradient(90deg, #C89722 0%, #FFF0A5 50%, #DFB338 100%)',
                color: '#040D1B'
              }}
            >
              <p className="text-[7.5px] font-black uppercase leading-normal text-[#040D1B]" style={{ letterSpacing: '0.5px' }}>
                PROUD MEMBER OF
              </p>
              <h4 className="text-[11px] font-black uppercase leading-tight my-0.5 text-[#040D1B]" style={{ letterSpacing: '0.5px' }}>
                PROBASHI BUSINESS CLUB
              </h4>
              <p className="text-[7px] font-black uppercase leading-normal text-[#040D1B]" style={{ letterSpacing: '0.5px' }}>
                LEARN • DEVELOP • CONNECT • GROW TOGETHER
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
