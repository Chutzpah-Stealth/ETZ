import { CalendarCheck, Mail } from "lucide-react";

export default function CtaBand() {
  return (
    <section className="lp-section" id="contato" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cta-band">
          <span className="eyebrow">Solicite uma demonstração</span>
          <h2>Pronto para transformar dados em inteligência?</h2>
          <p>
            Apresentamos o ETZ Defense para a sua instituição e configuramos as unidades,
            os perfis de acesso e as integrações sob medida.
          </p>
          <div className="cta-band-actions">
            <a
              href="https://calendly.com/hanielrolemberg"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--lg"
            >
              <CalendarCheck size={16} />
              Agendar demonstração
            </a>
            <a
              href="mailto:contact@hanielrolemberg.com"
              className="btn btn--secondary btn--lg"
            >
              <Mail size={16} />
              Falar com a equipe
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
