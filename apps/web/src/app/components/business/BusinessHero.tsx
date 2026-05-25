const MockBusinessDashboard = () => (
  <div
    style={{
      background: "var(--paper-2)",
      border: "1px solid var(--rule)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
      width: "100%",
      maxWidth: 880,
      margin: "0 auto",
    }}
  >
    {/* Topbar */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid var(--rule)",
        background: "var(--paper)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--rule)" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--rule)" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--rule)" }} />
      </div>
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>ETZ Business — Dashboard Executivo</span>
      <div style={{ width: 60 }} />
    </div>

    <div style={{ padding: "24px 20px 28px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Alertas Ativos", value: "1.240", sub: "+38 hoje" },
          { label: "Risco Monitorado", value: "R$ 4.2M", sub: "3 críticos" },
          { label: "Compliance", value: "98%", sub: "2 pendentes" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--paper)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-lg)",
              padding: 16,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Risk feed */}
      <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "var(--radius-lg)", padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Eventos recentes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { action: "Anomalia detectada — Fornecedor #42", level: "Alto", time: "5min" },
            { action: "Relatório de compliance gerado", level: "Info", time: "22min" },
            { action: "Novo parceiro adicionado ao monitoramento", level: "Médio", time: "1h" },
          ].map((item) => (
            <div
              key={item.action}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid var(--rule-soft)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--blue-soft)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{item.action}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Nível: {item.level}</div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function BusinessHero() {
  return (
    <section id="produto" className="section">
      <div className="container">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24, marginBottom: 64 }}>
          <span className="badge fade-up">Inteligência Corporativa</span>

          <h1
            className="fade-up delay-1"
            style={{ fontSize: "clamp(40px, 5.6vw, 72px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: 800 }}
          >
            Inteligência corporativa<br />para decisões que importam.
          </h1>

          <p
            className="fade-up delay-2"
            style={{ fontSize: 18, fontWeight: 400, color: "var(--muted)", maxWidth: 560, lineHeight: 1.65 }}
          >
            ETZ Business centraliza dados internos e externos para detectar riscos,
            prevenir fraudes e apoiar decisões estratégicas em tempo real.
          </p>

          <div className="fade-up delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-primary">Falar com Especialista</button>
            <button className="btn-outline">Ver como funciona</button>
          </div>
        </div>

        <div className="fade-up delay-4">
          <MockBusinessDashboard />
        </div>
      </div>
    </section>
  );
}
