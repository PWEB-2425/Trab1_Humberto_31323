// frontend/listarcursos.js

// --- Obtenção de referências para elementos DOM (Document Object Model) ---
// Estas linhas obtêm referências aos elementos HTML da página usando seus IDs.
// Isso permite que o JavaScript manipule esses elementos, como adicionar linhas à tabela,
// ler valores de inputs ou esconder/mostrar formulários.
const tabelaCursosElement = document.getElementById("tabelaCursos"); // A tabela HTML onde os cursos serão listados.
// Tenta obter a referência ao 'tbody' da tabela. Isso é importante porque o conteúdo dinâmico
// da tabela é geralmente inserido dentro do 'tbody'.
const tabelaCursosTbody = tabelaCursosElement ? tabelaCursosElement.getElementsByTagName("tbody")[0] : null;

// --- Validação inicial dos elementos cruciais ---
// Verifica se o 'tbody' da tabela foi encontrado. Se não, é um erro crítico,
// pois o script não poderá carregar os cursos.
if (!tabelaCursosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de cursos (id='tabelaCursos') não encontrado ou HTML malformado!");
    // NOTA: 'alert()' é desaconselhado em produção por bloquear a UI. Use mensagens na tela ou consoles para depuração.
    // alert("Erro: Não foi possível encontrar a área para exibir os cursos. Verifique o HTML e o console.");
}

// Referências aos botões e formulário, verificando a existência.
const btnAdicionarCurso = document.getElementById("btnAdicionarCurso"); // Botão para mostrar/esconder o formulário de adição.
const btnDeletarCurso = document.getElementById("btnDeletarCurso");     // Botão para deletar um curso.
const formAdicionarCurso = document.getElementById("formAdicionarCurso"); // O formulário para adicionar um novo curso.
const btnAdicionarCursoForm = document.getElementById("btnAdicionarCursoForm"); // Botão de submeter o formulário de adição.
const btnCancelarCurso = document.getElementById("btnCancelarCurso");       // Botão para cancelar a adição e esconder o formulário.

// Referências aos campos de input do formulário de adição.
// Permitem ler os valores que o utilizador digita.
const inputNomeCurso = document.getElementById("inputNomeCurso");     // Campo de nome do curso.
const inputSiglaCurso = document.getElementById("inputSiglaCurso");   // Campo de sigla do curso.
const inputIdCurso = document.getElementById("inputIdCurso");         // Campo de ID do curso.

// URL base para todas as requisições à API do backend.
const BASE_URL = "http://localhost:3000";

/**
 * Função assíncrona para carregar e exibir a lista de cursos na tabela.
 * Ela faz uma requisição ao backend, parseia a resposta e preenche as linhas da tabela.
 */
