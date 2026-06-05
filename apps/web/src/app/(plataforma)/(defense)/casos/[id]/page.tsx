"use client";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../../lib/auth";
import { useAuthedFetch } from "../../../../../lib/useAuthedFetch";
import { useConfirm } from "../../../../components/ConfirmDialog";
import { EntitySearchSelect } from "../../../../components/EntitySearchSelect";
import { ImageUploader } from "../../_components/ImageUploader";
import type {
  Case, CaseStatus, ClassificationLevel, Target, RiskLevel, TargetStatus,
  InvestigationOrigin, CaseTargetRole,
  LocationType, EvidenceType, IntelProductType, ConfidenceLevel,
  PenalTypification, CaseTargetLink, CaseLocation, CaseRelationship,
} from "@etz/shared-types";
import {
  CASE_STATUS_LABEL, CLASSIFICATION_LABEL, RISK_LEVEL_LABEL, TARGET_STATUS_LABEL,
  INVESTIGATION_ORIGIN_LABEL, CASE_TARGET_ROLE_LABEL,
  LOCATION_TYPE_LABEL, EVIDENCE_TYPE_LABEL,
  INTEL_PRODUCT_LABEL, CONFIDENCE_LABEL,
} from "@etz/shared-types";

const CLASSIFICATIONS = Object.entries(CLASSIFICATION_LABEL) as [ClassificationLevel, string][];

const CLS_MAP: Record<ClassificationLevel, string> = {
  confidencial: "conf", secreto: "secret", ultrassecreto: "ts", ts_sci: "tssci",
  sap_acknowledged: "sapa", sap_unacknowledged: "sapu", sap_waived: "sapw",
};

const RISK_COLOR: Record<RiskLevel, { color: string; bg: string }> = {
  baixo:   { color: "#1f8a52", bg: "#e7f4ec" },
  medio:   { color: "#b5740d", bg: "#fbf0db" },
  alto:    { color: "#c4392f", bg: "#fbe8e6" },
  critico: { color: "#8e1f1a", bg: "#f6e1df" },
};

const TARGET_STATUS_COLOR: Record<TargetStatus, { color: string; bg: string }> = {
  investigado: { color: "#2451c9", bg: "#eaf0fd" },
  suspeito:    { color: "#b5740d", bg: "#fbf0db" },
  indiciado:   { color: "#d2731a", bg: "#fdf0e0" },
  preso:       { color: "#49515f", bg: "#e8ebf0" },
  foragido:    { color: "#c4392f", bg: "#fbe8e6" },
};

const COMM_OPTIONS = ["WhatsApp", "Telegram", "Signal", "Ligações", "E-mail", "Rádio", "Criptografado"];

type Tab = "visao" | "contexto" | "alvos" | "modus" | "timeline" | "inteligencia";
type RouteParams = { params: Promise<{ id: string }> };

