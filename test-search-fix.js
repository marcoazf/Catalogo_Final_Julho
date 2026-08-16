// Script de teste para o botão de pesquisa
console.log('🧪 Iniciando teste do botão de pesquisa...\n');

// 1. Verifica se o botão de pesquisa existe
const searchBtn = document.querySelector('button[data-onclick*="toggleSearchBar"]');
if (searchBtn) {
    console.log('✅ Botão de pesquisa encontrado');
    console.log('   Texto:', searchBtn.textContent);
    console.log('   HTML:', searchBtn.innerHTML);
    console.log('   Classes:', searchBtn.className);
    console.log('   Title:', searchBtn.title);
} else {
    console.error('❌ Botão de pesquisa não encontrado!');
}

// 2. Verifica se o container da barra de pesquisa existe
const container = document.getElementById('search-bar-container');
if (container) {
    console.log('✅ Container da barra de pesquisa encontrado');
    console.log('   Classes atuais:', container.className);
    console.log('   Altura do CSS:', container.style.maxHeight);
    console.log('   Opacidade do CSS:', container.style.opacity);
} else {
    console.error('❌ Container da barra de pesquisa não encontrado!');
}

// 3. Testa a função toggleSearchBar
if (typeof UI !== 'undefined' && typeof UI.toggleSearchBar === 'function') {
    console.log('\n✅ Função UI.toggleSearchBar está disponível');
    console.log('   Testando execução...');
    UI.toggleSearchBar();
    console.log('   Teste concluído');
} else {
    console.error('\n❌ Função UI.toggleSearchBar não encontrada!');
}

// 4. Testa a função openSearchBar
if (typeof UI !== 'undefined' && typeof UI.openSearchBar === 'function') {
    console.log('\n✅ Função UI.openSearchBar está disponível');
    console.log('   Testando execução...');
    UI.openSearchBar();
    console.log('   Teste concluído');
} else {
    console.error('\n❌ Função UI.openSearchBar não encontrada!');
}

// 5. Testa manualmente clicando no botão
setTimeout(function() {
    console.log('\n🧪 Teste manual do botão de pesquisa...');
    if (searchBtn) {
        console.log('   Estado antes do clique:', searchBtn.classList.contains('active'));
        searchBtn.click();
        setTimeout(function() {
            console.log('   Estado após o clique:', searchBtn.classList.contains('active'));
            
            // Verifica o container após o clique
            if (container) {
                console.log('   Container ativo:', container.classList.contains('active'));
                console.log('   Container maxHeight:', container.style.maxHeight);
                console.log('   Container opacity:', container.style.opacity);
                
                // Testa fechar
                searchBtn.click();
                setTimeout(function() {
                    console.log('   Container após fechar:', container.classList.contains('active'));
                }, 500);
            }
        }, 300);
    }
}, 500);

// 6. Verifica se o input de pesquisa existe
const searchInput = document.getElementById('main-search');
if (searchInput) {
    console.log('\n✅ Input de pesquisa encontrado');
    console.log('   Placeholder:', searchInput.placeholder);
} else {
    console.error('\n❌ Input de pesquisa não encontrado!');
}

console.log('\n🎉 Testes iniciados!');
console.log('Use window.testSearchBtn() para testar manualmente.');
console.log('Use window.testSearchBtn() para abrir o console e ver os detalhes.');