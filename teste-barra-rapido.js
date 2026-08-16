// Teste rápido da barra de pesquisa após correção
console.log('🧪 Teste rápido da barra de pesquisa...');

// Verifica se UI existe
if (typeof window.UI !== 'undefined') {
    console.log('✅ UI encontrado');
    
    // Verifica se toggleSearchBar existe
    if (typeof window.UI.toggleSearchBar === 'function') {
        console.log('✅ toggleSearchBar encontrado');
        
        // Testa a função
        console.log('🔍 Testando toggleSearchBar...');
        window.UI.toggleSearchBar();
        
        // Verifica se a barra mudou
        setTimeout(() => {
            const searchContainer = document.getElementById('search-bar-container');
            const isActive = searchContainer?.classList.contains('active');
            console.log(`✅ Barra de pesquisa ${isActive ? 'abriu' : 'não abriu'}`);
            
            if (isActive) {
                console.log('🎉 Barra de pesquisa funcionando!');
            } else {
                console.log('❌ Barra de pesquisa não abriu');
            }
        }, 500);
    } else {
        console.log('❌ toggleSearchBar não encontrado');
    }
} else {
    console.log('❌ UI não encontrado');
}

// Teste do botão de busca manual
const searchBtn = document.querySelector('[onclick*="toggleSearchBar"], [data-onclick*="toggleSearchBar"]');
if (searchBtn) {
    console.log('✅ Botão de pesquisa encontrado');
    console.log('🔍 Testando clique no botão...');
    searchBtn.click();
} else {
    console.log('❌ Botão de pesquisa não encontrado');
}