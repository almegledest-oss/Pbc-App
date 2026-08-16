import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { safeStorage } from '../../utils/safeStorage';

interface PBCFramedAvatarProps {
  photoUrl?: string;
  name?: string;
  designation?: string;
  className?: string;
  alt?: string;
  showFrame?: boolean;
}

export const PBCFramedAvatar: React.FC<PBCFramedAvatarProps> = ({
  photoUrl,
  name,
  designation,
  className = 'w-12 h-12 rounded-xl',
  alt = 'Member Photo',
  showFrame = false,
}) => {
  const { systemSettings } = useApp();
  const [imgError, setImgError] = useState(false);

  // Retrieve saved overlay from systemSettings or localStorage or generated default PNG
  const frameOverlayUrl =
    systemSettings?.defaultFrameOverlayUrl ||
    safeStorage.getItem('pbc_default_frame_overlay') ||
    '';

  const getInitials = (n?: string) => {
    if (!n) return 'PBC';
    const parts = n.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const cleanPhotoUrl = photoUrl && photoUrl.trim() !== '' ? photoUrl.trim() : null;
  const hasPhoto = cleanPhotoUrl && !imgError;

  return (
    <div className={`relative inline-block shrink-0 overflow-hidden ${className}`}>
      {/* 1. Member's Own Distinct Photo */}
      {hasPhoto ? (
        <img
          src={cleanPhotoUrl}
          alt={alt || name || 'Member'}
          className="w-full h-full object-cover rounded-[inherit]"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback Initials Avatar - Unique to each member's name, never forcing a single face */
        <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-[#0F2142] via-[#0B1528] to-[#050A15] flex items-center justify-center text-amber-400 font-bold text-xs tracking-wider border border-amber-500/30">
          {getInitials(name)}
        </div>
      )}

      {/* 2. Uploaded Official Frame Overlay PNG or Gold Ring Frame (Placed on top of member photo automatically) */}
      {showFrame && (
        frameOverlayUrl ? (
          <img
            src={frameOverlayUrl}
            alt="PBC Frame Overlay"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 scale-100"
          />
        ) : (
          /* Official Golden PBC Frame Border Overlay (Default for all members if custom overlay isn't set) */
          <div className="absolute inset-0 rounded-[inherit] border-2 border-amber-400/90 shadow-[inset_0_0_8px_rgba(212,175,55,0.5)] pointer-events-none z-10" />
        )
      )}
    </div>
  );
};

