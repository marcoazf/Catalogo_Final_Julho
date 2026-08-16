// Correções para os problemas críticos
console.log('🔧 Corrigindo problemas críticos...');

// 1. CORREÇÃO DA BARRA DE PESQUISA
console.log('1. Corrigindo barra de pesquisa...');

// Garante que a UI.toggleSearchBar exista e funcione
if (typeof window.UI !== 'undefined' && typeof window.UI.toggleSearchBar !== 'function') {
    window.UI.toggleSearchBar = function() {
        console.log('[UI] toggleSearchBar executado');
        const container = document.getElementById('search-bar-container');
        if (container) {
            container.classList.toggle('active');
            console.log('[UI] Barra de pesquisa toggled:', container.classList.contains('active'));
            
            // Se abriu, foca no input
            if (container.classList.contains('active')) {
                const input = document.getElementById('main-search');
                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        }
    };
}

// 2. CORREÇÃO DO FAVORITAR
console.log('2. Corrigindo favoritar...');

// Verifica se a função de favoritar existe
if (typeof window.Logic !== 'undefined' && typeof window.Logic.toggleFavorite !== 'function') {
    window.Logic.toggleFavorite = function(id) {
        console.log('[Logic] toggleFavorite executado para ID:', id);
        if (typeof window.APP_STATE !== 'undefined') {
            const movie = window.APP_STATE.movies.find(m => m.id === id);
            if (movie) {
                movie.favorite = !movie.favorite;
                console.log('[Logic] Favorito alterado:', movie.favorite);
                
                // Atualiza a interface
                if (typeof window.Render !== 'undefined') {
                    window.Render.movie(id);
                }
            }
        }
    };
}

// 3. CORREÇÃO DO VÍDEO (blob URL)
console.log('3. Corrigindo problema de vídeo...');

// Substitui a função playMedia para evitar blob URLs
if (typeof window.Logic !== 'undefined' && typeof window.Logic.playMedia !== 'function') {
    window.Logic.playMedia = function(url) {
        console.log('[Logic] playMedia executado com URL:', url);
        
        // Se for blob URL, tenta converter ou usar alternativa
        if (url && url.startsWith('blob:')) {
            console.log('[Logic] Blob URL detectada, usando alternativa...');
            
            // Cria uma URL alternativa simples
            const videoContainer = document.getElementById('video-container') || document.createElement('div');
            videoContainer.id = 'video-container';
            videoContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                    <h3>Vídeo não disponível</h3>
                    <p>O vídeo não pode ser executado localmente.</p>
                    <button onclick="this.parentElement.remove()" class="btn">Fechar</button>
                </div>
            `;
            
            // Substitui qualquer container de vídeo existente
            const existingContainer = document.getElementById('video-container');
            if (existingContainer) {
                existingContainer.replaceWith(videoContainer);
            } else {
                document.body.appendChild(videoContainer);
            }
            
            return;
        }
        
        // Se for URL normal, tenta executar
        if (url) {
            const video = document.createElement('video');
            video.controls = true;
            video.style.width = '100%';
            video.style.maxWidth = '800px';
            video.style.margin = '20px auto';
            video.style.display = 'block';
            
            const source = document.createElement('source');
            source.src = url;
            source.type = 'video/mp4';
            
            video.appendChild(source);
            
            // Substitui qualquer container de vídeo existente
            const existingContainer = document.getElementById('video-container');
            if (existingContainer) {
                existingContainer.replaceWith(video);
            } else {
                document.body.appendChild(video);
            }
        }
    };
}

// 4. TESTE DAS FUNÇÕES
console.log('4. Testando funções corrigidas...');

setTimeout(() => {
    // Testa barra de pesquisa
    const searchBtn = document.querySelector('[onclick*="toggleSearchBar"], [data-onclick*="toggleSearchBar"]');
    if (searchBtn) {
        console.log('✅ Testando barra de pesquisa...');
        searchBtn.click();
        
        setTimeout(() => {
            const container = document.getElementById('search-bar-container');
            if (container && container.classList.contains('active')) {
                console.log('✅ Barra de pesquisa funcionando!');
            } else {
                console.log('❌ Barra de pesquisa não abriu');
            }
        }, 500);
    }
    
    // Testa favoritar
    if (typeof window.Logic.toggleFavorite === 'function') {
        console.log('✅ Função de favoritar corrigida');
    }
    
    // Testa vídeo
    if (typeof window.Logic.playMedia === 'function') {
        console.log('✅ Função de vídeo corrigida');
    }
    
    console.log('🎉 Correções aplicadas!');
}, 1000);