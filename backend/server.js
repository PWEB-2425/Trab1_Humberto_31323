// server.js (localizado em backend/server.js)

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // Usando a versão de Promises para fs

const app = express();
const PORT = 3000;

let isAuthenticated = false; // Estado de autenticação. Em produção, considere usar sessões ou JWT.

/**
 * Middleware para verificar a autenticação do usuário.
 * Redireciona para a página de login se não estiver autenticado.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @param {function} next - Função para passar o controle para o próximo middleware.
 */
function checkAuth(req, res, next) {
    if (!isAuthenticated) {
        console.log(`[AUTH] Acesso não autorizado a ${req.originalUrl}. Redirecionando para /.`);
        return res.redirect('/'); // Use 'return' para garantir que a execução pare após o redirecionamento
    }
    next(); // Passa o controle para a próxima rota ou middleware
}

// Configura o middleware CORS para permitir requisições de outras origens
app.use(cors());

// Configura o middleware para analisar corpos de requisição JSON
app.use(express.json());

// --- DEBUG: Log de todos os pedidos recebidos ---
// Este middleware é executado para cada requisição e loga o método e a URL original.
app.use((req, res, next) => {
    console.log(`[REQUEST RECEIVED] ${req.method} ${req.originalUrl}`);
    next(); // Continua para o próximo middleware na cadeia
});
// -------------------------------------------------

// Define o caminho para a pasta 'frontend'.
// Assumindo que 'server.js' está em 'backend' e 'frontend' é um diretório irmão.
const frontendPath = path.join(__dirname, '..', 'frontend');
console.log(`[SERVER START] Caminho configurado para express.static: ${frontendPath}`);

// **IMPORTANTE: Configura o Express para servir arquivos estáticos.**
// ESTA LINHA DEVE SER COLOCADA AQUI, ANTES DE QUALQUER OUTRA ROTA `app.get()` OU `app.post()`
// QUE NÃO SEJA UM MIDDLEWARE GLOBAL (como `app.use(express.json())`).
// Se um ficheiro (ex: /listarcursos.js) é encontrado pelo `express.static`, ele é servido
// e a requisição NÃO AVANÇA para as rotas definidas abaixo.
app.use(express.static(frontendPath));

// --- Debugging Adicional para ficheiros JS específicos ---
// Este middleware verifica e loga requisições que terminam em '.js' *APÓS* express.static.
// Se uma requisição .js chegar aqui, significa que express.static NÃO a serviu.
app.use((req, res, next) => {
    if (req.originalUrl.endsWith('.js')) {
        console.warn(`[DEBUG JS WARN] Requisição para JS (${req.originalUrl}) passou por express.static. Isso não deveria acontecer se o ficheiro existe.`);
        // Tente servir o ficheiro explicitamente aqui para diagnóstico
        const filePath = path.join(frontendPath, req.originalUrl);
        fs.access(filePath)
            .then(() => {
                console.log(`[DEBUG JS WARN] Ficheiro JS encontrado em: ${filePath}. Tentando enviar com Content-Type correto.`);
                res.setHeader('Content-Type', 'application/javascript');
                res.sendFile(filePath);
            })
            .catch(() => {
                console.error(`[DEBUG JS ERROR] Ficheiro JS NÃO encontrado em: ${filePath}.`);
                next(); // Passa para o próximo middleware (provavelmente o 404)
            });
        return; // Retorna para evitar next() imediato, já que a promessa está a lidar com a resposta
    }
    next();
});

// --- Rotas para servir páginas HTML específicas (com checkAuth onde aplicável) ---
// Estas rotas são usadas para servir arquivos HTML quando há uma lógica específica
// (como a verificação de autenticação) antes de entregá-los.
// Elas só serão acionadas se `express.static` não tiver encontrado um ficheiro correspondente.

