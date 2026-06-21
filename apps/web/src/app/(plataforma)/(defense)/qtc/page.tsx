"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getToken } from "../../../../lib/auth";
import { useAuthedFetch } from "../../../../lib/useAuthedFetch";
import { useConfirm } from "../../../components/ConfirmDialog";
import { EntitySearchSelect } from "../../../components/EntitySearchSelect";
import { ImageUploader } from "../_components/ImageUploader";
import type { QtcEntry, QtcCategory, ClassificationLevel, Target } from "@etz/shared-types";
import { QTC_CATEGORY_LABEL, CLASSIFICATION_LABEL } from "@etz/shared-types";

const CLASSIFICATIONS = Object.entries(CLASSIFICATION_LABEL) as [ClassificationLevel, string][];
const CATEGORIES = Object.entries(QTC_CATEGORY_LABEL) as [QtcCategory, string][];

const CLS_MAP: Record<ClassificationLevel, string> = {
  confidencial: "conf", secreto: "secret", ultrassecreto: "ts", ts_sci: "tssci",
  sap_acknowledged: "sapa", sap_unacknowledged: "sapu", sap_waived: "sapw",
};

// Cor do badge por categoria (semântica do design system)
const CAT_STYLE: Record<QtcCategory, { color: string; bg: string }> = {
  novidade:             { color: "#2451c9", bg: "#eaf0fd" },
  mencao_orcrim:        { color: "#b5740d", bg: "#fbf0db" },
  vinculo_suspeito:     { color: "#c4392f", bg: "#fbe8e6" },
  anotacao_operacional: { color: "#49515f", bg: "#e8ebf0" },
};

interface FormState {
  content:        string;
  category:       QtcCategory;
  classification: ClassificationLevel | "";
  targetIds:      string[];
  organizations:  string[];
  vehicles:       string[];
  attachments:    string[];
}

const EMPTY_FORM: FormState = {
  content: "", category: "novidade", classification: "",
  targetIds: [], organizations: [], vehicles: [], attachments: [],
};

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
      <label className="form-label">{label}</label>
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

// Campos compartilhados entre composição e edição
function QtcFields({ form, setForm, targetMap, registerTarget }: {
  form: FormState;
  setForm: (updater: (f: FormState) => FormState) => void;
  targetMap: Record<string, Target>;
  registerTarget: (t: Target) => void;
}) {
  return (
    <>
      <div className="form-field">
        <label className="form-label">Conteúdo *</label>
        <textarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={3}
          placeholder="Registre a novidade, anotação ou informação…"
          className="form-input form-textarea"
        />
      </div>

      <div className="form-row form-row-2">
        <div className="form-field">
          <label className="form-label">Categoria</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as QtcCategory }))} className="form-input form-select">
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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

      <EntitySearchSelect<Target>
        label="Alvos referenciados (busque por nome, apelido ou CPF)"
        placeholder="Digite para buscar na base de alvos…"
        searchUrl={q => `/api/defense/targets?search=${encodeURIComponent(q)}`}
        getKey={t => t.id}
        getPrimary={t => t.fullName}
        getSecondary={t => `${t.cpf ?? "sem CPF"}${t.aliases.length > 0 ? ` · ${t.aliases[0]}` : ""}`}
        isSelected={t => form.targetIds.includes(t.id)}
        selectedLabel="já referenciado"
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

      <div className="form-row form-row-2">
        <ChipsField label="Organizações" values={form.organizations} onChange={v => setForm(f => ({ ...f, organizations: v }))} placeholder="Ex.: Comando da Baixada" />
        <ChipsField label="Veículos" values={form.vehicles} onChange={v => setForm(f => ({ ...f, vehicles: v }))} placeholder="Placa ou descrição" />
      </div>

      <div className="form-field">
        <label className="form-label">Anexos</label>
        <ImageUploader
          images={form.attachments}
          category="qtc"
          onAdd={url => setForm(f => ({ ...f, attachments: [...f.attachments, url] }))}
          onRemove={i => setForm(f => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))}
        />
      </div>
    </>
  );
}

