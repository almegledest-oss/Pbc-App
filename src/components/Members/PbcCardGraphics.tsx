import React from 'react';

/**
 * High-definition Vector Graphics for PBC Luxury Member ID Card
 * Matches the official Probashi Business Club gold and midnight navy brand design 100%
 */

// 1. Official PBC Airplane Header Logo (Loads the uploaded /public/pbc-card-logo.png directly)
export const PbcAirplaneHeaderLogo: React.FC<{ className?: string; color?: string }> = ({ 
  className = "w-[195px] h-[42px]", 
}) => {
  return (
    <img 
      src="/pbc-card-logo.png" 
      alt="Probashi Business Club" 
      className={`object-contain block mx-auto ${className}`}
      crossOrigin="anonymous"
    />
  );
};

// 2. PBC Official Circular Logo (Loads from /public/logo.svg)
export const PbcCircularLogo: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => {
  return (
    <img 
      src="/logo.svg" 
      alt="PBC Emblem" 
      className={`object-contain block ${className}`}
      crossOrigin="anonymous"
    />
  );
};

// 3. PBC Shield Crest with Laurel Wreath (Official Gold Emblem)
export const PbcShieldCrest: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF0A6" />
          <stop offset="50%" stopColor="#DFB338" />
          <stop offset="100%" stopColor="#8C6514" />
        </linearGradient>
      </defs>

      {/* Top Star */}
      <polygon 
        points="50,4 52.5,10 59,10.5 54,15 55.5,21 50,17.5 44.5,21 46,15 41,10.5 47.5,10" 
        fill="url(#crestGold)" 
      />

      {/* Laurel Wreath Left */}
      <path 
        d="M 28 32 C 22 42 20 56 26 70 C 30 77 36 82 43 86 M 24 38 C 18 42 20 48 24 46 M 22 50 C 16 54 18 60 23 58 M 24 62 C 19 66 22 72 27 70 M 30 73 C 26 78 30 83 36 80" 
        stroke="url(#crestGold)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />

      {/* Laurel Wreath Right */}
      <path 
        d="M 72 32 C 78 42 80 56 74 70 C 70 77 64 82 57 86 M 76 38 C 82 42 80 48 76 46 M 78 50 C 84 54 82 60 77 58 M 76 62 C 81 66 78 72 73 70 M 70 73 C 74 78 70 83 64 80" 
        stroke="url(#crestGold)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />

      {/* Shield Outline */}
      <path 
        d="M 33 24 L 67 24 C 67 48 64 68 50 78 C 36 68 33 48 33 24 Z" 
        fill="#061224" 
        stroke="url(#crestGold)" 
        strokeWidth="2" 
      />

      {/* Inner Crest Letters PBC */}
      <text 
        x="50" 
        y="54" 
        fill="url(#crestGold)" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontWeight="900" 
        fontSize="14" 
        textAnchor="middle" 
        letterSpacing="0.5"
      >
        PBC
      </text>

      {/* Airplane Silhouette inside Shield */}
      <path 
        d="M 46 36 L 50 32 L 54 36 L 51 36 L 51 40 L 49 40 L 49 36 Z" 
        fill="url(#crestGold)" 
      />
    </svg>
  );
};

// 3. Official 10-Star Metallic Gold Seal (Back of Card)
export const PbcGoldSealMedallion: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => {
  return (
    <svg 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="sealGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF4B8" />
          <stop offset="30%" stopColor="#DFB338" />
          <stop offset="70%" stopColor="#B3861B" />
          <stop offset="100%" stopColor="#735006" />
        </linearGradient>
        <linearGradient id="sealInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DFB338" />
          <stop offset="100%" stopColor="#9C7010" />
        </linearGradient>
      </defs>

      {/* Serrated / Starburst Ribbon Edge */}
      <circle cx="60" cy="60" r="56" fill="url(#sealGoldGrad)" />
      
      {/* Outer Dashed Golden Ring */}
      <circle 
        cx="60" 
        cy="60" 
        r="50" 
        stroke="#061224" 
        strokeWidth="1.5" 
        strokeDasharray="3 2" 
        fill="url(#sealInner)" 
      />

      {/* Inner Solid Border Ring */}
      <circle cx="60" cy="60" r="42" stroke="#061224" strokeWidth="1.5" fill="#E5BE48" />

      {/* Top 5 Stars */}
      <g fill="#061224" transform="translate(60, 32)">
        <text 
          x="0" 
          y="0" 
          fontSize="9" 
          fontWeight="900" 
          textAnchor="middle" 
          letterSpacing="2"
        >
          ★★★★★
        </text>
      </g>

      {/* Center "PBC" Text */}
      <text 
        x="60" 
        y="65" 
        fill="#061224" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontWeight="900" 
        fontSize="20" 
        textAnchor="middle" 
        letterSpacing="1"
      >
        PBC
      </text>

      {/* Bottom 5 Stars */}
      <g fill="#061224" transform="translate(60, 80)">
        <text 
          x="0" 
          y="0" 
          fontSize="9" 
          fontWeight="900" 
          textAnchor="middle" 
          letterSpacing="2"
        >
          ★★★★★
        </text>
      </g>
    </svg>
  );
};
