// Script para limpar completamente o acervo e notificações
console.log('[CLEAN] Iniciando limpeza do acervo...');

// 1. Limpa localStorage
console.log('[CLEAN] Limpando localStorage...');
localStorage.clear();

// 2. Limpa IndexedDB usando localForage
if (typeof localforage !== 'undefined') {
    console.log('[CLEAN] Limpando IndexedDB...');
    localforage.clear().then(() => {
        console.log('[CLEAN] IndexedDB limpo com sucesso');
    }).catch(err => {
        console.error('[CLEAN] Erro ao limpar IndexedDB:', err);
    });
}

// 3. Limpa APP_STATE
if (typeof window.APP_STATE !== 'undefined') {
    console.log('[CLEAN] Limpando APP_STATE...');
    window.APP_STATE.movies = [];
    window.APP_STATE.currentView = 'filmes';
    window.APP_STATE.activeFilter = 'all';
    window.APP_STATE.searchQuery = '';
    window.APP_STATE.searchTimer = null;
    window.APP_STATE.selectedId = null;
    window.APP_STATE._editingId = null;
    console.log('[CLEAN] APP_STATE limpo');
}

// 4. Limpa notificações e lembretes
console.log('[CLEAN] Limpando notificações...');
// Remove notificações do localStorage
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('cinecatalog_notif_')) {
        localStorage.removeItem(key);
        console.log('[CLEAN] Removido:', key);
    }
}

// Remove lembretes
if (typeof window.Logic !== 'undefined') {
    window.Logic._lastNotifications = [];
    window.Logic._reminderListRefresh = false;
}

// 5. Recarrega a página após limpeza
setTimeout(() => {
    console.log('[CLEAN] Limpeza concluída! Recarregando página...');
    if (confirm('Acervo limpo com sucesso! Deseja recarregar a página?')) {
        window.location.reload();
    }
}, 1000);