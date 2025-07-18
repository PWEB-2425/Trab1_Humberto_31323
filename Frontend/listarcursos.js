// frontend/listarcursos.js

// Define a URL base da API do backend.
// Se estiver em localhost ou um IP local, usa http://localhost:3000.
// Caso contrário, usa a URL do seu backend no Render.
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('172.16.') || window.location.hostname.startsWith('10.')
    ? "http://localhost:3000"
    : "https://trab1-humberto-31323-58n5.onrender.com"; // ATENÇÃO: Substitua pela URL real do seu backend no Render!

// Obtém referências aos elementos DOM da página.
const tabelaCursosElement = document.getElementById("tabelaCursos");
const tabelaCursosTbody = tabelaCursosElement ? tabelaCursosElement.getElementsByTagName("tbody")[0] : null;
const messageDisplay = document.getElementById("messageDisplay");

// Validação crítica: verifica se o tbody da tabela foi encontrado.
if (!tabelaCursosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de cursos (id='tabelaCursos') não encontrado ou HTML malformado!");
}

// Referências aos botões e ao formulário de adição/edição.
const btnAdicionarCurso = document.getElementById("btnAdicionarCurso");
const btnDeletarCurso = document.getElementById("btnDeletarCurso"); // Botão "Deletar Curso" principal
const formAdicionarCurso = document.getElementById("formAdicionarCurso");
const btnSalvarCursoForm = document.getElementById("btnSalvarCursoForm"); // Botão de salvar/atualizar no formulário
const btnCancelarCurso = document.getElementById("btnCancelarCurso");

// Referências aos campos de input do formulário de adição/edição.
const inputIdCurso = document.getElementById("inputIdCurso");
const inputNomeCurso = document.getElementById("inputNomeCurso");
const inputSiglaCurso = document.getElementById("inputSiglaCurso");

// Variáveis de estado para controlar o modo de edição.
let isEditMode = false; // true se o formulário estiver no modo de edição, false para adição.
let currentCursoId = null; // Armazena o ID do curso que está sendo editado.

/**
 * Função auxiliar para exibir mensagens ao usuário na interface.
 * A mensagem desaparece após 5 segundos.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type - O tipo da mensagem para estilização via CSS.
 */
function showMessage(message, type = 'info') {
    if (messageDisplay) {
        messageDisplay.textContent = message;
        // Adiciona classes CSS para estilização (ex: .message.success, .message.error)
        messageDisplay.className = `message ${type}`;
        setTimeout(() => {
            messageDisplay.textContent = '';
            messageDisplay.className = 'message'; // Remove as classes de tipo após o tempo limite.
        }, 5000);
    } else {
        console.log(`[MESSAGE - ${type.toUpperCase()}] ${message}`); // Fallback para console se messageDisplay não existir.
    }
}

/**
 * Função assíncrona para carregar e exibir a lista de cursos na tabela.
 * Busca os dados do backend e preenche o tbody da tabela.
 */
