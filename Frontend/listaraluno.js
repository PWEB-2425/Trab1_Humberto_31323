// frontend/listaraluno.js

// Define a URL base da API do backend.
// Se estiver em localhost ou um IP local, usa http://localhost:3000.
// Caso contrário, usa a URL do seu backend no Render.
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('172.16.') || window.location.hostname.startsWith('10.')
    ? "http://localhost:3000"
    : "https://trab1-humberto-31323-58n5.onrender.com"; // ATENÇÃO: Substitua pela URL real do seu backend no Render!

// Obtém referências aos elementos DOM da página.
const tabelaAlunosElement = document.getElementById("tabelaAlunos");
const tabelaAlunosTbody = tabelaAlunosElement ? tabelaAlunosElement.getElementsByTagName("tbody")[0] : null;
const messageDisplay = document.getElementById("messageDisplay");

// Validação crítica: verifica se o tbody da tabela foi encontrado.
if (!tabelaAlunosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de alunos (id='tabelaAlunos') não encontrado ou HTML malformado!");
}

// Referências aos botões e ao formulário de adição/edição.
const btnAdicionarAluno = document.getElementById("btnAdicionarAluno");
const btnDeletarAluno = document.getElementById("btnDeletarAluno"); // Botão "Deletar Aluno" principal
const formAdicionarAluno = document.getElementById("formAdicionarAluno");
const btnSalvarAlunoForm = document.getElementById("btnSalvarAlunoForm"); // Botão de salvar/atualizar no formulário
const btnCancelarAluno = document.getElementById("btnCancelarAluno");

// Referências aos campos de input do formulário de adição/edição.
const inputIdAluno = document.getElementById("inputIdAluno");
const inputNomeAluno = document.getElementById("inputNomeAluno");
const inputApelidoAluno = document.getElementById("inputApelidoAluno");
const inputCursoAluno = document.getElementById("inputCursoAluno");
const inputAnoCurricularAluno = document.getElementById("inputAnoCurricularAluno");

// Variáveis de estado para controlar o modo de edição.
let isEditMode = false; // true se o formulário estiver no modo de edição, false para adição.
let currentAlunoId = null; // Armazena o ID do aluno que está sendo editado.

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
 * Função assíncrona para carregar e exibir a lista de alunos na tabela.
 * Busca os dados do backend e preenche o tbody da tabela.
 */
