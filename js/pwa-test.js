// Teste PWA - Verifica se a PWA está instalável e funciona offline
(function() {
    console.log('[PWA TEST] Starting PWA tests...');
    
    // Verifica se service worker está registrado
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            console.log('[PWA TEST] Service Worker registered:', registration);
            
            // Verifica se há service worker ativo
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg && reg.active) {
                    console.log('[PWA TEST] Active SW found');
                    
                    // Testa se a PWA pode ser instalada
                    if (reg.installing) {
                        console.log('[PWA TEST] SW is installing...');
                    }
                    
                    // Envia mensagem para o SW
                    reg.active.postMessage({ type: 'GET_CACHE_STATUS' });
                } else {
                    console.log('[PWA TEST] No active SW found');
                }
            });
        }).catch(error => {
            console.error('[PWA TEST] SW registration error:', error);
        });
    } else {
        console.log('[PWA TEST] Service Worker not supported');
    }
    
    // Verifica manifest
    if ('manifest' in document) {
        console.log('[PWA TEST] Manifest found');
        
        // Testa carregamento do manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            fetch(manifestLink.href)
                .then(response => {
                    if (response.ok) {
                        console.log('[PWA TEST] Manifest loaded successfully');
                        
                        // Verifica se tem campos necessários
                        return response.json();
                    } else {
                        throw new Error('Manifest failed to load');
                    }
                })
                .then(manifest => {
                    console.log('[PWA TEST] Manifest fields:', {
                        name: manifest.name,
                        short_name: manifest.short_name,
                        start_url: manifest.start_url,
                        display: manifest.display,
                        icons: manifest.icons.length
                    });
                    
                    // Verifica campos essenciais
                    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
                    const missingFields = requiredFields.filter(field => !manifest[field]);
                    
                    if (missingFields.length > 0) {
                        console.error('[PWA TEST] Missing manifest fields:', missingFields);
                    } else {
                        console.log('[PWA TEST] All required manifest fields present');
                    }
                })
                .catch(error => {
                    console.error('[PWA TEST] Manifest error:', error);
                });
        }
    } else {
        console.log('[PWA TEST] Manifest not supported');
    }
    
    // Verifica se tem suporte a PWA
    const pwaFeatures = [
        'serviceWorker' in navigator,
        'manifest' in document,
        'serviceWorker' in navigator && 'serviceWorker' in window,
        'caches' in window,
        'indexedDB' in window
    ];
    
    console.log('[PWA TEST] PWA Features:', pwaFeatures);
    
    // Testa cache
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            console.log('[PWA TEST] Cache names:', cacheNames);
        }).catch(error => {
            console.error('[PWA TEST] Cache error:', error);
        });
    }
    
    // Verifica se pode ser instalada (display: standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA TEST] App is running in standalone mode');
    }
    
    // Escuta mudanças no display mode
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
        console.log('[PWA TEST] Display mode changed to:', e.matches ? 'standalone' : 'browser');
    });
    
    // Testa offline
    if (!navigator.onLine) {
        console.log('[PWA TEST] Device is offline');
    } else {
        console.log('[PWA TEST] Device is online');
    }
    
    // Escuta mudanças de conexão
    window.addEventListener('online', () => {
        console.log('[PWA TEST] Connection restored');
    });
    
    window.addEventListener('offline', () => {
        console.log('[PWA TEST] Connection lost');
    });
    
    console.log('[PWA TEST] PWA tests completed');
})();