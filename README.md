# ETZ - Sistema de Inteligência para Segurança Pública

## 📋 Sobre o Projeto

Sistema de assessoramento em Segurança Pública desenvolvido para auxiliar forças policiais no gerenciamento e análise de informações de abordagens, indivíduos, ocorrências e veículos. Uma ferramenta completa de inteligência policial com foco em análise de vínculos e correlação de dados criminais.

## 🎯 Objetivo

Fornecer uma plataforma integrada para:
- Registro e gerenciamento de informações de abordagens policiais
- Análise de vínculos entre indivíduos, crimes e organizações criminosas
- Geração de relatórios e insights estratégicos
- Visualização interativa de redes criminosas
- Suporte à tomada de decisões operacionais e estratégicas

## 🛠️ Stack Tecnológica

- **Frontend Web:** Next.js
- **Mobile:** Expo (TypeScript)
- **Backend:** Nest.js
- **Infraestrutura:** Vercel + Fastify
- **Banco de Dados:** Firebase Firestore (NoSQL)
- **Autenticação:** Firebase Authentication
- **Armazenamento de Arquivos:** Firebase Storage

### 🔥 Firebase (Plano Gratuito - Spark)

O projeto utiliza o Firebase no plano gratuito (Spark Plan), que não requer cartão de crédito e oferece:

**Firestore Database:**
- 1 GB de armazenamento
- 50.000 leituras/dia
- 20.000 escritas/dia
- 20.000 exclusões/dia

**Firebase Authentication:**
- Autenticação ilimitada
- Suporte a múltiplos provedores (Email/Senha, Google, etc.)
- Gerenciamento de usuários e permissões

**Firebase Storage:**
- 5 GB de armazenamento
- 1 GB/dia de transferência de download
- 20.000 uploads/dia

**Funcionalidades utilizadas:**
- Gerenciamento de usuários e autenticação
- Armazenamento de dados de indivíduos, ocorrências e veículos
- Upload de anexos (fotos, documentos, evidências)
- Controle de acesso baseado em regras de segurança
- Sincronização em tempo real entre plataformas web e mobile

## 🔐 Níveis de Acesso

### 1. Acesso Institucional
Sistema hierárquico para instituições com múltiplos níveis:

- **Líder (Nível Estratégico)**
  - Acesso completo ao sistema
  - Visualização de dashboards e insights
  - Capacidade de inserção e gestão de dados
  - Visão geral de todas as operações

- **Analista (Nível Tático)**
  - Análise de dados e vínculos
  - Consulta completa aos dados
  - Geração de relatórios e insights
  - Correlação de informações

- **Agente de Campo / Policial Operacional**
  - Inserção de novos dados
  - Acesso restrito aos dados que inseriu
  - Registro de abordagens e ocorrências

### 2. Acesso Equipe
Estrutura simplificada para equipes menores com os mesmos níveis de permissão.

### 3. Acesso Pessoal
Acesso individual com todas as funcionalidades disponíveis.

## 📊 Módulos do Sistema

### Dashboard
Visão geral com estatísticas, métricas e insights principais do sistema.

### QTC (Quadro de Transmissão de Conhecimento)
Módulo para registro de novas informações:
- Registros avulsos de novidades
- Menção a organizações criminosas
- Referência a indivíduos e veículos
- Anotações operacionais

### Indivíduos
Cadastro completo de pessoas de interesse com:

#### Informações Básicas
- Nome completo (obrigatório)
- Data de nascimento
- Filiação (nome do pai e mãe)
- Gênero
- Estado civil 
- Conjuge
- Filhos
- Nacionalidade
- Área de atuação
- Tatuagens/Marcas
- Apelidos/Alcunhas
- Descrição geral
- Veículos relacionados

#### Documentos
- CPF
- RG
- Passaporte

#### Contatos
- Telefones (múltiplos)
- E-mails (múltiplos)
- Endereços (múltiplos)

#### Informações Criminais
- Rostos
- Tipo de vínculo (Familiar, Profissional,Criminal, Social, outro )
- Organizações
- Mandados de prisão (Número, mais informações)
- Crimes associados
- Pessoas Vinculadas

#### Informações Penitenciárias
- Pavilhão
- Ala
- Cela
- Status prisional

#### Análise de Risco
- Status (Investigado, Suspeito, etc.)
- Nível de risco (Baixo, Médio, Alto)
- Nível de acesso
- Notas de inteligência

#### Anexos
- Upload de documentos
- Fotos
- Evidências

**Funcionalidades:** Adicionar, visualizar, editar, excluir e pesquisar indivíduos.

### Relatórios

#### Dados
- Listagem completa de indivíduos cadastrados
- Filtros por nível de acesso
- Exportação em múltiplos formatos:
  - Planilha Excel
  - CSV
  - PDF

#### Análise
Interface interativa para análise de vínculos:
- Visualização de rede de entidades (Node-Link Diagram)
- Correlação entre criminosos
- Edição em tempo real com sincronização no banco de dados
- Identificação de padrões e conexões
- Análise de organizações criminosas

### Administração (Super Usuário)

**Contas disponíveis:**
- Usuário Tester
- Usuário ADM

**Funcionalidades administrativas:**
- Logs de auditoria completos
- Gestão de usuários
  - Edição de níveis de acesso
  - Concessão e revogação de permissões
  - Estrutura hierárquica (pai/filho)
  - Vinculação a equipes ou instituições
  - Gerenciamento de status
  - Exclusão de usuários

## 🔒 Segurança

A segurança é uma prioridade crítica do sistema, incluindo:
- Autenticação robusta
- Controle de acesso baseado em funções (RBAC)
- Criptografia de dados sensíveis
- Logs de auditoria
- Trilhas de auditoria para todas as operações
- Conformidade com LGPD e normas de proteção de dados

## 🚀 Funcionalidades Principais

- ✅ Gerenciamento completo de indivíduos
- ✅ Registro de abordagens e ocorrências
- ✅ Análise de vínculos criminais
- ✅ Visualização de redes criminosas
- ✅ Geração de relatórios customizados
- ✅ Dashboard com insights estratégicos
- ✅ Sistema de permissões hierárquico
- ✅ Logs de auditoria completos
- ✅ Exportação de dados em múltiplos formatos
- ✅ Interface mobile para operações em campo

## 📱 Plataformas

- **Web:** Interface completa para análise e gestão
- **Mobile:** App nativo para registro em campo

---

**Nota:** Sistema desenvolvido para uso exclusivo de forças de segurança pública autorizadas. 