async function carregarCursos() {
    console.log("--- carregarCursos() iniciada ---");
    if (!tabelaCursosTbody) {
        console.error("Erro: `tabelaCursosTbody` é null. Impossível carregar cursos na tabela.");
        return;
    }
    tabelaCursosTbody.innerHTML = ''; // Limpa o conteúdo atual da tabela antes de adicionar novos dados.

    try {
        console.log(`[FETCH CURSOS] Tentando buscar dados de: ${API_BASE_URL}/cursos`);
        // Faz uma requisição GET para a API de cursos.
        const resposta = await fetch(`${API_BASE_URL}/cursos`);

        // Verifica se a resposta da rede foi bem-sucedida (status 200-299).
        if (!resposta.ok) {
            const erroDetalhes = await resposta.text(); // Tenta ler o corpo da resposta como texto para depuração.
            console.error(`[FETCH CURSOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            showMessage(`Erro ao carregar cursos: ${resposta.status} - ${resposta.statusText}.`, 'error');
            return;
        }

        // Converte a resposta para um objeto JSON.
        const cursos = await resposta.json();
        console.log("[FETCH CURSOS] Dados de cursos recebidos (array JSON):", cursos);

        // Valida se a resposta JSON é um array.
        if (!Array.isArray(cursos)) {
            console.error("[DATA CURSOS ERROR] A resposta da API não é um array:", cursos);
            showMessage("Erro: Dados de cursos recebidos da API não estão no formato esperado (array).", 'error');
            return;
        }

        // Se não houver cursos, exibe uma mensagem na tabela.
        if (cursos.length === 0) {
            showMessage("Nenhum curso cadastrado.", 'info');
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 4; // Ajusta o colspan para cobrir todas as colunas da tabela.
            celulaMensagem.textContent = "Nenhum curso cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        console.log(`[INFO CURSOS] Preenchendo tabela com ${cursos.length} cursos.`);
        // Itera sobre cada curso e adiciona uma nova linha à tabela.
        cursos.forEach(curso => {
            const novaLinha = tabelaCursosTbody.insertRow();
            // Preenche as células da linha com os dados do curso.
            novaLinha.insertCell(0).textContent = curso.id;
            novaLinha.insertCell(1).textContent = curso.Nome;
            novaLinha.insertCell(2).textContent = curso.Sigla;

            // Cria a célula para os botões de ação (Editar e Deletar).
            const acoesCell = novaLinha.insertCell(3);

            // Botão Editar
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'btn btn-primary btn-sm me-2'; // Classes Bootstrap para estilo.
            editBtn.onclick = () => editarCurso(curso.id); // Adiciona um evento de clique para chamar editarCurso.
            acoesCell.appendChild(editBtn);

            // Botão Deletar
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Deletar';
            deleteBtn.className = 'btn btn-danger btn-sm'; // Classes Bootstrap para estilo.
            deleteBtn.onclick = () => deletarCursoPorLinha(curso.id); // Adiciona um evento de clique para chamar deletarCursoPorLinha.
            acoesCell.appendChild(deleteBtn);

            console.log("   [RENDER CURSOS] Adicionado curso:", curso.Nome);
        });
        console.log("--- carregarCursos() finalizada com sucesso ---");
    } catch (error) {
        console.error("[CATCH CURSOS ERROR] Erro no processo de carregarCursos:", error);
        showMessage("Erro inesperado ao carregar cursos. Verifique o console do navegador.", 'error');
    }
}

/**
 * Função assíncrona para adicionar um novo curso ou atualizar um existente.
 * Determina a operação (POST ou PUT) com base na variável isEditMode.
 */
async function adicionarOuAtualizarCurso() {
    // Obtém e valida os valores dos campos do formulário.
    const id = parseInt(inputIdCurso.value, 10);
    const nome = inputNomeCurso.value.trim();
    const sigla = inputSiglaCurso.value.trim();

    if (isNaN(id) || !nome || !sigla) {
        showMessage("Por favor, preencha todos os campos corretamente.", 'error');
        return;
    }

    const cursoData = { id, Nome: nome, Sigla: sigla };

    try {
        let response;
        if (isEditMode) {
            // Se estiver no modo de edição, faz uma requisição PUT para atualizar.
            console.log("[UPDATE CURSO] Tentando atualizar curso:", cursoData);
            response = await fetch(`${API_BASE_URL}/cursos/${currentCursoId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cursoData)
            });
        } else {
            // Se não estiver no modo de edição, faz uma requisição POST para adicionar.
            console.log("[ADD CURSO] Tentando adicionar curso:", cursoData);
            response = await fetch(`${API_BASE_URL}/cursos`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cursoData)
            });
        }

        // Verifica se a resposta da rede foi bem-sucedida.
        if (!response.ok) {
            const errorData = await response.json(); // Tenta ler o JSON de erro da resposta.
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); // Converte a resposta para JSON.
        showMessage(isEditMode ? "Curso atualizado com sucesso!" : "Curso adicionado com sucesso!", 'success');
        console.log(isEditMode ? "Curso atualizado:" : "Curso adicionado:", data.message);

        carregarCursos(); // Recarrega a lista para refletir as alterações.
        resetForm(); // Reseta o formulário e o modo de edição.
    } catch (error) {
        console.error(isEditMode ? "[UPDATE CURSO CATCH] Erro ao atualizar curso:" : "[ADD CURSO CATCH] Erro ao adicionar curso:", error);
        showMessage(isEditMode ? "Erro ao atualizar curso. Tente novamente." : "Erro ao adicionar curso. Tente novamente.", 'error');
    }
}

/**
 * Função para preencher o formulário com os dados de um curso para edição.
 * @param {number} id - O ID do curso a ser editado.
 */
