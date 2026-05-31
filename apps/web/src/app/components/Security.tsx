const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M10 2L3 5.5V10c0 4 3.5 7 7 8 3.5-1 7-4 7-8V5.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="13.5" r="1.5" fill="currentColor" />
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="8" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11.5 11.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 15l1.5 1.5M13.5 13.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AuditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 7h8M6 10h5M6 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="15" cy="13" r="2.5" fill="var(--blue-soft)" stroke="currentColor" strokeWidth="1.2" />
    <path d="M14.3 13l.5.5 1-1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const items = [
  {
    icon: ShieldIcon,
    title: "LGPD Compliant",
    description:
      "Conformidade total com a Lei Geral de Proteção de Dados e normas de proteção de informações sensíveis.",
  },
  {
    icon: LockIcon,
    title: "Controle de Acesso (RBAC)",
    description:
      "Cada usuário vê apenas o que sua função permite. Hierarquia aplicada em cada requisição.",
  },
  {
    icon: KeyIcon,
    title: "Criptografia de Dados",
    description:
      "Dados sensíveis criptografados em repouso e em trânsito. Classificações até TS/SCI e SAP.",
  },
  {
    icon: AuditIcon,
    title: "Logs de Auditoria",
    description:
      "Rastreabilidade completa de todas as operações — quem acessou, editou e quando.",
  },
];

export default function Security() {
  return (
    <section id="segurança" className="section-alt">
      <div className="container">
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
          <span className="badge">Segurança</span>
          <h2 style={{ fontSize: 28, maxWidth: 480 }}>
            Construído para dados sensíveis
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 480 }}>
            Segurança não é uma camada — é a arquitetura.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            maxWidth: 880,
            margin: "0 auto",
          }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  gap: 16,
                  background: "var(--paper)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-xl)",
                  padding: 24,
                }}
              >
                <div className="icon-pill" style={{ width: 44, height: 44, flexShrink: 0 }}>
                  <Icon />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      marginBottom: 6,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
