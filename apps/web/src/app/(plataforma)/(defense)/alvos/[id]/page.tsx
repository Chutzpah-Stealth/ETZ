"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getToken } from "../../../../../lib/auth";
import { ImageUploader } from "../../_components/ImageUploader";
import type {
  Target, TargetStatus, RiskLevel, ClassificationLevel, LinkType,
  TargetAddress, TargetTattoo, TargetAssociate, TargetCriminalRecord, TargetWarrant,
  Case, CaseTargetRole,
} from "@etz/shared-types";
import {
  TARGET_STATUS_LABEL, RISK_LEVEL_LABEL, CLASSIFICATION_LABEL, LINK_TYPE_LABEL,
  CASE_STATUS_LABEL, CASE_TARGET_ROLE_LABEL,
} from "@etz/shared-types";

const STATUS_STYLE: Record<TargetStatus, { color: string; bg: string }> = {
  investigado: { color: "#2451c9", bg: "#eaf0fd" },
  suspeito:    { color: "#b5740d", bg: "#fbf0db" },
  indiciado:   { color: "#d2731a", bg: "#fdf0e0" },
  preso:       { color: "#49515f", bg: "#e8ebf0" },
  foragido:    { color: "#c4392f", bg: "#fbe8e6" },
};

const RISK_STYLE: Record<RiskLevel, { color: string; bg: string }> = {
  baixo:   { color: "#1f8a52", bg: "#e7f4ec" },
  medio:   { color: "#b5740d", bg: "#fbf0db" },
  alto:    { color: "#c4392f", bg: "#fbe8e6" },
  critico: { color: "#8e1f1a", bg: "#f6e1df" },
};

const CLS_KEY: Record<ClassificationLevel, string> = {
  confidencial:       "conf",
  secreto:            "secret",
  ultrassecreto:      "ts",
  ts_sci:             "tssci",
  sap_acknowledged:   "sapa",
  sap_unacknowledged: "sapu",
  sap_waived:         "sapw",
};

type EditState = {
  /* ── Básico ── */
  fullName: string;
  aliases: string[];
  birthDate: string;
  gender: "masculino" | "feminino" | "outro" | "";
  maritalStatus: string;
  spouse: string;
  children: string;
  nationality: string;
  fatherName: string;
  motherName: string;
  operationAreas: string[];
  vehicles: string[];
  description: string;
  tattoos: TargetTattoo[];
  /* ── Documentos ── */
  cpf: string;
  rg: string;
  passport: string;
  /* ── Contatos ── */
  phones: string[];
  emails: string[];
  addresses: TargetAddress[];
  /* ── Criminal ── */
  criminalHistory: TargetCriminalRecord[];
  organizations: string[];
  associates: TargetAssociate[];
  warrants: TargetWarrant[];
  /* ── Penitenciário ── */
  prisonStatus: string;
  prisonPavilion: string;
  prisonWing: string;
  prisonCell: string;
  /* ── Análise ── */
  status: TargetStatus | "";
  riskLevel: RiskLevel | "";
  classification: ClassificationLevel | "";
  analystNotes: string;
  /* ── Mídia ── */
  photos: string[];
  tattooImages: string[];
  vehicleImages: string[];
  addressImages: string[];
  attachments: string[];
};

type TabId = "basico" | "documentos" | "contatos" | "criminal" | "casos" | "penitenciario" | "analise" | "anexos";

const TABS: { id: TabId; label: string }[] = [
  { id: "basico",        label: "Informações básicas" },
  { id: "documentos",    label: "Documentos"          },
  { id: "contatos",      label: "Contatos"            },
  { id: "criminal",      label: "Criminal"            },
  { id: "casos",         label: "Casos"               },
  { id: "penitenciario", label: "Penitenciário"       },
  { id: "analise",       label: "Análise"             },
  { id: "anexos",        label: "Anexos"              },
];

function targetToEditState(t: Target): EditState {
  return {
    fullName:       t.fullName        ?? "",
    aliases:        t.aliases         ?? [],
    birthDate:      t.birthDate       ?? "",
    gender:         (t.gender         ?? "") as EditState["gender"],
    maritalStatus:  t.maritalStatus   ?? "",
    spouse:         t.spouse          ?? "",
    children:       t.children !== null ? String(t.children) : "",
    nationality:    t.nationality     ?? "",
    fatherName:     t.fatherName      ?? "",
    motherName:     t.motherName      ?? "",
    operationAreas: t.operationAreas  ?? [],
    vehicles:       t.vehicles        ?? [],
    description:    t.description     ?? "",
    tattoos:        t.tattoos         ?? [],
    cpf:            t.cpf             ?? "",
    rg:             t.rg              ?? "",
    passport:       t.passport        ?? "",
    phones:         t.phones          ?? [],
    emails:         t.emails          ?? [],
    addresses:      t.addresses       ?? [],
    criminalHistory: t.criminalHistory ?? [],
    organizations:  t.organizations   ?? [],
    associates:     t.associates      ?? [],
    warrants:       t.warrants        ?? [],
    prisonStatus:   t.prisonStatus    ?? "",
    prisonPavilion: t.prisonPavilion  ?? "",
    prisonWing:     t.prisonWing      ?? "",
    prisonCell:     t.prisonCell      ?? "",
    status:         t.status          ?? "",
    riskLevel:      t.riskLevel       ?? "",
    classification: t.classification  ?? "",
    analystNotes:   t.analystNotes    ?? "",
    photos:         t.photos          ?? [],
    tattooImages:   t.tattooImages    ?? [],
    vehicleImages:  t.vehicleImages   ?? [],
    addressImages:  t.addressImages   ?? [],
    attachments:    t.attachments     ?? [],
  };
}

