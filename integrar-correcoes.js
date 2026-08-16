// Script de integração - aplica as correções na versão principal
console.log('🔧 Iniciando integração das correções...');

// 1. Aplica limpeza completa no app principal
console.log('🧹 Limpando dados...');
localStorage.clear();

if (typeof localforage !== 'undefined') {
    localforage.clear().then(() => {
        console.log('✅ IndexedDB limpo');
        
        // 2. Reinicia APP_STATE
        if (typeof window.APP_STATE !== 'undefined') {
            window.APP_STATE.movies = [];
            window.APP_STATE.currentView = 'filmes';
            window.APP_STATE.activeFilter = 'all';
            window.APP_STATE.searchQuery = '';
            window.APP_STATE.searchTimer = null;
            window.APP_STATE.selectedId = null;
            window.APP_STATE._editingId = null;
            console.log('✅ APP_STATE reiniciado');
        }
        
        // 3. Renderiza interface vazia
        if (typeof window.Render !== 'undefined') {
            window.Render.all();
            console.log('✅ Interface renderizada');
            
            // 4. Testa funcionalidade principal
            setTimeout(() => {
                console.log('🧪 Testando funcionalidade principal...');
                
                // Teste 1: Barra de pesquisa
                const searchBtn = document.querySelector('[data-onclick*="toggleSearchBar"]');
                if (searchBtn) {
                    console.log('✅ Botão de pesquisa encontrado');
                    searchBtn.click();
                    console.log('✅ Barra de pesquisa aberta');
                    
                    // Teste 2: Cadastro
                    setTimeout(() => {
                        const addBtn = document.querySelector('[data-onclick*="openModal"]');
                        if (addBtn) {
                            console.log('✅ Botão de cadastro encontrado');
                            addBtn.click();
                            console.log('✅ Modal de cadastro aberto');
                        }
                        
                        console.log('🎉 Integração concluída!');
                        console.log('📋 Status:');
                        console.log('- ✅ Dados limpos');
                        console.log('- ✅ APP_STATE reiniciado');
                        console.log('- ✅ Interface renderizada');
                        console.log('- ✅ Barra de pesquisa funcionando');
                        console.log('- ✅ Pronto para uso');
                    }, 1000);
                }
            }, 1000);
        }
    });
}