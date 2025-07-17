// server.js (localizado em backend/server.js)

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // Mantém para operações de escrita/leitura em JSON se ainda desejar um "dual-write" para fins de mock local, mas a leitura para o frontend virá do MongoDB.
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken

const app = express();
const PORT = process.env.PORT || 3000;

// --- Variáveis de Ambiente ---
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura'; // Use uma chave forte em produção!

// --- Conexão com o MongoDB ---
if (!MONGODB_URI) {
    console.warn('AVISO: A variável de ambiente MONGODB_URI não está definida. Operações no MongoDB serão ignoradas.');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
        .catch(err => {
            console.error('Erro ao conectar ao MongoDB Atlas:', err);
            // Não encerra o processo, a aplicação pode continuar a tentar funcionar
        });
}

// --- Definição de Schemas e Modelos Mongoose ---
// Schema para Aluno
const alunoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Apelido: { type: String, required: true },
    Curso: { type: String, required: true },
    Ano_Curricular: { type: String, required: true }
}, { collection: 'alunos' });

const Aluno = mongoose.model('Aluno', alunoSchema);

// Schema para Curso
const cursoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Sigla: { type: String, required: true },
}, { collection: 'cursos' });

const Curso = mongoose.model('Curso', cursoSchema);

// --- Middlewares Globais ---

// Configuração CORS: Permite requisições apenas do seu domínio Vercel
// SUBSTITUA 'https://seu-dominio-vercel.vercel.app' pelo URL REAL do seu frontend no Vercel
app.use(cors({
  origin: 'https://SEU_DOMINIO_VERCEL.vercel.app', // EX: 'https://meu-app-gerenciamento.vercel.app'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json()); // Permite que o Express parseie o corpo das requisições JSON

app.use((req, res, next) => {
    console.log(`[REQUEST RECEIVED] ${req.method} ${req.originalUrl}`);
    next();
});

// --- Middleware de Autenticação JWT ---
function authenticateToken(req, res, next) {
    // Obtém o token do cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (token == null) {
        console.log(`[AUTH] Acesso não autorizado à API ${req.originalUrl}. Token ausente.`);
        return res.status(401).json({ error: "Não autorizado. Token de autenticação ausente." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log(`[AUTH] Token inválido para ${req.originalUrl}. Erro: ${err.message}`);
            return res.status(403).json({ error: "Token de autenticação inválido." });
        }
        req.user = user; // Adiciona os dados do usuário (do token) à requisição
        next();
    });
}

// --- Rota de Login (Gera JWT) ---
app.post('/login', (req, res) => {
    console.log("Tentativa de login API:", req.body);
    const { login, password } = req.body;

    // Lógica de autenticação: Em uma aplicação real, você buscaria isso de um banco de dados
    // e compararia senhas hashadas.
    if (login === 'admin' && password === 'admin') {
        // Se as credenciais estiverem corretas, gera um token JWT
        const user = { username: login }; // Dados que você quer incluir no token
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora
        console.log("Login bem-sucedido. Token gerado.");
        res.json({ message: "Login bem-sucedido", accessToken: accessToken });
    } else {
        console.log("Login ou senha incorretos.");
        res.status(401).json({ error: "Login ou senha incorretos" });
    }
});

// --- Caminho para o JSON de mock-data (apenas para referência, não usado para leitura em GET) ---
const bdPath = path.join(__dirname, '..', 'mock-data', 'bd.json');

// --- Rotas da API para Alunos ---

// GET: Lê do MongoDB (Fonte Primária de Dados)
app.get('/alunos', async (req, res) => {
    console.log("Rota /alunos acessada. Lendo do MongoDB.");
    try {
        if (mongoose.connection.readyState === 1) {
            const alunos = await Aluno.find({}); // Busca todos os alunos do MongoDB
            res.json(alunos);
        } else {
            // Fallback para JSON se MongoDB não estiver conectado (apenas para desenvolvimento/debug)
            console.warn("AVISO: MongoDB não conectado, tentando ler alunos do JSON (apenas para debug).");
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            res.json(jsonData.alunos || []);
        }
    } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao buscar alunos" });
    }
});

// POST: Escreve no JSON (opcional) e no MongoDB (protegido por autenticação)
app.post('/alunos', authenticateToken, async (req, res) => {
    try {
        // Tenta escrever no JSON (comportamento de "dual-write" mantido, mas opcional)
        // Lembre-se que em Render, o JSON será efêmero.
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            if (jsonData.alunos.some(a => a.id === req.body.id)) {
                console.warn(`AVISO: Aluno com ID ${req.body.id} já existe no JSON. Ignorando escrita no JSON.`);
            } else {
                jsonData.alunos.push(req.body);
                await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log("Aluno adicionado com sucesso ao JSON.");
            }
        } catch (jsonErr) {
            console.warn("AVISO: Erro ao escrever no bd.json para alunos (pode ser esperado em ambientes como Render):", jsonErr.message);
        }

        // Escreve no MongoDB (Fonte Primária de Escrita)
        if (mongoose.connection.readyState === 1) {
            try {
                const novoAluno = new Aluno(req.body);
                await novoAluno.save();
                console.log("Aluno adicionado com sucesso ao MongoDB.");
                res.status(201).json({ message: "Aluno adicionado com sucesso!", aluno: novoAluno });
            } catch (mongoErr) {
                if (mongoErr.code === 11000) {
                    return res.status(409).json({ erro: `Aluno com ID ${req.body.id} já existe no MongoDB.` });
                }
                console.error("Erro ao adicionar aluno ao MongoDB:", mongoErr);
                return res.status(500).json({ erro: "Erro interno do servidor ao adicionar aluno ao MongoDB" });
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, aluno não adicionado ao MongoDB.");
            res.status(503).json({ erro: "Serviço indisponível: Conexão com o banco de dados não estabelecida." });
        }
    } catch (err) {
        console.error("Erro geral na rota POST /alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao adicionar aluno" });
    }
});

