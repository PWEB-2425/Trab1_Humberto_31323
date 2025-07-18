const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();  // Carrega as variáveis de ambiente do arquivo .env

const app = express();

// Variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// Verificação da URI do MongoDB
if (!MONGODB_URI) {
    console.error('Erro: A variável MONGODB_URI não está definida no arquivo .env');
    process.exit(1);  // Encerra o servidor se não houver a URI
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
        process.exit(1);  // Encerra o servidor se a conexão falhar
    });

// --- Middlewares Globais ---
app.use(cors({
    origin: [
        'http://localhost:3000',  // Adicionar o endereço do seu frontend (caso tenha deploy)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());  // Para analisar JSON no corpo da requisição

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

// --- Rota de Login ---
app.post('/login', async (req, res) => {
    const { login, password } = req.body;

    console.log("Tentando fazer login com:", login, password);

    // Simulando a verificação com dados fixos (substitua com lógica real de autenticação, ex: consulta ao banco de dados)
    const users = [
        { username: 'admin', password: 'admin123' }  // Exemplo de dados de login
    ];

    // Encontrar usuário no banco de dados ou usar uma lógica mais avançada
    const user = users.find(u => u.username === login && u.password === password);

    if (user) {
        // Aqui você gera um token (por exemplo, JWT) para autenticação
        const token = 'seu_token_aqui';  // Geração de token real aqui

        // Retorna o token e mensagem de sucesso
        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } else {
        // Se as credenciais não corresponderem, retorna um erro
        res.status(401).json({ error: 'Credenciais inválidas' });
    }
});

// --- Rotas de API ---
app.get('/alunos', async (req, res) => {
    try {
        const alunos = await Aluno.find({});
        res.json(alunos);
    } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

// Rota para adicionar um aluno
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

// Rota para deletar um aluno pelo ID
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

// Rota para buscar cursos
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find({});
        res.json(cursos);
    } catch (err) {
        console.error('Erro ao buscar cursos:', err);
        res.status(500).json({ error: 'Erro ao buscar cursos' });
    }
});

// Rota para adicionar um curso
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

// Rota para deletar um curso pelo ID
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

// --- Rota para servir o index.html ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));  // Modifique para o caminho correto do seu HTML
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
