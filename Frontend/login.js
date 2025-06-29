// frontend/login.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginUsernameInput = document.getElementById("loginUsername");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const username = loginUsernameInput.value;
            const password = loginPasswordInput.value;

            loginMessage.textContent = ""; // Limpa mensagens anteriores

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ login: username, password: password }),
                });

                const data = await response.json();

                if (response.ok) {
                    loginMessage.style.color = "green";
                    loginMessage.textContent = "Login bem-sucedido! Redirecionando...";
                    console.log("Login bem-sucedido:", data.message);
                    // Redireciona para o dashboard após um pequeno atraso para o utilizador ver a mensagem
                    setTimeout(() => {
                        window.location.href = "dashboard.html"; // OU "index.html" se esse for o seu menu inicial principal após login
                    }, 1000); // 1 segundo de atraso
                } else {
                    loginMessage.style.color = "red";
                    loginMessage.textContent = data.error || "Erro de login.";
                    console.error("Erro de login:", data.error || response.statusText);
                }
            } catch (error) {
                loginMessage.style.color = "red";
                loginMessage.textContent = "Erro ao conectar ao servidor. Tente novamente.";
                console.error("Erro na requisição de login:", error);
            }
        });
    } else {
        console.error("Elemento 'loginForm' não encontrado.");
    }
});
