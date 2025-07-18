const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Carrega .env

const app = express();

// --- Variáveis de Ambiente ---
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI) {
    console.error('Erro: MONGODB_URI não está definida no .env');
    process.exit(1);
} else {
    console.log('MONGODB_URI carregada com sucesso:', MONGODB_URI);
}

// --- MongoDB ---
mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB com sucesso!'))
.catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
});

// --- Middlewares ---
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://trab1-humberto-31323-58n5.onrender.com',
        // Adicione a URL do Vercel aqui após o deploy do front-end
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// --- Header opcional para permitir scripts inline (só se necessário) ---
// ⚠️ Comente se não precisar de inline scripts!
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net");
    next();
});

// --- Modelos Mongoose ---
const alunoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Apelido: { type: String, required: true },
    Curso: { type: String, required: true },
    Ano_Curricular: { type: String, required: true }
}, { collection: 'alunos' });

const cursoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Sigla: { type: String, required: true }
}, { collection: 'cursos' });

const Aluno = mongoose.model('Aluno', alunoSchema);
const Curso = mongoose.model('Curso', cursoSchema);

// --- Rotas API Alunos ---
app.get('/alunos', async (req, res) => {
    try {
        const alunos = await Aluno.find({});
        res.json(alunos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

app.post('/alunos', async (req, res) => {
    try {
        const novoAluno = new Aluno(req.body);
        await novoAluno.save();
        res.status(201).json({ message: 'Aluno adicionado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar aluno' });
    }
});

app.put('/alunos/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );
        aluno ? res.json({ message: 'Aluno atualizado com sucesso!', aluno }) :
                res.status(404).json({ error: 'Aluno não encontrado' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
});

app.delete('/alunos/:id', async (req, res) => {
    try {
        const result = await Aluno.deleteOne({ id: parseInt(req.params.id) });
        result.deletedCount ?
            res.json({ message: 'Aluno deletado com sucesso!' }) :
            res.status(404).json({ error: 'Aluno não encontrado' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar aluno' });
    }
});

// --- Rotas API Cursos ---
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find({});
        res.json(cursos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar cursos' });
    }
});

app.post('/cursos', async (req, res) => {
    try {
        const novoCurso = new Curso(req.body);
        await novoCurso.save();
        res.status(201).json({ message: 'Curso adicionado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar curso' });
    }
});

app.put('/cursos/:id', async (req, res) => {
    try {
        const curso = await Curso.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );
        curso ? res.json({ message: 'Curso atualizado com sucesso!', curso }) :
                res.status(404).json({ error: 'Curso não encontrado' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar curso' });
    }
});

app.delete('/cursos/:id', async (req, res) => {
    try {
        const result = await Curso.deleteOne({ id: parseInt(req.params.id) });
        result.deletedCount ?
            res.json({ message: 'Curso deletado com sucesso!' }) :
            res.status(404).json({ error: 'Curso não encontrado' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar curso' });
    }
});

// --- Servir o frontend ---
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback: qualquer rota que não for API, retorna index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// --- Iniciar servidor ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
