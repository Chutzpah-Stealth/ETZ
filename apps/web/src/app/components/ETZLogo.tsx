const ACCENT      = "#2451c9";
const ACCENT_MID  = "#1a3f9e";
const ACCENT_TINT = "#eaf0fd";
const ACCENT_LINE = "#c7d6f7";


export function ETZLogoMark({ size = 28 }: { size?: number }) {
  const h = Math.round(size * 42 / 36);
  return (
    <svg width={size} height={h} viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="mk-hex-clip">
          <polygon points="18,0 36,10.5 36,31 18,42 0,31 0,10.5" />
        </clipPath>
      </defs>

      {/* Hexágono externo */}
      <polygon points="18,0 36,10.5 36,31 18,42 0,31 0,10.5"
        fill={ACCENT_TINT} stroke={ACCENT} strokeWidth="1" />

      {/* Hexágono interno */}
      <polygon points="18,4 32,13 32,29 18,38 4,29 4,13"
        fill="none" stroke={ACCENT_LINE} strokeWidth="0.6" opacity="0.8" />

      {/* Linhas vértice → interno */}
      <line x1="18" y1="4"  x2="18" y2="13" stroke={ACCENT_MID} strokeWidth="0.7" opacity="0.5" />
      <line x1="32" y1="13" x2="27" y2="16" stroke={ACCENT_MID} strokeWidth="0.7" opacity="0.5" />
      <line x1="32" y1="29" x2="27" y2="26" stroke={ACCENT_MID} strokeWidth="0.7" opacity="0.5" />
      <line x1="18" y1="38" x2="18" y2="29" stroke={ACCENT_MID} strokeWidth="0.7" opacity="0.5" />
      <line x1="4"  y1="29" x2="9"  y2="26" stroke={ACCENT_MID} strokeWidth="0.7" opacity="0.5" />
      <line x1="4"  y1="13" x2="9"  y2="16" stroke={ACCENT_MID} strokeWidth="0.7" opacity="0.5" />

      {/* Três linhas verticais */}
      <line x1="13" y1="17" x2="13" y2="26" stroke={ACCENT_MID}  strokeWidth="0.9" strokeLinecap="round" />
      <line x1="18" y1="15" x2="18" y2="27" stroke={ACCENT}      strokeWidth="1.1" strokeLinecap="round" />
      <line x1="23" y1="17" x2="23" y2="26" stroke={ACCENT_MID}  strokeWidth="0.9" strokeLinecap="round" />

      {/* Elipse — olho */}
      <path d="M5 21 C9 15 13 13 18 13 C23 13 27 15 31 21 C27 27 23 30 18 30 C13 30 9 27 5 21 Z"
        fill="white" />

      {/* Pupila */}
      <circle cx="18" cy="21" r="4.5" fill={ACCENT_TINT} stroke={ACCENT} strokeWidth="0.8" />

      {/* Ponto central */}
      <circle cx="18" cy="21" r="2" fill={ACCENT} />

      {/* Reflexo */}
      <circle cx="16" cy="19" r="1.2" fill="white" opacity="0.7" />

      {/* Nós nos vértices */}
      <circle cx="18" cy="0"    r="1.8" fill={ACCENT} />
      <circle cx="36" cy="10.5" r="1.8" fill={ACCENT} />
      <circle cx="36" cy="31"   r="1.8" fill={ACCENT} />
      <circle cx="18" cy="42"   r="1.8" fill={ACCENT} />
      <circle cx="0"  cy="31"   r="1.8" fill={ACCENT} />
      <circle cx="0"  cy="10.5" r="1.8" fill={ACCENT} />
    </svg>
  );
}
