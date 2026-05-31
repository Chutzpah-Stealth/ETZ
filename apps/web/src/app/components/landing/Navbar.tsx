"use client";

import { CalendarCheck } from "lucide-react";

const HexLogo = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 L28.12 9 L28.12 23 L16 30 L3.88 23 L3.88 9 Z" stroke="var(--accent)" strokeWidth="2" fill="var(--accent-tint)" />
    <path d="M16 8.5 L22.36 12.25 L22.36 19.75 L16 23.5 L9.64 19.75 L9.64 12.25 Z" stroke="var(--accent)" strokeWidth="1.25" fill="none" opacity="0.45" />
    <circle cx="16" cy="16" r="2.4" fill="var(--accent)" />
  </svg>
);

export default function Navbar() {
  return (
    <header className="lp-nav">
      <div className="wrap lp-nav-row">
        <a href="/defense" className="lp-brand">
          <HexLogo />
          <div className="lp-brand-wd">
            <b>ETZ</b> <span className="df">DEFENSE</span>
          </div>
        </a>

        <nav className="lp-nav-links">
          <a href="#modulos">Módulos</a>
          <a href="#acessos">Níveis de acesso</a>
          <a href="#analise">Análise</a>
          <a href="#seguranca">Segurança</a>
        </nav>

        <div className="lp-nav-actions">
          <a href="/login" className="btn btn--ghost btn--sm">
            Acessar plataforma
          </a>
          <a href="#contato" className="btn btn--primary btn--sm">
            <CalendarCheck size={14} />
            Solicitar demonstração
          </a>
        </div>
      </div>
    </header>
  );
}
