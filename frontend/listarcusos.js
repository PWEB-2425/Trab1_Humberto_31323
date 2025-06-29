// listarcursos.js

// Obtenção de referências para elementos DOM
const tabelaCursosElement = document.getElementById("tabelaCursos"); // Referência à tabela completa
const tabelaCursosTbody = tabelaCursosElement ? tabelaCursosElement.getElementsByTagName("tbody")[0] : null; // Referência ao tbody

// Validação inicial dos elementos cruciais
if (!tabelaCursosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de cursos (id='tabelaCursos') não encontrado ou HTML malformado!");
    // Não use alert() em produção, mas para depuração pode ser útil inicialmente.
    // alert("Erro: Não foi possível encontrar a área para exibir os cursos. Verifique o HTML e o console.");
    // Saia do script se o elemento principal não for encontrado
    // return; // Esta linha impediria a execução de outras partes se fosse um script standalone.
    // Como está dentro do DOMContentLoaded, a depuração continuará.
}

// Referências aos botões e formulário, verificando a existência
const btnAdicionarCurso = document.getElementById("btnAdicionarCurso");
const btnDeletarCurso = document.getElementById("btnDeletarCurso");
const formAdicionarCurso = document.getElementById("formAdicionarCurso");
const btnAdicionarCursoForm = document.getElementById("btnAdicionarCursoForm");
const btnCancelarCurso = document.getElementById("btnCancelarCurso");

// Referências aos campos de input do formulário
const inputNomeCurso = document.getElementById("inputNomeCurso");
const inputSiglaCurso = document.getElementById("inputSiglaCurso");
const inputIdCurso = document.getElementById("inputIdCurso");

// URL base para as requisições à API
const BASE_URL = "http://localhost:3000";

/**
 * Função assíncrona para carregar os cursos do backend e preencher a tabela.
 */
async function carregarCursos() {
    console.log("--- carregarCursos() iniciada ---");

    // Verifica novamente se o tbody foi encontrado antes de tentar manipulá-lo
    if (!tabelaCursosTbody) {
        console.error("Erro: `tabelaCursosTbody` é null. Impossível carregar cursos na tabela.");
        return;
    }

    tabelaCursosTbody.innerHTML = ''; // Limpa o conteúdo atual do corpo da tabela

    try {
        console.log(`[FETCH] Tentando buscar dados de: ${BASE_URL}/cursos`);
        const resposta = await fetch(`${BASE_URL}/cursos`);
        console.log("[FETCH] Resposta da API recebida (objeto Response):", resposta);

        if (!resposta.ok) {
            // Se a resposta não for OK (status 2xx), tenta ler o corpo da resposta de erro
            const erroDetalhes = await resposta.text();
            console.error(`[FETCH ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            // Exibe uma mensagem na tabela em caso de erro
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 3; // Abrange todas as colunas
            celulaErro.textContent = `Erro ao carregar cursos: ${resposta.status} - ${resposta.statusText}. Verifique o console.`;
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            // Lança um erro para ser capturado pelo bloco catch
            throw new Error(`HTTP error! status: ${resposta.status}, detalhes: ${erroDetalhes}`);
        }

        const cursos = await resposta.json(); // Analisa a resposta como JSON
        console.log("[FETCH] Dados de cursos recebidos (array JSON):", cursos);

        if (!Array.isArray(cursos)) {
            console.error("[DATA ERROR] A resposta da API não é um array:", cursos);
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 3;
            celulaErro.textContent = "Erro: Dados recebidos da API não estão no formato esperado (array).";
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            return;
        }

        if (cursos.length === 0) {
            console.log("[INFO] Nenhum curso cadastrado. Exibindo mensagem na tabela.");
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 3; // Abrange todas as colunas da tabela
            celulaMensagem.textContent = "Nenhum curso cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        console.log(`[INFO] Preenchendo tabela com ${cursos.length} cursos.`);
        cursos.forEach(curso => {
            const novaLinha = tabelaCursosTbody.insertRow(); // Adiciona uma nova linha ao tbody

            // Assegure-se de que 'curso.id', 'curso.Nome' e 'curso.Sigla'
            // correspondem EXATAMENTE às chaves no seu bd.json.
            // Se as chaves no bd.json forem 'name' e 'sigla' (minúsculas), você deve usar curso.name e curso.sigla aqui.
            novaLinha.insertCell(0).textContent = curso.id;
            novaLinha.insertCell(1).textContent = curso.Nome;
            novaLinha.insertCell(2).textContent = curso.Sigla;
            console.log("  [RENDER] Adicionado curso à tabela:", curso.Nome);
        });
        console.log("--- carregarCursos() finalizada com sucesso ---");
    } catch (error) {
        console.error("[CATCH ERROR] Erro no processo de carregarCursos:", error);
        // Exibe uma mensagem de erro genérica na tabela em caso de exceção
        const novaLinha = tabelaCursosTbody.insertRow();
        const celulaErro = novaLinha.insertCell(0);
        celulaErro.colSpan = 3;
        celulaErro.textContent = "Erro inesperado ao carregar cursos. Verifique o console do navegador.";
        celulaErro.style.color = "red";
        celulaErro.style.textAlign = "center";
        // alert("Erro ao carregar cursos. Verifique o console para mais detalhes."); // Evite alerts em produção
    }
}

/**
 * Função assíncrona para adicionar um novo curso via API.
 */
async function adicionarCurso() {
    const nome = inputNomeCurso.value.trim();
    const sigla = inputSiglaCurso.value.trim();
    const id = parseInt(inputIdCurso.value, 10);

    if (!nome || !sigla || isNaN(id)) {
        alert("Por favor, preencha todos os campos corretamente (ID deve ser um número).");
        return;
    }

    const novoCurso = { id, Nome: nome, Sigla: sigla };

    try {
        console.log("[ADD] Tentando adicionar curso:", novoCurso);
        const resposta = await fetch(`${BASE_URL}/cursos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoCurso),
        });

        if (resposta.ok) {
            alert("Curso adicionado com sucesso!"); // Pode ser substituído por um modal customizado
            carregarCursos(); // Recarrega a tabela para mostrar o novo curso
            // Limpa e esconde o formulário
            inputNomeCurso.value = "";
            inputSiglaCurso.value = "";
            inputIdCurso.value = "";
            formAdicionarCurso.style.display = "none";
        } else {
            const erroData = await resposta.json();
            alert(`Erro ao adicionar curso: ${erroData.erro || resposta.statusText}`);
            console.error("[ADD ERROR] Erro ao adicionar curso:", resposta.status, erroData);
        }
    } catch (error) {
        console.error("[ADD CATCH] Erro ao adicionar curso (rede ou parsing):", error);
        alert("Erro ao adicionar curso. Verifique o console para mais detalhes.");
    }
}