// PUT: Atualiza no JSON (opcional) e no MongoDB (protegido por autenticação)
app.put('/alunos/:id', authenticateToken, async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
        // Tenta atualizar no JSON
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            let jsonData = JSON.parse(data);
            const alunoIndex = jsonData.alunos.findIndex(a => a.id === alunoId);
            if (alunoIndex !== -1) {
                jsonData.alunos[alunoIndex] = { ...jsonData.alunos[alunoIndex], ...req.body, id: alunoId };
                await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log(`Aluno com ID ${alunoId} atualizado com sucesso no JSON.`);
            } else {
                console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no JSON para atualização. Ignorando escrita no JSON.`);
            }
        } catch (jsonErr) {
            console.warn("AVISO: Erro ao escrever no bd.json para atualização de alunos:", jsonErr.message);
        }

        // Atualiza no MongoDB
        if (mongoose.connection.readyState === 1) {
            const updatedAluno = await Aluno.findOneAndUpdate(
                { id: alunoId },
                req.body,
                { new: true, runValidators: true, upsert: false }
            );
            if (updatedAluno) {
                console.log(`Aluno com ID ${alunoId} atualizado com sucesso no MongoDB.`);
                res.status(200).json({ message: "Aluno atualizado com sucesso!", aluno: updatedAluno });
            } else {
                console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no MongoDB para atualização.`);
                res.status(404).json({ error: "Aluno não encontrado." });
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, aluno não atualizado no MongoDB.");
            res.status(503).json({ erro: "Serviço indisponível: Conexão com o banco de dados não estabelecida." });
        }
    } catch (err) {
        console.error("Erro geral na rota PUT /alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao atualizar aluno" });
    }
});

