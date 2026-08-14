const CACHE_NAME = 'cinecatalogo-v1';
const ASSETS_CACHE = 'cinecatalogo-assets-v1';
const API_CACHE = 'cinecatalogo-api-v1';

// Assets para cache prévio (arquivos estáticos)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/cinecatalogo.png',
  '/css/style.css',
  '/css/tailwind.css',
  '/js/vendor/localforage.min.js',
  '/js/store.js',
  '/js/images.js',
  '/js/storage.js',
  '/js/render.js',
  '/js/logic.js',
  '/js/ui.js',
  '/js/globals.js',
  '/js/simple-bind.js',
  '/js/accessibility.js',
  '/js/main.js',
  '/js/autosave.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js'
];

// URLs que usam cache-first (assets estáticos)
const CACHE_FIRST_URLS = [
  /\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/,
  /\.(css|js)$/,
  /\.(woff|woff2|ttf|eot)$/
];

// URLs que usam network-first (APIs dinâmicas)
const NETWORK_FIRST_URLS = [
  /\/api\//,
  /\/search\//,
  /\/data\//
];

// Instalação - cacheia assets essenciais
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache assets estáticos
      caches.open(ASSETS_CACHE).then(cache => {
        console.log('[SW] Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      }),
      
      // Cacheia o shell principal
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Caching shell...');
        return cache.addAll(['/index.html', '/manifest.json']);
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch - estratégia de cache inteligente
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignora chrome-extension e outras URLs não HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Ignora websockets
  if (event.request.url.includes('ws://')) {
    return;
  }
  
  // Ignora requisições de API que não são GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  console.log('[SW] Fetch:', event.request.url);
  
  // Determina a estratégia com base na URL
  let strategy;
  
  if (CACHE_FIRST_URLS.some(regex => regex.test(url.pathname))) {
    // Cache-first para assets estáticos
    strategy = cacheFirst;
  } else if (NETWORK_FIRST_URLS.some(regex => regex.test(url.pathname))) {
    // Network-first para APIs
    strategy = networkFirst;
  } else {
    // Cache-first como padrão
    strategy = cacheFirst;
  }
  
  event.respondWith(strategy(event.request));
});

// Cache-first strategy
async function cacheFirst(request) {
  try {
    // Tenta pegar do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    // Se não estiver no cache, faz a requisição
    console.log('[SW] Cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    // Se a requisição foi bem sucedida, cacheia a resposta
    if (response.status === 200) {
      const responseClone = response.clone();
      const cache = await caches.open(ASSETS_CACHE);
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Cache fetch failed:', error);
    
    // Se falhar, tenta do cache offline
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tem nem no cache, retorna erro
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    // Tenta pegar da rede primeiro
    console.log('[SW] Network first, fetching:', request.url);
    const response = await fetch(request);
    
    // Se a requisição foi bem sucedida, cacheia a resposta
    if (response.status === 200) {
      const responseClone = response.clone();
      const cache = await caches.open(API_CACHE);
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network fetch failed, trying cache:', error);
    
    // Se falhar, tenta do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tem no cache, retorna erro
    return new Response('Offline', { status: 503 });
  }
}

// Mensagem do client
self.addEventListener('message', (event) => {
  console.log('[SW] Message from client:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.ports[0].postMessage({
      type: 'CACHE_STATUS',
      cacheName: CACHE_NAME
    });
  }
});