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

let cachedSanitizedCss = '';

/**
 * Preloads and compiles all application styles (from stylesheets, links, and style tags)
 * into a single sanitized CSS string where modern color functions (oklch/oklab) are converted to sRGB/HEX.
 * This guarantees 100% preserved Tailwind CSS layouts, fonts, borders, and colors in html2canvas.
 */
export async function preloadAndSanitizeAppStyles(): Promise<string> {
  if (cachedSanitizedCss) return cachedSanitizedCss;

  let combinedCss = '';

  if (typeof document !== 'undefined') {
    // 1. Gather all CSS rules from document.styleSheets
    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          if (sheet.cssRules) {
            for (let j = 0; j < sheet.cssRules.length; j++) {
              combinedCss += sheet.cssRules[j].cssText + '\n';
            }
          }
        } catch {
          // If cross-origin/CORS restriction prevents cssRules access, fetch directly
          if (sheet.href) {
            try {
              const res = await fetch(sheet.href);
              if (res.ok) {
                const text = await res.text();
                combinedCss += text + '\n';
              }
            } catch {
              // Silently ignore
            }
          }
        }
      }
    } catch {
      // Silently ignore
    }

    // 2. Also check any <link rel="stylesheet"> in document
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of Array.from(links)) {
      const href = (link as HTMLLinkElement).href;
      if (href) {
        try {
          const res = await fetch(href);
          if (res.ok) {
            const text = await res.text();
            combinedCss += text + '\n';
          }
        } catch {
          // Silently ignore
        }
      }
    }

    // 3. Gather all inline <style> tags
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach((s) => {
      if (s.textContent) {
        combinedCss += s.textContent + '\n';
      }
    });
  }

  // Sanitize all modern color functions (oklch/oklab) in the combined CSS
  cachedSanitizedCss = replaceModernColorsInString(combinedCss);
  return cachedSanitizedCss;
}

/**
 * Sanitizes all stylesheets and inline style attributes in cloned html2canvas document
 * so html2canvas's parser receives 100% full CSS styling with sRGB/HEX color compatibility.
 */
export function sanitizeOklabInDoc(clonedDoc: Document, targetEl?: HTMLElement | null) {
  // 1. If we have cached sanitized CSS, inject it as a primary style tag
  if (cachedSanitizedCss) {
    // Remove external link tags in clone so html2canvas doesn't fetch un-sanitized external stylesheets
    const linkElements = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
    linkElements.forEach((link) => link.remove());

    let pbcStyle = clonedDoc.getElementById('pbc-sanitized-styles') as HTMLStyleElement | null;
    if (!pbcStyle) {
      pbcStyle = clonedDoc.createElement('style');
      pbcStyle.id = 'pbc-sanitized-styles';
      if (clonedDoc.head) {
        clonedDoc.head.appendChild(pbcStyle);
      } else if (clonedDoc.body) {
        clonedDoc.body.prepend(pbcStyle);
      }
    }
    pbcStyle.textContent = cachedSanitizedCss;
  } else {
    // Fallback: sanitize existing style tags in clonedDoc
    const styleElements = clonedDoc.querySelectorAll('style');
    styleElements.forEach((style) => {
      if (style.textContent) {
        style.textContent = replaceModernColorsInString(style.textContent);
      }
    });
  }

  // 2. Inspect target element inline styles and sanitize them
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
  // Preload and sanitize all stylesheets before capturing to guarantee full Tailwind styles without oklch crashes
  await preloadAndSanitizeAppStyles();

  const width = el.offsetWidth || 340;
  const height = el.offsetHeight || 525;

  return await html2canvas(el, {
    scale: 3,
    useCORS: true,
    allowTaint: false,
    logging: false,
    scrollY: 0,
    scrollX: 0,
    windowWidth: 1200,
    windowHeight: 1200,
    width,
    height,
    backgroundColor: '#040D1B',
    imageTimeout: 10000,
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
        if (element.parentElement) {
          element.parentElement.style.opacity = '1';
          element.parentElement.style.visibility = 'visible';
          element.parentElement.style.pointerEvents = 'auto';
          element.parentElement.style.zIndex = '1';
          element.parentElement.classList.remove('opacity-0', 'pointer-events-none');
        }
        element.style.transform = 'none';
        element.style.webkitTransform = 'none';
        element.style.opacity = '1';
        element.style.position = 'relative';
        element.style.left = '0px';
        element.style.top = '0px';
        element.style.visibility = 'visible';
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.minWidth = `${width}px`;
        element.style.minHeight = `${height}px`;
        element.style.maxWidth = `${width}px`;
        element.style.maxHeight = `${height}px`;
        element.style.boxSizing = 'border-box';
        element.classList.remove('rotate-y-180', 'opacity-0', 'pointer-events-none');

        // Ensure all SVG elements (including QR code & logos) have explicit dimensions
        const svgs = element.querySelectorAll('svg');
        svgs.forEach((svg) => {
          if (!svg.getAttribute('width') && svg.clientWidth) {
            svg.setAttribute('width', `${svg.clientWidth}`);
          }
          if (!svg.getAttribute('height') && svg.clientHeight) {
            svg.setAttribute('height', `${svg.clientHeight}`);
          }
        });

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
