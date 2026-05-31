const HexLogoSmall = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 L28.12 9 L28.12 23 L16 30 L3.88 23 L3.88 9 Z" stroke="var(--accent)" strokeWidth="2" fill="var(--accent-tint)" />
    <circle cx="16" cy="16" r="2.4" fill="var(--accent)" />
  </svg>
);

export default function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="wrap">
        <div className="lp-footer-top">
          {/* coluna marca */}
          <div className="lp-footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HexLogoSmall />
              <div className="lp-brand-wd" style={{ fontSize: 15 }}>
                <b>ETZ</b> <span className="df" style={{ fontSize: 11 }}>DEFENSE</span>
              </div>
            </div>
            <p className="lp-footer-blurb">
              Assessoramento à Segurança Pública e à defesa nacional. Inteligência no
              combate ao crime organizado.
            </p>
          </div>

          {/* produto */}
          <div className="lp-footer-col">
            <h5>Produto</h5>
            <a href="#modulos">Módulos</a>
            <a href="#acessos">Níveis de acesso</a>
            <a href="#analise">Análise &amp; vínculos</a>
            <a href="#seguranca">Segurança</a>
          </div>

          {/* instituição */}
          <div className="lp-footer-col">
            <h5>Instituição</h5>
            <a href="#">Sobre</a>
            <a href="#">Conformidade</a>
            <a href="#contato">Contato</a>
            <a href="#">Suporte</a>
          </div>

          {/* legal */}
          <div className="lp-footer-col">
            <h5>Legal</h5>
            <a href="#">Termos de uso</a>
            <a href="#">Privacidade &amp; LGPD</a>
            <a href="#">Política de dados</a>
          </div>
        </div>

        <div className="lp-footer-legal">
          <span>© 2026 ETZ Defense · Uso institucional controlado</span>
          <span>Acesso restrito · Dados classificados</span>
        </div>
      </div>
    </footer>
  );
}
