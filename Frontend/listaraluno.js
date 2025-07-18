const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('172.16.') || window.location.hostname.startsWith('10.')
    ? "http://localhost:3000"
    : "https://trab1-humberto-31323-58n5.onrender.com";

const tabelaAlunosElement = document.getElementById("tabelaAlunos");
const tabelaAlunosTbody = tabelaAlunosElement.getElementsByTagName("tbody")[0];

const searchAlunoInput = document.getElementById("searchAlunoInput");
const btnSearchAluno = document.getElementById("btnSearchAluno");
const noAlunoResultsMessage = document.getElementById("noAlunoResults");

const btnAdicionarAluno = document.getElementById("btnAdicionarAluno");
const btnDeletarAluno = document.getElementById("btnDeletarAluno");

const formAdicionarAluno = document.getElementById("formAdicionarAluno");
const btnAdicionarAlunoForm = document.getElementById("btnAdicionarAlunoForm");
const btnCancelarAluno = document.getElementById("btnCancelarAluno");

const inputIdAluno = document.getElementById("inputIdAluno");
const inputNomeAluno = document.getElementById("inputNomeAluno");
const inputApelidoAluno = document.getElementById("inputApelidoAluno");
const inputCursoAluno = document.getElementById("inputCursoAluno");
const inputAnoCurricularAluno = document.getElementById("inputAnoCurricularAluno");

async function carregarAlunos() {
    const resposta = await fetch(`${API_BASE_URL}/alunos`);
    const alunos = await resposta.json();
    tabelaAlunosTbody.innerHTML = '';

    alunos.forEach(aluno => {
        const novaLinha = tabelaAlunosTbody.insertRow();
        novaLinha.insertCell(0).textContent = aluno.id;
        novaLinha.insertCell(1).textContent = aluno.Nome;
        novaLinha.insertCell(2).textContent = aluno.Apelido;
        novaLinha.insertCell(3).textContent = aluno.Curso;
        novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;

        const acaoCell = novaLinha.insertCell(5);
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Deletar";
        btnDelete.className = "btn btn-danger";
        btnDelete.addEventListener("click", () => deletarAluno(aluno.id));
        acaoCell.appendChild(btnDelete);
    });
}

async function pesquisarAlunos() {
    const nome = searchAlunoInput.value.trim();
    if (!nome) return;

    const resposta = await fetch(`${API_BASE_URL}/alunos?nome=${nome}`);
    const alunos = await resposta.json();
    tabelaAlunosTbody.innerHTML = '';

    if (alunos.length === 0) {
        noAlunoResultsMessage.style.display = 'block';
    } else {
        noAlunoResultsMessage.style.display = 'none';
        alunos.forEach(aluno => {
            const novaLinha = tabelaAlunosTbody.insertRow();
            novaLinha.insertCell(0).textContent = aluno.id;
            novaLinha.insertCell(1).textContent = aluno.Nome;
            novaLinha.insertCell(2).textContent = aluno.Apelido;
            novaLinha.insertCell(3).textContent = aluno.Curso;
            novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;
            
            const acaoCell = novaLinha.insertCell(5);
            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Deletar";
            btnDelete.className = "btn btn-danger";
            btnDelete.addEventListener("click", () => deletarAluno(aluno.id));
            acaoCell.appendChild(btnDelete);
        });
    }
}

async function deletarAluno(id) {
    const resposta = await fetch(`${API_BASE_URL}/alunos/${id}`, {
        method: 'DELETE',
    });
    const data = await resposta.json();
    if (resposta.ok) {
        alert('Aluno deletado com sucesso!');
        carregarAlunos();
    } else {
        alert('Erro ao deletar aluno');
    }
}

btnSearchAluno.addEventListener("click", pesquisarAlunos);
btnAdicionarAluno.addEventListener("click", () => formAdicionarAluno.style.display = "block");
btnCancelarAluno.addEventListener("click", () => formAdicionarAluno.style.display = "none");

async function adicionarAluno() {
    const novoAluno = {
        id: parseInt(inputIdAluno.value, 10),
        Nome: inputNomeAluno.value.trim(),
        Apelido: inputApelidoAluno.value.trim(),
        Curso: inputCursoAluno.value.trim(),
        Ano_Curricular: inputAnoCurricularAluno.value.trim()
    };

    if (Object.values(novoAluno).includes("")) {
        alert("Preencha todos os campos");
        return;
    }

    const resposta = await fetch(`${API_BASE_URL}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAluno),
    });

    const data = await resposta.json();
    if (resposta.ok) {
        alert("Aluno adicionado com sucesso!");
        carregarAlunos();
        formAdicionarAluno.style.display = "none";
    } else {
        alert("Erro ao adicionar aluno");
    }
}

btnAdicionarAlunoForm.addEventListener("click", adicionarAluno);
carregarAlunos();
