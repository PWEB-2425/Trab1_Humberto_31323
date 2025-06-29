// frontend/dashboard.js

// URL base da sua API de backend.
const BASE_URL = "http://localhost:3000";

// Arrays para armazenar todos os alunos e cursos que serão carregados do backend.
// Estes arrays serão usados para realizar as pesquisas localmente no frontend.
let allAlunos = [];
let allCursos = [];

// --- Elementos DOM para Alunos ---
// Obtém referências aos elementos HTML da página relacionados à pesquisa de alunos
// usando seus IDs, para que possam ser manipulados pelo JavaScript.
const searchAlunoInput = document.getElementById("searchAlunoInput"); // Campo de entrada de texto para pesquisar alunos.
const btnSearchAluno = document.getElementById("btnSearchAluno");     // Botão para iniciar a pesquisa de alunos.
const alunosSearchResultsDiv = document.getElementById("alunosSearchResults"); // Div onde os resultados da pesquisa de alunos serão exibidos.
const noAlunoResultsMessage = document.getElementById("noAlunoResults"); // Parágrafo para exibir a mensagem "Nenhum aluno encontrado".

// --- Elementos DOM para Cursos ---
// Obtém referências aos elementos HTML da página relacionados à pesquisa de cursos.
const searchCursoInput = document.getElementById("searchCursoInput"); // Campo de entrada de texto para pesquisar cursos.
const btnSearchCurso = document.getElementById("btnSearchCurso");     // Botão para iniciar a pesquisa de cursos.
const cursosSearchResultsDiv = document.getElementById("cursosSearchResults"); // Div onde os resultados da pesquisa de cursos serão exibidos.
const noCursoResultsMessage = document.getElementById("noCursoResults"); // Parágrafo para exibir a mensagem "Nenhum curso encontrado".

/**
 * Função assíncrona para buscar todos os alunos do backend.
 * Faz uma requisição GET para a rota '/alunos' da API.
 * Armazena os dados recebidos no array `allAlunos`.
 */
async function fetchAllAlunos() {
    try {
        console.log("[DASHBOARD] Buscando todos os alunos...");
        const response = await fetch(`${BASE_URL}/alunos`); // Faz a requisição HTTP.
        // Verifica se a resposta da requisição foi bem-sucedida (status 200 OK).
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar alunos: ${response.status} ${response.statusText}`);
        }
        allAlunos = await response.json(); // Converte a resposta para JSON e armazena em `allAlunos`.
        console.log("[DASHBOARD] Alunos carregados:", allAlunos.length);
    } catch (error) {
        console.error("[DASHBOARD ERROR] Erro ao carregar alunos:", error); // Loga qualquer erro que ocorra.
    }
}

/**
 * Função assíncrona para buscar todos os cursos do backend.
 * Faz uma requisição GET para a rota '/cursos' da API.
 * Armazena os dados recebidos no array `allCursos`.
 */
async function fetchAllCursos() {
    try {
        console.log("[DASHBOARD] Buscando todos os cursos...");
        const response = await fetch(`${BASE_URL}/cursos`); // Faz a requisição HTTP.
        // Verifica se a resposta da requisição foi bem-sucedida.
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar cursos: ${response.status} ${response.statusText}`);
        }
        allCursos = await response.json(); // Converte a resposta para JSON e armazena em `allCursos`.
        console.log("[DASHBOARD] Cursos carregados:", allCursos.length);
    } catch (error) {
        console.error("[DASHBOARD ERROR] Erro ao carregar cursos:", error); // Loga qualquer erro que ocorra.
    }
}

/**
 * Filtra e exibe os alunos na div de resultados do dashboard.
 * A pesquisa é feita no array `allAlunos` (carregado previamente).
 * Os resultados só aparecem se o termo de pesquisa não estiver vazio.
 * @param {string} query - O termo de pesquisa inserido pelo utilizador.
 */
function searchAlunos(query) {
    // Garante que o elemento DOM para exibir os resultados existe.
    if (!alunosSearchResultsDiv) {
        console.error("alunosSearchResultsDiv não encontrado.");
        return;
    }

    alunosSearchResultsDiv.innerHTML = ''; // Limpa sempre os resultados anteriores antes de exibir novos.

    const lowerCaseQuery = query.toLowerCase().trim(); // Converte o termo de pesquisa para minúsculas e remove espaços para facilitar a comparação.

    // Se o termo de pesquisa estiver vazio, não exibe resultados nem a mensagem de "nenhum encontrado".
    if (lowerCaseQuery === '') {
        noAlunoResultsMessage.style.display = 'none';
        return;
    }

    // Filtra o array `allAlunos` com base no termo de pesquisa.
    // Procura por correspondências no 'Nome', 'Apelido' ou 'id' do aluno.
    // Assegure-se de que as propriedades (Nome, Apelido, id) correspondem ao seu `bd.json`.
    const filteredAlunos = allAlunos.filter(aluno =>
        (aluno.Nome && aluno.Nome.toLowerCase().includes(lowerCaseQuery)) ||
        (aluno.Apelido && aluno.Apelido.toLowerCase().includes(lowerCaseQuery)) ||
        (aluno.id && String(aluno.id).includes(lowerCaseQuery)) // Converte o ID para String para poder usar `includes()`.
    );

    // Se nenhum aluno for encontrado, exibe a mensagem correspondente.
    if (filteredAlunos.length === 0) {
        noAlunoResultsMessage.style.display = 'block'; // Mostra a mensagem.
    } else {
        noAlunoResultsMessage.style.display = 'none'; // Esconde a mensagem se houver resultados.
        // Itera sobre os alunos filtrados e cria um elemento HTML para cada um.
        filteredAlunos.forEach(aluno => {
            const resultItem = document.createElement('div'); // Cria uma nova div para cada resultado.
            resultItem.classList.add('list-group-item'); // Adiciona uma classe CSS para estilização.
            // Define o conteúdo HTML do item do resultado, exibindo ID, Nome e Apelido.
            resultItem.innerHTML = `<strong>ID: ${aluno.id || 'N/A'}</strong> - ${aluno.Nome || 'Nome Desconhecido'} ${aluno.Apelido || ''}`;
            alunosSearchResultsDiv.appendChild(resultItem); // Adiciona o item à div de resultados.
        });
    }
}

