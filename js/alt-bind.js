// Versão alternativa e mais robusta do sistema de bind
console.log('[ALT BIND] Iniciando bind alternativo...');

(function() {
    console.log('[ALT BIND] Bind alternativo iniciado');
    
    // Função para substituir data-on* por onclick/oninput/etc
    function replaceDataAttributes() {
        console.log('[ALT BIND] Procurando elementos com data-on*...');
        
        const elements = document.querySelectorAll('[data-onclick], [data-oninput], [data-onchange], [data-onmouseover], [data-onmouseout], [data-onkeydown], [data-onblur], [data-onerror]');
        
        console.log('[ALT BIND] Encontrados', elements.length, 'elementos para bind');
        
        elements.forEach(el => {
            const onclick = el.getAttribute('data-onclick');
            const oninput = el.getAttribute('data-oninput');
            const onchange = el.getAttribute('data-onchange');
            const onmouseover = el.getAttribute('data-onmouseover');
            const onmouseout = el.getAttribute('data-onmouseout');
            const onkeydown = el.getAttribute('data-onkeydown');
            const onblur = el.getAttribute('data-onblur');
            const onerror = el.getAttribute('data-onerror');
            
            // Remove os data attributes
            if (onclick) el.removeAttribute('data-onclick');
            if (oninput) el.removeAttribute('data-oninput');
            if (onchange) el.removeAttribute('data-onchange');
            if (onmouseover) el.removeAttribute('data-onmouseover');
            if (onmouseout) el.removeAttribute('data-onmouseout');
            if (onkeydown) el.removeAttribute('data-onkeydown');
            if (onblur) el.removeAttribute('data-onblur');
            if (onerror) el.removeAttribute('data-onerror');
            
            // Substitui por handlers reais
            if (onclick) {
                el.onclick = function(e) {
                    console.log('[ALT BIND] Executando onclick:', onclick);
                    try {
                        const fn = new Function('event', onclick);
                        fn.call(this, e);
                    } catch (err) {
                        console.error('[ALT BIND] Erro no onclick:', err);
                    }
                };
            }
            
            if (oninput) {
                el.oninput = function(e) {
                    console.log('[ALT BIND] Executando oninput:', oninput, 'valor:', this.value);
                    try {
                        // Para oninput, precisamos preservar this.value
                        const fn = new Function('event', `
                            (function() {
                                var value = this.value;
                                ${oninput}
                            }).call(this, event);
                        `);
                        fn.call(this, e);
                    } catch (err) {
                        console.error('[ALT BIND] Erro no oninput:', err);
                    }
                };
            }
            
            if (onchange) {
                el.onchange = function(e) {
                    console.log('[ALT BIND] Executando onchange:', onchange);
                    try {
                        const fn = new Function('event', onchange);
                        fn.call(this, e);
                    } catch (err) {
                        console.error('[ALT BIND] Erro no onchange:', err);
                    }
                };
            }
            
            // ... outros eventos podem ser adicionados conforme necessário
            
        });
        
        console.log('[ALT BIND] Bind alternativo concluído');
    }
    
    // Executa imediatamente e após um curto delay
    replaceDataAttributes();
    setTimeout(replaceDataAttributes, 500);
    
    // Observa mudanças no DOM
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Elemento
                    const dataElements = node.querySelectorAll('[data-on*]');
                    if (dataElements.length > 0) {
                        console.log('[ALT BIND] Novos elementos encontrados, rebind...');
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
    
})();