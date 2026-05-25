import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ProductPicker from "../components/business/ProductPicker";
import { ETZLogoFull } from "../components/ETZLogo";

export const metadata = {
  title: "ETZ — Plataforma de Inteligência",
  description:
    "ETZ é uma plataforma modular de inteligência de dados para o setor público e corporativo.",
};

export default function HubPage() {
  return (
    <>
      <Nav variant="hub" />
      <main>
        <section
          style={{
            minHeight: "calc(100vh - 60px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px 120px",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 32,
            }}
          >
            {/* Logo full */}
            <div className="fade-up" style={{ marginBottom: 8 }}>
              <ETZLogoFull width={160} height={186} />
            </div>

            {/* Kicker */}
            <span className="badge fade-up delay-1">Plataforma de Inteligência</span>

            {/* Headline */}
            <h1
              className="fade-up delay-3"
              style={{
                fontSize: "clamp(40px, 5.6vw, 72px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                maxWidth: 720,
              }}
            >
              Inteligência que serve quem decide.
            </h1>

            {/* Subheadline */}
            <p
              className="fade-up delay-2"
              style={{
                fontSize: 18,
                color: "var(--muted)",
                maxWidth: 520,
                lineHeight: 1.65,
              }}
            >
              ETZ é uma plataforma modular de inteligência de dados. Escolha o produto
              certo para o seu contexto.
            </p>

            {/* Divider */}
            <div
              className="fade-up delay-3"
              style={{
                width: 48,
                height: 1,
                background: "var(--rule)",
                margin: "8px 0",
              }}
            />

            {/* Product picker */}
            <div className="fade-up delay-4" style={{ width: "100%" }}>
              <ProductPicker />
            </div>
          </div>
        </section>
      </main>
      <Footer variant="hub" />
    </>
  );
}
