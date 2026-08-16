// Debug e correção da barra de pesquisa
console.log('🔧 Debug da barra de pesquisa...');

// 1. Verifica elementos
const searchBtn = document.querySelector('[onclick*="toggleSearchBar"], [data-onclick*="toggleSearchBar"]');
const searchContainer = document.getElementById('search-bar-container');
const searchInput = document.getElementById('main-search');

console.log('Elementos encontrados:', {
    searchBtn: !!searchBtn,
    searchContainer: !!searchContainer,
    searchInput: !!searchInput
});

// 2. Verifica classes CSS
if (searchContainer) {
    console.log('Classes do container:', searchContainer.className);
    console.log('Container tem active?', searchContainer.classList.contains('active'));
    console.log('Estilo computed:', window.getComputedStyle(searchContainer).maxHeight);
}

// 3. Cria função toggleSearchBar robusta
window.UI = window.UI || {};

window.UI.toggleSearchBar = function() {
    console.log('[UI] toggleSearchBar executado');
    
    const container = document.getElementById('search-bar-container');
    if (container) {
        console.log('[UI] Container encontrado, alternando classes...');
        
        // Força a remoção de active
        container.classList.remove('active');
        
        // Força a adição de active
        container.classList.add('active');
        
        // Aplica estilos manualmente
        container.style.maxHeight = '100px';
        container.style.opacity = '1';
        container.style.padding = '1rem 2rem';
        
        console.log('[UI] Container após toggle:', {
            hasActive: container.classList.contains('active'),
            styleMaxHeight: container.style.maxHeight,
            styleOpacity: container.style.opacity
        });
        
        // Foca no input
        const input = document.getElementById('main-search');
        if (input) {
            setTimeout(() => input.focus(), 200);
        }
        
        return true;
    } else {
        console.log('[UI] Container não encontrado');
        return false;
    }
};

// 4. Teste direto
if (searchBtn) {
    console.log('🧪 Teste direto no botão...');
    searchBtn.click();
    
    setTimeout(() => {
        const container = document.getElementById('search-bar-container');
        const isOpen = container && container.classList.contains('active');
        console.log(`Resultado do teste: ${isOpen ? 'ABRIU' : 'NÃO ABRIU'}`);
        
        if (!isOpen) {
            console.log('❌ Tentativa manual de abrir...');
            window.UI.toggleSearchBar();
        }
    }, 500);
}

// 5. Função global para teste
window.testSearchBarManual = function() {
    console.log('🧪 Teste manual da barra...');
    const result = window.UI.toggleSearchBar();
    console.log('Resultado:', result ? 'SUCESSO' : 'FALHA');
};