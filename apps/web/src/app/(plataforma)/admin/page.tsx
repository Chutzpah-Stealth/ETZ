"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../../lib/firestore";
import type { AuditLog } from "@etz/shared-types/src/users";

interface Stats {
  totalUsers: number;
  totalInstitutions: number;
  totalUnits: number;
  activeUsers: number;
}

const ROLE_LABEL: Record<string, string> = {
  superadmin:    "Super Admin",
  gestor:        "Gestor",
  analista:      "Analista",
  agente_campo:  "Agente de Campo",
};

export default function AdminOverviewPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [logs, setLogs]     = useState<AuditLog[]>([]);

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
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
          Administração
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
          Visão Geral
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Usuários",       value: stats?.totalUsers        ?? "—" },
          { label: "Ativos",         value: stats?.activeUsers       ?? "—" },
          { label: "Instituições",   value: stats?.totalInstitutions ?? "—" },
          { label: "Unidades",       value: stats?.totalUnits        ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-xl)",
            padding: "20px 24px",
          }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent audit logs */}
      <div style={{
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Atividade Recente</h2>
        </div>
        {logs.length === 0 ? (
          <p style={{ padding: "24px", fontSize: 14, color: "var(--muted)" }}>Nenhuma atividade registrada.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--paper-2)" }}>
                {["Ação", "Usuário", "Alvo", "Data"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "left", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{log.action}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>{log.userEmail}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{log.targetId.slice(0, 12)}…</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)" }}>{new Date(log.timestamp).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
