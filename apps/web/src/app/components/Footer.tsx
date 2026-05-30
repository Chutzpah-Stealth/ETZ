import { ETZLogoMark } from "./ETZLogo";

const disclaimer = "Uso exclusivo de forças de segurança pública.";

export default function Footer({ variant = "defense" }: { variant?: "defense" }) {
  return (
    <footer
      style={{
        background: "var(--paper-2)",
        borderTop: "1px solid var(--rule)",
        padding: "48px 0",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Left — logo + copyright */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ETZLogoMark size={20} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted)",
            }}
          >
            © 2026 ETZ Intelligence
            <br />
            <span style={{ fontSize: 11, opacity: 0.6 }}>Owned by Chutzpah Stealth</span>
          </span>
        </div>

        {/* Center — disclaimer */}
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            textAlign: "center",
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          {disclaimer}
        </p>

        {/* Right — signature */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span
            title="Verdade"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: "0.05em",
              opacity: 0.4,
              fontFamily: "serif",
              userSelect: "none",
            }}
          >
            אמת
          </span>
        </div>
      </div>
    </footer>
  );
}