async function carregarCursos() {
    console.log("--- carregarCursos() iniciada ---");

    // Verifica novamente se o tbody existe antes de tentar manipulá-lo.
    if (!tabelaCursosTbody) {
        console.error("Erro: `tabelaCursosTbody` é null. Impossível carregar cursos na tabela.");
        return; // Sai da função se o elemento crucial não estiver disponível.
    }

    tabelaCursosTbody.innerHTML = ''; // Limpa qualquer conteúdo existente na tabela antes de adicionar novos dados.

    try {
        console.log(`[FETCH] Tentando buscar dados de: ${BASE_URL}/cursos`);
        // Faz uma requisição GET assíncrona para a rota '/cursos' do backend.
        const resposta = await fetch(`${BASE_URL}/cursos`);
        console.log("[FETCH] Resposta da API recebida (objeto Response):", resposta);

        // Verifica se a resposta HTTP foi bem-sucedida (status 2xx).
        if (!resposta.ok) {
            // Se a resposta não for OK (status 2xx), tenta ler o corpo da resposta de erro.
            const erroDetalhes = await resposta.text();
            console.error(`[FETCH ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            // Cria uma nova linha na tabela para exibir a mensagem de erro ao utilizador.
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 3; // Faz com que a célula ocupe 3 colunas para centralizar a mensagem.
            celulaErro.textContent = `Erro ao carregar cursos: ${resposta.status} - ${resposta.statusText}. Verifique o console.`;
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            // Lança um novo erro para ser pego pelo bloco catch externo, se houver.
            throw new Error(`HTTP error! status: ${resposta.status}, detalhes: ${erroDetalhes}`);
        }

        // Converte a resposta HTTP para um objeto JSON.
        const cursos = await resposta.json();
        console.log("[FETCH] Dados de cursos recebidos (array JSON):", cursos);

        // Valida se os dados recebidos são realmente um array.
        if (!Array.isArray(cursos)) {
            console.error("[DATA ERROR] A resposta da API não é um array:", cursos);
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 3;
            celulaErro.textContent = "Erro: Dados recebidos da API não estão no formato esperado (array).";
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            return; // Sai da função.
        }

        // Se não houver cursos, exibe uma mensagem na tabela.
        if (cursos.length === 0) {
            console.log("[INFO] Nenhum curso cadastrado. Exibindo mensagem na tabela.");
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 3; // Abrange todas as colunas da tabela.
            celulaMensagem.textContent = "Nenhum curso cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        console.log(`[INFO] Preenchendo tabela com ${cursos.length} cursos.`);
        // Itera sobre cada curso no array e adiciona uma nova linha à tabela para cada um.
        cursos.forEach(curso => {
            const novaLinha = tabelaCursosTbody.insertRow(); // Adiciona uma nova linha ao tbody.

            // Insere células na nova linha e preenche com os dados do curso.
            // Assegure-se de que 'curso.id', 'curso.Nome' e 'curso.Sigla'
            // correspondem EXATAMENTE às chaves no seu `bd.json`.
            novaLinha.insertCell(0).textContent = curso.id;
            novaLinha.insertCell(1).textContent = curso.Nome;
            novaLinha.insertCell(2).textContent = curso.Sigla;
            console.log("  [RENDER] Adicionado curso à tabela:", curso.Nome);
        });
        console.log("--- carregarCursos() finalizada com sucesso ---");
    } catch (error) {
        // Captura quaisquer erros que ocorram durante o processo (ex: erro de rede, JSON inválido).
        console.error("[CATCH ERROR] Erro no processo de carregarCursos:", error);
        const novaLinha = tabelaCursosTbody.insertRow();
        const celulaErro = novaLinha.insertCell(0);
        celulaErro.colSpan = 3;
        celulaErro.textContent = "Erro inesperado ao carregar cursos. Verifique o console do navegador.";
        celulaErro.style.color = "red";
        celulaErro.style.textAlign = "center";
        // alert("Erro ao carregar cursos. Verifique o console para mais detalhes."); // Mantenha para depuração inicial se necessário
    }
}

/**
 * Função assíncrona para adicionar um novo curso via API.
 * Obtém os valores dos campos do formulário, valida-os e envia para o backend.
 */
async function adicionarCurso() {
    const nome = inputNomeCurso.value.trim();     // Obtém o nome do curso (removendo espaços).
    const sigla = inputSiglaCurso.value.trim();   // Obtém a sigla do curso (removendo espaços).
    const id = parseInt(inputIdCurso.value, 10); // Obtém o ID e o converte para inteiro.

    // Validação dos campos do formulário.
    if (!nome || !sigla || isNaN(id)) {
        alert("Por favor, preencha todos os campos corretamente (ID deve ser um número)."); // Alerta o utilizador.
        return; // Sai da função.
    }

    // Cria um objeto `novoCurso` com os dados coletados.
    const novoCurso = { id, Nome: nome, Sigla: sigla };

    try {
        console.log("[ADD] Tentando adicionar curso:", novoCurso);
        // Faz uma requisição POST assíncrona para a rota '/cursos' do backend.
        const resposta = await fetch(`${BASE_URL}/cursos`, {
            method: "POST", // Método HTTP POST para criar um novo recurso.
            headers: { "Content-Type": "application/json" }, // Indica que o corpo da requisição é JSON.
            body: JSON.stringify(novoCurso), // Converte o objeto `novoCurso` para uma string JSON.
        });

        if (resposta.ok) { // Se a resposta for bem-sucedida (status 2xx).
            alert("Curso adicionado com sucesso!"); // Notifica o utilizador.
            carregarCursos(); // Recarrega a tabela para exibir o novo curso.
            // Limpa e esconde o formulário após a adição bem-sucedida.
            inputNomeCurso.value = "";
            inputSiglaCurso.value = "";
            inputIdCurso.value = "";
            formAdicionarCurso.style.display = "none";
        } else { // Se a resposta indicar um erro.
            const erroData = await resposta.json(); // Tenta ler o corpo da resposta como JSON para obter detalhes do erro.
            alert(`Erro ao adicionar curso: ${erroData.erro || resposta.statusText}`); // Alerta o utilizador com a mensagem de erro.
            console.error("[ADD ERROR] Erro ao adicionar curso:", resposta.status, erroData); // Loga o erro detalhado.
        }
    } catch (error) { // Captura erros de rede ou outros.
        console.error("[ADD CATCH] Erro ao adicionar curso (rede ou parsing):", error);
        alert("Erro ao adicionar curso. Verifique o console para mais detalhes.");
    }
}

/**
 * Função assíncrona para deletar um curso.
 * Solicita o ID do curso, confirma a exclusão e envia a requisição DELETE para o backend.
 */
async function deletarCurso() {
    // Solicita o ID do curso ao utilizador através de um prompt.
    const idInput = prompt("Digite o ID do curso para deletar:");
    const id = parseInt(idInput, 10); // Converte a entrada para inteiro.

    // Validação do ID.
    if (isNaN(id)) {
        alert("ID inválido. Por favor, digite um número.");
        return;
    }

    // Pede confirmação ao utilizador antes de deletar, para evitar exclusões acidentais.
    // 'confirm()' é usado aqui, mas para UX moderna, um modal personalizado seria melhor.
    if (!confirm(`Tem certeza que deseja deletar o curso com ID ${id}?`)) {
        return; // Sai da função se o utilizador cancelar.
    }

    try {
        console.log(`[DELETE] Tentando deletar curso com ID: ${id}`);
        // Faz uma requisição DELETE assíncrona para a rota '/cursos/:id' do backend.
        const resposta = await fetch(`${BASE_URL}/cursos/${id}`, {
            method: "DELETE", // Método HTTP DELETE para remover um recurso.
        });

        if (resposta.ok) { // Se a resposta for bem-sucedida.
            alert("Curso deletado com sucesso!"); // Notifica o utilizador.
            carregarCursos(); // Recarrega a tabela para refletir a exclusão.
        } else { // Se a resposta indicar um erro.
            const erroData = await resposta.json(); // Tenta ler o JSON de erro.
            alert(`Erro ao deletar curso: ${erroData.error || resposta.statusText}`); // Alerta o utilizador.
            console.error("[DELETE ERROR] Erro ao deletar curso:", resposta.status, erroData); // Loga o erro.
        }
    } catch (error) { // Captura erros de rede ou outros.
        console.error("[DELETE CATCH] Erro ao deletar curso (rede ou parsing):", error);
        alert("Erro ao deletar curso. Verifique o console para mais detalhes.");
    }
}

// --- Event Listeners para a página de cursos ---
// Garante que o script só tenta manipular o DOM quando ele está completamente carregado.
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded para listarcursos.html. Iniciando listeners e carregamento inicial.");

    // Adiciona event listeners aos botões e formulário, verificando se existem antes.
    if (btnAdicionarCurso) {
        btnAdicionarCurso.addEventListener("click", () => {
            console.log("Botão 'Adicionar Novo Curso' clicado. Alternando visibilidade do formulário.");
            if (formAdicionarCurso) { // Verifica se o formulário existe antes de tentar mudar o estilo.
                // Alterna o estilo de exibição entre 'none' (escondido) e 'block' (visível).
                formAdicionarCurso.style.display = formAdicionarCurso.style.display === "none" ? "block" : "none";
            } else {
                console.warn("Elemento 'formAdicionarCurso' não encontrado para alternar visibilidade."); // Avisa se o formulário não for encontrado.
            }
        });
    } else {
        console.warn("Elemento 'btnAdicionarCurso' (botão que mostra/esconde formulário) não encontrado.");
    }

    // Adiciona event listener ao botão 'Salvar Curso' dentro do formulário.
    // Ao clicar, ele chama a função `adicionarCurso`.
    if (btnAdicionarCursoForm) {
        btnAdicionarCursoForm.addEventListener("click", adicionarCurso);
    } else {
        console.warn("Elemento 'btnAdicionarCursoForm' (botão 'Salvar Curso' do formulário) não encontrado.");
    }

    // Adiciona event listener ao botão 'Deletar Curso'.
    // Ao clicar, ele chama a função `deletarCurso`.
    if (btnDeletarCurso) {
        btnDeletarCurso.addEventListener("click", deletarCurso);
    } else {
        console.warn("Elemento 'btnDeletarCurso' não encontrado.");
    }

    // Adiciona event listener ao botão 'Cancelar' no formulário.
    // Ao clicar, ele esconde o formulário e limpa os campos de input.
    if (btnCancelarCurso) {
        btnCancelarCurso.addEventListener("click", () => {
            console.log("Botão 'Cancelar' clicado. Ocultando formulário e limpando campos.");
            if (formAdicionarCurso) formAdicionarCurso.style.display = "none";
            // Limpa os valores de todos os campos do formulário.
            if (inputNomeCurso) inputNomeCurso.value = "";
            if (inputSiglaCurso) inputSiglaCurso.value = "";
            if (inputIdCurso) inputIdCurso.value = "";
        });
    } else {
        console.warn("Elemento 'btnCancelarCurso' não encontrado.");
    }

    // Chama a função `carregarCursos` assim que a página é carregada
    // para exibir a lista inicial de cursos na tabela.
    carregarCursos();
});
