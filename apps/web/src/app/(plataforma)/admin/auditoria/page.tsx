"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../../../../lib/firestore";
import type { AuditLog } from "@etz/shared-types";

const PAGE_SIZE = 25;

export default function AuditoriaPage() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [lastDoc, setLastDoc]   = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore]   = useState(true);
  const [loading, setLoading]   = useState(false);

  async function loadMore(after?: QueryDocumentSnapshot) {
    setLoading(true);
    const q = after
      ? query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), startAfter(after), limit(PAGE_SIZE))
      : query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(PAGE_SIZE));

    const snap = await getDocs(q);
    const newLogs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));

    setLogs(prev => after ? [...prev, ...newLogs] : newLogs);
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
    setHasMore(snap.size === PAGE_SIZE);
    setLoading(false);
  }

  useEffect(() => { loadMore(); }, []);

  return (
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Administração</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>Auditoria</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Registro completo de todas as ações administrativas.</p>
      </div>

      <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        {logs.length === 0 && !loading ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--muted)" }}>Nenhum registro de auditoria encontrado.</p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="audit-table">
              <thead>
                <tr style={{ background: "var(--paper-2)" }}>
                  {["Data / Hora", "Usuário", "Ação", "Tipo", "ID do Registro"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "left", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)" }}>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink)" }}>{log.userEmail}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", background: "var(--blue-soft)", borderRadius: 999, padding: "3px 10px" }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)" }}>{log.targetType}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>
                      {log.targetId.slice(0, 14)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="audit-cards">
              {logs.map((log, i) => (
                <div key={log.id} style={{
                  padding: "14px 16px",
                  borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", background: "var(--blue-soft)", borderRadius: 999, padding: "2px 8px" }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {new Date(log.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.userEmail}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{log.targetType}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{log.targetId.slice(0, 10)}…</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => loadMore(lastDoc ?? undefined)}
          disabled={loading}
          style={{ alignSelf: "center", padding: "10px 24px", fontSize: 13, fontWeight: 500, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: 999, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Carregando…" : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