// Rota principal, serve a página de login.
app.get('/', (req, res) => {
    console.log("Rota para login acessada");
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// Rotas abaixo requerem autenticação (`checkAuth` middleware)
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

// Caminho para o bd.json (seu banco de dados mock)
const bdPath = path.join(__dirname, '../mock-data/bd.json');

// --- Rotas da API para Alunos ---

/**
 * Rota para obter todos os alunos.
 * Lê os dados do bd.json e retorna a lista de alunos.
 * @param {object} req - Objeto de requisição.
 * @param {object} res - Objeto de resposta.
 */
app.get('/alunos', async (req, res) => {
    console.log("Rota /alunos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData.alunos || []); // Retorna a lista de alunos ou um array vazio
    } catch (err) {
        console.error("Erro ao ler bd.json para alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

/**
 * Rota para adicionar um novo aluno.
 * Adiciona um novo aluno ao bd.json.
 * @param {object} req - Objeto de requisição (corpo deve conter dados do aluno).
 * @param {object} res - Objeto de resposta.
 */
app.post('/alunos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        // Verifica se o ID do aluno já existe para evitar duplicatas
        if (jsonData.alunos.some(a => a.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de aluno já existe." });
        }
        jsonData.alunos.push(req.body); // Adiciona o novo aluno
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8'); // Salva as alterações
        res.status(201).json({ message: "Aluno adicionado com sucesso!" });
    } catch (err) {
        console.error("Erro ao adicionar aluno:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

/**
 * Rota para deletar um aluno pelo ID.
 * Remove um aluno do bd.json com base no ID fornecido.
 * @param {object} req - Objeto de requisição (params.id deve conter o ID do aluno).
 * @param {object} res - Objeto de resposta.
 */
app.delete('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10); // Converte o ID da URL para inteiro
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.alunos.length;
        jsonData.alunos = jsonData.alunos.filter(a => a.id !== alunoId); // Filtra o aluno a ser deletado
        if (jsonData.alunos.length < initialLength) { // Verifica se um aluno foi realmente removido
            await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
            res.status(200).json({ message: "Aluno deletado com sucesso!" });
        } else {
            res.status(404).json({ error: "Aluno não encontrado." });
        }
    } catch (err) {
        console.error("Erro ao deletar aluno:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// --- Rotas da API para Cursos ---

/**
 * Rota para obter todos os cursos.
 * Lê os dados do bd.json e retorna a lista de cursos.
 * @param {object} req - Objeto de requisição.
 * @param {object} res - Objeto de resposta.
 */
app.get('/cursos', async (req, res) => {
    console.log("Rota /cursos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData.cursos || []); // Retorna a lista de cursos ou um array vazio
    } catch (err) {
        console.error("Erro ao ler bd.json para cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

/**
 * Rota para adicionar um novo curso.
 * Adiciona um novo curso ao bd.json.
 * @param {object} req - Objeto de requisição (corpo deve conter dados do curso).
 * @param {object} res - Objeto de resposta.
 */
app.post('/cursos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        // Verifica se o ID do curso já existe para evitar duplicatas
        if (jsonData.cursos.some(c => c.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de curso já existe." });
        }
        jsonData.cursos.push(req.body); // Adiciona o novo curso
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8'); // Salva as alterações
        res.status(201).json({ message: "Curso adicionado com sucesso!" });
    } catch (err) {
        console.error("Erro ao adicionar curso:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

/**
 * Rota para deletar um curso pelo ID.
 * Remove um curso do bd.json com base no ID fornecido.
 * @param {object} req - Objeto de requisição (params.id deve conter o ID do curso).
 * @param {object} res - Objeto de resposta.
 */
app.delete('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10); // Converte o ID da URL para inteiro
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.cursos.length;
        jsonData.cursos = jsonData.cursos.filter(c => c.id !== cursoId); // Filtra o curso a ser deletado
        if (jsonData.cursos.length < initialLength) { // Verifica se um curso foi realmente removido
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

// Rota para autenticar o login
app.post('/login', (req, res) => {
    console.log("Tentativa de login:", req.body);
    const { login, password } = req.body;
    if (login === 'admin' && password === 'admin') {
        isAuthenticated = true;
        res.json({ message: "Login bem-sucedido" });
    } else {
        isAuthenticated = false; // Garante que o estado é falso em caso de falha
        res.status(401).json({ error: "Login ou senha incorretos" });
    }
});

// --- Middleware para lidar com 404 (Not Found) ---
// Este middleware será executado se nenhuma das rotas anteriores (incluindo express.static e o middleware de debug JS)
// conseguir lidar com a requisição.
app.use((req, res, next) => {
    console.log(`[404 NOT FOUND] Recurso não encontrado: ${req.originalUrl}`);
    // Define o Content-Type como text/html para a página de erro 404.
    res.status(404).send('<h1>Erro 404: Recurso não encontrado</h1><p>O recurso que você procura não existe.</p>');
});

// --- Middleware para lidar com erros gerais ---
// Este é um middleware de tratamento de erros que captura qualquer erro que ocorra
// em rotas ou outros middlewares.
app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR] ${err.stack}`); // Loga o stack trace completo do erro
    res.status(500).send('<h1>Erro 500: Erro Interno do Servidor</h1><p>Ocorreu um erro inesperado no servidor.</p>');
});

// Inicia o servidor e o faz escutar na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
