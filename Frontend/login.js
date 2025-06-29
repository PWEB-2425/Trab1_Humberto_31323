document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    // Envia os dados para o servidor para verificar o login
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert('Login realizado com sucesso!');
        localStorage.setItem('user', login);  // Armazena o login no localStorage
        window.location.href = '/home';  // Redireciona para a página inicial (home)
      } else {
        alert('Login ou senha incorretos!');
      }
    })
    .catch(error => {
      alert('Erro na autenticação!');
      console.error('Erro ao autenticar:', error);
    });
  });
});