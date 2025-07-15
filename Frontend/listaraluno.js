// frontend/listaraluno.js

// --- Obtenção de referências para elementos DOM (Document Object Model) ---
// Estas linhas obtêm referências aos elementos HTML da página usando seus IDs.
// Isso permite que o JavaScript manipule esses elementos, como adicionar linhas à tabela,
// ler valores de inputs ou esconder/mostrar formulários.
const tabelaAlunosElement = document.getElementById("tabelaAlunos"); // A tabela HTML onde os alunos serão listados.
// Tenta obter a referência ao 'tbody' da tabela. Isso é importante porque o conteúdo dinâmico
// da tabela é geralmente inserido dentro do 'tbody'.
const tabelaAlunosTbody = tabelaAlunosElement ? tabelaAlunosElement.getElementsByTagName("tbody")[0] : null;

// --- Validação inicial dos elementos cruciais ---
// Verifica se o 'tbody' da tabela foi encontrado. Se não, é um erro crítico,
// pois o script não poderá carregar os alunos.
if (!tabelaAlunosTbody) {
    console.error("Erro CRÍTICO: Elemento tbody da tabela de alunos (id='tabelaAlunos') não encontrado ou HTML malformado!");
    // NOTA: 'alert()' é desaconselhado em produção por bloquear a UI. Use mensagens na tela ou consoles para depuração.
}

// Referências aos botões e formulário.
const btnAdicionarAluno = document.getElementById("btnAdicionarAluno"); // Botão para mostrar/esconder o formulário de adição.
const btnDeletarAluno = document.getElementById("btnDeletarAluno");     // Botão para deletar um aluno.
const formAdicionarAluno = document.getElementById("formAdicionarAluno"); // O formulário para adicionar um novo aluno.
const btnAdicionarAlunoForm = document.getElementById("btnAdicionarAlunoForm"); // Botão de submeter o formulário de adição.
const btnCancelarAluno = document.getElementById("btnCancelarAluno");       // Botão para cancelar a adição e esconder o formulário.

// Referências aos campos de input do formulário de adição.
// Permitem ler os valores que o utilizador digita.
const inputIdAluno = document.getElementById("inputIdAluno");
const inputNomeAluno = document.getElementById("inputNomeAluno");
const inputApelidoAluno = document.getElementById("inputApelidoAluno");
const inputCursoAluno = document.getElementById("inputCursoAluno");
const inputAnoCurricularAluno = document.getElementById("inputAnoCurricularAluno");

// URL base para todas as requisições à API do backend.
const API_BASE_URL = "https://trab1-humberto-31323-58n5.onrender.com"; // URL da sua API no Render

/**
 * Função assíncrona para carregar e exibir a lista de alunos na tabela.
 * Ela faz uma requisição ao backend, parseia a resposta e preenche as linhas da tabela.
 */
