"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../../lib/auth";
import { ReportFields, EMPTY_REPORT_FORM, type ReportFormState } from "../../_components/ReportFields";
import type { Target } from "@etz/shared-types";

export default function NovoRelatorioPage() {
  const router = useRouter();
  const [form, setForm] = useState<ReportFormState>(EMPTY_REPORT_FORM);
  const [caseLabel, setCaseLabel] = useState<string | null>(null);
  const [targetMap, setTargetMap] = useState<Record<string, Target>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const registerTarget = (t: Target) => setTargetMap(prev => ({ ...prev, [t.id]: t }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("O título é obrigatório."); return; }
    setSubmitting(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/defense/reports", {
        method: "POST",
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
      if (!res.ok) { setError("Erro ao criar relatório."); return; }
      const created = await res.json();
      router.push(`/relatorios/${created.id}`);
    } catch { setError("Erro de rede. Tente novamente."); }
    finally { setSubmitting(false); }
  }

  return (
    <div style={{ maxWidth: 820, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
            ETZ Defense · Relatórios
          </p>
          <h1>Novo Relatório</h1>
        </div>
        <Link href="/relatorios" className="btn-secondary btn-primary--sm">← Relatórios</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ReportFields form={form} setForm={setForm} caseLabel={caseLabel} setCaseLabel={setCaseLabel} targetMap={targetMap} registerTarget={registerTarget} />

        {error && <div className="alert alert--danger"><span>{error}</span></div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Link href="/relatorios" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Criando…" : "Criar Relatório"}</button>
        </div>
      </form>
    </div>
  );
}
