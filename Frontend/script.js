const listaNomes = document.getElementById("listanomes");
const listaCursos = document.getElementById("listacursos");
const botaoCursos = document.getElementById("btnCursos");
const botaoNomes = document.getElementById("btnAlunos");
const botaoPesquisa = document.getElementById("btnPesquisa");
const pesquisaAlunoDiv = document.getElementById("pesquisaAluno");
const inputAlunoId = document.getElementById("inputAlunoId");
const btnPesquisar = document.getElementById("btnPesquisar");
const resultadoPesquisa = document.getElementById("resultadoPesquisa");

const BASE_URL = "http://localhost:3000";

// Função para mostrar lista de alunos
async function mostrarAlunos() {
  console.log("Função mostrarAlunos chamada!"); // Log para depuração
  try {
    const resposta = await fetch(`${BASE_URL}/alunos`);
    const alunos = await resposta.json();

    if (listaNomes) {
      listaNomes.innerHTML = ""; // Limpar a lista existente
      alunos.forEach(aluno => {
        const novoP = document.createElement("p");
        novoP.innerHTML = `${aluno.Nome} ${aluno.Apelido} - ${aluno.Curso} (${aluno.Ano_Curricular})`;
        listaNomes.appendChild(novoP);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar os alunos:', error);
  }
}

// Função para mostrar lista de cursos
async function mostrarCursos() {
  console.log("Função mostrarCursos chamada!"); // Log para depuração
  try {
    const resposta = await fetch(`${BASE_URL}/cursos`);
    const cursos = await resposta.json();

    if (listaCursos) {
      listaCursos.innerHTML = ""; // Limpar a lista existente
      cursos.forEach(curso => {
        const novoP = document.createElement("p");
        novoP.innerHTML = `${curso.Nome} - ${curso.Sigla} (ID: ${curso.id})`;
        listaCursos.appendChild(novoP);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar os cursos:', error);
  }
}

// Função para pesquisar aluno por ID
async function pesquisarAluno() {
  console.log("Função pesquisarAluno chamada!"); // Log para depuração
  const id = parseInt(inputAlunoId.value, 10);
  if (isNaN(id) || id <= 0) {
    resultadoPesquisa.innerHTML = "<p style='color: red;'>Por favor, insira um ID válido.</p>";
    return;
  }

  try {
    const resposta = await fetch(`${BASE_URL}/alunos/${id}`);
    if (resposta.ok) {
      const aluno = await resposta.json();
      if (aluno && aluno.id === id) {
        resultadoPesquisa.innerHTML = `<p>Aluno encontrado: ${aluno.Nome} ${aluno.Apelido} - ${aluno.Curso} (${aluno.Ano_Curricular})</p>`;
      } else {
        resultadoPesquisa.innerHTML = "<p style='color:red'>Aluno não encontrado.</p>";
      }
    } else {
      resultadoPesquisa.innerHTML = "<p style='color:red'>Aluno não encontrado.</p>";
    }
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    resultadoPesquisa.innerHTML = "<p style='color:red'>Erro ao buscar aluno.</p>";
  }
}

// Adicionando eventos aos botões
if (botaoNomes) {
  console.log("Evento para Listar Alunos adicionado!");
  botaoNomes.addEventListener("click", mostrarAlunos);
}

if (botaoCursos) {
  console.log("Evento para Listar Cursos adicionado!");
  botaoCursos.addEventListener("click", mostrarCursos);
}

if (botaoPesquisa) {
  console.log("Evento para Mostrar/Ocultar Pesquisa adicionado!");
  botaoPesquisa.addEventListener("click", () => {
    pesquisaAlunoDiv.style.display = pesquisaAlunoDiv.style.display === 'none' ? 'block' : 'none';
  });
}

if (btnPesquisar) {
  console.log("Evento para Pesquisar Aluno adicionado!");
  btnPesquisar.addEventListener("click", pesquisarAluno);
}

// Carregar listas ao iniciar a página
window.addEventListener('load', () => {
  mostrarAlunos();
  mostrarCursos();
});
