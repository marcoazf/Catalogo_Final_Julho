// Etapa 5 — remove os atributos inline (onclick/onchange/oninput/...) do HTML.
// Os elementos passam a declarar data-onclick/data-onchange/... (atributos
// inertes, sem JS executável no HTML) e este módulo os vincula via
// addEventListener, cobrindo também o DOM gerado dinamicamente com um
// MutationObserver. A semântica dos handlers inline é preservada:
//   - `this` === o elemento do handler;
//   - `event` é passado como primeiro argumento;
//   - retorno `false` previne o default (como nos atributos inline).
// Para `onerror` em <img>, além do listener também é feita uma checagem
// imediata: se a imagem já falhou antes do bind (src vazio/quebrado), o evento
// já aconteceu e o fallback é disparado manualmente.
window.BIND = (function() {
    var _bound = new WeakSet();
    var _fnCache = new Map();
    var _types = ['click', 'change', 'input', 'mouseover', 'mouseout', 'keydown', 'blur', 'error'];
    var _sel = _types.map(function(t) { return '[data-on' + t + ']'; }).join(',');
    var _observer = null;

    function _compile(expr) {
        var fn = _fnCache.get(expr);
        if (!fn) {
            try {
                fn = new Function('event', expr);
                _fnCache.set(expr, fn);
                console.log('[BIND] Compiled successfully:', expr);
            } catch (e) {
                console.error('[BIND] Failed to compile:', expr, e);
                return null;
            }
        }
        return fn;
    }

    function _run(el, type, expr, event) {
        try {
            console.log('[BIND] Running handler for', type, 'on', el, 'with expr:', expr);
            var fn = _compile(expr);
            if (fn) {
                var r = fn.call(el, event);
                if (r === false) event.preventDefault();
                console.log('[BIND] Handler executed successfully');
            } else {
                console.error('[BIND] Failed to compile handler:', expr);
            }
        } catch (e) {
            if (window.console && console.error) console.error('[bind] falha no handler ' + type + ':', e);
        }
    }

    function _checkErrorImmediate(el, expr) {
        if (el instanceof HTMLImageElement && el.complete && el.naturalWidth === 0) {
            _run(el, 'error', expr, new Event('error'));
        }
    }

    function bind(el) {
        if (_bound.has(el)) return;
        var any = false;
        for (var i = 0; i < _types.length; i++) {
            var type = _types[i];
            var expr = el.getAttribute('data-on' + type);
            if (expr == null) continue;
            any = true;
            if (type === 'error') {
                el.addEventListener('error', function(e) { _run(el, type, expr, e); });
                _checkErrorImmediate(el, expr);
            } else {
                el.addEventListener(type, function(e) { _run(el, type, expr, e); });
            }
        }
        if (any) _bound.add(el);
    }

    function scan(root) {
        root = root || document;
        var candidates = [];
        if (root.nodeType === 1 && root.querySelectorAll) {
            var els = root.querySelectorAll(_sel);
            console.log('[BIND] Found', els.length, 'elements with data-on* attributes');
            for (var i = 0; i < els.length; i++) candidates.push(els[i]);
            if (root.matches && root.matches(_sel)) candidates.push(root);
        }
        for (var j = 0; j < candidates.length; j++) bind(candidates[j]);
    }

function start() {
        if (_observer) return;
        console.log('[BIND] Starting...');
        
        // Check if required objects are available
        var checkGlobals = function() {
            if (typeof window.Logic !== 'undefined' && typeof window.UI !== 'undefined') {
                console.log('[BIND] Global objects available, starting observer...');
                _observer = new MutationObserver(function(mutations) {
                    for (var m = 0; m < mutations.length; m++) {
                        var added = mutations[m].addedNodes;
                        for (var n = 0; n < added.length; n++) {
                            var node = added[n];
                            if (node.nodeType === 1) scan(node);
                        }
                    }
                });
                var target = document.body || document.documentElement;
                _observer.observe(target, { childList: true, subtree: true });
                scan(document);
            } else {
                console.log('[BIND] Global objects not ready, retrying...');
                setTimeout(checkGlobals, 100);
            }
        };
        
        // Start checking for globals
        checkGlobals();
    }
            }
        });
        var target = document.body || document.documentElement;
        _observer.observe(target, { childList: true, subtree: true });
        scan(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        // Executa imediatamente e também aguarda um período maior para garantir que tudo está carregado
        start();
        setTimeout(start, 500);
    }

    return { scan: scan, bind: bind };
})();
