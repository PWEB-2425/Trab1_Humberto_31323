// server.js (localizado em backend/server.js)

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Variáveis de Ambiente ---
const MONGODB_URI = process.env.MONGODB_URI;

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

app.use(cors({
  origin: [
      'https://trab1humberto-g07px9h3p-humbertos-projects-cfa953aa.vercel.app',
      'https://trab1humberto.vercel.app',
      'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST RECEIVED] ${req.method} ${req.originalUrl}`);
    next();
});

// --- Autenticação simples (sem JWT) ---
function simpleAuth(req, res, next) {
    // Aqui você pode implementar autenticação simples, 
    // ex: verificar um header, cookie, ou até ignorar para testes.
    // Por enquanto, deixaremos liberado para desenvolvimento:
    next();
}

// --- Rota de Login ---
app.post('/login', (req, res) => {
    console.log("Tentativa de login API:", req.body);
    const { login, password } = req.body;
    
    if (login === 'admin' && password === 'admin') {
        res.json({ message: "Login bem-sucedido" });
    } else {
        console.log("Login ou senha incorretos.");
        res.status(401).json({ error: "Login ou senha incorretos" });
    }
});


// --- Caminho para o JSON de mock-data ---
const bdPath = path.join(__dirname, '..', 'mock-data', 'bd.json');

// --- Rotas da API para Alunos ---
app.get('/alunos', async (req, res) => {
    console.log("Rota /alunos acessada. Lendo do MongoDB.");
    try {
        if (mongoose.connection.readyState === 1) {
            const alunos = await Aluno.find({});
            res.json(alunos);
        } else {
            console.warn("AVISO: MongoDB não conectado, tentando ler alunos do JSON.");
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            res.json(jsonData.alunos || []);
        }
    } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao buscar alunos" });
    }
});

app.post('/alunos', simpleAuth, async (req, res) => {
    // Igual ao seu código original, só removi o authenticateToken e substituí por simpleAuth
    // (mesmo para PUT e DELETE abaixo)
    try {
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            if (jsonData.alunos.some(a => a.id === req.body.id)) {
                console.warn(`AVISO: Aluno com ID ${req.body.id} já existe no JSON.`);
            } else {
                jsonData.alunos.push(req.body);
                await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log("Aluno adicionado com sucesso ao JSON.");
            }
        } catch (jsonErr) {
            console.warn("AVISO: Erro ao escrever no bd.json para alunos:", jsonErr.message);
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

app.put('/alunos/:id', simpleAuth, async (req, res) => {
    // mesmo esquema: substituí authenticateToken por simpleAuth
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
                console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no JSON.`);
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
                console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no MongoDB.`);
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

app.delete('/alunos/:id', simpleAuth, async (req, res) => {
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
                console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no JSON para exclusão.`);
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

// --- Rotas para Cursos ---
// (mesma ideia: substituir authenticateToken por simpleAuth em POST, PUT e DELETE)

app.get('/cursos', async (req, res) => {
    console.log("Rota /cursos acessada. Lendo do MongoDB.");
    try {
        if (mongoose.connection.readyState === 1) {
            const cursos = await Curso.find({});
            res.json(cursos);
        } else {
            console.warn("AVISO: MongoDB não conectado, lendo cursos do JSON.");
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            res.json(jsonData.cursos || []);
        }
    } catch (err) {
        console.error("Erro ao buscar cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao buscar cursos" });
    }
});

app.post('/cursos', simpleAuth, async (req, res) => {
    try {
        try {
            const data = await fs.readFile(bdPath, 'utf8');
            const jsonData = JSON.parse(data);
            if (jsonData.cursos.some(c => c.id === req.body.id)) {
                console.warn(`AVISO: Curso com ID ${req.body.id} já existe no JSON.`);
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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
