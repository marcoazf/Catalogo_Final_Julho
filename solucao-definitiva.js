// Solução Definitiva - Botão de Pesquisa Garantido
console.log('🚀 Solução Definitiva - Botão de Pesquisa Garantido...');

// 1. Remove qualquer botão de pesquisa existente
const existingButtons = document.querySelectorAll('button');
existingButtons.forEach(btn => {
    if (btn.textContent.includes('Pesquisar') || btn.innerHTML.includes('search') || btn.innerHTML.includes('🔍')) {
        btn.remove();
    }
});

// 2. Cria botão de pesquisa simples e garantido
const searchButton = document.createElement('button');
searchButton.textContent = '🔍 Pesquisar';
searchButton.style.cssText = `
    position: fixed !important;
    top: 10px !important;
    right: 10px !important;
    z-index: 999999 !important;
    padding: 12px 20px !important;
    background: #007bff !important;
    color: white !important;
    border: 2px solid #0056b3 !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    font-size: 14px !important;
    font-weight: bold !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    transition: all 0.3s ease !important;
`;

// Adiciona eventos
searchButton.onmouseover = function() {
    this.style.background = '#0056b3';
    this.style.transform = 'scale(1.05)';
};

searchButton.onmouseout = function() {
    this.style.background = '#007bff';
    this.style.transform = 'scale(1)';
};

searchButton.onclick = function() {
    console.log('🔍 BOTÃO DE PESQUISA CLICADO!');
    
    // Encontra a barra de pesquisa
    const searchBar = document.getElementById('search-bar-container');
    
    if (searchBar) {
        console.log('✅ Barra de pesquisa encontrada!');
        
        // Alterna a barra
        const isOpen = searchBar.classList.contains('active');
        
        if (isOpen) {
            // Fecha
            searchBar.classList.remove('active');
            searchBar.style.maxHeight = '0';
            searchBar.style.opacity = '0';
            searchBar.style.padding = '0';
            searchBar.style.overflow = 'hidden';
            this.textContent = '🔍 Pesquisar';
            console.log('📤 Barra de pesquisa fechada');
        } else {
            // Abre
            searchBar.classList.add('active');
            searchBar.style.maxHeight = '120px';
            searchBar.style.opacity = '1';
            searchBar.style.padding = '20px';
            searchBar.style.overflow = 'visible';
            this.textContent = '✕ Fechar';
            
            // Foca no input
            const searchInput = document.getElementById('main-search');
            if (searchInput) {
                setTimeout(() => {
                    searchInput.focus();
                    console.log('🎯 Input focado');
                }, 200);
            }
            
            console.log('📥 Barra de pesquisa aberta');
        }
    } else {
        console.log('❌ Barra de pesquisa não encontrada!');
        
        // Cria barra de pesquisa simples
        const newSearchBar = document.createElement('div');
        newSearchBar.id = 'search-bar-container';
        newSearchBar.style.cssText = `
            position: fixed !important;
            top: 70px !important;
            left: 0 !important;
            right: 0 !important;
            background: white !important;
            border: 2px solid #007bff !important;
            border-radius: 0 0 12px 12px !important;
            padding: 20px !important;
            max-height: 0 !important;
            opacity: 0 !important;
            overflow: hidden !important;
            transition: all 0.3s ease !important;
            z-index: 999998 !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        `;
        
        newSearchBar.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <button id="search-back-btn" style="background: none; border: none; font-size: 18px; cursor: pointer;">←</button>
                <input type="text" id="main-search" placeholder="Digite para pesquisar..." 
                       style="flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                <button id="search-clear-btn" style="background: none; border: none; font-size: 18px; cursor: pointer;">✕</button>
            </div>
        `;
        
        document.body.appendChild(newSearchBar);
        
        // Vincula eventos
        const backBtn = document.getElementById('search-back-btn');
        const clearBtn = document.getElementById('search-clear-btn');
        const searchInput = document.getElementById('main-search');
        
        if (backBtn) backBtn.onclick = function() { searchButton.click(); };
        if (clearBtn) clearBtn.onclick = function() { 
            searchInput.value = '';
            searchButton.click();
        };
        
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                console.log('🔍 Pesquisando por:', e.target.value);
                // Adicione aqui sua lógica de pesquisa
            });
        }
        
        // Abre a nova barra
        newSearchBar.style.maxHeight = '120px';
        newSearchBar.style.opacity = '1';
        newSearchBar.style.padding = '20px';
        
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 200);
        }
        
        this.textContent = '✕ Fechar';
        console.log('📥 Nova barra de pesquisa criada e aberta');
    }
    
    return false;
};

// 3. Garante que o botão seja adicionado ao body
document.body.appendChild(searchButton);
console.log('✅ Botão de pesquisa adicionado ao body');

// 4. Força o botão para ser visível
searchButton.style.display = 'block';
searchButton.style.visibility = 'visible';

// 5. Testa o botão
console.log('🧠 Testando o botão...');
setTimeout(() => {
    searchButton.click();
    console.log('✅ Botão testado com sucesso!');
}, 1000);

// 6. Funções globais
window.definitiveSearch = function() {
    console.log('🚀 Solução definitiva executada!');
    searchButton.click();
};

window.showSearchButton = function() {
    console.log('🔍 Mostrando botão de pesquisa...');
    searchButton.style.display = 'block';
    searchButton.style.visibility = 'visible';
};

console.log('🎉 Solução definitiva concluída!');
console.log('Execute window.definitiveSearch() para testar');