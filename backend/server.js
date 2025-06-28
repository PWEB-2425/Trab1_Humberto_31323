const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Configurar header CSP para permitir scripts normais (sem eval)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval'");
  next();
});

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota para servir o login.html primeiro
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html')); // Serve login.html na rota raiz
});

// Rota para servir o index.html (página principal após login)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html')); // Serve index.html após login
});

const bdPath = path.join(__dirname, '../mock-data/bd.json');

// API para pegar os dados dos alunos
app.get('/alunos', async (req, res) => {
  try {
    const data = await fs.readFile(bdPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.alunos);
  } catch (err) {
    console.error("Erro ao ler bd.json:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// API para pegar os dados dos cursos
app.get('/cursos', async (req, res) => {
  try {
    const data = await fs.readFile(bdPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.cursos);
  } catch (err) {
    console.error("Erro ao ler bd.json:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
