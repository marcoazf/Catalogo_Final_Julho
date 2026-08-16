// Correção do binding do botão de pesquisa
console.log('🔧 Corrigindo binding do botão de pesquisa...');

// 1. Encontra todos os botões que podem ser de pesquisa
const allButtons = document.querySelectorAll('button');
let searchButton = null;

// Procura botões com texto ou ícone de pesquisa
allButtons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    const icon = btn.innerHTML.toLowerCase();
    
    if (text.includes('pesquisar') || text.includes('search') || 
        icon.includes('search') || icon.includes('🔍') || icon.includes('fas fa-search')) {
        searchButton = btn;
        console.log('✅ Botão de pesquisa encontrado por texto/ícone:', btn);
    }
});

// 2. Se não encontrou, procura por data attributes
if (!searchButton) {
    searchButton = document.querySelector('[data-onclick*="search"], [onclick*="search"], [data-onclick*="toggleSearchBar"], [onclick*="toggleSearchBar"]');
    if (searchButton) {
        console.log('✅ Botão de pesquisa encontrado por data attribute:', searchButton);
    }
}

// 3. Se ainda não encontrou, procura por botões perto do header
if (!searchButton) {
    const header = document.querySelector('header');
    if (header) {
        const headerButtons = header.querySelectorAll('button');
        headerButtons.forEach(btn => {
            if (!searchButton && btn.closest('header')) {
                searchButton = btn;
                console.log('✅ Botão de pesquisa encontrado no header:', btn);
            }
        });
    }
}

// 4. Se encontrou, corrige o binding
if (searchButton) {
    console.log('🔧 Corrigindo binding do botão...');
    
    // Remove qualquer binding existente
    searchButton.removeAttribute('data-onclick');
    searchButton.removeAttribute('onclick');
    
    // Adiciona binding correto
    searchButton.onclick = function(e) {
        console.log('[BOTÃO] Botão de pesquisa clicado!');
        
        // Força abertura da barra
        const container = document.getElementById('search-bar-container');
        if (container) {
            container.classList.add('active');
            container.style.maxHeight = '100px';
            container.style.opacity = '1';
            container.style.padding = '1rem 2rem';
            container.style.overflow = 'visible';
            
            // Foca no input
            const input = document.getElementById('main-search');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
        
        e.preventDefault();
        return false;
    };
    
    console.log('✅ Binding do botão corrigido!');
    
    // Testa o botão
    console.log('🧪 Testando botão corrigido...');
    searchButton.click();
    
} else {
    console.log('❌ Nenhum botão de pesquisa encontrado');
    
    // Cria botão de pesquisa temporário
    const tempBtn = document.createElement('button');
    tempBtn.textContent = '🔍 Pesquisar';
    tempBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px; background: blue; color: white; border: none; border-radius: 5px; cursor: pointer;';
    tempBtn.onclick = function() {
        const container = document.getElementById('search-bar-container');
        if (container) {
            container.classList.add('active');
            container.style.maxHeight = '100px';
            container.style.opacity = '1';
            container.style.padding = '1rem 2rem';
            container.style.overflow = 'visible';
            
            const input = document.getElementById('main-search');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    };
    
    document.body.appendChild(tempBtn);
    console.log('✅ Botão temporário criado');
}

// 5. Função global para testes
window.testSearchButton = function() {
    console.log('🧪 Teste do botão de pesquisa...');
    if (searchButton) {
        searchButton.click();
    } else {
        console.log('❌ Botão não encontrado');
    }
};

console.log('🎉 Correção concluída! Execute window.testSearchButton() para testar.');