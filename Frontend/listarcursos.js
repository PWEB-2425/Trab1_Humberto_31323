const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('172.16.') || window.location.hostname.startsWith('10.')
    ? "http://localhost:3000" // Se estiver em localhost ou IP local, usa o backend local
    : "https://trab1-humberto-31323-58n5.onrender.com"; // URL da sua API no Render

// --- Obtenção de referências para elementos DOM ---
const tabelaCursosElement = document.getElementById("tabelaCursos");
const tabelaCursosTbody = tabelaCursosElement ? tabelaCursosElement.getElementsByTagName("tbody")[0] : null;
const messageDisplay = document.getElementById("messageDisplay");

// Validação inicial do tbody
if (!tabelaCursosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de cursos (id='tabelaCursos') não encontrado ou HTML malformado!");
}

// Referências aos botões e formulário
const btnAdicionarCurso = document.getElementById("btnAdicionarCurso");
const btnDeletarCurso = document.getElementById("btnDeletarCurso");
const formAdicionarCurso = document.getElementById("formAdicionarCurso");
const btnAdicionarCursoForm = document.getElementById("btnAdicionarCursoForm");
const btnCancelarCurso = document.getElementById("btnCancelarCurso");

// Referências aos campos de input do formulário de adição
const inputIdCurso = document.getElementById("inputIdCurso");
const inputNomeCurso = document.getElementById("inputNomeCurso");
const inputSiglaCurso = document.getElementById("inputSiglaCurso");

/**
 * Função auxiliar para exibir mensagens ao usuário na interface.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type - O tipo da mensagem para estilização.
 */
function showMessage(message, type = 'info') {
    if (messageDisplay) {
        messageDisplay.textContent = message;
        messageDisplay.className = `message ${type}`; // Adiciona classes para estilização (ex: .message.success, .message.error)
        setTimeout(() => {
            messageDisplay.textContent = '';
            messageDisplay.className = 'message';
        }, 5000);
    } else {
        console.log(`[MESSAGE - ${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Função auxiliar para fazer requisições autenticadas.
 * Obtém o token do localStorage e o adiciona ao cabeçalho Authorization.
 * @param {string} url - O URL da API.
 * @param {string} method - O método HTTP (POST, PUT, DELETE).
 * @param {object} [body=null] - O corpo da requisição (para POST/PUT).
 * @returns {Promise<object>} - A resposta JSON da API.
 * @throws {Error} - Lança um erro se a requisição falhar ou o token for inválido.
 */
async function fetchAuthenticated(url, method, body = null) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        showMessage("Não autorizado. Faça login novamente.", 'error');
        console.error('Token de autenticação não encontrado. Redirecionando para o login.');
        window.location.href = 'index.html'; // Ou login.html
        throw new Error("Token de autenticação ausente.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Inclui o token no cabeçalho
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null
        });

        if (response.status === 401 || response.status === 403) {
            showMessage("Sessão expirada ou não autorizada. Faça login novamente.", 'error');
            console.error('Token inválido ou expirado. Faça login novamente.');
            localStorage.removeItem('accessToken'); // Limpa o token inválido
            window.location.href = 'index.html'; // Redireciona para o login
            throw new Error("Não autorizado ou token inválido.");
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição autenticada:', error);
        throw error;
    }
}

/**
 * Função assíncrona para carregar e exibir a lista de cursos na tabela.
 */
async function carregarCursos() {
    console.log("--- carregarCursos() iniciada ---");
    if (!tabelaCursosTbody) {
        console.error("Erro: `tabelaCursosTbody` é null. Impossível carregar cursos na tabela.");
        return;
    }
    tabelaCursosTbody.innerHTML = '';  // Limpar o conteúdo da tabela antes de adicionar novos cursos

    try {
        console.log(`[FETCH CURSOS] Tentando buscar dados de: ${API_BASE_URL}/cursos`);
        const resposta = await fetch(`${API_BASE_URL}/cursos`);

        if (!resposta.ok) {
            const erroDetalhes = await resposta.text();
            console.error(`[FETCH CURSOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            showMessage(`Erro ao carregar cursos: ${resposta.status} - ${resposta.statusText}.`, 'error');
            return;
        }

        const cursos = await resposta.json();
        console.log("[FETCH CURSOS] Dados de cursos recebidos (array JSON):", cursos);

        if (!Array.isArray(cursos)) {
            console.error("[DATA CURSOS ERROR] A resposta da API não é um array:", cursos);
            showMessage("Erro: Dados de cursos recebidos da API não estão no formato esperado (array).", 'error');
            return;
        }

        if (cursos.length === 0) {
            showMessage("Nenhum curso cadastrado.", 'info');
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 4;
            celulaMensagem.textContent = "Nenhum curso cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        console.log(`[INFO CURSOS] Preenchendo tabela com ${cursos.length} cursos.`);
        cursos.forEach(curso => {
            const novaLinha = tabelaCursosTbody.insertRow();
            novaLinha.insertCell(0).textContent = curso.id;
            novaLinha.insertCell(1).textContent = curso.Nome;
            novaLinha.insertCell(2).textContent = curso.Sigla;
            console.log("   [RENDER CURSOS] Adicionado curso:", curso.Nome);
        });
        console.log("--- carregarCursos() finalizada com sucesso ---");
    } catch (error) {
        console.error("[CATCH CURSOS ERROR] Erro no processo de carregarCursos:", error);
        showMessage("Erro inesperado ao carregar cursos. Verifique o console do navegador.", 'error');
    }
}

/**
 * Função assíncrona para adicionar um novo curso.
 */
async function adicionarCurso() {
    const id = parseInt(inputIdCurso.value, 10);
    const nome = inputNomeCurso.value.trim();
    const sigla = inputSiglaCurso.value.trim();

    if (isNaN(id) || !nome || !sigla) {
        showMessage("Por favor, preencha todos os campos corretamente.", 'error');
        return;
    }

    const novoCurso = { id, Nome: nome, Sigla: sigla };

    try {
        console.log("[ADD CURSO] Tentando adicionar curso:", novoCurso);
        const data = await fetchAuthenticated(`${API_BASE_URL}/cursos`, "POST", novoCurso);

        showMessage("Curso adicionado com sucesso!", 'success');
        console.log("Curso adicionado com sucesso:", data.message);
        carregarCursos();
        inputIdCurso.value = "";
        inputNomeCurso.value = "";
        inputSiglaCurso.value = "";
        formAdicionarCurso.style.display = "none";
    } catch (error) {
        console.error("[ADD CURSO CATCH] Erro ao adicionar curso:", error);
        showMessage("Erro ao adicionar curso. Tente novamente.", 'error');
    }
}

// Função de deletar curso
async function deletarCurso() {
    const idInput = prompt("Digite o ID do curso para deletar:");
    const id = parseInt(idInput, 10);

    if (isNaN(id)) {
        showMessage("ID inválido. Por favor, digite um número.", 'error');
        return;
    }

    try {
        console.log(`[DELETE CURSO] Tentando deletar curso com ID: ${id}`);
        const data = await fetchAuthenticated(`${API_BASE_URL}/cursos/${id}`, "DELETE");

        showMessage("Curso deletado com sucesso!", 'success');
        console.log("Curso deletado com sucesso:", data.message);
        carregarCursos();
    } catch (error) {
        console.error("[DELETE CURSO CATCH] Erro ao deletar curso:", error);
        showMessage("Erro ao deletar curso. Tente novamente.", 'error');
    }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    // Carregar os cursos ao carregar a página
    carregarCursos();

    // Lógica para o botão de adicionar curso
    btnAdicionarCurso.addEventListener("click", () => {
        if (formAdicionarCurso) {
            formAdicionarCurso.style.display = formAdicionarCurso.style.display === "none" ? "block" : "none";
        }
    });

    // Lógica para o botão de cancelar
    btnCancelarCurso.addEventListener("click", () => {
        if (formAdicionarCurso) {
            formAdicionarCurso.style.display = "none";
        }
    });

    // Lógica para o botão de adicionar curso
    btnAdicionarCursoForm.addEventListener("click", adicionarCurso);

    // Lógica para o botão de deletar curso
    btnDeletarCurso.addEventListener("click", deletarCurso);
});
