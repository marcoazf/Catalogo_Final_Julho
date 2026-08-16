// Debug direto no console - sem depender de carregamento de arquivo
console.log('🔧 Iniciando debug da barra de pesquisa...');

// 1. Verifica elementos existentes
const searchBtn = document.querySelector('[onclick*="toggleSearchBar"], [data-onclick*="toggleSearchBar"]');
const searchContainer = document.getElementById('search-bar-container');
const searchInput = document.getElementById('main-search');

console.log('Elementos encontrados:', {
    searchBtn: !!searchBtn,
    searchContainer: !!searchContainer,
    searchInput: !!searchInput
});

// 2. Se botão existe, testa clique
if (searchBtn) {
    console.log('✅ Botão encontrado, testando clique...');
    searchBtn.click();
    console.log('✅ Botão clicado');
} else {
    console.log('❌ Botão não encontrado');
}

// 3. Verifica estado do container
if (searchContainer) {
    console.log('Container status:', {
        classes: searchContainer.className,
        hasActive: searchContainer.classList.contains('active'),
        maxHeight: window.getComputedStyle(searchContainer).maxHeight,
        opacity: window.getComputedStyle(searchContainer).opacity
    });
}

// 4. Função manual para forçar abertura
function forceOpenSearch() {
    console.log('🔧 Forçando abertura da barra...');
    
    const container = document.getElementById('search-bar-container');
    if (container) {
        // Remove qualquer restrição CSS
        container.style.removeProperty('max-height');
        container.style.removeProperty('opacity');
        container.style.removeProperty('overflow');
        container.style.removeProperty('padding');
        
        // Força abertura
        container.classList.add('active');
        container.style.maxHeight = '100px';
        container.style.opacity = '1';
        container.style.padding = '1rem 2rem';
        container.style.overflow = 'visible';
        
        console.log('✅ Barra forçada aberta');
        
        // Foca no input
        const input = document.getElementById('main-search');
        if (input) {
            setTimeout(() => input.focus(), 100);
            console.log('✅ Input focado');
        }
        
        return true;
    } else {
        console.log('❌ Container não encontrado');
        return false;
    }
}

// 5. Teste da função
console.log('Testando função de força abertura...');
const result = forceOpenSearch();
console.log('Resultado:', result ? 'SUCESSO' : 'FALHA');

// 6. Adiciona função global para testes futuros
window.testSearchBarManual = forceOpenSearch;
console.log('Função window.testSearchBarManual adicionada');

console.log('🎯 Teste concluído! Execute forceOpenSearch() manualmente se necessário.');