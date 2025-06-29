# Trab1_Humberto_31323
Trabalho1 de Programação Web 



Trabalho1_PW - Sistema de Gestão de Alunos e Cursos
Este projeto é um sistema web simples para gerir alunos e cursos, dividido em um backend (Node.js/Express) e um frontend (HTML/CSS/JavaScript puro). Ele simula um sistema de autenticação e permite operações CRUD (Criar, Ler, Atualizar, Deletar) sobre dados de alunos e cursos armazenados num ficheiro JSON mock.

🚀 Visão Geral do Projeto
O objetivo principal deste projeto é demonstrar:

Um backend em Node.js com Express para servir ficheiros estáticos e uma API RESTful.

Um frontend construído com HTML, CSS e JavaScript puro para interagir com o backend.

Um fluxo de autenticação básico.

Operações de pesquisa e gestão de dados (alunos e cursos).

🛠️ Pré-requisitos
Antes de iniciar o projeto, certifique-se de ter o seguinte software instalado na sua máquina:

Node.js: Download oficial do Node.js (versão LTS recomendada).

npm (Node Package Manager): Vem com o Node.js.

Um editor de código, como VS Code.

📂 Estrutura do Projeto
A estrutura de pastas do projeto é organizada da seguinte forma:

Trab1_Humberto_31323/
├── backend/
│   ├── node_modules/       # Dependências do backend
│   ├── server.js           # Servidor Node.js (API e servidor de arquivos estáticos)
│   ├── package.json        # Configurações e dependências do backend
│   └── package-lock.json
├── frontend/
│   ├── node_modules/       # Dependências do frontend (se houver, ex: Bootstrap)
│   ├── dashboard.html      # Página do dashboard com pesquisa
│   ├── dashboard.js        # Lógica JavaScript para o dashboard
│   ├── index.html          # Página principal (Menu Inicial) com barra lateral
│   ├── index.js            # Lógica JavaScript para o menu inicial
│   ├── listaraluno.js      # Lógica JavaScript para gestão de alunos
│   ├── listaralunos.html   # Página para listar e gerir alunos
│   ├── listarcursos.html   # Página para listar e gerir cursos
│   ├── listarcursos.js     # Lógica JavaScript para gestão de cursos
│   ├── login.html          # Página de autenticação de login
│   ├── login.js            # Lógica JavaScript para o login
│   └── (outros ficheiros CSS/JS auxiliares se existirem)
├── mock-data/
│   └── bd.json             # Ficheiro JSON que simula o banco de dados
├── package.json            # Ficheiro principal de dependências (se for um monorepo)
├── package-lock.json
└── README.md               # Este ficheiro de documentação

⚙️ Configuração e Execução do Backend
O backend é responsável por servir as páginas HTML/CSS/JS e fornecer a API RESTful para a gestão de alunos e cursos.

Instalação das Dependências:
Abra o seu terminal (ou Prompt de Comando/PowerShell).

Navegue até a pasta backend do seu projeto:

cd Trab1_Humberto_31323/backend

Instale as dependências Node.js (Express, CORS, etc.):

npm install

Executando o Servidor:
Ainda na pasta backend no terminal, execute o servidor:

node server.js

Você deverá ver a mensagem no terminal: Servidor rodando na porta 3000.

Funcionalidades do backend/server.js:
Serviço de Ficheiros Estáticos: Serve todos os ficheiros (HTML, CSS, JS, imagens) da pasta frontend/.

Autenticação Básica:

Usa uma variável isAuthenticated para controlar o acesso.

O middleware checkAuth redireciona utilizadores não autenticados para a página de login.

Rota /login (POST): Autentica o utilizador. As credenciais são admin / admin.

API para Alunos (/alunos):

GET /alunos: Retorna todos os alunos do bd.json.

POST /alunos: Adiciona um novo aluno ao bd.json.

DELETE /alunos/:id: Deleta um aluno pelo ID do bd.json.

API para Cursos (/cursos):

GET /cursos: Retorna todos os cursos do bd.json.

POST /cursos: Adiciona um novo curso ao bd.json.

DELETE /cursos/:id: Deleta um curso pelo ID do bd.json.

Gestão de Erros: Middleware para lidar com rotas não encontradas (404) e erros internos do servidor (500).

🖥️ Configuração e Uso do Frontend
O frontend é a interface de utilizador que interage com o backend.

Acesso à Aplicação:
Com o servidor backend em execução (veja a secção anterior), abra o seu navegador.

