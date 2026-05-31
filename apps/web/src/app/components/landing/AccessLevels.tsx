import { Check } from "lucide-react";

const roles = [
  {
    tier: "Nível estratégico",
    title: "Gestor",
    items: [
      "Acesso completo à sua unidade ou unidades",
      "Dashboards e insights gerais",
      "Inserção e gestão de dados",
      "Controle de acessos e colaboração entre unidades",
    ],
  },
  {
    tier: "Nível tático",
    title: "Analista",
    items: [
      "Análise de dados e vínculos da unidade",
      "Consulta completa e correlação",
      "Enriquecimento via OSINT e bases externas",
      "Geração de relatórios e insights",
    ],
  },
  {
    tier: "Nível operacional",
    title: "Agente de Campo",
    items: [
      "Inserção de novos dados no campo",
      "Acesso restrito aos dados que inseriu",
      "Registro de abordagens e ocorrências",
      "Métricas do próprio trabalho operacional",
    ],
  },
];

export default function AccessLevels() {
  return (
    <section className="lp-section-alt" id="acessos">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Acesso institucional</span>
          <h2>Hierarquia que respeita a cadeia de comando.</h2>
          <p>
            Três níveis, cada um com o alcance certo. O indivíduo acessa apenas os dados
            da própria unidade — nunca de outras.
          </p>
        </div>

        <div className="roles">
          {roles.map(({ tier, title, items }) => (
            <div key={title} className="role">
              <span className="role-tier">{tier}</span>
              <h3>{title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>
                    <Check size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
