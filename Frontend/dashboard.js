// frontend/dashboard.js

// Define a URL base da API do backend.
// Usa 'http://localhost:3000' para desenvolvimento local
// e 'https://trab1-humberto-31323-58n5.onrender.com' para o deploy no Render.
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('172.16.') || window.location.hostname.startsWith('10.')
    ? "http://localhost:3000"
    : "https://trab1-humberto-31323-58n5.onrender.com"; // URL da sua API no Render

// --- Referências aos elementos DOM para pesquisa de Alunos ---
const searchAlunoInput = document.getElementById('searchAlunoInput');
const alunosSearchResults = document.getElementById('alunosSearchResults');
const noAlunoResults = document.getElementById('noAlunoResults');

// --- Referências aos elementos DOM para pesquisa de Cursos ---
const searchCursoInput = document.getElementById('searchCursoInput');
const cursosSearchResults = document.getElementById('cursosSearchResults');
const noCursoResults = document.getElementById('noCursoResults');

// --- Referência para o elemento de mensagens globais ---
const messageDisplay = document.getElementById('messageDisplay');

/**
 * Função auxiliar para exibir mensagens ao usuário na interface.
 * A mensagem aparece e desaparece após 5 segundos.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type - O tipo da mensagem para estilização (usa classes CSS).
 */
function showMessage(message, type = 'info') {
    if (messageDisplay) {
        messageDisplay.textContent = message;
        messageDisplay.className = `message ${type}`; 
        setTimeout(() => {
            messageDisplay.textContent = '';
            messageDisplay.className = 'message';
        }, 5000);
    } else {
        console.log(`[MESSAGE - ${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Renderiza uma lista de itens (alunos ou cursos) na interface.
 * @param {Array} items - O array de alunos ou cursos.
 * @param {HTMLElement} resultsContainer - O elemento DOM onde os resultados serão exibidos.
 * @param {HTMLElement} noResultsMessageElement - O elemento DOM da mensagem "nenhum encontrado".
 * @param {string} type - 'aluno' ou 'curso' para formatar o item.
 */
function renderResults(items, resultsContainer, noResultsMessageElement, type) {
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores
    noResultsMessageElement.style.display = 'none'; // Esconde a mensagem de "nenhum encontrado"

    if (items.length > 0) {
        items.forEach(itemData => {
            const item = document.createElement('a');
            item.href = '#'; // Pode ser um link para a página de detalhes, se houver
            item.className = 'list-group-item list-group-item-action bg-dark text-white border-secondary';

            if (type === 'aluno') {
                item.innerHTML = `<strong>ID:</strong> ${itemData.id} | <strong>Nome:</strong> ${itemData.Nome} ${itemData.Apelido} | <strong>Curso:</strong> ${itemData.Curso} | <strong>Ano:</strong> ${itemData.Ano_Curricular}`;
            } else if (type === 'curso') {
                item.innerHTML = `<strong>ID:</strong> ${itemData.id} | <strong>Nome:</strong> ${itemData.Nome} | <strong>Sigla:</strong> ${itemData.Sigla}`;
            }
            resultsContainer.appendChild(item);
        });
    } else {
        noResultsMessageElement.style.display = 'block'; // Exibe mensagem de "nenhum encontrado"
        noResultsMessageElement.textContent = `Nenhum ${type === 'aluno' ? 'aluno' : 'curso'} encontrado.`;
    }
}

/**
 * Função assíncrona para buscar e filtrar alunos.
 * Se searchTerm for vazio, busca todos os alunos.
 */
async function searchAlunos() {
    const searchTerm = searchAlunoInput.value.toLowerCase().trim();
    
    console.log(`[searchAlunos] Termo de pesquisa: "${searchTerm}" | URL: ${API_BASE_URL}/alunos`);

    try {
        const response = await fetch(`${API_BASE_URL}/alunos`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const alunos = await response.json();

        console.log("[searchAlunos] Alunos recebidos:", alunos);

        let displayAlunos = [];
        if (searchTerm.length >= 2) {
            displayAlunos = alunos.filter(aluno =>
                aluno.Nome.toLowerCase().includes(searchTerm) ||
                aluno.Apelido.toLowerCase().includes(searchTerm) ||
                aluno.id.toString().includes(searchTerm) ||
                aluno.Curso.toLowerCase().includes(searchTerm)
            );
        } else {
            displayAlunos = alunos; // Exibe todos se o termo for vazio ou muito curto
        }

        console.log("[searchAlunos] Alunos a serem exibidos:", displayAlunos);
        renderResults(displayAlunos, alunosSearchResults, noAlunoResults, 'aluno');

    } catch (error) {
        console.error("[searchAlunos] Erro ao buscar/pesquisar alunos:", error);
        showMessage("Erro ao carregar ou pesquisar alunos. Verifique a consola para detalhes.", 'error');
        alunosSearchResults.innerHTML = '';
        noAlunoResults.style.display = 'block';
        noAlunoResults.textContent = "Não foi possível carregar os alunos. Verifique a conexão.";
    }
}

/**
 * Função assíncrona para buscar e filtrar cursos.
 * Se searchTerm for vazio, busca todos os cursos.
 */
async function searchCursos() {
    const searchTerm = searchCursoInput.value.toLowerCase().trim();

    console.log(`[searchCursos] Termo de pesquisa: "${searchTerm}" | URL: ${API_BASE_URL}/cursos`);

    try {
        const response = await fetch(`${API_BASE_URL}/cursos`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const cursos = await response.json();

        console.log("[searchCursos] Cursos recebidos:", cursos);

        let displayCursos = [];
        if (searchTerm.length >= 2) {
            displayCursos = cursos.filter(curso =>
                curso.Nome.toLowerCase().includes(searchTerm) ||
                curso.Sigla.toLowerCase().includes(searchTerm) ||
                curso.id.toString().includes(searchTerm)
            );
        } else {
            displayCursos = cursos; // Exibe todos se o termo for vazio ou muito curto
        }

        console.log("[searchCursos] Cursos a serem exibidos:", displayCursos);
        renderResults(displayCursos, cursosSearchResults, noCursoResults, 'curso');

    } catch (error) {
        console.error("[searchCursos] Erro ao buscar/pesquisar cursos:", error);
        showMessage("Erro ao carregar ou pesquisar cursos. Verifique a consola para detalhes.", 'error');
        cursosSearchResults.innerHTML = '';
        noCursoResults.style.display = 'block';
        noCursoResults.textContent = "Não foi possível carregar os cursos. Verifique a conexão.";
    }
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("dashboard.js carregado e DOM pronto."); // Log para depuração

    // Adiciona event listener para o input de pesquisa de alunos
    if (searchAlunoInput) {
        searchAlunoInput.addEventListener('input', searchAlunos);
        searchAlunos(); // Carrega todos os alunos inicialmente
    } else {
        console.error("Elemento 'searchAlunoInput' não encontrado.");
    }

    // Adiciona event listener para o input de pesquisa de cursos
    if (searchCursoInput) {
        searchCursoInput.addEventListener('input', searchCursos);
        searchCursos(); // Carrega todos os cursos inicialmente
    } else {
        console.error("Elemento 'searchCursoInput' não encontrado.");
    }

    // Lógica para destacar o item de menu ativo (permanece aqui)
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.menu-lateral a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref && (linkHref === currentPath || (linkHref === 'index.html' && currentPath === ''))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
