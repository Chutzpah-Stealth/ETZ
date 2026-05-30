"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../../../lib/firebase";
import { db } from "../../../../../lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import type {
  Target, TargetStatus, RiskLevel, ClassificationLevel, LinkType,
  TargetAddress, TargetTattoo, TargetAssociate, TargetCriminalRecord, TargetWarrant,
} from "@etz/shared-types";
import {
  TARGET_STATUS_LABEL, RISK_LEVEL_LABEL, CLASSIFICATION_LABEL, LINK_TYPE_LABEL,
} from "@etz/shared-types";

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

const STATUS_COLOR: Record<TargetStatus, { color: string; bg: string }> = {
  investigado: { color: "#1a6e3c", bg: "#edf7f1" },
  suspeito:    { color: "#7a5c00", bg: "#fef9e8" },
  indiciado:   { color: "#7a3500", bg: "#fff3eb" },
  preso:       { color: "#c0392b", bg: "#fdf2f1" },
  foragido:    { color: "#5c1a6e", bg: "#f5edf7" },
};

const RISK_COLOR: Record<RiskLevel, { color: string; bg: string }> = {
  baixo: { color: "#1a6e3c", bg: "#edf7f1" },
  medio: { color: "#7a5c00", bg: "#fef9e8" },
  alto:  { color: "#c0392b", bg: "#fdf2f1" },
};

type EditState = {
  status: TargetStatus | "";
  riskLevel: RiskLevel | "";
  classification: ClassificationLevel | "";
  analystNotes: string;
  prisonStatus: string;
  prisonPavilion: string;
  prisonWing: string;
  prisonCell: string;
};

