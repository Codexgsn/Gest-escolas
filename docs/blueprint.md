# **App Name**: SchoolZenith

## Core Features:

- Autenticação e Usuários: Login e Logout (login.html / register.html / rotas em app.py). Criação de conta, autenticação de usuário, sessão. Permite controle de permissões (usuário comum ou admin).
- Gerenciamento de Usuários: Cadastro de novos usuários pelo admin. Edição/remoção de usuários existentes.
- Reservas de Salas/Objetos: Criar Reserva: Seleção de sala, data e horário. Possível descrição ou finalidade da reserva.
- Editar/Cancelar Reserva: Alteração de dados de uma reserva existente.
- Visualização de Reservas: Listagem completa de reservas, possivelmente com filtros (data, usuário). Interface para administradores gerenciarem todas as reservas.
- Dashboard Administrativo - Visão Geral: Estatísticas: total de reservas, usuários, salas mais utilizadas. Indicadores em tempo real ou resumo diário/semanal.
- Administração Geral: Controle central para o administrador (usuários, reservas, configurações).
- Design e Experiência - Base de Layout: Template principal com header, menu e rodapé para reaproveitamento.
- CSS Personalizado: Estilização do painel administrativo e páginas públicas.
- Automated Conflict Detection: Alertar a equipe ao criar reservas que se sobrepõem no tempo ou na alocação de recursos, evitando a reserva dupla de recursos. Usa uma ferramenta para determinar se uma reserva deve ou não ser feita, dadas informações conflitantes.
- Resource Catalog: Fornecer um catálogo navegável de todos os recursos reserváveis, incluindo detalhes como capacidade, equipamentos e disponibilidade. Exibir locais em referência ao mapa do campus
- Reporting and Analytics: Gerar relatórios sobre a utilização de recursos, tendências de reserva e horários populares para recursos específicos.
- User Authentication and Roles: Autenticar usuários de forma segura e atribuir permissões baseadas em função para controlar o acesso às funções de reserva. A função de convidado teria acesso limitado
- Waitlist Management: Ativar um sistema de lista de espera para recursos totalmente reservados. Notificar os usuários quando um slot se torna disponível devido a cancelamentos.

## Style Guidelines:

- Cor primária: Azul profundo (#3F51B5) para transmitir confiança, confiabilidade e inteligência, adequado para um ambiente educacional.
- Cor de fundo: Cinza claro (#F0F2F5), quase branco, para criar um cenário limpo e profissional.
- Cor de destaque: Laranja (#FF9800) para chamar a atenção para elementos interativos-chave e chamadas para ação, como botões de reserva ou alertas importantes.
- Fonte do corpo e do título: 'Inter' sans-serif, para uma sensação moderna e objetiva em toda a interface.
- Use um conjunto consistente de ícones simples e profissionais de uma biblioteca como Material Icons. Garanta que os ícones sejam intuitivos e ofereçam suporte à funcionalidade do aplicativo.
- Empregue um sistema de layout baseado em grade para manter a consistência e o alinhamento em todas as visualizações. Utilize o espaço em branco de forma eficaz para criar uma interface de usuário equilibrada e organizada.
- Incorpore transições e animações sutis para aprimorar a experiência do usuário, como efeitos de fade no carregamento de páginas e feedback interativo em pressionamentos de botão.