"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken } from "../../../../lib/auth";
import type { Institution, Unit } from "@etz/shared-types";

type InstitutionWithUnits = Institution & { units: Unit[] };

export default function InstituicoesPage() {
  const [institutions, setInstitutions] = useState<InstitutionWithUnits[]>([]);
  const [showInstModal, setShowInstModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState<string | null>(null);
  const [instName, setInstName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const loadData = useCallback(async () => {
    const token = await getToken();
    const res = await fetch("/api/admin/institutions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setInstitutions(await res.json());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreateInstitution(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: instName }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowInstModal(false); setInstName("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!showUnitModal) return;
    setError(""); setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/institutions/${showUnitModal}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: unitName }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowUnitModal(null); setUnitName("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 960, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Administração</p>
          <h1>Instituições</h1>
        </div>
        <button onClick={() => setShowInstModal(true)} className="btn-primary btn-primary--sm" style={{ flexShrink: 0 }}>
          + Nova
        </button>
      </div>

      {institutions.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhuma instituição cadastrada.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {institutions.map(inst => (
            <div key={inst.id} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
              {/* Institution header */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{inst.name}</p>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", background: "var(--accent-tint)", borderRadius: "var(--r-full)", padding: "2px 8px", letterSpacing: "0.09em", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                      Defense
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)", marginTop: 2 }}>
                    {inst.units.length} unidade{inst.units.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => { setShowUnitModal(inst.id); setError(""); }}
                  style={{ fontSize: 12, fontWeight: 500, fontFamily: "var(--font-ui)", color: "var(--accent)", background: "var(--accent-tint)", border: "none", borderRadius: "var(--r-sm)", padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "background var(--transition)" }}
                >
                  + Unidade
                </button>
              </div>
              {inst.units.length > 0 && (
                <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {inst.units.map(unit => (
                    <span key={unit.id} style={{
                      fontSize: 12, fontWeight: 500, fontFamily: "var(--font-ui)", color: "var(--ink-700)",
                      background: "var(--surface-2)", border: "1px solid var(--line)",
                      borderRadius: "var(--r-sm)", padding: "4px 12px",
                    }}>
                      {unit.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: nova instituição */}
      {showInstModal && (
        <Modal title="Nova Instituição" onClose={() => { setShowInstModal(false); setError(""); }}>
          <form onSubmit={handleCreateInstitution} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nome da Instituição">
              <input
                type="text" required autoFocus
                value={instName} onChange={e => setInstName(e.target.value)}
                placeholder="Ex: PCSP — Polícia Civil de São Paulo"
                style={inputStyle}
              />
            </Field>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <ModalActions loading={loading} onCancel={() => { setShowInstModal(false); setError(""); }} label="Criar Instituição" />
          </form>
        </Modal>
      )}

      {/* Modal: nova unidade */}
      {showUnitModal && (
        <Modal title="Nova Unidade" onClose={() => { setShowUnitModal(null); setError(""); }}>
          <form onSubmit={handleCreateUnit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nome da Unidade">
              <input
                type="text" required autoFocus
                value={unitName} onChange={e => setUnitName(e.target.value)}
                placeholder="Ex: DEIC — Departamento de Investigações"
                style={inputStyle}
              />
            </Field>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <ModalActions loading={loading} onCancel={() => { setShowUnitModal(null); setError(""); }} label="Criar Unidade" />
          </form>
        </Modal>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 38, padding: "0 10px", fontSize: 13, color: "var(--ink-900)", background: "var(--surface)",
  border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", outline: "none",
  boxSizing: "border-box", width: "100%", fontFamily: "var(--font-ui)",
  transition: "border-color var(--transition), box-shadow var(--transition)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: "var(--danger)", background: "var(--danger-tint)", border: "1px solid #f5c6c2", borderRadius: "var(--r-sm)", padding: "8px 12px", fontFamily: "var(--font-ui)" }}>
      {children}
    </p>
  );
}

function ModalActions({ loading, onCancel, label }: { loading: boolean; onCancel: () => void; label: string }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, opacity: loading ? 0.7 : 1, justifyContent: "center" }}>
        {loading ? "Salvando…" : label}
      </button>
      <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
        Cancelar
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,31,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px", overscrollBehavior: "contain" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "clamp(20px, 5vw, 32px)", width: "100%", maxWidth: 440, boxShadow: "var(--shadow-lg)", maxHeight: "90dvh", overflowY: "auto", overscrollBehavior: "contain" }}>
        <h2 style={{ fontSize: 18, fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink-900)", marginBottom: 24 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