export default function QtcPage() {
  const { confirm, ConfirmUI } = useConfirm();

  const { data: entries, loading, refetch } = useAuthedFetch<QtcEntry[]>("/api/defense/qtc", { initial: [] });

  // mapa targetId → Target para exibir nomes dos alvos referenciados
  const [targetMap, setTargetMap] = useState<Record<string, Target>>({});
  useAuthedFetch<Target[]>("/api/defense/targets", {
    initial: [],
    onSuccess: all => setTargetMap(prev => ({ ...Object.fromEntries(all.map(t => [t.id, t])), ...prev })),
  });
  const registerTarget = (t: Target) => setTargetMap(prev => ({ ...prev, [t.id]: t }));

  // ── Composição ──
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState<FormState>(EMPTY_FORM);
  const [publishing, setPublishing] = useState(false);
  const [composeError, setComposeError] = useState("");

  async function publish() {
    if (!compose.content.trim()) { setComposeError("O conteúdo é obrigatório."); return; }
    setPublishing(true); setComposeError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/defense/qtc", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...compose, classification: compose.classification || null }),
      });
      if (!res.ok) throw new Error();
      setCompose(EMPTY_FORM); setComposeOpen(false);
      await refetch();
    } catch { setComposeError("Erro ao publicar. Tente novamente."); }
    finally { setPublishing(false); }
  }

  // ── Edição ──
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  function openEdit(e: QtcEntry) {
    setEditId(e.id);
    setEditForm({
      content: e.content, category: e.category, classification: e.classification ?? "",
      targetIds: e.targetIds ?? [], organizations: e.organizations ?? [], vehicles: e.vehicles ?? [], attachments: e.attachments ?? [],
    });
    setEditError("");
  }

  async function saveEdit() {
    if (!editId) return;
    if (!editForm.content.trim()) { setEditError("O conteúdo é obrigatório."); return; }
    setSavingEdit(true); setEditError("");
    try {
      const token = await getToken();
      const res = await fetch(`/api/defense/qtc/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, classification: editForm.classification || null }),
      });
      if (!res.ok) throw new Error();
      setEditId(null);
      await refetch();
    } catch { setEditError("Erro ao salvar."); }
    finally { setSavingEdit(false); }
  }

  const [deleting, setDeleting] = useState<string | null>(null);
  async function handleDelete(e: QtcEntry) {
    const ok = await confirm({
      title: "Excluir QTC",
      message: "Tem certeza que deseja excluir este registro? Esta ação é irreversível.",
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;
    setDeleting(e.id);
    try {
      const token = await getToken();
      await fetch(`/api/defense/qtc/${e.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      await refetch();
    } finally { setDeleting(null); }
  }

  // ── Filtros (client-side) ──
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState("");
  const [tgtFilter, setTgt]   = useState("");
  const [authorFilter, setAuthor] = useState("");
  const [clsFilter, setCls]   = useState("");

  const authorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.createdByEmail) set.add(e.createdByEmail);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const targetFilterOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const e of entries) for (const tid of e.targetIds ?? []) ids.add(tid);
    return [...ids]
      .map(id => ({ id, name: targetMap[id]?.fullName ?? null }))
      .filter(o => o.name)
      .sort((a, b) => a.name!.localeCompare(b.name!, "pt-BR"));
  }, [entries, targetMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter(e => {
      if (q && !e.content.toLowerCase().includes(q)) return false;
      if (catFilter && e.category !== catFilter) return false;
      if (tgtFilter && !(e.targetIds ?? []).includes(tgtFilter)) return false;
      if (authorFilter && e.createdByEmail !== authorFilter) return false;
      if (clsFilter && e.classification !== clsFilter) return false;
      return true;
    });
  }, [entries, search, catFilter, tgtFilter, authorFilter, clsFilter]);

  const hasFilters = !!(search || catFilter || tgtFilter || authorFilter || clsFilter);
  function clearFilters() { setSearch(""); setCat(""); setTgt(""); setAuthor(""); setCls(""); }

  return (
    <div style={{ maxWidth: 860, width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {ConfirmUI}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
            ETZ Defense · Quadro de Transmissão de Conhecimento
          </p>
          <h1>QTC</h1>
        </div>
        {!composeOpen && (
          <button onClick={() => setComposeOpen(true)} className="btn-primary btn-primary--sm">+ Novo QTC</button>
        )}
      </div>

      {/* Caixa de composição */}
      {composeOpen && (
        <div className="form-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <p className="form-section-title" style={{ marginBottom: 0 }}>Novo registro</p>
          </div>
          <QtcFields form={compose} setForm={setCompose} targetMap={targetMap} registerTarget={registerTarget} />
          {composeError && <div className="alert alert--danger"><span>{composeError}</span></div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => { setComposeOpen(false); setCompose(EMPTY_FORM); setComposeError(""); }} className="btn-secondary">Cancelar</button>
            <button onClick={publish} disabled={publishing} className="btn-primary">{publishing ? "Publicando…" : "Publicar"}</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      {entries.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", boxShadow: "var(--shadow-xs)" }}>
          <div className="form-field" style={{ flex: "1 1 200px" }}>
            <label className="form-label">Buscar</label>
            <input type="text" placeholder="No conteúdo…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" />
          </div>
          <div className="form-field" style={{ flex: "0 1 170px" }}>
            <label className="form-label">Categoria</label>
            <select value={catFilter} onChange={e => setCat(e.target.value)} className="form-input form-select">
              <option value="">Todas</option>
              {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {targetFilterOptions.length > 0 && (
            <div className="form-field" style={{ flex: "0 1 180px" }}>
              <label className="form-label">Alvo</label>
              <select value={tgtFilter} onChange={e => setTgt(e.target.value)} className="form-input form-select">
                <option value="">Todos</option>
                {targetFilterOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          )}
          {authorOptions.length > 1 && (
            <div className="form-field" style={{ flex: "0 1 190px" }}>
              <label className="form-label">Autor</label>
              <select value={authorFilter} onChange={e => setAuthor(e.target.value)} className="form-input form-select">
                <option value="">Todos</option>
                {authorOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
          <div className="form-field" style={{ flex: "0 1 170px" }}>
            <label className="form-label">Classificação</label>
            <select value={clsFilter} onChange={e => setCls(e.target.value)} className="form-input form-select">
              <option value="">Todas</option>
              {CLASSIFICATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {hasFilters && <button onClick={clearFilters} className="btn-secondary btn-primary--sm" style={{ flexShrink: 0 }}>Limpar filtros</button>}
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <p style={{ padding: 24, fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 40, height: 40, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-300)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
            </svg>
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>
            {hasFilters ? "Nenhum QTC encontrado para os filtros aplicados." : "Nenhum QTC registrado ainda."}
          </p>
          {hasFilters
            ? <button onClick={clearFilters} className="btn-secondary btn-primary--sm">Limpar filtros</button>
            : !composeOpen && <button onClick={() => setComposeOpen(true)} className="btn-primary btn-primary--sm">Registrar primeiro QTC</button>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(e => {
            const cat = CAT_STYLE[e.category];
            return (
              <div key={e.id} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "16px 18px", boxShadow: "var(--shadow-xs)" }}>
                {/* topo: categoria + classificação + ações */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: cat.color, background: cat.bg, padding: "3px 9px", borderRadius: "var(--r-full)" }}>
                      {QTC_CATEGORY_LABEL[e.category]}
                    </span>
                    {e.classification && <span className="cls" data-c={CLS_MAP[e.classification]}>{CLASSIFICATION_LABEL[e.classification]}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(e)} style={{ fontSize: 12, color: "var(--accent)", background: "var(--accent-tint)", border: "none", borderRadius: "var(--r-sm)", padding: "4px 10px", cursor: "pointer", fontWeight: 500, fontFamily: "var(--font-ui)" }}>Editar</button>
                    <button onClick={() => handleDelete(e)} disabled={deleting === e.id} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", padding: "4px 10px", cursor: "pointer", opacity: deleting === e.id ? 0.5 : 1, fontFamily: "var(--font-ui)" }}>Excluir</button>
                  </div>
                </div>

                {/* conteúdo */}
                <p style={{ fontSize: 14, color: "var(--ink-800)", fontFamily: "var(--font-ui)", lineHeight: 1.6, whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "break-word" }}>{e.content}</p>

                {/* referências */}
                {(e.targetIds?.length > 0 || e.organizations?.length > 0 || e.vehicles?.length > 0) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {(e.targetIds ?? []).map(tid => (
                      targetMap[tid]
                        ? <Link key={tid} href={`/alvos/${tid}`} className="chip" style={{ textDecoration: "none", color: "var(--accent)", background: "var(--accent-tint)" }}>{targetMap[tid].fullName}</Link>
                        : <span key={tid} className="chip" style={{ fontSize: 11 }}>Alvo</span>
                    ))}
                    {(e.organizations ?? []).map(o => <span key={`o-${o}`} className="chip" style={{ fontSize: 11 }}>{o}</span>)}
                    {(e.vehicles ?? []).map(v => <span key={`v-${v}`} className="chip" style={{ fontSize: 11 }}>🚗 {v}</span>)}
                  </div>
                )}

                {/* anexos */}
                {e.attachments?.length > 0 && (
                  <div className="img-gallery" style={{ marginTop: 10 }}>
                    {e.attachments.map((url, j) => (
                      <div key={j} className="img-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" />
                      </div>
                    ))}
                  </div>
                )}

                {/* rodapé */}
                <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", marginTop: 12 }}>
                  {e.createdByEmail} · {new Date(e.createdAt).toLocaleString("pt-BR")}
                  {e.updatedAt !== e.createdAt && " · editado"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--ink-400)", textAlign: "right", fontFamily: "var(--font-mono)" }}>
          {hasFilters ? `${filtered.length} de ${entries.length}` : `${entries.length}`} {entries.length === 1 ? "registro" : "registros"}
        </p>
      )}

      {/* Modal de edição */}
      {editId && (
        <div
          onClick={() => setEditId(null)}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,24,31,.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))", overscrollBehavior: "contain" }}
        >
          <div
            onClick={ev => ev.stopPropagation()}
            style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-lg)", padding: "clamp(20px, 5vw, 28px)", width: "100%", maxWidth: 640, maxHeight: "90dvh", overflowY: "auto", overscrollBehavior: "contain", display: "flex", flexDirection: "column", gap: 14 }}
          >
            <h2 style={{ fontSize: 17, fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.012em", color: "var(--ink-900)" }}>Editar QTC</h2>
            <QtcFields form={editForm} setForm={setEditForm} targetMap={targetMap} registerTarget={registerTarget} />
            {editError && <div className="alert alert--danger"><span>{editError}</span></div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditId(null)} className="btn-secondary">Cancelar</button>
              <button onClick={saveEdit} disabled={savingEdit} className="btn-primary">{savingEdit ? "Salvando…" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
