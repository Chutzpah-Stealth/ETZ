const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M2.5 7L5.5 10L11.5 4" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const tiers = [
  {
    role: "C-Level",
    level: "Estratégico",
    description: "Dashboards executivos, alertas críticos e visão consolidada de risco do negócio.",
    capabilities: [
      "Visão global de riscos",
      "Relatórios executivos",
      "Decisão estratégica integrada",
      "Cross-unit insights",
    ],
  },
  {
    role: "Compliance Officer",
    level: "Tático",
    description: "Monitoramento de conformidade, geração de relatórios regulatórios e análise de exposição.",
    capabilities: [
      "Análise de conformidade",
      "Relatórios regulatórios",
      "Correlação de evidências",
      "Geração de pareceres",
    ],
    highlight: true,
  },
  {
    role: "Analista de Risco",
    level: "Operacional",
    description: "Inserção de dados, monitoramento de casos e detecção de irregularidades operacionais.",
    capabilities: [
      "Inserção de alertas",
      "Monitoramento de casos",
      "Acesso às próprias entradas",
      "Notificações da unidade",
    ],
  },
];

export default function BusinessTiers() {
  return (
    <section id="acesso" className="section">
      <div className="container">
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, marginBottom: 64 }}
        >
          <span className="badge">Hierarquia</span>
          <h2 style={{ fontSize: 28, maxWidth: 480 }}>Acesso hierárquico e controlado</h2>
          <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 480 }}>
            Cada função vê exatamente o que precisa para tomar decisões com precisão.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "start" }}>
          {tiers.map((tier) => (
            <div
              key={tier.role}
              style={{
                background: tier.highlight ? "var(--ink)" : "var(--paper)",
                border: tier.highlight ? "none" : "1px solid var(--rule)",
                borderRadius: "var(--radius-xl)",
                padding: 28,
                position: "relative",
              }}
            >
              {tier.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: 24,
                    right: 24,
                    height: 2,
                    background: "var(--blue)",
                    borderRadius: "0 0 var(--radius-pill) var(--radius-pill)",
                  }}
                />
              )}

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: tier.highlight ? "rgba(255,255,255,0.1)" : "var(--blue-soft)",
                  color: tier.highlight ? "rgba(255,255,255,0.8)" : "var(--blue)",
                  borderRadius: "var(--radius-pill)",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 16,
                }}
              >
                {tier.level}
              </span>

              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: tier.highlight ? "var(--paper)" : "var(--ink)",
                  marginBottom: 12,
                }}
              >
                {tier.role}
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: tier.highlight ? "rgba(250,250,247,0.65)" : "var(--muted)",
                  lineHeight: 1.65,
                  marginBottom: 24,
                }}
              >
                {tier.description}
              </p>

              <div
                style={{
                  borderTop: tier.highlight ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--rule)",
                  paddingTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {tier.capabilities.map((cap) => (
                  <div key={cap} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: tier.highlight ? "rgba(255,255,255,0.1)" : "var(--blue-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: tier.highlight ? "rgba(250,250,247,0.8)" : "var(--ink)" }}>
                      {cap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
