document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginUsernameInput = document.getElementById("loginUsername");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");

    // URL do seu backend (certifique-se de que o caminho esteja correto)
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
        ? "http://localhost:3000"
        : "https://trab1-humberto-31323-58n5.onrender.com"; // Ajuste para a URL correta da sua API

    // Envia o formulário para o backend
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Impede o envio tradicional do formulário

        const login = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();

        loginMessage.textContent = ""; // Limpa mensagens anteriores

        // Verificação simples para garantir que os campos não estão vazios
        if (!login || !password) {
            loginMessage.textContent = "Por favor, preencha ambos os campos.";
            loginMessage.style.color = "red";
            return;
        }

        try {
            // Envia a requisição POST para o servidor
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ login, password }), // Envia os dados de login
            });

            const data = await response.json();

            // Verifica se a resposta foi bem-sucedida
            if (response.ok) {
                loginMessage.style.color = "green";
                loginMessage.textContent = data.message || "Login bem-sucedido! Redirecionando...";

                // Armazena o token no localStorage (se a resposta incluir o token)
                localStorage.setItem("accessToken", data.token);

                // Redireciona após 1 segundo para o menu inicial
                setTimeout(() => {
                    window.location.href = "menuinicial.html"; // Ajuste para a página correta
                }, 1000); 
            } else {
                loginMessage.style.color = "red";
                loginMessage.textContent = data.error || "Erro de login!";
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            loginMessage.style.color = "red";
            loginMessage.textContent = "Erro ao conectar ao servidor. Tente novamente.";
        }
    });
});
