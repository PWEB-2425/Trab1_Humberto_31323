const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Carrega .env

const app = express();

// --- CORS Configurado ---
// Permite requisições das seguintes origens:
// - localhost:3000 (para desenvolvimento local do frontend e backend)
// - A URL do seu frontend no Vercel (incluindo a branch 'git-main-humbertos-projects-cfa953aa')
// - A URL do seu backend no Render (para comunicação interna, se aplicável, ou testes diretos)
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://trab1-humberto-31323-final.vercel.app', // Sua URL principal do Vercel
        'https://trab1-humberto-31323-final-git-main-humbertos-projects-cfa953aa.vercel.app', // Sua URL de branch do Vercel
        'https://trab1-humberto-31323-58n5.onrender.com' // Sua URL do backend no Render
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// --- Variáveis de Ambiente ---
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI) {
    console.error('Erro: MONGODB_URI não está definida no .env');
    process.exit(1);
} else {
    console.log('MONGODB_URI carregada com sucesso:', MONGODB_URI);
}

// --- Conexão MongoDB ---
mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
.catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
});

app.use(express.json());

// --- Content Security Policy (CSP) Header seguro ---
// Esta política é mais abrangente para permitir todos os recursos necessários e evitar erros CSP.
// 'self': Permite recursos da mesma origem (seu domínio).
// 'unsafe-inline': Necessário para estilos inline (se houver) e para permitir que o navegador execute scripts de extensões.
//                 Idealmente, remova todos os scripts/estilos inline para maior segurança.
// https://cdn.jsdelivr.net: Permite scripts e estilos de CDNs comuns (Bootstrap Icons, Bootstrap CSS).
// data:: Permite imagens codificadas em base64 (favicons, etc.).
// http://localhost:3000: Permite recursos do localhost durante o desenvolvimento.
// connect-src: Permite requisições de dados para o backend local e as URLs de deploy.
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "img-src 'self' data: http://localhost:3000 https://trab1-humberto-31323-final.vercel.app https://trab1-humberto-31323-final-git-main-humbertos-projects-cfa953aa.vercel.app; " + // Adicionado Vercel URLs para imagens
        "font-src 'self' https://cdn.jsdelivr.net; " +
        "connect-src 'self' http://localhost:3000 https://trab1-humberto-31323-58n5.onrender.com https://trab1-humberto-31323-final.vercel.app https://trab1-humberto-31323-final-git-main-humbertos-projects-cfa953aa.vercel.app; " + // Adicionado Vercel URLs para connect-src
        "object-src 'none'; " +
        "frame-src 'none';"
    );
    next();
});

// --- Esquemas e Modelos ---
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
        console.error('Erro ao buscar alunos:', err);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

app.post('/alunos', async (req, res) => {
    try {
        const novoAluno = new Aluno(req.body);
        await novoAluno.save();
        res.status(201).json({ message: 'Aluno adicionado com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar aluno:', err);
        res.status(500).json({ error: 'Erro ao adicionar aluno' });
    }
});

app.put('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    const updatedData = req.body;
    try {
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

app.delete('/alunos/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
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

// --- Rotas API Cursos ---
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find({});
        res.json(cursos);
    } catch (err) {
        console.error('Erro ao buscar cursos:', err);
        res.status(500).json({ error: 'Erro ao buscar cursos' });
    }
});

app.post('/cursos', async (req, res) => {
    try {
        const novoCurso = new Curso(req.body);
        await novoCurso.save();
        res.status(201).json({ message: 'Curso adicionado com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar curso:', err);
        res.status(500).json({ error: 'Erro ao adicionar curso' });
    }
});

app.put('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    const updatedData = req.body;
    try {
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

app.delete('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
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

// --- ATENÇÃO: APENAS PARA DESENVOLVIMENTO LOCAL ---
// Estas linhas servem os arquivos estáticos do frontend e a rota raiz.
// ELAS DEVEM ESTAR COMENTADAS OU REMOVIDAS AO FAZER O DEPLOY DO BACKEND NO RENDER!
// O Vercel será responsável por servir o frontend em produção.
// app.use(express.static(path.join(__dirname, '../frontend')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
// });
// --- FIM DO BLOCO DE DESENVOLVIMENTO LOCAL ---

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
