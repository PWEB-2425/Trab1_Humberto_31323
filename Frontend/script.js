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

// Redirecionar para a página de listar alunos
botaoNomes.addEventListener("click", () => {
  window.location.href = "listarAlunos.html"; // Redireciona para a página listarAlunos.html
});

// Redirecionar para a página de listar cursos
botaoCursos.addEventListener("click", () => {
  window.location.href = "listarCursos.html"; // Redireciona para a página listarCursos.html
});

// Função para pesquisar aluno por ID
async function pesquisarAluno() {
  console.log("Função pesquisarAluno chamada!"); // Log para depuração

  // Obter o ID inserido no campo de pesquisa
  const id = parseInt(inputAlunoId.value, 10);
  console.log(`ID inserido para pesquisa: ${id}`);  // Log para depuração

  // Verificar se o ID inserido é válido
  if (isNaN(id) || id <= 0) {
    resultadoPesquisa.innerHTML = "<p style='color: red;'>Por favor, insira um ID válido.</p>";
    return;
  }

  // Realizar a requisição para a API de alunos com o ID
  try {
    console.log(`Buscando aluno com ID: ${id}`); // Log para depuração

    const resposta = await fetch(`${BASE_URL}/alunos/${id}`);
    
    // Verificar se a resposta da API foi bem-sucedida
    if (resposta.ok) {
      const aluno = await resposta.json();
      console.log(aluno); // Log do aluno retornado para depuração

      if (aluno && aluno.id === id) {
        // Se o aluno for encontrado, exibe as informações em formato de tabela
        resultadoPesquisa.innerHTML = `
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Apelido</th>
                <th>Curso</th>
                <th>Ano Curricular</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${aluno.id}</td>
                <td>${aluno.Nome}</td>
                <td>${aluno.Apelido}</td>
                <td>${aluno.Curso}</td>
                <td>${aluno.Ano_Curricular}</td>
              </tr>
            </tbody>
          </table>
        `;
      } else {
        // Se o aluno não for encontrado, exibe uma mensagem
        resultadoPesquisa.innerHTML = "<p style='color:red'>Aluno não encontrado.</p>";
      }
    } else {
      // Se a resposta da API não for OK
      resultadoPesquisa.innerHTML = "<p style='color:red'>Aluno não encontrado.</p>";
    }

    // Exibir o resultado da pesquisa
    resultadoPesquisa.style.display = "block";  // Garantir que o resultado seja mostrado
  } catch (error) {
    // Capturar qualquer erro da requisição
    console.error('Erro ao buscar aluno:', error);
    resultadoPesquisa.innerHTML = "<p style='color:red'>Erro ao buscar aluno.</p>";
    resultadoPesquisa.style.display = "block";  // Exibir o erro
  }
}

// Adicionando evento ao botão de Pesquisa
if (btnPesquisar) {
  console.log("Evento para Pesquisar Aluno adicionado!");
  btnPesquisar.addEventListener("click", pesquisarAluno); // Garante que a função de pesquisa seja chamada
}

// Ocultar as listas inicialmente
window.addEventListener('load', () => {
  listaNomes.style.display = "none";
  listaCursos.style.display = "none";
  resultadoPesquisa.style.display = "none";
});
