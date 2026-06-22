"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../lib/auth";
import { useAuthedFetch } from "../../../../lib/useAuthedFetch";
import { useConfirm } from "../../../components/ConfirmDialog";
import type { Target } from "@etz/shared-types";
import { TARGET_STATUS_LABEL, RISK_LEVEL_LABEL } from "@etz/shared-types";
import { StatusBadge, RiskBadge, TargetAvatar } from "../_components/badges";

const TH_STYLE: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
  fontWeight: 500,
  color: "var(--ink-500)",
  textAlign: "left",
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  background: "var(--surface-2)",
};

export default function AlvosPage() {
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const [deleting, setDeleting] = useState<string | null>(null);

  // Carrega todos os alvos da unidade uma vez; os filtros são aplicados em memória.
  const { data: allTargets, loading, refetch } = useAuthedFetch<Target[]>(
    "/api/defense/targets",
    { initial: [] },
  );

  // ── Filtros estruturados ──
  const [search, setSearch]             = useState("");   // nome / apelido
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter]     = useState("");
  const [cityFilter, setCityFilter]     = useState("");
  const [orgFilter, setOrgFilter]       = useState("");
  const [cpf, setCpf]                   = useState("");   // CPF exato

  const onlyDigits = (s: string) => s.replace(/\D/g, "");

  // opções dinâmicas derivadas dos dados carregados
  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of allTargets) for (const a of t.addresses ?? []) if (a.city) set.add(a.city);
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allTargets]);

  const orgOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of allTargets) for (const o of t.organizations ?? []) set.add(o);
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allTargets]);

  const targets = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cpfDigits = onlyDigits(cpf);
    return allTargets.filter(t => {
      if (q && !(t.fullName.toLowerCase().includes(q) || t.aliases.some(a => a.toLowerCase().includes(q)))) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (riskFilter && t.riskLevel !== riskFilter) return false;
      if (cityFilter && !(t.addresses ?? []).some(a => a.city === cityFilter)) return false;
      if (orgFilter && !(t.organizations ?? []).includes(orgFilter)) return false;
      if (cpfDigits && onlyDigits(t.cpf ?? "") !== cpfDigits) return false;
      return true;
    });
  }, [allTargets, search, statusFilter, riskFilter, cityFilter, orgFilter, cpf]);

  const hasFilters = !!(search || statusFilter || riskFilter || cityFilter || orgFilter || cpf);
  function clearFilters() {
    setSearch(""); setStatusFilter(""); setRiskFilter(""); setCityFilter(""); setOrgFilter(""); setCpf("");
  }

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({
      title: "Excluir alvo",
      message: `Tem certeza que deseja excluir "${name}"? Esta ação é irreversível.`,
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;
    setDeleting(id);
    try {
      const token = await getToken();
      await fetch(`/api/defense/targets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await refetch();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ maxWidth: 1260, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {ConfirmUI}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            color: "var(--accent)",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}>
            ETZ Defense
          </p>
          <h1>Alvos</h1>
        </div>
        <Link href="/alvos/novo" className="btn-primary btn-primary--sm">
          + Novo Alvo
        </Link>
      </div>

      {/* Filtros */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        padding: "14px 16px",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "flex-end",
        boxShadow: "var(--shadow-xs)",
      }}>
        <div className="form-field" style={{ flex: "1 1 200px" }}>
          <label className="form-label">Buscar</label>
          <input
            type="text"
            placeholder="Nome ou apelido…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-field" style={{ flex: "0 1 150px" }}>
          <label className="form-label">CPF</label>
          <input
            type="text"
            placeholder="CPF exato"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            className="form-input"
            inputMode="numeric"
          />
        </div>
        <div className="form-field" style={{ flex: "0 1 150px" }}>
          <label className="form-label">Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input form-select">
            <option value="">Todos</option>
            {Object.entries(TARGET_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="form-field" style={{ flex: "0 1 140px" }}>
          <label className="form-label">Risco</label>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="form-input form-select">
            <option value="">Todos</option>
            {Object.entries(RISK_LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {cityOptions.length > 0 && (
          <div className="form-field" style={{ flex: "0 1 170px" }}>
            <label className="form-label">Cidade</label>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="form-input form-select">
              <option value="">Todas</option>
              {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {orgOptions.length > 0 && (
          <div className="form-field" style={{ flex: "0 1 190px" }}>
            <label className="form-label">Organização</label>
            <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)} className="form-input form-select">
              <option value="">Todas</option>
              {orgOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="btn-secondary btn-primary--sm"
            style={{ flexShrink: 0 }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Tabela / Cards */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}>
        {loading ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</p>
        ) : targets.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {/* Estado vazio — ícone neutro */}
            <div style={{
              width: 40, height: 40,
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--ink-300)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>
              {hasFilters
                ? "Nenhum alvo encontrado para os filtros aplicados."
                : "Nenhum alvo cadastrado ainda."}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="btn-secondary btn-primary--sm">Limpar filtros</button>
            ) : (
              <Link href="/alvos/novo" className="btn-primary btn-primary--sm">
                Cadastrar primeiro alvo
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="targets-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...TH_STYLE, width: 130 }}>Foto</th>
                  <th style={{ ...TH_STYLE, paddingLeft: 28 }}>Nome / Alcunhas</th>
                  <th style={TH_STYLE}>CPF</th>
                  <th style={TH_STYLE}>Status</th>
                  <th style={TH_STYLE}>Nome da Mãe</th>
                  <th style={TH_STYLE}>Nível de Risco</th>
                  <th style={{ ...TH_STYLE, width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                      cursor: "pointer",
                      transition: "background var(--transition)",
                    }}
                    onClick={() => router.push(`/alvos/${t.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "8px 8px 8px 14px", width: 130, verticalAlign: "middle" }}>
                      <TargetAvatar photo={t.photos?.[0]} name={t.fullName} />
                    </td>
                    <td style={{ padding: "12px 16px 12px 28px", verticalAlign: "middle" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{t.fullName}</p>
                      {t.aliases.length > 0 && (
                        <p style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 2, fontFamily: "var(--font-ui)" }}>
                          {t.aliases.slice(0, 3).join(", ")}{t.aliases.length > 3 ? " …" : ""}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>
                      {t.cpf ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {t.status ? <StatusBadge status={t.status} /> : <span style={{ fontSize: 12, color: "var(--ink-300)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-600)", fontFamily: "var(--font-ui)" }}>
                      {t.motherName ?? <span style={{ fontSize: 12, color: "var(--ink-300)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {t.riskLevel ? <RiskBadge level={t.riskLevel} /> : <span style={{ fontSize: 12, color: "var(--ink-300)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          href={`/alvos/${t.id}`}
                          style={{
                            fontSize: 12,
                            color: "var(--accent)",
                            background: "var(--accent-tint)",
                            border: "none",
                            borderRadius: "var(--r-sm)",
                            padding: "4px 10px",
                            textDecoration: "none",
                            fontWeight: 500,
                            transition: "background var(--transition)",
                          }}
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id, t.fullName)}
                          disabled={deleting === t.id}
                          style={{
                            fontSize: 12,
                            color: "var(--danger)",
                            background: "none",
                            border: "1px solid var(--line-strong)",
                            borderRadius: "var(--r-sm)",
                            padding: "4px 10px",
                            cursor: "pointer",
                            opacity: deleting === t.id ? 0.5 : 1,
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="targets-cards" style={{ padding: "10px", gap: 8 }}>
              {targets.map(t => (
                <div
                  key={t.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-md)",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  {/* Área clicável principal */}
                  <div
                    onClick={() => router.push(`/alvos/${t.id}`)}
                    style={{ padding: "12px", display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
                  >
                    <TargetAvatar photo={t.photos?.[0]} name={t.fullName} small />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)", lineHeight: 1.3 }}>{t.fullName}</p>
                        {t.riskLevel && <RiskBadge level={t.riskLevel} />}
                      </div>
                      {t.aliases.length > 0 && (
                        <p style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 3, fontFamily: "var(--font-ui)" }}>
                          {t.aliases.slice(0, 2).join(", ")}
                        </p>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 6 }}>
                        {t.cpf && (
                          <span style={{ fontSize: 11, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>{t.cpf}</span>
                        )}
                        {t.motherName && (
                          <span style={{ fontSize: 11, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>Mãe: {t.motherName}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {t.status && <StatusBadge status={t.status} />}
                        <span style={{ fontSize: 10, color: "var(--ink-400)", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
                          {new Date(t.updatedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé de ações */}
                  <div style={{
                    borderTop: "1px solid var(--line)",
                    display: "flex",
                  }}>
                    <Link
                      href={`/alvos/${t.id}`}
                      style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: "var(--font-ui)",
                        color: "var(--accent)",
                        textDecoration: "none",
                        textAlign: "center",
                        borderRight: "1px solid var(--line)",
                      }}
                    >
                      Ver perfil
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id, t.fullName)}
                      disabled={deleting === t.id}
                      style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: 12,
                        fontFamily: "var(--font-ui)",
                        color: "var(--danger)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        opacity: deleting === t.id ? 0.5 : 1,
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && targets.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--ink-400)", textAlign: "right", fontFamily: "var(--font-mono)" }}>
          {hasFilters
            ? `${targets.length} de ${allTargets.length} ${allTargets.length === 1 ? "alvo" : "alvos"}`
            : `${targets.length} ${targets.length === 1 ? "alvo" : "alvos"}`}
        </p>
      )}
    </div>
  );
}
