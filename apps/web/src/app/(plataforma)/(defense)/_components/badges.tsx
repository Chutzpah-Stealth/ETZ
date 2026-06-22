import type { TargetStatus, RiskLevel } from "@etz/shared-types";
import { TARGET_STATUS_LABEL, RISK_LEVEL_LABEL } from "@etz/shared-types";

// Mapas de cor semântica (escala fixa do design system).
export const STATUS_STYLE: Record<TargetStatus, { color: string; bg: string }> = {
  investigado: { color: "#2451c9", bg: "#eaf0fd" },
  suspeito:    { color: "#b5740d", bg: "#fbf0db" },
  indiciado:   { color: "#d2731a", bg: "#fdf0e0" },
  preso:       { color: "#49515f", bg: "#e8ebf0" },
  foragido:    { color: "#c4392f", bg: "#fbe8e6" },
};

export const RISK_STYLE: Record<RiskLevel, { color: string; bg: string }> = {
  baixo:   { color: "#1f8a52", bg: "#e7f4ec" },
  medio:   { color: "#b5740d", bg: "#fbf0db" },
  alto:    { color: "#c4392f", bg: "#fbe8e6" },
  critico: { color: "#8e1f1a", bg: "#f6e1df" },
};

// Status do alvo: bolinha + texto normal.
export function StatusBadge({ status }: { status: TargetStatus }) {
  const s = STATUS_STYLE[status];
  if (!s) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: s.color, background: s.bg, borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-ui)", whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
      {TARGET_STATUS_LABEL[status]}
    </span>
  );
}

// Badge de risco: mono caixa-alta + bolinha + tint (tamanho padrão das listas).
export function RiskBadge({ level }: { level: RiskLevel }) {
  const s = RISK_STYLE[level];
  if (!s) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: s.color, background: s.bg, borderRadius: 999, padding: "3px 9px", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
      {RISK_LEVEL_LABEL[level]}
    </span>
  );
}

// Variante compacta do badge de risco (dashboard); aceita null → "—".
export function RiskTag({ level }: { level: RiskLevel | null }) {
  if (!level) return <span style={{ fontSize: 11, color: "var(--ink-300)" }}>—</span>;
  const s = RISK_STYLE[level];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: s.color, padding: "2px 7px", borderRadius: 999, background: `${s.color}1a` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />{RISK_LEVEL_LABEL[level]}
    </span>
  );
}

// Foto do alvo (proporção 3:4). `small` para listas compactas; w/h sobrescrevem.
export function TargetAvatar({ photo, name, small, w, h }: { photo?: string | null; name: string; small?: boolean; w?: number; h?: number }) {
  const width  = w ?? (small ? 60 : 110);
  const height = h ?? (small ? 74 : 130);
  const base: React.CSSProperties = {
    width, height, borderRadius: "var(--r-md)", overflow: "hidden", flexShrink: 0,
    background: "var(--surface-2)", border: "1px solid var(--line)",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  if (photo) {
    return (
      <div style={base}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
      </div>
    );
  }
  const iconSize = width <= 70 ? 24 : 36;
  return (
    <div style={base}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="var(--ink-300)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4.5"/>
        <path d="M3 21c0-4.5 4-8 9-8s9 3.5 9 8"/>
      </svg>
    </div>
  );
}
