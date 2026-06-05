"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../../lib/auth";
import type { ClassificationLevel } from "@etz/shared-types";
import { CLASSIFICATION_LABEL, CASE_STATUS_LABEL } from "@etz/shared-types";

const CLASSIFICATIONS = Object.entries(CLASSIFICATION_LABEL) as [ClassificationLevel, string][];

function ChipsInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function add(raw: string) {
    const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
    onChange([...values, ...parts.filter(p => !values.includes(p))]);
    setInput("");
  }

  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
        }}
        onBlur={() => input.trim() && add(input)}
        placeholder={placeholder}
        className="form-input"
      />
      {values.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {values.map(v => (
            <span key={v} className="chip">
              {v}
              <span className="x" onClick={() => onChange(values.filter(x => x !== v))}>×</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NovoCasoPage() {
  const router = useRouter();

  const [name, setName]               = useState("");
  const [caseNumber, setCaseNumber]   = useState("");
  const [openedAt, setOpenedAt]       = useState("");
  const [responsibleBy, setResp]      = useState("");
  const [status, setStatus]           = useState<"em_andamento" | "arquivado" | "finalizado">("em_andamento");
  const [classification, setClass]    = useState<ClassificationLevel | "">("");
  const [operationAreas, setAreas]    = useState<string[]>([]);
  const [team, setTeam]               = useState<string[]>([]);
  const [partnerAgencies, setAgencies]= useState<string[]>([]);
  const [history, setHistory]         = useState("");
  const [knownFacts, setKnownFacts]   = useState("");
  const [modusOperandi, setModus]     = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("O nome do caso é obrigatório."); return; }
    setSubmitting(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/defense/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:            name.trim(),
          caseNumber:      caseNumber.trim() || null,
          openedAt:        openedAt          || null,
          responsibleBy:   responsibleBy.trim() || null,
          status,
          classification:  classification || null,
          operationAreas,
          team,
          partnerAgencies,
          history:         history.trim()       || null,
          knownFacts:      knownFacts.trim()    || null,
          modusOperandi:   modusOperandi.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar caso.");
        return;
      }
      const created = await res.json();
      router.push(`/casos/${created.id}`);
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
            ETZ Defense · Casos
          </p>
          <h1>Novo Caso</h1>
        </div>
        <Link href="/casos" className="btn-secondary btn-primary--sm">← Casos</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Identificação */}
        <div className="form-section">
          <p className="form-section-title">Identificação</p>

          <div className="form-row form-row-2">
            <div className="form-field">
              <label className="form-label">Nome do Caso *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex.: Operação Cerco Duplo"
                className="form-input"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Número do Caso</label>
              <input
                type="text"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
                placeholder="Ex.: 2024/001-PC"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row form-row-2">
            <div className="form-field">
              <label className="form-label">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="form-input form-select">
                {Object.entries(CASE_STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Data de Abertura</label>
              <input
                type="date"
                value={openedAt}
                onChange={e => setOpenedAt(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row form-row-2">
            <div className="form-field">
              <label className="form-label">Classificação de Acesso</label>
              <select value={classification} onChange={e => setClass(e.target.value as ClassificationLevel | "")} className="form-input form-select">
                <option value="">Não classificado</option>
                {CLASSIFICATIONS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Responsável</label>
              <input
                type="text"
                value={responsibleBy}
                onChange={e => setResp(e.target.value)}
                placeholder="Analista ou gestor responsável"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row form-row-2">
            <ChipsInput
              label="Áreas de Atuação"
              values={operationAreas}
              onChange={setAreas}
              placeholder="Digite e pressione Enter ou vírgula"
            />
            <ChipsInput
              label="Equipe"
              values={team}
              onChange={setTeam}
              placeholder="Membros da equipe"
            />
          </div>

          <ChipsInput
            label="Agências Parceiras"
            values={partnerAgencies}
            onChange={setAgencies}
            placeholder="Ex.: PF, GAECO, DRACO"
          />
        </div>

        {/* Contexto inicial */}
        <div className="form-section">
          <p className="form-section-title">Contexto Inicial</p>

          <div className="form-field">
            <label className="form-label">Histórico</label>
            <textarea
              value={history}
              onChange={e => setHistory(e.target.value)}
              placeholder="Descreva o histórico e a origem do caso…"
              className="form-input form-textarea"
              rows={4}
            />
          </div>

          <div className="form-field">
            <label className="form-label">O Que Se Sabe</label>
            <textarea
              value={knownFacts}
              onChange={e => setKnownFacts(e.target.value)}
              placeholder="Informações consolidadas sobre o caso…"
              className="form-input form-textarea"
              rows={4}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Modus Operandi</label>
            <textarea
              value={modusOperandi}
              onChange={e => setModus(e.target.value)}
              placeholder="Padrões operacionais identificados…"
              className="form-input form-textarea"
              rows={3}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert--danger">
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Link href="/casos" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Criando…" : "Criar Caso"}
          </button>
        </div>

      </form>
    </div>
  );
}
