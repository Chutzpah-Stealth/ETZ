"use client";

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2L3 6.5V12c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6.5L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8.5 12l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="3" width="8" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="9" width="8" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 8h2M6 12h2M6 16h2M16 14h2M16 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function ProductPicker() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 20,
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      {/* ETZ Defense */}
      <a
        href="/defense"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          background: "var(--ink)",
          borderRadius: "var(--radius-xl)",
          padding: 32,
          textDecoration: "none",
          transition: "transform var(--transition-slow), box-shadow var(--transition-slow)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-4px)";
          el.style.boxShadow = "var(--shadow-lg)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-pill)",
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--paper)",
            }}
          >
            <ShieldIcon />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(250,250,247,0.5)",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "var(--radius-pill)",
              padding: "4px 10px",
            }}
          >
            Setor Público
          </span>
        </div>

        <div>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--paper)",
              marginBottom: 10,
            }}
          >
            ETZ Defense
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "rgba(250,250,247,0.6)",
              lineHeight: 1.65,
            }}
          >
            Para forças de segurança pública e defesa nacional. Inteligência operacional contra o crime organizado.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--paper)",
            marginTop: "auto",
            paddingTop: 8,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Ver ETZ Defense
          <ArrowRight />
        </div>
      </a>

      {/* ETZ Business */}
      <a
        href="/business"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          background: "var(--paper)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--radius-xl)",
          padding: 32,
          textDecoration: "none",
          transition: "transform var(--transition-slow), box-shadow var(--transition-slow), border-color var(--transition-slow)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-4px)";
          el.style.boxShadow = "var(--shadow-lg)";
          el.style.borderColor = "var(--blue)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
          el.style.borderColor = "var(--rule)";
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div
            className="icon-pill"
            style={{
              width: 52,
              height: 52,
              color: "var(--blue)",
            }}
          >
            <BuildingIcon />
          </div>
          <span className="badge">Corporativo</span>
        </div>

        <div>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              marginBottom: 10,
            }}
          >
            ETZ Business
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "var(--muted)",
              lineHeight: 1.65,
            }}
          >
            Para grandes empresas e operações críticas de mercado. Proteção, conformidade e inteligência competitiva.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--blue)",
            marginTop: "auto",
            paddingTop: 8,
            borderTop: "1px solid var(--rule-soft)",
          }}
        >
          Ver ETZ Business
          <ArrowRight />
        </div>
      </a>
    </div>
  );
}
