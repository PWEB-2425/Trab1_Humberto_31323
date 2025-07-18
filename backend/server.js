// server.js (localizado em backend/server.js)

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Variáveis de Ambiente ---
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Conexão com o MongoDB ---
if (!MONGODB_URI) {
    console.warn('AVISO: A variável de ambiente MONGODB_URI não está definida. Operações no MongoDB serão ignoradas.');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
        .catch(err => {
            console.error('Erro ao conectar ao MongoDB Atlas:', err);
        });
}

// --- Definição de Schemas e Modelos Mongoose ---
const alunoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Apelido: { type: String, required: true },
    Curso: { type: String, required: true },
    Ano_Curricular: { type: String, required: true }
}, { collection: 'alunos' });

const Aluno = mongoose.model('Aluno', alunoSchema);

const cursoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Sigla: { type: String, required: true },
}, { collection: 'cursos' });

const Curso = mongoose.model('Curso', cursoSchema);

// --- Middlewares Globais ---

// Configuração CORS: Permite requisições do seu domínio Vercel e localhost para desenvolvimento
app.use(cors({
  origin: [
      'https://trab1humberto-g07px9h3p-humbertos-projects-cfa953aa.vercel.app', // SEU MAIS RECENTE URL DO VERCEL
      'http://localhost:3000' // Para desenvolvimento local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST RECEIVED] ${req.method} ${req.originalUrl}`);
    next();
});

// --- Middleware de Autenticação JWT ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log(`[AUTH] Acesso não autorizado à API ${req.originalUrl}. Token ausente.`);
        return res.status(401).json({ error: "Não autorizado. Token de autenticação ausente." });
    }

    if (!JWT_SECRET) {
        console.error("Erro de configuração: JWT_SECRET não está definido no ambiente do servidor.");
        return res.status(500).json({ error: "Erro interno do servidor: Chave secreta de autenticação não configurada." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log(`[AUTH] Token inválido para ${req.originalUrl}. Erro: ${err.message}`);
            return res.status(403).json({ error: "Token de autenticação inválido." });
        }
        req.user = user;
        next();
    });
}

// --- Rota de Login (Gera JWT) ---
app.post('/login', (req, res) => {
    console.log("Tentativa de login API:", req.body);
    const { login, password } = req.body;

    if (login === 'admin' && password === 'admin') {
        const user = { username: login };
        if (!JWT_SECRET) {
            console.error("Erro de configuração: JWT_SECRET não está definido no ambiente do servidor.");
            return res.status(500).json({ error: "Erro interno do servidor: Chave secreta de autenticação não configurada." });
        }
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
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
app.get('/alunos', async (req, res) => {
    console.log("Rota /alunos acessada. Lendo do MongoDB.");
    try {
        if (mongoose.connection.readyState === 1) {
            const alunos = await Aluno.find({});
            res.json(alunos);
        } else {
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

app.post('/alunos', authenticateToken, async (req, res) => {
    try {
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

app.put('/alunos/:id', authenticateToken, async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
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

app.delete('/alunos/:id', authenticateToken, async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
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
app.get('/cursos', async (req, res) => {
    console.log("Rota /cursos acessada. Lendo do MongoDB.");
    try {
        if (mongoose.connection.readyState === 1) {
            const cursos = await Curso.find({});
            res.json(cursos);
        } else {
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

app.post('/cursos', authenticateToken, async (req, res) => {
    try {
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

app.put('/cursos/:id', authenticateToken, async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    try {
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

app.delete('/cursos/:id', authenticateToken, async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    try {
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

// --- SEÇÃO PARA SERVIR O FRONTEND (Condicionalmente) ---
// Esta seção será ativada APENAS em ambiente de desenvolvimento (local).
// Para deploy no Render (produção), ela será ignorada.
if (process.env.NODE_ENV !== 'production') {
    console.log('Servindo arquivos estáticos do frontend (ambiente de desenvolvimento)');
    app.use(express.static(path.join(__dirname, '..', 'frontend')));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
    });
}
// --- FIM DA SEÇÃO PARA SERVIR O FRONTEND ---


// --- Middleware para lidar com 404 (Not Found) ---
// Este middleware só será acionado se nenhuma rota da API ou arquivo estático (em dev) for correspondido
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
