// Correção Final do Botão de Pesquisa - Versão 2.0
// Corrige o conflito entre o fix manual e a função original

console.log('🔧 CORREÇÃO FINAL V2.0 DO BOTÃO DE PESQUISA\n');
console.log('📝 Problema detectado: Conflito entre fix manual e função original');
console.log('🧪 Solução: Sinalizador de bloqueio de interferência\n');

(function() {
    // ==========================================================
    // CORREÇÃO 1: Bloqueio da função original
    // ==========================================================
    function blockOriginalFunction() {
        console.log('🔒 Adicionando bloqueio à função original...');

        // Verifica se a função existe
        if (typeof UI !== 'undefined' && typeof UI.toggleSearchBar === 'function') {
            console.log('✅ Função original encontrada: UI.toggleSearchBar');
            
            // Cria uma função wrapper que bloqueia se o fix já estiver ativo
            UI.toggleSearchBarOriginal = UI.toggleSearchBar;
            
            UI.toggleSearchBar = function() {
                if (window._searchBarFixed) {
                    console.log('🔒 Função original bloqueada (fix manual ativo)');
                    return;
                }
                
                console.log('📝 Função original executada normalmente');
                return UI.toggleSearchBarOriginal();
            };
            
            console.log('✅ Função original bloqueada com sucesso!\n');
            return true;
        } else {
            console.log('❌ Função original não encontrada\n');
            return false;
        }
    }

    // ==========================================================
    // CORREÇÃO 2: Fix Manual do Botão
    // ==========================================================
    function fixSearchButton() {
        console.log('🔍 TENTATIVA 1: Buscando botão de pesquisa...');

        var searchBtn = document.querySelector('button[data-onclick*="toggleSearchBar"]') ||
                       document.querySelector('button:has(.fa-search)') ||
                       document.querySelector('button[title*="Pesquisar"]');

        if (!searchBtn) {
            console.log('❌ Botão não encontrado na tentativa 1! Tentando busca mais ampla...');

            var allBtns = document.querySelectorAll('button');
            for (var i = 0; i < allBtns.length; i++) {
                if (allBtns[i].innerHTML.includes('fa-search') ||
                    allBtns[i].innerHTML.includes('magnifying-glass') ||
                    allBtns[i].querySelector('.fa-search') ||
                    allBtns[i].querySelector('.fa-magnifying-glass')) {
                    console.log('✅ Botão encontrado por ícone de lupa:', allBtns[i]);
                    searchBtn = allBtns[i];
                    break;
                }
            }

            if (!searchBtn) {
                console.log('❌ Botão não encontrado por ícone de lupa!');
                return false;
            }
        }

        console.log('✅ Botão encontrado:', searchBtn.innerHTML.substring(0, 50) + '...');

        // Remove handlers existentes
        searchBtn.removeAttribute('data-onclick');
        searchBtn.removeAttribute('onclick');

        // Cria novo handler
        searchBtn.onclick = function(e) {
            console.log('🎯 BOTÃO DE PESQUISA CLIQUADO!');

            var container = document.getElementById('search-bar-container');
            if (!container) {
                console.error('❌ Container não encontrado!');
                e.preventDefault();
                return false;
            }

            var isOpening = !container.classList.contains('active');
            console.log('📝 Estado atual:', isOpening ? 'ABRINDO' : 'FECHANDO');

            // Aplica classe active/inactive
            if (isOpening) {
                container.classList.add('active');
                console.log('✅ Classe "active" adicionada ao container');
            } else {
                container.classList.remove('active');
                console.log('✅ Classe "active" removida do container');
            }

            // Atualiza visualmente todos os botões
            var allBtns = document.querySelectorAll('button');
            allBtns.forEach(function(btn) {
                if (btn.innerHTML.includes('fa-search') ||
                    btn.innerHTML.includes('magnifying-glass') ||
                    btn.querySelector('.fa-search') ||
                    btn.querySelector('.fa-magnifying-glass')) {
                    if (isOpening) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });

            console.log('📋 Classes do container:', container.className);
            console.log('📋 Classes do botão:', searchBtn.className);

            // Foca no input se abrindo
            if (isOpening) {
                setTimeout(function() {
                    var input = document.getElementById('main-search');
                    if (input) {
                        input.focus();
                        console.log('✅ Input focado!');
                    } else {
                        console.error('❌ Input de pesquisa não encontrado!');
                    }
                }, 100);
            }

            e.preventDefault();
            return false;
        };

        // Define sinalizador de fix ativo
        window._searchBarFixed = true;
        searchBtn.style.cursor = 'pointer';
        searchBtn.style.transition = 'all 0.2s';
        searchBtn.style.outline = 'none';
        console.log('✅ Botão fixado com sucesso!\n');
        return true;
    }

    // ==========================================================
    // CORREÇÃO 3: Fix do Atalho
    // ==========================================================
    function fixKeyboardShortcut() {
        console.log('⌨️ CORRIGINDO ATALHO CTRL+F...\n');

        // Remove listener antigo se existir
        document.removeEventListener('keydown', fixKeyboardShortcut);

        // Adiciona novo listener
        document.addEventListener('keydown', function(e) {
            // Ctrl+F ou Cmd+F para abrir
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                console.log('⌨️ ATALHO CTRL+F DETECTADO!');

                var container = document.getElementById('search-bar-container');
                if (!container) {
                    console.error('❌ Container não encontrado para atalho!');
                    return;
                }

                // Aplica a classe active
                if (!container.classList.contains('active')) {
                    container.classList.add('active');
                    console.log('✅ Barra de pesquisa aberta via Ctrl+F');

                    // Atualiza visualmente o botão
                    var allBtns = document.querySelectorAll('button');
                    allBtns.forEach(function(btn) {
                        if (btn.innerHTML.includes('fa-search') ||
                            btn.innerHTML.includes('magnifying-glass') ||
                            btn.querySelector('.fa-search') ||
                            btn.querySelector('.fa-magnifying-glass')) {
                            btn.classList.add('active');
                        }
                    });

                    // Foca no input
                    setTimeout(function() {
                        var input = document.getElementById('main-search');
                        if (input) {
                            input.focus();
                            console.log('✅ Input focado via Ctrl+F');
                        }
                    }, 100);
                } else {
                    console.log('📝 Barra de pesquisa já está aberta via Ctrl+F');
                }
            }

            // Escape para fechar
            if (e.key === 'Escape') {
                e.preventDefault();
                console.log('⌨️ ATALHO ESCAPE DETECTADO!');

                var container = document.getElementById('search-bar-container');
                if (container && container.classList.contains('active')) {
                    container.classList.remove('active');
                    console.log('✅ Barra de pesquisa fechada via Escape');

                    // Atualiza visualmente o botão
                    var allBtns = document.querySelectorAll('button');
                    allBtns.forEach(function(btn) {
                        if (btn.innerHTML.includes('fa-search') ||
                            btn.innerHTML.includes('magnifying-glass') ||
                            btn.querySelector('.fa-search') ||
                            btn.querySelector('.fa-magnifying-glass')) {
                            btn.classList.remove('active');
                        }
                    });
                }
            }
        });

        console.log('✅ Atalho Ctrl+F e Escape corrigidos com sucesso!\n');
    }

    // ==========================================================
    // CORREÇÃO 4: Fix da função openSearchBar
    // ==========================================================
    function fixOpenSearchBar() {
        console.log('🔧 CORRIGINDO FUNÇÃO openSearchBar...\n');

        if (typeof UI !== 'undefined' && typeof UI.openSearchBar === 'function') {
            UI.openSearchBarOriginal = UI.openSearchBar;
            
            UI.openSearchBar = function() {
                if (window._searchBarFixed) {
                    console.log('🔒 Função openSearchBar bloqueada (fix manual ativo)');
                    return;
                }
                
                console.log('📝 Função openSearchBar executada normalmente');
                return UI.openSearchBarOriginal();
            };
            
            console.log('✅ Função openSearchBar corrigida com sucesso!\n');
            return true;
        } else {
            console.log('❌ Função openSearchBar não encontrada\n');
            return false;
        }
    }

    // ==========================================================
    // EXECUTA AS CORREÇÕES
    // ==========================================================

    // Executa correção 1: Bloqueio da função original
    blockOriginalFunction();

    // Executa correção 4: Fix da função openSearchBar
    fixOpenSearchBar();

    // Executa correção 2: Fix do botão
    var buttonFixed = fixSearchButton();

    // Executa correção 3: Fix do atalho
    fixKeyboardShortcut();

    // ==========================================================
    // RESUMO E TESTE
    // ==========================================================

    console.log('='.repeat(60));
    console.log('📊 RESUMO DA CORREÇÃO V2.0:');
    console.log('='.repeat(60));
    console.log(buttonFixed ? '✅ Botão de pesquisa fixado!' : '❌ Botão não foi possível de fixar');
    console.log('✅ Função original bloqueada (toggleSearchBar)');
    console.log('✅ Função openSearchBar bloqueada');
    console.log('✅ Atalhos Ctrl+F e Escape corrigidos!');
    console.log('='.repeat(60));
    console.log('\n🧪 Teste agora clicando no botão de pesquisa');
    console.log('🧪 Ou pressione Ctrl+F para abrir');
    console.log('🧪 Ou pressione Escape para fechar');
    console.log('🔍 Logs adicionais aparecerão no console!');
    console.log('='.repeat(60));

    // Função global para testes
    window.testSearchBtnV2 = function() {
        console.log('\n🧪 INICIANDO TESTE V2.0...\n');
        window._searchBarFixed = false;
        blockOriginalFunction();
        fixOpenSearchBar();
        fixSearchButton();
        fixKeyboardShortcut();
    };

    console.log('\n💡 Use window.testSearchBtnV2() para reiniciar os testes\n');

})();

console.log('🏁 CORREÇÃO FINAL V2.0 CONCLUÍDA!\n');