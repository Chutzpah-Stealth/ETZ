import { CheckCircle2 } from "lucide-react";

const sources = [
  { bg: "var(--cls-sap-ack)", sigla: "RF", label: "Receita Federal" },
  { bg: "var(--accent)",      sigla: "TSE", label: "TSE" },
  { bg: "var(--risk-med)",    sigla: "DT", label: "Detran" },
  { bg: "var(--cls-sap-un)",  sigla: "PF", label: "Polícia Federal" },
  { bg: "var(--ink-600)",     sigla: "IN", label: "Interno" },
];

const tableData = [
  { name: "Marcos A. Ferreira", risk: "alto",  origin: "IN", originLabel: "Interno",  originBg: "var(--ink-600)" },
  { name: "Vinícius Lopes",     risk: "medio", origin: "RF", originLabel: "Receita",  originBg: "var(--cls-sap-ack)" },
  { name: "Daniela Rocha",      risk: "baixo", origin: "TSE", originLabel: "TSE",     originBg: "var(--accent)" },
];

const badgeClass: Record<string, string> = {
  alto:  "badge--high",
  medio: "badge--med",
  baixo: "badge--low",
};
const badgeLabel: Record<string, string> = {
  alto:  "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export default function Analysis() {
  return (
    <section className="lp-section" id="analise">
      <div className="wrap">
        <div className="lp-split">
          {/* lado esquerdo */}
          <div>
            <span className="eyebrow" style={{ display: "block", marginBottom: 12 }}>
              Inteligência &amp; correlação
            </span>
            <h2 style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.14 }}>
              Cruze dados internos com bases externas — em uma só tela.
            </h2>
            <p style={{ fontSize: 16, color: "var(--ink-600)", marginTop: 16, lineHeight: 1.6 }}>
              Consulta federada a bases policiais, TSE, Receita Federal e Detran. Resultados
              externos aparecem na mesma listagem dos internos, diferenciados por etiqueta de
              origem, prontos para enriquecer ou vincular a um caso.
            </p>
            <ul className="lp-checks">
              <li>
                <CheckCircle2 size={17} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                Vinculação manual de redes: familiar, financeiro, operacional, social
              </li>
              <li>
                <CheckCircle2 size={17} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                Validação cruzada de CPF em tempo real contra duplicações
              </li>
              <li>
                <CheckCircle2 size={17} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                Sincronização imediata para todos os usuários autorizados da unidade
              </li>
            </ul>
          </div>

          {/* painel direito */}
          <div className="lp-panel">
            <div className="eyebrow" style={{ marginBottom: 16 }}>Fontes conectadas</div>
            <div className="lp-panel-sources">
              {sources.map(({ bg, sigla, label }) => (
                <span key={sigla} className="lp-source">
                  <span className="mk" style={{ background: bg }}>{sigla}</span>
                  {label}
                </span>
              ))}
            </div>

            <div className="table-wrap" style={{ marginTop: 20 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Alvo</th>
                    <th>Risco</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(({ name, risk, origin, originLabel, originBg }) => (
                    <tr key={name}>
                      <td className="nm">{name}</td>
                      <td>
                        <span
                          className={`badge ${badgeClass[risk]}`}
                          style={{ padding: "3px 7px", fontSize: 10, borderRadius: "var(--r-xs)", border: "1px solid transparent", display: "inline-flex", alignItems: "center", gap: 5 }}
                        >
                          <span className="dot" />
                          {badgeLabel[risk]}
                        </span>
                      </td>
                      <td>
                        <span className="lp-source" style={{ padding: "2px 6px" }}>
                          <span className="mk" style={{ background: originBg, width: 12, height: 12, fontSize: 7 }}>
                            {origin}
                          </span>
                          {originLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
