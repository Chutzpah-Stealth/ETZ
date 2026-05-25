const RiskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M10 2L2 17h16L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 8v4M10 14.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FraudIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IntelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2 14l4-4 3 3 5-6 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="4" r="2" fill="currentColor" opacity="0.3" />
  </svg>
);

const ComplianceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const features = [
  {
    icon: RiskIcon,
    title: "Análise de Risco",
    description: "Identificação e monitoramento de riscos corporativos, fornecedores e parceiros em tempo real.",
  },
  {
    icon: FraudIcon,
    title: "Prevenção de Fraudes",
    description: "Detecção de padrões anômalos, comportamentos suspeitos e anomalias financeiras antes que causem dano.",
  },
  {
    icon: IntelIcon,
    title: "Inteligência Competitiva",
    description: "Correlação de dados de mercado para subsidiar decisões estratégicas da liderança executiva.",
  },
  {
    icon: ComplianceIcon,
    title: "Compliance & Auditoria",
    description: "Rastreabilidade completa de operações para conformidade regulatória (LGPD, SOX, ISO 27001).",
  },
];

export default function BusinessFeatures() {
  return (
    <section id="produto-features" className="section-alt">
      <div className="container">
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, marginBottom: 64 }}
        >
          <span className="badge">Módulos</span>
          <h2 style={{ fontSize: 28, maxWidth: 520 }}>
            Uma plataforma completa para inteligência corporativa
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 480 }}>
            Cada módulo projetado para fluxos reais de tomada de decisão em ambientes corporativos críticos.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card card-hover">
                <div className="icon-pill" style={{ width: 44, height: 44, marginBottom: 20 }}>
                  <Icon />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 10 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