async function editarCurso(id) {
    try {
        // Busca todos os cursos para encontrar o curso específico pelo ID.
        // Em uma aplicação maior, seria mais eficiente ter uma rota GET /cursos/:id no backend.
        const response = await fetch(`${API_BASE_URL}/cursos`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const cursos = await response.json();
        const cursoToEdit = cursos.find(curso => curso.id === id); // Encontra o curso pelo ID.

        if (cursoToEdit) {
            // Preenche os campos do formulário com os dados do curso.
            inputIdCurso.value = cursoToEdit.id;
            inputNomeCurso.value = cursoToEdit.Nome;
            inputSiglaCurso.value = cursoToEdit.Sigla;

            inputIdCurso.readOnly = true; // Impede a edição do ID em modo de edição para evitar inconsistências.
            btnSalvarCursoForm.textContent = "Atualizar Curso"; // Altera o texto do botão para "Atualizar".
            formAdicionarCurso.style.display = "block"; // Mostra o formulário.
            isEditMode = true; // Define o modo de edição como true.
            currentCursoId = id; // Armazena o ID do curso que está sendo editado.
        } else {
            showMessage("Curso não encontrado para edição.", 'error');
        }
    } catch (error) {
        console.error("Erro ao carregar dados do curso para edição:", error);
        showMessage("Erro ao carregar dados do curso para edição. Tente novamente.", 'error');
    }
}

/**
 * Reseta o formulário para o estado inicial (modo de adição) e o oculta.
 */
function resetForm() {
    inputIdCurso.value = "";
    inputNomeCurso.value = "";
    inputSiglaCurso.value = "";
    inputIdCurso.readOnly = false; // Permite a edição do ID novamente.
    btnSalvarCursoForm.textContent = "Salvar Curso"; // Volta o texto do botão para "Salvar".
    formAdicionarCurso.style.display = "none"; // Oculta o formulário.
    isEditMode = false; // Define o modo de edição como false.
    currentCursoId = null; // Limpa o ID do curso em edição.
}

/**
 * Função assíncrona para deletar um curso pelo ID.
 * Chamada pelos botões "Deletar" na linha da tabela.
 * @param {number} id - O ID do curso a ser deletado.
 */
async function deletarCursoPorLinha(id) {
    // Pede confirmação ao usuário antes de deletar.
    if (!confirm(`Tem certeza que deseja deletar o curso com ID ${id}?`)) {
        return; // Cancela a operação se o usuário não confirmar.
    }

    try {
        console.log(`[DELETE CURSO] Tentando deletar curso com ID: ${id}`);
        // Faz uma requisição DELETE para a API de cursos.
        const response = await fetch(`${API_BASE_URL}/cursos/${id}`, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
        });

        // Verifica se a resposta da rede foi bem-sucedida.
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        showMessage("Curso deletado com sucesso!", 'success');
        console.log("Curso deletado com sucesso:", data.message);
        carregarCursos(); // Recarrega a lista para refletir a deleção.
    } catch (error) {
        console.error("[DELETE CURSO CATCH] Erro ao deletar curso:", error);
        showMessage("Erro ao deletar curso. Tente novamente.", 'error');
    }
}

/**
 * Função para deletar curso usando o botão "Deletar Curso" principal (via prompt).
 * Reutiliza a função deletarCursoPorLinha.
 */
async function deletarCurso() {
    const idInput = prompt("Digite o ID do curso para deletar:");
    const id = parseInt(idInput, 10); // Converte o input para um número inteiro.

    if (isNaN(id)) {
        showMessage("ID inválido. Por favor, digite um número.", 'error');
        return;
    }
    await deletarCursoPorLinha(id); // Chama a função de deleção principal.
}

// --- Event Listeners ---
// Adiciona um event listener para o evento 'DOMContentLoaded', garantindo que o script só roda após o HTML ser carregado.
document.addEventListener("DOMContentLoaded", () => {
    carregarCursos(); // Carrega os cursos ao carregar a página.

    // Listener para o botão "Adicionar Novo Curso".
    if (btnAdicionarCurso) {
        btnAdicionarCurso.addEventListener("click", () => {
            resetForm(); // Reseta o formulário antes de exibi-lo para uma nova adição.
            formAdicionarCurso.style.display = "block"; // Mostra o formulário.
        });
    }

    // Listener para o botão "Cancelar" no formulário.
    if (btnCancelarCurso) {
        btnCancelarCurso.addEventListener("click", resetForm); // Oculta e reseta o formulário.
    }

    // Listener para o botão "Salvar Curso" (que também funciona como "Atualizar Curso").
    if (btnSalvarCursoForm) {
        btnSalvarCursoForm.addEventListener("click", adicionarOuAtualizarCurso);
    }

    // Listener para o botão "Deletar Curso" principal.
    if (btnDeletarCurso) {
        btnDeletarCurso.addEventListener("click", deletarCurso);
    }
});
