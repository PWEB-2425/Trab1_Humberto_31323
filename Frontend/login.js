// frontend/login.js

// Adiciona um 'event listener' para o evento 'DOMContentLoaded'.
// Isso garante que o script só será executado quando todo o HTML da página tiver sido
// completamente carregado e parseado, evitando erros ao tentar aceder elementos que ainda não existem.
document.addEventListener("DOMContentLoaded", () => {
    // Obtém referências aos elementos HTML da página de login usando seus IDs.
    // Isso permite que o JavaScript manipule esses elementos, como ler valores de inputs
    // ou exibir mensagens de status.
    const loginForm = document.getElementById("loginForm");             // O formulário de login completo.
    const loginUsernameInput = document.getElementById("loginUsername"); // Campo de entrada para o nome de usuário.
    const loginPasswordInput = document.getElementById("loginPassword"); // Campo de entrada para a senha.
    const loginMessage = document.getElementById("loginMessage");       // Parágrafo onde as mensagens de status (sucesso/erro) serão exibidas.

    // Verifica se o formulário de login foi encontrado na página.
    // Isso é uma boa prática para evitar erros se o script for carregado em uma página onde o elemento não existe.
    if (loginForm) {
        // Adiciona um 'event listener' para o evento 'submit' do formulário.
        // Quando o formulário é submetido (ex: clicando no botão "Entrar" ou pressionando Enter),
        // a função assíncrona é executada.
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Impede o comportamento padrão do navegador de recarregar a página ao submeter o formulário.

            // Obtém os valores atuais dos campos de nome de usuário e senha.
            const username = loginUsernameInput.value;
            const password = loginPasswordInput.value;

            loginMessage.textContent = ""; // Limpa qualquer mensagem de status anterior que possa estar visível.

            try {
                // Faz uma requisição HTTP POST assíncrona para o endpoint de login do seu backend.
                // A URL deve corresponder à rota definida no seu `server.js` (neste caso, "http://localhost:3000/login").
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST", // Define o método da requisição como POST.
                    headers: {
                        // Define o cabeçalho 'Content-Type' para indicar que o corpo da requisição é JSON.
                        "Content-Type": "application/json",
                    },
                    // Converte o objeto JavaScript `{ login: username, password: password }` em uma string JSON
                    // para ser enviado como corpo da requisição.
                    body: JSON.stringify({ login: username, password: password }),
                });

                // Analisa a resposta JSON recebida do servidor.
                const data = await response.json();

                // Verifica se a resposta HTTP foi bem-sucedida (status 2xx, como 200 OK).
                if (response.ok) {
                    loginMessage.style.color = "green"; // Define a cor da mensagem para verde (sucesso).
                    loginMessage.textContent = "Login bem-sucedido! Redirecionando..."; // Exibe a mensagem de sucesso.
                    console.log("Login bem-sucedido:", data.message); // Loga a mensagem de sucesso no console do navegador.
                    
                    // Redireciona o utilizador para o dashboard (ou a página inicial) após um pequeno atraso.
                    // Isso permite que o utilizador veja a mensagem de sucesso antes de ser redirecionado.
                    setTimeout(() => {
                        window.location.href = "dashboard.html"; // Altera a URL do navegador para 'dashboard.html'.
                                                                 // OU "index.html" se esse for o seu menu inicial principal após login.
                    }, 1000); // Atraso de 1 segundo (1000 milissegundos).
                } else {
                    // Se a resposta não foi bem-sucedida (ex: status 401 Unauthorized, 400 Bad Request).
                    loginMessage.style.color = "red"; // Define a cor da mensagem para vermelho (erro).
                    // Exibe a mensagem de erro do servidor, ou uma mensagem genérica se não houver.
                    loginMessage.textContent = data.error || "Erro de login.";
                    console.error("Erro de login:", data.error || response.statusText); // Loga o erro no console.
                }
            } catch (error) {
                // Captura erros que ocorram durante a requisição (ex: problemas de rede, servidor offline).
                loginMessage.style.color = "red"; // Define a cor da mensagem para vermelho.
                loginMessage.textContent = "Erro ao conectar ao servidor. Tente novamente."; // Mensagem de erro de conexão.
                console.error("Erro na requisição de login:", error); // Loga o erro completo no console.
            }
        });
    } else {
        console.error("Elemento 'loginForm' não encontrado."); // Avisa no console se o formulário não for encontrado.
    }
});
