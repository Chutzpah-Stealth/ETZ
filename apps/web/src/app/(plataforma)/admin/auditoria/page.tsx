"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../../lib/auth";
import type { AuditLog } from "@etz/shared-types";

export default function AuditoriaPage() {
  const [logs, setLogs]           = useState<AuditLog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore]     = useState(true);
  const [loading, setLoading]     = useState(false);

  async function loadMore(after?: string) {
    setLoading(true);
    const token = await getToken();
    const url = after
      ? `/api/admin/audit-logs?after=${encodeURIComponent(after)}`
      : "/api/admin/audit-logs";
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();

    setLogs(prev => after ? [...prev, ...data.logs] : data.logs);
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  useEffect(() => { loadMore(); }, []);

  return (
    <div style={{ maxWidth: 960, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Administração</p>
        <h1>Auditoria</h1>
        <p style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 4, fontFamily: "var(--font-ui)" }}>Registro completo de todas as ações administrativas.</p>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {logs.length === 0 && !loading ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhum registro de auditoria encontrado.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  {["Data / Hora", "Usuário", "Ação", "Tipo", "ID do Registro"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textAlign: "left", letterSpacing: "0.09em", textTransform: "uppercase", whiteSpace: "nowrap", background: "var(--surface-2)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id}
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-600)", fontFamily: "var(--font-mono)" }}>{log.userEmail}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", background: "var(--accent-tint)", borderRadius: "var(--r-full)", padding: "3px 9px", letterSpacing: "0.06em" }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>{log.targetType}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-mono)" }}>
                      {log.targetId.slice(0, 14)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Mobile cards */}
            <div className="audit-cards">
              {logs.map((log, i) => (
                <div key={log.id} style={{
                  padding: "14px 16px",
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", background: "var(--accent-tint)", borderRadius: "var(--r-full)", padding: "2px 8px" }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {new Date(log.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.userEmail}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{log.targetType}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)" }}>{log.targetId.slice(0, 10)}…</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => loadMore(nextCursor ?? undefined)}
          disabled={loading}
          className="btn-secondary"
          style={{ alignSelf: "center", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Carregando…" : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
