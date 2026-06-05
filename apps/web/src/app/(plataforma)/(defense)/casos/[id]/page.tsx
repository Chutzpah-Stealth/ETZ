"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../../lib/auth";
import { ImageUploader } from "../../_components/ImageUploader";
import type {
  Case, CaseStatus, ClassificationLevel, Target, RiskLevel, TargetStatus,
  InvestigationOrigin, CaseTargetRole, CaseTargetPriority, CaseTargetStatus,
  LocationType, EvidenceType, IntelProductType, ConfidenceLevel,
  PenalTypification, CaseTarget, CaseLocation, CaseRelationship,
} from "@etz/shared-types";
import {
  CASE_STATUS_LABEL, CLASSIFICATION_LABEL, RISK_LEVEL_LABEL, TARGET_STATUS_LABEL,
  INVESTIGATION_ORIGIN_LABEL, CASE_TARGET_ROLE_LABEL, CASE_TARGET_PRIORITY_LABEL,
  CASE_TARGET_STATUS_LABEL, LOCATION_TYPE_LABEL, EVIDENCE_TYPE_LABEL,
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

const CASE_TGT_STATUS_COLOR: Record<CaseTargetStatus, { color: string; bg: string }> = {
  monitorado:      { color: "#0f8f8f", bg: "#e0f5f5" },
  preso:           { color: "#49515f", bg: "#e8ebf0" },
  foragido:        { color: "#c4392f", bg: "#fbe8e6" },
  sem_localizacao: { color: "#8a909d", bg: "#f1f3f6" },
};

const PRIORITY_COLOR: Record<CaseTargetPriority, { color: string; bg: string }> = {
  alto:  { color: "#c4392f", bg: "#fbe8e6" },
  medio: { color: "#b5740d", bg: "#fbf0db" },
  baixo: { color: "#1f8a52", bg: "#e7f4ec" },
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

  const [caso, setCaso]         = useState<Case | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>("visao");
  const [error, setError]       = useState("");
  const [deleting, setDeleting] = useState(false);

  const isDirty = useRef(false);

  function handleBack() {
    if (!isDirty.current || window.confirm("Há alterações não salvas nesta aba. Deseja sair sem salvar?")) {
      isDirty.current = false;
      router.push("/casos");
    }
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
  const [savingVisao, setSavingVisao] = useState(false);

  // Tab 2
  const [editOrigin, setOrigin]         = useState<InvestigationOrigin | "">("");
  const [editHypothesis, setHypothesis] = useState("");
  const [editHistory, setEditHistory]   = useState("");
  const [editFacts, setEditFacts]       = useState("");
  const [editPending, setEditPending]   = useState("");
  const [editTyp, setEditTyp]           = useState<PenalTypification[]>([]);
  const [typOffense, setTypOffense]     = useState("");
  const [typLaw, setTypLaw]             = useState("");
  const [savingCtx, setSavingCtx]       = useState(false);

  // Tab 3
  const [editTargets, setEditTargets]   = useState<CaseTarget[]>([]);
  const [editLocations, setEditLocs]    = useState<CaseLocation[]>([]);
  const [showTgtForm, setShowTgtForm]   = useState(false);
  const [showLocForm, setShowLocForm]   = useState(false);
  const [newTgt, setNewTgt]             = useState<Partial<CaseTarget>>({ role: "outro", priority: "medio", currentStatus: "sem_localizacao" });
  const [newLoc, setNewLoc]             = useState<Partial<CaseLocation>>({ type: "outro", relatedTargetIds: [] });
  const [linkedTargets, setLinkedTargets] = useState<Target[]>([]);
  const [loadingTargets, setLoadingT]   = useState(false);
  const [savingAlvos, setSavingAlvos]   = useState(false);

  // Tab 4
  const [editComm, setEditComm]       = useState<string[]>([]);
  const [editLogistics, setLogistics] = useState("");
  const [editFinancial, setFinancial] = useState("");
  const [editModus, setEditModus]     = useState("");
  const [editRelations, setRelations] = useState<CaseRelationship[]>([]);
  const [newRel, setNewRel]           = useState<Partial<CaseRelationship>>({});
  const [savingModus, setSavingModus] = useState(false);

  // Tab 5
  const [tlDate, setTlDate]   = useState("");
  const [tlEvent, setTlEvent] = useState("");
  const [addingTl, setAddingTl] = useState(false);
  const [tlError, setTlError]   = useState("");
  const [evType, setEvType]     = useState<EvidenceType>("documental");
  const [evDesc, setEvDesc]     = useState("");
  const [evAtt, setEvAtt]       = useState<string[]>([]);
  const [addingEv, setAddingEv] = useState(false);
  const [evError, setEvError]   = useState("");

  // Tab 6
  const [intelType, setIntelType]     = useState<IntelProductType>("relatorio");
  const [intelTitle, setIntelTitle]   = useState("");
  const [intelDesc, setIntelDesc]     = useState("");
  const [intelAtt, setIntelAtt]       = useState<string[]>([]);
  const [addingIntel, setAddingIntel] = useState(false);
  const [intelError, setIntelError]   = useState("");
  const [editNotes, setEditNotes]     = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
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

  async function loadCase() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/defense/cases/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { router.replace("/casos"); return; }
      const data: Case = await res.json();
      setCaso(data);
      populate(data);
    } catch { router.replace("/casos"); }
    finally { setLoading(false); }
  }

  async function loadTargets() {
    if (loadingTargets) return;
    setLoadingT(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/defense/targets?caseId=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setLinkedTargets(res.ok ? await res.json() : []);
    } catch { setLinkedTargets([]); }
    finally { setLoadingT(false); }
  }

  useEffect(() => { loadCase(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab === "alvos" && linkedTargets.length === 0 && !loadingTargets) loadTargets();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function saveVisao() {
    if (!editName.trim()) return;
    setSavingVisao(true); setError("");
    try { isDirty.current = false;
      await patchCase({
        name: editName.trim(), caseNumber: editCaseNum.trim() || null,
        openedAt: editOpenedAt || null, responsibleBy: editResp.trim() || null,
        status: editStatus, classification: editCls || null,
        operationAreas: editAreas, team: editTeam, partnerAgencies: editAgencies,
        currentSituation: editSituation.trim() || null,
        confidenceLevel: editConfidence || null, nextSteps: editNextSteps,
      });
    } catch { setError("Erro ao salvar."); }
    finally { setSavingVisao(false); }
  }

  async function saveContexto() {
    setSavingCtx(true); setError("");
    try { isDirty.current = false;
      await patchCase({
        investigationOrigin: editOrigin || null,
        criminalHypothesis: editHypothesis.trim() || null,
        history: editHistory.trim() || null,
        knownFacts: editFacts.trim() || null,
        pendingHypotheses: editPending.trim() || null,
        penalTypifications: editTyp,
      });
    } catch { setError("Erro ao salvar."); }
    finally { setSavingCtx(false); }
  }

  async function saveAlvos() {
    setSavingAlvos(true); setError("");
    try { isDirty.current = false; await patchCase({ caseTargets: editTargets, locations: editLocations }); }
    catch { setError("Erro ao salvar."); }
    finally { setSavingAlvos(false); }
  }

  async function saveModus() {
    setSavingModus(true); setError("");
    try { isDirty.current = false;
      await patchCase({
        modusCommunication: editComm, modusLogistics: editLogistics.trim() || null,
        modusFinancial: editFinancial.trim() || null, modusOperandi: editModus.trim() || null,
        relationships: editRelations,
      });
    } catch { setError("Erro ao salvar."); }
    finally { setSavingModus(false); }
  }

  async function saveNotes() {
    setSavingNotes(true); setError("");
    try { isDirty.current = false; await patchCase({ notes: editNotes.trim() || null }); }
    catch { setError("Erro ao salvar notas."); }
    finally { setSavingNotes(false); }
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
    if (!caso || !confirm(`Excluir caso "${caso.name}"? Esta ação é irreversível.`)) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await fetch(`/api/defense/cases/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      router.replace("/casos");
    } catch { setDeleting(false); }
  }

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
            <button onClick={handleDelete} disabled={deleting} className="btn-danger btn-primary--sm">
              {deleting ? "Excluindo…" : "Excluir"}
            </button>
          </div>
        </div>
        <div className="tabs" style={{ marginTop: 4 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} className={`tab${tab === key ? " tab--active" : ""}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="target-detail-content" onInput={() => { isDirty.current = true; }}>
        {error && <div className="alert alert--danger" style={{ marginBottom: 12 }}><span>{error}</span></div>}

        {/* ── Tab 1: Visão Geral ── */}
        {tab === "visao" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-section">
              <p className="form-section-title">Identificação</p>
              <div className="form-row form-row-2">
                <div className="form-field">
                  <label className="form-label">Nome do Caso</label>
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
            </div>

            <div className="form-section">
              <p className="form-section-title">Avaliação Atual</p>
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
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveVisao} disabled={savingVisao} className="btn-primary">
                {savingVisao ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: Contexto ── */}
        {tab === "contexto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-section">
              <p className="form-section-title">Origem e Hipótese</p>
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
            </div>

            <div className="form-section">
              <p className="form-section-title">Informações Investigativas</p>
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
            </div>

            <div className="form-section">
              <p className="form-section-title">Tipificações Penais</p>
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
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveContexto} disabled={savingCtx} className="btn-primary">
                {savingCtx ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 3: Alvos & Locais ── */}
        {tab === "alvos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Alvos do Caso (manual) */}
            <div className="form-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p className="form-section-title" style={{ marginBottom: 0 }}>Alvos do Caso</p>
                <button onClick={() => setShowTgtForm(v => !v)} className="btn-secondary btn-primary--sm">
                  {showTgtForm ? "Cancelar" : "+ Adicionar alvo"}
                </button>
              </div>
              {showTgtForm && (
                <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 16, marginBottom: 16 }}>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Nome *</label>
                      <input type="text" value={newTgt.name ?? ""} onChange={e => setNewTgt(p => ({ ...p, name: e.target.value }))} className="form-input" placeholder="Nome completo" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Alcunha</label>
                      <input type="text" value={newTgt.alias ?? ""} onChange={e => setNewTgt(p => ({ ...p, alias: e.target.value }))} className="form-input" placeholder="Apelido" />
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Função</label>
                      <select value={newTgt.role ?? "outro"} onChange={e => setNewTgt(p => ({ ...p, role: e.target.value as CaseTargetRole }))} className="form-input form-select">
                        {Object.entries(CASE_TARGET_ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Prioridade</label>
                      <select value={newTgt.priority ?? "medio"} onChange={e => setNewTgt(p => ({ ...p, priority: e.target.value as CaseTargetPriority }))} className="form-input form-select">
                        {Object.entries(CASE_TARGET_PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-field">
                      <label className="form-label">Status</label>
                      <select value={newTgt.currentStatus ?? "sem_localizacao"} onChange={e => setNewTgt(p => ({ ...p, currentStatus: e.target.value as CaseTargetStatus }))} className="form-input form-select">
                        {Object.entries(CASE_TARGET_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Cidade / UF</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input type="text" value={newTgt.city ?? ""} onChange={e => setNewTgt(p => ({ ...p, city: e.target.value }))} className="form-input" placeholder="Cidade" style={{ flex: 2 }} />
                        <input type="text" value={newTgt.state ?? ""} onChange={e => setNewTgt(p => ({ ...p, state: e.target.value }))} className="form-input" placeholder="UF" style={{ flex: 1 }} maxLength={2} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => { setShowTgtForm(false); setNewTgt({ role: "outro", priority: "medio", currentStatus: "sem_localizacao" }); }} className="btn-secondary btn-primary--sm">Cancelar</button>
                    <button type="button" onClick={() => {
                      if (!newTgt.name?.trim()) return;
                      setEditTargets(prev => [...prev, newTgt as CaseTarget]);
                      setNewTgt({ role: "outro", priority: "medio", currentStatus: "sem_localizacao" });
                      setShowTgtForm(false);
                    }} className="btn-primary btn-primary--sm">Adicionar</button>
                  </div>
                </div>
              )}
              {editTargets.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "20px 0" }}>Nenhum alvo adicionado ao caso.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data" style={{ width: "100%" }}>
                    <thead>
                      <tr><th>Nome</th><th>Alcunha</th><th>Função</th><th>Prioridade</th><th>Status</th><th>Cidade/UF</th><th style={{ width: 1 }}></th></tr>
                    </thead>
                    <tbody>
                      {editTargets.map((t, i) => {
                        const prioC = PRIORITY_COLOR[t.priority];
                        const statC = CASE_TGT_STATUS_COLOR[t.currentStatus];
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</td>
                            <td>{t.alias ? <span style={{ fontSize: 12, color: "var(--ink-500)" }}>{t.alias}</span> : <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                            <td><span className="chip" style={{ fontSize: 11 }}>{CASE_TARGET_ROLE_LABEL[t.role]}</span></td>
                            <td>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", color: prioC.color, background: prioC.bg, padding: "2px 8px", borderRadius: 999 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: prioC.color }} />{CASE_TARGET_PRIORITY_LABEL[t.priority]}
                              </span>
                            </td>
                            <td><span style={{ fontSize: 11, color: statC.color, background: statC.bg, padding: "2px 8px", borderRadius: 999 }}>{CASE_TARGET_STATUS_LABEL[t.currentStatus]}</span></td>
                            <td style={{ fontSize: 12, color: "var(--ink-500)" }}>{t.city || t.state ? `${t.city ?? ""}${t.city && t.state ? "/" : ""}${t.state ?? ""}` : <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                            <td>
                              <button onClick={() => setEditTargets(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "2px 8px", cursor: "pointer" }}>×</button>
                            </td>
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
                <button onClick={() => setShowLocForm(v => !v)} className="btn-secondary btn-primary--sm">
                  {showLocForm ? "Cancelar" : "+ Adicionar local"}
                </button>
              </div>
              {showLocForm && (
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
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "20px 0" }}>Nenhum local adicionado.</p>
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
                      <button onClick={() => setEditLocs(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alvos vinculados do módulo Alvos */}
            <div className="form-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <p className="form-section-title" style={{ marginBottom: 0 }}>Alvos Vinculados</p>
                <Link href="/alvos" className="btn-secondary btn-primary--sm">Gerenciar alvos</Link>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-500)", fontFamily: "var(--font-ui)", marginBottom: 12 }}>Perfis do módulo Alvos com este caso referenciado.</p>
              {loadingTargets ? (
                <p style={{ fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</p>
              ) : linkedTargets.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "12px 0" }}>Nenhum alvo vinculado.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {linkedTargets.map(t => {
                    const riskC = t.riskLevel ? RISK_COLOR[t.riskLevel] : null;
                    const statC = t.status ? TARGET_STATUS_COLOR[t.status] : null;
                    return (
                      <Link key={t.id} href={`/alvos/${t.id}`} className="target-card">
                        <div className="photo">
                          {t.photos?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.photos[0]} alt={t.fullName} />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-300)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="8" r="4.5"/><path d="M3 21c0-4.5 4-8 9-8s9 3.5 9 8"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="name">{t.fullName}</p>
                          <div className="meta">
                            {statC && t.status && <span style={{ color: statC.color, background: statC.bg, fontSize: 11, padding: "2px 8px", borderRadius: 999, fontFamily: "var(--font-ui)", fontWeight: 500 }}>{TARGET_STATUS_LABEL[t.status]}</span>}
                            {t.cpf && <span className="id">{t.cpf}</span>}
                          </div>
                        </div>
                        <div className="right">
                          {riskC && t.riskLevel && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: riskC.color, background: riskC.bg, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: riskC.color }} />{RISK_LEVEL_LABEL[t.riskLevel]}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveAlvos} disabled={savingAlvos} className="btn-primary">
                {savingAlvos ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 4: Modus & Rede ── */}
        {tab === "modus" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-section">
              <p className="form-section-title">Modus Operandi</p>
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
            </div>

            <div className="form-section">
              <p className="form-section-title">Rede de Relacionamentos</p>
              {editRelations.length > 0 && (
                <div style={{ overflowX: "auto", marginBottom: 12 }}>
                  <table className="data" style={{ width: "100%" }}>
                    <thead>
                      <tr><th>Origem</th><th>Destino</th><th>Tipo de Relação</th><th>Frequência</th><th style={{ width: 1 }}></th></tr>
                    </thead>
                    <tbody>
                      {editRelations.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 13 }}>{r.sourceName}</td>
                          <td style={{ fontSize: 13 }}>{r.targetName}</td>
                          <td><span className="chip" style={{ fontSize: 11 }}>{r.relationshipType}</span></td>
                          <td style={{ fontSize: 12, color: "var(--ink-500)" }}>{r.frequency ?? <span style={{ color: "var(--ink-300)" }}>—</span>}</td>
                          <td><button onClick={() => setRelations(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "2px 8px", cursor: "pointer" }}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveModus} disabled={savingModus} className="btn-primary">
                {savingModus ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 5: Timeline & Evidências ── */}
        {tab === "timeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="form-section">
              <p className="form-section-title">Linha do Tempo</p>
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
              {sortedTimeline.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "20px 0" }}>Nenhum evento registrado.</p>
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
              {(caso.evidences ?? []).length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "20px 0" }}>Nenhuma evidência registrada.</p>
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
              {(caso.intelligenceProducts ?? []).length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "20px 0" }}>Nenhum produto de inteligência registrado.</p>
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
              <div className="form-field">
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={8} placeholder="Observações, insights e notas internas sobre o caso…" className="form-input form-textarea" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={saveNotes} disabled={savingNotes} className="btn-primary btn-primary--sm">
                  {savingNotes ? "Salvando…" : "Salvar notas"}
                </button>
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">Cadeia de Custódia</p>
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
              {sortedChain.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "20px 0" }}>Nenhuma entrada na cadeia de custódia.</p>
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
