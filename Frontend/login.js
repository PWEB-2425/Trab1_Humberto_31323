document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    if (login === 'admin' && password === 'admin') {
      alert('Login realizado com sucesso!');
      localStorage.setItem('user', login);
      window.location.href = 'index.html';
    } else {
      alert('Login ou senha incorretos!');
    }
  });
});