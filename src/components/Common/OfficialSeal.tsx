import React from 'react';

interface OfficialSealProps {
  className?: string;
  size?: number; // size in px, default 115
  title?: string;
  subtitle?: string;
  statusText?: string;
  code?: string;
  colorTheme?: 'real_blue_ink' | 'royal_blue' | 'crimson_red' | 'emerald_green' | 'gold';
  angle?: number; // default -12deg tilt
  dateText?: string;
}

export const OfficialSeal: React.FC<OfficialSealProps> = ({
  className = '',
  size = 118,
  title = 'PROBASHI BUSINESS CLUB',
  subtitle = 'AUDIT & TREASURY WING',
  statusText = 'PAID & APPROVED',
  code = 'PBC-OFFICIAL',
  colorTheme = 'real_blue_ink',
  angle = -12,
  dateText
}) => {
  // Theme color maps modeled after authentic physical stamp pad inks
  const themeColors = {
    real_blue_ink: {
      inkDark: '#1E3A8A',     // Deep Indigo Stamp Ink
      inkMedium: '#1D4ED8',   // Royal Blue Stamp Ink
      inkBright: '#2563EB',   // Fresh Stamp Ink
      inkLight: '#3B82F6',
      inkWash: 'rgba(30, 58, 138, 0.08)',
      inkPadBorder: '#1E40AF',
      strokeOpacity: '0.92',
      fillOpacity: '0.88'
    },
    royal_blue: {
      inkDark: '#172554',
      inkMedium: '#1E40AF',
      inkBright: '#3B82F6',
      inkLight: '#60A5FA',
      inkWash: 'rgba(23, 37, 84, 0.08)',
      inkPadBorder: '#1E40AF',
      strokeOpacity: '0.95',
      fillOpacity: '0.9'
    },
    crimson_red: {
      inkDark: '#991B1B',
      inkMedium: '#DC2626',
      inkBright: '#EF4444',
      inkLight: '#F87171',
      inkWash: 'rgba(153, 27, 27, 0.08)',
      inkPadBorder: '#B91C1C',
      strokeOpacity: '0.92',
      fillOpacity: '0.88'
    },
    emerald_green: {
      inkDark: '#065F46',
      inkMedium: '#059669',
      inkBright: '#10B981',
      inkLight: '#34D399',
      inkWash: 'rgba(6, 95, 70, 0.08)',
      inkPadBorder: '#047857',
      strokeOpacity: '0.92',
      fillOpacity: '0.88'
    },
    gold: {
      inkDark: '#B45309',
      inkMedium: '#D97706',
      inkBright: '#F59E0B',
      inkLight: '#FBBF24',
      inkWash: 'rgba(180, 83, 9, 0.08)',
      inkPadBorder: '#D97706',
      strokeOpacity: '0.92',
      fillOpacity: '0.88'
    }
  };

  const c = themeColors[colorTheme] || themeColors.real_blue_ink;
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        transform: `rotate(${angle}deg)`
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(30,58,138,0.35)]"
        style={{ filter: 'contrast(1.15) saturate(1.1)' }}
      >
        <defs>
          {/* Top text arc */}
          <path
            id={`${uniqueId}-top-arc`}
            d="M 26 100 A 74 74 0 1 1 174 100"
            fill="none"
          />
          {/* Bottom text arc */}
          <path
            id={`${uniqueId}-bottom-arc`}
            d="M 174 100 A 74 74 0 0 1 26 100"
            fill="none"
          />

          {/* Rubber stamp ink distress noise pattern */}
          <filter id={`${uniqueId}-ink-grunge`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Group with slight ink stamp displacement */}
        <g filter={`url(#${uniqueId}-ink-grunge)`}>
          
          {/* Outer Heavy Rubber Ring (Outer boundary of physical stamp) */}
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke={c.inkDark}
            strokeWidth="3.5"
            strokeOpacity={c.strokeOpacity}
          />

          {/* Outer Micro Perforation / Serration (Simulates rubber stamp grip edge) */}
          <circle
            cx="100"
            cy="100"
            r="89"
            fill="none"
            stroke={c.inkMedium}
            strokeWidth="1.2"
            strokeDasharray="3 2"
            strokeOpacity="0.85"
          />

          {/* Inner Circular Ring (Holds curved text) */}
          <circle
            cx="100"
            cy="100"
            r="62"
            fill="none"
            stroke={c.inkDark}
            strokeWidth="2.2"
            strokeOpacity={c.strokeOpacity}
          />

          {/* Second Inner Fine Hairline Ring */}
          <circle
            cx="100"
            cy="100"
            r="58"
            fill="none"
            stroke={c.inkMedium}
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.75"
          />

          {/* TOP CURVED TEXT (PROBASHI BUSINESS CLUB) */}
          <text
            fontSize="10.5"
            fontWeight="900"
            letterSpacing="2.6"
            fill={c.inkDark}
            fontFamily="Arial Black, Impact, system-ui, sans-serif"
            stroke={c.inkDark}
            strokeWidth="0.4"
          >
            <textPath href={`#${uniqueId}-top-arc`} startOffset="50%" textAnchor="middle">
              {title}
            </textPath>
          </text>

          {/* BOTTOM CURVED TEXT (AUDIT & TREASURY WING) */}
          <text
            fontSize="9"
            fontWeight="900"
            letterSpacing="2.2"
            fill={c.inkMedium}
            fontFamily="Arial Black, Impact, system-ui, sans-serif"
            stroke={c.inkMedium}
            strokeWidth="0.3"
          >
            <textPath href={`#${uniqueId}-bottom-arc`} startOffset="50%" textAnchor="middle">
              ★ {subtitle} ★
            </textPath>
          </text>

          {/* Left & Right Star Notches on Circular Ring */}
          <text x="21" y="103" fontSize="11" fill={c.inkDark} textAnchor="middle" fontWeight="bold">★</text>
          <text x="179" y="103" fontSize="11" fill={c.inkDark} textAnchor="middle" fontWeight="bold">★</text>

          {/* CENTER STAMP BOX & EMBLEM */}
          <g transform="translate(100, 100)">
            
            {/* Top Stars Cluster inside stamp core */}
            <g transform="translate(0, -18)">
              <text x="-14" y="0" fontSize="8" fill={c.inkMedium} textAnchor="middle">★</text>
              <text x="0" y="-2" fontSize="11" fill={c.inkDark} textAnchor="middle" fontWeight="bold">★</text>
              <text x="14" y="0" fontSize="8" fill={c.inkMedium} textAnchor="middle">★</text>
            </g>

            {/* Heavy Rubber Stamp Rectangular Banner */}
            <rect
              x="-52"
              y="-10"
              width="104"
              height="22"
              rx="2.5"
              fill={c.inkDark}
              fillOpacity="0.12"
              stroke={c.inkDark}
              strokeWidth="2.5"
            />

            {/* Inner Border Line inside Banner */}
            <rect
              x="-49"
              y="-7"
              width="98"
              height="16"
              rx="1.5"
              fill="none"
              stroke={c.inkMedium}
              strokeWidth="0.8"
              strokeDasharray="2 1"
            />

            {/* Primary Stamp Action Text: e.g. PAID & APPROVED */}
            <text
              x="0"
              y="4.5"
              fontSize="9.5"
              fontWeight="900"
              letterSpacing="1.2"
              fill={c.inkDark}
              textAnchor="middle"
              fontFamily="Arial Black, Impact, Helvetica, sans-serif"
              stroke={c.inkDark}
              strokeWidth="0.3"
            >
              {statusText}
            </text>

            {/* Bottom Official Stamp Seal Code / Date */}
            <text
              x="0"
              y="22"
              fontSize="7"
              fontWeight="900"
              fontFamily="monospace, Courier New, monospace"
              letterSpacing="0.8"
              fill={c.inkMedium}
              textAnchor="middle"
            >
              {dateText ? `DATE: ${dateText}` : `OFFICIAL SEAL • PBC`}
            </text>

            <text
              x="0"
              y="31"
              fontSize="6"
              fontWeight="800"
              fontFamily="monospace, Courier New, monospace"
              letterSpacing="0.6"
              fill={c.inkDark}
              textAnchor="middle"
              opacity="0.8"
            >
              VERIFIED SECURE
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
