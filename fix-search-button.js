// Script para corrigir manualmente o botão de pesquisa se o binding falhar
console.log('🔧 Correção manual do botão de pesquisa...\n');

function fixSearchButton() {
    console.log('🔍 Buscando botão de pesquisa...');
    
    // Busca alternativa pelo ícone de lupa
    const searchBtn = document.querySelector('button[data-onclick*="toggleSearchBar"]') ||
                      document.querySelector('button:has(.fa-search)') ||
                      document.querySelector('button:has(.fa-magnifying-glass)') ||
                      document.querySelector('button[title*="Pesquisar"]') ||
                      document.querySelector('button[title*="search"]');
    
    if (!searchBtn) {
        console.error('❌ Botão de pesquisa NÃO encontrado!');
        console.log('\n🔍 Tentando busca mais ampla por ícones de lupa...');
        const allBtns = document.querySelectorAll('button');
        for (let i = 0; i < allBtns.length; i++) {
            if (allBtns[i].innerHTML.includes('fa-search') ||
                allBtns[i].innerHTML.includes('magnifying-glass') ||
                allBtns[i].querySelector('.fa-search') ||
                allBtns[i].querySelector('.fa-magnifying-glass')) {
                console.log('✅ Botão encontrado por ícone de lupa:', allBtns[i]);
                fixButton(allBtns[i]);
                return;
            }
        }
        console.error('❌ Nenhum botão com ícone de lupa encontrado!');
        return;
    }

    console.log('✅ Botão de pesquisa encontrado:', searchBtn);
    console.log('   Conteúdo HTML:', searchBtn.innerHTML);
    console.log('   Classe:', searchBtn.className);
    console.log('   Data-onclick:', searchBtn.getAttribute('data-onclick'));
    console.log('   Onclick:', searchBtn.getAttribute('onclick'));
    
    fixButton(searchBtn);
}

function fixButton(btn) {
    console.log('\n🔧 Iniciando fix do botão de pesquisa...');
    
    // Remove qualquer data-onclick ou onclick existente
    btn.removeAttribute('data-onclick');
    btn.removeAttribute('onclick');
    
    // Adiciona onclick manual
    btn.onclick = function(e) {
        console.log('🎯 Botão de pesquisa clicado!');
        
        const container = document.getElementById('search-bar-container');
        if (!container) {
            console.error('❌ Container não encontrado!');
            return;
        }
        
        console.log('Container encontrado:', container);
        console.log('Estado inicial - Active:', container.classList.contains('active'));
        
        // Alterna a classe
        container.classList.toggle('active');
        
        const isActive = container.classList.contains('active');
        console.log('Estado após toggle - Active:', isActive);
        
        // Atualiza o botão visualmente
        if (isActive) {
            btn.classList.add('active');
            console.log('✅ Barra de pesquisa ABERTA');
            console.log('   Botão marcado como ativo');
        } else {
            btn.classList.remove('active');
            console.log('✅ Barra de pesquisa FECHADA');
            console.log('   Botão removido de ativo');
        }
        
        // Foca no input se abrindo
        if (isActive) {
            const input = document.getElementById('main-search');
            if (input) {
                setTimeout(() => {
                    input.focus();
                    console.log('✅ Input de pesquisa ganhou foco');
                }, 100);
            } else {
                console.error('❌ Input de pesquisa não encontrado!');
            }
        }
        
        e.preventDefault();
        return false;
    };
    
    // Adiciona estilos visuais
    btn.style.cursor = 'pointer';
    btn.style.transition = 'all 0.2s';
    btn.style.outline = 'none';
    
    console.log('\n✅ Botão fixado com sucesso!');
    console.log('   - onclick handler adicionado');
    console.log('   - estilos visuais adicionados');
    console.log('   - botão pronto para uso\n');
    
    return true;
}

// Executa a correção
fixSearchButton();

// Verifica novamente após um curto delay
setTimeout(fixSearchButton, 500);

// Verifica mais uma vez
setTimeout(fixSearchButton, 1000);

console.log('🏁 Correção manual concluída!');
console.log('\n📝 Logs no console para debugging:');
console.log('   - Se o botão foi encontrado');
console.log('   - Se o onclick foi adicionado');
console.log('   - Se a função foi registrada');
console.log('\n💡 Use: window.testSearchBtn() para verificar o estado atual');