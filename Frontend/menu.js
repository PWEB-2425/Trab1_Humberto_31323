// frontend/menu.js

// Garante que o script só é executado depois que o DOM estiver completamente carregado.
document.addEventListener("DOMContentLoaded", () => {
    // Obtém referências aos elementos do botão de menu, do menu lateral e do corpo da página.
    const menuBtn = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu-lateral");
    const body = document.body;

    // Adiciona um 'event listener' ao botão de menu.
    // Quando o botão é clicado, ele alterna as classes CSS para abrir/fechar o menu
    // e ajustar o layout do corpo da página.
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            menu.classList.toggle("open"); // Adiciona ou remove a classe 'open' no menu lateral.
            body.classList.toggle("menu-aberto"); // Adiciona ou remove a classe 'menu-aberto' no body.
        });
    } else {
        // Aviso no console se o botão do menu não for encontrado, útil para depuração.
        console.warn("Elemento 'menu-toggle' não encontrado. O botão do menu pode não funcionar.");
    }

    // Lógica para destacar o item de menu ativo com base na URL atual.
    // Isso ajuda o utilizador a saber em que página está.
    const currentPath = window.location.pathname.split('/').pop(); // Extrai o nome do ficheiro HTML atual da URL.
    const navLinks = document.querySelectorAll('.menu-lateral a'); // Seleciona todos os links de navegação dentro do menu lateral.

    // Itera sobre cada link de navegação.
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href'); // Obtém o valor do atributo 'href' do link.
        // Compara o 'href' do link com o caminho atual da página.
        // Também lida com o caso em que a página inicial pode ser referenciada por 'index.html' ou por uma string vazia (raiz).
        if (linkHref && (linkHref === currentPath || (linkHref === 'index.html' && currentPath === ''))) {
            link.classList.add('active'); // Adiciona a classe 'active' se o link for da página atual.
        } else {
            link.classList.remove('active'); // Remove a classe 'active' caso contrário.
        }
    });
});
