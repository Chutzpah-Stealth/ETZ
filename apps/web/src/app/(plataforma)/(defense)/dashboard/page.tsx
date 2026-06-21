"use client";

import Link from "next/link";
import { useAuthedFetch } from "../../../../lib/useAuthedFetch";
import type { RiskLevel } from "@etz/shared-types";
import {
  RISK_LEVEL_LABEL, TARGET_STATUS_LABEL, CASE_STATUS_LABEL, QTC_CATEGORY_LABEL,
} from "@etz/shared-types";

interface DashboardData {
  kpis: { alvos: number; altoRisco: number; casosAndamento: number; qtc7d: number };
  distRisco:        Record<string, number>;
  distStatusAlvo:   Record<string, number>;
  distStatusCaso:   Record<string, number>;
  distCategoriaQtc: Record<string, number>;
  foragidos:        { id: string; fullName: string; cpf: string | null; riskLevel: RiskLevel | null }[];
  altoRiscoSemCaso: { id: string; fullName: string; cpf: string | null; riskLevel: RiskLevel | null }[];
  casosParados:     { id: string; name: string; updatedAt: string }[];
  atividade:        { type: "alvo" | "caso" | "qtc"; id: string; label: string; who: string; at: string }[];
}

const RISK_COLOR: Record<string, string> = {
  baixo: "#1f8a52", medio: "#b5740d", alto: "#c4392f", critico: "#8e1f1a", semRisco: "#aeb4bf",
};
const NEUTRAL = "#69717f";
const ACCENT  = "#2451c9";

// ordem + rótulo de cada distribuição
const RISK_ORDER   = ["critico", "alto", "medio", "baixo", "semRisco"];
const STATUS_ORDER = ["foragido", "investigado", "suspeito", "indiciado", "preso", "semStatus"];
const CASE_ORDER   = ["em_andamento", "finalizado", "arquivado"];
const QTC_ORDER    = ["novidade", "mencao_orcrim", "vinculo_suspeito", "anotacao_operacional"];

function labelOf(map: Record<string, string>, key: string, fallback: string) {
  return map[key] ?? fallback;
}

