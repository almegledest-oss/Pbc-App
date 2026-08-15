import React from 'react';
import { PBCFramedAvatar } from './PBCFramedAvatar';

interface PBCDirectorFrameProps {
  photoUrl?: string;
  name?: string;
  designation?: string;
  location?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
}

export const PBCDirectorFrame: React.FC<PBCDirectorFrameProps> = ({
  photoUrl,
  name,
  designation,
  className = ''
}) => {
  return (
    <div className={`relative bg-[#060D1A] rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl p-1 sm:p-2 flex flex-col items-center justify-center select-none ${className}`}>
      <PBCFramedAvatar
        photoUrl={photoUrl}
        name={name}
        designation={designation}
        className="w-full h-auto aspect-square rounded-xl shadow-2xl"
      />
    </div>
  );
};

