// server.js (localizado em backend/server.js)

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // Módulo 'fs' para operações de arquivo
const mongoose = require('mongoose'); // Importa o Mongoose para interagir com o MongoDB

const app = express();
// Usa a porta do ambiente (process.env.PORT, fornecida pelo Render) ou 3000 (para execução local)
const PORT = process.env.PORT || 3000;

// --- Conexão com o MongoDB ---
// A string de conexão é lida da variável de ambiente MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.warn('AVISO: A variável de ambiente MONGODB_URI não está definida. Operações no MongoDB serão ignoradas.');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
        .catch(err => {
            console.error('Erro ao conectar ao MongoDB Atlas:', err);
            // Não encerra o processo, pois a aplicação ainda pode funcionar com o JSON
        });
}

// --- Definição de Schemas e Modelos Mongoose (Corrigidos para corresponder ao seu JSON) ---

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
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST RECEIVED] ${req.method} ${req.originalUrl}`);
    next();
});

// --- Autenticação (Exemplo Simples - usar JWT ou sessões em produção) ---
let isAuthenticated = false;

function checkAuth(req, res, next) {
    if (!isAuthenticated) {
        console.log(`[AUTH] Acesso não autorizado a ${req.originalUrl}. Redirecionando para /.`);
        return res.status(401).json({ error: "Não autorizado. Por favor, faça login." });
    }
    next();
}

// --- Rotas para servir páginas HTML estáticas ---
const frontendPath = path.join(__dirname, '..', 'frontend');
console.log(`[SERVER START] Caminho configurado para express.static: ${frontendPath}`);

app.get('/', (req, res) => {
    console.log("Rota para login acessada (prioritária)");
    res.sendFile(path.join(frontendPath, 'login.html'), (err) => {
        if (err) {
            console.error('[SERVER ERROR] Erro ao enviar login.html:', err.message);
            res.status(500).send('Erro 500: Erro Interno do Servidor ao carregar login.html.');
        }
    });
});

app.use(express.static(frontendPath));

// --- Rotas para servir páginas HTML específicas (com checkAuth onde aplicável) ---
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

const bdPath = path.join(__dirname, '../mock-data/bd.json');

// --- Rotas da API para Alunos (Dual-Write: GET, POST, PUT, DELETE) ---

// GET: Lê APENAS do JSON
app.get('/alunos', async (req, res) => {
    console.log("Rota /alunos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData.alunos || []);
    } catch (err) {
        console.error("Erro ao ler bd.json para alunos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao buscar alunos do JSON" });
    }
});

// POST: Escreve no JSON e depois no MongoDB
app.post('/alunos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);

        if (jsonData.alunos.some(a => a.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de aluno já existe no JSON." });
        }

        jsonData.alunos.push(req.body);
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log("Aluno adicionado com sucesso ao JSON.");

        if (mongoose.connection.readyState === 1) {
            try {
                const novoAluno = new Aluno(req.body);
                await novoAluno.save();
                console.log("Aluno adicionado com sucesso ao MongoDB.");
            } catch (mongoErr) {
                if (mongoErr.code === 11000) {
                    console.warn(`AVISO: Aluno com ID ${req.body.id} já existe no MongoDB (ignorando).`);
                } else {
                    console.error("Erro ao adicionar aluno ao MongoDB:", mongoErr);
                }
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, aluno não adicionado ao MongoDB.");
        }

        res.status(201).json({ message: "Aluno adicionado com sucesso!" });
    } catch (err) {
        console.error("Erro ao adicionar aluno ao JSON:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao adicionar aluno" });
    }
});

// PUT: Atualiza no JSON e depois no MongoDB
app.put('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const alunoIndex = jsonData.alunos.findIndex(a => a.id === alunoId);

        if (alunoIndex !== -1) {
            // Atualiza no JSON
            jsonData.alunos[alunoIndex] = { ...jsonData.alunos[alunoIndex], ...req.body, id: alunoId };
            await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log(`Aluno com ID ${alunoId} atualizado com sucesso no JSON.`);

            // Tentar atualizar no MongoDB
            if (mongoose.connection.readyState === 1) {
                try {
                    const updatedAluno = await Aluno.findOneAndUpdate(
                        { id: alunoId },
                        req.body, // Usa o corpo da requisição para atualizar os campos
                        { new: true, runValidators: true, upsert: false } // 'new: true' retorna o documento atualizado, 'runValidators' valida
                    );
                    if (updatedAluno) {
                        console.log(`Aluno com ID ${alunoId} atualizado com sucesso no MongoDB.`);
                    } else {
                        console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no MongoDB para atualização.`);
                    }
                } catch (mongoErr) {
                    console.error("Erro ao atualizar aluno no MongoDB:", mongoErr);
                }
            } else {
                console.warn("AVISO: Mongoose não conectado, aluno não atualizado no MongoDB.");
            }

            res.status(200).json({ message: "Aluno atualizado com sucesso!", aluno: jsonData.alunos[alunoIndex] });
        } else {
            res.status(404).json({ error: "Aluno não encontrado no JSON para atualização." });
        }
    } catch (err) {
        console.error("Erro ao atualizar aluno no JSON:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao atualizar aluno" });
    }
});