// DELETE: Deleta do JSON (opcional) e do MongoDB (protegido por autenticação)
app.delete('/alunos/:id', authenticateToken, async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
        // Tenta deletar do JSON
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            let jsonData = JSON.parse(data);
            const initialLength = jsonData.alunos.length;
            jsonData.alunos = jsonData.alunos.filter(a => a.id !== alunoId);
            if (jsonData.alunos.length < initialLength) {
                await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log(`Aluno com ID ${alunoId} deletado com sucesso do JSON.`);
            } else {
                console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no JSON para exclusão. Ignorando escrita no JSON.`);
            }
        } catch (jsonErr) {
            console.warn("AVISO: Erro ao escrever no bd.json para exclusão de alunos:", jsonErr.message);
        }

        // Deleta do MongoDB
        if (mongoose.connection.readyState === 1) {
            const resultado = await Aluno.deleteOne({ id: alunoId });
            if (resultado.deletedCount > 0) {
                console.log(`Aluno com ID ${alunoId} deletado com sucesso do MongoDB.`);
                res.status(200).json({ message: "Aluno deletado com sucesso!" });
            } else {
                console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no MongoDB.`);
                res.status(404).json({ error: "Aluno não encontrado." });
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, aluno não deletado do MongoDB.");
            res.status(503).json({ erro: "Serviço indisponível: Conexão com o banco de dados não estabelecida." });
        }
    } catch (err) {
        console.error("Erro geral na rota DELETE /alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao deletar aluno" });
    }
});

// --- Rotas da API para Cursos ---

// GET: Lê do MongoDB (Fonte Primária de Dados)
app.get('/cursos', async (req, res) => {
    console.log("Rota /cursos acessada. Lendo do MongoDB.");
    try {
        if (mongoose.connection.readyState === 1) {
            const cursos = await Curso.find({}); // Busca todos os cursos do MongoDB
            res.json(cursos);
        } else {
            // Fallback para JSON se MongoDB não estiver conectado (apenas para desenvolvimento/debug)
            console.warn("AVISO: MongoDB não conectado, tentando ler cursos do JSON (apenas para debug).");
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            res.json(jsonData.cursos || []);
        }
    } catch (err) {
        console.error("Erro ao buscar cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao buscar cursos" });
    }
});

// POST: Escreve no JSON (opcional) e no MongoDB (protegido por autenticação)
app.post('/cursos', authenticateToken, async (req, res) => {
    try {
        // Tenta escrever no JSON
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            if (jsonData.cursos.some(c => c.id === req.body.id)) {
                console.warn(`AVISO: Curso com ID ${req.body.id} já existe no JSON. Ignorando escrita no JSON.`);
            } else {
                jsonData.cursos.push(req.body);
                await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log("Curso adicionado com sucesso ao JSON.");
            }
        } catch (jsonErr) {
            console.warn("AVISO: Erro ao escrever no bd.json para cursos:", jsonErr.message);
        }

        // Escreve no MongoDB
        if (mongoose.connection.readyState === 1) {
            try {
                const novoCurso = new Curso(req.body);
                await novoCurso.save();
                console.log("Curso adicionado com sucesso ao MongoDB.");
                res.status(201).json({ message: "Curso adicionado com sucesso!", curso: novoCurso });
            } catch (mongoErr) {
                if (mongoErr.code === 11000) {
                    return res.status(409).json({ erro: `Curso com ID ${req.body.id} já existe no MongoDB.` });
                }
                console.error("Erro ao adicionar curso ao MongoDB:", mongoErr);
                return res.status(500).json({ erro: "Erro interno do servidor ao adicionar curso ao MongoDB" });
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, curso não adicionado ao MongoDB.");
            res.status(503).json({ erro: "Serviço indisponível: Conexão com o banco de dados não estabelecida." });
        }
    } catch (err) {
        console.error("Erro geral na rota POST /cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao adicionar curso" });
    }
});

