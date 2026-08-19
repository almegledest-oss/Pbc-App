import html2canvas from 'html2canvas';

const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
if (canvas) {
  canvas.width = 1;
  canvas.height = 1;
}
const canvasCtx = canvas ? canvas.getContext('2d') : null;

/**
 * Converts OKLCH color string to rgb/rgba string.
 * Handles forms like: oklch(0.704 0.04 256.788), oklch(70.4% 0.04 256.788 / 0.8), oklch(70.4% 0.04 256.788 / 80%)
 */
export function oklchToRgb(oklchStr: string): string | null {
  try {
    const match = oklchStr.match(/oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
    if (!match) return null;

    let [, lStr, cStr, hStr, aStr] = match;

    let L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
    let C = parseFloat(cStr);
    let H = parseFloat(hStr);

    let alpha = 1;
    if (aStr !== undefined) {
      alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
    }

    // Convert OKLCH to OKLAB
    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    // Convert OKLAB to linear LMS
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const lLinear = l_ * l_ * l_;
    const mLinear = m_ * m_ * m_;
    const sLinear = s_ * s_ * s_;

    // Convert linear LMS to linear sRGB
    const rLinear = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
    const gLinear = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
    const bLinear = -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.707614701 * sLinear;

    // Helper for sRGB gamma companding
    const compand = (c: number) => {
      const abs = Math.abs(c);
      const companded = abs <= 0.0031308 ? 12.92 * abs : 1.055 * Math.pow(abs, 1 / 2.4) - 0.055;
      return c < 0 ? -companded : companded;
    };

    const r = Math.min(255, Math.max(0, Math.round(compand(rLinear) * 255)));
    const g = Math.min(255, Math.max(0, Math.round(compand(gLinear) * 255)));
    const bComp = Math.min(255, Math.max(0, Math.round(compand(bLinear) * 255)));

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${bComp}, ${alpha.toFixed(3)})`;
    }
    return `rgb(${r}, ${g}, ${bComp})`;
  } catch {
    return null;
  }
}

/**
 * Converts modern CSS colors (oklab, oklch, color-mix, color, lab, lch, hwb, light-dark) into standard rgb/hex colors
 * supported by html2canvas CSS parser.
 */
export function colorToRgb(colorStr: string): string {
  if (!colorStr) return '';
  const trimmed = colorStr.trim();
  if (
    !trimmed.includes('oklab') &&
    !trimmed.includes('oklch') &&
    !trimmed.includes('color-mix') &&
    !trimmed.includes('color(') &&
    !trimmed.includes('lab(') &&
    !trimmed.includes('lch(') &&
    !trimmed.includes('hwb(') &&
    !trimmed.includes('light-dark(')
  ) {
    return colorStr;
  }

  // Try math parser first for oklch
  const mathConverted = oklchToRgb(trimmed);
  if (mathConverted) return mathConverted;

  if (canvasCtx) {
    try {
      canvasCtx.fillStyle = '#000000';
      canvasCtx.fillStyle = trimmed;
      const resolved = canvasCtx.fillStyle;
      if (
        resolved &&
        resolved !== '#000000' &&
        !resolved.includes('oklab') &&
        !resolved.includes('oklch') &&
        !resolved.includes('color(') &&
        !resolved.includes('lab(') &&
        !resolved.includes('color-mix')
      ) {
        return resolved;
      }
    } catch {
      // ignore
    }
  }

  if (trimmed.includes('transparent') || trimmed.includes('/ 0')) {
    return 'rgba(0,0,0,0)';
  }
  return '#888888';
}

/**
 * Replaces modern color functions in any CSS string with standard sRGB/RGBA.
 * Handles nested parentheses up to 3 levels deep (e.g., color-mix(in srgb, color(display-p3 ...))).
 */
export function replaceModernColorsInString(str: string): string {
  if (!str) return str;
  if (
    !str.includes('oklab') &&
    !str.includes('oklch') &&
    !str.includes('color-mix') &&
    !str.includes('color(') &&
    !str.includes('lab(') &&
    !str.includes('lch(') &&
    !str.includes('hwb(') &&
    !str.includes('light-dark(')
  ) {
    return str;
  }

  const modernColorRegex = /\b(oklab|oklch|color-mix|color|lab|lch|hwb|light-dark)\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/gi;
  return str.replace(modernColorRegex, (match) => {
    return colorToRgb(match) || '#888888';
  });
}

export const replaceOklabInString = replaceModernColorsInString;

/**
 * Sanitizes all <style> elements and inline style attributes in cloned html2canvas document
 * so html2canvas's color parser does not crash on oklab/oklch/color color functions.
 * Optimized to ONLY inspect target element and avoid expensive full-document layout reflows.
 */
export function sanitizeOklabInDoc(clonedDoc: Document, targetEl?: HTMLElement | null) {
  // 1. Sanitize all <style> tags in cloned document (fast regex replacement)
  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach((style) => {
    if (style.textContent) {
      style.textContent = replaceModernColorsInString(style.textContent);
    }
  });

  // 2. Only inspect elements inside targetEl (not entire cloned document tree)
  const container = targetEl || clonedDoc.body;
  if (!container) return;

  const elements = container.querySelectorAll('*');
  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (!htmlEl.getAttribute) return;

    const styleAttr = htmlEl.getAttribute('style');
    if (styleAttr) {
      const sanitized = replaceModernColorsInString(styleAttr);
      if (sanitized !== styleAttr) {
        htmlEl.setAttribute('style', sanitized);
      }
    }
  });
}

/**
 * Fixes text clipping, letter-spacing distortion, and text-gradient bugs in cloned DOM for html2canvas.
 * Targeted only on the captured element to maintain ultra-fast performance.
 */
export function sanitizeTextForCanvas(clonedDoc: Document, targetEl?: HTMLElement | null) {
  const container = targetEl || clonedDoc.body;
  if (!container) return;

  const textElements = container.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6, label, strong, b');
  
  textElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (!htmlEl.style) return;
    
    // Fix letter spacing bug in html2canvas which slices characters horizontally
    htmlEl.style.letterSpacing = '0px';
    htmlEl.style.textRendering = 'geometricPrecision';
    htmlEl.style.overflow = 'visible';
    
    // Ensure sufficient line-height so descenders/ascenders are NEVER clipped
    if (!htmlEl.style.lineHeight || htmlEl.style.lineHeight === 'normal' || htmlEl.style.lineHeight === '1') {
      htmlEl.style.lineHeight = '1.35';
    }
    
    // Keep mono font for codes/numbers if present, otherwise clean sans-serif
    if (htmlEl.classList && (htmlEl.classList.contains('font-mono') || (htmlEl.style.fontFamily && htmlEl.style.fontFamily.includes('mono')))) {
      htmlEl.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    }
    
    // Fix ONLY explicitly transparent bg-clip-text elements (do NOT overwrite normal dark/colored texts)
    const isTextClip = (
      (htmlEl.classList && htmlEl.classList.contains('text-transparent') && (htmlEl.classList.contains('bg-clip-text') || htmlEl.classList.contains('bg-gradient-to-r')))
    );
      
    if (isTextClip) {
      if (htmlEl.classList) {
        htmlEl.classList.remove('text-transparent', 'bg-clip-text');
      }
      htmlEl.style.webkitBackgroundClip = 'initial';
      htmlEl.style.backgroundClip = 'initial';
      htmlEl.style.color = '#FDF0A6';
    }
  });
}

/**
 * Safely converts an image URL (Firebase, remote, or blob) into a local base64 Data URL.
 * Prevents canvas tainting (SecurityError) on mobile Safari and Chrome.
 */
export async function urlToSafeDataUrl(url?: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string || url);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Network fetch fallback
  }

  // Canvas drawing fallback
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width || 200;
        c.height = img.naturalHeight || img.height || 200;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(c.toDataURL('image/png'));
          return;
        }
      } catch {
        // Tainted canvas fallback
      }
      resolve(url);
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

/**
 * Universally triggers file download using Blob URLs.
 * Fully compatible with iOS Safari, Android Chrome, and all desktop browsers.
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Clean up silently
    }
  }, 1500);
}

/**
 * Captures a DOM element to HTML5 canvas with automated text and color sanitization.
 * Prevents canvas tainting so toDataURL never throws SecurityError.
 */
export async function captureElementToCanvas(
  el: HTMLElement, 
  options: Partial<Parameters<typeof html2canvas>[1]> = {}
) {
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const defaultScale = isMobile ? 2.5 : 3;

  return await html2canvas(el, {
    scale: defaultScale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    scrollY: 0,
    scrollX: 0,
    backgroundColor: '#040D1B',
    imageTimeout: 8000,
    ...options,
    onclone: (clonedDoc, element) => {
      sanitizeOklabInDoc(clonedDoc, element);
      sanitizeTextForCanvas(clonedDoc, element);

      // Strip 3D flip rotation classes from clonedDoc for clean unmirrored rendering
      const rotatedEls = clonedDoc.querySelectorAll('.rotate-y-180, .transform-style-3d, .perspective-1000');
      rotatedEls.forEach((rEl) => {
        const htmlR = rEl as HTMLElement;
        htmlR.classList.remove('rotate-y-180', 'transform-style-3d', 'perspective-1000');
        if (htmlR.style) {
          htmlR.style.transform = 'none';
          htmlR.style.webkitTransform = 'none';
        }
      });

      if (element) {
        element.style.transform = 'none';
        element.style.webkitTransform = 'none';
        element.style.opacity = '1';
        element.style.position = 'relative';
        element.style.left = '0px';
        element.style.top = '0px';
        element.style.visibility = 'visible';
        element.classList.remove('rotate-y-180', 'opacity-0', 'pointer-events-none');

        const children = element.querySelectorAll('*');
        children.forEach((child) => {
          const htmlChild = child as HTMLElement;
          if (htmlChild.classList) {
            htmlChild.classList.remove('rotate-y-180', 'opacity-0', 'pointer-events-none');
          }
          if (htmlChild.style) {
            if (htmlChild.style.transform && htmlChild.style.transform.includes('rotateY')) {
              htmlChild.style.transform = 'none';
            }
            if (htmlChild.style.webkitTransform && htmlChild.style.webkitTransform.includes('rotateY')) {
              htmlChild.style.webkitTransform = 'none';
            }
            if (htmlChild.style.opacity === '0') {
              htmlChild.style.opacity = '1';
            }
            htmlChild.style.letterSpacing = '0px';
          }
        });
      }

      if (options.onclone) {
        options.onclone(clonedDoc, element);
      }
    }
  });
}
