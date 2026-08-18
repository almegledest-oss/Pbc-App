import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { safeStorage } from '../../utils/safeStorage';

interface PbcLogoProps {
  className?: string;
  showContainer?: boolean;
  customLogoUrl?: string;
  variant?: 'default' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
}

const DEFAULT_OFFICIAL_LOGO = '/logo.svg';

export const PbcLogo: React.FC<PbcLogoProps> = ({ 
  className = "w-16 h-16", 
  showContainer = false,
  customLogoUrl,
  size
}) => {
  const [imgError, setImgError] = useState(false);
  
  // Safely get context logo url if available
  let contextLogoUrl = '';
  try {
    const { systemSettings } = useApp();
    if (systemSettings?.customLogoUrl) {
      contextLogoUrl = systemSettings.customLogoUrl;
    }
  } catch {
    // Context might not be available in isolated renderers
  }

  // Fast localStorage cache check for immediate rendering
  const [cachedLogo, setCachedLogo] = useState<string | null>(() => {
    return safeStorage.getItem('pbc_cached_custom_logo');
  });

  useEffect(() => {
    if (contextLogoUrl) {
      setCachedLogo(contextLogoUrl);
      // Only cache if not an enormous base64 data string (>100KB)
      if (contextLogoUrl.length < 100 * 1024) {
        safeStorage.setItem('pbc_cached_custom_logo', contextLogoUrl);
      }
    } else if (contextLogoUrl === '') {
      setCachedLogo(null);
      safeStorage.removeItem('pbc_cached_custom_logo');
    }
  }, [contextLogoUrl]);

  // Priority: 
  // 1. Direct prop (customLogoUrl)
  // 2. Context / database logo (contextLogoUrl)
  // 3. LocalStorage cached logo
  // 4. Default instant /logo.svg
  const activeCustomLogo = customLogoUrl || contextLogoUrl || cachedLogo;
  const displaySrc = (!imgError && activeCustomLogo) ? activeCustomLogo : DEFAULT_OFFICIAL_LOGO;

  const sizeClasses = size
    ? {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
        '2xl': 'w-28 h-28',
        custom: ''
      }[size] || 'w-10 h-10'
    : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${
        showContainer ? 'rounded-2xl shadow-sm border border-amber-500/30 bg-[#070D1B] p-1' : ''
      } ${sizeClasses} ${className}`}
      id="pbc-official-logo"
    >
      <img 
        src={displaySrc} 
        alt="PBC Club Official Logo" 
        loading="eager"
        className="w-full h-full object-contain rounded-xl drop-shadow-md"
        referrerPolicy="no-referrer"
        onError={() => {
          if (!imgError && activeCustomLogo) {
            setImgError(true);
          }
        }}
      />
    </div>
  );
};

export default PbcLogo;