// PUT: Atualiza no JSON (opcional) e no MongoDB (protegido por autenticação)
app.put('/cursos/:id', authenticateToken, async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    try {
        // Tenta atualizar no JSON
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            let jsonData = JSON.parse(data);
            const cursoIndex = jsonData.cursos.findIndex(c => c.id === cursoId);
            if (cursoIndex !== -1) {
                jsonData.cursos[cursoIndex] = { ...jsonData.cursos[cursoIndex], ...req.body, id: cursoId };
                await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log(`Curso com ID ${cursoId} atualizado com sucesso no JSON.`);
            } else {
                console.warn(`AVISO: Curso com ID ${cursoId} não encontrado no JSON para atualização. Ignorando escrita no JSON.`);
            }
        } catch (jsonErr) {
            console.warn("AVISO: Erro ao escrever no bd.json para atualização de cursos:", jsonErr.message);
        }

        // Atualiza no MongoDB
        if (mongoose.connection.readyState === 1) {
            const updatedCurso = await Curso.findOneAndUpdate(
                { id: cursoId },
                req.body,
                { new: true, runValidators: true, upsert: false }
            );
            if (updatedCurso) {
                console.log(`Curso com ID ${cursoId} atualizado com sucesso no MongoDB.`);
                res.status(200).json({ message: "Curso atualizado com sucesso!", curso: updatedCurso });
            } else {
                console.warn(`AVISO: Curso com ID ${cursoId} não encontrado no MongoDB para atualização.`);
                res.status(404).json({ error: "Curso não encontrado." });
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, curso não atualizado no MongoDB.");
            res.status(503).json({ erro: "Serviço indisponível: Conexão com o banco de dados não estabelecida." });
        }
    } catch (err) {
        console.error("Erro geral na rota PUT /cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao atualizar curso" });
    }
});

// DELETE: Deleta do JSON (opcional) e do MongoDB (protegido por autenticação)
app.delete('/cursos/:id', authenticateToken, async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    try {
        // Tenta deletar do JSON
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            let jsonData = JSON.parse(data);
            const initialLength = jsonData.cursos.length;
            jsonData.cursos = jsonData.cursos.filter(c => c.id !== cursoId);
            if (jsonData.cursos.length < initialLength) {
                await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log(`Curso com ID ${cursoId} deletado com sucesso do JSON.`);
            } else {
                console.warn(`AVISO: Curso com ID ${cursoId} não encontrado no JSON para exclusão. Ignorando escrita no JSON.`);
            }
        } catch (jsonErr) {
            console.warn("AVISO: Erro ao escrever no bd.json para exclusão de cursos:", jsonErr.message);
        }

        // Deleta do MongoDB
        if (mongoose.connection.readyState === 1) {
            const resultado = await Curso.deleteOne({ id: cursoId });
            if (resultado.deletedCount > 0) {
                console.log(`Curso com ID ${cursoId} deletado com sucesso do MongoDB.`);
                res.status(200).json({ message: "Curso deletado com sucesso!" });
            } else {
                console.warn(`AVISO: Curso com ID ${cursoId} não encontrado no MongoDB.`);
                res.status(404).json({ error: "Curso não encontrado." });
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, curso não deletado do MongoDB.");
            res.status(503).json({ erro: "Serviço indisponível: Conexão com o banco de dados não estabelecida." });
        }
    } catch (err) {
        console.error("Erro geral na rota DELETE /cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao deletar curso" });
    }
});


// --- Middleware para lidar com 404 (Not Found) ---
app.use((req, res, next) => {
    console.log(`[404 NOT FOUND] Recurso da API não encontrado: ${req.originalUrl}`);
    res.status(404).json({ error: 'Recurso da API não encontrado.' });
});

// --- Middleware para lidar com erros gerais ---
app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR] ${err.stack}`);
    res.status(500).json({ error: 'Erro interno do servidor API.', details: err.message });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
