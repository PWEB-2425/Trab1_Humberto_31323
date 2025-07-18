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
        // Adiciona classes para estilização (ex: .message.success, .message.error)
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
 * Função assíncrona para buscar e filtrar alunos.
 */
async function searchAlunos() {
    const searchTerm = searchAlunoInput.value.toLowerCase().trim();
    alunosSearchResults.innerHTML = ''; // Limpa resultados anteriores
    noAlunoResults.style.display = 'none'; // Esconde a mensagem de "nenhum encontrado"

    if (searchTerm.length < 2) { // Não pesquisa se o termo for muito curto
        return;
    }

    try {
        // Log para depuração: O que está a ser pesquisado e para onde
        console.log(`A pesquisar alunos com termo: "${searchTerm}" em: ${API_BASE_URL}/alunos`);
        
        const response = await fetch(`${API_BASE_URL}/alunos`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const alunos = await response.json();

        // Log para depuração: Dados de alunos recebidos
        console.log("Alunos recebidos:", alunos);

        const filteredAlunos = alunos.filter(aluno =>
            aluno.Nome.toLowerCase().includes(searchTerm) ||
            aluno.Apelido.toLowerCase().includes(searchTerm) ||
            aluno.id.toString().includes(searchTerm) ||
            aluno.Curso.toLowerCase().includes(searchTerm)
        );

        // Log para depuração: Alunos filtrados
        console.log("Alunos filtrados:", filteredAlunos);

        if (filteredAlunos.length > 0) {
            filteredAlunos.forEach(aluno => {
                const item = document.createElement('a');
                item.href = '#'; // Pode ser um link para a página de detalhes do aluno, se houver
                item.className = 'list-group-item list-group-item-action bg-dark text-white border-secondary';
                item.innerHTML = `<strong>ID:</strong> ${aluno.id} | <strong>Nome:</strong> ${aluno.Nome} ${aluno.Apelido} | <strong>Curso:</strong> ${aluno.Curso} | <strong>Ano:</strong> ${aluno.Ano_Curricular}`;
                alunosSearchResults.appendChild(item);
            });
        } else {
            noAlunoResults.style.display = 'block'; // Exibe mensagem de "nenhum encontrado"
        }
    } catch (error) {
        console.error("Erro ao pesquisar alunos:", error);
        showMessage("Erro ao pesquisar alunos. Tente novamente.", 'error');
    }
}

/**
 * Função assíncrona para buscar e filtrar cursos.
 */
async function searchCursos() {
    const searchTerm = searchCursoInput.value.toLowerCase().trim();
    cursosSearchResults.innerHTML = ''; // Limpa resultados anteriores
    noCursoResults.style.display = 'none'; // Esconde a mensagem de "nenhum encontrado"

    if (searchTerm.length < 2) { // Não pesquisa se o termo for muito curto
        return;
    }

    try {
        // Log para depuração: O que está a ser pesquisado e para onde
        console.log(`A pesquisar cursos com termo: "${searchTerm}" em: ${API_BASE_URL}/cursos`);

        const response = await fetch(`${API_BASE_URL}/cursos`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const cursos = await response.json();

        // Log para depuração: Dados de cursos recebidos
        console.log("Cursos recebidos:", cursos);

        const filteredCursos = cursos.filter(curso =>
            curso.Nome.toLowerCase().includes(searchTerm) ||
            curso.Sigla.toLowerCase().includes(searchTerm) ||
            curso.id.toString().includes(searchTerm)
        );

        // Log para depuração: Cursos filtrados
        console.log("Cursos filtrados:", filteredCursos);

        if (filteredCursos.length > 0) {
            filteredCursos.forEach(curso => {
                const item = document.createElement('a');
                item.href = '#'; // Pode ser um link para a página de detalhes do curso, se houver
                item.className = 'list-group-item list-group-item-action bg-dark text-white border-secondary';
                item.innerHTML = `<strong>ID:</strong> ${curso.id} | <strong>Nome:</strong> ${curso.Nome} | <strong>Sigla:</strong> ${curso.Sigla}`;
                cursosSearchResults.appendChild(item);
            });
        } else {
            noCursoResults.style.display = 'block'; // Exibe mensagem de "nenhum encontrado"
        }
    } catch (error) {
        console.error("Erro ao pesquisar cursos:", error);
        showMessage("Erro ao pesquisar cursos. Tente novamente.", 'error');
    }
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona event listener para o input de pesquisa de alunos
    if (searchAlunoInput) {
        searchAlunoInput.addEventListener('input', searchAlunos);
    }

    // Adiciona event listener para o input de pesquisa de cursos
    if (searchCursoInput) {
        searchCursoInput.addEventListener('input', searchCursos);
    }

    // Lógica para destacar o item de menu ativo
    // Esta lógica é independente do menu lateral e pode permanecer aqui.
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.menu-lateral a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        // Verifica se o link corresponde ao caminho atual ou se é a página inicial
        if (linkHref && (linkHref === currentPath || (linkHref === 'index.html' && currentPath === ''))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
