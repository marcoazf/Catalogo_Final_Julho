// Script de depuração para testar a busca
console.log('[DEBUG] Iniciando depuração da busca...');

// Verifica se o elemento existe
const searchInput = document.getElementById('main-search');
console.log('[DEBUG] Elemento main-search:', searchInput);

if (searchInput) {
    console.log('[DEBUG] Valor atual:', searchInput.value);
    console.log('[DEBUG] Atributo data-oninput:', searchInput.getAttribute('data-oninput'));
    
    // Testa manualmente a função
    window.testSearch = function(value) {
        console.log('[DEBUG] Testando busca com valor:', value);
        
        // Simula o que a handleSearch faz
        clearTimeout(window.APP_STATE?.searchTimer);
        
        if (value && value.trim().length >= 3) {
            console.log('[DEBUG] Buscando por:', value);
            // Aqui você pode adicionar mais lógica de depuração
        } else {
            console.log('[DEBUG] Valor muito curto para busca');
        }
    };
    
    // Adiciona um listener de teste
    searchInput.addEventListener('input', function(e) {
        console.log('[DEBUG] Evento input disparado!', e.target.value);
        window.testSearch(e.target.value);
    });
    
    // Testa se o bind está funcionando
    const boundHandler = searchInput.oninput;
    console.log('[DEBUG] Handler bindado:', boundHandler);
    
} else {
    console.error('[DEBUG] Elemento main-search não encontrado!');
}

// Verifica se Logic.handleSearch existe
if (typeof window.Logic !== 'undefined' && window.Logic.handleSearch) {
    console.log('[DEBUG] Logic.handleSearch existe:', window.Logic.handleSearch);
} else {
    console.error('[DEBUG] Logic.handleSearch NÃO existe!');
}

// Verifica APP_STATE
if (typeof window.APP_STATE !== 'undefined') {
    console.log('[DEBUG] APP_STATE existe');
} else {
    console.error('[DEBUG] APP_STATE NÃO existe!');
}