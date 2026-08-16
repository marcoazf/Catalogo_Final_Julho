// Script de limpeza completa e versão de teste
console.log('[TESTE] Iniciando versão de teste...');

// 1. Limpa completamente o acervo
console.log('[TESTE] Limpando acervo...');
localStorage.clear();

if (typeof localforage !== 'undefined') {
    localforage.clear().then(() => {
        console.log('[TESTE] IndexedDB limpo');
    });
}

if ('caches' in window) {
    caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
        });
    });
}

// 2. Inicializa APP_STATE vazio
if (typeof window.APP_STATE !== 'undefined') {
    window.APP_STATE.movies = [];
    window.APP_STATE.currentView = 'filmes';
    window.APP_STATE.activeFilter = 'all';
    window.APP_STATE.searchQuery = '';
    window.APP_STATE.searchTimer = null;
    window.APP_STATE.selectedId = null;
    window.APP_STATE._editingId = null;
    console.log('[TESTE] APP_STATE limpo');
}

// 3. Funções de teste
window.testApp = function() {
    console.log('[TESTE] Testando app...');
    
    // Teste 1: Verifica se elementos existem
    const searchInput = document.getElementById('main-search');
    const searchBtn = document.querySelector('[data-onclick*="toggleSearchBar"]');
    const addBtn = document.querySelector('[data-onclick*="openModal"]');
    
    console.log('[TESTE] Elementos encontrados:', {
        searchInput: !!searchInput,
        searchBtn: !!searchBtn,
        addBtn: !!addBtn
    });
    
    // Teste 2: Testa busca
    if (searchInput) {
        console.log('[TESTE] Testando busca...');
        searchInput.value = 'teste';
        searchInput.dispatchEvent(new Event('input'));
        console.log('[TESTE] Busca disparada');
    }
    
    // Teste 3: Testa cadastro
    if (addBtn) {
        console.log('[TESTE] Testando cadastro...');
        addBtn.click();
        console.log('[TESTE] Modal aberto');
    }
    
    // Teste 4: Mostra estado atual
    console.log('[TESTE] Estado atual:', {
        movies: window.APP_STATE?.movies?.length || 0,
        view: window.APP_STATE?.currentView,
        search: window.APP_STATE?.searchQuery
    });
};

// 4. Aguarda carregamento completo e testa
window.addEventListener('load', () => {
    console.log('[TESTE] Página carregada, iniciando testes...');
    
    setTimeout(() => {
        console.log('[TESTE] Executando testes...');
        testApp();
        
        // Mostra mensagem de teste concluído
        setTimeout(() => {
            console.log('🎉 Teste concluído! Use window.testApp() para testar novamente.');
            console.log('📊 Status:');
            console.log('- ✅ Acervo limpo');
            console.log('- ✅ APP_STATE reiniciado');
            console.log('- ✅ Pronto para testar');
        }, 1000);
    }, 1000);
});