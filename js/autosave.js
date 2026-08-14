        // Enhanced Auto-Save with File System Access API
        var _autoSaveHandle = null;
        var _autoSaveTimer = null;
        
        // Acervo folder handle for manual save
        var _acervoDirHandle = null;
        
        async function _getAcervoDirHandle() {
            var cfg = window._appConfig;
            if (!cfg || !cfg.pathAcervo || !cfg.pathAcervoActive) return null;
            if (_isElectron() && window.require) {
                try {
                    var fs = window.require('fs');
                    if (fs && fs.existsSync(cfg.pathAcervo)) {
                        return { kind: 'electron', path: cfg.pathAcervo };
                    }
                } catch(e) {}
            }
            if (_autoSaveHandle) return _autoSaveHandle;
            return null;
        }
        
        async function _getAcervoDirHandleForSave() {
            var cfg = window._appConfig;
            var savePath = (cfg && cfg.pathAcervo && cfg.pathAcervoActive) ? cfg.pathAcervo : '';
            if (!savePath) return null;
            if (_isElectron() && window.require) {
                try {
                    var fs = window.require('fs');
                    if (fs && fs.existsSync(savePath)) {
                        return { kind: 'electron', path: savePath };
                    }
                } catch(e) {}
            }
            if (_acervoDirHandle) return _acervoDirHandle;
            return null;
        }

        async function _writeJsonToHandle(handle, fileName) {
            if (handle && handle.kind === 'electron') {
                try {
                    var fs = window.require('fs');
                    var path = window.require('path');
                    var data = JSON.stringify(APP_STATE.movies, null, 2);
                    fs.writeFileSync(path.join(handle.path, fileName), data, 'utf-8');
                    return true;
                } catch(e) {
                    console.warn('Electron save failed:', e);
                    return false;
                }
            }
            if (!handle) return false;
            try {
                var data = JSON.stringify(APP_STATE.movies, null, 2);
                var fileHandle = await handle.getFileHandle(fileName, { create: true });
                var writable = await fileHandle.createWritable();
                await writable.write(data);
                await writable.close();
                return true;
            } catch(e) {
                console.warn('Save to file failed:', e);
                return false;
            }
        }

        async function _autoSaveToFile() {
            var handle = await _getAcervoDirHandle();
            if (!handle) return;
            await _writeJsonToHandle(handle, 'cinecatalog_autosave.json');
        }

        async function _saveToAcervoFile() {
            var handle = await _getAcervoDirHandleForSave();
            if (!handle) return false;
            return await _writeJsonToHandle(handle, 'cinecatalog_data.json');
        }

        function _scheduleAutoSave() {
            if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
            _autoSaveTimer = setTimeout(function() {
                var cfg = window._appConfig;
                if (cfg && cfg.autoSave) {
                    saveConfig();
                    var hasPath = (cfg.pathAcervo && cfg.pathAcervoActive);
                    if (hasPath) _autoSaveToFile();
                }
            }, 2000);
        }

        function ConfigAutoSave() {
            var cfg = window._appConfig;
            if (cfg && cfg.autoSave) {
                saveConfig();
                Logic.showStatus('Auto: Dados sincronizados');
                _scheduleAutoSave();
            }
        }

        // Global state for edit mode
        var _editingId = null;
        var _lastSavedItem = null;
        var _infoMovieList = [];
        var _infoMovieIndex = 0;
        var _selectedEpisodeIndex = null;
        var _reopenInfoAfterSave = false;

        // GLOBAL FUNCTION - handles both CREATE and UPDATE
        // - _editingId set: UPDATE existing item and close modal
        // - _editingId null: CREATE new item, validate duplicate, clear fields, stay in modal (real-time)
        function _checkStorageQuota() {
            try {
                var total = 0;
                for (var key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        total += localStorage[key].length * 2; // UTF-16
                    }
                }
                var limit = 5 * 1024 * 1024; // 5MB
                if (total > limit * 0.8) {
                    var pct = Math.round(total / limit * 100);
                    Logic.showModalStatus('ATENCAO: Armazenamento em ' + pct + '% da capacidade (' + Math.round(total/1024) + 'KB). Exporte e salve seu catalogo localmente!', 'red');
                }
            } catch(e) {}
        }

        function saveMovie() {
            try {
                var tab = document.querySelector('.tab-premium.active');
                if (!tab) return;
                var type = tab.dataset.tab;
                var item;

                if (type === 'filmes') {
                    var urlSrc = document.getElementById('f-poster-url').value;
                    var newId = _editingId || Date.now().toString();
                    item = {
                        id: newId,
                        _createdAt: Date.now().toString(),
                        type: 'filmes',
                        originalTitle: document.getElementById('f-title').value.trim(),
                        titlePt: document.getElementById('f-title').value.trim(),
                        year: document.getElementById('f-year').value,
                        duration: document.getElementById('f-duration').value,
                        desc: document.getElementById('f-desc').value,
                        director: document.getElementById('f-director').value,
                        cast: document.getElementById('f-cast').value,
                        genre: document.getElementById('f-category').value,
                        image: '',
                        trailUrl: document.getElementById('f-trailer-url').value,
                        otherInfo: document.getElementById('f-other-info').value,
                        mediaFile: (function(){ var el=document.getElementById('f-media-url'); if (!el) return ''; if (el.dataset.ref) return el.dataset.ref; if (el.dataset.path) return el.dataset.path; return el.value; })(),
                        statuses: {
                            new: document.getElementById('f-status-new').checked,
                            watch: document.getElementById('f-status-watch').checked,
                            favorite: document.getElementById('f-status-fav').checked
                        },
                        stars: document.getElementById('f-stars').value || 0
                    };
                    var pr = Logic.resolvePosterOnSave('f', item.id, urlSrc);
                    item.image = pr.image;
                    if (pr.imageKey) item.imageKey = pr.imageKey; else delete item.imageKey;
                } else if (type === 'series') {
                    var urlSrc = document.getElementById('fs-poster-url').value;
                    var newId = _editingId || Date.now().toString();
                    var epKey = _editingId || 'pending';
                    var savedEps = JSON.parse(Store.getItem('_dyn_series_episodes') || '{}');
                    var dynEpisodes = savedEps[epKey] || [];
                    item = {
                        id: newId,
                        _createdAt: Date.now().toString(),
                        type: 'series',
                        originalTitle: document.getElementById('fs-title').value.trim(),
                        titlePt: document.getElementById('fs-title').value.trim(),
                        year: document.getElementById('fs-year').value,
                        duration: document.getElementById('fs-duration').value,
                        desc: document.getElementById('fs-desc').value,
                        season: document.getElementById('fs-season').value,
                        episodeNumber: document.getElementById('fs-episode-number').value,
                        episodeTitle: document.getElementById('fs-episode-title').value,
                        director: document.getElementById('fs-director').value,
                        cast: document.getElementById('fs-cast').value,
                        genre: document.getElementById('fs-category').value,
                        image: '',
                        trailUrl: document.getElementById('fs-trailer-url').value,
                        trailerUrl: document.getElementById('fs-trailer-url').value,
                        otherInfo: document.getElementById('fs-other-info').value,
                        mediaFile: '',
                        statuses: {
                            new: document.getElementById('fs-status-new').checked,
                            watch: document.getElementById('fs-status-watch').checked,
                            favorite: document.getElementById('fs-status-fav').checked
                        },
                        stars: document.getElementById('fs-stars').value || 0,
                        country: document.getElementById('fs-country').value || '',
                        dynamicEpisodes: dynEpisodes,
                        dynamicSeasons: (UI._seasonData && UI._seasonData.length > 0) ? UI._seasonData.slice() : [],
                        dynamicEpisodesNew: (UI._episodeData && UI._episodeData.length > 0) ? UI._episodeData.slice() : []
                    };
                    var pr = Logic.resolvePosterOnSave('fs', item.id, urlSrc);
                    item.image = pr.image;
                    if (pr.imageKey) item.imageKey = pr.imageKey; else delete item.imageKey;
                    UI._syncSeasonDataFromDom();
                    UI._syncEpisodeDataFromDom();
                    item.dynamicSeasons = (UI._seasonData && UI._seasonData.length > 0) ? UI._seasonData.slice() : [];
                    item.dynamicEpisodesNew = (UI._episodeData && UI._episodeData.length > 0) ? UI._episodeData.slice() : [];
                    // Clean up temp storage
                    delete savedEps[epKey];
                    Store.setItem('_dyn_series_episodes', JSON.stringify(savedEps));
                } else if (type === 'estreias') {
                    // Dynamic estreia rows: delegate to saveAllDynamicEstreias
                    UI.saveAllDynamicEstreias();
                    var estreiaType = 'estreias';
                    if (_editingId) {
                        _editingId = null;
                var viewLabel = {filmes:'FILME', series:'SÉRIE', estreias:'ESTREIA'};
                document.getElementById('modal-title').innerHTML = 'CADASTRO <span style="-webkit-text-fill-color:#3B82F6">' + (viewLabel[APP_STATE.currentView] || 'NOVO') + '</span>';
                        var cloneBtn = document.getElementById('btn-clone-data');
                        if (cloneBtn) cloneBtn.style.display = 'none';
                        var dupBtnEdit = document.getElementById('btn-duplicate-series');
                        if (dupBtnEdit) dupBtnEdit.style.display = 'none';
                        Store.setItem('cinecatalog_v126', Storage.toJSON());
                        _checkStorageQuota();
                        ConfigAutoSave();
                        Render.all();
                        UI.updateCounters();
                        Logic.updateReminderBadge();
                        var bodyScroll = document.querySelector('#modal-cadastro .p-8.overflow-y-auto');
                        if (bodyScroll) bodyScroll.scrollTop = 0;
                        UI.closeModal('modal-cadastro');
                        Logic.showStatus('Estreia(s) atualizada(s) com sucesso!!!', 6000);
                    } else {
                        UI.closeModal('modal-cadastro');
                        Logic.showStatus('Nova(s) estreia(s) adicionada(s)!', 6000);
                    }
                    return;
                }

                if (!item) return;

                // CLONAR duplicate detection: block save if all fields match _lastSavedItem
                if (!_editingId && _lastSavedItem) {
                    var ignoreKeys = ['id', '_createdAt'];
                    var isDup = true;
                    for (var k in item) {
                        if (ignoreKeys.indexOf(k) >= 0) continue;
                        if (String(item[k] || '') !== String(_lastSavedItem[k] || '')) {
                            isDup = false;
                            break;
                        }
                    }
                    if (isDup) {
                        Logic.showModalStatus('ESTES DADOS JA FORAM CADASTRADOS! Altere pelo menos um campo para salvar.', 'red');
                        return;
                    }
                }

                if (_editingId) {
                    // EDIT MODE: update existing and close modal
                    var idx = APP_STATE.movies.findIndex(function(m) { return m.id === _editingId; });
                    if (idx >= 0) {
                        var orig = APP_STATE.movies[idx];
                        item._createdAt = orig._createdAt || orig.id || Date.now().toString();
                        // Preserve estreia fields that are no longer in the simplified form
                        if (type === 'estreias') {
                            item.estreiaType = orig.estreiaType || 'filmes';
                            item.duration = orig.duration || '';
                            item.desc = orig.desc || '';
                            item.director = orig.director || '';
                            item.cast = orig.cast || '';
                            item.genre = orig.genre || '';
                            item.language = orig.language || '';
                            item.studio = orig.studio || '';
                        }
                        APP_STATE.movies[idx] = item;
                    } else {
                        APP_STATE.movies.push(item);
                    }
                    _editingId = null;
                    document.getElementById('modal-title').innerHTML = 'CADASTRO <span style="-webkit-text-fill-color:#3B82F6">NOVO</span>';
                    var cloneBtn = document.getElementById('btn-clone-data');
                    if (cloneBtn) cloneBtn.style.display = 'none';
                    var dupBtnEdit = document.getElementById('btn-duplicate-series');
                    if (dupBtnEdit) dupBtnEdit.style.display = 'none';

                    Store.setItem('cinecatalog_v126', Storage.toJSON());
                    _checkStorageQuota();
                    ConfigAutoSave();
                    Render.all();
                    UI.updateCounters();
                    Logic.updateReminderBadge();
                    var updatedLabel = type === 'filmes' ? 'Filme' : (type === 'series' ? 'Série' : 'Estreia');
                    if (type === 'series') {
                        // SÉRIES: a janela permanece aberta após SALVAR; o fechamento é apenas pelo botão "X"
                        Logic.showModalStatus('Série atualizada com sucesso! Os campos foram preservados.', 'green', 6000);
                    } else {
                        var bodyScroll = document.querySelector('#modal-cadastro .p-8.overflow-y-auto');
                        if (bodyScroll) bodyScroll.scrollTop = 0;
                        UI.closeModal('modal-cadastro');
                        Logic.showStatus(updatedLabel + ' atualizado com sucesso!!!', 6000);
                    }

                    if (_reopenInfoAfterSave && item.type !== 'series') {
                        _reopenInfoAfterSave = false;
                        _infoMovieList = APP_STATE.movies.filter(function(m) {
                            if (item.type !== m.type) return false;
                            var q = APP_STATE.searchQuery.toLowerCase();
                            if (q && !(m.titlePt || '').toLowerCase().includes(q) && !(m.originalTitle || '').toLowerCase().includes(q)) return false;
                            var s = m.statuses || {};
                            var af = APP_STATE.activeFilter;
                            if (af === 'new' && !s.new) return false;
                            if (af === 'watch' && !s.watch) return false;
                            if (af === 'fav' && !s.favorite) return false;
                            if (af === 'favoritados' && !s.favorite) return false;
                            if (af !== 'all' && af !== 'new' && af !== 'watch' && af !== 'fav' && af !== 'favoritados' && (m.genre || '').toLowerCase() !== af.toLowerCase()) return false;
                            if (APP_STATE.filterYear && (m.year || '') !== APP_STATE.filterYear) return false;
                            return true;
                        });
                        _infoMovieIndex = _infoMovieList.findIndex(function(m) { return m.id === item.id; });
                        if (_infoMovieIndex < 0) _infoMovieIndex = 0;
                        if (item.type === 'series') {
                            Logic.showSeriesInfo();
                            UI.openModal('modal-series-info');
                        } else {
                            Logic.showMovieInfo();
                            UI.openModal('modal-movie-info');
                        }
                    }
                } else {
                    // CREATE MODE: real-time save, no modal close
                    if (item.titlePt) {
                        var dup = APP_STATE.movies.find(function(m) {
                            return m.type === item.type && m.titlePt && m.titlePt.toLowerCase() === item.titlePt.toLowerCase();
                        });
                        if (dup) {
                            var toast = document.getElementById('modal-toast');
                            var txt = document.getElementById('modal-toast-text');
                            if (toast && txt) {
                                txt.innerText = 'JÁ EXISTE: ' + item.titlePt;
                                toast.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[9px] font-black uppercase tracking-wider mb-4 animate-pulse bg-red-600/90';
                                toast.classList.remove('hidden');
                                setTimeout(function() { toast.classList.add('hidden'); }, 3000);
                            }
                            return;
                        }
                    }

                    APP_STATE.movies.push(item);
                    Store.setItem('cinecatalog_v126', Storage.toJSON());
                    _checkStorageQuota();
                    ConfigAutoSave();
                    Render.all();
                    UI.updateCounters();
                    Logic.updateReminderBadge();

                    if (type === 'filmes') {
                        ['f-title','f-year','f-duration','f-director','f-cast','f-desc','f-trailer-url','f-other-info'].forEach(function(id) {
                            var el = document.getElementById(id);
                            if (el) el.value = '';
                        });
                        var mediaEl = document.getElementById('f-media-url');
                        if (mediaEl) { mediaEl.value = ''; delete mediaEl.dataset.ref; delete mediaEl.dataset.path; }
                        document.getElementById('f-category').value = '';
                        document.getElementById('f-stars').value = 0;
                        document.querySelectorAll('#star-input-container i').forEach(function(s) { s.classList.remove('text-yellow-500'); });
                        UI.resetPoster();
                        document.querySelectorAll('.status-check-item').forEach(function(item) {
                            item.classList.remove('active-new', 'active-watch', 'active-fav');
                            item.querySelector('input').checked = false;
                        });
                    } else if (type === 'series') {
                        // SÉRIES: os campos NÃO são resetados e a janela permanece aberta.
                        // O fechamento acontece apenas pelo botão "X".
                    } else if (type === 'estreias') {
                        // Dynamic estreia form clone not supported; reset to blank
                        var deFields = document.getElementById('dynamic-estreias-fields');
                        if (deFields) {
                            deFields.innerHTML = '';
                            UI._estreiaCounter = 0;
                            UI._estreiaSavedIds = {};
                            UI._addEstreiaRow();
                            UI._updateEstreiaSummary();
                        }
                    }

                    var typeLabel = type === 'filmes' ? 'Filme' : (type === 'series' ? 'Série' : 'Estreia');
                    Logic.showModalStatus(typeLabel + ' salvo em tempo real! Card criado na tela principal.', 'green', 6000);
                    // Auto-scroll to top so user sees the notification
                    var body = document.querySelector('#modal-cadastro .p-8.overflow-y-auto');
                    if (body) body.scrollTop = 0;

                    // Store last saved item (CLONAR button removed)
                    _lastSavedItem = item;
                    var cloneBtn = document.getElementById('btn-clone-data');
                    if (cloneBtn) cloneBtn.style.display = 'none';
                    var dupBtn = document.getElementById('btn-duplicate-series');
                    if (dupBtn) dupBtn.style.display = 'none';
                    // Modal stays open. User closes with X button.
                }
            } catch(e) {
                alert('ERRO: ' + e.message);
            }
        }

        Logic.cloneLastData = function() {
            try {
                var last = _lastSavedItem;
                if (!last) { Logic.showModalStatus('Nenhum dado salvo para clonar.', 'red'); return; }
                var type = last.type || 'filmes';
                if (type === 'estreias') { Logic.showModalStatus('Função CLONAR não disponível para Estreias.', 'red'); return; }
                UI.switchTab(type);
                var sv = function(id, v) { var el = document.getElementById(id); if (el) el.value = v == null ? '' : v; };
                var sc = function(id, v) { var el = document.getElementById(id); if (el) el.checked = !!v; };
                if (type === 'filmes') {
                    sv('f-title', last.titlePt || last.originalTitle || '');
                    sv('f-year', last.year || '');
                    sv('f-duration', last.duration || '');
                    sv('f-director', last.director || '');
                    sv('f-cast', last.cast || '');
                    sv('f-desc', last.desc || '');
                    sv('f-trailer-url', last.trailUrl || '');
                    sv('f-other-info', last.otherInfo || '');
                    (function(){ var v = last.mediaFile || '', el = document.getElementById('f-media-url'); if (el) { try { var r = JSON.parse(v); el.value = r.name || ''; if (r.blob) el.dataset.ref = v; } catch(e) { el.value = v; } } })();
                    sv('f-category', last.genre || '');
                    sv('f-stars', last.stars || 0);
                    sc('f-status-new', last.statuses && last.statuses.new);
                    sc('f-status-watch', last.statuses && last.statuses.watch);
                    sc('f-status-fav', last.statuses && last.statuses.favorite);
                    if (last.imageKey && typeof StoreImages !== 'undefined') {
                        var bl = StoreImages.blobFor(last.imageKey);
                        var url = StoreImages.urlFor(last.imageKey);
                        var piF = document.getElementById('f-poster-img');
                        if (url && piF) { piF.src = url; piF.classList.add('show'); }
                        if (bl) {
                            Logic._posterBlobs = Logic._posterBlobs || {};
                            Logic._posterBlobs['f'] = bl;
                        }
                    } else if (last.image && /^data:|^https?:\/\//.test(last.image)) {
                        var pi = document.getElementById('f-poster-img');
                        if (pi) { pi.src = last.image; pi.classList.add('show'); }
                        var pu = document.getElementById('f-poster-url');
                        if (pu) pu.value = last.image.indexOf('data:') === 0 ? '' : last.image;
                    }
                } else if (type === 'series') {
                    sv('fs-title', last.titlePt || last.originalTitle || '');
                    sv('fs-year', last.year || '');
                    sv('fs-duration', last.duration || '');
                    sv('fs-season', last.season || '');
                    sv('fs-episode-number', last.episodeNumber || '');
                    sv('fs-episode-title', last.episodeTitle || '');
                    sv('fs-director', last.director || '');
                    sv('fs-cast', last.cast || '');
                    sv('fs-other-info', last.otherInfo || '');
                    sv('fs-category', last.genre || '');
                    sv('fs-stars', last.stars || 0);
                    sv('fs-country', last.country || '');
                    sv('fs-trailer-url', last.trailerUrl || last.trailUrl || '');
                    sc('fs-status-new', last.statuses && last.statuses.new);
                    sc('fs-status-watch', last.statuses && last.statuses.watch);
                    sc('fs-status-fav', last.statuses && last.statuses.favorite);
                    UI._seasonData = (last.dynamicSeasons && last.dynamicSeasons.length > 0) ? last.dynamicSeasons.slice() : [];
                    UI._episodeData = (last.dynamicEpisodesNew && last.dynamicEpisodesNew.length > 0) ? last.dynamicEpisodesNew.slice() : [];
                    UI._renderSeasonBlocks();
                    UI._renderEpisodeBlocks();
                    if (last.imageKey && typeof StoreImages !== 'undefined') {
                        var blS = StoreImages.blobFor(last.imageKey);
                        var urlS = StoreImages.urlFor(last.imageKey);
                        var piFS = document.getElementById('fs-poster-img');
                        if (urlS && piFS) { piFS.src = urlS; piFS.classList.add('show'); }
                        if (blS) {
                            Logic._posterBlobs = Logic._posterBlobs || {};
                            Logic._posterBlobs['fs'] = blS;
                        }
                    } else if (last.image && /^data:|^https?:\/\//.test(last.image)) {
                        var pi = document.getElementById('fs-poster-img');
                        if (pi) { pi.src = last.image; pi.classList.add('show'); }
                        var pu = document.getElementById('fs-poster-url');
                        if (pu) pu.value = last.image.indexOf('data:') === 0 ? '' : last.image;
                    }
                } else if (type === 'estreias') {
                    // Load last estreia data into dynamic form
                    var deFields = document.getElementById('dynamic-estreias-fields');
                    if (deFields) {
                        deFields.innerHTML = '';
                        UI._estreiaCounter = 0;
                        UI._estreiaSavedIds = {};
                        UI._addEstreiaRow({
                            titlePt: last.titlePt || last.originalTitle || '',
                            originalTitle: last.originalTitle || '',
                            date: last.date || '',
                            trailUrl: last.trailUrl || '',
                            genre: last.genre || ''
                        });
                        UI._updateEstreiaSummary();
                    }
                }
                var cloneBtn = document.getElementById('btn-clone-data');
                if (cloneBtn) {
                    cloneBtn.disabled = true;
                    cloneBtn.innerHTML = '<i class="fas fa-check mr-1.5"></i> DADOS CARREGADOS';
                    cloneBtn.style.opacity = '0.5';
                    cloneBtn.style.cursor = 'not-allowed';
                }
                Logic.showModalStatus('Dados do ultimo ' + (type === 'filmes' ? 'filme' : type === 'series' ? 'episodio' : 'estreia') + ' carregados. Altere o que precisar e SALVE.', 'green');
            } catch(e) { alert('ERRO: ' + e.message); }
        };
