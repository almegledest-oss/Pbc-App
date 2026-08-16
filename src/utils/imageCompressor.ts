/**
 * Compresses an image File or base64 data URL to JPEG format with max dimensions and target quality.
 * This prevents Firestore 1MB document size limit errors when storing base64 images.
 */

export async function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const compressed = await compressDataUrl(dataUrl, maxWidth, maxHeight, quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  });
}

export async function compressDataUrl(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);

        // Prefer compressed version if smaller or if original is oversized
        if (compressed.length < dataUrl.length || dataUrl.length > 500000) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        console.warn('Canvas image compression error:', err);
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Uploads an image to ImgBB / Cloud hosting with client-side compression and instant fallback.
 */
export async function uploadImageToCloudOrCompressed(file: File): Promise<string> {
  const compressedDataUrl = await compressImageFile(file, 1000, 1000, 0.78);

  try {
    const base64Data = compressedDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    const formData = new FormData();
    formData.append('image', base64Data);

    const apiKey = (import.meta as any).env?.VITE_IMGBB_API_KEY || '2d44933fa1853d6118b08709f6e52002';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.url) {
        return data.data.url;
      }
    }
  } catch (err) {
    console.warn('ImgBB upload notice, using compressed image directly:', err);
  }

  return compressedDataUrl;
}

