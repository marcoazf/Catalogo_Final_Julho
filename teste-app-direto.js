// Teste direto na aplicação principal
console.log('🧪 Teste direto na aplicação principal...');

// 1. Verifica se a aplicação principal está carregada
if (typeof window.APP_STATE === 'undefined') {
    console.log('❌ APP_STATE não encontrado - aplicação principal não carregada');
} else {
    console.log('✅ APP_STATE encontrado - aplicação principal carregada');
    
    // 2. Testa barra de pesquisa na aplicação principal
    const searchBtn = document.querySelector('[onclick*="toggleSearchBar"], [data-onclick*="toggleSearchBar"]');
    console.log('Botão de pesquisa:', searchBtn ? 'Encontrado' : 'Não encontrado');
    
    if (searchBtn) {
        console.log('✅ Testando barra de pesquisa...');
        
        // Testa se a função UI existe
        if (typeof window.UI !== 'undefined' && typeof window.UI.toggleSearchBar === 'function') {
            console.log('✅ UI.toggleSearchBar encontrado');
            
            // Executa o teste
            searchBtn.click();
            console.log('✅ Botão clicado');
            
            setTimeout(() => {
                const container = document.getElementById('search-bar-container');
                const isOpen = container && container.classList.contains('active');
                console.log(`✅ Barra de pesquisa ${isOpen ? 'abriu' : 'não abriu'}`);
                
                if (isOpen) {
                    const input = document.getElementById('main-search');
                    if (input) {
                        input.value = 'teste';
                        input.dispatchEvent(new Event('input'));
                        console.log('✅ Texto digitado');
                    }
                }
            }, 500);
        } else {
            console.log('❌ UI.toggleSearchBar não encontrado');
        }
    }
    
    // 3. Testa favoritar
    if (typeof window.Logic !== 'undefined' && typeof window.Logic.toggleFavorite === 'function') {
        console.log('✅ Logic.toggleFavorite encontrado');
    } else {
        console.log('❌ Logic.toggleFavorite não encontrado');
    }
    
    // 4. Testa vídeo
    if (typeof window.Logic !== 'undefined' && typeof window.Logic.playMedia === 'function') {
        console.log('✅ Logic.playMedia encontrado');
        
        // Testa com blob URL
        console.log('Testando playMedia com blob URL...');
        try {
            window.Logic.playMedia('blob:null/123');
            console.log('✅ playMedia executado sem erro');
        } catch (err) {
            console.log('❌ playMedia falhou:', err);
        }
    } else {
        console.log('❌ Logic.playMedia não encontrado');
    }
}

// 5. Função global para testes manuais
window.testAppMain = function() {
    console.log('🧪 Teste manual da aplicação principal...');
    
    const searchBtn = document.querySelector('[onclick*="toggleSearchBar"], [data-onclick*="toggleSearchBar"]');
    if (searchBtn) {
        searchBtn.click();
        console.log('✅ Botão de pesquisa clicado');
    } else {
        console.log('❌ Botão de pesquisa não encontrado');
    }
};

console.log('Execute window.testAppMain() para testar manualmente');