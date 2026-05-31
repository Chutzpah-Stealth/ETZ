import { ShieldCheck, Building2, GitCompare, BellRing, GitMerge, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ShieldCheck,
    title: "Classificação de acesso",
    description:
      "De Confidencial a SAP (Acknowledged, Unacknowledged e Waived). O gestor controla o que cada usuário enxerga a partir da classificação de cada alvo e caso.",
  },
  {
    icon: Building2,
    title: "Isolamento por unidade",
    description:
      "Os dados pertencem à unidade. Nenhum usuário acessa informações de outra unidade sem autorização explícita.",
  },
  {
    icon: GitCompare,
    title: "Validação cruzada",
    description:
      "Checagem automática de CPF e documentos em tempo real para evitar duplicações entre as inserções da mesma unidade.",
  },
  {
    icon: BellRing,
    title: "Notificações em tempo real",
    description:
      "Alertas de soltura, novos mandados, vínculos suspeitos e QTCs chegam a toda a unidade no momento em que são registrados.",
  },
  {
    icon: GitMerge,
    title: "Colaboração entre unidades",
    description:
      "Compartilhamento controlado de alvos e casos, mediado e aprovado pelo administrador — sem quebrar a hierarquia.",
  },
  {
    icon: Lock,
    title: "Chain of custody",
    description:
      "Trilha de provas e custódia de evidências preservam a integridade da informação do registro à operação.",
  },
];

export default function Security() {
  return (
    <section className="lp-section" id="seguranca">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Segurança &amp; governança</span>
          <h2>Cada dado no nível de sigilo correto.</h2>
          <p>
            Classificação de acesso, controle por unidade e colaboração aprovada — a
            informação certa, para a pessoa certa, com rastreabilidade.
          </p>
        </div>

        <div className="feat-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="feat">
              <div className="feat-ic">
                <Icon size={19} />
              </div>
              <div>
                <h4>{title}</h4>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
