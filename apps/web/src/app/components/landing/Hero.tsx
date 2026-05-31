import { CalendarCheck, Building2, ShieldCheck, Lock } from "lucide-react";
import ProductMock from "./ProductMock";

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
          {/* lado esquerdo */}
          <div>
            <span className="hero-eyebrow">
              Plataforma de inteligência · Segurança Pública &amp; Defesa
            </span>

            <h1>Da informação dispersa à inteligência operacional.</h1>

            <p className="hero-lede">
              O ETZ Defense centraliza alvos, casos e vínculos em uma plataforma segura,
              hierárquica e classificada — para Polícias, Forças de Segurança e órgãos de
              defesa nacional combaterem o crime organizado com precisão.
            </p>

            <div className="hero-cta">
              <a href="#contato" className="btn btn--primary btn--lg">
                <CalendarCheck size={16} />
                Solicitar demonstração
              </a>
              <a href="#modulos" className="btn btn--secondary btn--lg">
                Conhecer os módulos
              </a>
            </div>

            <div className="hero-trust">
              <span className="hero-trust-item">
                <Building2 size={15} color="var(--accent)" />
                Operação por unidade
              </span>
              <span className="hero-trust-item">
                <ShieldCheck size={15} color="var(--accent)" />
                Acesso por classificação
              </span>
              <span className="hero-trust-item">
                <Lock size={15} color="var(--accent)" />
                Trilha de custódia
              </span>
            </div>
          </div>

          {/* lado direito: mock do produto */}
          <ProductMock />
        </div>
      </div>
    </section>
  );
}
