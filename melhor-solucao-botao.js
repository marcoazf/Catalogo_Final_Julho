// Melhor solução - Criar botão de pesquisa funcional
console.log('🔧 Melhor solução - Botão de pesquisa funcional...');

// 1. Remove qualquer botão de pesquisa existente que não funcione
const existingSearchBtns = document.querySelectorAll('button');
existingSearchBtns.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    const icon = btn.innerHTML.toLowerCase();
    
    if (text.includes('pesquisar') || text.includes('search') || 
        icon.includes('search') || icon.includes('🔍') || icon.includes('fas fa-search')) {
        console.log('Removendo botão de pesquisa existente:', btn);
        btn.remove();
    }
});

// 2. Cria botão de pesquisa novo e funcional
const searchBtn = document.createElement('button');
searchBtn.innerHTML = '<i class="fas fa-search"></i>';
searchBtn.title = 'Pesquisar';
searchBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    width: 45px;
    height: 45px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
`;

// Efeitos hover
searchBtn.onmouseover = function() {
    this.style.background = '#0056b3';
    this.style.transform = 'scale(1.1)';
};

searchBtn.onmouseout = function() {
    this.style.background = '#007bff';
    this.style.transform = 'scale(1)';
};

// Função para abrir/fechar barra de pesquisa
function toggleSearchBar() {
    console.log('[BOTÃO PESQUISA] Alternando barra de pesquisa...');
    
    const container = document.getElementById('search-bar-container');
    const isOpen = container && container.classList.contains('active');
    
    if (isOpen) {
        // Fecha a barra
        container.classList.remove('active');
        container.style.maxHeight = '0';
        container.style.opacity = '0';
        container.style.padding = '0';
        container.style.overflow = 'hidden';
        console.log('[BOTÃO PESQUISA] Barra fechada');
        
        // Muda ícone para lupa
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    } else {
        // Abre a barra
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
        
        // Muda ícone para X
        searchBtn.innerHTML = '<i class="fas fa-times"></i>';
    }
}

// Vincula função ao botão
searchBtn.onclick = toggleSearchBar;

// Adiciona botão à página
document.body.appendChild(searchBtn);
console.log('✅ Botão de pesquisa funcional criado');

// 3. Garante que a barra de pesquisa exista e funcione
const searchContainer = document.getElementById('search-bar-container');
if (!searchContainer) {
    console.log('❌ Container de pesquisa não encontrado, criando...');
    
    const newContainer = document.createElement('div');
    newContainer.id = 'search-bar-container';
    newContainer.className = 'px-6 py-3 border-b theme-border';
    newContainer.style.cssText = `
        background: var(--header-bg) !important;
        border-bottom: 1px solid var(--border-color) !important;
        max-height: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
        transition: all 0.3s ease !important;
        flex-shrink: 0 !important;
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        z-index: 9999;
    `;
    
    newContainer.innerHTML = `
        <div class="flex items-center gap-3" style="max-width: 1200px; margin: 0 auto;">
            <button id="search-back-btn" style="background: none; border: none; color: #666; cursor: pointer; font-size: 16px;">
                <i class="fas fa-arrow-left"></i>
            </button>
            <input type="text" id="main-search" placeholder="pesquise títulos, diretores, elencos, ..." 
                   class="w-full theme-bg-input theme-border rounded-2xl py-2.5 pl-12 pr-20 outline-none text-sm"
                   style="background: var(--input-bg) !important; border: 1px solid var(--border-color) !important; color: var(--text-color) !important;">
            <button id="search-clear-btn" style="background: none; border: none; color: #666; cursor: pointer; font-size: 16px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(newContainer);
    
    // Vincula botões da barra
    const backBtn = document.getElementById('search-back-btn');
    const clearBtn = document.getElementById('search-clear-btn');
    const searchInput = document.getElementById('main-search');
    
    if (backBtn) backBtn.onclick = toggleSearchBar;
    if (clearBtn) clearBtn.onclick = toggleSearchBar;
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            console.log('[PESQUISA] Digitando:', e.target.value);
            // Aqui você pode adicionar a lógica de pesquisa real
        });
    }
    
    console.log('✅ Container de pesquisa criado');
}

// 4. Testa o botão
console.log('🧪 Testando botão de pesquisa...');
toggleSearchBar(); // Abre para teste
setTimeout(() => {
    toggleSearchBar(); // Fecha após teste
}, 2000);

// 5. Funções globais para testes
window.testSearchToggle = toggleSearchBar;
window.testSearchOpen = function() {
    console.log('🧠 Abrindo barra...');
    toggleSearchBar();
};
window.testSearchClose = function() {
    console.log('🧠 Fechando barra...');
    toggleSearchBar();
};

console.log('🎉 Solução final concluída!');
console.log('Use:');
console.log('- window.testSearchOpen() para abrir');
console.log('- window.testSearchClose() para fechar');
console.log('- window.testSearchToggle() para alternar');