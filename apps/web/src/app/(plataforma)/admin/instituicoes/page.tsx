"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "../../../../lib/firebase";
import { db } from "../../../../lib/firestore";
import type { Institution, Unit } from "@etz/shared-types/src/users";

type InstitutionWithUnits = Institution & { units: Unit[] };

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export default function InstituicoesPage() {
  const [institutions, setInstitutions] = useState<InstitutionWithUnits[]>([]);
  const [showInstModal, setShowInstModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState<string | null>(null); // institutionId
  const [instName, setInstName]       = useState("");
  const [instProduct, setInstProduct] = useState<"defense" | "business">("defense");
  const [unitName, setUnitName]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const loadData = useCallback(async () => {
    const instSnap = await getDocs(collection(db, "institutions"));
    const result: InstitutionWithUnits[] = [];
    for (const d of instSnap.docs) {
      const unitsSnap = await getDocs(collection(db, `institutions/${d.id}/units`));
      const units = unitsSnap.docs.map(u => ({ id: u.id, ...u.data() } as unknown as Unit));
      result.push({ id: d.id, ...d.data(), units } as InstitutionWithUnits);
    }
    setInstitutions(result);
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
        body: JSON.stringify({ name: instName, product: instProduct }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowInstModal(false); setInstName(""); setInstProduct("defense");
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
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Administração</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>Instituições</h1>
        </div>
        <button onClick={() => setShowInstModal(true)} className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>
          + Nova Instituição
        </button>
      </div>

      {institutions.length === 0 ? (
        <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-xl)", padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Nenhuma instituição cadastrada.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {institutions.map(inst => (
            <div key={inst.id} style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{inst.name}</p>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", background: "var(--blue-soft)", borderRadius: 999, padding: "2px 10px", letterSpacing: "0.05em" }}>
                      {inst.product === "business" ? "Business" : "Defense"}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{inst.units.length} unidade{inst.units.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => { setShowUnitModal(inst.id); setError(""); }}
                  style={{ fontSize: 12, fontWeight: 500, color: "var(--blue)", background: "var(--blue-soft)", border: "none", borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}
                >
                  + Unidade
                </button>
              </div>
              {inst.units.length > 0 && (
                <div style={{ padding: "12px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {inst.units.map(unit => (
                    <span key={unit.id} style={{
                      fontSize: 12, fontWeight: 500, color: "var(--ink)",
                      background: "var(--paper-2)", border: "1px solid var(--rule)",
                      borderRadius: 999, padding: "4px 12px",
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
            <Field label="Produto">
              <select
                value={instProduct}
                onChange={e => setInstProduct(e.target.value as "defense" | "business")}
                style={inputStyle}
              >
                <option value="defense">ETZ Defense</option>
                <option value="business">ETZ Business</option>
              </select>
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
  padding: "9px 12px", fontSize: 14, color: "var(--ink)", background: "var(--paper)",
  border: "1px solid var(--rule)", borderRadius: "var(--radius-md)", outline: "none",
  boxSizing: "border-box", width: "100%",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{label}</label>
      {children}
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: "#c0392b", background: "#fdf2f1", border: "1px solid #f5c6c2", borderRadius: "var(--radius-md)", padding: "8px 12px" }}>
      {children}
    </p>
  );
}

function ModalActions({ loading, onCancel, label }: { loading: boolean; onCancel: () => void; label: string }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, opacity: loading ? 0.7 : 1 }}>
        {loading ? "Salvando…" : label}
      </button>
      <button type="button" onClick={onCancel} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 500, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: 999, cursor: "pointer" }}>
        Cancelar
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-xl)", padding: 32, width: "100%", maxWidth: 440, boxShadow: "var(--shadow-lg)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 24 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
