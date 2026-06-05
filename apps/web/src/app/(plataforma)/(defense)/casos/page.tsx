"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../lib/auth";
import type { Case, CaseStatus, ClassificationLevel } from "@etz/shared-types";
import { CASE_STATUS_LABEL, CLASSIFICATION_LABEL } from "@etz/shared-types";

const CLS_MAP: Record<ClassificationLevel, string> = {
  confidencial:       "conf",
  secreto:            "secret",
  ultrassecreto:      "ts",
  ts_sci:             "tssci",
  sap_acknowledged:   "sapa",
  sap_unacknowledged: "sapu",
  sap_waived:         "sapw",
};

const TH: React.CSSProperties = {
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

export default function CasosPage() {
  const router = useRouter();
  const [cases, setCases]         = useState<Case[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [deleting, setDeleting]   = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (search)       params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/defense/cases?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setCases(await res.json());
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir caso "${name}"? Esta ação é irreversível.`)) return;
    setDeleting(id);
    try {
      const token = await getToken();
      await fetch(`/api/defense/cases/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCases();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ maxWidth: 1260, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{
            fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500,
            color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4,
          }}>
            ETZ Defense
          </p>
          <h1>Casos</h1>
        </div>
        <Link href="/casos/novo" className="btn-primary btn-primary--sm">
          + Novo Caso
        </Link>
      </div>

      {/* Filtros */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)", padding: "14px 16px",
        display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end",
        boxShadow: "var(--shadow-xs)",
      }}>
        <div className="form-field" style={{ flex: "1 1 200px" }}>
          <label className="form-label">Buscar</label>
          <input
            type="text"
            placeholder="Nome do caso…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-field" style={{ flex: "0 1 180px" }}>
          <label className="form-label">Status</label>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="form-input form-select">
            <option value="">Todos</option>
            {Object.entries(CASE_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        {loading ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>
            Carregando…
          </p>
        ) : cases.length === 0 ? (
          <div className="empty">
            <div className="ico-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v3.5"/>
                <circle cx="17" cy="17" r="3"/>
                <path d="m21 21-1.5-1.5"/>
              </svg>
            </div>
            <p>
              {search || statusFilter
                ? "Nenhum caso encontrado para os filtros aplicados."
                : "Nenhum caso cadastrado ainda."}
            </p>
            {!search && !statusFilter && (
              <Link href="/casos/novo" className="btn-primary btn-primary--sm">
                Criar primeiro caso
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <table style={{ width: "100%", borderCollapse: "collapse", display: "none" }} className="casos-table">
              <thead>
                <tr>
                  <th style={TH}>Nome</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Classificação</th>
                  <th style={TH}>Áreas de Atuação</th>
                  <th style={TH}>Atualizado</th>
                  <th style={{ ...TH, width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                      cursor: "pointer",
                      transition: "background var(--transition)",
                    }}
                    onClick={() => router.push(`/casos/${c.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>
                      {c.name}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="status" data-s={c.status}>
                        {CASE_STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {c.classification ? (
                        <span className="cls" data-c={CLS_MAP[c.classification]}>
                          {CLASSIFICATION_LABEL[c.classification]}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--ink-300)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-600)", fontFamily: "var(--font-ui)" }}>
                      {c.operationAreas.length > 0
                        ? c.operationAreas.slice(0, 3).join(", ") + (c.operationAreas.length > 3 ? " …" : "")
                        : <span style={{ color: "var(--ink-300)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                      {new Date(c.updatedAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          href={`/casos/${c.id}`}
                          style={{
                            fontSize: 12, color: "var(--accent)", background: "var(--accent-tint)",
                            border: "none", borderRadius: "var(--r-sm)", padding: "4px 10px",
                            textDecoration: "none", fontWeight: 500,
                          }}
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deleting === c.id}
                          style={{
                            fontSize: 12, color: "var(--danger)", background: "none",
                            border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)",
                            padding: "4px 10px", cursor: "pointer",
                            opacity: deleting === c.id ? 0.5 : 1, fontFamily: "var(--font-ui)",
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
            <div className="casos-cards" style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {cases.map(c => (
                <div
                  key={c.id}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--line)",
                    borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "var(--shadow-xs)",
                  }}
                >
                  <div
                    onClick={() => router.push(`/casos/${c.id}`)}
                    style={{ padding: "12px 14px", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>
                        {c.name}
                      </p>
                      <span className="status" data-s={c.status}>{CASE_STATUS_LABEL[c.status]}</span>
                    </div>
                    {c.classification && (
                      <div style={{ marginTop: 6 }}>
                        <span className="cls" data-c={CLS_MAP[c.classification]}>
                          {CLASSIFICATION_LABEL[c.classification]}
                        </span>
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)", marginTop: 8 }}>
                      {new Date(c.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div style={{ borderTop: "1px solid var(--line)", display: "flex" }}>
                    <Link
                      href={`/casos/${c.id}`}
                      style={{
                        flex: 1, padding: "10px", fontSize: 12, fontWeight: 500,
                        fontFamily: "var(--font-ui)", color: "var(--accent)",
                        textDecoration: "none", textAlign: "center", borderRight: "1px solid var(--line)",
                      }}
                    >
                      Ver caso
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deleting === c.id}
                      style={{
                        flex: 1, padding: "10px", fontSize: 12, fontFamily: "var(--font-ui)",
                        color: "var(--danger)", background: "none", border: "none",
                        cursor: "pointer", opacity: deleting === c.id ? 0.5 : 1,
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

      {!loading && cases.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--ink-400)", textAlign: "right", fontFamily: "var(--font-mono)" }}>
          {cases.length} {cases.length === 1 ? "caso" : "casos"}
        </p>
      )}
    </div>
  );
}
