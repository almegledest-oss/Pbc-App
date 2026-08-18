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
 * Converts modern CSS colors (oklab, oklch, color-mix) into standard rgb/hex colors
 * supported by html2canvas CSS parser.
 */
export function colorToRgb(colorStr: string): string {
  if (!colorStr) return '';
  if (!colorStr.includes('oklab') && !colorStr.includes('oklch') && !colorStr.includes('color-mix')) {
    return colorStr;
  }

  // Try math parser first
  const mathConverted = oklchToRgb(colorStr);
  if (mathConverted) return mathConverted;

  if (canvasCtx) {
    try {
      canvasCtx.fillStyle = '#000000';
      canvasCtx.fillStyle = colorStr;
      const resolved = canvasCtx.fillStyle;
      if (resolved && resolved !== '#000000' && !resolved.includes('oklab') && !resolved.includes('oklch')) {
        return resolved;
      }
    } catch {
      // ignore
    }
  }
  return '';
}

export function replaceOklabInString(str: string): string {
  if (!str) return str;
  return str.replace(/(oklab|oklch|color-mix)\([^)]+\)/gi, (match) => {
    return colorToRgb(match) || '#888888';
  });
}

/**
 * Sanitizes all <style> elements and inline style attributes in cloned html2canvas document
 * so html2canvas's color parser does not crash on oklab/oklch color functions.
 * Optimized to ONLY inspect target element and avoid expensive full-document layout reflows.
 */
export function sanitizeOklabInDoc(clonedDoc: Document, targetEl?: HTMLElement | null) {
  // 1. Sanitize all <style> tags in cloned document (fast regex replacement)
  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach((style) => {
    if (style.textContent && (style.textContent.includes('oklab') || style.textContent.includes('oklch') || style.textContent.includes('color-mix'))) {
      style.textContent = replaceOklabInString(style.textContent);
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
    if (styleAttr && (styleAttr.includes('oklab') || styleAttr.includes('oklch') || styleAttr.includes('color-mix'))) {
      htmlEl.setAttribute('style', replaceOklabInString(styleAttr));
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

  const textElements = container.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6, div, label, strong, b');
  
  textElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (!htmlEl.style) return;
    
    // Fix letter spacing bug in html2canvas which slices characters horizontally
    htmlEl.style.letterSpacing = '0px';
    htmlEl.style.textRendering = 'geometricPrecision';
    
    // Keep mono font for codes/numbers if present, otherwise clean sans-serif
    if (htmlEl.classList && (htmlEl.classList.contains('font-mono') || htmlEl.style.fontFamily.includes('mono'))) {
      htmlEl.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    }
    
    // Fix ONLY explicitly transparent bg-clip-text elements (do NOT overwrite normal dark/colored texts)
    const isTextClip = (
      (htmlEl.classList && (htmlEl.classList.contains('text-transparent') || htmlEl.classList.contains('bg-clip-text'))) ||
      htmlEl.style.webkitBackgroundClip === 'text' ||
      htmlEl.style.color === 'transparent'
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
 * Captures a DOM element to HTML5 canvas with automated text and color sanitization.
 * Uses high-performance settings (scale: 3 for ~300 DPI) to prevent browser lockup.
 */
export async function captureElementToCanvas(
  el: HTMLElement, 
  options: Partial<Parameters<typeof html2canvas>[1]> = {}
) {
  return await html2canvas(el, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    logging: false,
    scrollY: 0,
    scrollX: 0,
    backgroundColor: '#071220',
    imageTimeout: 5000,
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
