// Script de limpeza completa e definitiva
console.log('[LIMPEZA] Iniciando limpeza completa...');

// 1. Limpa TODOS os localStorage
console.log('[LIMPEZA] Limpando localStorage...');
localStorage.clear();

// 2. Limpa IndexedDB
console.log('[LIMPEZA] Limpando IndexedDB...');
if (indexedDB) {
    const request = indexedDB.open('cinecatalog_elo');
    request.onsuccess = function() {
        const db = request.result;
        const objectStore = db.transaction('cinecatalog_v126', 'readwrite').objectStore('cinecatalog_v126');
        objectStore.clear().onsuccess = function() {
            console.log('[LIMPEZA] IndexedDB limpo!');
        };
    };
}

// 3. Limpa todos os caches
if ('caches' in window) {
    caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
            caches.delete(cacheName).then(() => {
                console.log('[LIMPEZA] Cache deletado:', cacheName);
            });
        });
    });
}

// 4. Limpa variáveis globais
if (typeof window.APP_STATE !== 'undefined') {
    window.APP_STATE.movies = [];
    window.APP_STATE.currentView = 'filmes';
    window.APP_STATE.activeFilter = 'all';
    window.APP_STATE.searchQuery = '';
    window.APP_STATE.searchTimer = null;
    window.APP_STATE.selectedId = null;
    window.APP_STATE._editingId = null;
}

// 5. Limpa notificações e lembretes
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('cinecatalog') || key.includes('notification') || key.includes('reminder'))) {
        localStorage.removeItem(key);
        console.log('[LIMPEZA] Removido:', key);
    }
}

// 6. Recarrega após 2 segundos
setTimeout(() => {
    console.log('[LIMPEZA] Limpeza concluída! Recarregando...');
    if (confirm('Acervo limpo com sucesso! Deseja recarregar a página?')) {
        window.location.reload(true); // Força recarga completa
    }
}, 2000);