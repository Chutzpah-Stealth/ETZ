const steps = [
  {
    title: "Busca",
    description: "Filtra a base interna ou consulta bases externas com filtros avançados.",
  },
  {
    title: "Triagem",
    description: "Analisa os resultados com etiquetas de origem e nível de risco.",
  },
  {
    title: "Enriquecimento",
    description: "Cruza dados externos com internos e adiciona notas de inteligência.",
  },
  {
    title: "Correlação",
    description: "Cria vínculos manuais e mapeia a hierarquia das organizações.",
  },
  {
    title: "Relatório",
    description: "Gera o insight que subsidia a operação do gestor e dos agentes.",
  },
];

export default function Workflow() {
  return (
    <section className="lp-section-alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Fluxo de trabalho do analista</span>
          <h2>Cinco passos do dado à operação.</h2>
        </div>

        <div className="flow">
          {steps.map(({ title, description }) => (
            <div key={title} className="step-card">
              <div className="step-n" />
              <h4>{title}</h4>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