function ChipsField({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const [input, setInput] = useState("");
  function add(raw: string) {
    const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
    onChange([...values, ...parts.filter(p => !values.includes(p))]);
    setInput("");
  }
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <input type="text" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); } }}
        onBlur={() => input.trim() && add(input)}
        placeholder={placeholder} className="form-input" />
      {values.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {values.map(v => (
            <span key={v} className="chip">{v}
              <span className="x" onClick={() => onChange(values.filter(x => x !== v))}>×</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CasoDetailPage({ params }: RouteParams) {
  const { id } = use(params);
  const router  = useRouter();
  const { confirm, ConfirmUI } = useConfirm();

  const [tab, setTab]           = useState<Tab>("visao");
  const [error, setError]       = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const E = editMode;

  const isDirty = useRef(false);

  async function handleBack() {
    if (isDirty.current) {
      const ok = await confirm({
        title: "Sair sem salvar?",
        message: "Há alterações não salvas. Se sair agora, elas serão perdidas.",
        confirmLabel: "Sair sem salvar",
      });
      if (!ok) return;
    }
    isDirty.current = false;
    router.push("/casos");
  }

  // Tab 1
  const [editName, setEditName]       = useState("");
  const [editCaseNum, setCaseNum]     = useState("");
  const [editOpenedAt, setOpenedAt]   = useState("");
  const [editResp, setResp]           = useState("");
  const [editStatus, setEditStatus]   = useState<CaseStatus>("em_andamento");
  const [editCls, setEditCls]         = useState<ClassificationLevel | "">("");
  const [editAreas, setEditAreas]     = useState<string[]>([]);
  const [editTeam, setEditTeam]       = useState<string[]>([]);
  const [editAgencies, setEditAgencies] = useState<string[]>([]);
  const [editSituation, setSituation] = useState("");
  const [editConfidence, setConfidence] = useState<ConfidenceLevel | "">("");
  const [editNextSteps, setNextSteps] = useState<string[]>([]);

  // Tab 2
  const [editOrigin, setOrigin]         = useState<InvestigationOrigin | "">("");
  const [editHypothesis, setHypothesis] = useState("");
  const [editHistory, setEditHistory]   = useState("");
  const [editFacts, setEditFacts]       = useState("");
  const [editPending, setEditPending]   = useState("");
  const [editTyp, setEditTyp]           = useState<PenalTypification[]>([]);
  const [typOffense, setTypOffense]     = useState("");
  const [typLaw, setTypLaw]             = useState("");

  // Tab 3 — alvos do caso (vínculos N→N) + locais
  const [editTargets, setEditTargets]   = useState<CaseTargetLink[]>([]);
  const [editLocations, setEditLocs]    = useState<CaseLocation[]>([]);
  const [showLocForm, setShowLocForm]   = useState(false);
  const [newLoc, setNewLoc]             = useState<Partial<CaseLocation>>({ type: "outro", relatedTargetIds: [] });
  const [targetMap, setTargetMap]       = useState<Record<string, Target>>({});

  // Tab 4
  const [editComm, setEditComm]       = useState<string[]>([]);
  const [editLogistics, setLogistics] = useState("");
  const [editFinancial, setFinancial] = useState("");
  const [editModus, setEditModus]     = useState("");
  const [editRelations, setRelations] = useState<CaseRelationship[]>([]);
  const [newRel, setNewRel]           = useState<Partial<CaseRelationship>>({});

  // Tab 5 — append-only
  const [tlDate, setTlDate]   = useState("");
  const [tlEvent, setTlEvent] = useState("");
  const [addingTl, setAddingTl] = useState(false);
  const [tlError, setTlError]   = useState("");
  const [evType, setEvType]     = useState<EvidenceType>("documental");
  const [evDesc, setEvDesc]     = useState("");
  const [evAtt, setEvAtt]       = useState<string[]>([]);
  const [addingEv, setAddingEv] = useState(false);
  const [evError, setEvError]   = useState("");

  // Tab 6 — append-only + notas
  const [intelType, setIntelType]     = useState<IntelProductType>("relatorio");
  const [intelTitle, setIntelTitle]   = useState("");
  const [intelDesc, setIntelDesc]     = useState("");
  const [intelAtt, setIntelAtt]       = useState<string[]>([]);
  const [addingIntel, setAddingIntel] = useState(false);
  const [intelError, setIntelError]   = useState("");
  const [editNotes, setEditNotes]     = useState("");
  const [custDesc, setCustDesc]       = useState("");
  const [custAtt, setCustAtt]         = useState<string[]>([]);
  const [addingCust, setAddingCust]   = useState(false);
  const [custError, setCustError]     = useState("");

  function populate(data: Case) {
    setEditName(data.name);
    setCaseNum(data.caseNumber ?? "");
    setOpenedAt(data.openedAt ?? "");
    setResp(data.responsibleBy ?? "");
    setEditStatus(data.status);
    setEditCls(data.classification ?? "");
    setEditAreas(data.operationAreas ?? []);
    setEditTeam(data.team ?? []);
    setEditAgencies(data.partnerAgencies ?? []);
    setSituation(data.currentSituation ?? "");
    setConfidence(data.confidenceLevel ?? "");
    setNextSteps(data.nextSteps ?? []);
    setOrigin(data.investigationOrigin ?? "");
    setHypothesis(data.criminalHypothesis ?? "");
    setEditHistory(data.history ?? "");
    setEditFacts(data.knownFacts ?? "");
    setEditPending(data.pendingHypotheses ?? "");
    setEditTyp(data.penalTypifications ?? []);
    setEditTargets(data.caseTargets ?? []);
    setEditLocs(data.locations ?? []);
    setEditComm(data.modusCommunication ?? []);
    setLogistics(data.modusLogistics ?? "");
    setFinancial(data.modusFinancial ?? "");
    setEditModus(data.modusOperandi ?? "");
    setRelations(data.relationships ?? []);
    setEditNotes(data.notes ?? "");
  }

  // Caso atual: fetch + populate dos estados de edição; 404 redireciona para a lista
  const { data: caso, setData: setCaso, loading, refetch: loadCase } = useAuthedFetch<Case | null>(
    `/api/defense/cases/${id}`,
    { initial: null, onSuccess: d => { if (d) populate(d); }, onError: () => router.replace("/casos") },
  );

  // resolve os alvos vinculados (targetId → Target) ao abrir a aba de alvos
  useAuthedFetch<Target[]>(tab === "alvos" ? `/api/defense/targets` : null, {
    initial: [],
    onSuccess: all => setTargetMap(Object.fromEntries(all.map(t => [t.id, t]))),
  });

  async function patchCase(body: object) {
    const token = await getToken();
    const res = await fetch(`/api/defense/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    const updated: Case = await res.json();
    setCaso(updated);
  }

  async function postSub(path: string, body: object) {
    const token = await getToken();
    const res = await fetch(`/api/defense/cases/${id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    return res.json();
  }

  // Salvar tudo (todas as abas) num único PATCH — como em /alvos
  async function saveAll() {
    if (!editName.trim()) { setError("O nome do caso é obrigatório."); return; }
    setSavingAll(true); setError("");
    try {
      await patchCase({
        name: editName.trim(), caseNumber: editCaseNum.trim() || null,
        openedAt: editOpenedAt || null, responsibleBy: editResp.trim() || null,
        status: editStatus, classification: editCls || null,
        operationAreas: editAreas, team: editTeam, partnerAgencies: editAgencies,
        currentSituation: editSituation.trim() || null,
        confidenceLevel: editConfidence || null, nextSteps: editNextSteps,
        investigationOrigin: editOrigin || null,
        criminalHypothesis: editHypothesis.trim() || null,
        history: editHistory.trim() || null,
        knownFacts: editFacts.trim() || null,
        pendingHypotheses: editPending.trim() || null,
        penalTypifications: editTyp,
        caseTargets: editTargets, locations: editLocations,
        modusOperandi: editModus.trim() || null, modusCommunication: editComm,
        modusLogistics: editLogistics.trim() || null, modusFinancial: editFinancial.trim() || null,
        relationships: editRelations,
        notes: editNotes.trim() || null,
      });
      isDirty.current = false;
      setEditMode(false);
    } catch { setError("Erro ao salvar."); }
    finally { setSavingAll(false); }
  }

  function cancelEdit() {
    if (caso) populate(caso);
    setEditMode(false);
    isDirty.current = false;
    setError("");
    setShowLocForm(false);
    setNewLoc({ type: "outro", relatedTargetIds: [] });
    setNewRel({});
    setTypOffense(""); setTypLaw("");
  }

  async function addTimeline() {
    if (!tlDate || !tlEvent.trim()) { setTlError("Data e evento são obrigatórios."); return; }
    setAddingTl(true); setTlError("");
    try { await postSub("timeline", { date: tlDate, event: tlEvent.trim() }); await loadCase(); setTlDate(""); setTlEvent(""); }
    catch { setTlError("Erro ao adicionar."); }
    finally { setAddingTl(false); }
  }

  async function addEvidence() {
    if (!evDesc.trim()) { setEvError("Descrição é obrigatória."); return; }
    setAddingEv(true); setEvError("");
    try { await postSub("evidence", { type: evType, description: evDesc.trim(), attachments: evAtt }); await loadCase(); setEvDesc(""); setEvAtt([]); }
    catch { setEvError("Erro ao adicionar."); }
    finally { setAddingEv(false); }
  }

  async function addIntelligence() {
    if (!intelTitle.trim()) { setIntelError("Título é obrigatório."); return; }
    setAddingIntel(true); setIntelError("");
    try {
      await postSub("intelligence", { type: intelType, title: intelTitle.trim(), description: intelDesc.trim() || undefined, attachments: intelAtt });
      await loadCase(); setIntelTitle(""); setIntelDesc(""); setIntelAtt([]);
    } catch { setIntelError("Erro ao adicionar."); }
    finally { setAddingIntel(false); }
  }

  async function addCustody() {
    if (!custDesc.trim()) { setCustError("Descrição é obrigatória."); return; }
    setAddingCust(true); setCustError("");
    try { await postSub("custody", { description: custDesc.trim(), attachments: custAtt }); await loadCase(); setCustDesc(""); setCustAtt([]); }
    catch { setCustError("Erro ao adicionar."); }
    finally { setAddingCust(false); }
  }

  async function handleDelete() {
    if (!caso) return;
    const ok = await confirm({
      title: "Excluir caso",
      message: `Tem certeza que deseja excluir o caso "${caso.name}"? Esta ação é irreversível.`,
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await fetch(`/api/defense/cases/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      router.replace("/casos");
    } catch { setDeleting(false); }
  }

  function roleOf(link: CaseTargetLink) { return CASE_TARGET_ROLE_LABEL[link.role]; }

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</div>;
  if (!caso) return null;

  const sortedTimeline = [...(caso.timeline ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const sortedChain    = [...(caso.chainOfCustody ?? [])].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  const TABS: { key: Tab; label: string }[] = [
    { key: "visao",        label: "Visão Geral" },
    { key: "contexto",     label: "Contexto" },
    { key: "alvos",        label: "Alvos & Locais" },
    { key: "modus",        label: "Modus & Rede" },
    { key: "timeline",     label: "Timeline & Evidências" },
    { key: "inteligencia", label: "Inteligência" },
  ];

  return (
    <div style={{ maxWidth: 960, width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
      {ConfirmUI}

      {/* Header */}
      <div className="target-detail-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>
              ETZ Defense · Casos{caso.caseNumber && <span style={{ color: "var(--ink-400)", marginLeft: 8 }}>· {caso.caseNumber}</span>}
            </p>
            <h1 style={{ fontSize: "clamp(19px, 4.5vw, 22px)", marginBottom: 8, overflowWrap: "break-word", wordBreak: "break-word" }}>{caso.name}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span className="status" data-s={caso.status}>{CASE_STATUS_LABEL[caso.status]}</span>
              {caso.classification && <span className="cls" data-c={CLS_MAP[caso.classification]}>{CLASSIFICATION_LABEL[caso.classification]}</span>}
              {caso.confidenceLevel && (
                <span className="status" data-s={`conf-${caso.confidenceLevel}`}>
                  Confiança: {CONFIDENCE_LABEL[caso.confidenceLevel]}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={handleBack} className="btn-secondary btn-primary--sm">← Casos</button>
            {E ? (
              <button onClick={cancelEdit} className="btn-secondary btn-primary--sm">Cancelar</button>
            ) : (
              <>
                <button onClick={() => setEditMode(true)} className="btn-secondary btn-primary--sm">Editar</button>
                <button onClick={handleDelete} disabled={deleting} className="btn-danger btn-primary--sm">
                  {deleting ? "Excluindo…" : "Excluir"}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="tabs" style={{ marginTop: 4 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} className={`tab${tab === key ? " tab--active" : ""}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="target-detail-content" onInput={() => { if (E) isDirty.current = true; }}>
        {error && <div className="alert alert--danger" style={{ marginBottom: 12 }}><span>{error}</span></div>}

        {/* ── Tab 1: Visão Geral ── */}
        {tab === "visao" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-section">
              <p className="form-section-title">Identificação</p>
              {E ? (
                <>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Nome do Caso *</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Número do Caso</label>
                      <input type="text" value={editCaseNum} onChange={e => setCaseNum(e.target.value)} placeholder="Ex.: 2024/001-PC" className="form-input" />
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Status</label>
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value as CaseStatus)} className="form-input form-select">
                        {Object.entries(CASE_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Data de Abertura</label>
                      <input type="date" value={editOpenedAt} onChange={e => setOpenedAt(e.target.value)} className="form-input" />
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Classificação de Acesso</label>
                      <select value={editCls} onChange={e => setEditCls(e.target.value as ClassificationLevel | "")} className="form-input form-select">
                        <option value="">Não classificado</option>
                        {CLASSIFICATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Responsável</label>
                      <input type="text" value={editResp} onChange={e => setResp(e.target.value)} placeholder="Analista ou gestor responsável" className="form-input" />
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <ChipsField label="Áreas de Atuação" values={editAreas} onChange={setEditAreas} placeholder="Digite e pressione Enter" />
                    <ChipsField label="Equipe" values={editTeam} onChange={setEditTeam} placeholder="Membros da equipe" />
                  </div>
                  <ChipsField label="Agências Parceiras" values={editAgencies} onChange={setEditAgencies} placeholder="Ex.: PF, GAECO, DRACO" />
                </>
              ) : (
                <>
                  <InfoGrid>
                    <InfoItem label="Nome do Caso" value={caso.name} />
                    <InfoItem label="Número do Caso" value={caso.caseNumber} mono />
                    <InfoItem label="Status" value={CASE_STATUS_LABEL[caso.status]} />
                    <InfoItem label="Data de Abertura" value={caso.openedAt ? new Date(caso.openedAt + "T12:00:00").toLocaleDateString("pt-BR") : null} />
                    <InfoItem label="Classificação" value={caso.classification ? CLASSIFICATION_LABEL[caso.classification] : null} />
                    <InfoItem label="Responsável" value={caso.responsibleBy} />
                  </InfoGrid>
                  {caso.operationAreas.length > 0 && <ChipList label="Áreas de Atuação" items={caso.operationAreas} />}
                  {caso.team.length > 0 && <ChipList label="Equipe" items={caso.team} />}
                  {caso.partnerAgencies.length > 0 && <ChipList label="Agências Parceiras" items={caso.partnerAgencies} />}
                </>
              )}
            </div>

            <div className="form-section">
              <p className="form-section-title">Avaliação Atual</p>
              {E ? (
                <>
                  <div className="form-field">
                    <label className="form-label">Situação Atual</label>
                    <textarea value={editSituation} onChange={e => setSituation(e.target.value)} rows={4} placeholder="Resumo executivo do estado atual do caso…" className="form-input form-textarea" />
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Nível de Confiança</label>
                      <select value={editConfidence} onChange={e => setConfidence(e.target.value as ConfidenceLevel | "")} className="form-input form-select">
                        <option value="">Não avaliado</option>
                        {Object.entries(CONFIDENCE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <ChipsField label="Próximos Passos" values={editNextSteps} onChange={setNextSteps} placeholder="Adicione próximos passos" />
                </>
              ) : (
                <>
                  {caso.currentSituation ? <InfoText label="Situação Atual" value={caso.currentSituation} /> : <EmptyInline message="Sem avaliação registrada." />}
                  <InfoGrid>
                    <InfoItem label="Nível de Confiança" value={caso.confidenceLevel ? CONFIDENCE_LABEL[caso.confidenceLevel] : null} />
                  </InfoGrid>
                  {caso.nextSteps.length > 0 && <ChipList label="Próximos Passos" items={caso.nextSteps} />}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 2: Contexto ── */}
        {tab === "contexto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-section">
              <p className="form-section-title">Origem e Hipótese</p>
              {E ? (
                <>
                  <div className="form-field">
                    <label className="form-label">Origem da Investigação</label>
                    <select value={editOrigin} onChange={e => setOrigin(e.target.value as InvestigationOrigin | "")} className="form-input form-select">
                      <option value="">Não definida</option>
                      {Object.entries(INVESTIGATION_ORIGIN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Hipótese Criminal</label>
                    <textarea value={editHypothesis} onChange={e => setHypothesis(e.target.value)} rows={3} placeholder="Qual o crime investigado e a tese central…" className="form-input form-textarea" />
                  </div>
                </>
              ) : (
                <>
                  <InfoGrid>
                    <InfoItem label="Origem da Investigação" value={caso.investigationOrigin ? INVESTIGATION_ORIGIN_LABEL[caso.investigationOrigin] : null} />
                  </InfoGrid>
                  {caso.criminalHypothesis ? <InfoText label="Hipótese Criminal" value={caso.criminalHypothesis} /> : <EmptyInline message="Sem hipótese registrada." />}
                </>
              )}
            </div>

            <div className="form-section">
              <p className="form-section-title">Informações Investigativas</p>
              {E ? (
                <>
                  <div className="form-field">
                    <label className="form-label">Histórico</label>
                    <textarea value={editHistory} onChange={e => setEditHistory(e.target.value)} rows={4} placeholder="Histórico e origem do caso…" className="form-input form-textarea" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">O Que Se Sabe</label>
                    <textarea value={editFacts} onChange={e => setEditFacts(e.target.value)} rows={4} placeholder="Informações consolidadas…" className="form-input form-textarea" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">O Que Falta Confirmar</label>
                    <textarea value={editPending} onChange={e => setEditPending(e.target.value)} rows={3} placeholder="Hipóteses ainda não confirmadas…" className="form-input form-textarea" />
                  </div>
                </>
              ) : (
                <>
                  {caso.history && <InfoText label="Histórico" value={caso.history} />}
                  {caso.knownFacts && <InfoText label="O Que Se Sabe" value={caso.knownFacts} />}
                  {caso.pendingHypotheses && <InfoText label="O Que Falta Confirmar" value={caso.pendingHypotheses} />}
                  {!caso.history && !caso.knownFacts && !caso.pendingHypotheses && <EmptyInline message="Sem informações registradas." />}
                </>
              )}
            </div>

            <div className="form-section">
              <p className="form-section-title">Tipificações Penais</p>
              {E ? (
                <>
                  {editTyp.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {editTyp.map((t, i) => (
                        <span key={i} className="chip">
                          {t.offense}{t.law ? ` — ${t.law}` : ""}
                          <span className="x" onClick={() => setEditTyp(prev => prev.filter((_, j) => j !== i))}>×</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Crime / Infração</label>
                      <input type="text" value={typOffense} onChange={e => setTypOffense(e.target.value)} placeholder="Ex.: Tráfico de entorpecentes" className="form-input" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Lei / Artigo</label>
                      <input type="text" value={typLaw} onChange={e => setTypLaw(e.target.value)} placeholder="Ex.: Art. 33 da Lei 11.343/06" className="form-input" />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                    <button type="button" onClick={() => {
                      if (!typOffense.trim()) return;
                      setEditTyp(prev => [...prev, { offense: typOffense.trim(), law: typLaw.trim() || undefined }]);
                      setTypOffense(""); setTypLaw("");
                    }} className="btn-secondary btn-primary--sm">+ Adicionar tipificação</button>
                  </div>
                </>
              ) : (
                caso.penalTypifications.length > 0
                  ? <ChipList items={caso.penalTypifications.map(t => t.offense + (t.law ? ` — ${t.law}` : ""))} />
                  : <EmptyInline message="Sem tipificações penais." />
              )}
            </div>
          </div>
        )}

        {/* ── Tab 3: Alvos & Locais ── */}
        {tab === "alvos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Alvos do Caso — vínculo N→N com a base de alvos */}
            <div className="form-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <p className="form-section-title" style={{ marginBottom: 0 }}>Alvos do Caso</p>
                {E && <Link href="/alvos/novo" className="btn-secondary btn-primary--sm">+ Cadastrar novo alvo</Link>}
              </div>

              {E && (
                <div style={{ marginBottom: 16 }}>
                  <EntitySearchSelect<Target>
                    label="Adicionar alvo (busque por nome, apelido ou CPF)"
                    placeholder="Digite para buscar na base de alvos…"
                    searchUrl={q => `/api/defense/targets?search=${encodeURIComponent(q)}`}
                    getKey={t => t.id}
                    getPrimary={t => t.fullName}
                    getSecondary={t => `${t.cpf ?? "sem CPF"}${t.aliases.length > 0 ? ` · ${t.aliases[0]}` : ""}`}
                    isSelected={t => editTargets.some(l => l.targetId === t.id)}
                    selectedLabel="já vinculado"
                    onSelect={t => {
                      setEditTargets(prev => [...prev, { targetId: t.id, role: "outro" }]);
                      setTargetMap(prev => ({ ...prev, [t.id]: t }));
                    }}
                  />
                </div>
              )}

              {editTargets.length === 0 ? (
                <EmptyInline message="Nenhum alvo vinculado ao caso." />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data" style={{ width: "100%" }}>
                    <thead>
                      <tr><th>Alvo</th><th>CPF</th><th>Status</th><th>Risco</th><th>Função no caso</th>{E && <th style={{ width: 1 }}></th>}</tr>
                    </thead>
                    <tbody>
                      {editTargets.map((link, i) => {
                        const t = targetMap[link.targetId];
                        const statC = t?.status ? TARGET_STATUS_COLOR[t.status] : null;
                        const riskC = t?.riskLevel ? RISK_COLOR[t.riskLevel] : null;
                        return (
                          <tr key={link.targetId}>
                            <td style={{ fontWeight: 600, fontSize: 13 }}>
                              {t ? (
                                <Link href={`/alvos/${t.id}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{t.fullName}</Link>
                              ) : (
                                <span style={{ color: "var(--ink-400)" }}>Alvo removido</span>
                              )}
                            </td>
                            <td style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>{t?.cpf ?? <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                            <td>{statC && t?.status ? <span style={{ fontSize: 11, color: statC.color, background: statC.bg, padding: "2px 8px", borderRadius: 999 }}>{TARGET_STATUS_LABEL[t.status]}</span> : <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                            <td>{riskC && t?.riskLevel ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", color: riskC.color, background: riskC.bg, padding: "2px 8px", borderRadius: 999 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: riskC.color }} />{RISK_LEVEL_LABEL[t.riskLevel]}</span> : <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                            <td>
                              {E ? (
                                <select
                                  value={link.role}
                                  onChange={e => setEditTargets(prev => prev.map((l, j) => j === i ? { ...l, role: e.target.value as CaseTargetRole } : l))}
                                  className="form-input form-select"
                                  style={{ height: 32, fontSize: 12, minWidth: 130 }}
                                >
                                  {Object.entries(CASE_TARGET_ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                              ) : (
                                <span className="chip" style={{ fontSize: 11 }}>{roleOf(link)}</span>
                              )}
                            </td>
                            {E && (
                              <td>
                                <button onClick={() => setEditTargets(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "4px 9px", cursor: "pointer" }}>×</button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Locais de Interesse */}
            <div className="form-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p className="form-section-title" style={{ marginBottom: 0 }}>Locais de Interesse</p>
                {E && (
                  <button onClick={() => setShowLocForm(v => !v)} className="btn-secondary btn-primary--sm">
                    {showLocForm ? "Cancelar" : "+ Adicionar local"}
                  </button>
                )}
              </div>
              {E && showLocForm && (
                <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 16, marginBottom: 16 }}>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Tipo</label>
                      <select value={newLoc.type ?? "outro"} onChange={e => setNewLoc(p => ({ ...p, type: e.target.value as LocationType }))} className="form-input form-select">
                        {Object.entries(LOCATION_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Finalidade Suspeita *</label>
                      <input type="text" value={newLoc.suspectedPurpose ?? ""} onChange={e => setNewLoc(p => ({ ...p, suspectedPurpose: e.target.value }))} className="form-input" placeholder="Ex.: Armazenamento de drogas" />
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Endereço</label>
                      <input type="text" value={newLoc.address ?? ""} onChange={e => setNewLoc(p => ({ ...p, address: e.target.value }))} className="form-input" placeholder="Rua, número…" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Cidade / UF</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input type="text" value={newLoc.city ?? ""} onChange={e => setNewLoc(p => ({ ...p, city: e.target.value }))} className="form-input" placeholder="Cidade" style={{ flex: 2 }} />
                        <input type="text" value={newLoc.state ?? ""} onChange={e => setNewLoc(p => ({ ...p, state: e.target.value }))} className="form-input" placeholder="UF" style={{ flex: 1 }} maxLength={2} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => { setShowLocForm(false); setNewLoc({ type: "outro", relatedTargetIds: [] }); }} className="btn-secondary btn-primary--sm">Cancelar</button>
                    <button type="button" onClick={() => {
                      if (!newLoc.suspectedPurpose?.trim()) return;
                      setEditLocs(prev => [...prev, { ...newLoc, relatedTargetIds: [] } as CaseLocation]);
                      setNewLoc({ type: "outro", relatedTargetIds: [] });
                      setShowLocForm(false);
                    }} className="btn-primary btn-primary--sm">Adicionar</button>
                  </div>
                </div>
              )}
              {editLocations.length === 0 ? (
                <EmptyInline message="Nenhum local adicionado." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {editLocations.map((loc, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <span className="chip" style={{ fontSize: 11 }}>{LOCATION_TYPE_LABEL[loc.type]}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-ui)" }}>{loc.suspectedPurpose}</span>
                        </div>
                        {(loc.address || loc.city) && (
                          <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>
                            {[loc.address, loc.city, loc.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      {E && <button onClick={() => setEditLocs(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}>×</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 4: Modus & Rede ── */}
        {tab === "modus" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-section">
              <p className="form-section-title">Modus Operandi</p>
              {E ? (
                <>
                  <div className="form-field">
                    <label className="form-label">Descrição Geral</label>
                    <textarea value={editModus} onChange={e => setEditModus(e.target.value)} rows={3} placeholder="Padrões operacionais identificados…" className="form-input form-textarea" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Canais de Comunicação</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      {COMM_OPTIONS.map(opt => (
                        <button key={opt} type="button"
                          onClick={() => setEditComm(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])}
                          className={`chip${editComm.includes(opt) ? " chip--active" : ""}`}
                          style={{ cursor: "pointer", border: "none" }}
                        >{opt}</button>
                      ))}
                    </div>
                    <ChipsField label="" values={editComm.filter(c => !COMM_OPTIONS.includes(c))} onChange={custom => setEditComm([...editComm.filter(c => COMM_OPTIONS.includes(c)), ...custom])} placeholder="Outro canal…" />
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Logística</label>
                      <textarea value={editLogistics} onChange={e => setLogistics(e.target.value)} rows={3} placeholder="Rotas, transporte, armazenamento…" className="form-input form-textarea" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Financeiro</label>
                      <textarea value={editFinancial} onChange={e => setFinancial(e.target.value)} rows={3} placeholder="Fluxo financeiro, lavagem, contas…" className="form-input form-textarea" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {caso.modusOperandi ? <InfoText label="Descrição Geral" value={caso.modusOperandi} /> : null}
                  {caso.modusCommunication.length > 0 && <ChipList label="Canais de Comunicação" items={caso.modusCommunication} />}
                  {caso.modusLogistics ? <InfoText label="Logística" value={caso.modusLogistics} /> : null}
                  {caso.modusFinancial ? <InfoText label="Financeiro" value={caso.modusFinancial} /> : null}
                  {!caso.modusOperandi && caso.modusCommunication.length === 0 && !caso.modusLogistics && !caso.modusFinancial && <EmptyInline message="Sem modus operandi registrado." />}
                </>
              )}
            </div>

            <div className="form-section">
              <p className="form-section-title">Rede de Relacionamentos</p>
              {editRelations.length > 0 ? (
                <div style={{ overflowX: "auto", marginBottom: E ? 12 : 0 }}>
                  <table className="data" style={{ width: "100%" }}>
                    <thead>
                      <tr><th>Origem</th><th>Destino</th><th>Tipo de Relação</th><th>Frequência</th>{E && <th style={{ width: 1 }}></th>}</tr>
                    </thead>
                    <tbody>
                      {editRelations.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 13 }}>{r.sourceName}</td>
                          <td style={{ fontSize: 13 }}>{r.targetName}</td>
                          <td><span className="chip" style={{ fontSize: 11 }}>{r.relationshipType}</span></td>
                          <td style={{ fontSize: 12, color: "var(--ink-500)" }}>{r.frequency ?? <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                          {E && <td><button onClick={() => setRelations(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "2px 8px", cursor: "pointer" }}>×</button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!E && <EmptyInline message="Sem relacionamentos mapeados." />)}
              {E && (
                <>
                  <div className="form-row form-row-2" style={{ marginBottom: 8 }}>
                    <div className="form-field">
                      <label className="form-label">Origem</label>
                      <input type="text" value={newRel.sourceName ?? ""} onChange={e => setNewRel(p => ({ ...p, sourceName: e.target.value }))} className="form-input" placeholder="Nome do origem" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Destino</label>
                      <input type="text" value={newRel.targetName ?? ""} onChange={e => setNewRel(p => ({ ...p, targetName: e.target.value }))} className="form-input" placeholder="Nome do destino" />
                    </div>
                  </div>
                  <div className="form-row form-row-2" style={{ marginBottom: 8 }}>
                    <div className="form-field">
                      <label className="form-label">Tipo de Relação</label>
                      <input type="text" value={newRel.relationshipType ?? ""} onChange={e => setNewRel(p => ({ ...p, relationshipType: e.target.value }))} className="form-input" placeholder="Ex.: Financeiro, Familiar" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Frequência</label>
                      <input type="text" value={newRel.frequency ?? ""} onChange={e => setNewRel(p => ({ ...p, frequency: e.target.value }))} className="form-input" placeholder="Ex.: Semanal" />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => {
                      if (!newRel.sourceName?.trim() || !newRel.targetName?.trim() || !newRel.relationshipType?.trim()) return;
                      setRelations(prev => [...prev, newRel as CaseRelationship]);
                      setNewRel({});
                    }} className="btn-secondary btn-primary--sm">+ Adicionar relação</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 5: Timeline & Evidências ── */}
        {tab === "timeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="form-section">
              <p className="form-section-title">Linha do Tempo</p>
              {E && (
                <>
                  <div className="form-row form-row-2" style={{ marginBottom: 8 }}>
                    <div className="form-field">
                      <label className="form-label">Data</label>
                      <input type="date" value={tlDate} onChange={e => setTlDate(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Evento *</label>
                      <input type="text" value={tlEvent} onChange={e => setTlEvent(e.target.value)} placeholder="Descreva o evento…" className="form-input"
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTimeline(); } }} />
                    </div>
                  </div>
                  {tlError && <div className="alert alert--danger" style={{ marginBottom: 8 }}><span>{tlError}</span></div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                    <button onClick={addTimeline} disabled={addingTl} className="btn-primary btn-primary--sm">
                      {addingTl ? "Adicionando…" : "+ Evento"}
                    </button>
                  </div>
                </>
              )}
              {sortedTimeline.length === 0 ? (
                <EmptyInline message="Nenhum evento registrado." />
              ) : (
                <div className="timeline">
                  {sortedTimeline.map((ev, i) => (
                    <div key={i} className="timeline-item">
                      <span className="timeline-date">{new Date(ev.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                      <div>
                        <p className="timeline-event">{ev.event}</p>
                        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", marginTop: 4 }}>
                          {ev.addedByEmail} · {new Date(ev.addedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <p className="form-section-title">Evidências</p>
              {E && (
                <>
                  <div className="form-row form-row-2" style={{ marginBottom: 8 }}>
                    <div className="form-field">
                      <label className="form-label">Tipo</label>
                      <select value={evType} onChange={e => setEvType(e.target.value as EvidenceType)} className="form-input form-select">
                        {Object.entries(EVIDENCE_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Descrição *</label>
                      <input type="text" value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder="Descreva a evidência…" className="form-input" />
                    </div>
                  </div>
                  <div className="form-field" style={{ marginBottom: 8 }}>
                    <label className="form-label">Anexos</label>
                    <ImageUploader images={evAtt} category="evidence" onAdd={url => setEvAtt(p => [...p, url])} onRemove={i => setEvAtt(p => p.filter((_, j) => j !== i))} />
                  </div>
                  {evError && <div className="alert alert--danger" style={{ marginBottom: 8 }}><span>{evError}</span></div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                    <button onClick={addEvidence} disabled={addingEv} className="btn-primary btn-primary--sm">
                      {addingEv ? "Adicionando…" : "+ Evidência"}
                    </button>
                  </div>
                </>
              )}
              {(caso.evidences ?? []).length === 0 ? (
                <EmptyInline message="Nenhuma evidência registrada." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(["documental", "digital", "audiovisual", "testemunhal"] as EvidenceType[]).map(type => {
                    const group = (caso.evidences ?? []).filter(e => e.type === type);
                    if (group.length === 0) return null;
                    return (
                      <div key={type} className="evidence-card">
                        <span className="evidence-badge">{EVIDENCE_TYPE_LABEL[type]}</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {group.map((ev, i) => (
                            <div key={i} style={{ borderTop: i > 0 ? "1px solid var(--line)" : "none", paddingTop: i > 0 ? 10 : 0 }}>
                              <p style={{ fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-ui)", lineHeight: 1.5 }}>{ev.description}</p>
                              <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", marginTop: 4 }}>
                                {ev.addedByEmail} · {new Date(ev.addedAt).toLocaleString("pt-BR")}
                              </p>
                              {ev.attachments.length > 0 && (
                                <div className="img-gallery" style={{ marginTop: 8 }}>
                                  {ev.attachments.map((url, j) => (
                                    <div key={j} className="img-thumb">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={url} alt="" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 6: Inteligência ── */}
        {tab === "inteligencia" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="form-section">
              <p className="form-section-title">Produtos de Inteligência</p>
              {E && (
                <>
                  <div className="form-row form-row-2" style={{ marginBottom: 8 }}>
                    <div className="form-field">
                      <label className="form-label">Tipo</label>
                      <select value={intelType} onChange={e => setIntelType(e.target.value as IntelProductType)} className="form-input form-select">
                        {Object.entries(INTEL_PRODUCT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Título *</label>
                      <input type="text" value={intelTitle} onChange={e => setIntelTitle(e.target.value)} placeholder="Título do produto…" className="form-input" />
                    </div>
                  </div>
                  <div className="form-field" style={{ marginBottom: 8 }}>
                    <label className="form-label">Descrição</label>
                    <textarea value={intelDesc} onChange={e => setIntelDesc(e.target.value)} rows={3} placeholder="Sumário ou observações…" className="form-input form-textarea" />
                  </div>
                  <div className="form-field" style={{ marginBottom: 8 }}>
                    <label className="form-label">Anexos</label>
                    <ImageUploader images={intelAtt} category="intelligence" onAdd={url => setIntelAtt(p => [...p, url])} onRemove={i => setIntelAtt(p => p.filter((_, j) => j !== i))} />
                  </div>
                  {intelError && <div className="alert alert--danger" style={{ marginBottom: 8 }}><span>{intelError}</span></div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                    <button onClick={addIntelligence} disabled={addingIntel} className="btn-primary btn-primary--sm">
                      {addingIntel ? "Adicionando…" : "+ Produto"}
                    </button>
                  </div>
                </>
              )}
              {(caso.intelligenceProducts ?? []).length === 0 ? (
                <EmptyInline message="Nenhum produto de inteligência registrado." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(caso.intelligenceProducts ?? []).map((prod, i) => (
                    <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px", borderLeft: "3px solid var(--accent)" }}>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--accent)", display: "block", marginBottom: 4 }}>
                        {INTEL_PRODUCT_LABEL[prod.type]}
                      </span>
                      <p style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-ui)", color: "var(--ink-800)" }}>{prod.title}</p>
                      {prod.description && <p style={{ fontSize: 13, color: "var(--ink-600)", fontFamily: "var(--font-ui)", marginTop: 4, lineHeight: 1.5 }}>{prod.description}</p>}
                      <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", marginTop: 8 }}>
                        {prod.addedByEmail} · {new Date(prod.addedAt).toLocaleString("pt-BR")}
                      </p>
                      {prod.attachments.length > 0 && (
                        <div className="img-gallery" style={{ marginTop: 10 }}>
                          {prod.attachments.map((url, j) => (
                            <div key={j} className="img-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <p className="form-section-title">Notas do Analista</p>
              {E ? (
                <div className="form-field">
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={8} placeholder="Observações, insights e notas internas sobre o caso…" className="form-input form-textarea" />
                </div>
              ) : (
                caso.notes ? <InfoText value={caso.notes} /> : <EmptyInline message="Sem notas registradas." />
              )}
            </div>

            <div className="form-section">
              <p className="form-section-title">Cadeia de Custódia</p>
              {E && (
                <>
                  <div className="form-field" style={{ marginBottom: 8 }}>
                    <label className="form-label">Descrição *</label>
                    <textarea value={custDesc} onChange={e => setCustDesc(e.target.value)} rows={3} placeholder="Descreva a evidência, ação ou transferência de custódia…" className="form-input form-textarea" />
                  </div>
                  <div className="form-field" style={{ marginBottom: 8 }}>
                    <label className="form-label">Anexos</label>
                    <ImageUploader images={custAtt} category="custody" onAdd={url => setCustAtt(p => [...p, url])} onRemove={i => setCustAtt(p => p.filter((_, j) => j !== i))} />
                  </div>
                  {custError && <div className="alert alert--danger" style={{ marginBottom: 8 }}><span>{custError}</span></div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                    <button onClick={addCustody} disabled={addingCust} className="btn-primary btn-primary--sm">
                      {addingCust ? "Adicionando…" : "Adicionar entrada"}
                    </button>
                  </div>
                </>
              )}
              {sortedChain.length === 0 ? (
                <EmptyInline message="Nenhuma entrada na cadeia de custódia." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sortedChain.map((entry, i) => (
                    <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                        <p style={{ fontSize: 13, fontFamily: "var(--font-ui)", color: "var(--ink-700)", lineHeight: 1.5 }}>{entry.description}</p>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {new Date(entry.addedAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      {entry.addedByEmail && <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-500)" }}>{entry.addedByEmail}</p>}
                      {entry.attachments?.length > 0 && (
                        <div className="img-gallery" style={{ marginTop: 10 }}>
                          {entry.attachments.map((url, j) => (
                            <div key={j} className="img-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Barra de ação (modo edição) */}
        {E && (
          <div style={{ display: "flex", gap: 10, paddingTop: 16, marginTop: 4, borderTop: "1px solid var(--line)" }}>
            <button onClick={saveAll} disabled={savingAll} className="btn-primary" style={{ flex: 1, justifyContent: "center", opacity: savingAll ? 0.7 : 1 }}>
              {savingAll ? "Salvando…" : "Salvar Alterações"}
            </button>
            <button onClick={cancelEdit} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Metadata footer */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 24px", padding: "12px 16px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", borderTop: "1px solid var(--line)" }}>
        <span>Criado por {caso.createdByEmail} em {new Date(caso.createdAt).toLocaleDateString("pt-BR")}</span>
        <span>·</span>
        <span>Atualizado em {new Date(caso.updatedAt).toLocaleDateString("pt-BR")}</span>
        {caso.responsibleBy && <><span>·</span><span>Responsável: {caso.responsibleBy}</span></>}
      </div>
    </div>
  );
}

/* ── Componentes de leitura (somente visualização) ── */

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))", gap: "12px 24px" }}>{children}</div>;
}

function InfoItem({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: value ? "var(--ink-700)" : "var(--ink-300)", fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)", overflowWrap: "break-word", wordBreak: "break-word" }}>{value ?? "—"}</p>
    </div>
  );
}

function InfoText({ label, value }: { label?: string; value: string }) {
  return (
    <div>
      {label && <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>{label}</p>}
      <p style={{ fontSize: 14, color: "var(--ink-700)", fontFamily: "var(--font-ui)", lineHeight: 1.65, whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

function ChipList({ label, items }: { label?: string; items: string[] }) {
  return (
    <div>
      {label && <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 }}>{label}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((t, i) => <span key={i} className="chip" style={{ fontSize: 12 }}>{t}</span>)}
      </div>
    </div>
  );
}

function EmptyInline({ message }: { message: string }) {
  return <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>{message}</p>;
}
