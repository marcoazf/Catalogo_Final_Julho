// Teste rápido da funcionalidade de busca
console.log('🧪 Teste da barra de pesquisa...');

// Verifica se os elementos existem
const searchBtn = document.querySelector('[data-onclick*="toggleSearchBar"]');
const searchContainer = document.getElementById('search-bar-container');
const searchInput = document.getElementById('main-search');

console.log('Elementos encontrados:', {
    searchBtn: !!searchBtn,
    searchContainer: !!searchContainer,
    searchInput: !!searchInput
});

// Teste 1: Clicar no botão de busca
if (searchBtn) {
    console.log('✅ Teste 1: Clicando no botão de busca...');
    searchBtn.click();
    
    // Verifica se a barra apareceu
    setTimeout(() => {
        const isActive = searchContainer?.classList.contains('active');
        console.log(`✅ Barra de pesquisa ${isActive ? 'apareceu' : 'não apareceu'}`);
        
        // Teste 2: Digitar na busca
        if (isActive && searchInput) {
            console.log('✅ Teste 2: Digitando na busca...');
            searchInput.value = 'teste';
            searchInput.dispatchEvent(new Event('input'));
            console.log('✅ Texto digitado');
            
            // Teste 3: Limpar busca
            setTimeout(() => {
                console.log('✅ Teste 3: Limpando busca...');
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                console.log('✅ Busca limpa');
                
                // Teste 4: Fechar barra
                console.log('✅ Teste 4: Fechando barra...');
                searchBtn.click();
                console.log('✅ Teste concluído!');
            }, 1000);
        }
    }, 500);
} else {
    console.log('❌ Botão de busca não encontrado');
}

// Verifica estado do APP_STATE
console.log('APP_STATE atual:', {
    movies: window.APP_STATE?.movies?.length || 0,
    searchQuery: window.APP_STATE?.searchQuery || '',
    currentView: window.APP_STATE?.currentView || 'desconhecido'
});