const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 14.5h7M14.5 11v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

const NetworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="3.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="16.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="3.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="16.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 5.5L8.5 8.5M14.5 5.5L11.5 8.5M5 14.5L8.5 11.5M14.5 14.5L11.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ReportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 7h6M7 10.5h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const features = [
  {
    icon: DashboardIcon,
    title: "Dashboard",
    description:
      "Visão unificada por unidade com KPIs específicos para Gestor, Analista e Agente de Campo.",
  },
  {
    icon: TargetIcon,
    title: "Alvos",
    description:
      "Cadastro completo de indivíduos com análise de risco, documentos, vínculos e histórico criminal.",
  },
  {
    icon: NetworkIcon,
    title: "Análise de Vínculos",
    description:
      "Link analysis visual, heatmaps e correlação de redes criminosas em tempo real.",
  },
  {
    icon: ReportIcon,
    title: "Relatórios",
    description:
      "Geração de relatórios em PDF com chain of custody e controle de classificação.",
  },
];

export default function Features() {
  return (
    <section id="produto-features" className="section-alt">
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
          <span className="badge">Módulos</span>
          <h2 style={{ fontSize: 28, maxWidth: 520 }}>
            Uma plataforma completa para inteligência policial
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 480 }}>
            Cada módulo projetado para fluxos reais de trabalho em inteligência de segurança pública.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="card card-hover"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="icon-pill"
                  style={{ width: 44, height: 44, marginBottom: 20 }}
                >
                  <Icon />
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                  }}
                >
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
