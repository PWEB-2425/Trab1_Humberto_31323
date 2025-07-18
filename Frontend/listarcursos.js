const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('172.16.') || window.location.hostname.startsWith('10.')
    ? "http://localhost:3000"
    : "https://trab1-humberto-31323-58n5.onrender.com";

const tabelaCursosElement = document.getElementById("tabelaCursos");
const tabelaCursosTbody = tabelaCursosElement.getElementsByTagName("tbody")[0];

const searchCursoInput = document.getElementById("searchCursoInput");
const btnSearchCurso = document.getElementById("btnSearchCurso");
const noCursoResultsMessage = document.getElementById("noCursoResults");

async function carregarCursos() {
    const resposta = await fetch(`${API_BASE_URL}/cursos`);
    const cursos = await resposta.json();
    tabelaCursosTbody.innerHTML = '';

    cursos.forEach(curso => {
        const novaLinha = tabelaCursosTbody.insertRow();
        novaLinha.insertCell(0).textContent = curso.id;
        novaLinha.insertCell(1).textContent = curso.Nome;
        novaLinha.insertCell(2).textContent = curso.Sigla;

        const acaoCell = novaLinha.insertCell(3);
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Deletar";
        btnDelete.className = "btn btn-danger";
        btnDelete.addEventListener("click", () => deletarCurso(curso.id));
        acaoCell.appendChild(btnDelete);
    });
}

async function pesquisarCursos() {
    const sigla = searchCursoInput.value.trim();
    if (!sigla) return;

    const resposta = await fetch(`${API_BASE_URL}/cursos?sigla=${sigla}`);
    const cursos = await resposta.json();
    tabelaCursosTbody.innerHTML = '';

    if (cursos.length === 0) {
        noCursoResultsMessage.style.display = 'block';
    } else {
        noCursoResultsMessage.style.display = 'none';
        cursos.forEach(curso => {
            const novaLinha = tabelaCursosTbody.insertRow();
            novaLinha.insertCell(0).textContent = curso.id;
            novaLinha.insertCell(1).textContent = curso.Nome;
            novaLinha.insertCell(2).textContent = curso.Sigla;
            
            const acaoCell = novaLinha.insertCell(3);
            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Deletar";
            btnDelete.className = "btn btn-danger";
            btnDelete.addEventListener("click", () => deletarCurso(curso.id));
            acaoCell.appendChild(btnDelete);
        });
    }
}

async function deletarCurso(id) {
    const resposta = await fetch(`${API_BASE_URL}/cursos/${id}`, {
        method: 'DELETE',
    });
    const data = await resposta.json();
    if (resposta.ok) {
        alert('Curso deletado com sucesso!');
        carregarCursos();
    } else {
        alert('Erro ao deletar curso');
    }
}

btnSearchCurso.addEventListener("click", pesquisarCursos);
carregarCursos();
