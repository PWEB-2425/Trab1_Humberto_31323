const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

let isAuthenticated = false; // Controle simples de autenticação

// Middleware para verificar se o usuário está autenticado
function checkAuth(req, res, next) {
  if (!isAuthenticated) {
    return res.redirect('/');
  }
  next();
}

app.use(express.json());

// Serve arquivos estáticos da pasta frontend (ajustando o caminho)
app.use(express.static(path.join(__dirname, '../frontend'))); // Acessa 'frontend' a partir de 'backend'

// Rota para servir o login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html')); // Serve login.html
});

// Rota para o menu inicial (deve ser protegido, ou seja, só após login)
app.get('/home', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'menuinicial.html')); // Serve menuinicial.html após login
});

// Rota para o dashboard (também deve ser protegido)
app.get('/dashboard', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dashboard.html')); // Serve dashboard.html após login
});

const bdPath = path.join(__dirname, '../mock-data', 'bd.json');

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

// Rota para autenticar o login
app.post('/login', (req, res) => {
  const { login, password } = req.body;

  if (login === 'admin' && password === 'admin') {
    isAuthenticated = true; // Marca como autenticado
    res.json({ message: "Login bem-sucedido" });
  } else {
    res.status(401).json({ error: "Login ou senha incorretos" });
  }
});
