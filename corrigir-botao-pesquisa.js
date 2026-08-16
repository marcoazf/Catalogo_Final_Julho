// Correção final do botão de pesquisa manual
console.log('🔧 Correção final do botão de pesquisa manual...');

// 1. Encontra o botão de pesquisa manualmente
const searchBtn = null;

// Procura por todos os botões e verifica qual é o de pesquisa
const allButtons = document.querySelectorAll('button');
let foundSearchBtn = null;

allButtons.forEach((btn, index) => {
    const text = btn.textContent.toLowerCase();
    const icon = btn.innerHTML.toLowerCase();
    const classes = btn.className.toLowerCase();
    
    // Critérios para identificar botão de pesquisa
    const isSearchBtn = 
        text.includes('pesquisar') || 
        text.includes('search') ||
        icon.includes('search') ||
        icon.includes('🔍') ||
        icon.includes('fas fa-search') ||
        classes.includes('search') ||
        classes.includes('pesquisar') ||
        btn.title && btn.title.toLowerCase().includes('pesquisar');
    
    if (isSearchBtn) {
        foundSearchBtn = btn;
        console.log(`✅ Botão de pesquisa encontrado ${index + 1}:`, btn);
        console.log(`   Texto: "${btn.textContent}"`);
        console.log(`   Classes: "${btn.className}"`);
        console.log(`   Title: "${btn.title}"`);
    }
});

// 2. Se não encontrou por conteúdo, procura por posição
if (!foundSearchBtn) {
    console.log('🔍 Procurando por posição do botão...');
    
    // Procura no header
    const header = document.querySelector('header');
    if (header) {
        const headerButtons = header.querySelectorAll('button');
        if (headerButtons.length > 0) {
            // Pega o primeiro botão do header (geralmente é o de pesquisa)
            foundSearchBtn = headerButtons[0];
            console.log('✅ Botão de pesquisa encontrado no header:', foundSearchBtn);
        }
    }
}

// 3. Se ainda não encontrou, cria botão temporário
if (!foundSearchBtn) {
    console.log('❌ Botão de pesquisa não encontrado, criando temporário...');
    
    const tempSearchBtn = document.createElement('button');
    tempSearchBtn.innerHTML = '🔍';
    tempSearchBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        padding: 10px 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    `;
    
    tempSearchBtn.onclick = function(e) {
        console.log('[BOTÃO TEMPORÁRIO] Abrindo barra de pesquisa...');
        
        const container = document.getElementById('search-bar-container');
        if (container) {
            container.classList.add('active');
            container.style.maxHeight = '100px';
            container.style.opacity = '1';
            container.style.padding = '1rem 2rem';
            container.style.overflow = 'visible';
            
            const input = document.getElementById('main-search');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
        
        e.preventDefault();
        return false;
    };
    
    document.body.appendChild(tempSearchBtn);
    foundSearchBtn = tempSearchBtn;
    console.log('✅ Botão de pesquisa temporário criado');
}

// 4. Se encontrou botão, corrige o binding
if (foundSearchBtn) {
    console.log('🔧 Corrigindo binding do botão de pesquisa...');
    
    // Remove bindings existentes
    foundSearchBtn.removeAttribute('onclick');
    foundSearchBtn.removeAttribute('data-onclick');
    
    // Adiciona binding correto
    foundSearchBtn.onclick = function(e) {
        console.log('[BOTÃO PESQUISA] Botão de pesquisa clicado!');
        
        // Abre a barra
        const container = document.getElementById('search-bar-container');
        if (container) {
            container.classList.add('active');
            container.style.maxHeight = '100px';
            container.style.opacity = '1';
            container.style.padding = '1rem 2rem';
            container.style.overflow = 'visible';
            
            console.log('[BOTÃO PESQUISA] Barra aberta');
            
            // Foca no input
            const input = document.getElementById('main-search');
            if (input) {
                setTimeout(() => {
                    input.focus();
                    console.log('[BOTÃO PESQUISA] Input focado');
                }, 100);
            }
        }
        
        e.preventDefault();
        return false;
    };
    
    console.log('✅ Binding do botão de pesquisa corrigido');
    
    // Testa o botão
    console.log('🧪 Testando botão de pesquisa...');
    foundSearchBtn.click();
    
} else {
    console.log('❌ Nenhum botão de pesquisa encontrado');
}

// 5. Função global para testes
window.testSearchOpen = function() {
    console.log('🧠 Teste manual do botão de pesquisa...');
    
    if (foundSearchBtn) {
        foundSearchBtn.click();
    } else {
        console.log('❌ Botão de pesquisa não encontrado');
    }
};

console.log('🎉 Correção final concluída!');
console.log('Execute window.testSearchOpen() para testar manualmente');