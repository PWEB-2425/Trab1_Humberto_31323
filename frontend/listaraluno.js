// frontend/listaraluno.js

// Obtenção de referências para elementos DOM
const tabelaAlunosElement = document.getElementById("tabelaAlunos");
const tabelaAlunosTbody = tabelaAlunosElement ? tabelaAlunosElement.getElementsByTagName("tbody")[0] : null;

// Validação inicial dos elementos cruciais
if (!tabelaAlunosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de alunos (id='tabelaAlunos') não encontrado ou HTML malformado!");
    // Não use alert() em produção, mas para depuração pode ser útil inicialmente.
}

// Referências aos botões e formulário
const btnAdicionarAluno = document.getElementById("btnAdicionarAluno");
const btnDeletarAluno = document.getElementById("btnDeletarAluno");
const formAdicionarAluno = document.getElementById("formAdicionarAluno");
const btnAdicionarAlunoForm = document.getElementById("btnAdicionarAlunoForm");
const btnCancelarAluno = document.getElementById("btnCancelarAluno");

// Referências aos campos de input do formulário
const inputIdAluno = document.getElementById("inputIdAluno");
const inputNomeAluno = document.getElementById("inputNomeAluno");
const inputApelidoAluno = document.getElementById("inputApelidoAluno");
const inputCursoAluno = document.getElementById("inputCursoAluno");
const inputAnoCurricularAluno = document.getElementById("inputAnoCurricularAluno");

// URL base para as requisições à API
const BASE_URL = "http://localhost:3000";

/**
 * Função assíncrona para carregar alunos na tabela.
 */
async function carregarAlunos() {
    console.log("--- carregarAlunos() iniciada ---");
    if (!tabelaAlunosTbody) {
        console.error("Erro: `tabelaAlunosTbody` é null. Impossível carregar alunos na tabela.");
        return;
    }
    tabelaAlunosTbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

    try {
        console.log(`[FETCH ALUNOS] Tentando buscar dados de: ${BASE_URL}/alunos`);
        const resposta = await fetch(`${BASE_URL}/alunos`);
        console.log("[FETCH ALUNOS] Resposta da API recebida (objeto Response):", resposta);

        if (!resposta.ok) {
            const erroDetalhes = await resposta.text();
            console.error(`[FETCH ALUNOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            const novaLinha = tabelaAlunosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 5; // Abrange todas as colunas
            celulaErro.textContent = `Erro ao carregar alunos: ${resposta.status} - ${resposta.statusText}. Verifique o console.`;
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            throw new Error(`HTTP error! status: ${resposta.status}, detalhes: ${erroDetalhes}`);
        }

        const alunos = await resposta.json();
        console.log("[FETCH ALUNOS] Dados de alunos recebidos (array JSON):", alunos);

        if (!Array.isArray(alunos)) {
            console.error("[DATA ALUNOS ERROR] A resposta da API não é um array:", alunos);
            const novaLinha = tabelaAlunosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 5;
            celulaErro.textContent = "Erro: Dados de alunos recebidos da API não estão no formato esperado (array).";
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            return;
        }

        if (alunos.length === 0) {
            console.log("[INFO ALUNOS] Nenhum aluno cadastrado. Exibindo mensagem na tabela.");
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
            // Assegure-se de que as chaves correspondem ao seu bd.json
            novaLinha.insertCell(0).textContent = aluno.id;
            novaLinha.insertCell(1).textContent = aluno.Nome;
            novaLinha.insertCell(2).textContent = aluno.Apelido;
            novaLinha.insertCell(3).textContent = aluno.Curso;
            novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;
            console.log("  [RENDER ALUNOS] Adicionado aluno:", aluno.Nome);
        });
        console.log("--- carregarAlunos() finalizada com sucesso ---");
    } catch (error) {
        console.error("[CATCH ALUNOS ERROR] Erro no processo de carregarAlunos:", error);
        const novaLinha = tabelaAlunosTbody.insertRow();
        const celulaErro = novaLinha.insertCell(0);
        celulaErro.colSpan = 5;
        celulaErro.textContent = "Erro inesperado ao carregar alunos. Verifique o console do navegador.";
        celulaErro.style.color = "red";
        celulaErro.style.textAlign = "center";
    }
}

/**
 * Função assíncrona para adicionar aluno.
 */
async function adicionarAluno() {
    const id = parseInt(inputIdAluno.value, 10);
    const nome = inputNomeAluno.value.trim();
    const apelido = inputApelidoAluno.value.trim();
    const curso = inputCursoAluno.value.trim();
    const anoCurricular = inputAnoCurricularAluno.value.trim();

    if (isNaN(id) || !nome || !apelido || !curso || !anoCurricular) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const novoAluno = { id, Nome: nome, Apelido: apelido, Curso: curso, Ano_Curricular: anoCurricular };

    try {
        console.log("[ADD ALUNO] Tentando adicionar aluno:", novoAluno);
        const resposta = await fetch(`${BASE_URL}/alunos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoAluno),
        });

        if (resposta.ok) {
            alert("Aluno adicionado com sucesso!");
            carregarAlunos();
            inputIdAluno.value = "";
            inputNomeAluno.value = "";
            inputApelidoAluno.value = "";
            inputCursoAluno.value = "";
            inputAnoCurricularAluno.value = "";
            formAdicionarAluno.style.display = "none";
        } else {
            const erroData = await resposta.json();
            alert(`Erro ao adicionar aluno: ${erroData.erro || resposta.statusText}`);
            console.error("[ADD ALUNO ERROR] Erro ao adicionar aluno:", resposta.status, erroData);
        }
    } catch (error) {
        console.error("[ADD ALUNO CATCH] Erro ao adicionar aluno:", error);
        alert("Erro ao adicionar aluno. Verifique o console para mais detalhes.");
    }
}

/**
 * Função assíncrona para deletar aluno.
 */
async function deletarAluno() {
    const idInput = prompt("Digite o ID do aluno para deletar:");
    const id = parseInt(idInput, 10);

    if (isNaN(id)) {
        alert("ID inválido. Por favor, digite um número.");
        return;
    }

    if (!confirm(`Tem certeza que deseja deletar o aluno com ID ${id}?`)) {
        return;
    }

    try {
        console.log(`[DELETE ALUNO] Tentando deletar aluno com ID: ${id}`);
        const resposta = await fetch(`${BASE_URL}/alunos/${id}`, {
            method: "DELETE",
        });

        if (resposta.ok) {
            alert("Aluno deletado com sucesso!");
            carregarAlunos();
        } else {
            const erroData = await resposta.json();
            alert(`Erro ao deletar aluno: ${erroData.error || resposta.statusText}`);
            console.error("[DELETE ALUNO ERROR] Erro ao deletar aluno:", resposta.status, erroData);
        }
    } catch (error) {
        console.error("[DELETE ALUNO CATCH] Erro ao deletar aluno:", error);
        alert("Erro ao deletar aluno. Verifique o console para mais detalhes.");
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded para listaralunos.html. Iniciando listeners e carregamento.");

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
