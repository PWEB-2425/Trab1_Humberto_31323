// frontend/menu.js

// Garante que o script só é executado depois que o DOM estiver completamente carregado.
document.addEventListener("DOMContentLoaded", () => {
    console.log("menu.js: DOMContentLoaded - Script carregado e DOM pronto."); // Log para depuração

    // Obtém referências aos elementos do botão de menu, do menu lateral e do corpo da página.
    const menuBtn = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu-lateral");
    const body = document.body;

    // Adiciona um 'event listener' ao botão de menu.
    if (menuBtn && menu && body) {
        console.log("menu.js: Elementos do menu (menu-toggle, menu-lateral, body) encontrados. Configurando event listener."); // Log para depuração
        menuBtn.addEventListener("click", () => {
            console.log("menu.js: Botão de menu clicado! Alternando classes..."); // Log para depuração
            menu.classList.toggle("open-sidebar"); // Alterna a classe 'open-sidebar' no menu
            body.classList.toggle("open-sidebar"); // Alterna a classe 'open-sidebar' no body
            console.log("menu.js: Classes alternadas. Estado atual do menu:", menu.classList.contains("open-sidebar") ? "ABERTO" : "FECHADO");
            console.log("menu.js: Estado atual do body:", body.classList.contains("open-sidebar") ? "COM MARGEM" : "SEM MARGEM");
        });
    } else {
        console.error("menu.js: Erro! Um ou mais elementos do menu (menu-toggle, menu-lateral ou body) não foram encontrados. O menu pode não funcionar.");
        if (!menuBtn) console.error("menu.js: #menu-toggle não encontrado.");
        if (!menu) console.error("menu.js: #menu-lateral não encontrado.");
        // O body sempre deve existir, mas o log ajuda a confirmar
    }

    // Lógica para destacar o item de menu ativo com base na URL atual.
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.menu-lateral a');
    console.log("menu.js: Caminho atual da URL:", currentPath);

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref) {
            const linkFileName = linkHref.split('/').pop(); // Pega apenas o nome do arquivo do href
            if (linkFileName === currentPath || (linkFileName === 'index.html' && currentPath === '')) {
                link.classList.add('active');
                console.log(`menu.js: Link ativo definido para: ${linkHref}`);
            } else {
                link.classList.remove('active');
            }
        }
    });
});
