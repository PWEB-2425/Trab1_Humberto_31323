async function carregarAlunos() {
    console.log("--- carregarAlunos() iniciada ---");
    if (!tabelaAlunosTbody) {
        console.error("Erro: `tabelaAlunosTbody` é null. Impossível carregar alunos na tabela.");
        return;
    }
    
    // Exibir o spinner antes de carregar os dados
    document.getElementById('loadingMessage').style.display = 'block';

    try {
        const resposta = await fetch(`${API_BASE_URL}/alunos`);
        
        if (!resposta.ok) {
            const erroDetalhes = await resposta.text();
            console.error(`[FETCH ALUNOS ERROR] Erro HTTP! Status: ${resposta.status} (${resposta.statusText})`, erroDetalhes);
            showMessage(`Erro ao carregar alunos: ${resposta.status} - ${resposta.statusText}.`, 'error');
            return;
        }

        const alunos = await resposta.json();
        console.log("[FETCH ALUNOS] Dados de alunos recebidos:", alunos);
        
        // Limpar a tabela e esconder o spinner
        tabelaAlunosTbody.innerHTML = '';
        document.getElementById('loadingMessage').style.display = 'none';

        if (alunos.length === 0) {
            showMessage("Nenhum aluno cadastrado.", 'info');
            const novaLinha = tabelaAlunosTbody.insertRow();
            const celulaMensagem = novaLinha.insertCell(0);
            celulaMensagem.colSpan = 5;
            celulaMensagem.textContent = "Nenhum aluno cadastrado.";
            celulaMensagem.style.textAlign = "center";
            return;
        }

        alunos.forEach(aluno => {
            const novaLinha = tabelaAlunosTbody.insertRow();
            novaLinha.insertCell(0).textContent = aluno.id;
            novaLinha.insertCell(1).textContent = aluno.Nome;
            novaLinha.insertCell(2).textContent = aluno.Apelido;
            novaLinha.insertCell(3).textContent = aluno.Curso;
            novaLinha.insertCell(4).textContent = aluno.Ano_Curricular;
        });
    } catch (error) {
        console.error("[CATCH ALUNOS ERROR] Erro no processo de carregarAlunos:", error);
        showMessage("Erro inesperado ao carregar alunos. Verifique o console do navegador.", 'error');
    }
}