// DELETE: Deleta do JSON e depois do MongoDB
app.delete('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.alunos.length;

        jsonData.alunos = jsonData.alunos.filter(a => a.id !== alunoId);

        if (jsonData.alunos.length < initialLength) {
            await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log(`Aluno com ID ${alunoId} deletado com sucesso do JSON.`);

            if (mongoose.connection.readyState === 1) {
                try {
                    const resultado = await Aluno.deleteOne({ id: alunoId });
                    if (resultado.deletedCount > 0) {
                        console.log(`Aluno com ID ${alunoId} deletado com sucesso do MongoDB.`);
                    } else {
                        console.warn(`AVISO: Aluno com ID ${alunoId} não encontrado no MongoDB (ignorando).`);
                    }
                } catch (mongoErr) {
                    console.error("Erro ao deletar aluno do MongoDB:", mongoErr);
                }
            } else {
                console.warn("AVISO: Mongoose não conectado, aluno não deletado do MongoDB.");
            }

            res.status(200).json({ message: "Aluno deletado com sucesso!" });
        } else {
            res.status(404).json({ error: "Aluno não encontrado no JSON." });
        }
    } catch (err) {
        console.error("Erro ao deletar aluno do JSON:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao deletar aluno" });
    }
});

// --- Rotas da API para Cursos (Dual-Write: GET, POST, PUT, DELETE) ---

// GET: Lê APENAS do JSON
app.get('/cursos', async (req, res) => {
    console.log("Rota /cursos acessada");
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData.cursos || []);
    } catch (err) {
        console.error("Erro ao ler bd.json para cursos:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao buscar cursos do JSON" });
    }
});

// POST: Escreve no JSON e depois no MongoDB
app.post('/cursos', async (req, res) => {
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        const jsonData = JSON.parse(data);

        if (jsonData.cursos.some(c => c.id === req.body.id)) {
            return res.status(409).json({ erro: "ID de curso já existe no JSON." });
        }

        jsonData.cursos.push(req.body);
        await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log("Curso adicionado com sucesso ao JSON.");

        if (mongoose.connection.readyState === 1) {
            try {
                const novoCurso = new Curso(req.body);
                await novoCurso.save();
                console.log("Curso adicionado com sucesso ao MongoDB.");
            } catch (mongoErr) {
                if (mongoErr.code === 11000) {
                    console.warn(`AVISO: Curso com ID ${req.body.id} já existe no MongoDB (ignorando).`);
                } else {
                    console.error("Erro ao adicionar curso ao MongoDB:", mongoErr);
                }
            }
        } else {
            console.warn("AVISO: Mongoose não conectado, curso não adicionado ao MongoDB.");
        }

        res.status(201).json({ message: "Curso adicionado com sucesso!" });
    } catch (err) {
        console.error("Erro ao adicionar curso ao JSON:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao adicionar curso" });
    }
});

