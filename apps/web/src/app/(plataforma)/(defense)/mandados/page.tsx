"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthedFetch } from "../../../../lib/useAuthedFetch";
import type { WarrantTarget } from "../../../api/defense/warrants/route";
import { StatusBadge, RiskBadge, TargetAvatar } from "../_components/badges";

export default function MandadosPage() {
  const router = useRouter();
  const { data: allRows, loading } = useAuthedFetch<WarrantTarget[]>("/api/defense/warrants", { initial: [] });

  const [search, setSearch] = useState(""); // nome / apelido
  const [cpf, setCpf]       = useState(""); // CPF exato
  const [area, setArea]     = useState(""); // área de atuação

  const onlyDigits = (s: string) => s.replace(/\D/g, "");

  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRows) for (const a of r.operationAreas ?? []) set.add(a);
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allRows]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cpfDigits = onlyDigits(cpf);
    return allRows.filter(r => {
      if (q && !(r.fullName.toLowerCase().includes(q) || r.aliases.some(a => a.toLowerCase().includes(q)))) return false;
      if (cpfDigits && onlyDigits(r.cpf ?? "") !== cpfDigits) return false;
      if (area && !(r.operationAreas ?? []).includes(area)) return false;
      return true;
    });
  }, [allRows, search, cpf, area]);

  const totalWarrants = useMemo(() => rows.reduce((n, r) => n + r.warrants.length, 0), [rows]);
  const hasFilters = !!(search || cpf || area);
  const clearFilters = () => { setSearch(""); setCpf(""); setArea(""); };

  return (
    <div style={{ maxWidth: 1100, width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
          ETZ Defense
        </p>
        <h1>Mandados de Prisão Ativos</h1>
        <p style={{ fontSize: 13, color: "var(--ink-500)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          Alvos da unidade com mandado de prisão registrado.
        </p>
      </div>

      {/* Filtros — sempre visíveis (igual a /alvos) */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", boxShadow: "var(--shadow-xs)" }}>
        <div className="form-field" style={{ flex: "1 1 200px" }}>
          <label className="form-label">Buscar</label>
          <input type="text" placeholder="Nome ou apelido…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" />
        </div>
        <div className="form-field" style={{ flex: "0 1 150px" }}>
          <label className="form-label">CPF</label>
          <input type="text" placeholder="CPF exato" value={cpf} onChange={e => setCpf(e.target.value)} className="form-input" inputMode="numeric" />
        </div>
        {areaOptions.length > 0 && (
          <div className="form-field" style={{ flex: "0 1 200px" }}>
            <label className="form-label">Área de atuação</label>
            <select value={area} onChange={e => setArea(e.target.value)} className="form-input form-select">
              <option value="">Todas</option>
              {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}
        {hasFilters && <button onClick={clearFilters} className="btn-secondary btn-primary--sm" style={{ flexShrink: 0 }}>Limpar filtros</button>}
      </div>

      {/* Lista */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {loading ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</p>
        ) : rows.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-300)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>
              {hasFilters ? "Nenhum mandado encontrado para os filtros aplicados." : "Nenhum alvo com mandado de prisão registrado."}
            </p>
            {hasFilters && <button onClick={clearFilters} className="btn-secondary btn-primary--sm">Limpar filtros</button>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {rows.map((r, i) => (
              <div
                key={r.targetId}
                onClick={() => router.push(`/alvos/${r.targetId}`)}
                style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid var(--line)", cursor: "pointer", transition: "background var(--transition)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <TargetAvatar photo={r.photo} name={r.fullName} w={56} h={70} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{r.fullName}</span>
                    {r.status && <StatusBadge status={r.status} />}
                    {r.riskLevel && <RiskBadge level={r.riskLevel} />}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px" }}>
                    {r.cpf && <span style={{ fontSize: 11, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>{r.cpf}</span>}
                    {r.aliases.length > 0 && <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{r.aliases.slice(0, 3).join(", ")}</span>}
                  </div>

                  {/* Mandados */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
                    {r.warrants.map((w, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--danger)", background: "var(--danger-tint)", padding: "2px 7px", borderRadius: "var(--r-sm)", whiteSpace: "nowrap" }}>
                          Mandado {w.number}
                        </span>
                        {w.details && <span style={{ fontSize: 12, color: "var(--ink-600)", fontFamily: "var(--font-ui)" }}>{w.details}</span>}
                      </div>
                    ))}
                  </div>

                  {/* Áreas */}
                  {r.operationAreas.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                      {r.operationAreas.map(a => (
                        <span key={a} className="chip" style={{ fontSize: 11 }}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--ink-400)", textAlign: "right", fontFamily: "var(--font-mono)" }}>
          {rows.length} {rows.length === 1 ? "alvo" : "alvos"} · {totalWarrants} {totalWarrants === 1 ? "mandado" : "mandados"}
          {hasFilters ? ` (de ${allRows.length})` : ""}
        </p>
      )}
    </div>
  );
}
