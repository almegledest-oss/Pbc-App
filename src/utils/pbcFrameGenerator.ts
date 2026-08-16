/**
 * Utility to generate an official PBC Executive Frame composite image (PNG Data URL).
 * Renders the official gold PBC Executive Frame design with circular photo viewport,
 * gold ribbons, airplane logo, and text.
 */

import { safeStorage } from './safeStorage';

const frameCache = new Map<string, string>();

function loadImageAsync(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: Retry loading without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => resolve(null);
      fallbackImg.src = url;
    };
    img.src = url;
  });
}

async function photoToDataUrl(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Ignore fetch errors
  }
  return url;
}

/**
 * Renders the photo + default frame design PNG onto a 1000x1000 Canvas and returns a PNG Data URL.
 */
export async function generatePBCFrameImage(
  rawPhotoUrl: string,
  options?: {
    frameOverlayUrl?: string;
    name?: string;
    designation?: string;
    photoX?: number;
    photoY?: number;
    photoScale?: number;
  }
): Promise<string> {
  const photoUrl = rawPhotoUrl || '';

  // Retrieve saved overlay from options or safeStorage
  const overlayUrl = options?.frameOverlayUrl || safeStorage.getItem('pbc_default_frame_overlay') || '';
  const photoX = options?.photoX || 0;
  const photoY = options?.photoY || 0;
  const photoScale = options?.photoScale || 1;

  const cacheKey = `${photoUrl}_${overlayUrl}_${photoX}_${photoY}_${photoScale}_${options?.name || ''}`;

  if (frameCache.has(cacheKey)) {
    return frameCache.get(cacheKey)!;
  }

  const safePhotoDataUrl = await photoToDataUrl(photoUrl);
  const safeOverlayDataUrl = overlayUrl ? await photoToDataUrl(overlayUrl) : '';

  const [photoImg, overlayImg] = await Promise.all([
    loadImageAsync(safePhotoDataUrl),
    safeOverlayDataUrl ? loadImageAsync(safeOverlayDataUrl) : Promise.resolve(null)
  ]);

  const canvas = document.createElement('canvas');
  const size = 1000;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return photoUrl;

  ctx.clearRect(0, 0, size, size);

  if (overlayImg && overlayImg.naturalWidth > 0) {
    // ----------------------------------------------------
    // UPLOADED CUSTOM TRANSPARENT FRAME OVERLAY PNG
    // ----------------------------------------------------
    if (photoImg && photoImg.naturalWidth > 0) {
      const imgAspect = photoImg.naturalWidth / photoImg.naturalHeight;
      let drawW = size * photoScale;
      let drawH = size * photoScale;

      if (imgAspect > 1) {
        drawW = drawH * imgAspect;
      } else {
        drawH = drawW / imgAspect;
      }

      const drawX = (size - drawW) / 2 + photoX;
      const drawY = (size - drawH) / 2 + photoY;

      ctx.save();
      ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0F2142';
      ctx.fillRect(0, 0, size, size);
    }

    // Overlay custom frame PNG across 1000x1000
    ctx.drawImage(overlayImg, 0, 0, size, size);

  } else {
    // ----------------------------------------------------
    // BUILT-IN OFFICIAL PBC GOLD EXECUTIVE FRAME DESIGN
    // ----------------------------------------------------
    renderBuiltInOfficialPBCFrame(ctx, size, photoImg, {
      photoX,
      photoY,
      photoScale,
      name: options?.name,
      designation: options?.designation
    });
  }

  try {
    const resultDataUrl = canvas.toDataURL('image/png');
    frameCache.set(cacheKey, resultDataUrl);
    return resultDataUrl;
  } catch (err) {
    console.error('Failed to export frame canvas dataUrl:', err);
    return photoUrl;
  }
}

/**
 * Draws the high-precision official PBC Gold Executive Frame with:
 * - Double gold square outer frame
 * - OFFICIAL 1000X1000 PNG top badge
 * - Center circular golden photo viewport with metallic multi-ring borders
 * - Gold curved wave/ribbon accents at the bottom
 * - PBC Airplane emblem + PROBASHI BUSINESS CLUB logo + TOGETHER WE RISE tagline
 */
function renderBuiltInOfficialPBCFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  photoImg: HTMLImageElement | null,
  options: { photoX: number; photoY: number; photoScale: number; name?: string; designation?: string }
) {
  const { photoX, photoY, photoScale } = options;

  // 1. Dark Luxury Navy Radial Background
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 100, size / 2, size / 2, size * 0.75);
  bgGrad.addColorStop(0, '#0B172E');
  bgGrad.addColorStop(0.6, '#050A15');
  bgGrad.addColorStop(1, '#020409');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Outer Dual Metallic Gold Borders
  ctx.save();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, size - 48, size - 48);

  ctx.strokeStyle = '#F5D061';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, size - 72, size - 72);
  ctx.restore();

  // 3. Top Right Badge ("OFFICIAL 1000X1000 PNG")
  const badgeX = size - 260;
  const badgeY = 50;
  const badgeW = 200;
  const badgeH = 32;
  ctx.save();
  ctx.fillStyle = '#020409';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#F5D061';
  ctx.font = '900 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OFFICIAL 1000X1000 PNG', badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
  ctx.restore();

  // 4. Center Circular Member Photo Viewport
  const centerX = size / 2;
  const centerY = size / 2 - 40;
  const radius = 270;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();

  if (photoImg && photoImg.naturalWidth > 0) {
    const imgAspect = photoImg.naturalWidth / photoImg.naturalHeight;
    let drawW = radius * 2 * photoScale;
    let drawH = radius * 2 * photoScale;

    if (imgAspect > 1) {
      drawW = drawH * imgAspect;
    } else {
      drawH = drawW / imgAspect;
    }

    const drawX = centerX - drawW / 2 + photoX;
    const drawY = centerY - drawH / 2 + photoY;
    ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = '#0F2142';
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    if (options.name) {
      const parts = options.name.trim().split(' ').filter(Boolean);
      const initials = parts.length >= 2 
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : options.name.slice(0, 2).toUpperCase();
      
      ctx.fillStyle = '#F5D061';
      ctx.font = '900 90px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials || 'PBC', centerX, centerY);
    }
  }
  ctx.restore();

  // 5. Metallic Triple Gold Circular Frame Rings
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 12, 0, Math.PI * 2);
  ctx.strokeStyle = '#F5D061';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 4, 0, Math.PI * 2);
  ctx.strokeStyle = '#8A6D1C';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 6. Bottom Sweeping Metallic Gold Ribbon Arcs
  ctx.save();
  const ribbonGradLeft = ctx.createLinearGradient(0, size - 280, size / 2, size - 120);
  ribbonGradLeft.addColorStop(0, '#8A6D1C');
  ribbonGradLeft.addColorStop(0.5, '#F5D061');
  ribbonGradLeft.addColorStop(1, '#D4AF37');

  // Left Ribbon Arc
  ctx.beginPath();
  ctx.moveTo(36, size - 260);
  ctx.quadraticCurveTo(size * 0.25, size - 160, size / 2, size - 140);
  ctx.lineTo(size / 2, size - 80);
  ctx.quadraticCurveTo(size * 0.2, size - 100, 36, size - 150);
  ctx.closePath();
  ctx.fillStyle = ribbonGradLeft;
  ctx.fill();

  // Right Ribbon Arc
  const ribbonGradRight = ctx.createLinearGradient(size, size - 280, size / 2, size - 120);
  ribbonGradRight.addColorStop(0, '#8A6D1C');
  ribbonGradRight.addColorStop(0.5, '#F5D061');
  ribbonGradRight.addColorStop(1, '#D4AF37');

  ctx.beginPath();
  ctx.moveTo(size - 36, size - 260);
  ctx.quadraticCurveTo(size * 0.75, size - 160, size / 2, size - 140);
  ctx.lineTo(size / 2, size - 80);
  ctx.quadraticCurveTo(size * 0.8, size - 100, size - 36, size - 150);
  ctx.closePath();
  ctx.fillStyle = ribbonGradRight;
  ctx.fill();
  ctx.restore();

  // 7. Bottom Gold Banner Container for Logo & Text
  const logoCenterY = size - 180;

  // Gold Airplane Symbol
  ctx.save();
  ctx.fillStyle = '#F5D061';
  
  // Draw Stylized PBC Airplane Icon
  const planeX = size / 2 - 160;
  const planeY = logoCenterY - 12;

  ctx.beginPath();
  ctx.moveTo(planeX, planeY);
  ctx.lineTo(planeX + 22, planeY - 10);
  ctx.lineTo(planeX + 18, planeY + 2);
  ctx.lineTo(planeX + 32, planeY + 2);
  ctx.lineTo(planeX + 26, planeY + 8);
  ctx.lineTo(planeX + 14, planeY + 8);
  ctx.lineTo(planeX + 10, planeY + 14);
  ctx.lineTo(planeX + 6, planeY + 14);
  ctx.lineTo(planeX + 8, planeY + 8);
  ctx.lineTo(planeX, planeY + 8);
  ctx.closePath();
  ctx.fill();

  // "PBC" Big Gold Block Lettering
  ctx.font = '900 48px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#F5D061';
  ctx.fillText('PBC', planeX + 38, logoCenterY + 12);

  // Divider Line
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(planeX + 148, logoCenterY - 18);
  ctx.lineTo(planeX + 148, logoCenterY + 18);
  ctx.stroke();

  // "PROBASHI BUSINESS CLUB" Text
  ctx.font = '800 16px system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PROBASHI', planeX + 160, logoCenterY - 4);
  ctx.fillText('BUSINESS CLUB', planeX + 160, logoCenterY + 14);

  // Tagline "TOGETHER WE RISE"
  ctx.font = '900 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F5D061';
  ctx.fillText('TOGETHER WE RISE', size / 2, logoCenterY + 55);

  ctx.restore();
}