async function carregarAlunos() {
    console.log("--- carregarAlunos() iniciada ---");
    if (!tabelaAlunosTbody) {
        console.error("Erro: `tabelaAlunosTbody` é null. Impossível carregar alunos na tabela.");
        return;
    }
    tabelaAlunosTbody.innerHTML = ''; // Limpa o conteúdo atual da tabela antes de adicionar novos dados.

    try {
        console.log(`[FETCH ALUNOS] Tentando buscar dados de: ${API_BASE_URL}/alunos`);
        // Faz uma requisição GET para a API de alunos.
        const resposta = await fetch(`${API_BASE_URL}/alunos`);

        // Verifica se a resposta da rede foi bem-sucedida (status 200-299).
        if (!resposta.ok) {
            const erroDetalhes = await resposta.text(); // Tenta ler o corpo da resposta como texto para depuração.
            console.error(`[FETCH ALUNOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            showMessage(`Erro ao carregar alunos: ${resposta.status} - ${resposta.statusText}.`, 'error');
            return;
        }

        // Converte a resposta para um objeto JSON.
        const alunos = await resposta.json();

        // Valida se a resposta JSON é um array.
        if (!Array.isArray(alunos)) {
            console.error("[DATA ALUNOS ERROR] A resposta da API não é um array:", alunos);
            showMessage("Erro: Dados de alunos recebidos da API não estão no formato esperado (array).", 'error');
            return;
        }

        // Se não houver alunos, exibe uma mensagem na tabela.
        if (alunos.length === 0) {
            showMessage("Nenhum aluno cadastrado.", 'info');
            const novaLinha = tabelaAlunosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 6; // Ajusta o colspan para cobrir todas as colunas da tabela.
            celulaMensagem.textContent = "Nenhum aluno cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        console.log(`[INFO ALUNOS] Preenchendo tabela com ${alunos.length} alunos.`);
        // Itera sobre cada aluno e adiciona uma nova linha à tabela.
        alunos.forEach(aluno => {
            const novaLinha = tabelaAlunosTbody.insertRow();
            // Preenche as células da linha com os dados do aluno.
            novaLinha.insertCell(0).textContent = aluno.id;
            novaLinha.insertCell(1).textContent = aluno.Nome;
            novaLinha.insertCell(2).textContent = aluno.Apelido;
            novaLinha.insertCell(3).textContent = aluno.Curso;
            novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;

            // Cria a célula para os botões de ação (Editar e Deletar).
            const acoesCell = novaLinha.insertCell(5);

            // Botão Editar
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'btn btn-primary btn-sm me-2'; // Classes Bootstrap para estilo.
            editBtn.onclick = () => editarAluno(aluno.id); // Adiciona um evento de clique para chamar editarAluno.
            acoesCell.appendChild(editBtn);

            // Botão Deletar
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Deletar';
            deleteBtn.className = 'btn btn-danger btn-sm'; // Classes Bootstrap para estilo.
            deleteBtn.onclick = () => deletarAlunoPorLinha(aluno.id); // Adiciona um evento de clique para chamar deletarAlunoPorLinha.
            acoesCell.appendChild(deleteBtn);

            console.log("   [RENDER ALUNOS] Adicionado aluno:", aluno.Nome);
        });
        console.log("--- carregarAlunos() finalizada com sucesso ---");
    } catch (error) {
        console.error("[CATCH ALUNOS ERROR] Erro no processo de carregarAlunos:", error);
        showMessage("Erro inesperado ao carregar alunos. Verifique o console do navegador.", 'error');
    }
}

/**
 * Função assíncrona para adicionar um novo aluno ou atualizar um existente.
 * Determina a operação (POST ou PUT) com base na variável isEditMode.
 */
async function adicionarOuAtualizarAluno() {
    // Obtém e valida os valores dos campos do formulário.
    const id = parseInt(inputIdAluno.value, 10);
    const nome = inputNomeAluno.value.trim();
    const apelido = inputApelidoAluno.value.trim();
    const curso = inputCursoAluno.value.trim();
    const anoCurricular = inputAnoCurricularAluno.value.trim();

    if (isNaN(id) || !nome || !apelido || !curso || !anoCurricular) {
        showMessage("Por favor, preencha todos os campos corretamente.", 'error');
        return;
    }

    const alunoData = { id, Nome: nome, Apelido: apelido, Curso: curso, Ano_Curricular: anoCurricular };

    try {
        let response;
        if (isEditMode) {
            // Se estiver no modo de edição, faz uma requisição PUT para atualizar.
            console.log("[UPDATE ALUNO] Tentando atualizar aluno:", alunoData);
            response = await fetch(`${API_BASE_URL}/alunos/${currentAlunoId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alunoData)
            });
        } else {
            // Se não estiver no modo de edição, faz uma requisição POST para adicionar.
            console.log("[ADD ALUNO] Tentando adicionar aluno:", alunoData);
            response = await fetch(`${API_BASE_URL}/alunos`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alunoData)
            });
        }

        // Verifica se a resposta da rede foi bem-sucedida.
        if (!response.ok) {
            const errorData = await response.json(); // Tenta ler o JSON de erro da resposta.
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); // Converte a resposta para JSON.
        showMessage(isEditMode ? "Aluno atualizado com sucesso!" : "Aluno adicionado com sucesso!", 'success');
        console.log(isEditMode ? "Aluno atualizado:" : "Aluno adicionado:", data.message);

        carregarAlunos(); // Recarrega a lista para refletir as alterações.
        resetForm(); // Reseta o formulário e o modo de edição.
    } catch (error) {
        console.error(isEditMode ? "[UPDATE ALUNO CATCH] Erro ao atualizar aluno:" : "[ADD ALUNO CATCH] Erro ao adicionar aluno:", error);
        showMessage(isEditMode ? "Erro ao atualizar aluno. Tente novamente." : "Erro ao adicionar aluno. Tente novamente.", 'error');
    }
}

/**
 * Função para preencher o formulário com os dados de um aluno para edição.
 * @param {number} id - O ID do aluno a ser editado.
 */
