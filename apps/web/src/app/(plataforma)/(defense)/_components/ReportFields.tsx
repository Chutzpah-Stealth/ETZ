"use client";

import { EntitySearchSelect } from "../../../components/EntitySearchSelect";
import { ImageUploader } from "./ImageUploader";
import type { ReportStatus, ClassificationLevel, Case, Target } from "@etz/shared-types";
import { REPORT_STATUS_LABEL, CLASSIFICATION_LABEL } from "@etz/shared-types";

const CLASSIFICATIONS = Object.entries(CLASSIFICATION_LABEL) as [ClassificationLevel, string][];

export interface ReportFormState {
  title:          string;
  number:         string;
  status:         ReportStatus;
  classification: ClassificationLevel | "";
  caseId:         string | null;
  targetIds:      string[];
  objetivo:       string;
  contexto:       string;
  analise:        string;
  conclusao:      string;
  attachments:    string[];
}

export const EMPTY_REPORT_FORM: ReportFormState = {
  title: "", number: "", status: "em_edicao", classification: "",
  caseId: null, targetIds: [], objetivo: "", contexto: "", analise: "", conclusao: "", attachments: [],
};

export function ReportFields({ form, setForm, caseLabel, setCaseLabel, targetMap, registerTarget }: {
  form: ReportFormState;
  setForm: (updater: (f: ReportFormState) => ReportFormState) => void;
  caseLabel: string | null;
  setCaseLabel: (v: string | null) => void;
  targetMap: Record<string, Target>;
  registerTarget: (t: Target) => void;
}) {
  return (
    <>
      <div className="form-section">
        <p className="form-section-title">Identificação</p>
        <div className="form-row form-row-2">
          <div className="form-field">
            <label className="form-label">Título *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex.: Relatório de Inteligência — Operação Cerco Duplo" className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Número</label>
            <input type="text" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="Ex.: 2025/014-RI" className="form-input" />
          </div>
        </div>
        <div className="form-row form-row-2">
          <div className="form-field">
            <label className="form-label">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ReportStatus }))} className="form-input form-select">
              {Object.entries(REPORT_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Classificação de Acesso</label>
            <select value={form.classification} onChange={e => setForm(f => ({ ...f, classification: e.target.value as ClassificationLevel | "" }))} className="form-input form-select">
              <option value="">Não classificado</option>
              {CLASSIFICATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Caso e Alvos</p>
        {form.caseId && caseLabel ? (
          <div className="form-field">
            <label className="form-label">Caso vinculado</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="chip" style={{ fontSize: 12 }}>{caseLabel}
                <span className="x" onClick={() => { setForm(f => ({ ...f, caseId: null })); setCaseLabel(null); }}>×</span>
              </span>
            </div>
          </div>
        ) : (
          <EntitySearchSelect<Case>
            label="Caso vinculado (busque pelo nome)"
            placeholder="Digite para buscar casos da unidade…"
            searchUrl={q => `/api/defense/cases?search=${encodeURIComponent(q)}`}
            getKey={c => c.id}
            getPrimary={c => c.name}
            getSecondary={c => c.caseNumber ?? "sem número"}
            isSelected={c => form.caseId === c.id}
            onSelect={c => { setForm(f => ({ ...f, caseId: c.id })); setCaseLabel(c.name); }}
          />
        )}

        <EntitySearchSelect<Target>
          label="Alvos do relatório (busque por nome, apelido ou CPF)"
          placeholder="Digite para buscar na base de alvos…"
          searchUrl={q => `/api/defense/targets?search=${encodeURIComponent(q)}`}
          getKey={t => t.id}
          getPrimary={t => t.fullName}
          getSecondary={t => `${t.cpf ?? "sem CPF"}${t.aliases.length > 0 ? ` · ${t.aliases[0]}` : ""}`}
          isSelected={t => form.targetIds.includes(t.id)}
          selectedLabel="já incluído"
          onSelect={t => { registerTarget(t); setForm(f => ({ ...f, targetIds: [...f.targetIds, t.id] })); }}
        />
        {form.targetIds.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {form.targetIds.map(tid => (
              <span key={tid} className="chip">
                {targetMap[tid]?.fullName ?? "Alvo"}
                <span className="x" onClick={() => setForm(f => ({ ...f, targetIds: f.targetIds.filter(x => x !== tid) }))}>×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <p className="form-section-title">Conteúdo</p>
        {([
          ["objetivo",  "Objetivo",                "Motivação e finalidade do relatório…"],
          ["contexto",  "Contexto / Síntese",      "Resumo da situação…"],
          ["analise",   "Análise",                 "Análise dos dados e vínculos…"],
          ["conclusao", "Conclusão & Recomendação","Conclusões e recomendação para a operação…"],
        ] as [keyof ReportFormState, string, string][]).map(([key, label, ph]) => (
          <div className="form-field" key={key}>
            <label className="form-label">{label}</label>
            <textarea value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={4} placeholder={ph} className="form-input form-textarea" />
          </div>
        ))}
      </div>

      <div className="form-section">
        <p className="form-section-title">Anexos</p>
        <ImageUploader
          images={form.attachments}
          category="report"
          onAdd={url => setForm(f => ({ ...f, attachments: [...f.attachments, url] }))}
          onRemove={i => setForm(f => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))}
        />
      </div>
    </>
  );
}
