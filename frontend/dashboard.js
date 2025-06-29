// frontend/dashboard.js

// URL base da sua API
const BASE_URL = "http://localhost:3000";

// Arrays para armazenar todos os alunos e cursos
let allAlunos = [];
let allCursos = [];

// Elementos DOM para Alunos
const searchAlunoInput = document.getElementById("searchAlunoInput");
const btnSearchAluno = document.getElementById("btnSearchAluno");
const alunosSearchResultsDiv = document.getElementById("alunosSearchResults");
const noAlunoResultsMessage = document.getElementById("noAlunoResults");

// Elementos DOM para Cursos
const searchCursoInput = document.getElementById("searchCursoInput");
const btnSearchCurso = document.getElementById("btnSearchCurso");
const cursosSearchResultsDiv = document.getElementById("cursosSearchResults");
const noCursoResultsMessage = document.getElementById("noCursoResults");

/**
 * Função assíncrona para buscar todos os alunos do backend.
 */
async function fetchAllAlunos() {
    try {
        console.log("[DASHBOARD] Buscando todos os alunos...");
        const response = await fetch(`${BASE_URL}/alunos`);
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar alunos: ${response.status} ${response.statusText}`);
        }
        allAlunos = await response.json();
        console.log("[DASHBOARD] Alunos carregados:", allAlunos.length);
    } catch (error) {
        console.error("[DASHBOARD ERROR] Erro ao carregar alunos:", error);
    }
}

/**
 * Função assíncrona para buscar todos os cursos do backend.
 */
async function fetchAllCursos() {
    try {
        console.log("[DASHBOARD] Buscando todos os cursos...");
        const response = await fetch(`${BASE_URL}/cursos`);
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar cursos: ${response.status} ${response.statusText}`);
        }
        allCursos = await response.json();
        console.log("[DASHBOARD] Cursos carregados:", allCursos.length);
    } catch (error) {
        console.error("[DASHBOARD ERROR] Erro ao carregar cursos:", error);
    }
}

/**
 * Filtra e exibe os alunos na div de resultados do dashboard.
 * Os resultados só aparecem se o termo de pesquisa não estiver vazio.
 * @param {string} query - O termo de pesquisa.
 */
function searchAlunos(query) {
    if (!alunosSearchResultsDiv) {
        console.error("alunosSearchResultsDiv não encontrado.");
        return;
    }

    alunosSearchResultsDiv.innerHTML = ''; // Sempre limpa os resultados anteriores

    const lowerCaseQuery = query.toLowerCase().trim(); // Remove espaços em branco do início/fim

    if (lowerCaseQuery === '') { // Se a pesquisa estiver vazia, não mostra nada
        noAlunoResultsMessage.style.display = 'none'; // Garante que a mensagem de "nenhum encontrado" também esteja escondida
        return;
    }

    const filteredAlunos = allAlunos.filter(aluno =>
        // Certifique-se que as propriedades correspondem ao seu bd.json (Nome, Apelido, id)
        (aluno.Nome && aluno.Nome.toLowerCase().includes(lowerCaseQuery)) ||
        (aluno.Apelido && aluno.Apelido.toLowerCase().includes(lowerCaseQuery)) ||
        (aluno.id && String(aluno.id).includes(lowerCaseQuery))
    );

    if (filteredAlunos.length === 0) {
        noAlunoResultsMessage.style.display = 'block';
    } else {
        noAlunoResultsMessage.style.display = 'none';
        filteredAlunos.forEach(aluno => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('list-group-item'); // Classe para estilização
            resultItem.innerHTML = `<strong>ID: ${aluno.id || 'N/A'}</strong> - ${aluno.Nome || 'Nome Desconhecido'} ${aluno.Apelido || ''}`;
            alunosSearchResultsDiv.appendChild(resultItem);
        });
    }
}

/**
 * Filtra e exibe os cursos na div de resultados do dashboard.
 * Os resultados só aparecem se o termo de pesquisa não estiver vazio.
 * @param {string} query - O termo de pesquisa.
 */
function searchCursos(query) {
    if (!cursosSearchResultsDiv) {
        console.error("cursosSearchResultsDiv não encontrado.");
        return;
    }

    cursosSearchResultsDiv.innerHTML = ''; // Sempre limpa os resultados anteriores

    const lowerCaseQuery = query.toLowerCase().trim(); // Remove espaços em branco do início/fim

    if (lowerCaseQuery === '') { // Se a pesquisa estiver vazia, não mostra nada
        noCursoResultsMessage.style.display = 'none'; // Garante que a mensagem de "nenhum encontrado" também esteja escondida
        return;
    }

    const filteredCursos = allCursos.filter(curso =>
        // Certifique-se que as propriedades correspondem ao seu bd.json (Nome, Sigla, id)
        (curso.Nome && curso.Nome.toLowerCase().includes(lowerCaseQuery)) ||
        (curso.Sigla && curso.Sigla.toLowerCase().includes(lowerCaseQuery)) ||
        (curso.id && String(curso.id).includes(lowerCaseQuery))
    );

    if (filteredCursos.length === 0) {
        noCursoResultsMessage.style.display = 'block';
    } else {
        noCursoResultsMessage.style.display = 'none';
        filteredCursos.forEach(curso => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('list-group-item'); // Classe para estilização
            resultItem.innerHTML = `<strong>ID: ${curso.id || 'N/A'}</strong> - ${curso.Nome || 'Nome Desconhecido'} (${curso.Sigla || 'N/A'})`;
            cursosSearchResultsDiv.appendChild(resultItem);
        });
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DASHBOARD] DOMContentLoaded. Iniciando carregamento de dados e listeners.");

    // Carrega todos os dados ao iniciar a página
    await fetchAllAlunos();
    await fetchAllCursos();

    // Adiciona event listeners para os inputs de pesquisa e botões
    if (searchAlunoInput) {
        // Pesquisa ao digitar
        searchAlunoInput.addEventListener("input", () => {
            searchAlunos(searchAlunoInput.value);
        });
        // Pesquisa ao clicar no botão
        if (btnSearchAluno) {
            btnSearchAluno.addEventListener("click", () => {
                searchAlunos(searchAlunoInput.value);
            });
        }
    } else {
        console.warn("Elemento 'searchAlunoInput' não encontrado.");
    }

    if (searchCursoInput) {
        // Pesquisa ao digitar
        searchCursoInput.addEventListener("input", () => {
            searchCursos(searchCursoInput.value);
        });
        // Pesquisa ao clicar no botão
        if (btnSearchCurso) {
            btnSearchCurso.addEventListener("click", () => {
                searchCursos(searchCursoInput.value);
            });
        }
    } else {
        console.warn("Elemento 'searchCursoInput' não encontrado.");
    }

    // Não chamamos searchAlunos/Cursos com " " ao carregar para que fiquem vazios por padrão.
    // As áreas de resultados já estão limpas no início das funções searchAlunos/Cursos.
});