/**
 * Filtra e exibe os cursos na div de resultados do dashboard.
 * A pesquisa é feita no array `allCursos` (carregado previamente).
 * Os resultados só aparecem se o termo de pesquisa não estiver vazio.
 * @param {string} query - O termo de pesquisa inserido pelo utilizador.
 */
function searchCursos(query) {
    // Garante que o elemento DOM para exibir os resultados existe.
    if (!cursosSearchResultsDiv) {
        console.error("cursosSearchResultsDiv não encontrado.");
        return;
    }

    cursosSearchResultsDiv.innerHTML = ''; // Limpa sempre os resultados anteriores.

    const lowerCaseQuery = query.toLowerCase().trim(); // Converte o termo de pesquisa para minúsculas e remove espaços.

    // Se o termo de pesquisa estiver vazio, não exibe resultados nem a mensagem de "nenhum encontrado".
    if (lowerCaseQuery === '') {
        noCursoResultsMessage.style.display = 'none';
        return;
    }

    // Filtra o array `allCursos` com base no termo de pesquisa.
    // Procura por correspondências no 'Nome', 'Sigla' ou 'id' do curso.
    // Assegure-se de que as propriedades (Nome, Sigla, id) correspondem ao seu `bd.json`.
    const filteredCursos = allCursos.filter(curso =>
        (curso.Nome && curso.Nome.toLowerCase().includes(lowerCaseQuery)) ||
        (curso.Sigla && curso.Sigla.toLowerCase().includes(lowerCaseQuery)) ||
        (curso.id && String(curso.id).includes(lowerCaseQuery))
    );

    // Se nenhum curso for encontrado, exibe a mensagem correspondente.
    if (filteredCursos.length === 0) {
        noCursoResultsMessage.style.display = 'block';
    } else {
        noCursoResultsMessage.style.display = 'none';
        // Itera sobre os cursos filtrados e cria um elemento HTML para cada um.
        filteredCursos.forEach(curso => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('list-group-item'); // Adiciona uma classe CSS para estilização.
            // Define o conteúdo HTML do item do resultado, exibindo ID, Nome e Sigla.
            resultItem.innerHTML = `<strong>ID: ${curso.id || 'N/A'}</strong> - ${curso.Nome || 'Nome Desconhecido'} (${curso.Sigla || 'N/A'})`;
            cursosSearchResultsDiv.appendChild(resultItem); // Adiciona o item à div de resultados.
        });
    }
}

// --- Event Listeners ---
// Adiciona um listener para o evento `DOMContentLoaded`, que é disparado quando todo o HTML foi completamente carregado e parseado.
document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DASHBOARD] DOMContentLoaded. Iniciando carregamento de dados e listeners.");

    // Carrega todos os dados de alunos e cursos do backend assim que a página é carregada.
    // 'await' garante que estas operações assíncronas sejam concluídas antes de continuar.
    await fetchAllAlunos();
    await fetchAllCursos();

    // Adiciona event listeners para os campos de entrada de pesquisa e botões, se existirem na página.
    if (searchAlunoInput) {
        // Event listener para o evento 'input': dispara a função `searchAlunos` cada vez que o utilizador digita algo no campo.
        searchAlunoInput.addEventListener("input", () => {
            searchAlunos(searchAlunoInput.value);
        });
        // Event listener para o botão de pesquisa de alunos: dispara a função `searchAlunos` ao clicar.
        if (btnSearchAluno) {
            btnSearchAluno.addEventListener("click", () => {
                searchAlunos(searchAlunoInput.value);
            });
        }
    } else {
        console.warn("Elemento 'searchAlunoInput' não encontrado."); // Avisa se o elemento não for encontrado (útil para depuração).
    }

    if (searchCursoInput) {
        // Event listener para o campo de pesquisa de cursos (ao digitar).
        searchCursoInput.addEventListener("input", () => {
            searchCursos(searchCursoInput.value);
        });
        // Event listener para o botão de pesquisa de cursos (ao clicar).
        if (btnSearchCurso) {
            btnSearchCurso.addEventListener("click", () => {
                searchCursos(searchCursoInput.value);
            });
        }
    } else {
        console.warn("Elemento 'searchCursoInput' não encontrado."); // Avisa se o elemento não for encontrado.
    }

    // NOTA: As funções `searchAlunos` e `searchCursos` não são chamadas com um termo de pesquisa vazio aqui
    // porque queremos que as áreas de resultados fiquem vazias por padrão ao carregar a página.
    // As funções já limpam os resultados anteriores (`innerHTML = ''`) cada vez que são chamadas.
});
