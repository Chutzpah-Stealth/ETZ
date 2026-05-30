"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "../../../../lib/firebase";
import { db } from "../../../../lib/firestore";
import type { UserProfile, Institution } from "@etz/shared-types";

const AVAILABLE_ROLES = [
  { value: "gestor",       label: "Gestor"          },
  { value: "analista",     label: "Analista"         },
  { value: "agente_campo", label: "Agente de Campo"  },
];

const ROLE_LABEL: Record<string, string> = {
  superadmin:   "Super Admin",
  gestor:       "Gestor",
  analista:     "Analista",
  agente_campo: "Agente de Campo",
};

const STATUS_LABEL: Record<string, string> = {
  active:  "Ativo",
  revoked: "Revogado",
};

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export default function UsuariosPage() {
  const [users, setUsers]               = useState<UserProfile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [units, setUnits]               = useState<Record<string, { id: string; name: string }[]>>({});
  const [showModal, setShowModal]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const [form, setForm] = useState({
    email: "", password: "", displayName: "", role: "analista",
    institutionId: "", unitId: "",
  });

  const loadData = useCallback(async () => {
    const [usersSnap, instSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "institutions")),
    ]);
    setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as UserProfile)));
    const insts = instSnap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Institution));
    setInstitutions(insts);

    const unitsMap: Record<string, { id: string; name: string }[]> = {};
    await Promise.all(insts.map(async (inst) => {
      const snap = await getDocs(collection(db, `institutions/${inst.id}/units`));
      unitsMap[inst.id] = snap.docs.map(u => ({ id: u.id, name: u.data().name }));
    }));
    setUnits(unitsMap);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowModal(false);
      setForm({ email: "", password: "", displayName: "", role: "analista", institutionId: "", unitId: "" });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(user: UserProfile) {
    const newStatus = user.status === "active" ? "revoked" : "active";
    const token = await getToken();
    await fetch(`/api/admin/users/${user.uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    await loadData();
  }

  async function handleDelete(uid: string) {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;
    const token = await getToken();
    await fetch(`/api/admin/users/${uid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadData();
  }

  return (
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Administração</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>Usuários</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ padding: "10px 20px", fontSize: 13 }}
        >
          + Novo Usuário
        </button>
      </div>

      <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        {users.length === 0 ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--muted)" }}>Nenhum usuário cadastrado.</p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="audit-table">
              <thead>
                <tr style={{ background: "var(--paper-2)" }}>
                  {["Nome", "E-mail", "Papel", "Instituição / Unidade", "Status", "Ações"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "left", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const instName = institutions.find(x => x.id === user.institutionId)?.name ?? "—";
                  const unitName = user.institutionId && user.unitId
                    ? (units[user.institutionId]?.find(u => u.id === user.unitId)?.name ?? "—")
                    : "—";
                  return (
                    <tr key={user.uid} style={{ borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{user.displayName || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>{user.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", background: "var(--blue-soft)", borderRadius: 999, padding: "3px 10px" }}>
                          {ROLE_LABEL[user.role] ?? user.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)" }}>{instName} / {unitName}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "3px 10px",
                          color: user.status === "active" ? "#1a6e3c" : "#c0392b",
                          background: user.status === "active" ? "#edf7f1" : "#fdf2f1",
                        }}>
                          {STATUS_LABEL[user.status]}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                        {user.role !== "superadmin" && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              style={{ fontSize: 12, color: "var(--muted)", background: "none", border: "1px solid var(--rule)", borderRadius: "var(--radius-md)", padding: "4px 10px", cursor: "pointer" }}
                            >
                              {user.status === "active" ? "Revogar" : "Reativar"}
                            </button>
                            <button
                              onClick={() => handleDelete(user.uid)}
                              style={{ fontSize: 12, color: "#c0392b", background: "none", border: "1px solid #f5c6c2", borderRadius: "var(--radius-md)", padding: "4px 10px", cursor: "pointer" }}
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="audit-cards">
              {users.map((user, i) => {
                const instName = institutions.find(x => x.id === user.institutionId)?.name ?? null;
                const unitName = user.institutionId && user.unitId
                  ? (units[user.institutionId]?.find(u => u.id === user.unitId)?.name ?? null)
                  : null;
                return (
                  <div key={user.uid} style={{
                    padding: "14px 16px",
                    borderTop: i === 0 ? "none" : "1px solid var(--rule-soft)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    {/* Top row: name + status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{user.displayName || "—"}</p>
                        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{user.email}</p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, borderRadius: 999, padding: "3px 8px", flexShrink: 0,
                        color: user.status === "active" ? "#1a6e3c" : "#c0392b",
                        background: user.status === "active" ? "#edf7f1" : "#fdf2f1",
                      }}>
                        {STATUS_LABEL[user.status]}
                      </span>
                    </div>

                    {/* Badges row */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", background: "var(--blue-soft)", borderRadius: 999, padding: "2px 8px" }}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                      {instName && (
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          {instName}{unitName ? ` / ${unitName}` : ""}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {user.role !== "superadmin" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          style={{ fontSize: 12, color: "var(--muted)", background: "none", border: "1px solid var(--rule)", borderRadius: "var(--radius-md)", padding: "5px 12px", cursor: "pointer" }}
                        >
                          {user.status === "active" ? "Revogar" : "Reativar"}
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid)}
                          style={{ fontSize: 12, color: "#c0392b", background: "none", border: "1px solid #f5c6c2", borderRadius: "var(--radius-md)", padding: "5px 12px", cursor: "pointer" }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal criar usuário */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,15,30,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          padding: "20px",
        }}>
          <div style={{
            background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-xl)",
            padding: 32, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-lg)",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 24 }}>
              Novo Usuário
            </h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "displayName", label: "Nome completo", type: "text",     placeholder: "João Silva" },
                { key: "email",       label: "E-mail",        type: "email",    placeholder: "usuario@instituicao.gov.br" },
                { key: "password",    label: "Senha inicial", type: "password", placeholder: "••••••••" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{label}</label>
                  <input
                    type={type} required={key !== "displayName"} placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ padding: "9px 12px", fontSize: 14, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-md)", outline: "none", boxSizing: "border-box", width: "100%" }}
                  />
                </div>
              ))}

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Instituição</label>
                <select
                  value={form.institutionId}
                  onChange={e => {
                    const instId = e.target.value;
                    setForm(f => ({ ...f, institutionId: instId, unitId: "", role: "analista" }));
                  }}
                  style={{ padding: "9px 12px", fontSize: 14, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-md)", outline: "none" }}
                >
                  <option value="">— Selecionar —</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              {form.institutionId && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Papel</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ padding: "9px 12px", fontSize: 14, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-md)", outline: "none" }}
                  >
                    {AVAILABLE_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.institutionId && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Unidade</label>
                  <select
                    value={form.unitId}
                    onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
                    style={{ padding: "9px 12px", fontSize: 14, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-md)", outline: "none" }}
                  >
                    <option value="">— Selecionar —</option>
                    {(units[form.institutionId] ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}

              {error && (
                <p style={{ fontSize: 13, color: "#c0392b", background: "#fdf2f1", border: "1px solid #f5c6c2", borderRadius: "var(--radius-md)", padding: "8px 12px" }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Criando…" : "Criar Usuário"}
                </button>
                <button
                  type="button" onClick={() => { setShowModal(false); setError(""); }}
                  style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 500, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: 999, cursor: "pointer" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
