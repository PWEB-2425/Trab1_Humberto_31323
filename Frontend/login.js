document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginUsernameInput = document.getElementById("loginUsername");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
        ? "http://localhost:3000"
        : "https://trab1-humberto-31323-58n5.onrender.com";

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Impede o comportamento padrão de enviar o formulário

        // Captura os valores dos inputs
        const login = loginUsernameInput.value;
        const password = loginPasswordInput.value;

        loginMessage.textContent = ""; // Limpa qualquer mensagem anterior

        try {
            // Faz uma requisição POST para o backend para validar o login
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ login, password }),
            });

            const data = await response.json();

            if (response.ok) {
                loginMessage.style.color = "green";
                loginMessage.textContent = data.message || "Login bem-sucedido! Redirecionando...";

                // Redireciona para o menu inicial após um pequeno atraso
                setTimeout(() => {
                    window.location.href = "menuinicial.html"; // Redirecionamento para menu inicial
                }, 1000); // Atraso de 1 segundo (1000ms)
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
