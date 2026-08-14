// Simple bind workaround for Etapa 5
// This replaces data-onclick attributes with actual onclick handlers
(function() {
    console.log('[SIMPLE BIND] Starting...');
    
    function replaceDataOnclick() {
        var elements = document.querySelectorAll('[data-onclick]');
        console.log('[SIMPLE BIND] Found', elements.length, 'elements with data-onclick');
        
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var expr = el.getAttribute('data-onclick');
            
            if (expr) {
                console.log('[SIMPLE BIND] Replacing onclick for:', el, 'with:', expr);
                
                // Create a wrapper function that preserves 'this' and event
                var handler = function(expr, element) {
                    return function(event) {
                        console.log('[SIMPLE BIND] Executing:', expr, 'on', element, 'event type:', event.type);
                        if (event.type === 'input') {
                            console.log('[SIMPLE BIND] Input value:', element.value);
                        }
                        try {
                            // For input handlers, we need to handle 'this.value' specially
                            if (expr.includes('this.value')) {
                                // Create a function that preserves 'this' and handles 'this.value'
                                var fn = new Function('event', `
                                    (function() {
                                        var value = this.value;
                                        ${expr}
                                    }).call(this, event);
                                `);
                                fn.call(element, event);
                            } else {
                                // Create a function with the expression and call it
                                var fn = new Function('event', expr);
                                fn.call(element, event);
                            }
                        } catch (e) {
                            console.error('[SIMPLE BIND] Error executing:', expr, e);
                        }
                    };
                }(expr, el);
                
                // Replace the data attribute with actual onclick
                el.setAttribute('onclick', '');
                el.onclick = handler;
                
                // Remove the data attribute
                el.removeAttribute('data-onclick');
            }
        }
    }
    
    // Try multiple times to ensure everything is loaded
    var attempts = 0;
    var maxAttempts = 10;
    
    function tryBind() {
        attempts++;
        console.log('[SIMPLE BIND] Attempt', attempts);
        
        if (typeof window.Logic !== 'undefined' && typeof window.UI !== 'undefined') {
            console.log('[SIMPLE BIND] Globals available, replacing handlers...');
            replaceDataOnclick();
        } else if (attempts < maxAttempts) {
            console.log('[SIMPLE BIND] Globals not ready, retrying...');
            setTimeout(tryBind, 200);
        } else {
            console.error('[SIMPLE BIND] Failed after', maxAttempts, 'attempts');
        }
    }
    
    // Start the process
    tryBind();
    
    // Also replace any elements that might be added later
    setInterval(function() {
        if (typeof window.Logic !== 'undefined' && typeof window.UI !== 'undefined') {
            replaceDataOnclick();
        }
    }, 1000);
})();