export default function AlvoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [target, setTarget]       = useState<Target | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basico");

  const [editMode, setEditMode]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editError, setEditError] = useState("");

  const [editState, setEditState] = useState<EditState>({
    fullName: "", aliases: [], birthDate: "", gender: "", maritalStatus: "",
    spouse: "", children: "", nationality: "", fatherName: "", motherName: "",
    operationAreas: [], vehicles: [], description: "", tattoos: [],
    cpf: "", rg: "", passport: "",
    phones: [], emails: [], addresses: [],
    criminalHistory: [], organizations: [], associates: [], warrants: [],
    prisonStatus: "", prisonPavilion: "", prisonWing: "", prisonCell: "",
    status: "", riskLevel: "", classification: "", analystNotes: "",
    photos: [], tattooImages: [], vehicleImages: [], addressImages: [], attachments: [],
  });

  const set = <K extends keyof EditState>(key: K, value: EditState[K]) =>
    setEditState(s => ({ ...s, [key]: value }));

  // ── Casos vinculados (N→N pelo lado do alvo) ──
  const [linkedCases, setLinkedCases]   = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [caseSearch, setCaseSearch]     = useState("");
  const [caseResults, setCaseResults]   = useState<Case[]>([]);
  const [searchingCase, setSearchingCase] = useState(false);
  const [linkBusy, setLinkBusy]         = useState(false);

  async function loadLinkedCases() {
    setLoadingCases(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/defense/cases?targetId=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setLinkedCases(res.ok ? await res.json() : []);
    } catch { setLinkedCases([]); }
    finally { setLoadingCases(false); }
  }

  async function searchCases(q: string) {
    setCaseSearch(q);
    if (!q.trim()) { setCaseResults([]); return; }
    setSearchingCase(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/defense/cases?search=${encodeURIComponent(q.trim())}`, { headers: { Authorization: `Bearer ${token}` } });
      setCaseResults(res.ok ? await res.json() : []);
    } catch { setCaseResults([]); }
    finally { setSearchingCase(false); }
  }

  async function linkCase(caseId: string, role: CaseTargetRole) {
    setLinkBusy(true);
    try {
      const token = await getToken();
      await fetch(`/api/defense/cases/${caseId}/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId: id, role }),
      });
      setCaseSearch(""); setCaseResults([]);
      await loadLinkedCases();
    } finally { setLinkBusy(false); }
  }

  async function unlinkCase(caseId: string) {
    setLinkBusy(true);
    try {
      const token = await getToken();
      await fetch(`/api/defense/cases/${caseId}/targets`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId: id }),
      });
      await loadLinkedCases();
    } finally { setLinkBusy(false); }
  }

  function roleOf(c: Case): CaseTargetRole {
    return (c.caseTargets ?? []).find(l => l.targetId === id)?.role ?? "outro";
  }

  useEffect(() => {
    if (activeTab === "casos") loadLinkedCases();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setEditState(targetToEditState(data));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    if (!editState.fullName.trim()) { setEditError("Nome completo é obrigatório."); return; }
    setSaving(true); setEditError("");
    try {
      const token = await getToken();
      const body: Partial<Target> = {
        fullName:       editState.fullName.trim()       || undefined,
        aliases:        editState.aliases,
        birthDate:      editState.birthDate             || null,
        gender:         (editState.gender               || null) as Target["gender"],
        maritalStatus:  editState.maritalStatus.trim()  || null,
        spouse:         editState.spouse.trim()         || null,
        children:       editState.children !== "" ? Number(editState.children) : null,
        nationality:    editState.nationality.trim()    || null,
        fatherName:     editState.fatherName.trim()     || null,
        motherName:     editState.motherName.trim()     || null,
        operationAreas: editState.operationAreas,
        vehicles:       editState.vehicles,
        description:    editState.description.trim()    || null,
        tattoos:        editState.tattoos,
        cpf:            editState.cpf.trim()            || null,
        rg:             editState.rg.trim()             || null,
        passport:       editState.passport.trim()       || null,
        phones:         editState.phones,
        emails:         editState.emails,
        addresses:      editState.addresses,
        criminalHistory: editState.criminalHistory,
        organizations:  editState.organizations,
        associates:     editState.associates,
        warrants:       editState.warrants,
        prisonStatus:   editState.prisonStatus.trim()   || null,
        prisonPavilion: editState.prisonPavilion.trim() || null,
        prisonWing:     editState.prisonWing.trim()     || null,
        prisonCell:     editState.prisonCell.trim()     || null,
        status:         (editState.status               || null) as Target["status"],
        riskLevel:      (editState.riskLevel            || null) as Target["riskLevel"],
        classification: (editState.classification       || null) as Target["classification"],
        analystNotes:   editState.analystNotes.trim()   || null,
        photos:         editState.photos,
        tattooImages:   editState.tattooImages,
        vehicleImages:  editState.vehicleImages,
        addressImages:  editState.addressImages,
        attachments:    editState.attachments,
      };
      const res = await fetch(`/api/defense/targets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const updated: Target = await res.json();
      setTarget(updated);
      setEditState(targetToEditState(updated));
      setEditMode(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    if (target) setEditState(targetToEditState(target));
    setEditMode(false);
    setEditError("");
  }

  if (loading) return (
    <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</p>
  );

  if (notFound || !target) return (
    <div style={{ padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <p style={{ fontSize: 14, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>Alvo não encontrado.</p>
      <Link href="/alvos" className="btn-secondary btn-primary--sm">← Voltar</Link>
    </div>
  );

  const canEdit = true;
  const E = editMode; /* shorthand */

  return (
    <div style={{ maxWidth: 900, width: "100%", display: "flex", flexDirection: "column" }}>

      {/* ── Header card ── */}
      <div className="target-detail-header">
        {/* Name + badges row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
              ETZ Defense / Alvos
            </p>
            <h1 style={{ fontSize: "clamp(19px, 4.5vw, 22px)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.018em", color: "var(--ink-900)", lineHeight: 1.15, overflowWrap: "break-word", wordBreak: "break-word" }}>
              {E ? editState.fullName || "—" : target.fullName}
            </h1>
            {(E ? editState.aliases : target.aliases).length > 0 && (
              <p style={{ fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-ui)", marginTop: 3 }}>
                {(E ? editState.aliases : target.aliases).join(" · ")}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {target.status && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, fontFamily: "var(--font-ui)", borderRadius: "var(--r-full)", padding: "3px 10px", ...STATUS_STYLE[target.status] }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {TARGET_STATUS_LABEL[target.status]}
              </span>
            )}
            {target.riskLevel && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", borderRadius: "var(--r-full)", padding: "3px 10px", ...RISK_STYLE[target.riskLevel] }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {RISK_LEVEL_LABEL[target.riskLevel]}
              </span>
            )}
            {target.classification && (
              <span className="cls" data-c={CLS_KEY[target.classification]}>
                {CLASSIFICATION_LABEL[target.classification]}
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <p style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)", marginBottom: 14 }}>
          Criado por {target.createdByEmail} · {new Date(target.createdAt).toLocaleDateString("pt-BR")} · Atualizado {new Date(target.updatedAt).toLocaleDateString("pt-BR")}
        </p>

        {/* Tabs + actions */}
        <div className="target-header-row">
          <div className="tabs" style={{ border: "none", minWidth: 0 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab${activeTab === t.id ? " tab--active" : ""}`}
                onClick={() => setActiveTab(t.id)}
                style={{ paddingLeft: t.id === "basico" ? 0 : undefined }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="target-header-actions">
            {canEdit && !E && (
              <button onClick={() => setEditMode(true)} className="btn-secondary btn-primary--sm">Editar</button>
            )}
            <Link href="/alvos" className="btn-ghost btn-primary--sm">← Voltar</Link>
          </div>
        </div>
        <div className="target-detail-separator" />
      </div>

      {/* ── Tab content ── */}
      <div className="target-detail-content">

        {/* ══ BÁSICO ══ */}
        {activeTab === "basico" && (
          <>
            {((target.photos ?? []).length > 0 || (canEdit && E)) && (
              <Section title="Fotos">
                <ImageUploader
                  images={E ? editState.photos : (target.photos ?? [])}
                  category="photos"
                  onAdd={url => set("photos", [...editState.photos, url])}
                  onRemove={i => set("photos", editState.photos.filter((_, idx) => idx !== i))}
                  readOnly={!E}
                  large
                />
              </Section>
            )}

            <Section title="Dados Pessoais">
              {E ? (
                <>
                  <div className="form-row form-row-2">
                    <TextField label="Nome Completo *" value={editState.fullName} onChange={v => set("fullName", v)} />
                    <TextField label="Data de Nascimento" value={editState.birthDate} onChange={v => set("birthDate", v)} type="date" />
                  </div>
                  <div className="form-row form-row-3">
                    <SelectField label="Gênero" value={editState.gender} onChange={v => set("gender", v as EditState["gender"])}
                      options={[["", "—"], ["masculino", "Masculino"], ["feminino", "Feminino"], ["outro", "Outro"]]} />
                    <TextField label="Estado Civil" value={editState.maritalStatus} onChange={v => set("maritalStatus", v)} />
                    <TextField label="Filhos" value={editState.children} onChange={v => set("children", v)} type="number" />
                  </div>
                  <div className="form-row form-row-2">
                    <TextField label="Cônjuge" value={editState.spouse} onChange={v => set("spouse", v)} />
                    <TextField label="Nacionalidade" value={editState.nationality} onChange={v => set("nationality", v)} />
                  </div>
                  <div className="form-row form-row-2">
                    <TextField label="Nome do Pai" value={editState.fatherName} onChange={v => set("fatherName", v)} />
                    <TextField label="Nome da Mãe" value={editState.motherName} onChange={v => set("motherName", v)} />
                  </div>
                  <ArrayStringField label="Alcunhas / Apelidos" items={editState.aliases} onChange={v => set("aliases", v)} placeholder="Adicionar alcunha…" />
                  <ArrayStringField label="Áreas de Atuação" items={editState.operationAreas} onChange={v => set("operationAreas", v)} placeholder="Adicionar área…" />
                  <ArrayStringField label="Veículos" items={editState.vehicles} onChange={v => set("vehicles", v)} placeholder="Adicionar veículo…" />
                  <TextareaField label="Descrição" value={editState.description} onChange={v => set("description", v)} />
                  <TattoosField value={editState.tattoos} onChange={v => set("tattoos", v)} />
                </>
              ) : (
                <>
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
                  {target.aliases.length > 0 && <ChipList label="Alcunhas" items={target.aliases} />}
                  {target.operationAreas.length > 0 && <ChipList label="Áreas de Atuação" items={target.operationAreas} />}
                  {target.vehicles.length > 0 && <ChipList label="Veículos" items={target.vehicles} />}
                  {target.description && <InfoText label="Descrição" value={target.description} />}
                </>
              )}
            </Section>

            {(E || target.tattoos.length > 0) && !E && (
              <Section title="Tatuagens / Marcas">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {target.tattoos.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
                      <span style={{ fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-ui)", flex: 1 }}>{t.description}</span>
                      <span style={{ fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{t.location}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* ══ DOCUMENTOS ══ */}
        {activeTab === "documentos" && (
          <Section title="Documentos de Identificação">
            {E ? (
              <div className="form-row form-row-3">
                <TextField label="CPF" value={editState.cpf} onChange={v => set("cpf", v)} placeholder="000.000.000-00" mono />
                <TextField label="RG"  value={editState.rg}  onChange={v => set("rg", v)}  mono />
                <TextField label="Passaporte" value={editState.passport} onChange={v => set("passport", v)} mono />
              </div>
            ) : (
              <InfoGrid>
                <InfoItem label="CPF"       value={target.cpf}      mono />
                <InfoItem label="RG"        value={target.rg}       mono />
                <InfoItem label="Passaporte" value={target.passport} mono />
              </InfoGrid>
            )}
          </Section>
        )}

        {/* ══ CONTATOS ══ */}
        {activeTab === "contatos" && (
          <>
            <Section title="Telefones">
              {E
                ? <ArrayStringField items={editState.phones} onChange={v => set("phones", v)} placeholder="Adicionar telefone…" mono />
                : target.phones.length > 0
                  ? <ChipList items={target.phones} mono />
                  : <EmptyInline message="Nenhum telefone registrado." />
              }
            </Section>

            <Section title="E-mails">
              {E
                ? <ArrayStringField items={editState.emails} onChange={v => set("emails", v)} placeholder="Adicionar e-mail…" mono />
                : target.emails.length > 0
                  ? <ChipList items={target.emails} mono />
                  : <EmptyInline message="Nenhum e-mail registrado." />
              }
            </Section>

            <Section title="Endereços">
              {E
                ? <AddressesField value={editState.addresses} onChange={v => set("addresses", v)} />
                : target.addresses.length > 0
                  ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {target.addresses.map((a, i) => (
                        <div key={i} style={{ fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-ui)", padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
                          {a.street}{a.city ? `, ${a.city}` : ""}{a.state ? ` — ${a.state}` : ""}{a.zip ? ` (${a.zip})` : ""}
                        </div>
                      ))}
                    </div>
                  )
                  : <EmptyInline message="Nenhum endereço registrado." />
              }
            </Section>
          </>
        )}

        {/* ══ CRIMINAL ══ */}
        {activeTab === "criminal" && (
          <>
            <Section title="Histórico Criminal">
              {E
                ? <CriminalHistoryField value={editState.criminalHistory} onChange={v => set("criminalHistory", v)} />
                : target.criminalHistory.length > 0
                  ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {target.criminalHistory.map((c, i) => (
                        <div key={i} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{c.crime}</p>
                          {(c.date || c.notes) && (
                            <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)", marginTop: 3 }}>
                              {c.date ? new Date(c.date).toLocaleDateString("pt-BR") : ""}
                              {c.date && c.notes ? " · " : ""}{c.notes ?? ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                  : <EmptyInline message="Nenhum histórico criminal." />
              }
            </Section>

            <Section title="Organizações Criminosas">
              {E
                ? <ArrayStringField items={editState.organizations} onChange={v => set("organizations", v)} placeholder="Adicionar organização…" />
                : target.organizations.length > 0
                  ? <ChipList items={target.organizations} />
                  : <EmptyInline message="Nenhuma organização registrada." />
              }
            </Section>

            <Section title="Pessoas Vinculadas">
              {E
                ? <AssociatesField value={editState.associates} onChange={v => set("associates", v)} />
                : target.associates.length > 0
                  ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {target.associates.map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-800)", fontFamily: "var(--font-ui)", flex: 1 }}>{a.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--accent)", background: "var(--accent-tint)", borderRadius: "var(--r-full)", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {LINK_TYPE_LABEL[a.linkType as LinkType]}
                          </span>
                          {a.targetId && (
                            <Link href={`/alvos/${a.targetId}`} style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-ui)" }}>Ver →</Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                  : <EmptyInline message="Nenhum vínculo registrado." />
              }
            </Section>

            <Section title="Mandados de Prisão">
              {E
                ? <WarrantsField value={editState.warrants} onChange={v => set("warrants", v)} />
                : target.warrants.length > 0
                  ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {target.warrants.map((w, i) => (
                        <div key={i} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--ink-800)" }}>{w.number}</p>
                          {w.details && <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)", marginTop: 2 }}>{w.details}</p>}
                        </div>
                      ))}
                    </div>
                  )
                  : <EmptyInline message="Nenhum mandado registrado." />
              }
            </Section>
          </>
        )}

        {/* ══ CASOS ══ */}
        {activeTab === "casos" && (
          <Section title="Casos Vinculados">
            {/* Busca-autocomplete de casos — só no modo de edição */}
            {E && (
            <div className="form-field" style={{ position: "relative", marginBottom: 4 }}>
              <label className="form-label">Vincular a um caso (busque pelo nome)</label>
              <input
                type="text"
                value={caseSearch}
                onChange={e => searchCases(e.target.value)}
                placeholder="Digite para buscar casos da unidade…"
                className="form-input"
                autoComplete="off"
              />
              {caseSearch.trim() && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 4,
                  background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: "var(--r-md)",
                  boxShadow: "var(--shadow-md)", maxHeight: 280, overflowY: "auto",
                }}>
                  {searchingCase ? (
                    <p style={{ padding: "12px 14px", fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Buscando…</p>
                  ) : caseResults.length === 0 ? (
                    <p style={{ padding: "12px 14px", fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhum caso encontrado.</p>
                  ) : (
                    caseResults.map(c => {
                      const already = linkedCases.some(lc => lc.id === c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={already || linkBusy}
                          onClick={() => { if (!already) linkCase(c.id, "outro"); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                            padding: "10px 14px", border: "none", borderBottom: "1px solid var(--line)",
                            background: "none", cursor: already ? "default" : "pointer", opacity: already ? 0.5 : 1,
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", display: "block" }}>{c.name}</span>
                            <span style={{ fontSize: 11, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>
                              {c.caseNumber ?? "sem número"} · {CASE_STATUS_LABEL[c.status]}
                            </span>
                          </span>
                          {already
                            ? <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)" }}>já vinculado</span>
                            : <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>+ vincular</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            )}

            {loadingCases ? (
              <p style={{ fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</p>
            ) : linkedCases.length === 0 ? (
              <EmptyInline message={E ? "Use a busca acima para vincular este alvo a um caso." : "Este alvo não está vinculado a nenhum caso."} />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data" style={{ width: "100%" }}>
                  <thead>
                    <tr><th>Caso</th><th>Nº</th><th>Status</th><th>Função no caso</th>{E && <th style={{ width: 1 }}></th>}</tr>
                  </thead>
                  <tbody>
                    {linkedCases.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>
                          <Link href={`/casos/${c.id}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{c.name}</Link>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>{c.caseNumber ?? <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                        <td><span className="status" data-s={c.status}>{CASE_STATUS_LABEL[c.status]}</span></td>
                        <td>
                          {E ? (
                            <select
                              value={roleOf(c)}
                              disabled={linkBusy}
                              onChange={e => linkCase(c.id, e.target.value as CaseTargetRole)}
                              className="form-input form-select"
                              style={{ height: 32, fontSize: 12, minWidth: 130 }}
                            >
                              {Object.entries(CASE_TARGET_ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                          ) : (
                            <span className="chip" style={{ fontSize: 11 }}>{CASE_TARGET_ROLE_LABEL[roleOf(c)]}</span>
                          )}
                        </td>
                        {E && (
                          <td>
                            <button onClick={() => unlinkCase(c.id)} disabled={linkBusy} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "4px 9px", cursor: "pointer" }}>×</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* ══ PENITENCIÁRIO ══ */}
        {activeTab === "penitenciario" && (
          <Section title="Informações Penitenciárias">
            {E ? (
              <>
                <div className="form-row form-row-2">
                  <TextField label="Status Prisional" value={editState.prisonStatus}   onChange={v => set("prisonStatus", v)} />
                  <TextField label="Pavilhão"         value={editState.prisonPavilion} onChange={v => set("prisonPavilion", v)} />
                </div>
                <div className="form-row form-row-2">
                  <TextField label="Ala"  value={editState.prisonWing} onChange={v => set("prisonWing", v)} />
                  <TextField label="Cela" value={editState.prisonCell} onChange={v => set("prisonCell", v)} />
                </div>
              </>
            ) : (
              <InfoGrid>
                <InfoItem label="Status Prisional" value={target.prisonStatus} />
                <InfoItem label="Pavilhão"         value={target.prisonPavilion} />
                <InfoItem label="Ala"              value={target.prisonWing} />
                <InfoItem label="Cela"             value={target.prisonCell} />
              </InfoGrid>
            )}
          </Section>
        )}

        {/* ══ ANÁLISE ══ */}
        {activeTab === "analise" && (
          <>
            <Section title="Análise de Risco">
              {E ? (
                <div className="form-row form-row-3">
                  <SelectField label="Status" value={editState.status} onChange={v => set("status", v as TargetStatus | "")}
                    options={[["", "— Indefinido —"], ...Object.entries(TARGET_STATUS_LABEL)]} />
                  <SelectField label="Nível de Risco" value={editState.riskLevel} onChange={v => set("riskLevel", v as RiskLevel | "")}
                    options={[["", "— Indefinido —"], ...Object.entries(RISK_LEVEL_LABEL)]} />
                  <SelectField label="Classificação" value={editState.classification} onChange={v => set("classification", v as ClassificationLevel | "")}
                    options={[["", "— Indefinida —"], ...Object.entries(CLASSIFICATION_LABEL)]} />
                </div>
              ) : (
                <InfoGrid>
                  <InfoItem label="Status"         value={target.status         ? TARGET_STATUS_LABEL[target.status]             : null} />
                  <InfoItem label="Nível de Risco" value={target.riskLevel      ? RISK_LEVEL_LABEL[target.riskLevel]             : null} />
                  <InfoItem label="Classificação"  value={target.classification ? CLASSIFICATION_LABEL[target.classification]    : null} />
                </InfoGrid>
              )}
            </Section>

            <Section title="Notas do Analista">
              {E ? (
                <textarea
                  className="form-input form-textarea"
                  style={{ minHeight: 140 }}
                  value={editState.analystNotes}
                  onChange={e => set("analystNotes", e.target.value)}
                  placeholder="Notas, contexto operacional, informações relevantes…"
                />
              ) : (
                target.analystNotes
                  ? <p style={{ fontSize: 14, color: "var(--ink-700)", fontFamily: "var(--font-ui)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{target.analystNotes}</p>
                  : <EmptyInline message="Sem notas." />
              )}
            </Section>
          </>
        )}

        {/* ══ ANEXOS ══ */}
        {activeTab === "anexos" && (
          <>
            {([
              { label: "Imagens de Tatuagens", key: "tattooImages"  as const, category: "tattoos"     },
              { label: "Imagens de Veículos",  key: "vehicleImages" as const, category: "vehicles"    },
              { label: "Imagens de Endereços", key: "addressImages" as const, category: "addresses"   },
              { label: "Outros Anexos",        key: "attachments"   as const, category: "attachments" },
            ] as const).map(({ label, key, category }) => {
              const imgs = E ? editState[key] : (target[key] ?? []);
              if (!E && imgs.length === 0) return null;
              return (
                <Section key={key} title={label}>
                  <ImageUploader
                    images={imgs}
                    category={category}
                    onAdd={url => set(key, [...(editState[key] as string[]), url])}
                    onRemove={i  => set(key, (editState[key] as string[]).filter((_, idx) => idx !== i))}
                    readOnly={!E}
                  />
                </Section>
              );
            })}
            {!E && [
              ...(target.tattooImages ?? []), ...(target.vehicleImages ?? []),
              ...(target.addressImages ?? []), ...(target.attachments  ?? []),
            ].length === 0 && <EmptyInline message="Nenhum anexo registrado." />}
          </>
        )}

        {/* ── Edit action bar ── */}
        {E && (
          <>
            {editError && (
              <p style={{ fontSize: 13, color: "var(--danger)", background: "var(--danger-tint)", border: "1px solid #f5c6c2", borderRadius: "var(--r-sm)", padding: "10px 14px", fontFamily: "var(--font-ui)" }}>
                {editError}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1, justifyContent: "center" }}>
                {saving ? "Salvando…" : "Salvar Alterações"}
              </button>
              <button onClick={cancelEdit} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Primitive field components
══════════════════════════════════════════ */

function TextField({ label, value, onChange, type = "text", placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean;
}) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <select className="form-input form-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <textarea
        className="form-input form-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight: 80 }}
      />
    </div>
  );
}

/* Array of simple strings */
function ArrayStringField({ label, items, onChange, placeholder, mono }: {
  label?: string; items: string[]; onChange: (v: string[]) => void;
  placeholder?: string; mono?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft("");
  }

  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {items.map((item, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)",
              color: "var(--ink-700)", background: "var(--surface-2)",
              border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "3px 8px",
            }}>
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-400)", padding: 0, lineHeight: 1, fontSize: 14 }}
              >×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          className="form-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Adicionar…"}
          style={mono ? { fontFamily: "var(--font-mono)", flex: 1 } : { flex: 1 }}
        />
        <button type="button" onClick={add} className="btn-secondary btn-primary--sm" style={{ flexShrink: 0 }}>
          + Adicionar
        </button>
      </div>
    </div>
  );
}

/* Tattoos */
function TattoosField({ value, onChange }: { value: TargetTattoo[]; onChange: (v: TargetTattoo[]) => void }) {
  const [desc, setDesc] = useState("");
  const [loc,  setLoc]  = useState("");

  function add() {
    if (!desc.trim()) return;
    onChange([...value, { description: desc.trim(), location: loc.trim() }]);
    setDesc(""); setLoc("");
  }

  return (
    <div className="form-field">
      <label className="form-label">Tatuagens / Marcas</label>
      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {value.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
              <span style={{ fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-ui)", flex: 1 }}>{t.description}</span>
              <span style={{ fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{t.location}</span>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-400)", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="form-grid-tattoo">
        <div className="form-field" style={{ gap: 0 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>Descrição</label>
          <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex.: dragão" />
        </div>
        <div className="form-field" style={{ gap: 0 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>Localização</label>
          <input className="form-input" value={loc} onChange={e => setLoc(e.target.value)} placeholder="Ex.: braço direito" />
        </div>
        <button type="button" onClick={add} className="btn-secondary btn-primary--sm">+ Adicionar</button>
      </div>
    </div>
  );
}

/* Addresses */
function AddressesField({ value, onChange }: { value: TargetAddress[]; onChange: (v: TargetAddress[]) => void }) {
  const [draft, setDraft] = useState<TargetAddress>({ street: "", city: "", state: "", zip: "" });

  function add() {
    if (!draft.street.trim()) return;
    onChange([...value, { ...draft, street: draft.street.trim(), city: draft.city?.trim() ?? "", state: draft.state?.trim() ?? "", zip: draft.zip?.trim() ?? "" }]);
    setDraft({ street: "", city: "", state: "", zip: "" });
  }

  return (
    <div className="form-field">
      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {value.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
              <span style={{ fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-ui)", flex: 1 }}>
                {a.street}{a.city ? `, ${a.city}` : ""}{a.state ? ` — ${a.state}` : ""}{a.zip ? ` (${a.zip})` : ""}
              </span>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-400)", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="form-grid-address">
        {[
          { key: "street", label: "Logradouro *", placeholder: "Rua / Av." },
          { key: "city",   label: "Cidade",       placeholder: "São Paulo"  },
          { key: "state",  label: "Estado",       placeholder: "SP"         },
          { key: "zip",    label: "CEP",          placeholder: "00000-000"  },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="form-field" style={{ gap: 0 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>{label}</label>
            <input className="form-input" value={(draft as unknown as Record<string, string>)[key] ?? ""} placeholder={placeholder}
              onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
          </div>
        ))}
        <button type="button" onClick={add} className="btn-secondary btn-primary--sm">+ Add</button>
      </div>
    </div>
  );
}

/* Criminal history */
function CriminalHistoryField({ value, onChange }: { value: TargetCriminalRecord[]; onChange: (v: TargetCriminalRecord[]) => void }) {
  const [crime, setCrime] = useState(""); const [date, setDate] = useState(""); const [notes, setNotes] = useState("");
  function add() {
    if (!crime.trim()) return;
    onChange([...value, { crime: crime.trim(), date: date || undefined, notes: notes.trim() || undefined }]);
    setCrime(""); setDate(""); setNotes("");
  }
  return (
    <div className="form-field">
      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {value.map((c, i) => (
            <div key={i} style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--r-md)", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{c.crime}</p>
                {(c.date || c.notes) && (
                  <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)", marginTop: 2 }}>
                    {c.date ? new Date(c.date).toLocaleDateString("pt-BR") : ""}{c.date && c.notes ? " · " : ""}{c.notes ?? ""}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-400)", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="form-grid-criminal">
        {[
          { val: crime, set: setCrime, label: "Crime *",     placeholder: "Ex.: tráfico de drogas" },
          { val: date,  set: setDate,  label: "Data",        placeholder: "", type: "date" },
          { val: notes, set: setNotes, label: "Observações", placeholder: "Ex.: sentença de 6 anos" },
        ].map(({ val, set: s, label, placeholder, type }) => (
          <div key={label} className="form-field" style={{ gap: 0 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>{label}</label>
            <input className="form-input" type={type ?? "text"} value={val} placeholder={placeholder} onChange={e => s(e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={add} className="btn-secondary btn-primary--sm">+ Add</button>
      </div>
    </div>
  );
}

/* Associates */
function AssociatesField({ value, onChange }: { value: TargetAssociate[]; onChange: (v: TargetAssociate[]) => void }) {
  const [name, setName] = useState(""); const [link, setLink] = useState<LinkType>("familiar"); const [targetId, setTargetId] = useState("");
  function add() {
    if (!name.trim()) return;
    onChange([...value, { name: name.trim(), linkType: link, targetId: targetId.trim() || undefined }]);
    setName(""); setLink("familiar"); setTargetId("");
  }
  return (
    <div className="form-field">
      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {value.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-800)", fontFamily: "var(--font-ui)", flex: 1 }}>{a.name}</span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)", background: "var(--accent-tint)", borderRadius: "var(--r-full)", padding: "2px 8px", textTransform: "uppercase" }}>
                {LINK_TYPE_LABEL[a.linkType as LinkType]}
              </span>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-400)", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="form-grid-associate">
        <div className="form-field" style={{ gap: 0 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>Nome *</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" />
        </div>
        <div className="form-field" style={{ gap: 0 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>Vínculo</label>
          <select className="form-input form-select" value={link} onChange={e => setLink(e.target.value as LinkType)}>
            {Object.entries(LINK_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="form-field" style={{ gap: 0 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>ID do Alvo</label>
          <input className="form-input" value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="opcional" />
        </div>
        <button type="button" onClick={add} className="btn-secondary btn-primary--sm">+ Add</button>
      </div>
    </div>
  );
}

/* Warrants */
function WarrantsField({ value, onChange }: { value: TargetWarrant[]; onChange: (v: TargetWarrant[]) => void }) {
  const [num, setNum] = useState(""); const [details, setDetails] = useState("");
  function add() {
    if (!num.trim()) return;
    onChange([...value, { number: num.trim(), details: details.trim() || undefined }]);
    setNum(""); setDetails("");
  }
  return (
    <div className="form-field">
      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {value.map((w, i) => (
            <div key={i} style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--r-md)", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--ink-800)" }}>{w.number}</p>
                {w.details && <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)", marginTop: 2 }}>{w.details}</p>}
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-400)", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="form-grid-warrant">
        {[
          { val: num,     set: setNum,     label: "Número *", placeholder: "Nº do mandado" },
          { val: details, set: setDetails, label: "Detalhes", placeholder: "Observações adicionais" },
        ].map(({ val, set: s, label, placeholder }) => (
          <div key={label} className="form-field" style={{ gap: 0 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>{label}</label>
            <input className="form-input" value={val} placeholder={placeholder} onChange={e => s(e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={add} className="btn-secondary btn-primary--sm">+ Add</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Display-only helpers
══════════════════════════════════════════ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(140px, 100%), 1fr))", gap: "12px 24px" }}>{children}</div>;
}

function InfoItem({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: value ? "var(--ink-700)" : "var(--ink-300)", fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)", overflowWrap: "break-word", wordBreak: "break-word" }}>{value ?? "—"}</p>
    </div>
  );
}

function InfoText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 14, color: "var(--ink-700)", fontFamily: "var(--font-ui)", lineHeight: 1.65, overflowWrap: "break-word", wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

function ChipList({ label, items, mono = false }: { label?: string; items: string[]; mono?: boolean }) {
  return (
    <div>
      {label && <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 }}>{label}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)", color: "var(--ink-700)", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "3px 10px" }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyInline({ message }: { message: string }) {
  return <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{message}</p>;
}
