// Script de diagnóstico e correção do binding
console.log('🔍 Diagnosticando binding...');

// 1. Verifica elementos com data-on*
const elementsWithDataOn = document.querySelectorAll('[data-on*]');
console.log(`Elementos com data-on*: ${elementsWithDataOn.length}`);

if (elementsWithDataOn.length > 0) {
    console.log('❌ Elementos não vinculados encontrados:');
    elementsWithDataOn.forEach((el, index) => {
        console.log(`${index + 1}. ${el.tagName}:`, el.outerHTML);
    });
    
    // 2. Executa binding manual
    console.log('🔧 Executando binding manual...');
    
    // Simula o final-bind.js
    elementsWithDataOn.forEach(el => {
        const dataOnclick = el.getAttribute('data-onclick');
        if (dataOnclick) {
            console.log(`Vinculando: ${el.tagName} com ${dataOnclick}`);
            el.onclick = function(e) {
                console.log(`Executando: ${dataOnclick}`);
                try {
                    const fn = new Function('event', dataOnclick);
                    fn.call(this, e);
                } catch (err) {
                    console.error('Erro ao executar:', err);
                }
            };
            el.removeAttribute('data-onclick');
        }
    });
    
    console.log('✅ Binding manual concluído');
    
    // 3. Re-testa
    setTimeout(() => {
        console.log('🧪 Re-testando após binding...');
        
        const searchBtn = document.querySelector('[onclick*="toggleSearchBar"]');
        const addBtn = document.querySelector('[onclick*="openModal"]');
        
        console.log('Botões após binding:', {
            searchBtn: !!searchBtn,
            addBtn: !!addBtn
        });
        
        if (searchBtn) {
            console.log('✅ Testando barra de pesquisa...');
            searchBtn.click();
        }
        
        if (addBtn) {
            console.log('✅ Testando cadastro...');
            addBtn.click();
        }
    }, 1000);
} else {
    console.log('✅ Todos elementos já vinculados!');
}

// 4. Função de teste global
window.testBinding = function() {
    console.log('🧪 Teste manual do binding...');
    
    const searchBtn = document.querySelector('[onclick*="toggleSearchBar"]');
    const addBtn = document.querySelector('[onclick*="openModal"]');
    
    if (searchBtn) {
        searchBtn.click();
        console.log('✅ Barra de pesquisa testada');
    } else {
        console.log('❌ Botão de pesquisa não encontrado');
    }
    
    if (addBtn) {
        addBtn.click();
        console.log('✅ Cadastro testado');
    } else {
        console.log('❌ Botão de cadastro não encontrado');
    }
};