export default function AlvoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [target, setTarget] = useState<Target | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [userRole, setUserRole] = useState<string>("");

  const [editState, setEditState] = useState<EditState>({
    status: "", riskLevel: "", classification: "",
    analystNotes: "", prisonStatus: "", prisonPavilion: "",
    prisonWing: "", prisonCell: "",
  });

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserRole(snap.data()?.role ?? "");
    });
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`/api/defense/targets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) return;
        const data: Target = await res.json();
        setTarget(data);
        setEditState({
          status:         data.status         ?? "",
          riskLevel:      data.riskLevel      ?? "",
          classification: data.classification ?? "",
          analystNotes:   data.analystNotes   ?? "",
          prisonStatus:   data.prisonStatus   ?? "",
          prisonPavilion: data.prisonPavilion ?? "",
          prisonWing:     data.prisonWing     ?? "",
          prisonCell:     data.prisonCell     ?? "",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true); setEditError("");
    try {
      const token = await getToken();
      const body = {
        status:         editState.status         || null,
        riskLevel:      editState.riskLevel      || null,
        classification: editState.classification || null,
        analystNotes:   editState.analystNotes   || null,
        prisonStatus:   editState.prisonStatus   || null,
        prisonPavilion: editState.prisonPavilion || null,
        prisonWing:     editState.prisonWing     || null,
        prisonCell:     editState.prisonCell     || null,
      };
      const res = await fetch(`/api/defense/targets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const updated: Target = await res.json();
      setTarget(updated);
      setEditMode(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: 24, fontSize: 14, color: "var(--muted)" }}>Carregando…</p>;
  if (notFound || !target) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p style={{ fontSize: 14, color: "var(--muted)" }}>Alvo não encontrado.</p>
      <Link href="/alvos" style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "var(--blue)" }}>← Voltar</Link>
    </div>
  );

  const canEdit = userRole !== "agente_campo";

  return (
    <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Alvos</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>{target.fullName}</h1>
          {target.aliases.length > 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              {target.aliases.join(", ")}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {target.status && (
            <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "4px 12px", ...STATUS_COLOR[target.status] }}>
              {TARGET_STATUS_LABEL[target.status]}
            </span>
          )}
          {target.riskLevel && (
            <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "4px 12px", ...RISK_COLOR[target.riskLevel] }}>
              {RISK_LEVEL_LABEL[target.riskLevel]}
            </span>
          )}
          {canEdit && !editMode && (
            <button onClick={() => setEditMode(true)} style={{ fontSize: 12, fontWeight: 500, color: "var(--blue)", background: "var(--blue-soft)", border: "none", borderRadius: "var(--radius-md)", padding: "6px 14px", cursor: "pointer" }}>
              Editar
            </button>
          )}
          <Link href="/alvos" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>← Voltar</Link>
        </div>
      </div>

      {/* Meta */}
      <p style={{ fontSize: 12, color: "var(--muted)" }}>
        Criado por {target.createdByEmail} · {new Date(target.createdAt).toLocaleDateString("pt-BR")} ·
        Atualizado {new Date(target.updatedAt).toLocaleDateString("pt-BR")}
        {target.classification && (
          <span style={{ marginLeft: 8, fontWeight: 600, color: "var(--blue)" }}>
            {CLASSIFICATION_LABEL[target.classification]}
          </span>
        )}
      </p>

      {/* Informações Básicas */}
      <InfoCard title="Informações Básicas">
        <InfoGrid>
          <InfoItem label="Data de Nascimento" value={target.birthDate ? new Date(target.birthDate).toLocaleDateString("pt-BR") : null} />
          <InfoItem label="Gênero" value={target.gender === "masculino" ? "Masculino" : target.gender === "feminino" ? "Feminino" : target.gender === "outro" ? "Outro" : null} />
          <InfoItem label="Estado Civil" value={target.maritalStatus} />
          <InfoItem label="Cônjuge" value={target.spouse} />
          <InfoItem label="Filhos" value={target.children !== null ? String(target.children) : null} />
          <InfoItem label="Nacionalidade" value={target.nationality} />
          <InfoItem label="Nome do Pai" value={target.fatherName} />
          <InfoItem label="Nome da Mãe" value={target.motherName} />
        </InfoGrid>
        {target.operationAreas.length > 0 && <TagList label="Áreas de Atuação" tags={target.operationAreas} />}
        {target.vehicles.length > 0 && <TagList label="Veículos" tags={target.vehicles} />}
        {target.description && <InfoText label="Descrição" value={target.description} />}
      </InfoCard>

      {/* Tatuagens */}
      {target.tattoos.length > 0 && (
        <InfoCard title="Tatuagens / Marcas">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {target.tattoos.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--paper-2)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: 13, color: "var(--ink)", flex: 1 }}>{t.description}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{t.location}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Documentos */}
      <InfoCard title="Documentos">
        <InfoGrid>
          <InfoItem label="CPF" value={target.cpf} mono />
          <InfoItem label="RG" value={target.rg} mono />
          <InfoItem label="Passaporte" value={target.passport} mono />
        </InfoGrid>
      </InfoCard>

      {/* Contatos */}
      {(target.phones.length > 0 || target.emails.length > 0 || target.addresses.length > 0) && (
        <InfoCard title="Contatos">
          {target.phones.length > 0 && <TagList label="Telefones" tags={target.phones} />}
          {target.emails.length > 0 && <TagList label="E-mails" tags={target.emails} />}
          {target.addresses.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Endereços</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {target.addresses.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--ink)", padding: "8px 12px", background: "var(--paper-2)", borderRadius: "var(--radius-md)" }}>
                    {a.street}{a.city ? `, ${a.city}` : ""}{a.state ? ` — ${a.state}` : ""}{a.zip ? ` (${a.zip})` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </InfoCard>
      )}

      {/* Histórico Criminal */}
      {target.criminalHistory.length > 0 && (
        <InfoCard title="Histórico Criminal">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {target.criminalHistory.map((c, i) => (
              <div key={i} style={{ padding: "10px 12px", background: "var(--paper-2)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{c.crime}</p>
                {(c.date || c.notes) && (
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                    {c.date ? new Date(c.date).toLocaleDateString("pt-BR") : ""}
                    {c.date && c.notes ? " · " : ""}
                    {c.notes ?? ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Organizações */}
      {target.organizations.length > 0 && (
        <InfoCard title="Organizações">
          <TagList tags={target.organizations} />
        </InfoCard>
      )}

      {/* Vínculos */}
      {target.associates.length > 0 && (
        <InfoCard title="Pessoas Vinculadas">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {target.associates.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--paper-2)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", flex: 1 }}>{a.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", background: "var(--blue-soft)", borderRadius: 999, padding: "2px 8px" }}>
                  {LINK_TYPE_LABEL[a.linkType as LinkType]}
                </span>
                {a.targetId && (
                  <Link href={`/alvos/${a.targetId}`} style={{ fontSize: 11, color: "var(--blue)", textDecoration: "none" }}>Ver perfil →</Link>
                )}
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Mandados */}
      {target.warrants.length > 0 && (
        <InfoCard title="Mandados de Prisão">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {target.warrants.map((w, i) => (
              <div key={i} style={{ padding: "10px 12px", background: "var(--paper-2)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: 13, fontWeight: 500, fontFamily: "monospace", color: "var(--ink)" }}>{w.number}</p>
                {w.details && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{w.details}</p>}
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Informações Penitenciárias (editable) */}
      <InfoCard title="Informações Penitenciárias">
        {editMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-row form-row-2">
              <div className="form-field">
                <label className="form-label">Status Prisional</label>
                <input className="form-input" value={editState.prisonStatus} onChange={e => setEditState(s => ({ ...s, prisonStatus: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Pavilhão</label>
                <input className="form-input" value={editState.prisonPavilion} onChange={e => setEditState(s => ({ ...s, prisonPavilion: e.target.value }))} />
              </div>
            </div>
            <div className="form-row form-row-2">
              <div className="form-field">
                <label className="form-label">Ala</label>
                <input className="form-input" value={editState.prisonWing} onChange={e => setEditState(s => ({ ...s, prisonWing: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Cela</label>
                <input className="form-input" value={editState.prisonCell} onChange={e => setEditState(s => ({ ...s, prisonCell: e.target.value }))} />
              </div>
            </div>
          </div>
        ) : (
          <InfoGrid>
            <InfoItem label="Status Prisional" value={target.prisonStatus} />
            <InfoItem label="Pavilhão" value={target.prisonPavilion} />
            <InfoItem label="Ala" value={target.prisonWing} />
            <InfoItem label="Cela" value={target.prisonCell} />
          </InfoGrid>
        )}
      </InfoCard>

      {/* Análise de Risco (editable) */}
      <InfoCard title="Análise de Risco">
        {editMode ? (
          <div className="form-row form-row-3">
            <div className="form-field">
              <label className="form-label">Status</label>
              <select className="form-input form-select" value={editState.status} onChange={e => setEditState(s => ({ ...s, status: e.target.value as TargetStatus | "" }))}>
                <option value="">— Indefinido —</option>
                {Object.entries(TARGET_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Nível de Risco</label>
              <select className="form-input form-select" value={editState.riskLevel} onChange={e => setEditState(s => ({ ...s, riskLevel: e.target.value as RiskLevel | "" }))}>
                <option value="">— Indefinido —</option>
                {Object.entries(RISK_LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Classificação</label>
              <select className="form-input form-select" value={editState.classification} onChange={e => setEditState(s => ({ ...s, classification: e.target.value as ClassificationLevel | "" }))}>
                <option value="">— Indefinida —</option>
                {Object.entries(CLASSIFICATION_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <InfoGrid>
            <InfoItem label="Status" value={target.status ? TARGET_STATUS_LABEL[target.status] : null} />
            <InfoItem label="Nível de Risco" value={target.riskLevel ? RISK_LEVEL_LABEL[target.riskLevel] : null} />
            <InfoItem label="Classificação" value={target.classification ? CLASSIFICATION_LABEL[target.classification] : null} />
          </InfoGrid>
        )}
      </InfoCard>

      {/* Notas do Analista (editable) */}
      <InfoCard title="Notas do Analista">
        {editMode ? (
          <div className="form-field">
            <textarea
              className="form-input form-textarea"
              style={{ minHeight: 120 }}
              value={editState.analystNotes}
              onChange={e => setEditState(s => ({ ...s, analystNotes: e.target.value }))}
              placeholder="Notas, contexto operacional, informações relevantes…"
            />
          </div>
        ) : (
          target.analystNotes
            ? <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{target.analystNotes}</p>
            : <p style={{ fontSize: 13, color: "var(--muted)" }}>Sem notas.</p>
        )}
      </InfoCard>

      {/* Edit actions */}
      {editMode && (
        <div style={{ display: "flex", gap: 12, paddingBottom: 40 }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando…" : "Salvar Alterações"}
          </button>
          <button
            onClick={() => { setEditMode(false); setEditError(""); }}
            style={{ flex: 1, padding: "14px 26px", fontSize: 15, fontWeight: 500, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-pill)", cursor: "pointer" }}
          >
            Cancelar
          </button>
        </div>
      )}
      {editError && (
        <p style={{ fontSize: 13, color: "#c0392b", background: "#fdf2f1", border: "1px solid #f5c6c2", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          {editError}
        </p>
      )}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="form-section">
      <p className="form-section-title">{title}</p>
      {children}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px 24px" }}>
      {children}
    </div>
  );
}

function InfoItem({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: value ? "var(--ink)" : "var(--muted)", fontFamily: mono ? "monospace" : undefined }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function InfoText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65 }}>{value}</p>
    </div>
  );
}

function TagList({ label, tags }: { label?: string; tags: string[] }) {
  return (
    <div>
      {label && <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((t, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)", background: "var(--paper-2)", border: "1px solid var(--rule)", borderRadius: 999, padding: "3px 10px" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
