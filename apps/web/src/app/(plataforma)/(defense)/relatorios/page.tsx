"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../lib/auth";
import { useAuthedFetch } from "../../../../lib/useAuthedFetch";
import { useConfirm } from "../../../components/ConfirmDialog";
import type { Report } from "@etz/shared-types";
import { REPORT_STATUS_LABEL } from "@etz/shared-types";

export default function RelatoriosPage() {
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const { data: allReports, loading, refetch } = useAuthedFetch<Report[]>("/api/defense/reports", { initial: [] });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const reports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allReports.filter(r => {
      if (q && !(r.title.toLowerCase().includes(q) || (r.number ?? "").toLowerCase().includes(q))) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [allReports, search, statusFilter]);

  const hasFilters = !!(search || statusFilter);

  async function handleDelete(id: string, title: string) {
    const ok = await confirm({
      title: "Excluir relatório",
      message: `Tem certeza que deseja excluir "${title}"? Esta ação é irreversível.`,
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;
    setDeleting(id);
    try {
      const token = await getToken();
      await fetch(`/api/defense/reports/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      await refetch();
    } finally { setDeleting(null); }
  }

  return (
    <div style={{ maxWidth: 1100, width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {ConfirmUI}

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
            ETZ Defense · Relatórios
          </p>
          <h1>Relatórios</h1>
        </div>
        <Link href="/relatorios/novo" className="btn-primary btn-primary--sm">+ Novo Relatório</Link>
      </div>

      {allReports.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", boxShadow: "var(--shadow-xs)" }}>
          <div className="form-field" style={{ flex: "1 1 220px" }}>
            <label className="form-label">Buscar</label>
            <input type="text" placeholder="Título ou número…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" />
          </div>
          <div className="form-field" style={{ flex: "0 1 180px" }}>
            <label className="form-label">Status</label>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="form-input form-select">
              <option value="">Todos</option>
              {Object.entries(REPORT_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {hasFilters && <button onClick={() => { setSearch(""); setStatus(""); }} className="btn-secondary btn-primary--sm" style={{ flexShrink: 0 }}>Limpar filtros</button>}
        </div>
      )}

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {loading ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</p>
        ) : reports.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <p style={{ fontSize: 14, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>
              {hasFilters ? "Nenhum relatório encontrado." : "Nenhum relatório criado ainda."}
            </p>
            {!hasFilters && <Link href="/relatorios/novo" className="btn-primary btn-primary--sm">Criar primeiro relatório</Link>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {reports.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                <div
                  onClick={() => router.push(`/relatorios/${r.id}`)}
                  style={{ flex: "1 1 240px", minWidth: 0, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{r.title}</span>
                    <span className="status" data-s={r.status === "finalizado" ? "finalizado" : "em_andamento"}>{REPORT_STATUS_LABEL[r.status]}</span>
                  </div>
                  <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", marginTop: 3 }}>
                    {r.number ? `Nº ${r.number} · ` : ""}{r.targetIds.length} alvo(s) · atualizado {new Date(r.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Link href={`/relatorios/${r.id}`} style={{ fontSize: 12, color: "var(--accent)", background: "var(--accent-tint)", border: "none", borderRadius: "var(--r-sm)", padding: "6px 12px", textDecoration: "none", fontWeight: 500, minHeight: 36, display: "inline-flex", alignItems: "center" }}>Abrir</Link>
                  <button onClick={() => handleDelete(r.id, r.title)} disabled={deleting === r.id} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", padding: "6px 12px", cursor: "pointer", opacity: deleting === r.id ? 0.5 : 1, fontFamily: "var(--font-ui)", minHeight: 36 }}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && reports.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--ink-400)", textAlign: "right", fontFamily: "var(--font-mono)" }}>
          {hasFilters ? `${reports.length} de ${allReports.length}` : `${allReports.length}`} {allReports.length === 1 ? "relatório" : "relatórios"}
        </p>
      )}
    </div>
  );
}
