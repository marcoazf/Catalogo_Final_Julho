        // ============================================================
        // Store — fachada síncrona sobre IndexedDB (via localforage)
        // ------------------------------------------------------------
        // Mantém a API síncrona que o app já usa (getItem/setItem/
        // removeItem) através de um cache em memória, com dupla escrita:
        //   - localStorage  = espelho (boot instantâneo + compat. legado)
        //   - IndexedDB     = armazenamento durável (limite ~1GB+)
        // Na primeira carga, dados legados do localStorage são migrados
        // automaticamente para o IndexedDB.
        // ============================================================
        var Store = (function() {
            var _mem = {};
            var _stamp = {};
            var _idb = null;
            var _ready = null;
            var _hasLS = false;

            function _lsOk() {
                try {
                    localStorage.setItem('__cc_probe', '1');
                    localStorage.removeItem('__cc_probe');
                    return true;
                } catch (e) { return false; }
            }

            function _seedFromLS() {
                try {
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i);
                        if (k === '__cc_probe') continue;
                        _mem[k] = localStorage.getItem(k);
                    }
                } catch (e) {}
            }

            function _writeLS(k, v) {
                if (!_hasLS) return;
                try { localStorage.setItem(k, v); } catch (e) {}
            }

            function _removeLS(k) {
                if (!_hasLS) return;
                try { localStorage.removeItem(k); } catch (e) {}
            }

            return {
                get _ready() { return _ready; },
                get _mem() { return _mem; },

                getItem: function(key) {
                    return Object.prototype.hasOwnProperty.call(_mem, key) ? _mem[key] : null;
                },

                setItem: function(key, value) {
                    _mem[key] = value;
                    _stamp[key] = Date.now();
                    _writeLS(key, value);
                    if (_idb) {
                        var p = _idb.setItem(key, value);
                        if (p && p.catch) p.catch(function() {});
                    }
                },

                removeItem: function(key) {
                    delete _mem[key];
                    delete _stamp[key];
                    _removeLS(key);
                    if (_idb) {
                        var p = _idb.removeItem(key);
                        if (p && p.catch) p.catch(function() {});
                    }
                },

                // Inicializa: semeia de localStorage, sobrepõe do IndexedDB
                // e migra localStorage -> IndexedDB. Retorna a Promise pronta.
                init: function() {
                    _hasLS = _lsOk();
                    var _firstRunCleanKey = 'cinecatalog_first_run_clean';

                    // (b) Primeira execução: sempre carrega 100% limpo.
                    // Remove qualquer dado de acervo, preferências, caminhos,
                    // notificações, históricos e lembretes remanescentes.
                    // Parte síncrona: limpa o espelho localStorage antes de semear.
                    var _firstRunLS = true;
                    if (_hasLS) {
                        try {
                            if (localStorage.getItem(_firstRunCleanKey)) _firstRunLS = false;
                        } catch (e) {}
                        if (_firstRunLS) {
                            try {
                                for (var _s = 0; _s < localStorage.length; _s++) {
                                    var _sk = localStorage.key(_s);
                                    if (_sk && _sk !== '__cc_probe' && _sk !== _firstRunCleanKey) {
                                        localStorage.removeItem(_sk);
                                    }
                                }
                                localStorage.setItem(_firstRunCleanKey, '1');
                            } catch (e) {}
                        }
                    }

                    _seedFromLS();

                    _ready = (async function() {
                        try {
                            _idb = localforage.createInstance({
                                name: 'cinecatalog_elo',
                                storeName: 'catalog_data',
                                version: 1.0,
                                description: 'CineCatalog Elo — dados do acervo (IndexedDB)',
                                driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE]
                            });

                            // É primeira execução apenas se o marcador faltar em
                            // AMBOS os armazenamentos (localStorage + IndexedDB).
                            // Se o IndexedDB já tem dados (ex.: localStorage foi
                            // limpo manualmente), NÃO apagar nada.
                            var _isFirstRun = _firstRunLS;
                            if (_isFirstRun) {
                                try {
                                    var _marker = await _idb.getItem(_firstRunCleanKey);
                                    if (_marker) _isFirstRun = false;
                                } catch (e) {}
                            }
                            if (_isFirstRun) {
                                try {
                                    var _allKeys = await _idb.keys();
                                    for (var _a = 0; _a < _allKeys.length; _a++) {
                                        if (_allKeys[_a] === _firstRunCleanKey) continue;
                                        await _idb.removeItem(_allKeys[_a]);
                                    }
                                } catch (e) {}
                                if (_hasLS) {
                                    try {
                                        for (var _b = 0; _b < localStorage.length; _b++) {
                                            var _lk = localStorage.key(_b);
                                            if (_lk && _lk !== '__cc_probe' && _lk !== _firstRunCleanKey) {
                                                delete _mem[_lk];
                                                localStorage.removeItem(_lk);
                                            }
                                        }
                                    } catch (e) {}
                                }
                                try {
                                    await _idb.setItem(_firstRunCleanKey, '1');
                                    _mem[_firstRunCleanKey] = '1';
                                    if (_hasLS) localStorage.setItem(_firstRunCleanKey, '1');
                                } catch (e) {}
                            }

                            var idbKeys = await _idb.keys();

                            // 1) Sobreposição: dados do IndexedDB que não foram
                            //    escritos nesta sessão viram fonte da verdade.
                            for (var i = 0; i < idbKeys.length; i++) {
                                var k = idbKeys[i];
                                if (typeof _stamp[k] !== 'undefined') continue;
                                var v = await _idb.getItem(k);
                                if (v != null) _mem[k] = v;
                            }

                            // 2) Migração: chaves do localStorage ausentes no IndexedDB
                            if (_hasLS) {
                                for (var j = 0; j < localStorage.length; j++) {
                                    var lk = localStorage.key(j);
                                    if (lk === '__cc_probe') continue;
                                    if (idbKeys.indexOf(lk) < 0) {
                                        var lv = localStorage.getItem(lk);
                                        if (lv != null) await _idb.setItem(lk, lv);
                                    }
                                }
                            }
                        } catch (e) {
                            // Se IndexedDB falhar, o app continua funcionando
                            // apenas com o espelho em localStorage.
                            console.warn('Store.init falhou, usando apenas localStorage:', e);
                        }
                    })();

                    _ready.catch(function() {});

                    // Após a sobreposição, re-aplica estado global caso tenha mudado
                    _ready.then(function() {
                        try {
                            if (window.Storage) window.Storage.load();
                            if (window.applyConfig) applyConfig();
                            if (window.Logic) Logic.renderCategorySelect();
                            if (window.UI) UI.updateCounters();
                            if (window.Logic) Logic.updateReminderBadge();
                        } catch (e) { console.warn('Store.ready callback:', e); }
                    });
                    return _ready;
                }
            };
        })();

        // Inicializa imediatamente: a semeadura do localStorage é síncrona,
        // então a API já responde no mesmo tick; o IndexedDB é carregado em
        // segundo plano e sobrepõe depois.
        Store.init();