async function editarAluno(id) {
    try {
        // Busca todos os alunos para encontrar o aluno específico pelo ID.
        // Em uma aplicação maior, seria mais eficiente ter uma rota GET /alunos/:id no backend.
        const response = await fetch(`${API_BASE_URL}/alunos`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const alunos = await response.json();
        const alunoToEdit = alunos.find(aluno => aluno.id === id); // Encontra o aluno pelo ID.

        if (alunoToEdit) {
            // Preenche os campos do formulário com os dados do aluno.
            inputIdAluno.value = alunoToEdit.id;
            inputNomeAluno.value = alunoToEdit.Nome;
            inputApelidoAluno.value = alunoToEdit.Apelido;
            inputCursoAluno.value = alunoToEdit.Curso;
            inputAnoCurricularAluno.value = alunoToEdit.Ano_Curricular;

            inputIdAluno.readOnly = true; // Impede a edição do ID em modo de edição para evitar inconsistências.
            btnSalvarAlunoForm.textContent = "Atualizar Aluno"; // Altera o texto do botão para "Atualizar".
            formAdicionarAluno.style.display = "block"; // Mostra o formulário.
            isEditMode = true; // Define o modo de edição como true.
            currentAlunoId = id; // Armazena o ID do aluno que está sendo editado.
        } else {
            showMessage("Aluno não encontrado para edição.", 'error');
        }
    } catch (error) {
        console.error("Erro ao carregar dados do aluno para edição:", error);
        showMessage("Erro ao carregar dados do aluno para edição. Tente novamente.", 'error');
    }
}

/**
 * Reseta o formulário para o estado inicial (modo de adição) e o oculta.
 */
function resetForm() {
    inputIdAluno.value = "";
    inputNomeAluno.value = "";
    inputApelidoAluno.value = "";
    inputCursoAluno.value = "";
    inputAnoCurricularAluno.value = "";
    inputIdAluno.readOnly = false; // Permite a edição do ID novamente.
    btnSalvarAlunoForm.textContent = "Salvar Aluno"; // Volta o texto do botão para "Salvar".
    formAdicionarAluno.style.display = "none"; // Oculta o formulário.
    isEditMode = false; // Define o modo de edição como false.
    currentAlunoId = null; // Limpa o ID do aluno em edição.
}

/**
 * Função assíncrona para deletar um aluno pelo ID.
 * Chamada pelos botões "Deletar" na linha da tabela.
 * @param {number} id - O ID do aluno a ser deletado.
 */
async function deletarAlunoPorLinha(id) {
    // Pede confirmação ao usuário antes de deletar.
    if (!confirm(`Tem certeza que deseja deletar o aluno com ID ${id}?`)) {
        return; // Cancela a operação se o usuário não confirmar.
    }

    try {
        console.log(`[DELETE ALUNO] Tentando deletar aluno com ID: ${id}`);
        // Faz uma requisição DELETE para a API de alunos.
        const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
        });

        // Verifica se a resposta da rede foi bem-sucedida.
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        showMessage("Aluno deletado com sucesso!", 'success');
        console.log("Aluno deletado com sucesso:", data.message);
        carregarAlunos(); // Recarrega a lista para refletir a deleção.
    } catch (error) {
        console.error("[DELETE ALUNO CATCH] Erro ao deletar aluno:", error);
        showMessage("Erro ao deletar aluno. Tente novamente.", 'error');
    }
}

/**
 * Função para deletar aluno usando o botão "Deletar Aluno" principal (via prompt).
 * Reutiliza a função deletarAlunoPorLinha.
 */
async function deletarAluno() {
    const idInput = prompt("Digite o ID do aluno para deletar:");
    const id = parseInt(idInput, 10); // Converte o input para um número inteiro.

    if (isNaN(id)) {
        showMessage("ID inválido. Por favor, digite um número.", 'error');
        return;
    }
    await deletarAlunoPorLinha(id); // Chama a função de deleção principal.
}


// --- Event Listeners ---
// Adiciona um event listener para o evento 'DOMContentLoaded', garantindo que o script só roda após o HTML ser carregado.
document.addEventListener("DOMContentLoaded", () => {
    carregarAlunos(); // Carrega os alunos ao carregar a página.

    // Listener para o botão "Adicionar Novo Aluno".
    if (btnAdicionarAluno) {
        btnAdicionarAluno.addEventListener("click", () => {
            resetForm(); // Reseta o formulário antes de exibi-lo para uma nova adição.
            formAdicionarAluno.style.display = "block"; // Mostra o formulário.
        });
    }

    // Listener para o botão "Cancelar" no formulário.
    if (btnCancelarAluno) {
        btnCancelarAluno.addEventListener("click", resetForm); // Oculta e reseta o formulário.
    }

    // Listener para o botão "Salvar Aluno" (que também funciona como "Atualizar Aluno").
    if (btnSalvarAlunoForm) {
        btnSalvarAlunoForm.addEventListener("click", adicionarOuAtualizarAluno);
    }

    // Listener para o botão "Deletar Aluno" principal.
    if (btnDeletarAluno) {
        btnDeletarAluno.addEventListener("click", deletarAluno);
    }
});
