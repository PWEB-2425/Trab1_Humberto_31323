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
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
        .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));
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
    Sigla: { type: String, required: true }
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

// --- Função para ler dados do MongoDB ou do arquivo JSON ---
async function readData(collection) {
    try {
        if (mongoose.connection.readyState === 1) {
            return await collection.find({});
        } else {
            console.warn(`AVISO: MongoDB não conectado, tentando ler dados de ${collection.collection.name} do JSON.`);
            const data = await fs.readFile(path.join(__dirname, '..', 'mock-data', 'bd.json'), 'utf8');
            const jsonData = JSON.parse(data);
            return jsonData[collection.collection.name] || [];
        }
    } catch (err) {
        console.error(`Erro ao buscar dados de ${collection.collection.name}:`, err);
        throw new Error(`Erro ao buscar dados de ${collection.collection.name}`);
    }
}

// --- Rota de Login ---
app.post('/login', (req, res) => {
    const { login, password } = req.body;

    if (!login || !password || login.trim() === '' || password.trim() === '') {
        return res.status(400).json({ error: "Login e senha são obrigatórios e não podem estar vazios." });
    }

    if (login === 'admin' && password === 'admin') {
        res.json({ message: "Login bem-sucedido" });
    } else {
        res.status(401).json({ error: "Login ou senha incorretos" });
    }
});

// --- Rota raiz '/' para verificar o servidor ---
app.get('/', (req, res) => {
    res.send('Servidor funcionando!');
});

// --- Rota para Alunos ---
app.get('/alunos', async (req, res) => {
    try {
        const alunos = await readData(Aluno);
        res.json(alunos);
    } catch (err) {
        res.status(500).json({ erro: "Erro interno ao buscar alunos" });
    }
});

app.post('/alunos', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '..', 'mock-data', 'bd.json'), 'utf8');
        const jsonData = JSON.parse(data);
        
        if (jsonData.alunos.some(a => a.id === req.body.id)) {
            return res.status(409).json({ erro: `Aluno com ID ${req.body.id} já existe.` });
        }

        jsonData.alunos.push(req.body);
        await fs.writeFile(path.join(__dirname, '..', 'mock-data', 'bd.json'), JSON.stringify(jsonData, null, 2), 'utf8');
        
        if (mongoose.connection.readyState === 1) {
            const novoAluno = new Aluno(req.body);
            await novoAluno.save();
            res.status(201).json({ message: "Aluno adicionado com sucesso!", aluno: novoAluno });
        } else {
            res.status(503).json({ erro: "MongoDB não está disponível. Dados gravados no arquivo JSON." });
        }
    } catch (err) {
        res.status(500).json({ erro: "Erro ao adicionar aluno" });
    }
});

app.put('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(path.join(__dirname, '..', 'mock-data', 'bd.json'), 'utf8');
        let jsonData = JSON.parse(data);
        const alunoIndex = jsonData.alunos.findIndex(a => a.id === alunoId);

        if (alunoIndex !== -1) {
            jsonData.alunos[alunoIndex] = { ...jsonData.alunos[alunoIndex], ...req.body, id: alunoId };
            await fs.writeFile(path.join(__dirname, '..', 'mock-data', 'bd.json'), JSON.stringify(jsonData, null, 2), 'utf8');

            if (mongoose.connection.readyState === 1) {
                const updatedAluno = await Aluno.findOneAndUpdate(
                    { id: alunoId },
                    req.body,
                    { new: true, runValidators: true }
                );
                res.status(200).json({ message: "Aluno atualizado com sucesso!", aluno: updatedAluno });
            } else {
                res.status(503).json({ erro: "MongoDB não está disponível. Dados atualizados no arquivo JSON." });
            }
        } else {
            res.status(404).json({ error: "Aluno não encontrado." });
        }
    } catch (err) {
        res.status(500).json({ erro: "Erro ao atualizar aluno" });
    }
});

app.delete('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(path.join(__dirname, '..', 'mock-data', 'bd.json'), 'utf8');
        let jsonData = JSON.parse(data);
        const initialLength = jsonData.alunos.length;
        jsonData.alunos = jsonData.alunos.filter(a => a.id !== alunoId);

        if (jsonData.alunos.length < initialLength) {
            await fs.writeFile(path.join(__dirname, '..', 'mock-data', 'bd.json'), JSON.stringify(jsonData, null, 2), 'utf8');

            if (mongoose.connection.readyState === 1) {
                const resultado = await Aluno.deleteOne({ id: alunoId });
                if (resultado.deletedCount > 0) {
                    res.status(200).json({ message: "Aluno deletado com sucesso!" });
                } else {
                    res.status(404).json({ error: "Aluno não encontrado no MongoDB." });
                }
            } else {
                res.status(503).json({ erro: "MongoDB não disponível. Exclusão no arquivo JSON." });
            }
        } else {
            res.status(404).json({ error: "Aluno não encontrado." });
        }
    } catch (err) {
        res.status(500).json({ erro: "Erro ao deletar aluno" });
    }
});

// --- Rota para Cursos ---
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await readData(Curso);
        res.json(cursos);
    } catch (err) {
        res.status(500).json({ erro: "Erro interno ao buscar cursos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
