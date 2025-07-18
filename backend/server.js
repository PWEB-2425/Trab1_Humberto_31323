const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Conexão ao MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Definindo o modelo de Aluno
const alunoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  Nome: { type: String, required: true },
  Apelido: { type: String, required: true },
  Curso: { type: String, required: true },
  Ano_Curricular: { type: String, required: true }
});
const Aluno = mongoose.model('Aluno', alunoSchema);

// Definindo o modelo de Curso
const cursoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  Nome: { type: String, required: true },
  Sigla: { type: String, required: true }
});
const Curso = mongoose.model('Curso', cursoSchema);

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes

// --- Rota GET para alunos
app.get('/alunos', async (req, res) => {
  try {
    const alunos = await Aluno.find();
    res.json(alunos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar alunos');
  }
});

// --- Rota POST para adicionar aluno
app.post('/alunos', async (req, res) => {
  const { id, Nome, Apelido, Curso, Ano_Curricular } = req.body;

  try {
    const alunoExistente = await Aluno.findOne({ id });
    if (alunoExistente) {
      return res.status(400).json({ error: 'Aluno com esse ID já existe' });
    }

    const aluno = new Aluno({ id, Nome, Apelido, Curso, Ano_Curricular });
    await aluno.save();
    res.status(201).json({ message: 'Aluno adicionado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar aluno');
  }
});

// --- Rota DELETE para remover aluno
app.delete('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const aluno = await Aluno.findOneAndDelete({ id });
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar aluno');
  }
});

// --- Rota GET para cursos
app.get('/cursos', async (req, res) => {
  try {
    const cursos = await Curso.find();
    res.json(cursos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar cursos');
  }
});

// --- Rota POST para adicionar curso
app.post('/cursos', async (req, res) => {
  const { id, Nome, Sigla } = req.body;

  try {
    const cursoExistente = await Curso.findOne({ id });
    if (cursoExistente) {
      return res.status(400).json({ error: 'Curso com esse ID já existe' });
    }

    const curso = new Curso({ id, Nome, Sigla });
    await curso.save();
    res.status(201).json({ message: 'Curso adicionado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar curso');
  }
});

// --- Rota DELETE para remover curso
app.delete('/cursos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const curso = await Curso.findOneAndDelete({ id });
    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }
    res.json({ message: 'Curso deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar curso');
  }
});

// Rota para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
