// Correção final dos botões de fechar da barra de pesquisa
console.log('🔧 Correção final dos botões de fechar...');

// 1. Encontra todos os botões que podem fechar a barra
const searchContainer = document.getElementById('search-bar-container');
const allButtons = document.querySelectorAll('button');

// Botões que devem fechar a barra
const closeButtons = [];

// Procura botões dentro da barra de pesquisa
if (searchContainer) {
    const containerButtons = searchContainer.querySelectorAll('button');
    containerButtons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const icon = btn.innerHTML.toLowerCase();
        
        // Botões que podem fechar
        if (text.includes('fechar') || text.includes('limpar') || text.includes('clear') ||
            icon.includes('times') || icon.includes('x') || icon.includes('close') ||
            icon.includes('arrow-left') || icon.includes('back')) {
            closeButtons.push(btn);
            console.log('✅ Botão de fechar encontrado na barra:', btn);
        }
    });
}

// 2. Se não encontrou na barra, procura globalmente
if (closeButtons.length === 0) {
    allButtons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const icon = btn.innerHTML.toLowerCase();
        
        if (text.includes('fechar') || text.includes('limpar') || text.includes('clear') ||
            icon.includes('times') || icon.includes('x') || icon.includes('close') ||
            icon.includes('arrow-left') || icon.includes('back')) {
            closeButtons.push(btn);
            console.log('✅ Botão de fechar encontrado globalmente:', btn);
        }
    });
}

// 3. Se encontrou botões, corrige o binding
if (closeButtons.length > 0) {
    closeButtons.forEach((btn, index) => {
        console.log(`🔧 Corrigindo botão ${index + 1}...`);
        
        // Remove bindings existentes
        btn.removeAttribute('onclick');
        btn.removeAttribute('data-onclick');
        
        // Adiciona binding correto
        btn.onclick = function(e) {
            console.log(`[BOTÃO ${index + 1}] Clicado, fechando barra...`);
            
            // Fecha a barra
            if (searchContainer) {
                searchContainer.classList.remove('active');
                searchContainer.style.maxHeight = '0';
                searchContainer.style.opacity = '0';
                searchContainer.style.padding = '0';
                searchContainer.style.overflow = 'hidden';
                console.log(`[BOTÃO ${index + 1}] Barra fechada`);
            }
            
            // Limpa input
            const searchInput = document.getElementById('main-search');
            if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                console.log(`[BOTÃO ${index + 1}] Input limpo`);
            }
            
            e.preventDefault();
            return false;
        };
        
        console.log(`✅ Botão ${index + 1} corrigido`);
    });
} else {
    console.log('❌ Nenhum botão de fechar encontrado, criando botão temporário');
    
    // Cria botão de fechar temporário
    const tempCloseBtn = document.createElement('button');
    tempCloseBtn.innerHTML = '✕';
    tempCloseBtn.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 5px;
        z-index: 1000;
    `;
    
    tempCloseBtn.onclick = function(e) {
        console.log('[BOTÃO TEMPORÁRIO] Fechando barra...');
        
        if (searchContainer) {
            searchContainer.classList.remove('active');
            searchContainer.style.maxHeight = '0';
            searchContainer.style.opacity = '0';
            searchContainer.style.padding = '0';
            searchContainer.style.overflow = 'hidden';
        }
        
        const searchInput = document.getElementById('main-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
        
        e.preventDefault();
        return false;
    };
    
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(tempCloseBtn);
        console.log('✅ Botão de fechar temporário criado');
    }
}

// 4. Testa os botões
console.log('🧪 Testando botões de fechar...');
closeButtons.forEach((btn, index) => {
    console.log(`Testando botão ${index + 1}...`);
    btn.click();
});

// 5. Função global para testes
window.testCloseButtons = function() {
    console.log('🧠 Teste manual dos botões de fechar...');
    closeButtons.forEach((btn, index) => {
        console.log(`Clicando botão ${index + 1}...`);
        btn.click();
    });
};

console.log('🎉 Correção final concluída!');
console.log('Execute window.testCloseButtons() para testar manualmente');