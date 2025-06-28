const listaNomes = document.getElementById("listanomes");
const listaCursos = document.getElementById("listacursos");
const botaoCursos = document.getElementById("btnCursos");
const botaoNomes = document.getElementById("btnAlunos");
const botaoPesquisa = document.getElementById("btnPesquisa");
const pesquisaAlunoDiv = document.getElementById("pesquisaAluno");
const inputAlunoId = document.getElementById("inputAlunoId");
const btnPesquisar = document.getElementById("btnPesquisar");
const resultadoPesquisa = document.getElementById("resultadoPesquisa");
const menuBtn = document.getElementById("menu-toggle");
const menu = document.querySelector(".menu-lateral");

const BASE_URL = "http://localhost:3000";

// Mostrar lista de alunos
async function mostrarAlunos() {
  try {
    const resposta = await fetch(`${BASE_URL}/alunos`);
    const alunos = await resposta.json();

    if (listaNomes) {
      listaNomes.innerHTML = "";
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

// Mostrar lista de cursos
async function mostrarCursos() {
  try {
    const resposta = await fetch(`${BASE_URL}/cursos`);
    const cursos = await resposta.json();

    if (listaCursos) {
      listaCursos.innerHTML = "";
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

// Alternar visibilidade do menu lateral
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
}

// Mostrar/ocultar barra de pesquisa
if (botaoPesquisa && pesquisaAlunoDiv && inputAlunoId && resultadoPesquisa) {
  botaoPesquisa.addEventListener("click", () => {
    pesquisaAlunoDiv.style.display = pesquisaAlunoDiv.style.display === "none" ? "block" : "none";
    resultadoPesquisa.innerHTML = "";
    inputAlunoId.value = "";
  });
}

// Buscar aluno por ID
if (btnPesquisar && inputAlunoId && resultadoPesquisa) {
  btnPesquisar.addEventListener("click", async () => {
    const id = Number(inputAlunoId.value);
    if (!id) {
      resultadoPesquisa.innerHTML = "<p style='color: red;'>Por favor, insira um ID válido.</p>";
      return;
    }

    try {
      const resposta = await fetch(`${BASE_URL}/alunos`);
      const alunos = await resposta.json();
      const aluno = alunos.find(a => a.id === id);

      if (aluno) {
        resultadoPesquisa.innerHTML = `<p>Aluno encontrado: ${aluno.Nome} ${aluno.Apelido} - ${aluno.Curso} (${aluno.Ano_Curricular})</p>`;
      } else {
        resultadoPesquisa.innerHTML = "<p style='color:red'>Aluno não encontrado.</p>";
      }
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      resultadoPesquisa.innerHTML = "<p style='color:red'>Erro ao buscar aluno.</p>";
    }
  });
}

// Associar botões às funções
if (botaoNomes) {
  botaoNomes.addEventListener("click", mostrarAlunos);
}
if (botaoCursos) {
  botaoCursos.addEventListener("click", mostrarCursos);
}
