import type { ClassificationLevel } from "@etz/shared-types";
import { CLASSIFICATION_LABEL, RISK_LEVEL_LABEL, TARGET_STATUS_LABEL, CASE_STATUS_LABEL } from "@etz/shared-types";
import { ETZLogoMark } from "../../../components/ETZLogo";

const CLS_MAP: Record<ClassificationLevel, string> = {
  confidencial: "conf", secreto: "secret", ultrassecreto: "ts", ts_sci: "tssci",
  sap_acknowledged: "sapa", sap_unacknowledged: "sapu", sap_waived: "sapw",
};

export interface ReportDocData {
  title:          string;
  number:         string | null;
  classification: ClassificationLevel | null;
  objetivo:       string | null;
  contexto:       string | null;
  analise:        string | null;
  conclusao:      string | null;
  attachments:    string[];
  case:           { name: string; caseNumber: string | null; status: string; classification: ClassificationLevel | null } | null;
  targets:        { id: string; fullName: string; aliases: string[]; cpf: string | null; status: string | null; riskLevel: string | null; photo: string | null }[];
  emission:       { byEmail: string; at: string; version: number | null };
}

function Section({ title, value }: { title: string; value: string | null }) {
  if (!value) return null;
  return (
    <>
      <h2>{title}</h2>
      <p className="body">{value}</p>
    </>
  );
}

export function ReportDoc({ data }: { data: ReportDocData }) {
  const clsLabel = data.classification ? CLASSIFICATION_LABEL[data.classification] : null;
  return (
    <div className="report-doc">
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "2px solid var(--ink-900)", paddingBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ETZLogoMark size={32} />
          <div>
            <p style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ink-900)", letterSpacing: "-0.01em" }}>
              <span style={{ color: "var(--accent)" }}>ETZ</span> DEFENSE
            </p>
            <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-400)" }}>
              Relatório de Inteligência
            </p>
          </div>
        </div>
        {clsLabel && <span className="cls" data-c={CLS_MAP[data.classification!]}>{clsLabel}</span>}
      </div>

      {/* Título + identificação */}
      <div style={{ marginTop: 16 }}>
        <h1 style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.018em", color: "var(--ink-900)", overflowWrap: "break-word" }}>{data.title}</h1>
        <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-500)", marginTop: 4 }}>
          {data.number ? `Nº ${data.number}` : "Sem número"}
          {data.case && ` · Caso: ${data.case.name}${data.case.caseNumber ? ` (${data.case.caseNumber})` : ""}`}
        </p>
        {/* Carimbo de emissão */}
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-400)", marginTop: 6 }}>
          {data.emission.version
            ? `Versão definitiva ${data.emission.version} · congelada em `
            : "Emitido em "}
          {new Date(data.emission.at).toLocaleString("pt-BR")} · por {data.emission.byEmail}
        </p>
        {!data.emission.version && (
          <p style={{ fontSize: 10, fontFamily: "var(--font-ui)", color: "var(--ink-400)", marginTop: 2, fontStyle: "italic" }}>
            Os dados de caso e alvos refletem o estado nesta data de emissão.
          </p>
        )}
      </div>

      <div className="rule" />

      <Section title="Objetivo" value={data.objetivo} />
      <Section title="Contexto / Síntese" value={data.contexto} />
      <Section title="Análise" value={data.analise} />

      {/* Alvos */}
      {data.targets.length > 0 && (
        <>
          <h2>Alvos do Relatório</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.targets.map(t => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, alignItems: "center", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "10px 12px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--r-sm)", background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.photo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={t.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 10, color: "var(--ink-300)", fontFamily: "var(--font-mono)" }}>—</span>}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", fontFamily: "var(--font-ui)" }}>{t.fullName}</p>
                  <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-500)" }}>
                    {t.cpf ?? "sem CPF"}
                    {t.status && ` · ${TARGET_STATUS_LABEL[t.status as keyof typeof TARGET_STATUS_LABEL] ?? t.status}`}
                    {t.riskLevel && ` · risco ${RISK_LEVEL_LABEL[t.riskLevel as keyof typeof RISK_LEVEL_LABEL] ?? t.riskLevel}`}
                    {t.aliases.length > 0 && ` · "${t.aliases[0]}"`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Section title="Conclusão & Recomendação" value={data.conclusao} />

      {/* Anexos */}
      {data.attachments.length > 0 && (
        <>
          <h2>Anexos</h2>
          <div className="img-gallery">
            {data.attachments.map((url, i) => (
              <div key={i} className="img-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rodapé */}
      <div className="rule" />
      <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--ink-400)", textAlign: "center" }}>
        {clsLabel ? `${clsLabel} · ` : ""}Uso controlado · ETZ Defense
        {data.case && ` · ${CASE_STATUS_LABEL[data.case.status as keyof typeof CASE_STATUS_LABEL] ?? ""}`}
      </p>
    </div>
  );
}
