// server.js (localizado em backend/server.js)

const express = require('express'); // Importa o módulo Express, o framework web para Node.js.
const cors = require('cors');       // Importa o middleware CORS para lidar com requisições de diferentes origens.
const path = require('path');       // Importa o módulo 'path' para trabalhar com caminhos de arquivos e diretórios.
const fs = require('fs').promises; // Importa o módulo 'fs' (File System) para operações de arquivo, usando a versão baseada em Promises para lidar com assincronia de forma mais limpa.

const app = express(); // Cria uma instância da aplicação Express.
const PORT = process.env.PORT || 3000; // Usa a porta do ambiente (Render) ou 3000 (local)    // Define a porta em que o servidor irá escutar.

// Variável de estado de autenticação simples.
// NOTA: Em um ambiente de produção real, use sessões robustas (como `express-session` com `connect-mongo`)
// ou tokens JWT (JSON Web Tokens) para gerenciar o estado de autenticação de forma segura e escalável.
let isAuthenticated = false;

/**
 * Middleware para verificar a autenticação do utilizador.
 * Redireciona para a página de login se o utilizador não estiver autenticado.
 * Este é um exemplo simples e não seguro para produção.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @param {function} next - Função para passar o controle para o próximo middleware na cadeia.
 */
function checkAuth(req, res, next) {
    // Se o utilizador não estiver autenticado (`isAuthenticated` é falso).
    if (!isAuthenticated) {
        console.log(`[AUTH] Acesso não autorizado a ${req.originalUrl}. Redirecionando para /.`);
        // Redireciona o utilizador para a rota raiz ('/'), que serve a página de login.
        // 'return' é usado para garantir que a execução da função pare aqui após o redirecionamento.
        return res.redirect('/');
    }
    next(); // Se autenticado, passa o controle para o próximo middleware ou manipulador de rota.
}

// --- Middlewares Globais ---

// Configura o middleware CORS (Cross-Origin Resource Sharing).
// Isso permite que requisições de domínios diferentes (ex: seu frontend rodando em uma porta diferente)
// possam comunicar-se com este servidor.
app.use(cors());

// Configura o middleware para analisar corpos de requisição JSON.
// Isso permite que o servidor receba e entenda dados JSON enviados em requisições POST/PUT.
app.use(express.json());

// --- DEBUG: Log de todos os pedidos recebidos ---
// Este middleware é executado para CADA requisição que chega ao servidor.
// Ele loga o método HTTP (GET, POST, etc.) e a URL original da requisição.
app.use((req, res, next) => {
    console.log(`[REQUEST RECEIVED] ${req.method} ${req.originalUrl}`);
    next(); // Continua para o próximo middleware na cadeia.
});
// -------------------------------------------------

// Define o caminho para a pasta 'frontend'.
// 'path.join' cria um caminho de forma segura, compatível com diferentes sistemas operativos.
// '__dirname' é o diretório atual (backend), '..' sobe um nível, e 'frontend' entra no diretório frontend.
const frontendPath = path.join(__dirname, '..', 'frontend');
console.log(`[SERVER START] Caminho configurado para express.static: ${frontendPath}`);

// ====================================================================
// ** IMPORTANTE: ORDEM DOS MIDDLEWARES E ROTAS **
// A ordem em que os middlewares e rotas são definidos no Express importa.
// Uma rota definida ANTES de `express.static` terá prioridade para aquele caminho.
// ====================================================================