function Bars({ title, data, order, labels, color, fallbackLabel }: {
  title: string;
  data: Record<string, number>;
  order: string[];
  labels: Record<string, string>;
  color: string | Record<string, string>;
  fallbackLabel: string;
}) {
  const rows = order.map(k => ({ key: k, label: labelOf(labels, k, k === "semRisco" || k === "semStatus" ? fallbackLabel : k), value: data[k] ?? 0 }));
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <div className="form-section" style={{ gap: 12 }}>
      <p className="form-section-title" style={{ marginBottom: 4 }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(r => {
          const c = typeof color === "string" ? color : (color[r.key] ?? NEUTRAL);
          return (
            <div key={r.key} style={{ display: "grid", gridTemplateColumns: "minmax(90px, 130px) 1fr 28px", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--ink-600)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
              <span style={{ height: 8, background: "var(--surface-3)", borderRadius: "var(--r-full)", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${(r.value / max) * 100}%`, background: c, borderRadius: "var(--r-full)", transition: "width var(--dur) var(--ease)" }} />
              </span>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-500)", textAlign: "right" }}>{r.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)",
      padding: "16px 18px", boxShadow: "var(--shadow-xs)",
      borderLeft: accent ? "3px solid var(--danger)" : "1px solid var(--line)",
    }}>
      <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--ink-500)" }}>{label}</p>
      <p style={{ fontSize: 32, fontFamily: "var(--font-display)", fontWeight: 600, color: accent ? "var(--danger)" : "var(--ink-900)", marginTop: 2, lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

function RiskTag({ level }: { level: RiskLevel | null }) {
  if (!level) return <span style={{ fontSize: 11, color: "var(--ink-300)" }}>—</span>;
  const c = RISK_COLOR[level] ?? NEUTRAL;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: c, padding: "2px 7px", borderRadius: "var(--r-full)", background: `${c}1a` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />{RISK_LEVEL_LABEL[level]}
    </span>
  );
}

function InsightCard({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="form-section" style={{ gap: 10 }}>
      <p className="form-section-title" style={{ marginBottom: 4 }}>{title}</p>
      {empty
        ? <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nada a destacar.</p>
        : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading } = useAuthedFetch<DashboardData | null>("/api/defense/dashboard", { initial: null });

  if (loading || !data) {
    return <div style={{ padding: 48, textAlign: "center", color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</div>;
  }

  const { kpis } = data;

  return (
    <div style={{ maxWidth: 1100, width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
          ETZ Defense · Visão Geral
        </p>
        <h1>Dashboard</h1>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <KpiCard label="Alvos" value={kpis.alvos} />
        <KpiCard label="Alto / Crítico risco" value={kpis.altoRisco} accent />
        <KpiCard label="Casos em andamento" value={kpis.casosAndamento} />
        <KpiCard label="QTCs (7 dias)" value={kpis.qtc7d} />
      </div>

      {/* Distribuições */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Bars title="Alvos por risco"      data={data.distRisco}        order={RISK_ORDER}   labels={RISK_LEVEL_LABEL}   color={RISK_COLOR} fallbackLabel="Sem risco" />
        <Bars title="Alvos por status"     data={data.distStatusAlvo}   order={STATUS_ORDER} labels={TARGET_STATUS_LABEL} color={NEUTRAL}    fallbackLabel="Sem status" />
        <Bars title="Casos por status"     data={data.distStatusCaso}   order={CASE_ORDER}   labels={CASE_STATUS_LABEL}  color={ACCENT}     fallbackLabel="—" />
        <Bars title="QTCs por categoria"   data={data.distCategoriaQtc} order={QTC_ORDER}    labels={QTC_CATEGORY_LABEL}  color={ACCENT}     fallbackLabel="—" />
      </div>

      {/* Insights acionáveis */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <InsightCard title="Foragidos" empty={data.foragidos.length === 0}>
          {data.foragidos.map(t => (
            <Link key={t.id} href={`/alvos/${t.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textDecoration: "none", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-800)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.fullName}</span>
              <RiskTag level={t.riskLevel} />
            </Link>
          ))}
        </InsightCard>

        <InsightCard title="Alto risco sem caso" empty={data.altoRiscoSemCaso.length === 0}>
          {data.altoRiscoSemCaso.map(t => (
            <Link key={t.id} href={`/alvos/${t.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textDecoration: "none", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-800)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.fullName}</span>
              <RiskTag level={t.riskLevel} />
            </Link>
          ))}
        </InsightCard>

        <InsightCard title="Casos parados (+14 dias)" empty={data.casosParados.length === 0}>
          {data.casosParados.map(c => (
            <Link key={c.id} href={`/casos/${c.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textDecoration: "none", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-800)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", whiteSpace: "nowrap", flexShrink: 0 }}>{new Date(c.updatedAt).toLocaleDateString("pt-BR")}</span>
            </Link>
          ))}
        </InsightCard>
      </div>

      {/* Atividade recente */}
      <div className="form-section" style={{ gap: 10 }}>
        <p className="form-section-title" style={{ marginBottom: 4 }}>Atividade recente</p>
        {data.atividade.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhuma atividade ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.atividade.map((a, i) => {
              const href = a.type === "caso" ? `/casos/${a.id}` : a.type === "alvo" ? `/alvos/${a.id}` : "/qtc";
              const tag = a.type === "alvo" ? "Alvo" : a.type === "caso" ? "Caso" : "QTC";
              return (
                <Link key={`${a.type}-${a.id}-${i}`} href={href} style={{ display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 10, alignItems: "center", textDecoration: "none", padding: "10px 0", borderBottom: i < data.atividade.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)", background: "var(--accent-tint)", padding: "2px 6px", borderRadius: "var(--r-sm)", textAlign: "center" }}>{tag}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: "var(--ink-800)", fontFamily: "var(--font-ui)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.label}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)" }}>{a.who}</span>
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", whiteSpace: "nowrap" }}>{new Date(a.at).toLocaleDateString("pt-BR")}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
