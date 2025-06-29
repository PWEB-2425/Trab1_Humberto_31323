const tabelaAlunos = document.getElementById("tabelaAlunos").getElementsByTagName("tbody")[0];
const btnAdicionarAluno = document.getElementById("btnAdicionarAluno");
const btnDeletarAluno = document.getElementById("btnDeletarAluno");
const formAdicionarAluno = document.getElementById("formAdicionarAluno");
const btnAdicionarAlunoForm = document.getElementById("btnAdicionarAlunoForm");
const btnCancelar = document.getElementById("btnCancelar");

const inputNome = document.getElementById("inputNome");
const inputApelido = document.getElementById("inputApelido");
const inputCurso = document.getElementById("inputCurso");
const inputAno = document.getElementById("inputAno");
const inputId = document.getElementById("inputId");

const BASE_URL = "http://localhost:3000";

// Função para carregar alunos na tabela (SEM PARÂMETRO DE PESQUISA AQUI)
async function carregarAlunos() { 
  try {
    tabelaAlunos.innerHTML = ''; 

    const resposta = await fetch(`${BASE_URL}/alunos`);
    if (!resposta.ok) {
      throw new Error(`HTTP error! status: ${resposta.status}`);
    }
    const alunos = await resposta.json();

    if (alunos.length === 0) {
        const novaLinha = tabelaAlunos.insertRow();
        const celulaMensagem = novaLinha.insertCell(0);
        celulaMensagem.colSpan = 5; 
        celulaMensagem.textContent = "Nenhum aluno cadastrado.";
        celulaMensagem.style.textAlign = "center";
        return; 
    }

    alunos.forEach(aluno => {
      const novaLinha = tabelaAlunos.insertRow();
      novaLinha.insertCell(0).textContent = aluno.id;
      novaLinha.insertCell(1).textContent = aluno.Nome;
      novaLinha.insertCell(2).textContent = aluno.Apelido;
      novaLinha.insertCell(3).textContent = aluno.Curso;
      novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;
    });
  } catch (error) {
    console.error("Erro ao carregar alunos:", error);
    alert("Erro ao carregar alunos. Verifique o console para mais detalhes.");
  }
}

// Função para adicionar aluno (sem mudanças)
async function adicionarAluno() {
  const nome = inputNome.value;
  const apelido = inputApelido.value;
  const curso = inputCurso.value;
  const ano = inputAno.value;
  const id = parseInt(inputId.value, 10);

  if (!nome || !apelido || !curso || !ano || isNaN(id)) {
    alert("Por favor, preencha todos os campos corretamente.");
    return;
  }

  const novoAluno = { id, Nome: nome, Apelido: apelido, Curso: curso, Ano_Curricular: ano };

  try {
    const resposta = await fetch(`${BASE_URL}/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoAluno),
    });

    if (resposta.ok) {
      alert("Aluno adicionado com sucesso!");
      carregarAlunos(); 

      inputNome.value = "";
      inputApelido.value = "";
      inputCurso.value = "";
      inputAno.value = "";
      inputId.value = "";
      formAdicionarAluno.style.display = "none";
    } else {
      const erroData = await resposta.json();
      alert(`Erro ao adicionar aluno: ${erroData.erro || resposta.statusText}`);
      console.error("Erro ao adicionar aluno:", resposta.status, erroData);
    }
  } catch (error) {
    console.error("Erro ao adicionar aluno:", error);
    alert("Erro ao adicionar aluno. Verifique o console para mais detalhes.");
  }
}

// Função para deletar aluno (sem mudanças)
async function deletarAluno() {
  const id = parseInt(prompt("Digite o ID do aluno para deletar:"));
  
  if (isNaN(id)) {
    alert("ID inválido. Por favor, digite um número.");
    return;
  }

  try {
    const resposta = await fetch(`${BASE_URL}/alunos/${id}`, {
      method: "DELETE",
    });

    if (resposta.ok) {
      alert("Aluno deletado com sucesso!");
      carregarAlunos();
    } else {
      const erroData = await resposta.json();
      alert(`Erro ao deletar aluno: ${erroData.error || resposta.statusText}`);
      console.error("Erro ao deletar aluno:", resposta.status, erroData);
    }
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    alert("Erro ao deletar aluno. Verifique o console para mais detalhes.");
  }
}

// Event Listeners específicos para a página de alunos
document.addEventListener("DOMContentLoaded", () => {
  if (btnAdicionarAluno) {
    btnAdicionarAluno.addEventListener("click", () => {
      formAdicionarAluno.style.display = formAdicionarAluno.style.display === "none" ? "block" : "none";
    });
  }

  if (btnAdicionarAlunoForm) {
    btnAdicionarAlunoForm.addEventListener("click", adicionarAluno);
  }

  if (btnDeletarAluno) {
    btnDeletarAluno.addEventListener("click", deletarAluno);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      formAdicionarAluno.style.display = "none";
      inputNome.value = "";
      inputApelido.value = "";
      inputCurso.value = "";
      inputAno.value = "";
      inputId.value = "";
    });
  }

  carregarAlunos(); // ESTA LINHA É ESSENCIAL PARA CARREGAR OS DADOS AO ABRIR A PÁGINA
});