import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface PbcLogoProps {
  className?: string;
  showContainer?: boolean;
  customLogoUrl?: string;
  variant?: 'default' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
}

const OFFICIAL_LOGO_FALLBACK = '/logo.png';

export const PbcLogo: React.FC<PbcLogoProps> = ({ 
  className = "w-16 h-16", 
  showContainer = false,
  customLogoUrl,
  size
}) => {
  const [imgError, setImgError] = useState(false);

  let appLogoUrl = customLogoUrl;
  try {
    const { systemSettings } = useApp();
    if (!appLogoUrl && systemSettings?.customLogoUrl) {
      appLogoUrl = systemSettings.customLogoUrl;
    }
  } catch {
    // Context might not be available in isolated renderers
  }

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

  const displaySrc = !imgError && appLogoUrl ? appLogoUrl : OFFICIAL_LOGO_FALLBACK;

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
        className="w-full h-full object-contain rounded-xl drop-shadow-md"
        referrerPolicy="no-referrer"
        onError={() => {
          if (!imgError) {
            setImgError(true);
          }
        }}
      />
    </div>
  );
};

export default PbcLogo;

