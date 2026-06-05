"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken } from "../../../../lib/auth";
import { useConfirm } from "../../../components/ConfirmDialog";
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

export default function UsuariosPage() {
  const { confirm, ConfirmUI } = useConfirm();
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
    const token = await getToken();
    const [usersRes, instsRes] = await Promise.all([
      fetch("/api/admin/users",        { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/admin/institutions", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const usersData: UserProfile[]   = await usersRes.json();
    const instsData: Institution[]   = await instsRes.json();
    setUsers(usersData);
    setInstitutions(instsData);

    const unitsMap: Record<string, { id: string; name: string }[]> = {};
    for (const inst of instsData) {
      unitsMap[inst.id] = (inst as Institution & { units?: { id: string; name: string }[] }).units ?? [];
    }
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
    const ok = await confirm({
      title: "Excluir usuário",
      message: "Tem certeza que deseja excluir este usuário? Esta ação é irreversível.",
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;
    const token = await getToken();
    await fetch(`/api/admin/users/${uid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadData();
  }

  return (
    <div style={{ maxWidth: 960, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {ConfirmUI}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Administração</p>
          <h1>Usuários</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary btn-primary--sm"
        >
          + Novo Usuário
        </button>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {users.length === 0 ? (
          <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhum usuário cadastrado.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  {["Nome", "E-mail", "Papel", "Instituição / Unidade", "Status", "Ações"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textAlign: "left", letterSpacing: "0.09em", textTransform: "uppercase", background: "var(--surface-2)" }}>{h}</th>
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
                    <tr key={user.uid}
                      style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{user.displayName || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>{user.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", background: "var(--accent-tint)", borderRadius: "var(--r-full)", padding: "3px 9px", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                          {ROLE_LABEL[user.role] ?? user.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>{instName} / {unitName}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500, fontFamily: "var(--font-ui)", borderRadius: "var(--r-full)", padding: "3px 9px",
                          color: user.status === "active" ? "var(--success)" : "var(--danger)",
                          background: user.status === "active" ? "var(--success-tint)" : "var(--danger-tint)",
                        }}>
                          {STATUS_LABEL[user.status]}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
                        {user.role !== "superadmin" && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              style={{ fontSize: 12, color: "var(--ink-600)", background: "none", border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-ui)" }}
                            >
                              {user.status === "active" ? "Revogar" : "Reativar"}
                            </button>
                            <button
                              onClick={() => handleDelete(user.uid)}
                              style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-ui)" }}
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
            </div>

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
                    borderTop: i === 0 ? "none" : "1px solid var(--line)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    {/* Top row: name + status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{user.displayName || "—"}</p>
                        <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-mono)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{user.email}</p>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 500, fontFamily: "var(--font-ui)", borderRadius: "var(--r-full)", padding: "3px 8px", flexShrink: 0,
                        color: user.status === "active" ? "var(--success)" : "var(--danger)",
                        background: user.status === "active" ? "var(--success-tint)" : "var(--danger-tint)",
                      }}>
                        {STATUS_LABEL[user.status]}
                      </span>
                    </div>

                    {/* Badges row */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--accent)", background: "var(--accent-tint)", borderRadius: "var(--r-full)", padding: "2px 8px", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                      {instName && (
                        <span style={{ fontSize: 11, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>
                          {instName}{unitName ? ` / ${unitName}` : ""}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {user.role !== "superadmin" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          style={{ fontSize: 12, color: "var(--ink-600)", background: "none", border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-ui)" }}
                        >
                          {user.status === "active" ? "Revogar" : "Reativar"}
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid)}
                          style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-ui)" }}
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
          position: "fixed", inset: 0, background: "rgba(20,24,31,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          padding: "16px", overscrollBehavior: "contain",
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)",
            padding: "clamp(20px, 5vw, 32px)", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-lg)",
            maxHeight: "90dvh", overflowY: "auto", overscrollBehavior: "contain",
          }}>
            <h2 style={{ fontSize: 18, fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink-900)", marginBottom: 24 }}>
              Novo Usuário
            </h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "displayName", label: "Nome Completo", type: "text",     placeholder: "João Silva" },
                { key: "email",       label: "E-mail",        type: "email",    placeholder: "usuario@instituicao.gov.br" },
                { key: "password",    label: "Senha Inicial", type: "password", placeholder: "••••••••" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} className="form-field">
                  <label className="form-label">{label}</label>
                  <input
                    type={type} required={key !== "displayName"} placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="form-input"
                  />
                </div>
              ))}

              <div className="form-field">
                <label className="form-label">Instituição</label>
                <select
                  value={form.institutionId}
                  onChange={e => {
                    const instId = e.target.value;
                    setForm(f => ({ ...f, institutionId: instId, unitId: "", role: "analista" }));
                  }}
                  className="form-input form-select"
                >
                  <option value="">— Selecionar —</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              {form.institutionId && (
                <div className="form-field">
                  <label className="form-label">Papel</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="form-input form-select"
                  >
                    {AVAILABLE_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.institutionId && (
                <div className="form-field">
                  <label className="form-label">Unidade</label>
                  <select
                    value={form.unitId}
                    onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
                    className="form-input form-select"
                  >
                    <option value="">— Selecionar —</option>
                    {(units[form.institutionId] ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}

              {error && (
                <p style={{ fontSize: 13, color: "var(--danger)", background: "var(--danger-tint)", border: "1px solid #f5c6c2", borderRadius: "var(--r-sm)", padding: "8px 12px", fontFamily: "var(--font-ui)" }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, opacity: loading ? 0.7 : 1, justifyContent: "center" }}>
                  {loading ? "Criando…" : "Criar Usuário"}
                </button>
                <button
                  type="button" onClick={() => { setShowModal(false); setError(""); }}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
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
