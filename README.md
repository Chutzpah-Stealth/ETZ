# ETZ


Front web: Next js

Mobile Expo (typescript)

Backend Nest.js 

Vercel + fastfy
Melhore este readme.

Foco do sistema : acessoramento na Segurança pública. 

A ideia é inserir e gerenciar informações de abordagens policiais feitas por eles mesmos. Eles registram informações sobre indivíduos, fatos ocorridos, veículos. cada modulo desses três são informações. 

No cadastro de indivíduos, pode-se ter essas informações:
Informações Básicas
Nome Completo *
Insira o nome completo
Data de Nascimento
dd/mm/aaaa
Nome do Pai
Nome do pai
Nome da Mãe
Nome da mãe
Gênero
Selecione o gênero

Estado Civil
Selecione o estado civil

Nacionalidade
Insira a nacionalidade
Área de Atuação
Área de atuação
Apelidos
Adicionar Apelido
Descrição
Descrição geral do indivíduo...
Números de Documentos
CPF
000.000.000-00
RG
Insira o número do RG
Passaporte
Insira o número do passaporte
Informações de Contato
Telefones
Adicionar Telefone
E-mails
Adicionar E-mail
Endereços
Adicionar Endereço
Informações Criminais
Tipo de Vínculo
Selecione o tipo de vínculo

Veículos

Possui Mandado de Prisão
Crimes
Adicionar Crime
Informações Penitenciárias
Pavilhão
Pavilhão
Ala
Ala
Cela
Cela
Status Prisional
Em Liberdade

Análise de Risco
Status
Investigado

Nível de Risco
Baixo

Nível de Acesso
Operador

Notas de Inteligência
Insira observações e notas de inteligência...
Anexos
Carregar Documentos


Lembrando que pode-se tanto inserir, editar, excluir, etc.

a ideia é organizar o máximo de informações sobre criminosos, orcrim, etc.

Eu quero que esse sistema sirva de análise de vínculos, de forma que se possa lincar indivíduos a crimes, fraudes, sequestros, organizações criminosas, uma ferramenta de inteligência.


Seria dividida em acessos:
Acesso Institucional (cadastrado como instituição, com vários líderes, vários analistas, vários agentes de campo/policial do dia a dia).
Acesso Equipe (acesso para o líder - nível estratégico que tem todos os acessos, visualizando principalmente o dashboard, a parte de insights, mas pode também fazer inserção, esse é o mais completo, o analista no nível tático que pode fazer a análise dos dados, fazer vínculos, consultar todos os dados, fornecer relatórios, insigts, o indivíduo que está na rua puxando informações - que é o agente de campo ou o policial do dia a dia, mais restrito aos dados que o usuário dele insere e podendo inserir novos dados). 

Acesso Pessoal (uma única pessoa com todos os acessos).


Quero que tenha os seguintes menus:

Dashboard
QTC (um modulo só para registro de novas informações (podendo mencionar organização criminal, indivíduo, veículos etc).
Indivíduos (podendo adicionar, visualizar, editar, excluir), pesquisar, etc.
Relatórios 
Dados (aqui aparece uma lista de todos os indivíduos cadastrados - dependendo do nível de acesso), podendo exportar (planilha, pdf)
Análise ( uma interface interativa que correlacione criminosos) - Visualização de rede de entidades (node-link diagram) para análise de vínculos, podendo editar de forma que já resulte diretamente na base de dados.

Para o super usuário, aparece logs de auditoria, gestão de usuários (podendo editar os níveis de acesso, fornecer acesso, linkar a uma estrutura pai/filho (indivíduo à equipe ou à instituição), o status dos usuários, excluir, etc)


outra coisa extremamente importante é a segurança. 