async function carregarAlunos() {
    console.log("--- carregarAlunos() iniciada ---");
    // Verifica novamente se o tbody existe antes de tentar manipulá-lo.
    if (!tabelaAlunosTbody) {
        console.error("Erro: `tabelaAlunosTbody` é null. Impossível carregar alunos na tabela.");
        return; // Sai da função se o elemento crucial não estiver disponível.
    }
    tabelaAlunosTbody.innerHTML = ''; // Limpa qualquer conteúdo existente na tabela antes de adicionar novos dados.

    try {
        console.log(`[FETCH ALUNOS] Tentando buscar dados de: ${API_BASE_URL}/alunos`);
        // Faz uma requisição GET assíncrona para a rota '/alunos' do backend.
        const resposta = await fetch(`${API_BASE_URL}/alunos`);
        console.log("[FETCH ALUNOS] Resposta da API recebida (objeto Response):", resposta);

        // Verifica se a resposta HTTP foi bem-sucedida (status 2xx).
        if (!resposta.ok) {
            const erroDetalhes = await resposta.text(); // Tenta ler o corpo da resposta como texto para obter detalhes do erro.
            console.error(`[FETCH ALUNOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            // Cria uma nova linha na tabela para exibir a mensagem de erro ao utilizador.
            const novaLinha = tabelaAlunosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 5; // Faz com que a célula ocupe 5 colunas para centralizar a mensagem.
            celulaErro.textContent = `Erro ao carregar alunos: ${resposta.status} - ${resposta.statusText}. Verifique o console.`;
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            // Lança um novo erro para ser pego pelo bloco catch externo, se houver.
            throw new Error(`HTTP error! status: ${resposta.status}, detalhes: ${erroDetalhes}`);
        }

        // Converte a resposta HTTP para um objeto JSON.
        const alunos = await resposta.json();
        console.log("[FETCH ALUNOS] Dados de alunos recebidos (array JSON):", alunos);

        // Valida se os dados recebidos são realmente um array.
        if (!Array.isArray(alunos)) {
            console.error("[DATA ALUNOS ERROR] A resposta da API não é um array:", alunos);
            const novaLinha = tabelaAlunosTbody.insertRow();
            const celulaErro = novaLinha.insertCell(0);
            celulaErro.colSpan = 5;
            celulaErro.textContent = "Erro: Dados de alunos recebidos da API não estão no formato esperado (array).";
            celulaErro.style.color = "red";
            celulaErro.style.textAlign = "center";
            return; // Sai da função.
        }

        // Se não houver alunos, exibe uma mensagem na tabela.
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
        // Itera sobre cada aluno no array e adiciona uma nova linha à tabela para cada um.
        alunos.forEach(aluno => {
            const novaLinha = tabelaAlunosTbody.insertRow(); // Insere uma nova linha na tabela.
            // Insere células na nova linha e preenche com os dados do aluno.
            // Assegure-se de que as chaves (id, Nome, Apelido, Curso, Ano_Curricular)
            // correspondem às propriedades dos objetos de aluno no seu `bd.json`.
            novaLinha.insertCell(0).textContent = aluno.id;
            novaLinha.insertCell(1).textContent = aluno.Nome;
            novaLinha.insertCell(2).textContent = aluno.Apelido;
            novaLinha.insertCell(3).textContent = aluno.Curso;
            novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;
            console.log("   [RENDER ALUNOS] Adicionado aluno:", aluno.Nome);
        });
        console.log("--- carregarAlunos() finalizada com sucesso ---");
    } catch (error) {
        // Captura quaisquer erros que ocorram durante o processo (ex: erro de rede, JSON inválido).
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
 * Função assíncrona para adicionar um novo aluno.
 * Obtém os valores dos campos do formulário, valida-os e envia para o backend.
 */
async function adicionarAluno() {
    // Obtém os valores dos inputs do formulário.
    const id = parseInt(inputIdAluno.value, 10); // Converte o ID para inteiro.
    const nome = inputNomeAluno.value.trim();    // .trim() remove espaços em branco antes/depois.
    const apelido = inputApelidoAluno.value.trim();
    const curso = inputCursoAluno.value.trim();
    const anoCurricular = inputAnoCurricularAluno.value.trim();

    // Validação dos campos do formulário.
    if (isNaN(id) || !nome || !apelido || !curso || !anoCurricular) {
        // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
        // Exemplo: showCustomAlert("Por favor, preencha todos os campos corretamente.");
        alert("Por favor, preencha todos os campos corretamente.");
        return; // Sai da função.
    }

    // Cria um objeto `novoAluno` com os dados coletados.
    const novoAluno = { id, Nome: nome, Apelido: apelido, Curso: curso, Ano_Curricular: anoCurricular };

    try {
        console.log("[ADD ALUNO] Tentando adicionar aluno:", novoAluno);
        // Faz uma requisição POST assíncrona para a rota '/alunos' do backend.
        const resposta = await fetch(`${API_BASE_URL}/alunos`, {
            method: "POST", // Método HTTP POST para criar um novo recurso.
            headers: { "Content-Type": "application/json" }, // Indica que o corpo da requisição é JSON.
            body: JSON.stringify(novoAluno), // Converte o objeto `novoAluno` para uma string JSON.
        });

        if (resposta.ok) { // Se a resposta for bem-sucedida (status 2xx).
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert("Aluno adicionado com sucesso!"); // Notifica o utilizador.
            carregarAlunos(); // Recarrega a tabela para exibir o novo aluno.
            // Limpa os campos do formulário após a adição bem-sucedida.
            inputIdAluno.value = "";
            inputNomeAluno.value = "";
            inputApelidoAluno.value = "";
            inputCursoAluno.value = "";
            inputAnoCurricularAluno.value = "";
            formAdicionarAluno.style.display = "none"; // Esconde o formulário.
        } else { // Se a resposta indicar um erro.
            const erroData = await resposta.json(); // Tenta ler o corpo da resposta como JSON para obter detalhes do erro.
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert(`Erro ao adicionar aluno: ${erroData.erro || resposta.statusText}`); // Alerta o utilizador com a mensagem de erro.
            console.error("[ADD ALUNO ERROR] Erro ao adicionar aluno:", resposta.status, erroData); // Loga o erro detalhado.
        }
    } catch (error) { // Captura erros de rede ou outros.
        console.error("[ADD ALUNO CATCH] Erro ao adicionar aluno:", error);
        // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
        alert("Erro ao adicionar aluno. Verifique o console para mais detalhes.");
    }
}

/**
 * Função assíncrona para deletar um aluno.
 * Solicita o ID do aluno, confirma a exclusão e envia a requisição DELETE para o backend.
 */
async function deletarAluno() {
    // Solicita o ID do aluno ao utilizador através de um prompt.
    // ATENÇÃO: Use um modal customizado para entrada de dados em vez de prompt() para melhor UX.
    const idInput = prompt("Digite o ID do aluno para deletar:");
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
    if (!confirm(`Tem certeza que deseja deletar o aluno com ID ${id}?`)) {
        return; // Sai da função se o utilizador cancelar.
    }

    try {
        console.log(`[DELETE ALUNO] Tentando deletar aluno com ID: ${id}`);
        // Faz uma requisição DELETE assíncrona para a rota '/alunos/:id' do backend.
        const resposta = await fetch(`${API_BASE_URL}/alunos/${id}`, {
            method: "DELETE", // Método HTTP DELETE para remover um recurso.
        });

        if (resposta.ok) { // Se a resposta for bem-sucedida.
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert("Aluno deletado com sucesso!"); // Notifica o utilizador.
            carregarAlunos(); // Recarrega a tabela para refletir a exclusão.
        } else { // Se a resposta indicar um erro.
            const erroData = await resposta.json(); // Tenta ler o JSON de erro.
            // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
            alert(`Erro ao deletar aluno: ${erroData.error || resposta.statusText}`); // Alerta o utilizador.
            console.error("[DELETE ALUNO ERROR] Erro ao deletar aluno:", resposta.status, erroData); // Loga o erro.
        }
    } catch (error) { // Captura erros de rede ou outros.
        console.error("[DELETE ALUNO CATCH] Erro ao deletar aluno:", error);
        // ATENÇÃO: Use um modal customizado em vez de alert() para melhor UX.
        alert("Erro ao deletar aluno. Verifique o console para mais detalhes.");
    }
}

// --- Event Listeners ---
// Adiciona um listener para o evento `DOMContentLoaded`, que é disparado quando
// todo o HTML foi completamente carregado e parseado.
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded para listaralunos.html. Iniciando listeners e carregamento.");

    // Adiciona event listener ao botão 'Adicionar Novo Aluno'.
    // Ao clicar, ele alterna a visibilidade do formulário de adição.
    if (btnAdicionarAluno) {
        btnAdicionarAluno.addEventListener("click", () => {
            console.log("Botão 'Adicionar Novo Aluno' clicado. Alternando formulário.");
            if (formAdicionarAluno) {
                // Alterna o estilo de exibição entre 'none' (escondido) e 'block' (visível).
                formAdicionarAluno.style.display = formAdicionarAluno.style.display === "none" ? "block" : "none";
            }
        });
    } else {
        console.warn("Elemento 'btnAdicionarAluno' não encontrado."); // Avisa se o botão não for encontrado.
    }

    // Adiciona event listener ao botão 'Adicionar' dentro do formulário.
    // Ao clicar, ele chama a função `adicionarAluno`.
    if (btnAdicionarAlunoForm) {
        btnAdicionarAlunoForm.addEventListener("click", adicionarAluno);
    } else {
        console.warn("Elemento 'btnAdicionarAlunoForm' não encontrado.");
    }

    // Adiciona event listener ao botão 'Deletar Aluno'.
    // Ao clicar, ele chama a função `deletarAluno`.
    if (btnDeletarAluno) {
        btnDeletarAluno.addEventListener("click", deletarAluno);
    } else {
        console.warn("Elemento 'btnDeletarAluno' não encontrado.");
    }

    // Adiciona event listener ao botão 'Cancelar' no formulário.
    // Ao clicar, ele esconde o formulário e limpa os campos de input.
    if (btnCancelarAluno) {
        btnCancelarAluno.addEventListener("click", () => {
            console.log("Botão 'Cancelar' clicado. Ocultando formulário e limpando campos.");
            if (formAdicionarAluno) formAdicionarAluno.style.display = "none";
            // Limpa os valores de todos os campos do formulário.
            if (inputIdAluno) inputIdAluno.value = "";
            if (inputNomeAluno) inputNomeAluno.value = "";
            if (inputApelidoAluno) inputApelidoAluno.value = "";
            if (inputCursoAluno) inputCursoAluno.value = "";
            if (inputAnoCurricularAluno) inputAnoCurricularAluno.value = "";
        });
    } else {
        console.warn("Elemento 'btnCancelarAluno' não encontrado.");
    }

    // Chama a função `carregarAlunos` assim que a página é carregada
    // para exibir a lista inicial de alunos na tabela.
    carregarAlunos();
});