Aceda à URL: http://localhost:3000/

Você será redirecionado para a página de login.

Credenciais de Login:
Para aceder à aplicação:

Usuário: admin

Senha: admin

Após o login bem-sucedido, você será redirecionado para o Dashboard.

Páginas do Frontend:
login.html: A primeira página que o utilizador vê. Possui um formulário para autenticação.

index.html: A página do "Menu Inicial" que se torna acessível após o login. Contém uma barra lateral de navegação para outras seções.

dashboard.html: O painel de controlo principal. Permite pesquisar alunos e cursos (mostrando um "snippet" do resultado) e tem links para as páginas de gestão completas.

listaralunos.html: Permite visualizar a lista completa de alunos, adicionar novos alunos e deletar alunos existentes.

listarcursos.html: Permite visualizar a lista completa de cursos, adicionar novos cursos e deletar cursos existentes.

Ficheiros JavaScript do Frontend:
Cada ficheiro JS é responsável pela lógica de sua respetiva página/funcionalidade:

login.js: Envia as credenciais para o backend e redireciona após login/logout.

index.js: Controla a funcionalidade da barra lateral de navegação em index.html.

dashboard.js: Lida com a busca de dados de alunos e cursos e a lógica de pesquisa/exibição de snippets no dashboard.

listaraluno.js: Implementa as operações GET, POST e DELETE para alunos, exibindo-os numa tabela.

listarcursos.js: Implementa as operações GET, POST e DELETE para cursos, exibindo-os numa tabela.

Estilo (CSS):
Todas as páginas do frontend foram estilizadas para terem um tema consistente:

Fundo escuro (#1a1a1a, #2b2b2b).

Detalhes vibrantes em rosa (#ff0088).

Tabelas em fundo branco com texto escuro para melhor legibilidade.

Elementos com cantos arredondados para uma estética moderna.

Design responsivo para se adaptar a diferentes tamanhos de tela (desktop, tablet, mobile).

🗄️ Dados Mock (mock-data/bd.json)
O projeto utiliza um ficheiro bd.json como um banco de dados simples para armazenar os dados de alunos e cursos. Este ficheiro é lido e atualizado diretamente pelo servidor Node.js.

Exemplo da estrutura do bd.json:

{
  "alunos": [
    { "id": 1, "Nome": "Humberto", "Apelido": "Landim", "Curso": "Engenharia de Redes", "Ano_Curricular": "2" },
    { "id": 2, "Nome": "Maria", "Apelido": "Silva", "Curso": "Design de Ambiente", "Ano_Curricular": "3" }
  ],
  "cursos": [
    { "id": 1, "Nome": "Engenharia de Redes e Sistemas de Computadores", "Sigla": "ERSC" },
    { "id": 2, "Nome": "Engenharia de Computação Gráfica e Multimédia", "Sigla": "ECGM" }
  ]
}

⚠️ Resolução de Problemas Comuns
Se encontrar problemas, aqui estão algumas dicas de depuração:

404 Not Found para ficheiros .js ou .html:

Verifique se o nome do ficheiro (incluindo capitalização!) está exato no seu sistema de ficheiros e na tag <script src="..."> no HTML.

Certifique-se de que os ficheiros estão na pasta frontend/ (ou na subpasta correta, como frontend/js/ se você a usar e ajustar as referências HTML).

Verifique se a linha app.use(express.static(frontendPath)); está presente no seu server.js e a apontar para o caminho correto.

Tabelas vazias ou dados não aparecem:

Abra as Ferramentas de Desenvolvimento do navegador (F12).

Verifique a aba Console para erros JavaScript.

Verifique a aba Rede (Network) para as requisições GET /alunos e GET /cursos. Confirme que o Status Code é 200 OK e que a Resposta (Response) contém os dados esperados.

Problemas de Estilo ou Layout:

Limpe o cache do seu navegador (Ctrl+Shift+R ou Cmd+Shift+R) após qualquer alteração no HTML, CSS ou JavaScript. Isso garante que o navegador carregue as versões mais recentes dos ficheiros.

Inspecione os elementos na aba Elementos (Elements) e Estilos (Styles) das Ferramentas de Desenvolvimento para ver qual CSS está a ser aplicado (ou não).

Servidor não inicia:

Verifique o terminal onde você executa node server.js para mensagens de erro. Pode ser um erro de sintaxe no server.js ou portas já em uso.