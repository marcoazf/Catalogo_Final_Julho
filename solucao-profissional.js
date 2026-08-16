// Solução Limpa e Profissional - Sem Conflitos CSS
console.log('🎯 Solução Limpa e Profissional...');

// 1. Remove qualquer elemento de pesquisa existente
const existingSearch = document.getElementById('search-bar-container');
if (existingSearch) existingSearch.remove();

const existingButtons = document.querySelectorAll('button');
existingButtons.forEach(btn => {
    if (btn.textContent.includes('PESQUISAR') || btn.style.cssText?.includes('position: fixed')) {
        btn.remove();
    }
});

// 2. Cria container de pesquisa limpo
const searchContainer = document.createElement('div');
searchContainer.id = 'search-bar-container';
searchContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: 3px solid #4c51bf;
    padding: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

searchContainer.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; padding: 20px; display: flex; align-items: center; gap: 15px;">
        <button id="search-back-btn" style="
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            ←
        </button>
        
        <input type="text" id="main-search" placeholder="🔍 Digite para pesquisar filmes, séries, diretores..." 
               style="
                   flex: 1;
                   padding: 15px 20px;
                   border: 2px solid rgba(255,255,255,0.3);
                   border-radius: 25px;
                   background: rgba(255,255,255,0.1);
                   color: white;
                   font-size: 16px;
                   outline: none;
                   transition: all 0.3s ease;
               " 
               onfocus="this.style.background='rgba(255,255,255,0.2)'; this.style.borderColor='white'"
               onblur="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(255,255,255,0.3)'">
        
        <button id="search-clear-btn" style="
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            ✕
        </button>
    </div>
`;

document.body.appendChild(searchContainer);

// 3. Cria botão flutuante elegante
const searchButton = document.createElement('button');
searchButton.id = 'search-toggle-btn';
searchButton.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🔍</span>
        <span style="font-weight: bold;">Pesquisar</span>
    </div>
`;
searchButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 15px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 8px;
`;

// Efeitos hover
searchButton.onmouseover = function() {
    this.style.transform = 'translateY(-2px) scale(1.05)';
    this.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
};

searchButton.onmouseout = function() {
    this.style.transform = 'translateY(0) scale(1)';
    this.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
};

// 4. Funções de controle
let isOpen = false;

function toggleSearch() {
    console.log('🔍 Toggle search - isOpen:', isOpen);
    
    if (isOpen) {
        // Fecha
        searchContainer.style.maxHeight = '0';
        searchContainer.style.opacity = '0';
        searchContainer.style.padding = '0';
        searchButton.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">🔍</span>
                <span style="font-weight: bold;">Pesquisar</span>
            </div>
        `;
        
        // Limpa input
        const input = document.getElementById('main-search');
        if (input) {
            input.value = '';
            input.blur();
        }
        
        isOpen = false;
        console.log('📤 Barra fechada');
    } else {
        // Abre
        searchContainer.style.maxHeight = '120px';
        searchContainer.style.opacity = '1';
        searchContainer.style.padding = '20px 0';
        searchButton.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">✕</span>
                <span style="font-weight: bold;">Fechar</span>
            </div>
        `;
        
        // Foca no input
        const input = document.getElementById('main-search');
        if (input) {
            setTimeout(() => {
                input.focus();
                console.log('🎯 Input focado');
            }, 300);
        }
        
        isOpen = true;
        console.log('📥 Barra aberta');
    }
}

// 5. Vincula eventos
searchButton.onclick = toggleSearch;

const backBtn = document.getElementById('search-back-btn');
const clearBtn = document.getElementById('search-clear-btn');

if (backBtn) backBtn.onclick = toggleSearch;
if (clearBtn) clearBtn.onclick = toggleSearch;

// 6. Adiciona input event
const searchInput = document.getElementById('main-search');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        console.log('🔍 Pesquisando por:', e.target.value);
        // Adicione sua lógica de pesquisa aqui
    });
}

// 7. Adiciona botão à página
document.body.appendChild(searchButton);

// 8. Garante visibilidade
searchButton.style.display = 'block';
searchContainer.style.display = 'block';

console.log('✅ Solução limpa e profissional criada!');
console.log('🎯 Botão flutuante elegante adicionado');
console.log('🎨 Barra de pesquisa moderna com gradientes');

// 9. Teste
setTimeout(() => {
    console.log('🧠 Testando abertura...');
    toggleSearch();
    
    setTimeout(() => {
        console.log('🧠 Testando fechamento...');
        toggleSearch();
    }, 2000);
}, 1000);

// 10. Funções globais
window.testSearch = toggleSearch;
console.log('Execute window.testSearch() para testar');