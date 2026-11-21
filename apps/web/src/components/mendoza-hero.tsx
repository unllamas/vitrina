/** Ilustración del hero: Andes, río y viña al atardecer. Decorativa. */
export function MendozaHero() {
  return (
    <svg className="h-full w-full" viewBox="0 0 1440 780" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="mendoza-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff6f1" />
          <stop offset="28%" stopColor="#f7cbbd" />
          <stop offset="58%" stopColor="#f3b7c9" />
          <stop offset="100%" stopColor="#e4d2f2" />
        </linearGradient>
        <linearGradient id="mendoza-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="62%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="86%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="mendoza-wash" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="mendoza-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="mendoza-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.16" />
          </feComponentTransfer>
        </filter>
        <pattern id="mendoza-vines" width="42" height="18" patternUnits="userSpaceOnUse">
          <path d="M1 14 C8 6 16 6 21 14 S34 22 41 14" fill="none" stroke="#9a756c" strokeWidth="1" opacity="0.45" />
        </pattern>
        <clipPath id="mendoza-hill">
          <path d="M0 560 C220 500 380 610 620 560 C860 510 1080 620 1440 540 L1440 780 L0 780 Z" />
        </clipPath>
      </defs>
      <rect width="1440" height="780" fill="url(#mendoza-sky)" />
      <ellipse cx="1040" cy="210" rx="150" ry="110" fill="#ffe3cf" filter="url(#mendoza-soft)" opacity="0.95" />
      <ellipse cx="860" cy="250" rx="220" ry="70" fill="#fff4ee" opacity="0.45" />
      <path
        fill="#ddc6ea"
        opacity="0.8"
        d="M0 470 C140 450 220 330 360 350 C500 370 560 250 720 270 C900 292 980 190 1140 250 C1280 300 1360 390 1440 360 L1440 780 L0 780 Z"
      />
      <path
        fill="#e7b4c0"
        opacity="0.9"
        d="M0 540 C180 500 260 410 430 440 C600 470 680 360 860 400 C1040 440 1120 330 1280 390 C1360 420 1400 480 1440 460 L1440 780 L0 780 Z"
      />
      <path fill="#f0d2c4" d="M0 620 C240 560 420 660 700 600 C980 540 1160 680 1440 600 L1440 780 L0 780 Z" />
      <path
        d="M690 430 C760 500 720 560 800 630 C880 700 840 740 920 780"
        fill="none"
        stroke="#fff8f6"
        strokeWidth="34"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M700 440 C770 510 730 570 810 640 C890 710 850 750 930 780"
        fill="none"
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.8"
      />
      <g clipPath="url(#mendoza-hill)">
        <rect width="1440" height="780" fill="url(#mendoza-vines)" />
      </g>
      <rect width="1440" height="780" filter="url(#mendoza-grain)" opacity="0.35" />
      <rect width="1440" height="780" fill="url(#mendoza-wash)" />
      <rect width="1440" height="780" fill="url(#mendoza-fade)" />
    </svg>
  );
}
