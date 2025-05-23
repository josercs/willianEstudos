Willian Estudo
Sistema web para organização, acompanhamento e análise de estudos escolares.

🚀 Funcionalidades
Cadastro, visualização e edição de horários de estudo
Cards de resumo (Estudos hoje, Concluídos, Tempo estudado)
Gráfico de progresso de estudos
Busca em tempo real na tabela
Paginação dos resultados
Exportação dos dados para CSV
Feedback visual de carregamento e erros
Responsivo para desktop e mobile
📁 Estrutura de Pastas
🛠️ Como rodar o projeto
Clone o repositório

Instale as dependências

Inicie o backend

(ou npx nodemon server.js para recarregamento automático)

Acesse no navegador

🧩 O que cada parte faz
api.js
Funções para buscar, criar, atualizar e deletar horários de estudo via API.

cards.js
Atualiza os cards de resumo (Estudos hoje, Concluídos, Tempo estudado) com base nas estatísticas vindas do backend.

modal.js
Exibe modais de confirmação e mensagens para o usuário.

tabela.js
Renderiza a tabela de estudos, recebendo os dados filtrados e paginados.

utils.js
Funções auxiliares para normalizar status, formatar datas e outros utilitários.

renderer.js
Orquestra toda a interface:

Controla navegação entre abas
Busca em tempo real
Paginação
Exportação CSV
Feedback visual (loading, erros)
Chama as funções dos outros módulos
server.js
Servidor Express, define as rotas da API, serve arquivos estáticos e calcula estatísticas.

📊 Melhorias e próximos passos
Adicionar testes automatizados
Permitir exportação em PDF
Adicionar autenticação de usuário
Melhorar acessibilidade (aria-labels, navegação por teclado)
Otimizar para grandes volumes de dados
📱 Responsividade e acessibilidade
Layout adaptado para desktop e mobile usando Tailwind CSS
Estrutura semântica e preparada para leitores de tela
📝 Licença
MIT

🛠️ Tecnologias  
HTML
CSS
JavaScript
Node.js
Express
Tailwind CSS
CSV
📧 Contato
E-mail:
