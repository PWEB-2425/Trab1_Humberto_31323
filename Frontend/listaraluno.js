// frontend/listaraluno.js

// ATENÇÃO: SUBSTITUA 'https://SUA_URL_DA_API_NO_RENDER.onrender.com' PELA URL REAL DA SUA API NO RENDER!
const API_BASE_URL = "https://trab1-humberto-31323-58n5.onrender.com"; // URL da sua API no Render

// --- Obtenção de referências para elementos DOM (Document Object Model) ---
const tabelaAlunosElement = document.getElementById("tabelaAlunos");
const tabelaAlunosTbody = tabelaAlunosElement ? tabelaAlunosElement.getElementsByTagName("tbody")[0] : null;
const messageDisplay = document.getElementById("messageDisplay"); // Um elemento para exibir mensagens ao usuário

// Validação inicial do tbody
if (!tabelaAlunosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de alunos (id='tabelaAlunos') não encontrado ou HTML malformado!");
}

// Referências aos botões e formulário.
const btnAdicionarAluno = document.getElementById("btnAdicionarAluno");
const btnDeletarAluno = document.getElementById("btnDeletarAluno");
const formAdicionarAluno = document.getElementById("formAdicionarAluno");
const btnAdicionarAlunoForm = document.getElementById("btnAdicionarAlunoForm");
const btnCancelarAluno = document.getElementById("btnCancelarAluno");

// Referências aos campos de input do formulário de adição.
const inputIdAluno = document.getElementById("inputIdAluno");
const inputNomeAluno = document.getElementById("inputNomeAluno");
const inputApelidoAluno = document.getElementById("inputApelidoAluno");
const inputCursoAluno = document.getElementById("inputCursoAluno");
const inputAnoCurricularAluno = document.getElementById("inputAnoCurricularAluno");

/**
 * Função auxiliar para exibir mensagens ao usuário na interface.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type - O tipo da mensagem para estilização.
 */
function showMessage(message, type = 'info') {
    if (messageDisplay) {
        messageDisplay.textContent = message;
        messageDisplay.className = `message ${type}`; // Adiciona classes para estilização (ex: .message.success, .message.error)
        // Opcional: esconder a mensagem após alguns segundos
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
        // Redirecionar para a página de login
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
 * Função assíncrona para carregar e exibir a lista de alunos na tabela.
 * Esta rota GET não requer autenticação no backend, então usa fetch normal.
 */
async function carregarAlunos() {
    console.log("--- carregarAlunos() iniciada ---");
    if (!tabelaAlunosTbody) {
        console.error("Erro: `tabelaAlunosTbody` é null. Impossível carregar alunos na tabela.");
        return;
    }
    tabelaAlunosTbody.innerHTML = '';

    try {
        console.log(`[FETCH ALUNOS] Tentando buscar dados de: ${API_BASE_URL}/alunos`);
        const resposta = await fetch(`${API_BASE_URL}/alunos`);
        console.log("[FETCH ALUNOS] Resposta da API recebida (objeto Response):", resposta);

        if (!resposta.ok) {
            const erroDetalhes = await resposta.text();
            console.error(`[FETCH ALUNOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            showMessage(`Erro ao carregar alunos: ${resposta.status} - ${resposta.statusText}.`, 'error');
            return;
        }

        const alunos = await resposta.json();
        console.log("[FETCH ALUNOS] Dados de alunos recebidos (array JSON):", alunos);

        if (!Array.isArray(alunos)) {
            console.error("[DATA ALUNOS ERROR] A resposta da API não é um array:", alunos);
            showMessage("Erro: Dados de alunos recebidos da API não estão no formato esperado (array).", 'error');
            return;
        }

        if (alunos.length === 0) {
            showMessage("Nenhum aluno cadastrado.", 'info');
            const novaLinha = tabelaAlunosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 5;
            celulaMensagem.textContent = "Nenhum aluno cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        console.log(`[INFO ALUNOS] Preenchendo tabela com ${alunos.length} alunos.`);
        alunos.forEach(aluno => {
            const novaLinha = tabelaAlunosTbody.insertRow();
            novaLinha.insertCell(0).textContent = aluno.id;
            novaLinha.insertCell(1).textContent = aluno.Nome;
            novaLinha.insertCell(2).textContent = aluno.Apelido;
            novaLinha.insertCell(3).textContent = aluno.Curso;
            novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;
            console.log("   [RENDER ALUNOS] Adicionado aluno:", aluno.Nome);
        });
        console.log("--- carregarAlunos() finalizada com sucesso ---");
    } catch (error) {
        console.error("[CATCH ALUNOS ERROR] Erro no processo de carregarAlunos:", error);
        showMessage("Erro inesperado ao carregar alunos. Verifique o console do navegador.", 'error');
    }
}

/**
 * Função assíncrona para adicionar um novo aluno.
 * Agora usa `fetchAuthenticated` para enviar o token.
 */
async function adicionarAluno() {
    const id = parseInt(inputIdAluno.value, 10);
    const nome = inputNomeAluno.value.trim();
    const apelido = inputApelidoAluno.value.trim();
    const curso = inputCursoAluno.value.trim();
    const anoCurricular = inputAnoCurricularAluno.value.trim();

    if (isNaN(id) || !nome || !apelido || !curso || !anoCurricular) {
        showMessage("Por favor, preencha todos os campos corretamente.", 'error');
        return;
    }

    const novoAluno = { id, Nome: nome, Apelido: apelido, Curso: curso, Ano_Curricular: anoCurricular };

    try {
        console.log("[ADD ALUNO] Tentando adicionar aluno:", novoAluno);
        const data = await fetchAuthenticated(`${API_BASE_URL}/alunos`, "POST", novoAluno);

        showMessage("Aluno adicionado com sucesso!", 'success');
        console.log("Aluno adicionado com sucesso:", data.message);
        carregarAlunos();
        inputIdAluno.value = "";
        inputNomeAluno.value = "";
        inputApelidoAluno.value = "";
        inputCursoAluno.value = "";
        inputAnoCurricularAluno.value = "";
        formAdicionarAluno.style.display = "none";
    } catch (error) {
        console.error("[ADD ALUNO CATCH] Erro ao adicionar aluno:", error);
        // A mensagem de erro já é tratada por fetchAuthenticated ou showMessage
    }
}

/**
 * Função assíncrona para deletar um aluno.
 * Agora usa `fetchAuthenticated` para enviar o token.
 */
async function deletarAluno() {
    // Substitui prompt() por uma entrada mais simples, idealmente seria um modal
    const idInput = prompt("Digite o ID do aluno para deletar:");
    const id = parseInt(idInput, 10);

    if (isNaN(id)) {
        showMessage("ID inválido. Por favor, digite um número.", 'error');
        return;
    }

    // Para uma experiência de usuário melhor, um modal de confirmação personalizado seria ideal.
    // Por enquanto, vamos prosseguir com a exclusão após a entrada do ID.
    // if (!confirm(`Tem certeza que deseja deletar o aluno com ID ${id}?`)) {
    //     return;
    // }

    try {
        console.log(`[DELETE ALUNO] Tentando deletar aluno com ID: ${id}`);
        const data = await fetchAuthenticated(`${API_BASE_URL}/alunos/${id}`, "DELETE");

        showMessage("Aluno deletado com sucesso!", 'success');
        console.log("Aluno deletado com sucesso:", data.message);
        carregarAlunos();
    } catch (error) {
        console.error("[DELETE ALUNO CATCH] Erro ao deletar aluno:", error);
        // A mensagem de erro já é tratada por fetchAuthenticated ou showMessage
    }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded para listaralunos.html. Iniciando listeners e carregamento.");

    // Elemento para exibir mensagens (certifique-se de que existe no seu HTML)
    const body = document.querySelector('body');
    if (!messageDisplay) {
        const div = document.createElement('div');
        div.id = 'messageDisplay';
        div.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 200px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        body.prepend(div); // Adiciona no início do body
        window.messageDisplay = div; // Torna global para a função showMessage
    }

    // Estilos para as mensagens (você pode adicionar isso no seu CSS)
    const style = document.createElement('style');
    style.innerHTML = `
        .message.success { background-color: #4CAF50; }
        .message.error { background-color: #f44336; }
        .message.info { background-color: #2196F3; }
    `;
    document.head.appendChild(style);


    if (btnAdicionarAluno) {
        btnAdicionarAluno.addEventListener("click", () => {
            console.log("Botão 'Adicionar Novo Aluno' clicado. Alternando formulário.");
            if (formAdicionarAluno) {
                formAdicionarAluno.style.display = formAdicionarAluno.style.display === "none" ? "block" : "none";
            }
        });
    } else {
        console.warn("Elemento 'btnAdicionarAluno' não encontrado.");
    }

    if (btnAdicionarAlunoForm) {
        btnAdicionarAlunoForm.addEventListener("click", adicionarAluno);
    } else {
        console.warn("Elemento 'btnAdicionarAlunoForm' não encontrado.");
    }

    if (btnDeletarAluno) {
        btnDeletarAluno.addEventListener("click", deletarAluno);
    } else {
        console.warn("Elemento 'btnDeletarAluno' não encontrado.");
    }

    if (btnCancelarAluno) {
        btnCancelarAluno.addEventListener("click", () => {
            console.log("Botão 'Cancelar' clicado. Ocultando formulário e limpando campos.");
            if (formAdicionarAluno) formAdicionarAluno.style.display = "none";
            if (inputIdAluno) inputIdAluno.value = "";
            if (inputNomeAluno) inputNomeAluno.value = "";
            if (inputApelidoAluno) inputApelidoAluno.value = "";
            if (inputCursoAluno) inputCursoAluno.value = "";
            if (inputAnoCurricularAluno) inputAnoCurricularAluno.value = "";
        });
    } else {
        console.warn("Elemento 'btnCancelarAluno' não encontrado.");
    }

    carregarAlunos();
});
