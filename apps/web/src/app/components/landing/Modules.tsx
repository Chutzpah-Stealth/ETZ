import { LayoutDashboard, Target, FolderSearch, Radio, Share2, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const modules: { icon: LucideIcon; title: string; description: string; who: string }[] = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Métricas e insights por perfil de acesso — operações, apreensões, prisões e QTCs gerados, com indicadores próprios para Gestor, Analista e Agente.",
    who: "Todos os perfis",
  },
  {
    icon: Target,
    title: "Alvos",
    description:
      "Cadastro completo: dados pessoais, documentos, contatos, vínculos, histórico criminal, situação penitenciária, risco e classificação de acesso.",
    who: "Todos os perfis",
  },
  {
    icon: FolderSearch,
    title: "Casos",
    description:
      "Gestão de casos com modus operandi, áreas de atuação e chain of custody — trilha de provas e evidências com integridade preservada.",
    who: "Toda a unidade",
  },
  {
    icon: Radio,
    title: "QTC",
    description:
      "Quadro de Transmissão de Conhecimento: registro ágil de novidades, menções a organizações, alvos e veículos, e anotações operacionais.",
    who: "Toda a unidade",
  },
  {
    icon: Share2,
    title: "Análise & Vínculos",
    description:
      "Enriquecimento de dados, link analysis visual, correlação de redes criminais e consulta federada a bases externas — tudo sem sair da plataforma.",
    who: "Analista",
  },
  {
    icon: FileText,
    title: "Relatórios",
    description:
      "Geração de relatórios de inteligência em PDF, vinculando casos e alvos — do dado bruto à decisão que motiva a operação.",
    who: "Analista",
  },
];

export default function Modules() {
  return (
    <section className="lp-section" id="modulos">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Módulos do sistema</span>
          <h2>Tudo o que a unidade precisa, em uma plataforma.</h2>
          <p>
            Da coleta no campo à inteligência estratégica — cada módulo conversa com o
            próximo, sempre dentro dos limites da sua unidade.
          </p>
        </div>

        <div className="mod-grid">
          {modules.map(({ icon: Icon, title, description, who }) => (
            <div key={title} className="mod">
              <div className="mod-ic">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="mod-who">{who}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
