const BASE_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  // Lógica do Menu de navegação (global)
  const menuBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu-lateral");
  const body = document.body;

  if (menuBtn && menu && body) {
    menuBtn.addEventListener("click", () => {
      menu.classList.toggle("open");
      body.classList.toggle("menu-aberto");
    });
  }

  // --- Referências aos botões de navegação do Dashboard ---
  const btnListarAlunos = document.getElementById("btnListarAlunos");
  const btnListarCursos = document.getElementById("btnListarCursos");
  // CORREÇÃO: Usar o ID correto do HTML "btnPesquisarAlunos"
  const btnPesquisarAlunos = document.getElementById("btnPesquisarAlunos"); 
  const btnPesquisarCursos = document.getElementById("btnPesquisarCursos");

  // --- Referências aos containers e elementos de pesquisa ---
  const pesquisaAlunoContainer = document.getElementById("pesquisaAlunoContainer");
  const inputPesquisaNomeAluno = document.getElementById("inputPesquisaNomeAluno");
  const btnVerificarAluno = document.getElementById("btnVerificarAluno");
  const btnCancelarPesquisaAluno = document.getElementById("btnCancelarPesquisaAluno");
  const resultadoPesquisaAluno = document.getElementById("resultadoPesquisaAluno");

  const pesquisaCursoContainer = document.getElementById("pesquisaCursoContainer");
  const inputPesquisaNomeCurso = document.getElementById("inputPesquisaNomeCurso");
  const btnVerificarCurso = document.getElementById("btnVerificarCurso");
  const btnCancelarPesquisaCurso = document.getElementById("btnCancelarPesquisaCurso");
  const resultadoPesquisaCurso = document.getElementById("resultadoPesquisaCurso");

  // --- Funções Auxiliares para Mostrar/Ocultar Containers de Pesquisa ---
  function hideAllPesquisaContainers() {
    // Esconder ambos os containers e limpar os campos
    if (pesquisaAlunoContainer) {
      pesquisaAlunoContainer.classList.remove("active");
      resultadoPesquisaAluno.textContent = '';
      inputPesquisaNomeAluno.value = '';
    }
    if (pesquisaCursoContainer) {
      pesquisaCursoContainer.classList.remove("active");
      resultadoPesquisaCurso.textContent = '';
      inputPesquisaNomeCurso.value = '';
    }
  }

  // --- Event Listeners para os botões de navegação (Listar) ---
  if (btnListarAlunos) {
    btnListarAlunos.addEventListener("click", () => {
      window.location.href = "listaralunos.html";
    });
  }

  if (btnListarCursos) {
    btnListarCursos.addEventListener("click", () => {
      window.location.href = "listarcursos.html";
    });
  }

  // --- Event Listeners para os botões de Pesquisar (Mostrar campo) ---
  if (btnPesquisarAlunos) {
    btnPesquisarAlunos.addEventListener("click", () => {
      hideAllPesquisaContainers(); // Oculta outros containers de pesquisa
      if (pesquisaAlunoContainer) {
        pesquisaAlunoContainer.classList.add("active"); // Mostra o container de aluno
      }
    });
  }

  if (btnPesquisarCursos) {
    btnPesquisarCursos.addEventListener("click", () => {
      hideAllPesquisaContainers(); // Oculta outros containers de pesquisa
      if (pesquisaCursoContainer) {
        pesquisaCursoContainer.classList.add("active"); // Mostra o container de curso
      }
    });
  }

  // --- Event Listeners para botões de Cancelar Pesquisa ---
  if (btnCancelarPesquisaAluno) {
    btnCancelarPesquisaAluno.addEventListener("click", () => {
      hideAllPesquisaContainers();
    });
  }

  if (btnCancelarPesquisaCurso) {
    btnCancelarPesquisaCurso.addEventListener("click", () => {
      hideAllPesquisaContainers();
    });
  }

  // --- Lógica de Pesquisa de Alunos no Dashboard ---
  async function verificarAlunoPorNome() {
    const termo = inputPesquisaNomeAluno.value.trim();
    resultadoPesquisaAluno.textContent = ''; // Limpa resultado anterior

    if (!termo) {
      resultadoPesquisaAluno.textContent = "Por favor, digite um nome ou apelido.";
      resultadoPesquisaAluno.style.color = "orange";
      return;
    }

    try {
      const resposta = await fetch(`${BASE_URL}/alunos`);
      if (!resposta.ok) {
        throw new Error(`HTTP error! status: ${resposta.status}`);
      }
      const alunos = await resposta.json();

      const alunoEncontrado = alunos.find(aluno =>
        aluno.Nome.toLowerCase().includes(termo.toLowerCase()) ||
        aluno.Apelido.toLowerCase().includes(termo.toLowerCase())
      );

      if (alunoEncontrado) {
        resultadoPesquisaAluno.textContent = `Aluno '${alunoEncontrado.Nome} ${alunoEncontrado.Apelido}' encontrado! (ID: ${alunoEncontrado.id})`;
        resultadoPesquisaAluno.style.color = "green";
      } else {
        resultadoPesquisaAluno.textContent = `Aluno '${termo}' não encontrado.`;
        resultadoPesquisaAluno.style.color = "red";
      }
    } catch (error) {
      console.error("Erro ao verificar aluno:", error);
      resultadoPesquisaAluno.textContent = "Erro ao pesquisar aluno. Verifique o console.";
      resultadoPesquisaAluno.style.color = "red";
    }
  }

  if (btnVerificarAluno) {
    btnVerificarAluno.addEventListener("click", verificarAlunoPorNome);
    if (inputPesquisaNomeAluno) {
      inputPesquisaNomeAluno.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          verificarAlunoPorNome();
        }
      });
    }
  }

  // --- Lógica de Pesquisa de Cursos no Dashboard ---
  async function verificarCursoPorNome() {
    const termo = inputPesquisaNomeCurso.value.trim();
    resultadoPesquisaCurso.textContent = ''; // Limpa resultado anterior

    if (!termo) {
      resultadoPesquisaCurso.textContent = "Por favor, digite um nome ou sigla do curso.";
      resultadoPesquisaCurso.style.color = "orange";
      return;
    }

    try {
      const resposta = await fetch(`${BASE_URL}/cursos`);
      if (!resposta.ok) {
        throw new Error(`HTTP error! status: ${resposta.status}`);
      }
      const cursos = await resposta.json();

      const cursoEncontrado = cursos.find(curso =>
        curso.Nome.toLowerCase().includes(termo.toLowerCase()) ||
        curso.Sigla.toLowerCase().includes(termo.toLowerCase())
      );

      if (cursoEncontrado) {
        resultadoPesquisaCurso.textContent = `Curso '${cursoEncontrado.Nome}' (Sigla: ${cursoEncontrado.Sigla}) encontrado! (ID: ${cursoEncontrado.id})`;
        resultadoPesquisaCurso.style.color = "green";
      } else {
        resultadoPesquisaCurso.textContent = `Curso '${termo}' não encontrado.`;
        resultadoPesquisaCurso.style.color = "red";
      }
    } catch (error) {
      console.error("Erro ao verificar curso:", error);
      resultadoPesquisaCurso.textContent = "Erro ao pesquisar curso. Verifique o console.";
      resultadoPesquisaCurso.style.color = "red";
    }
  }

  if (btnVerificarCurso) {
    btnVerificarCurso.addEventListener("click", verificarCursoPorNome);
    if (inputPesquisaNomeCurso) {
      inputPesquisaNomeCurso.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          verificarCursoPorNome();
        }
      });
    }
  }
});