/**
 * Função assíncrona para deletar um curso via API.
 */
async function deletarCurso() {
    const idInput = prompt("Digite o ID do curso para deletar:");
    const id = parseInt(idInput, 10);

    if (isNaN(id)) {
        alert("ID inválido. Por favor, digite um número.");
        return;
    }

    // Usar um modal de confirmação no lugar de prompt/confirm em produção
    if (!confirm(`Tem certeza que deseja deletar o curso com ID ${id}?`)) {
        return;
    }

    try {
        console.log(`[DELETE] Tentando deletar curso com ID: ${id}`);
        const resposta = await fetch(`${BASE_URL}/cursos/${id}`, {
            method: "DELETE",
        });

        if (resposta.ok) {
            alert("Curso deletado com sucesso!"); // Pode ser substituído por um modal customizado
            carregarCursos(); // Recarrega a tabela
        } else {
            const erroData = await resposta.json();
            alert(`Erro ao deletar curso: ${erroData.error || resposta.statusText}`);
            console.error("[DELETE ERROR] Erro ao deletar curso:", resposta.status, erroData);
        }
    } catch (error) {
        console.error("[DELETE CATCH] Erro ao deletar curso (rede ou parsing):", error);
        alert("Erro ao deletar curso. Verifique o console para mais detalhes.");
    }
}

// --- Event Listeners para a página de cursos ---
// Garante que o script só tenta manipular o DOM quando ele está completamente carregado.
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded para listarcursos.html. Iniciando listeners e carregamento inicial.");

    // Adiciona event listeners aos botões e formulário, verificando se existem antes
    if (btnAdicionarCurso) {
        btnAdicionarCurso.addEventListener("click", () => {
            console.log("Botão 'Adicionar Novo Curso' clicado. Alternando visibilidade do formulário.");
            if (formAdicionarCurso) { // Verifica se o form existe antes de tentar mudar o estilo
                formAdicionarCurso.style.display = formAdicionarCurso.style.display === "none" ? "block" : "none";
            } else {
                console.warn("Elemento 'formAdicionarCurso' não encontrado para alternar visibilidade.");
            }
        });
    } else {
        console.warn("Elemento 'btnAdicionarCurso' (botão que mostra/esconde formulário) não encontrado.");
    }

    if (btnAdicionarCursoForm) {
        btnAdicionarCursoForm.addEventListener("click", adicionarCurso);
    } else {
        console.warn("Elemento 'btnAdicionarCursoForm' (botão 'Salvar Curso' do formulário) não encontrado.");
    }

    if (btnDeletarCurso) {
        btnDeletarCurso.addEventListener("click", deletarCurso);
    } else {
        console.warn("Elemento 'btnDeletarCurso' não encontrado.");
    }

    if (btnCancelarCurso) {
        btnCancelarCurso.addEventListener("click", () => {
            console.log("Botão 'Cancelar' clicado. Ocultando formulário e limpando campos.");
            if (formAdicionarCurso) formAdicionarCurso.style.display = "none";
            if (inputNomeCurso) inputNomeCurso.value = "";
            if (inputSiglaCurso) inputSiglaCurso.value = "";
            if (inputIdCurso) inputIdCurso.value = "";
        });
    } else {
        console.warn("Elemento 'btnCancelarCurso' não encontrado.");
    }

    // Chama a função para carregar os cursos quando a página é carregada
    carregarCursos();
});
