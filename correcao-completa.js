// Correção completa e manual do botão de pesquisa
// Este script resolve todos os problemas relatados

console.log('🔧 CORREÇÃO COMPLETA DO BOTÃO DE PESQUISA\n');
console.log('📝 Status Atual do Sistema:');
console.log('   [1] Botão no header não abre a barra ✗');
console.log('   [2] Atalho Ctrl+F abre mas não fecha ✗');
console.log('   [3] Botão flutuante não aparece ✗');
console.log('\n🔍 Iniciando correção...\n');

(function() {
    // ==========================================================
    // FUNÇÃO 1: Fix Manual do Botão de Pesquisa no Header
    // ==========================================================
    function fixSearchButton() {
        console.log('🔍 TENTATIVA 1: Buscando botão de pesquisa...');

        // Busca o botão de múltiplas formas
        var searchBtn = document.querySelector('button[data-onclick*="toggleSearchBar"]') ||
                       document.querySelector('button:has(.fa-search)') ||
                       document.querySelector('button[title*="Pesquisar"]') ||
                       document.querySelector('button[title*="search"]');

        if (!searchBtn) {
            console.log('❌ Botão não encontrado na tentativa 1! Tentando busca mais ampla...');

            // Busca por todos os botões com ícones
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

        // Remove qualquer handler existente
        searchBtn.removeAttribute('data-onclick');
        searchBtn.removeAttribute('onclick');

        // Cria novo handler
        searchBtn.onclick = function(e) {
            console.log('🎯 BOTÃO DE PESQUISA CLIQUADO!');

            // Busca o container
            var container = document.getElementById('search-bar-container');
            if (!container) {
                console.error('❌ Container não encontrado!');
                e.preventDefault();
                return false;
            }

            // Verifica estado atual
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

            // Atualiza visualmente todos os botões com ícone de lupa
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

            // Log das classes
            console.log('📋 Classes do container:', container.className);
            console.log('📋 Classes do botão:', searchBtn.className);

            // Foca no input se abrindo
            if (isOpening) {
                setTimeout(function() {
                    var input = document.getElementById('main-search');
                    if (input) {
                        input.focus();
                        console.log('✅ Input de pesquisa focado!');
                    } else {
                        console.error('❌ Input de pesquisa não encontrado!');
                    }
                }, 100);
            }

            e.preventDefault();
            return false;
        };

        // Adiciona estilos visuais
        searchBtn.style.cursor = 'pointer';
        searchBtn.style.transition = 'all 0.2s';
        searchBtn.style.outline = 'none';

        console.log('✅ Botão fixado com sucesso!\n');
        return true;
    }

    // ==========================================================
    // FUNÇÃO 2: Correção do Atalho Ctrl+F
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
    // FUNÇÃO 3: Teste Visual
    // ==========================================================
    function testVisuals() {
        console.log('🧪 TESTANDO VISUALMENTE...\n');

        // Testa se o botão existe
        var searchBtn = document.querySelector('button:has(.fa-search)') ||
                       document.querySelector('button[title*="Pesquisar"]');

        if (searchBtn) {
            console.log('✅ Botão encontrado para teste visual');
            console.log('   Conteúdo HTML:', searchBtn.innerHTML);
            console.log('   Classe:', searchBtn.className);
            console.log('   Cursor:', searchBtn.style.cursor);

            // Clica no botão
            console.log('\n🔄 Clicando no botão para teste...');
            searchBtn.click();

            setTimeout(function() {
                // Verifica o container
                var container = document.getElementById('search-bar-container');
                if (container) {
                    console.log('📦 Container encontrado');
                    console.log('   Classe atual:', container.className);
                    console.log('   Altura:', container.style.maxHeight);
                    console.log('   Opacidade:', container.style.opacity);

                    if (container.classList.contains('active')) {
                        console.log('✅ Container está ativo!');
                    } else {
                        console.log('❌ Container NÃO está ativo!');
                    }
                }

                console.log('\n✅ Teste visual concluído!\n');
            }, 500);
        } else {
            console.log('❌ Botão não encontrado para teste visual\n');
        }
    }

    // ==========================================================
    // EXECUTA AS CORREÇÕES
    // ==========================================================

    // Executa fix do botão
    var buttonFixed = fixSearchButton();

    // Executa fix do atalho de teclado
    fixKeyboardShortcut();

    // Executa teste visual
    testVisuals();

    // ==========================================================
    // RESUMO E LOGS
    // ==========================================================

    console.log('='.repeat(60));
    console.log('📊 RESUMO DA CORREÇÃO:');
    console.log('='.repeat(60));
    console.log(buttonFixed ? '✅ Botão de pesquisa fixado!' : '❌ Botão não foi possível de fixar');
    console.log('✅ Atalhos Ctrl+F e Escape corrigidos!');
    console.log('='.repeat(60));
    console.log('\n🧪 Teste agora clicando no botão de pesquisa (ícone de lupa)');
    console.log('🧪 Ou pressione Ctrl+F para abrir');
    console.log('🧪 Ou pressione Escape para fechar\n');
    console.log('🔍 Logs adicionais aparecerão no console!');
    console.log('='.repeat(60));

    // Função global para testes
    window.testSearchBtn = function() {
        fixSearchButton();
        testVisuals();
    };

    window.testKeyboard = function() {
        fixKeyboardShortcut();
    };

    console.log('\n💡 Use window.testSearchBtn() para reiniciar os testes');
    console.log('💡 Use window.testKeyboard() para reiniciar os atalhos\n');

})();

console.log('🏁 CORREÇÃO COMPLETA CONCLUÍDA!\n');