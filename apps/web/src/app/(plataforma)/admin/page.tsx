"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../lib/auth";
import type { AuditLog } from "@etz/shared-types";

interface Stats {
  totalUsers: number;
  totalInstitutions: number;
  totalUnits: number;
  activeUsers: number;
}

const TARGET_TYPE_LABEL: Record<string, string> = {
  user:        "Usuário",
  institution: "Instituição",
  unit:        "Unidade",
  target:      "Perfil",
  case:        "Caso",
};

const ROLE_LABEL: Record<string, string> = {
  superadmin:   "Super Admin",
  gestor:       "Gestor",
  analista:     "Analista",
  agente_campo: "Agente de Campo",
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

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs]   = useState<AuditLog[]>([]);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats);
      setLogs(data.logs as AuditLog[]);
    }
    load();
  }, []);

  return (
    <>
      <div style={{ maxWidth: 960, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

        <div>
          <p style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            color: "var(--accent)",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}>
            Administração
          </p>
          <h1>Visão Geral</h1>
        </div>

        <div className="overview-stats">
          {[
            { label: "Usuários",     value: stats?.totalUsers        ?? "—" },
            { label: "Ativos",       value: stats?.activeUsers       ?? "—" },
            { label: "Instituições", value: stats?.totalInstitutions ?? "—" },
            { label: "Unidades",     value: stats?.totalUnits        ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
              padding: "16px 18px",
              boxShadow: "var(--shadow-xs)",
            }}>
              <p style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                color: "var(--ink-500)",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>{label}</p>
              <p style={{
                fontSize: 32,
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--ink-900)",
                lineHeight: 1,
              }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
          }}>
            <h3 style={{ fontSize: 14 }}>Atividade Recente</h3>
          </div>

          {logs.length === 0 ? (
            <p style={{ padding: "20px", fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhuma atividade registrada.</p>
          ) : (
            <>
              <div className="audit-cards">
                {logs.map((log, i) => {
                  const name  = (log.details?.name  ?? "") as string;
                  const email = (log.details?.email ?? "") as string;
                  const role  = (log.details?.role  ?? "") as string;
                  const label = name || email || log.targetId;
                  const badge = role
                    ? (ROLE_LABEL[role] ?? role)
                    : (TARGET_TYPE_LABEL[log.targetType] ?? log.targetType);
                  return (
                    <div key={log.id} style={{
                      padding: "14px 20px",
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{log.action}</span>
                        <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {new Date(log.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: "var(--ink-700)", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontFamily: "var(--font-ui)" }} title={label}>
                        {label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{badge}</span>
                    </div>
                  );
                })}
              </div>

              <div className="table-scroll">
              <table className="audit-table">
                <thead>
                  <tr>
                    {["Ação", "Usuário", "Recurso", "Data"].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const name  = (log.details?.name  ?? "") as string;
                    const email = (log.details?.email ?? "") as string;
                    const role  = (log.details?.role  ?? "") as string;
                    const label = name || email || log.targetId;
                    const badge = role
                      ? (ROLE_LABEL[role] ?? role)
                      : (TARGET_TYPE_LABEL[log.targetType] ?? log.targetType);
                    return (
                      <tr key={log.id}
                        style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-800)", fontWeight: 500, whiteSpace: "nowrap", fontFamily: "var(--font-ui)" }}>{log.action}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-500)", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>{log.userEmail}</td>
                        <td style={{ padding: "12px 16px", maxWidth: 220 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span title={label} style={{ fontSize: 13, color: "var(--ink-700)", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontFamily: "var(--font-ui)" }}>
                              {label}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{badge}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
