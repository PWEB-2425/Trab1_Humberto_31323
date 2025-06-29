const tabelaCursos = document.getElementById("tabelaCursos").getElementsByTagName("tbody")[0];
const btnAdicionarCurso = document.getElementById("btnAdicionarCurso");
const btnDeletarCurso = document.getElementById("btnDeletarCurso");
const formAdicionarCurso = document.getElementById("formAdicionarCurso");
const btnAdicionarCursoForm = document.getElementById("btnAdicionarCursoForm");
const btnCancelarCurso = document.getElementById("btnCancelarCurso");

const inputNomeCurso = document.getElementById("inputNomeCurso");
const inputSiglaCurso = document.getElementById("inputSiglaCurso");
const inputIdCurso = document.getElementById("inputIdCurso");

const BASE_URL = "http://localhost:3000";

// Função para carregar cursos na tabela
async function carregarCursos() {
    console.log("--- carregarCursos() iniciada ---"); // Debug 1
    try {
        // Verifica se o elemento tbody foi encontrado antes de tentar manipulá-lo
        if (!tabelaCursos) { 
            console.error("Erro: Elemento tbody da tabela de cursos (id='tabelaCursos') não encontrado!"); // Debug 1.1
            alert("Erro: Não foi possível encontrar a área para exibir os cursos. Verifique o HTML.");
            return;
        }
        
        tabelaCursos.innerHTML = ''; // Limpa o conteúdo atual da tabela

        console.log(`Tentando buscar dados de: ${BASE_URL}/cursos`); // Debug 2
        const resposta = await fetch(`${BASE_URL}/cursos`);
        console.log("Resposta da API recebida:", resposta); // Debug 3

        if (!resposta.ok) {
            const erroDetalhes = await resposta.text(); // Tenta ler o corpo da resposta de erro
            console.error(`Erro HTTP! Status: ${resposta.status}`, erroDetalhes); // Debug 4
            throw new Error(`HTTP error! status: ${resposta.status}, detalhes: ${erroDetalhes}`);
        }
        
        const cursos = await resposta.json();
        console.log("Dados de cursos recebidos:", cursos); // Debug 5

        if (cursos.length === 0) {
            console.log("Nenhum curso cadastrado. Exibindo mensagem na tabela."); // Debug 6
            const novaLinha = tabelaCursos.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 3; // Abrange todas as colunas
            celulaMensagem.textContent = "Nenhum curso cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return; 
        }

        console.log(`Preenchendo tabela com ${cursos.length} cursos.`); // Debug 7
        cursos.forEach(curso => {
            const novaLinha = tabelaCursos.insertRow();
            // Assegure-se de que 'curso.id', 'curso.Nome' e 'curso.Sigla' correspondem exatamente
            // às chaves no seu bd.json para os objetos de curso.
            novaLinha.insertCell(0).textContent = curso.id;
            novaLinha.insertCell(1).textContent = curso.Nome;
            novaLinha.insertCell(2).textContent = curso.Sigla;
            console.log("Adicionado curso:", curso.Nome); // Debug 8
        });
        console.log("--- carregarCursos() finalizada com sucesso ---"); // Debug 9
    } catch (error) {
        console.error("Erro no processo de carregarCursos:", error); // Debug 10
        alert("Erro ao carregar cursos. Verifique o console para mais detalhes.");
    }
}

// Função para adicionar curso
async function adicionarCurso() {
    const nome = inputNomeCurso.value;
    const sigla = inputSiglaCurso.value;
    const id = parseInt(inputIdCurso.value, 10);

    if (!nome || !sigla || isNaN(id)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const novoCurso = { id, Nome: nome, Sigla: sigla };

    try {
        const resposta = await fetch(`${BASE_URL}/cursos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoCurso),
        });

        if (resposta.ok) {
            alert("Curso adicionado com sucesso!");
            carregarCursos();

            inputNomeCurso.value = "";
            inputSiglaCurso.value = "";
            inputIdCurso.value = "";
            formAdicionarCurso.style.display = "none";
        } else {
            const erroData = await resposta.json();
            alert(`Erro ao adicionar curso: ${erroData.erro || resposta.statusText}`);
            console.error("Erro ao adicionar curso:", resposta.status, erroData);
        }
    } catch (error) {
        console.error("Erro ao adicionar curso:", error);
        alert("Erro ao adicionar curso. Verifique o console para mais detalhes.");
    }
}

// Função para deletar curso
async function deletarCurso() {
    const id = parseInt(prompt("Digite o ID do curso para deletar:"));
    
    if (isNaN(id)) {
        alert("ID inválido. Por favor, digite um número.");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL}/cursos/${id}`, {
            method: "DELETE",
        });

        if (resposta.ok) {
            alert("Curso deletado com sucesso!");
            carregarCursos();
        } else {
            const erroData = await resposta.json();
            alert(`Erro ao deletar curso: ${erroData.error || resposta.statusText}`);
            console.error("Erro ao deletar curso:", resposta.status, erroData);
        }
    } catch (error) {
        console.error("Erro ao deletar curso:", error);
        alert("Erro ao deletar curso. Verifique o console para mais detalhes.");
    }
}

// Event Listeners específicos para a página de cursos
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded para listarcursos.html. Iniciando listeners e carregamento."); // Novo log

    if (btnAdicionarCurso) {
        btnAdicionarCurso.addEventListener("click", () => {
            console.log("Botão 'Adicionar Novo Curso' clicado. Alternando formulário."); // Novo log
            formAdicionarCurso.style.display = formAdicionarCurso.style.display === "none" ? "block" : "none";
        });
    } else {
        console.warn("Elemento 'btnAdicionarCurso' não encontrado."); // Warn se o botão não for encontrado
    }

    if (btnAdicionarCursoForm) {
        btnAdicionarCursoForm.addEventListener("click", adicionarCurso);
    } else {
        console.warn("Elemento 'btnAdicionarCursoForm' não encontrado.");
    }

    if (btnDeletarCurso) {
        btnDeletarCurso.addEventListener("click", deletarCurso);
    } else {
        console.warn("Elemento 'btnDeletarCurso' não encontrado.");
    }

    if (btnCancelarCurso) {
        btnCancelarCurso.addEventListener("click", () => {
            console.log("Botão 'Cancelar' clicado. Ocultando formulário e limpando campos."); // Novo log
            formAdicionarCurso.style.display = "none";
            inputNomeCurso.value = "";
            inputSiglaCurso.value = "";
            inputIdCurso.value = "";
        });
    } else {
        console.warn("Elemento 'btnCancelarCurso' não encontrado.");
    }

    // Chama a função para carregar os cursos quando a página é carregada
    carregarCursos(); 
});