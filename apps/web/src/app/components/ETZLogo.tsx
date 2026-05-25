const HEX_STROKE  = "#1C2E5E";
const LINE_DARK   = "#2A4899";
const LINE_CENTER = "#3860D0";
const INNER_BG    = "#0C1120";
const PUPIL_BG    = "#08090F";
const SCLERA      = "#FAFCFF";

// ─── Full logo (viewBox recortado — sem fundo) ────────────────────────────────
export function ETZLogoFull({
  width = 210,
  height = 238,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="225 76 230 262"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="fl-hex-clip">
          <polygon points="340,90 440,148 440,264 340,322 240,264 240,148" />
        </clipPath>
      </defs>

      {/* Hexágono externo */}
      <polygon points="340,90 440,148 440,264 340,322 240,264 240,148"
        fill="none" stroke={HEX_STROKE} strokeWidth="1.5" />

      {/* Hexágono interno (faint) */}
      <polygon points="340,112 420,162 420,250 340,300 260,250 260,162"
        fill="none" stroke={HEX_STROKE} strokeWidth="0.6" opacity="0.5" />

      {/* Linhas vértice → hex interno */}
      <line x1="340" y1="112" x2="340" y2="162" stroke={LINE_DARK} strokeWidth="1" opacity="0.6" />
      <line x1="420" y1="162" x2="390" y2="180" stroke={LINE_DARK} strokeWidth="1" opacity="0.6" />
      <line x1="420" y1="250" x2="390" y2="232" stroke={LINE_DARK} strokeWidth="1" opacity="0.6" />
      <line x1="340" y1="300" x2="340" y2="250" stroke={LINE_DARK} strokeWidth="1" opacity="0.6" />
      <line x1="260" y1="250" x2="290" y2="232" stroke={LINE_DARK} strokeWidth="1" opacity="0.6" />
      <line x1="260" y1="162" x2="290" y2="180" stroke={LINE_DARK} strokeWidth="1" opacity="0.6" />

      {/* Fundo interno clipped */}
      <g clipPath="url(#fl-hex-clip)">
        <rect x="240" y="90" width="200" height="232" fill={INNER_BG} />
      </g>

      {/* Três linhas verticais */}
      <line x1="314" y1="182" x2="314" y2="234" stroke={LINE_DARK}   strokeWidth="1.2" strokeLinecap="round" />
      <line x1="340" y1="174" x2="340" y2="242" stroke={LINE_CENTER} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="366" y1="182" x2="366" y2="234" stroke={LINE_DARK}   strokeWidth="1.2" strokeLinecap="round" />

      {/* Sclera */}
      <path d="M268 208 C290 174 314 162 340 162 C366 162 390 174 412 208 C390 242 366 254 340 254 C314 254 290 242 268 208 Z"
        fill={SCLERA} />

      {/* Pupila */}
      <circle cx="340" cy="208" r="24" fill={PUPIL_BG} />

      {/* Reflexo */}
      <circle cx="331" cy="199" r="6" fill={SCLERA} opacity="0.85" />

      {/* Pálpebras */}
      <path d="M268 208 C290 174 314 162 340 162 C366 162 390 174 412 208"
        fill="none" stroke={PUPIL_BG} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M268 208 C290 242 314 254 340 254 C366 254 390 242 412 208"
        fill="none" stroke={PUPIL_BG} strokeWidth="1.6" strokeLinecap="round" />

      {/* Nós nos vértices */}
      <circle cx="340" cy="90"  r="3.5" fill={LINE_CENTER} />
      <circle cx="440" cy="148" r="3.5" fill={LINE_CENTER} />
      <circle cx="440" cy="264" r="3.5" fill={LINE_CENTER} />
      <circle cx="340" cy="322" r="3.5" fill={LINE_CENTER} />
      <circle cx="240" cy="264" r="3.5" fill={LINE_CENTER} />
      <circle cx="240" cy="148" r="3.5" fill={LINE_CENTER} />
    </svg>
  );
}

// ─── Compact mark (Nav / Footer) — 36×42 viewBox ────────────────────────────
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
        fill="none" stroke={HEX_STROKE} strokeWidth="1" />

      {/* Hexágono interno */}
      <polygon points="18,4 32,13 32,29 18,38 4,29 4,13"
        fill="none" stroke={HEX_STROKE} strokeWidth="0.5" opacity="0.5" />

      {/* Linhas vértice → interno */}
      <line x1="18" y1="4"  x2="18" y2="13" stroke={LINE_DARK} strokeWidth="0.7" opacity="0.6" />
      <line x1="32" y1="13" x2="27" y2="16" stroke={LINE_DARK} strokeWidth="0.7" opacity="0.6" />
      <line x1="32" y1="29" x2="27" y2="26" stroke={LINE_DARK} strokeWidth="0.7" opacity="0.6" />
      <line x1="18" y1="38" x2="18" y2="29" stroke={LINE_DARK} strokeWidth="0.7" opacity="0.6" />
      <line x1="4"  y1="29" x2="9"  y2="26" stroke={LINE_DARK} strokeWidth="0.7" opacity="0.6" />
      <line x1="4"  y1="13" x2="9"  y2="16" stroke={LINE_DARK} strokeWidth="0.7" opacity="0.6" />

      {/* Fundo interno clipped */}
      <g clipPath="url(#mk-hex-clip)">
        <rect x="0" y="0" width="36" height="42" fill={INNER_BG} />
      </g>

      {/* Três linhas verticais */}
      <line x1="13" y1="17" x2="13" y2="26" stroke={LINE_DARK}   strokeWidth="0.9" strokeLinecap="round" />
      <line x1="18" y1="15" x2="18" y2="27" stroke={LINE_CENTER} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="23" y1="17" x2="23" y2="26" stroke={LINE_DARK}   strokeWidth="0.9" strokeLinecap="round" />

      {/* Sclera */}
      <path d="M5 21 C9 15 13 13 18 13 C23 13 27 15 31 21 C27 27 23 30 18 30 C13 30 9 27 5 21 Z"
        fill={SCLERA} />

      {/* Pupila */}
      <circle cx="18" cy="21" r="4.5" fill={PUPIL_BG} />

      {/* Reflexo */}
      <circle cx="16" cy="19" r="1.4" fill={SCLERA} opacity="0.85" />

      {/* Pálpebras */}
      <path d="M5 21 C9 15 13 13 18 13 C23 13 27 15 31 21"
        fill="none" stroke={PUPIL_BG} strokeWidth="1" strokeLinecap="round" />
      <path d="M5 21 C9 27 13 30 18 30 C23 30 27 27 31 21"
        fill="none" stroke={PUPIL_BG} strokeWidth="1" strokeLinecap="round" />

      {/* Nós nos vértices */}
      <circle cx="18" cy="0"    r="2" fill={LINE_CENTER} />
      <circle cx="36" cy="10.5" r="2" fill={LINE_CENTER} />
      <circle cx="36" cy="31"   r="2" fill={LINE_CENTER} />
      <circle cx="18" cy="42"   r="2" fill={LINE_CENTER} />
      <circle cx="0"  cy="31"   r="2" fill={LINE_CENTER} />
      <circle cx="0"  cy="10.5" r="2" fill={LINE_CENTER} />
    </svg>
  );
}
