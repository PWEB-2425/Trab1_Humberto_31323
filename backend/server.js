const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const app = express();

// Variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// Verificação da URI do MongoDB
if (!MONGODB_URI) {
    console.error('Erro: A variável MONGODB_URI não está definida no arquivo .env');
    process.exit(1); // Encerra o servidor se não houver a URI
} else {
    console.log('MONGODB_URI carregada com sucesso:', MONGODB_URI);
}

mongoose.set('strictQuery', false); // Para desabilitar o aviso de depreciação

// Conectar ao MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado ao MongoDB com sucesso!');
    })
    .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); // Encerra o servidor se a conexão falhar
    });

// --- Middlewares Globais ---
app.use(cors({
    origin: [
        'http://localhost:3000', // Para desenvolvimento local
        'https://trab1-humberto-31323-58n5.onrender.com', // URL do seu backend no Render
        // Adicione o URL do seu frontend Vercel aqui quando fizer o deploy
        // Ex: 'https://seu-frontend-vercel-url.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json()); // Para analisar JSON no corpo da requisição

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

// --- Rotas de API para alunos e cursos ---

// GET todos os alunos
app.get('/alunos', async (req, res) => {
    try {
        const alunos = await Aluno.find({});
        res.json(alunos);
    } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

// POST novo aluno
app.post('/alunos', async (req, res) => {
    const { id, Nome, Apelido, Curso, Ano_Curricular } = req.body;
    const novoAluno = new Aluno({ id, Nome, Apelido, Curso, Ano_Curricular });

    try {
        await novoAluno.save();
        res.status(201).json({ message: 'Aluno adicionado com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar aluno:', err);
        res.status(500).json({ error: 'Erro ao adicionar aluno' });
    }
});

// PUT (Atualizar) aluno por ID
app.put('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    const updatedData = req.body;

    try {
        // Use findOneAndUpdate para encontrar pelo 'id' (seu campo personalizado) e atualizar
        const result = await Aluno.findOneAndUpdate({ id: alunoId }, updatedData, { new: true, runValidators: true });
        if (result) {
            res.status(200).json({ message: 'Aluno atualizado com sucesso!', aluno: result });
        } else {
            res.status(404).json({ error: 'Aluno não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao atualizar aluno:', err);
        res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
});

// DELETE aluno por ID
app.delete('/alunos/:id', async (req, res) => {
    const alunoId = req.params.id;

    try {
        const result = await Aluno.deleteOne({ id: alunoId });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Aluno deletado com sucesso!' });
        } else {
            res.status(404).json({ error: 'Aluno não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao deletar aluno:', err);
        res.status(500).json({ error: 'Erro ao deletar aluno' });
    }
});

// GET todos os cursos
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find({});
        res.json(cursos);
    } catch (err) {
        console.error('Erro ao buscar cursos:', err);
        res.status(500).json({ error: 'Erro ao buscar cursos' });
    }
});

// POST novo curso
app.post('/cursos', async (req, res) => {
    const { id, Nome, Sigla } = req.body;
    const novoCurso = new Curso({ id, Nome, Sigla });

    try {
        await novoCurso.save();
        res.status(201).json({ message: 'Curso adicionado com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar curso:', err);
        res.status(500).json({ error: 'Erro ao adicionar curso' });
    }
});

// PUT (Atualizar) curso por ID
app.put('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    const updatedData = req.body;

    try {
        // Use findOneAndUpdate para encontrar pelo 'id' (seu campo personalizado) e atualizar
        const result = await Curso.findOneAndUpdate({ id: cursoId }, updatedData, { new: true, runValidators: true });
        if (result) {
            res.status(200).json({ message: 'Curso atualizado com sucesso!', curso: result });
        } else {
            res.status(404).json({ error: 'Curso não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao atualizar curso:', err);
        res.status(500).json({ error: 'Erro ao atualizar curso' });
    }
});

// DELETE curso por ID
app.delete('/cursos/:id', async (req, res) => {
    const cursoId = req.params.id;

    try {
        const result = await Curso.deleteOne({ id: cursoId });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Curso deletado com sucesso!' });
        } else {
            res.status(404).json({ error: 'Curso não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao deletar curso:', err);
        res.status(500).json({ error: 'Erro ao deletar curso' });
    }
});

// --- Servir Arquivos Estáticos (DEVE VIR DEPOIS DAS ROTAS DE API) ---
// Isso permite que o Express sirva os arquivos HTML, CSS, JS do frontend.
//app.use(express.static(path.join(__dirname, '../frontend')));

// --- Rota para a raiz ('/') para servir o index.html (Menu Inicial) ---
// Quando alguém acessa a URL base do seu backend, ele serve o index.html do frontend.
//app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
//});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
