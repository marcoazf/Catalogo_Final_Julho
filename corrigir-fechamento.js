// Correção do Fechamento da Barra de Pesquisa
console.log('🔧 Corrigindo fechamento da barra de pesquisa...');

// Encontra o botão de pesquisa que criamos
const searchButton = document.querySelector('button[style*="position: fixed"][style*="top: 10px"][style*="right: 10px"]');

if (searchButton) {
    console.log('✅ Botão de pesquisa encontrado');
    
    // Corrige a função de clique para abrir/fechar corretamente
    searchButton.onclick = function() {
        console.log('🔍 Botão clicado!');
        
        // Encontra a barra de pesquisa
        const searchBar = document.getElementById('search-bar-container');
        
        if (searchBar) {
            console.log('✅ Barra encontrada');
            
            // Verifica se está aberta
            const isOpen = searchBar.style.maxHeight && searchBar.style.maxHeight !== '0px';
            
            if (isOpen) {
                // Fecha a barra
                searchBar.style.maxHeight = '0px';
                searchBar.style.opacity = '0';
                searchBar.style.padding = '0';
                searchBar.style.overflow = 'hidden';
                this.textContent = '🔍 PESQUISAR';
                console.log('📤 Barra fechada');
                
                // Remove foco do input
                const searchInput = document.getElementById('main-search');
                if (searchInput) {
                    searchInput.blur();
                }
                
            } else {
                // Abre a barra
                searchBar.style.maxHeight = '120px';
                searchBar.style.opacity = '1';
                searchBar.style.padding = '20px';
                searchBar.style.overflow = 'visible';
                this.textContent = '✕ FECHAR';
                console.log('📥 Barra aberta');
                
                // Foca no input
                const searchInput = document.getElementById('main-search');
                if (searchInput) {
                    setTimeout(() => {
                        searchInput.focus();
                        console.log('🎯 Input focado');
                    }, 200);
                }
            }
        } else {
            console.log('❌ Barra não encontrada');
        }
        
        return false;
    };
    
    console.log('✅ Função do botão corrigida');
    
    // Testa o botão
    console.log('🧠 Testando abertura...');
    searchButton.click();
    
    setTimeout(() => {
        console.log('🧠 Testando fechamento...');
        searchButton.click();
    }, 2000);
    
} else {
    console.log('❌ Botão não encontrado, criando novo...');
    
    // Cria botão novo com função correta
    const newSearchButton = document.createElement('button');
    newSearchButton.textContent = '🔍 PESQUISAR';
    newSearchButton.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        right: 10px !important;
        z-index: 999999 !important;
        padding: 15px 25px !important;
        background: #ff4444 !important;
        color: white !important;
        border: 3px solid #cc0000 !important;
        border-radius: 12px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        box-shadow: 0 6px 20px rgba(255,0,0,0.4) !important;
    `;
    
    newSearchButton.onclick = function() {
        const searchBar = document.getElementById('search-bar-container');
        if (searchBar) {
            const isOpen = searchBar.style.maxHeight && searchBar.style.maxHeight !== '0px';
            if (isOpen) {
                searchBar.style.maxHeight = '0px';
                searchBar.style.opacity = '0';
                searchBar.style.padding = '0';
                searchBar.style.overflow = 'hidden';
                this.textContent = '🔍 PESQUISAR';
            } else {
                searchBar.style.maxHeight = '120px';
                searchBar.style.opacity = '1';
                searchBar.style.padding = '20px';
                searchBar.style.overflow = 'visible';
                this.textContent = '✕ FECHAR';
                
                const input = document.getElementById('main-search');
                if (input) setTimeout(() => input.focus(), 200);
            }
        }
    };
    
    document.body.appendChild(newSearchButton);
    console.log('✅ Novo botão criado');
}

// Cria função global para testar
window.testSearchToggle = function() {
    console.log('🧠 Teste manual do toggle...');
    const btn = document.querySelector('button[style*="position: fixed"][style*="top: 10px"][style*="right: 10px"]');
    if (btn) btn.click();
};

console.log('🎉 Correção concluída!');
console.log('Execute window.testSearchToggle() para testar manualmente');