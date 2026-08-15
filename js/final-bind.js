// Script de substituição dos data-on* por handlers reais (versão final)
console.log('[FINAL BIND] Iniciando bind final...');

(function() {
    console.log('[FINAL BIND] Bind final iniciado');
    
    // Função principal para substituir atributos
    function replaceDataAttributes() {
        // Verifica se UI e Render estão disponíveis no window
        if (typeof window.UI === 'undefined') {
            console.log('[FINAL BIND] Aguardando UI estar disponível...');
            setTimeout(replaceDataAttributes, 100);
            return;
        }
        
        if (typeof window.Render === 'undefined') {
            console.log('[FINAL BIND] Aguardando Render estar disponível...');
            setTimeout(replaceDataAttributes, 100);
            return;
        }
        
        const elements = document.querySelectorAll('[data-onclick], [data-oninput], [data-onchange], [data-onmouseover], [data-onmouseout], [data-onkeydown], [data-onblur], [data-onerror]');
        
        console.log(`[FINAL BIND] Encontrados ${elements.length} elementos para bind`);
        
        elements.forEach(el => {
            // Coleta todos os handlers
            const handlers = {
                onclick: el.getAttribute('data-onclick'),
                oninput: el.getAttribute('data-oninput'),
                onchange: el.getAttribute('data-onchange'),
                onmouseover: el.getAttribute('data-onmouseover'),
                onmouseout: el.getAttribute('data-onmouseout'),
                onkeydown: el.getAttribute('data-onkeydown'),
                onblur: el.getAttribute('data-onblur'),
                onerror: el.getAttribute('data-onerror')
            };
            
            // Remove data attributes
            Object.keys(handlers).forEach(attr => {
                if (handlers[attr]) {
                    el.removeAttribute(`data-${attr}`);
                }
            });
            
            // Substitui por handlers reais
            Object.keys(handlers).forEach(attr => {
                const handlerCode = handlers[attr];
                if (handlerCode) {
                    el[attr] = function(e) {
                        console.log(`[FINAL BIND] Executando ${attr}:`, handlerCode);
                        try {
                            if (attr === 'oninput' && handlerCode.includes('this.value')) {
                                // Para oninput, preserva this.value
                                const fn = new Function('event', `
                                    (function() {
                                        var value = this.value;
                                        ${handlerCode}
                                    }).call(this, event);
                                `);
                                fn.call(this, e);
                            } else {
                                // Verifica se é uma chamada direta de função
                                if (handlerCode.includes('(') && handlerCode.includes(')')) {
                                    // Tenta executar a função diretamente se for um chamada direta
                                    const fnName = handlerCode.split('(')[0].trim();
                                    const fn = window[fnName];
                                    if (typeof fn === 'function') {
                                        fn.call(this, e);
                                    } else {
                                        // Se não encontrar no window, usa new Function
                                        const fn = new Function('event', handlerCode);
                                        fn.call(this, e);
                                    }
                                } else {
                                    // Se não tem parênteses, tenta executar como chamada direta
                                    const fn = new Function('event', handlerCode + '(this, event)');
                                    fn.call(this, e);
                                }
                            }
                        } catch (err) {
                            console.error(`[FINAL BIND] Erro no ${attr}:`, err);
                        }
                    };
                }
            });
        });
        
        console.log('[FINAL BIND] Bind final concluído');
    }
    
    // Executa imediatamente
    replaceDataAttributes();
    
    // Executa novamente após um curto delay (garante que tudo está carregado)
    setTimeout(replaceDataAttributes, 100);
    
    // Executa mais uma vez após um tempo maior para garantir que UI e Logic estão prontos
    setTimeout(replaceDataAttributes, 500);
    
    // Observa mudanças no DOM para elementos dinâmicos
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Elemento
                    // Busca por data attributes individuais
                    const dataElements = node.querySelectorAll('[data-onclick], [data-oninput], [data-onchange], [data-onmouseover], [data-onmouseout], [data-onkeydown], [data-onblur], [data-onerror]');
                    if (dataElements.length > 0) {
                        console.log('[FINAL BIND] Novos elementos encontrados, rebind...');
                        replaceDataAttributes();
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Função de depuração global
    window.debugBind = function() {
        const elements = document.querySelectorAll('[data-on*]');
        console.log(`[DEBUG] Ainda existem ${elements.length} elementos com data-on*`);
        elements.forEach(el => {
            console.log('[DEBUG]', el, el.outerHTML);
        });
    };

    // ==========================================================
    // CORREÇÃO DE BLOQUEIO DE FUNÇÃO ORIGINAL + FIX MANUAL
    // ==========================================================
    (function() {
        console.log('[FINAL BIND] Iniciando correção de bloqueio e fix manual...');

        // Verifica se já existe um sinalizador de fix
        if (window._searchBarFixed) {
            console.log('[FINAL BIND] Fix já está ativo, pulando...');
            return;
        }

        // ==========================================================
        // 1. FIX MANUAL DO BOTÃO DE PESQUISA
        // ==========================================================
        console.log('[FINAL BIND] Iniciando fix manual do botão de pesquisa...');

        // Busca o botão de pesquisa
        var searchBtn = document.querySelector('button[data-onclick*="toggleSearchBar"]') ||
                       document.querySelector('button:has(.fa-search)') ||
                       document.querySelector('button[title*="Pesquisar"]');

        if (searchBtn) {
            console.log('[FINAL BIND] Botão encontrado, aplicando fix manual...');
            console.log('   HTML:', searchBtn.innerHTML.substring(0, 50) + '...');

            // Remove handlers existentes
            searchBtn.removeAttribute('data-onclick');
            searchBtn.removeAttribute('onclick');

            // Cria novo handler
            searchBtn.onclick = function(e) {
                console.log('[FINAL BIND] 🎯 Botão de pesquisa clicado!');

                var container = document.getElementById('search-bar-container');
                if (!container) {
                    console.error('[FINAL BIND] ❌ Container não encontrado!');
                    e.preventDefault();
                    return false;
                }

                var isOpening = !container.classList.contains('active');
                console.log('[FINAL BIND] 📝 Estado atual:', isOpening ? 'ABRINDO' : 'FECHANDO');

                // Aplica classe active/inactive
                if (isOpening) {
                    container.classList.add('active');
                    console.log('[FINAL BIND] ✅ Classe "active" adicionada');
                } else {
                    container.classList.remove('active');
                    console.log('[FINAL BIND] ✅ Classe "active" removida');
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

                console.log('[FINAL BIND] 📋 Classes do container:', container.className);
                console.log('[FINAL BIND] 📋 Classes do botão:', searchBtn.className);

                // Foca no input se abrindo
                if (isOpening) {
                    setTimeout(function(){
                        var input = document.getElementById('main-search');
                        if (input) {
                            input.focus();
                            console.log('[FINAL BIND] ✅ Input focado!');
                        } else {
                            console.error('[FINAL BIND] ❌ Input de pesquisa não encontrado!');
                        }
                    }, 100);
                }

                e.preventDefault();
                return false;
            };

            // Remove o data-onclick para evitar conflito
            searchBtn.removeAttribute('data-onclick');

            // Define sinalizador de fix ativo
            window._searchBarFixed = true;
            searchBtn.style.cursor = 'pointer';
            searchBtn.style.transition = 'all 0.2s';
            searchBtn.style.outline = 'none';
            console.log('[FINAL BIND] ✅ Botão fixado manualmente com sucesso!\n');
        } else {
            console.log('[FINAL BIND] ❌ Botão não encontrado!\n');
        }

        // ==========================================================
        // 2. BLOQUEIO DA FUNÇÃO ORIGINAL
        // ==========================================================
        if (typeof UI !== 'undefined' && typeof UI.toggleSearchBar === 'function') {
            console.log('[FINAL BIND] Bloqueando função original toggleSearchBar...');

            UI.toggleSearchBarOriginal = UI.toggleSearchBar;
            UI.toggleSearchBar = function() {
                if (window._searchBarFixed) {
                    console.log('[FINAL BIND] 🔒 Função original bloqueada (fix manual ativo)');
                    return;
                }
                console.log('[FINAL BIND] 📝 Função original executada normalmente');
                return UI.toggleSearchBarOriginal();
            };

            console.log('[FINAL BIND] ✅ Função original bloqueada com sucesso!');
        }

        // Bloqueia a função openSearchBar se existir
        if (typeof UI !== 'undefined' && typeof UI.openSearchBar === 'function') {
            console.log('[FINAL BIND] Bloqueando função openSearchBar...');

            UI.openSearchBarOriginal = UI.openSearchBar;
            UI.openSearchBar = function() {
                if (window._searchBarFixed) {
                    console.log('[FINAL BIND] 🔒 Função openSearchBar bloqueada (fix manual ativo)');
                    return;
                }
                console.log('[FINAL BIND] 📝 Função openSearchBar executada normalmente');
                return UI.openSearchBarOriginal();
            };

            console.log('[FINAL BIND] ✅ Função openSearchBar bloqueada com sucesso!');
        }

        console.log('[FINAL BIND] Correção completa concluída!\n');
    })();

    // ==========================================================
    // ATALHOS DE TECLADO
    // ==========================================================
    setTimeout(function() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+F ou Cmd+F para abrir
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                console.log('[KEYBOARD] ⌨️ Ctrl+F pressionado, abrindo barra de pesquisa');

                var container = document.getElementById('search-bar-container');
                if (!container) {
                    console.error('[KEYBOARD] ❌ Container não encontrado!');
                    return;
                }

                if (!container.classList.contains('active')) {
                    container.classList.add('active');
                    console.log('[KEYBOARD] ✅ Barra de pesquisa aberta via Ctrl+F');

                    var allBtns = document.querySelectorAll('button');
                    allBtns.forEach(function(btn) {
                        if (btn.innerHTML.includes('fa-search') ||
                            btn.innerHTML.includes('magnifying-glass') ||
                            btn.querySelector('.fa-search') ||
                            btn.querySelector('.fa-magnifying-glass')) {
                            btn.classList.add('active');
                        }
                    });

                    setTimeout(function(){
                        var input = document.getElementById('main-search');
                        if (input) {
                            input.focus();
                            console.log('[KEYBOARD] ✅ Input focado via Ctrl+F');
                        }
                    }, 100);
                } else {
                    console.log('[KEYBOARD] 📝 Barra de pesquisa já está aberta via Ctrl+F');
                }
            }

            // Escape para fechar
            if (e.key === 'Escape') {
                e.preventDefault();
                console.log('[KEYBOARD] ⌨️ Escape pressionado, fechando barra de pesquisa');

                var container = document.getElementById('search-bar-container');
                if (container && container.classList.contains('active')) {
                    container.classList.remove('active');
                    console.log('[KEYBOARD] ✅ Barra de pesquisa fechada via Escape');

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
        console.log('[FINAL BIND] ✅ Atalhos Ctrl+F (abrir) e Escape (fechar) registrados');
    }, 500);
})();