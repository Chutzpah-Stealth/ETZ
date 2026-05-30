"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../../lib/firebase";
import type { Target, TargetStatus, RiskLevel } from "@etz/shared-types";
import { TARGET_STATUS_LABEL, RISK_LEVEL_LABEL } from "@etz/shared-types";

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

const STATUS_COLOR: Record<TargetStatus, { color: string; bg: string }> = {
  investigado: { color: "#1a6e3c", bg: "#edf7f1" },
  suspeito:    { color: "#7a5c00", bg: "#fef9e8" },
  indiciado:   { color: "#7a3500", bg: "#fff3eb" },
  preso:       { color: "#c0392b", bg: "#fdf2f1" },
  foragido:    { color: "#5c1a6e", bg: "#f5edf7" },
};

const RISK_COLOR: Record<RiskLevel, { color: string; bg: string }> = {
  baixo: { color: "#1a6e3c", bg: "#edf7f1" },
  medio: { color: "#7a5c00", bg: "#fef9e8" },
  alto:  { color: "#c0392b", bg: "#fdf2f1" },
};

export default function AlvosPage() {
  const router = useRouter();
  const [targets, setTargets]   = useState<Target[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter]     = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (search)       params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (riskFilter)   params.set("risk", riskFilter);
      const res = await fetch(`/api/defense/targets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTargets(await res.json());
    } catch {
      setTargets([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, riskFilter]);

  useEffect(() => { fetchTargets(); }, [fetchTargets]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Esta ação é irreversível.`)) return;
    setDeleting(id);
    try {
      const token = await getToken();
      await fetch(`/api/defense/targets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTargets();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ maxWidth: 1100, display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            ETZ Defense
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>Alvos</h1>
        </div>
        <Link href="/alvos/novo" className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>
          + Novo Alvo
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        background: "var(--paper)", border: "1px solid var(--rule)",
        borderRadius: "var(--radius-xl)", padding: "16px 20px",
        display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end",
      }}>
        <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Buscar</label>
          <input
            type="text"
            placeholder="Nome, apelido ou CPF…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div style={{ flex: "0 1 160px", display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input form-select">
            <option value="">Todos</option>
            {Object.entries(TARGET_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ flex: "0 1 140px", display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Risco</label>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="form-input form-select">
            <option value="">Todos</option>
            {Object.entries(RISK_LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--muted)" }}>Carregando…</p>
        ) : targets.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              {search || statusFilter || riskFilter ? "Nenhum alvo encontrado para os filtros." : "Nenhum alvo cadastrado ainda."}
            </p>
            {!search && !statusFilter && !riskFilter && (
              <Link href="/alvos/novo" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>
                Cadastrar primeiro alvo →
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="targets-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--paper-2)" }}>
                  {["Nome / Alcunhas", "CPF", "Status", "Risco", "Última atualização", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "left", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {targets.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)", cursor: "pointer" }}
                    onClick={() => router.push(`/alvos/${t.id}`)}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{t.fullName}</p>
                      {t.aliases.length > 0 && (
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          {t.aliases.slice(0, 3).join(", ")}{t.aliases.length > 3 ? " …" : ""}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", fontFamily: "monospace" }}>
                      {t.cpf ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {t.status ? (
                        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "3px 10px", ...STATUS_COLOR[t.status] }}>
                          {TARGET_STATUS_LABEL[t.status]}
                        </span>
                      ) : <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {t.riskLevel ? (
                        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "3px 10px", ...RISK_COLOR[t.riskLevel] }}>
                          {RISK_LEVEL_LABEL[t.riskLevel]}
                        </span>
                      ) : <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(t.updatedAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link
                          href={`/alvos/${t.id}`}
                          style={{ fontSize: 12, color: "var(--blue)", background: "var(--blue-soft)", border: "none", borderRadius: "var(--radius-md)", padding: "4px 10px", textDecoration: "none" }}
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id, t.fullName)}
                          disabled={deleting === t.id}
                          style={{ fontSize: 12, color: "#c0392b", background: "none", border: "1px solid #f5c6c2", borderRadius: "var(--radius-md)", padding: "4px 10px", cursor: "pointer", opacity: deleting === t.id ? 0.5 : 1 }}
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
            <div className="targets-cards" style={{ padding: "12px" }}>
              {targets.map(t => (
                <Link key={t.id} href={`/alvos/${t.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--paper)", border: "1px solid var(--rule)",
                    borderRadius: "var(--radius-lg)", padding: "14px 16px",
                    display: "flex", flexDirection: "column", gap: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{t.fullName}</p>
                        {t.aliases.length > 0 && (
                          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{t.aliases.slice(0, 2).join(", ")}</p>
                        )}
                      </div>
                      {t.riskLevel && (
                        <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "3px 8px", flexShrink: 0, ...RISK_COLOR[t.riskLevel] }}>
                          {RISK_LEVEL_LABEL[t.riskLevel]}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {t.status && (
                        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "2px 8px", ...STATUS_COLOR[t.status] }}>
                          {TARGET_STATUS_LABEL[t.status]}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        {new Date(t.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && targets.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
          {targets.length} {targets.length === 1 ? "alvo" : "alvos"}
        </p>
      )}
    </div>
  );
}