// PUT: Atualiza no JSON e depois no MongoDB
app.put('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const cursoIndex = jsonData.cursos.findIndex(c => c.id === cursoId);

        if (cursoIndex !== -1) {
            // Atualiza no JSON
            jsonData.cursos[cursoIndex] = { ...jsonData.cursos[cursoIndex], ...req.body, id: cursoId };
            await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log(`Curso com ID ${cursoId} atualizado com sucesso no JSON.`);

            // Tentar atualizar no MongoDB
            if (mongoose.connection.readyState === 1) {
                try {
                    const updatedCurso = await Curso.findOneAndUpdate(
                        { id: cursoId },
                        req.body,
                        { new: true, runValidators: true, upsert: false }
                    );
                    if (updatedCurso) {
                        console.log(`Curso com ID ${cursoId} atualizado com sucesso no MongoDB.`);
                    } else {
                        console.warn(`AVISO: Curso com ID ${cursoId} não encontrado no MongoDB para atualização.`);
                    }
                } catch (mongoErr) {
                    console.error("Erro ao atualizar curso no MongoDB:", mongoErr);
                }
            } else {
                console.warn("AVISO: Mongoose não conectado, curso não atualizado no MongoDB.");
            }

            res.status(200).json({ message: "Curso atualizado com sucesso!", curso: jsonData.cursos[cursoIndex] });
        } else {
            res.status(404).json({ error: "Curso não encontrado no JSON para atualização." });
        }
    } catch (err) {
        console.error("Erro ao atualizar curso no JSON:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao atualizar curso" });
    }
});

// DELETE: Deleta do JSON e depois do MongoDB
app.delete('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(bdPath, 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.cursos.length;

        jsonData.cursos = jsonData.cursos.filter(c => c.id !== cursoId);

        if (jsonData.cursos.length < initialLength) {
            await fs.writeFile(bdPath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log(`Curso com ID ${cursoId} deletado com sucesso do JSON.`);

            if (mongoose.connection.readyState === 1) {
                try {
                    const resultado = await Curso.deleteOne({ id: cursoId });
                    if (resultado.deletedCount > 0) {
                        console.log(`Curso com ID ${cursoId} deletado com sucesso do MongoDB.`);
                    } else {
                        console.warn(`AVISO: Curso com ID ${cursoId} não encontrado no MongoDB (ignorando).`);
                    }
                } catch (mongoErr) {
                    console.error("Erro ao deletar curso do MongoDB:", mongoErr);
                }
            } else {
                console.warn("AVISO: Mongoose não conectado, curso não deletado do MongoDB.");
            }

            res.status(200).json({ message: "Curso deletado com sucesso!" });
        } else {
            res.status(404).json({ error: "Curso não encontrado no JSON." });
        }
    } catch (err) {
        console.error("Erro ao deletar curso do JSON:", err);
        res.status(500).json({ erro: "Erro interno do servidor ao deletar curso" });
    }
});

// --- Rota de Autenticação ---
app.post('/login', (req, res) => {
    console.log("Tentativa de login:", req.body);
    const { login, password } = req.body;
    if (login === 'admin' && password === 'admin') {
        isAuthenticated = true;
        res.json({ message: "Login bem-sucedido" });
    } else {
        isAuthenticated = false;
        res.status(401).json({ error: "Login ou senha incorretos" });
    }
});

// --- Middleware para lidar com 404 (Not Found) ---
app.use((req, res, next) => {
    console.log(`[404 NOT FOUND] Recurso não encontrado: ${req.originalUrl}`);
    res.status(404).send('<h1>Erro 404: Recurso não encontrado</h1><p>O recurso que você procura não existe.</p>');
});

// --- Middleware para lidar com erros gerais ---
app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR] ${err.stack}`);
    res.status(500).send('<h1>Erro 500: Erro Interno do Servidor</h1><p>Ocorreu um erro inesperado no servidor.</p>');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
