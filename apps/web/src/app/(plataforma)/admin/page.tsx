"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../../lib/firestore";
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

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs]   = useState<AuditLog[]>([]);

  useEffect(() => {
    async function load() {
      const [usersSnap, instSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "institutions")),
      ]);

      let totalUnits = 0;
      for (const inst of instSnap.docs) {
        const unitsSnap = await getDocs(collection(db, `institutions/${inst.id}/units`));
        totalUnits += unitsSnap.size;
      }

      const users = usersSnap.docs.map(d => d.data());
      setStats({
        totalUsers:        users.length,
        totalInstitutions: instSnap.size,
        totalUnits,
        activeUsers:       users.filter(u => u.status === "active").length,
      });

      const logsSnap = await getDocs(query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(10)));
      setLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
    }
    load();
  }, []);

  return (
    <>
      <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Administração
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            Visão Geral
          </h1>
        </div>

        {/* Stats */}
        <div className="overview-stats">
          {[
            { label: "Usuários",     value: stats?.totalUsers        ?? "—" },
            { label: "Ativos",       value: stats?.activeUsers       ?? "—" },
            { label: "Instituições", value: stats?.totalInstitutions ?? "—" },
            { label: "Unidades",     value: stats?.totalUnits        ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "var(--paper)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-xl)",
              padding: "16px 18px",
            }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Audit log */}
        <div style={{
          background: "var(--paper)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--rule)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Atividade Recente</h2>
          </div>

          {logs.length === 0 ? (
            <p style={{ padding: "20px", fontSize: 14, color: "var(--muted)" }}>Nenhuma atividade registrada.</p>
          ) : (
            <>
              {/* Mobile: cards */}
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
                      borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{log.action}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {new Date(log.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }} title={label}>
                        {label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{badge}</span>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: table */}
              <table className="audit-table">
                <thead>
                  <tr style={{ background: "var(--paper-2)" }}>
                    {["Ação", "Usuário", "Recurso", "Data"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "left", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
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
                      <tr key={log.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap" }}>{log.action}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>{log.userEmail}</td>
                        <td style={{ padding: "12px 16px", maxWidth: 220 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span title={label} style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                              {label}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{badge}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}
