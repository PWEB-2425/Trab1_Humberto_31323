const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');  // Adicionando o CORS
const app = express();
const PORT = 3000;

let isAuthenticated = false; // Controle simples de autenticação

// Middleware para verificar se o usuário está autenticado
function checkAuth(req, res, next) {
  if (!isAuthenticated) {
    return res.redirect('/');  // Redireciona para login caso não esteja autenticado
  }
  next();  // Se autenticado, segue para a próxima rota
}

app.use(cors());  // Permitir requisições de qualquer origem
app.use(express.json());

// Serve arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));  // Serve os arquivos do frontend

// Rota para servir o login.html
app.get('/', (req, res) => {
  console.log("Rota para login acessada");
  res.sendFile(path.join(__dirname, '../frontend', 'login.html')); // Serve login.html
});

// Rota para o menu inicial (após autenticação)
app.get('/home', checkAuth, (req, res) => {
  console.log("Rota para menuinicial acessada");
  res.sendFile(path.join(__dirname, '../frontend', 'menuinicial.html'));  // Serve menuinicial.html após login
});

// Rota para o dashboard (após autenticação)
app.get('/dashboard', checkAuth, (req, res) => {
  console.log("Rota para dashboard acessada");
  res.sendFile(path.join(__dirname, '../frontend', 'dashboard.html'));  // Serve dashboard.html após login
});

const bdPath = path.join(__dirname, '../mock-data/bd.json');

// API para pegar os dados dos alunos
app.get('/alunos', async (req, res) => {
  console.log("Rota /alunos acessada");
  try {
    const data = await fs.readFile(bdPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.alunos);  // Retorna a lista de alunos
  } catch (err) {
    console.error("Erro ao ler bd.json:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// API para pegar os dados dos cursos
app.get('/cursos', async (req, res) => {
  console.log("Rota /cursos acessada");
  try {
    const data = await fs.readFile(bdPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.cursos);  // Retorna a lista de cursos
  } catch (err) {
    console.error("Erro ao ler bd.json:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// API para pegar os dados de um aluno por ID
app.get('/alunos/:id', async (req, res) => {
  const alunoId = parseInt(req.params.id, 10);  // Pega o ID do aluno da URL
  console.log(`Buscando aluno com ID: ${alunoId}`);  // Log para depuração

  try {
    const data = await fs.readFile(bdPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Encontrar aluno com o ID correspondente
    const aluno = jsonData.alunos.find(a => a.id === alunoId);

    if (aluno) {
      console.log(`Aluno encontrado: ${aluno.Nome} ${aluno.Apelido}`);  // Log para depuração
      res.json(aluno);  // Retorna o aluno encontrado
    } else {
      console.log(`Aluno com ID ${alunoId} não encontrado`);  // Log de erro
      res.status(404).json({ error: "Aluno não encontrado" });  // Retorna erro caso o aluno não seja encontrado
    }
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
  console.log("Tentativa de login:", req.body);
  const { login, password } = req.body;

  if (login === 'admin' && password === 'admin') {
    isAuthenticated = true;  // Marca como autenticado
    res.json({ message: "Login bem-sucedido" });
  } else {
    res.status(401).json({ error: "Login ou senha incorretos" });
  }
});