// Rota principal (raiz), serve a página de login.
// Esta rota tem prioridade sobre `express.static` para o caminho '/'.
// Quando alguém acessa http://localhost:3000/, esta rota é acionada primeiro.
app.get('/', (req, res) => {
    console.log("Rota para login acessada (prioritária)");
    // Envia o arquivo 'login.html' localizado no diretório frontend.
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// **IMPORTANTE: Configura o Express para servir arquivos estáticos.**
// Esta linha deve vir DEPOIS das rotas específicas que você quer que tenham prioridade (como a rota '/')
// mas ANTES de rotas genéricas ou middlewares de tratamento de 404.
// Ele serve arquivos como HTML, CSS, JavaScript, imagens diretamente do diretório 'frontend'.
// Ex: Se houver 'frontend/style.css', ele será acessível via 'http://localhost:3000/style.css'.
app.use(express.static(frontendPath));

// ====================================================================


// --- Debugging Adicional para ficheiros JS específicos ---
// Este middleware é um ponto de verificação.
// Se uma requisição para um arquivo `.js` chegar aqui, significa que `express.static`
// NÃO conseguiu servi-lo, o que pode indicar que o arquivo não existe ou que há um problema de caminho.
app.use((req, res, next) => {
    if (req.originalUrl.endsWith('.js')) {
        console.warn(`[DEBUG JS WARN] Requisição para JS (${req.originalUrl}) passou por express.static. Isso não deveria acontecer se o ficheiro existe.`);
        const filePath = path.join(frontendPath, req.originalUrl); // Constrói o caminho completo do ficheiro.
        // Tenta aceder ao ficheiro para verificar se ele realmente existe.
        fs.access(filePath)
            .then(() => {
                console.log(`[DEBUG JS WARN] Ficheiro JS encontrado em: ${filePath}. Tentando enviar com Content-Type correto.`);
                res.setHeader('Content-Type', 'application/javascript'); // Define o tipo de conteúdo como JavaScript.
                res.sendFile(filePath); // Envia o ficheiro.
            })
            .catch(() => {
                console.error(`[DEBUG JS ERROR] Ficheiro JS NÃO encontrado em: ${filePath}.`);
                next(); // Se o ficheiro não for encontrado, passa para o próximo middleware (provavelmente o 404).
            });
        return; // Retorna para evitar que `next()` seja chamado imediatamente, pois a Promise lida com a resposta.
    }
    next(); // Se não for um ficheiro JS, passa para o próximo middleware.
});

// --- Rotas para servir páginas HTML específicas (com checkAuth onde aplicável) ---
// Estas rotas são usadas para servir arquivos HTML quando há uma lógica específica
// (como a verificação de autenticação) antes de entregá-los.
// Elas só serão acionadas se `express.static` não tiver encontrado um ficheiro correspondente.

// Rotas abaixo requerem autenticação (usando o middleware `checkAuth`).
// NOTA: A rota '/' já está definida acima para o login e não usa `checkAuth`.

app.get('/home', checkAuth, (req, res) => {
    console.log("Rota para menuinicial acessada");
    res.sendFile(path.join(frontendPath, 'menuinicial.html'));
});

app.get('/dashboard', checkAuth, (req, res) => {
    console.log("Rota para dashboard acessada");
    res.sendFile(path.join(frontendPath, 'dashboard.html'));
});

app.get('/listaralunos.html', checkAuth, (req, res) => {
    console.log("Rota para listaralunos.html acessada (via checkAuth).");
    res.sendFile(path.join(frontendPath, 'listaralunos.html'));
});

app.get('/listarcursos.html', checkAuth, (req, res) => {
    console.log("Rota para listarcursos.html acessada (via checkAuth).");
    res.sendFile(path.join(frontendPath, 'listarcursos.html'));
});

// Caminho para o `bd.json` (seu banco de dados mock/simulado).
const bdPath = path.join(__dirname, '../mock-data/bd.json');

// --- Rotas da API para Alunos ---

/**
 * Rota para obter todos os alunos.
 * Lê os dados do `bd.json` e retorna a lista de alunos.
 * @param {object} req - Objeto de requisição.
 * @param {object} res - Objeto de resposta.
 */
app.get('/alunos', async (req, res) => {
    console.log("Rota /alunos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8'); // Lê o conteúdo do arquivo `bd.json`.
        const jsonData = JSON.parse(data); // Analisa o conteúdo JSON.
        res.json(jsonData.alunos || []); // Retorna a lista de alunos ou um array vazio se não houver.
    } catch (err) {
        console.error("Erro ao ler bd.json para alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor" }); // Em caso de erro, retorna 500.
    }
});

/**
 * Rota para adicionar um novo aluno.
 * Adiciona um novo aluno ao `bd.json`.
 * @param {object} req - Objeto de requisição (o corpo deve conter os dados do aluno a ser adicionado).
 * @param {object} res - Objeto de resposta.
 */
app.post('/alunos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        // Verifica se o ID do aluno já existe para evitar duplicatas.
        if (jsonData.alunos.some(a => a.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de aluno já existe." }); // 409 Conflict.
        }
        jsonData.alunos.push(req.body); // Adiciona o novo aluno (assumindo que o corpo da requisição é o objeto aluno).
        // Escreve o JSON atualizado de volta no arquivo, formatando-o com 2 espaços para legibilidade.
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
        res.status(201).json({ message: "Aluno adicionado com sucesso!" }); // 201 Created.
    } catch (err) {
        console.error("Erro ao adicionar aluno:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

/**
 * Rota para deletar um aluno pelo ID.
 * Remove um aluno do `bd.json` com base no ID fornecido na URL.
 * @param {object} req - Objeto de requisição (req.params.id deve conter o ID do aluno).
 * @param {object} res - Objeto de resposta.
 */
app.delete('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10); // Converte o ID da URL (string) para um número inteiro.
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.alunos.length; // Guarda o número inicial de alunos.
        // Filtra a lista de alunos, removendo aquele cujo ID corresponde.
        jsonData.alunos = jsonData.alunos.filter(a => a.id !== alunoId);
        // Verifica se o comprimento da lista diminuiu, indicando que um aluno foi removido.
        if (jsonData.alunos.length < initialLength) {
            await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
            res.status(200).json({ message: "Aluno deletado com sucesso!" }); // 200 OK.
        } else {
            res.status(404).json({ error: "Aluno não encontrado." }); // 404 Not Found.
        }
    } catch (err) {
        console.error("Erro ao deletar aluno:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// --- Rotas da API para Cursos ---

/**
 * Rota para obter todos os cursos.
 * Lê os dados do `bd.json` e retorna a lista de cursos.
 * @param {object} req - Objeto de requisição.
 * @param {object} res - Objeto de resposta.
 */
app.get('/cursos', async (req, res) => {
    console.log("Rota /cursos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData.cursos || []); // Retorna a lista de cursos ou um array vazio.
    } catch (err) {
        console.error("Erro ao ler bd.json para cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

/**
 * Rota para adicionar um novo curso.
 * Adiciona um novo curso ao `bd.json`.
 * @param {object} req - Objeto de requisição (o corpo deve conter os dados do curso).
 * @param {object} res - Objeto de resposta.
 */
app.post('/cursos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        // Verifica se o ID do curso já existe para evitar duplicatas.
        if (jsonData.cursos.some(c => c.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de curso já existe." });
        }
        jsonData.cursos.push(req.body); // Adiciona o novo curso.
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
        res.status(201).json({ message: "Curso adicionado com sucesso!" });
    } catch (err) {
        console.error("Erro ao adicionar curso:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

/**
 * Rota para deletar um curso pelo ID.
 * Remove um curso do `bd.json` com base no ID fornecido na URL.
 * @param {object} req - Objeto de requisição (req.params.id deve conter o ID do curso).
 * @param {object} res - Objeto de resposta.
 */
app.delete('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10); // Converte o ID da URL para inteiro.
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.cursos.length;
        jsonData.cursos = jsonData.cursos.filter(c => c.id !== cursoId); // Filtra o curso a ser deletado.
        if (jsonData.cursos.length < initialLength) {
            await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
            res.status(200).json({ message: "Curso deletado com sucesso!" });
        } else {
            res.status(404).json({ error: "Curso não encontrado." });
        }
    } catch (err) {
        console.error("Erro ao deletar curso:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// Rota para autenticar o login.
// Esta é uma rota de autenticação de exemplo muito simplificada.
app.post('/login', (req, res) => {
    console.log("Tentativa de login:", req.body);
    const { login, password } = req.body; // Pega 'login' e 'password' do corpo da requisição.
    // Verifica credenciais fixas (NÃO fazer isso em produção!).
    if (login === 'admin' && password === 'admin') {
        isAuthenticated = true; // Define o estado de autenticação como verdadeiro.
        res.json({ message: "Login bem-sucedido" }); // Retorna mensagem de sucesso.
    } else {
        isAuthenticated = false; // Garante que o estado é falso em caso de falha.
        res.status(401).json({ error: "Login ou senha incorretos" }); // Retorna 401 Unauthorized.
    }
});

// --- Middleware para lidar com 404 (Not Found) ---
// Este middleware será executado se NENHUMA das rotas ou middlewares anteriores
// (incluindo `express.static` e o middleware de debug JS) conseguir lidar com a requisição.
app.use((req, res, next) => {
    console.log(`[404 NOT FOUND] Recurso não encontrado: ${req.originalUrl}`);
    // Define o `Content-Type` como `text/html` para a página de erro 404 personalizada.
    res.status(404).send('<h1>Erro 404: Recurso não encontrado</h1><p>O recurso que você procura não existe.</p>');
});

// --- Middleware para lidar com erros gerais ---
// Este é um middleware de tratamento de erros. Ele tem 4 parâmetros (err, req, res, next).
// Ele captura qualquer erro que ocorra em rotas ou outros middlewares que chame `next(err)`.
app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR] ${err.stack}`); // Loga o stack trace completo do erro para depuração.
    // Retorna um status 500 (Internal Server Error) com uma página de erro genérica.
    res.status(500).send('<h1>Erro 500: Erro Interno do Servidor</h1><p>Ocorreu um erro inesperado no servidor.</p>');
});

// Inicia o servidor e o faz escutar na porta definida.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
