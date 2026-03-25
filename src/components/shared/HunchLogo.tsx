interface HunchLogoProps {
  size?: number
  className?: string
}

export default function HunchLogo({ size = 40, className = '' }: HunchLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="hl-bg" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b0b1f" />
          <stop offset="1" stopColor="#161630" />
        </linearGradient>
        <linearGradient id="hl-h" x1="50" y1="50" x2="142" y2="142" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <filter id="hl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Card outer glow */}
      <rect x="24" y="14" width="148" height="170" rx="22" fill="#7c3aed" fillOpacity="0.15" />

      {/* Card body */}
      <rect x="18" y="8" width="148" height="170" rx="22" fill="url(#hl-bg)" />

      {/* Card border */}
      <rect x="18" y="8" width="148" height="170" rx="22" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.35" />

      {/* Inner border subtle */}
      <rect x="22" y="12" width="140" height="162" rx="19" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.12" />

      {/* Top-left corner: H */}
      <text
        x="31" y="47"
        fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="22" fontWeight="900"
        fill="#a78bfa" fillOpacity="0.85"
      >H</text>

      {/* Top-left corner: diamond pip */}
      <path d="M35 55 L40 61 L35 67 L30 61 Z" fill="#a78bfa" fillOpacity="0.5" />

      {/* Bottom-right corner (rotated 180° around card center x=92, y=93) */}
      <g transform="rotate(180, 92, 93)">
        <text
          x="31" y="47"
          fontFamily="'Arial Black', 'Arial', sans-serif"
          fontSize="22" fontWeight="900"
          fill="#a78bfa" fillOpacity="0.85"
        >H</text>
        <path d="M35 55 L40 61 L35 67 L30 61 Z" fill="#a78bfa" fillOpacity="0.5" />
      </g>

      {/* Center H - large with glow */}
      <text
        x="92" y="93"
        fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="82" fontWeight="900"
        fill="url(#hl-h)"
        textAnchor="middle"
        dominantBaseline="middle"
        filter="url(#hl-glow)"
      >H</text>
    </svg>
  )
}
