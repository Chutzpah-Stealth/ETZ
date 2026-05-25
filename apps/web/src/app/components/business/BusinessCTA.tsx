export default function BusinessCTA() {
  return (
    <section className="section-dark">
      <div
        className="container"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24 }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1px solid rgba(250,250,247,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--blue)" }} />
        </div>

        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--paper)",
            maxWidth: 560,
          }}
        >
          Pronto para proteger seu negócio com inteligência?
        </h2>

        <p style={{ fontSize: 16, color: "rgba(250,250,247,0.55)", maxWidth: 480, lineHeight: 1.65 }}>
          Demonstração disponível para empresas de médio e grande porte.
        </p>

        <button className="btn-light" style={{ marginTop: 8 }}>
          Falar com Especialista
        </button>
      </div>
    </section>
  );
}
