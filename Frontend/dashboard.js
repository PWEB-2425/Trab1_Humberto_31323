document.addEventListener("DOMContentLoaded", () => {
    const searchAlunoInput = document.getElementById("searchAlunoInput");
    const searchCursoInput = document.getElementById("searchCursoInput");

    const alunosSearchResultsDiv = document.getElementById("alunosSearchResults");
    const cursosSearchResultsDiv = document.getElementById("cursosSearchResults");

    const noAlunoResultsMessage = document.getElementById("noAlunoResults");
    const noCursoResultsMessage = document.getElementById("noCursoResults");

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
        ? "http://localhost:3000"
        : "https://trab1-humberto-31323-58n5.onrender.com";

    // Função para buscar alunos da API
    async function fetchAlunos(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/alunos`);
            const alunos = await response.json();

            if (!response.ok || !Array.isArray(alunos)) {
                showMessage("Erro ao buscar alunos", "error");
                return;
            }

            const filteredAlunos = alunos.filter(aluno => 
                aluno.Nome.toLowerCase().includes(query.toLowerCase()) ||
                aluno.Apelido.toLowerCase().includes(query.toLowerCase()) ||
                aluno.id.toString().includes(query)
            );

            if (filteredAlunos.length === 0) {
                noAlunoResultsMessage.style.display = 'block';
                alunosSearchResultsDiv.innerHTML = '';
            } else {
                noAlunoResultsMessage.style.display = 'none';
                alunosSearchResultsDiv.innerHTML = filteredAlunos.map(aluno => 
                    `<div class="list-group-item">
                        <strong>ID: ${aluno.id}</strong> - ${aluno.Nome} ${aluno.Apelido}
                    </div>`
                ).join('');
            }

        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
            showMessage("Erro ao conectar ao servidor. Tente novamente.", "error");
        }
    }

    // Função para buscar cursos da API
    async function fetchCursos(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/cursos`);
            const cursos = await response.json();

            if (!response.ok || !Array.isArray(cursos)) {
                showMessage("Erro ao buscar cursos", "error");
                return;
            }

            const filteredCursos = cursos.filter(curso => 
                curso.Nome.toLowerCase().includes(query.toLowerCase()) ||
                curso.Sigla.toLowerCase().includes(query.toLowerCase()) ||
                curso.id.toString().includes(query)
            );

            if (filteredCursos.length === 0) {
                noCursoResultsMessage.style.display = 'block';
                cursosSearchResultsDiv.innerHTML = '';
            } else {
                noCursoResultsMessage.style.display = 'none';
                cursosSearchResultsDiv.innerHTML = filteredCursos.map(curso => 
                    `<div class="list-group-item">
                        <strong>ID: ${curso.id}</strong> - ${curso.Nome} (${curso.Sigla})
                    </div>`
                ).join('');
            }

        } catch (error) {
            console.error("Erro ao buscar cursos:", error);
            showMessage("Erro ao conectar ao servidor. Tente novamente.", "error");
        }
    }

    // Função para exibir mensagens de erro, sucesso ou informação
    function showMessage(message, type = 'info') {
        const messageDisplay = document.getElementById('messageDisplay');
        if (messageDisplay) {
            messageDisplay.textContent = message;
            messageDisplay.className = `message ${type}`;
            setTimeout(() => {
                messageDisplay.textContent = '';
                messageDisplay.className = 'message';
            }, 5000);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Listener de evento para a pesquisa de alunos
    searchAlunoInput.addEventListener("input", () => {
        fetchAlunos(searchAlunoInput.value);
    });

    // Listener de evento para a pesquisa de cursos
    searchCursoInput.addEventListener("input", () => {
        fetchCursos(searchCursoInput.value);
    });
});
