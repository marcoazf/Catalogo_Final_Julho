// Correção do botão de fechar e da função clearSearch
console.log('🔧 Corrigindo botão de fechar e clearSearch...');

// 1. Cria função clearSearch robusta
window.Logic = window.Logic || {};

window.Logic.clearSearch = function() {
    console.log('[LOGIC] clearSearch executado');
    
    // Limpa input
    const searchInput = document.getElementById('main-search');
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        console.log('[LOGIC] Input limpo');
    }
    
    // Fecha barra
    const searchContainer = document.getElementById('search-bar-container');
    if (searchContainer) {
        searchContainer.classList.remove('active');
        searchContainer.style.maxHeight = '0';
        searchContainer.style.opacity = '0';
        searchContainer.style.padding = '0';
        searchContainer.style.overflow = 'hidden';
        console.log('[LOGIC] Barra fechada');
    }
    
    // Limpa estado de busca
    if (typeof window.APP_STATE !== 'undefined') {
        window.APP_STATE.searchQuery = '';
        console.log('[LOGIC] Estado de busca limpo');
    }
    
    return true;
};

// 2. Encontra e corrige botão de fechar
const closeBtn = document.querySelector('[onclick*="clearSearch"], [data-onclick*="clearSearch"], button:has(i.fa-times), button:has(i.x)');

if (closeBtn) {
    console.log('✅ Botão de fechar encontrado:', closeBtn);
    
    // Remove binding existente
    closeBtn.removeAttribute('onclick');
    closeBtn.removeAttribute('data-onclick');
    
    // Adiciona binding correto
    closeBtn.onclick = function(e) {
        console.log('[BOTÃO FECHAR] Botão de fechar clicado');
        window.Logic.clearSearch();
        e.preventDefault();
        return false;
    };
    
    console.log('✅ Botão de fechar corrigido');
} else {
    console.log('❌ Botão de fechar não encontrado, criando temporário');
    
    // Cria botão de fechar temporário
    const tempCloseBtn = document.createElement('button');
    tempCloseBtn.innerHTML = '✕';
    tempCloseBtn.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 18px; cursor: pointer; color: #666;';
    tempCloseBtn.onclick = function() {
        window.Logic.clearSearch();
    };
    
    const searchContainer = document.getElementById('search-bar-container');
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(tempCloseBtn);
        console.log('✅ Botão de fechar temporário criado');
    }
}

// 3. Corrige botão de voltar (seta)
const backBtn = document.querySelector('button:has(i.fa-arrow-left), button:has(i.arrow-left)');

if (backBtn) {
    console.log('✅ Botão de voltar encontrado:', backBtn);
    
    // Remove binding existente
    backBtn.removeAttribute('onclick');
    backBtn.removeAttribute('data-onclick');
    
    // Adiciona binding correto
    backBtn.onclick = function(e) {
        console.log('[BOTÃO VOLTAR] Botão de voltar clicado');
        window.Logic.clearSearch();
        e.preventDefault();
        return false;
    };
    
    console.log('✅ Botão de voltar corrigido');
}

// 4. Testa as funções
console.log('🧪 Testando funções...');
window.Logic.clearSearch();

console.log('🎉 Correção concluída!');

// 5. Função global para testes
window.testSearchClose = function() {
    console.log('🧪 Teste de fechar barra...');
    window.Logic.clearSearch();
};