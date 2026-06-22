"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, getToken } from "../../../../../lib/auth";
import { useAuthedFetch } from "../../../../../lib/useAuthedFetch";
import { useConfirm } from "../../../../components/ConfirmDialog";
import { ReportFields, type ReportFormState } from "../../_components/ReportFields";
import { ReportDoc, type ReportDocData } from "../../_components/ReportDoc";
import type { Report, ReportVersion, Target, Case, ClassificationLevel } from "@etz/shared-types";
import { REPORT_STATUS_LABEL } from "@etz/shared-types";

type RouteParams = { params: Promise<{ id: string }> };

export default function RelatorioDetailPage({ params }: RouteParams) {
  const { id } = use(params);
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [deleting, setDeleting] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<ReportVersion | null>(null);

  // form (edição)
  const [form, setForm]           = useState<ReportFormState | null>(null);
  const [caseLabel, setCaseLabel] = useState<string | null>(null);
  const [targetMap, setTargetMap] = useState<Record<string, Target>>({});
  const [caseData, setCaseData]   = useState<Case | null>(null);
  const registerTarget = (t: Target) => setTargetMap(prev => ({ ...prev, [t.id]: t }));

  function populate(r: Report) {
    setForm({
      title: r.title, number: r.number ?? "", status: r.status, classification: r.classification ?? "",
      caseId: r.caseId, targetIds: r.targetIds ?? [],
      objetivo: r.objetivo ?? "", contexto: r.contexto ?? "", analise: r.analise ?? "", conclusao: r.conclusao ?? "",
      attachments: r.attachments ?? [],
    });
  }

  const { data: report, setData: setReport, loading } = useAuthedFetch<Report | null>(
    `/api/defense/reports/${id}`,
    { initial: null, onSuccess: r => { if (r) populate(r); }, onError: () => router.replace("/relatorios") },
  );

  // resolve alvos (mapa) e caso vinculado (ao vivo)
  useAuthedFetch<Target[]>("/api/defense/targets", {
    initial: [],
    onSuccess: all => setTargetMap(prev => ({ ...Object.fromEntries(all.map(t => [t.id, t])), ...prev })),
  });

  useEffect(() => {
    // reset síncrono ao desvincular o caso; o carregamento abaixo é assíncrono (pós-await)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!report?.caseId) { setCaseData(null); setCaseLabel(null); return; }
    let active = true;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/defense/cases/${report.caseId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!active || !res.ok) return;
        const c = await res.json() as Case;
        setCaseData(c); setCaseLabel(c.name);
      } catch { /* ignora */ }
    })();
    return () => { active = false; };
  }, [report?.caseId]);

  const { data: versions, refetch: reloadVersions } = useAuthedFetch<ReportVersion[]>(`/api/defense/reports/${id}/versions`, { initial: [] });

  async function saveEdit() {
    if (!form) return;
    if (!form.title.trim()) { setError("O título é obrigatório."); return; }
    setSaving(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch(`/api/defense/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          number: form.number.trim() || null,
          classification: form.classification || null,
          objetivo: form.objetivo.trim() || null,
          contexto: form.contexto.trim() || null,
          analise: form.analise.trim() || null,
          conclusao: form.conclusao.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json() as Report;
      setReport(updated);
      setEditMode(false);
    } catch { setError("Erro ao salvar."); }
    finally { setSaving(false); }
  }

  function cancelEdit() {
    if (report) populate(report);
    setEditMode(false); setError("");
  }

  async function handleDelete() {
    if (!report) return;
    const ok = await confirm({
      title: "Excluir relatório",
      message: `Tem certeza que deseja excluir "${report.title}"? Esta ação é irreversível.`,
      confirmLabel: "Excluir", variant: "danger",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await fetch(`/api/defense/reports/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      router.replace("/relatorios");
    } catch { setDeleting(false); }
  }

  async function freezeVersion() {
    const ok = await confirm({
      title: "Gerar versão definitiva",
      message: "Cria uma cópia imutável do relatório com os dados atuais do caso e alvos. Versões definitivas não mudam depois. Continuar?",
      confirmLabel: "Gerar versão",
    });
    if (!ok) return;
    setFreezing(true);
    try {
      const token = await getToken();
      await fetch(`/api/defense/reports/${id}/versions`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      await reloadVersions();
    } finally { setFreezing(false); }
  }

  async function printDoc() {
    try {
      const token = await getToken();
      await fetch(`/api/defense/reports/${id}/emit`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch { /* registra emissão; segue para impressão mesmo se falhar */ }
    window.print();
  }

  if (loading || !report) {
    return <div style={{ padding: 48, textAlign: "center", color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Carregando…</div>;
  }

  // documento ao vivo (ou da versão sendo visualizada)
  const liveDoc: ReportDocData = {
    title: report.title, number: report.number, classification: report.classification,
    objetivo: report.objetivo, contexto: report.contexto, analise: report.analise, conclusao: report.conclusao,
    attachments: report.attachments ?? [],
    case: caseData ? { name: caseData.name, caseNumber: caseData.caseNumber ?? null, status: caseData.status, classification: caseData.classification ?? null } : null,
    targets: (report.targetIds ?? []).map(tid => {
      const t = targetMap[tid];
      return t
        ? { id: tid, fullName: t.fullName, aliases: t.aliases ?? [], cpf: t.cpf ?? null, status: t.status ?? null, riskLevel: t.riskLevel ?? null, photo: t.photos?.[0] ?? null }
        : { id: tid, fullName: "Alvo", aliases: [], cpf: null, status: null, riskLevel: null, photo: null };
    }),
    emission: { byEmail: auth.currentUser?.email ?? "—", at: new Date().toISOString(), version: null },
  };

  const versionDoc: ReportDocData | null = viewingVersion ? {
    title: viewingVersion.title, number: viewingVersion.number, classification: viewingVersion.classification as ClassificationLevel | null,
    objetivo: viewingVersion.objetivo, contexto: viewingVersion.contexto, analise: viewingVersion.analise, conclusao: viewingVersion.conclusao,
    attachments: viewingVersion.attachments ?? [],
    case: viewingVersion.caseSnapshot ? { name: viewingVersion.caseSnapshot.name, caseNumber: viewingVersion.caseSnapshot.caseNumber, status: viewingVersion.caseSnapshot.status, classification: viewingVersion.caseSnapshot.classification } : null,
    targets: viewingVersion.targetsSnapshot ?? [],
    emission: { byEmail: viewingVersion.emittedByEmail, at: viewingVersion.emittedAt, version: viewingVersion.version },
  } : null;

  return (
    <div style={{ maxWidth: 880, width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {ConfirmUI}

      {/* Header de ações (não imprime) */}
      <div className="no-print" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
            ETZ Defense · Relatórios
          </p>
          <h1 style={{ fontSize: "clamp(19px, 4.5vw, 22px)", overflowWrap: "break-word" }}>{report.title}</h1>
          <span className="status" data-s={report.status === "finalizado" ? "finalizado" : "em_andamento"} style={{ marginTop: 6, display: "inline-flex" }}>{REPORT_STATUS_LABEL[report.status]}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
          <Link href="/relatorios" className="btn-secondary btn-primary--sm">← Relatórios</Link>
          {editMode
            ? <button onClick={cancelEdit} className="btn-secondary btn-primary--sm">Cancelar</button>
            : <button onClick={() => setEditMode(true)} className="btn-secondary btn-primary--sm">Editar</button>}
        </div>
      </div>

      {error && <div className="alert alert--danger no-print"><span>{error}</span></div>}

      {/* EDIÇÃO */}
      {editMode && form ? (
        <>
          <ReportFields form={form} setForm={(u) => setForm(f => f ? u(f) : f)} caseLabel={caseLabel} setCaseLabel={setCaseLabel} targetMap={targetMap} registerTarget={registerTarget} />
          <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <button onClick={cancelEdit} className="btn-secondary">Cancelar</button>
            <button onClick={saveEdit} disabled={saving} className="btn-primary">{saving ? "Salvando…" : "Salvar"}</button>
          </div>
        </>
      ) : (
        <>
          {/* Barra de ações do documento */}
          <div className="no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={printDoc} className="btn-primary btn-primary--sm">Imprimir / Salvar PDF</button>
            {!viewingVersion && <button onClick={freezeVersion} disabled={freezing} className="btn-secondary btn-primary--sm">{freezing ? "Gerando…" : "Gerar versão definitiva"}</button>}
            {viewingVersion && <button onClick={() => setViewingVersion(null)} className="btn-secondary btn-primary--sm">← Voltar ao relatório atual</button>}
            <button onClick={handleDelete} disabled={deleting} className="btn-danger btn-primary--sm" style={{ marginLeft: "auto" }}>{deleting ? "Excluindo…" : "Excluir"}</button>
          </div>

          {viewingVersion && (
            <div className="no-print alert" style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-line)", color: "var(--accent-strong)" }}>
              <span>Visualizando a <strong>versão definitiva {viewingVersion.version}</strong> (imutável, congelada em {new Date(viewingVersion.emittedAt).toLocaleString("pt-BR")}).</span>
            </div>
          )}

          {/* Documento (imprime) */}
          <ReportDoc data={versionDoc ?? liveDoc} />

          {/* Versões definitivas */}
          {!viewingVersion && (
            <div className="no-print form-section">
              <p className="form-section-title">Versões definitivas</p>
              {versions.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>
                  Nenhuma versão congelada. Use &quot;Gerar versão definitiva&quot; para criar uma peça imutável datada.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {versions.map(v => (
                    <button key={v.id} onClick={() => setViewingVersion(v)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textAlign: "left", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "10px 12px", cursor: "pointer", minHeight: 44 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>Versão {v.version}</span>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-500)" }}>{new Date(v.emittedAt).toLocaleString("pt-BR")} · {v.emittedByEmail}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
