const tiers = [
  {
    role: "Gestor",
    level: "Estratégico",
    description:
      "Acesso completo à unidade, dashboards gerenciais e controle de colaborações entre unidades.",
    capabilities: [
      "Visão geral de todas as operações",
      "Inserção e gestão de dados",
      "Cross-unit collaboration",
      "Gerenciamento de acessos",
    ],
  },
  {
    role: "Analista",
    level: "Tático",
    description:
      "Análise de dados, enriquecimento de perfis, correlações e geração de relatórios de inteligência.",
    capabilities: [
      "Link analysis e heatmaps",
      "Enriquecimento de perfis",
      "Geração de relatórios PDF",
      "Correlação de informações",
    ],
    highlight: true,
  },
  {
    role: "Agente de Campo",
    level: "Operacional",
    description:
      "Inserção de dados, registro de abordagens e acesso restrito às próprias entradas.",
    capabilities: [
      "Registro de abordagens",
      "Inserção de dados de campo",
      "Acesso a entradas próprias",
      "Notificações da unidade",
    ],
  },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M2.5 7L5.5 10L11.5 4" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AccessTiers() {
  return (
    <section id="acesso" className="section">
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 16,
            marginBottom: 64,
          }}
        >
          <span className="badge">Hierarquia</span>
          <h2 style={{ fontSize: 28, maxWidth: 480 }}>
            Acesso hierárquico e controlado
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 480 }}>
            Cada função tem acesso exato ao que precisa — nada mais, nada menos.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
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

              {/* Badge */}
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
                  borderTop: tier.highlight
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid var(--rule)",
                  paddingTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {tier.capabilities.map((cap) => (
                  <div
                    key={cap}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
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
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: tier.highlight ? "rgba(250,250,247,0.8)" : "var(--ink)",
                      }}
                    >
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
