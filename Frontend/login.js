// frontend/login.js

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('172.16.') || window.location.hostname.startsWith('10.')
    ? "http://localhost:3000" // Se estiver em localhost ou IP local, usa o backend local
    : "https://trab1-humberto-31323-58n5.onrender.com"; // URL do backend no Render

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");          
    const loginUsernameInput = document.getElementById("loginUsername");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Impede o comportamento padrão de recarregar a página

            const username = loginUsernameInput.value;
            const password = loginPasswordInput.value;

            loginMessage.textContent = ""; // Limpa mensagens anteriores

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ login: username, password: password }),
                });

                const data = await response.json();

                if (response.ok) {
                    loginMessage.style.color = "green"; // Mensagem de sucesso em verde
                    loginMessage.textContent = "Login bem-sucedido! Redirecionando...";
                    console.log("Login bem-sucedido:", data.message);

                    setTimeout(() => {
                        window.location.href = "dashboard.html"; // Redireciona após 1 segundo
                    }, 1000);
                } else {
                    loginMessage.style.color = "red"; // Mensagem de erro em vermelho
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
