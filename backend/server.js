const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

let isAuthenticated = false; 

function checkAuth(req, res, next) {
    if (!isAuthenticated) {
        return res.redirect('/'); 
    }
    next(); 
}

app.use(cors()); 
app.use(express.json());

// --- DEBUG: Log de todos os pedidos recebidos (Mantenha este!) ---
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});
// -----------------------------------------------------------------

const frontendPath = path.join(__dirname, '..', 'frontend');
console.log(`[DEBUG] express.static a servir de: ${frontendPath}`); 

// **IMPORTANTE: Mantenha express.static aqui, no início, para que ele sirva os assets.**
// Ele deve ser a primeira coisa a ser executada para ficheiros estáticos.
app.use(express.static(frontendPath));

// --- Debugging Específico para o tipo MIME de JS ---
// Este middleware VAI VERIFICAR e LOGAR o tipo de ficheiro que está a ser requisitado.
// Se o erro persistir, isto nos dará mais informações sobre qual rota está a responder.
app.use((req, res, next) => {
    if (req.originalUrl.endsWith('.js')) {
        console.log(`[DEBUG MIME] Requisição para JS: ${req.originalUrl}`);
        // Você pode até tentar forçar o Content-Type aqui para testar,
        // mas o ideal é que express.static já o faça.
        // res.setHeader('Content-Type', 'application/javascript'); // Não descomente ainda
    }
    next();
});

// --- Rotas para servir páginas HTML específicas (com checkAuth onde aplicável) ---
// Estas rotas devem vir DEPOIS de express.static, se os ficheiros HTML estão no diretório estático
// e express.static os serviria normalmente. A exceção é quando você precisa de middleware
// específico como `checkAuth`.

app.get('/', (req, res) => {
    console.log("Rota para login acessada");
    res.sendFile(path.join(frontendPath, 'login.html')); 
});

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

app.get('/alunos', async (req, res) => {
    console.log("Rota /alunos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData.alunos || []); 
    } catch (err) {
        console.error("Erro ao ler bd.json para alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

app.post('/alunos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        if (jsonData.alunos.some(a => a.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de aluno já existe." });
        }
        jsonData.alunos.push(req.body);
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
        res.status(201).json({ message: "Aluno adicionado com sucesso!" });
    } catch (err) {
        console.error("Erro ao adicionar aluno:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

app.delete('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.alunos.length;
        jsonData.alunos = jsonData.alunos.filter(a => a.id !== alunoId);
        if (jsonData.alunos.length < initialLength) {
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

app.get('/cursos', async (req, res) => {
    console.log("Rota /cursos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData.cursos || []); 
    } catch (err) {
        console.error("Erro ao ler bd.json para cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

app.post('/cursos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        if (jsonData.cursos.some(c => c.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de curso já existe." });
        }
        jsonData.cursos.push(req.body);
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
        res.status(201).json({ message: "Curso adicionado com sucesso!" });
    } catch (err) {
        console.error("Erro ao adicionar curso:", err);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

app.delete('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.cursos.length;
        jsonData.cursos = jsonData.cursos.filter(c => c.id !== cursoId);
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

// Rota para autenticar o login
app.post('/login', (req, res) => {
    console.log("Tentativa de login:", req.body);
    const { login, password } = req.body;
    if (login === 'admin' && password === 'admin') {
        isAuthenticated = true;
        res.json({ message: "Login bem-sucedido" });
    } else {
        res.status(401).json({ error: "Login ou senha incorretos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});