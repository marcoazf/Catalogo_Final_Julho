        // ============================================================
        // StoreImages — capas como Blob no IndexedDB (via localforage)
        // ------------------------------------------------------------
        // Cada capa vira um Blob gravado num armazém próprio do
        // IndexedDB (store "catalog_images"), com chave 'img_' + id.
        // O objeto do filme guarda apenas `imageKey` (o JSON fica leve
        // e sem DataURL/objectURL); a URL de exibição é criada em
        // memória (objectURL) e refeita a cada carga.
        // Compatibilidade legada: filmes sem `imageKey` continuam usando
        // `image` como antes (DataURL, URL externa ou vazio/placeholder).
        // ============================================================
        var StoreImages = (function() {
            var _idb = null;
            var _blobs = {};   // key -> Blob (memória)
            var _urls = {};    // key -> objectURL (memória)
            var _ready = null;
            var _pending = []; // gravações feitas antes do init terminar

            function _revoke(key) {
                if (_urls[key]) {
                    try { URL.revokeObjectURL(_urls[key]); } catch (e) {}
                    delete _urls[key];
                }
            }

            function _flushPending() {
                if (!_idb) { _pending = []; return; }
                var list = _pending.splice(0, _pending.length);
                list.forEach(function(entry) {
                    var p = _idb.setItem(entry[0], entry[1]);
                    if (p && p.catch) p.catch(function() {});
                });
            }

            function _hydrateMovies() {
                var movies = (typeof APP_STATE !== 'undefined' && APP_STATE) ? (APP_STATE.movies || []) : [];
                for (var i = 0; i < movies.length; i++) {
                    var m = movies[i];
                    if (m && m.imageKey) {
                        m.image = _urls[m.imageKey] || '';
                    }
                }
            }

            function _afterLoad() {
                try {
                    _hydrateMovies();
                    if (typeof Render !== 'undefined' && Render) Render.all();
                    if (typeof Logic !== 'undefined' && typeof UI !== 'undefined' && UI && Logic && window._editingId) {
                        var mc = document.getElementById('modal-cadastro');
                        if (mc && mc.classList.contains('active')) {
                            var m = (APP_STATE.movies || []).find(function(x) { return x.id === window._editingId; });
                            if (m && m.imageKey) {
                                var pre = m.type === 'series' ? 'fs' : 'f';
                                UI._restoringPoster = true;
                                if (m.image && m.image !== 'https://via.placeholder.com/300x450') {
                                    UI.setPosterPreview(m.image, pre);
                                }
                                UI._restoringPoster = false;
                            }
                        }
                    }
                } catch (e) { console.warn('StoreImages.afterLoad:', e); }
            }

            return {
                get _ready() { return _ready; },

                init: function() {
                    _ready = (async function() {
                        _idb = localforage.createInstance({
                            name: 'cinecatalog_elo',
                            storeName: 'catalog_images',
                            version: 1.0,
                            description: 'CineCatalog Elo — capas (Blob) no IndexedDB',
                            driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE]
                        });
                        var keys = await _idb.keys();
                        for (var i = 0; i < keys.length; i++) {
                            var k = keys[i];
                            var b = await _idb.getItem(k);
                            if (b && b.size) {
                                _blobs[k] = b;
                                _urls[k] = URL.createObjectURL(b);
                            }
                        }
                        _flushPending();
                    })().catch(function(e) {
                        // Se o IndexedDB falhar, as capas Blob continuam só em
                        // memória nesta sessão (e o app segue com fallbacks).
                        console.warn('StoreImages.init falhou:', e);
                        _flushPending();
                    });
                    _ready.then(_afterLoad).catch(function() {});
                    return _ready;
                },

                urlFor: function(key) {
                    return key ? (_urls[key] || null) : null;
                },

                blobFor: function(key) {
                    return key ? (_blobs[key] || null) : null;
                },

                save: function(key, blob) {
                    if (!key || !blob) return;
                    _revoke(key);
                    _blobs[key] = blob;
                    _urls[key] = URL.createObjectURL(blob);
                    if (_idb) {
                        var p = _idb.setItem(key, blob);
                        if (p && p.catch) p.catch(function() {});
                    } else {
                        _pending.push([key, blob]);
                    }
                },

                remove: function(key) {
                    if (!key) return;
                    _revoke(key);
                    delete _blobs[key];
                    if (_idb) {
                        var p = _idb.removeItem(key);
                        if (p && p.catch) p.catch(function() {});
                    }
                },

                hydrateMovies: function(movies) {
                    if (!movies || !movies.length) return;
                    for (var i = 0; i < movies.length; i++) {
                        var m = movies[i];
                        if (m && m.imageKey) {
                            m.image = _urls[m.imageKey] || '';
                        }
                    }
                },

                // Remove todas as capas (usado em "eliminar todos os dados").
                clear: function() {
                    var keys = Object.keys(_blobs);
                    for (var i = 0; i < keys.length; i++) _revoke(keys[i]);
                    _blobs = {};
                    _urls = {};
                    if (_idb) {
                        var p = _idb.clear();
                        if (p && p.catch) p.catch(function() {});
                    }
                },

                // Remove capas órfãs: Blobs cuja chave não é referenciada por
                // nenhum filme atual (ex.: após importar um catálogo novo).
                prune: function(movies) {
                    var keep = {};
                    (movies || []).forEach(function(m) { if (m && m.imageKey) keep[m.imageKey] = true; });
                    var keys = Object.keys(_blobs);
                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        if (!keep[k]) {
                            _revoke(k);
                            delete _blobs[k];
                            if (_idb) {
                                var p = _idb.removeItem(k);
                                if (p && p.catch) p.catch(function() {});
                            }
                        }
                    }
                }
            };
        })();

        // Inicializa imediatamente: as capas Blob são lidas do IndexedDB
        // em segundo plano e, ao terminar, os cards são re-renderizados
        // com as objectURLs prontas.
        StoreImages.init();
