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
}

// Referências aos botões e formulário.
const btnAdicionarCurso = document.getElementById("btnAdicionarCurso"); // Botão para mostrar/esconder o formulário de adição.
const btnDeletarCurso = document.getElementById("btnDeletarCurso");     // Botão para deletar um curso.
const formAdicionarCurso = document.getElementById("formAdicionarCurso"); // O formulário para adicionar um novo curso.
const btnAdicionarCursoForm = document.getElementById("btnAdicionarCursoForm"); // Botão de submeter o formulário de adição.
const btnCancelarCurso = document.getElementById("btnCancelarCurso");       // Botão para cancelar a adição e esconder o formulário.

// Referências aos campos de input do formulário de adição.
// Permitem ler os valores que o utilizador digita.
const inputIdCurso = document.getElementById("inputIdCurso");
const inputNomeCurso = document.getElementById("inputNomeCurso");
const inputSiglaCurso = document.getElementById("inputSiglaCurso");

// URL base para todas as requisições à API do backend.
const API_BASE_URL = "https://trab1-humberto-31323-58n5.onrender.com"; // URL da sua API no Render

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
        console.log(`[FETCH CURSOS] Tentando buscar dados de: ${API_BASE_URL}/cursos`);
        // Faz uma requisição GET assíncrona para a rota '/cursos' do backend.
        const resposta = await fetch(`${API_BASE_URL}/cursos`);
        console.log("[FETCH CURSOS] Resposta da API recebida (objeto Response):", resposta);

        // Verifica se a resposta HTTP foi bem-sucedida (status 2xx).
        if (!resposta.ok) {
            const erroDetalhes = await resposta.text(); // Tenta ler o corpo da resposta como texto para obter detalhes do erro.
            console.error(`[FETCH CURSOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            // Cria uma nova linha na tabela para exibir a mensagem de erro ao utilizador.
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 4; // Faz com que a célula ocupe o número correto de colunas.
            celulaErro.textContent = `Erro ao carregar cursos: ${resposta.status} - ${resposta.statusText}. Verifique o console.`;
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            // Lança um novo erro para ser pego pelo bloco catch externo, se houver.
            throw new Error(`HTTP error! status: ${resposta.status}, detalhes: ${erroDetalhes}`);
        }

        // Converte a resposta HTTP para um objeto JSON.
        const cursos = await resposta.json();
        console.log("[FETCH CURSOS] Dados de cursos recebidos (array JSON):", cursos);

        // Valida se os dados recebidos são realmente um array.
        if (!Array.isArray(cursos)) {
            console.error("[DATA CURSOS ERROR] A resposta da API não é um array:", cursos);
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 4;
            celulaErro.textContent = "Erro: Dados de cursos recebidos da API não estão no formato esperado (array).";
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            return; // Sai da função.
        }

        // Se não houver cursos, exibe uma mensagem na tabela.
        if (cursos.length === 0) {
            console.log("[INFO CURSOS] Nenhum curso cadastrado. Exibindo mensagem na tabela.");
            const novaLinha = tabelaCursosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 4;
            celulaMensagem.textContent = "Nenhum curso cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        console.log(`[INFO CURSOS] Preenchendo tabela com ${cursos.length} cursos.`);
        // Itera sobre cada curso no array e adiciona uma nova linha à tabela para cada um.
        cursos.forEach(curso => {
            const novaLinha = tabelaCursosTbody.insertRow(); // Insere uma nova linha na tabela.
            // Insere células na nova linha e preenche com os dados do curso.
            // Assegure-se de que as chaves (id, Nome, Sigla)
            // correspondem às propriedades dos objetos de curso no seu `bd.json`.
            novaLinha.insertCell(0).textContent = curso.id;
            novaLinha.insertCell(1).textContent = curso.Nome;
            novaLinha.insertCell(2).textContent = curso.Sigla;
            console.log("   [RENDER CURSOS] Adicionado curso:", curso.Nome);
        });
        console.log("--- carregarCursos() finalizada com sucesso ---");
    } catch (error) {
        // Captura quaisquer erros que ocorram durante o processo (ex: erro de rede, JSON inválido).
        console.error("[CATCH CURSOS ERROR] Erro no processo de carregarCursos:", error);
        const novaLinha = tabelaCursosTbody.insertRow();
        const celulaErro = novaLinha.insertCell(0);
        celulaErro.colSpan = 4;
        celulaErro.textContent = "Erro inesperado ao carregar cursos. Verifique o console do navegador.";
        celulaErro.style.color = "red";
        celulaErro.style.textAlign = "center";
    }
}

/**
 * Função assíncrona para adicionar um novo curso.
 * Obtém os valores dos campos do formulário, valida-os e envia para o backend.
 */
async function adicionarCurso() {
    // Obtém os valores dos inputs do formulário.
    const id = parseInt(inputIdCurso.value, 10); // Converte o ID para inteiro.
    const nome = inputNomeCurso.value.trim();    // .trim() remove espaços em branco antes/depois.
    const sigla = inputSiglaCurso.value.trim();

    // Validação dos campos do formulário.
    if (isNaN(id) || !nome || !sigla) {
        // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
        // Exemplo: showCustomAlert("Por favor, preencha todos os campos corretamente.");
        alert("Por favor, preencha todos os campos corretamente.");
        return; // Sai da função.
    }

    // Cria um objeto `novoCurso` com os dados coletados.
    const novoCurso = { id, Nome: nome, Sigla: sigla };

    try {
        console.log("[ADD CURSO] Tentando adicionar curso:", novoCurso);
        // Faz uma requisição POST assíncrona para a rota '/cursos' do backend.
        const resposta = await fetch(`${API_BASE_URL}/cursos`, {
            method: "POST", // Método HTTP POST para criar um novo recurso.
            headers: { "Content-Type": "application/json" }, // Indica que o corpo da requisição é JSON.
            body: JSON.stringify(novoCurso), // Converte o objeto `novoCurso` para uma string JSON.
        });

        if (resposta.ok) { // Se a resposta for bem-sucedida (status 2xx).
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert("Curso adicionado com sucesso!"); // Notifica o utilizador.
            carregarCursos(); // Recarrega a tabela para exibir o novo curso.
            // Limpa os campos do formulário após a adição bem-sucedida.
            inputIdCurso.value = "";
            inputNomeCurso.value = "";
            inputSiglaCurso.value = "";
            formAdicionarCurso.style.display = "none"; // Esconde o formulário.
        } else { // Se a resposta indicar um erro.
            const erroData = await resposta.json(); // Tenta ler o corpo da resposta como JSON para obter detalhes do erro.
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert(`Erro ao adicionar curso: ${erroData.erro || resposta.statusText}`); // Alerta o utilizador com a mensagem de erro.
            console.error("[ADD CURSO ERROR] Erro ao adicionar curso:", resposta.status, erroData); // Loga o erro detalhado.
        }
    } catch (error) { // Captura erros de rede ou outros.
        console.error("[ADD CURSO CATCH] Erro ao adicionar curso:", error);
        // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
        alert("Erro ao adicionar curso. Verifique o console para mais detalhes.");
    }
}

/**
 * Função assíncrona para deletar um curso.
 * Solicita o ID do curso, confirma a exclusão e envia a requisição DELETE para o backend.
 */
async function deletarCurso() {
    // Solicita o ID do curso ao utilizador através de um prompt.
    // ATENÇÃO: Use um modal customizado para entrada de dados em vez de prompt() para melhor UX.
    const idInput = prompt("Digite o ID do curso para deletar:");
    const id = parseInt(idInput, 10); // Converte a entrada para inteiro.

    // Validação do ID.
    if (isNaN(id)) {
        // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
        alert("ID inválido. Por favor, digite um número.");
        return;
    }

    // Pede confirmação ao utilizador antes de deletar, para evitar exclusões acidentais.
    // 'confirm()' é usado aqui, mas para UX moderna, um modal personalizado seria melhor.
    // ATENÇÃO: Use um modal customizado para confirmação em vez de confirm() para melhor UX.
    if (!confirm(`Tem certeza que deseja deletar o curso com ID ${id}?`)) {
        return; // Sai da função se o utilizador cancelar.
    }

    try {
        console.log(`[DELETE CURSO] Tentando deletar curso com ID: ${id}`);
        // Faz uma requisição DELETE assíncrona para a rota '/cursos/:id' do backend.
        const resposta = await fetch(`${API_BASE_URL}/cursos/${id}`, {
            method: "DELETE", // Método HTTP DELETE para remover um recurso.
        });

        if (resposta.ok) { // Se a resposta for bem-sucedida.
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert("Curso deletado com sucesso!"); // Notifica o utilizador.
            carregarCursos(); // Recarrega a tabela para refletir a exclusão.
        } else { // Se a resposta indicar um erro.
            const erroData = await resposta.json(); // Tenta ler o JSON de erro.
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert(`Erro ao deletar curso: ${erroData.error || resposta.statusText}`); // Alerta o utilizador.
            console.error("[DELETE CURSO ERROR] Erro ao deletar curso:", resposta.status, erroData); // Loga o erro.
        }
    } catch (error) { // Captura erros de rede ou outros.
        console.error("[DELETE CURSO CATCH] Erro ao deletar curso:", error);
        // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
        alert("Erro ao deletar curso. Verifique o console para mais detalhes.");
    }
}

// --- Event Listeners ---
// Adiciona um listener para o evento `DOMContentLoaded`, que é disparado quando
// todo o HTML foi completamente carregado e parseado.
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded para listarcursos.html. Iniciando listeners e carregamento.");

    // Adiciona event listener ao botão 'Adicionar Novo Curso'.
    // Ao clicar, ele alterna a visibilidade do formulário de adição.
    if (btnAdicionarCurso) {
        btnAdicionarCurso.addEventListener("click", () => {
            console.log("Botão 'Adicionar Novo Curso' clicado. Alternando formulário.");
            if (formAdicionarCurso) {
                // Alterna o estilo de exibição entre 'none' (escondido) e 'block' (visível).
                formAdicionarCurso.style.display = formAdicionarCurso.style.display === "none" ? "block" : "none";
            }
        });
    } else {
        console.warn("Elemento 'btnAdicionarCurso' não encontrado."); // Avisa se o botão não for encontrado.
    }

    // Adiciona event listener ao botão 'Adicionar' dentro do formulário.
    // Ao clicar, ele chama a função `adicionarCurso`.
    if (btnAdicionarCursoForm) {
        btnAdicionarCursoForm.addEventListener("click", adicionarCurso);
    } else {
        console.warn("Elemento 'btnAdicionarCursoForm' não encontrado.");
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
            if (inputIdCurso) inputIdCurso.value = "";
            if (inputNomeCurso) inputNomeCurso.value = "";
            if (inputSiglaCurso) inputSiglaCurso.value = "";
        });
    } else {
        console.warn("Elemento 'btnCancelarCurso' não encontrado.");
    }

    // Chama a função `carregarCursos` assim que a página é carregada
    // para exibir a lista inicial de cursos na tabela.
    carregarCursos();
});
