// frontend/menu.js

// Garante que o script só é executado depois que o DOM estiver completamente carregado.
document.addEventListener("DOMContentLoaded", () => {
    console.log("menu.js carregado e DOM pronto."); // Log para depuração

    // Obtém referências aos elementos do botão de menu, do menu lateral e do corpo da página.
    const menuBtn = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu-lateral");
    const body = document.body;

    // Adiciona um 'event listener' ao botão de menu.
    if (menuBtn && menu && body) {
        console.log("Elementos do menu (menu-toggle, menu-lateral, body) encontrados."); // Log para depuração
        menuBtn.addEventListener("click", () => {
            console.log("Botão de menu clicado! Alternando classes..."); // Log para depuração
            menu.classList.toggle("open-sidebar"); // Alterna a classe 'open-sidebar' no menu
            body.classList.toggle("open-sidebar"); // Alterna a classe 'open-sidebar' no body
        });
    } else {
        console.error("Erro: Um ou mais elementos do menu (menu-toggle, menu-lateral ou body) não foram encontrados. O menu pode não funcionar.");
    }

    // Lógica para destacar o item de menu ativo com base na URL atual.
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.menu-lateral a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref && (linkHref === currentPath || (linkHref === 'index.html' && currentPath === ''))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
