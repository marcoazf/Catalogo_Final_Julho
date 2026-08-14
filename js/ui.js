        const UI = {
            openModal(id) {
                const el = document.getElementById(id);
                if (!el) return;
                el.classList.add('active');
                document.getElementById('modal-toast')?.classList.add('hidden');
                document.getElementById('modal-title').innerHTML = 'CADASTRO <span style="-webkit-text-fill-color:#3B82F6">NOVO</span>';
                var cloneBtn = document.getElementById('btn-clone-data');
                if (cloneBtn) cloneBtn.style.display = 'none';
                var dupBtnOpen = document.getElementById('btn-duplicate-series');
                if (dupBtnOpen) { dupBtnOpen.style.display = 'none'; dupBtnOpen.disabled = false; dupBtnOpen.style.opacity = ''; dupBtnOpen.style.cursor = ''; dupBtnOpen.innerHTML = '<i class="fas fa-copy mr-1.5"></i> CLONAR SÉRIE'; }
                var saveBtn = document.getElementById('btn-save-v2');
                if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i> SALVAR +';
                _editingId = null;
                _lastSavedItem = null;
                _reopenInfoAfterSave = false;
                if (typeof this._lockCadastroTabs === 'function') this._lockCadastroTabs(false);
                var body = el.querySelector('.p-8.overflow-y-auto');
                if (body) body.scrollTop = 0;
                UI.resetAllForms();
                UI.switchTab(APP_STATE.currentView || 'filmes');
                Logic.renderCategorySelect();
                UI.resetPoster();
                // Auto-fill paths if active
                var cfg = window._appConfig;
                if (cfg) {
                    if (cfg.pathCardsActive && cfg.pathCards) {
                        var posterUrl = document.getElementById('f-poster-url');
                        if (posterUrl && !posterUrl.value) posterUrl.value = cfg.pathCards;
                    }
                    if ((cfg.pathSeriesCardsActive && cfg.pathSeriesCards) || (cfg.pathCardsActive && cfg.pathCards)) {
                        var fsPosterUrl = document.getElementById('fs-poster-url');
                        var seriesCardsPath = (cfg.pathSeriesCardsActive && cfg.pathSeriesCards) ? cfg.pathSeriesCards : cfg.pathCards;
                        if (fsPosterUrl && !fsPosterUrl.value) fsPosterUrl.value = seriesCardsPath;
                    }
                    if (cfg.pathVideosActive && cfg.pathVideos) {
                        var mediaUrl = document.getElementById('f-media-url');
                        if (mediaUrl && !mediaUrl.value) mediaUrl.value = cfg.pathVideos;
                    }
                }
            },
            closeModal(id) {
                const el = document.getElementById(id);
                if (!el) return;
                el.classList.remove('active');
                var modalBtnMap = {'modal-dashboard':'btn-dashboard','modal-generate-list':'btn-generate-list','modal-cadastro-log':'btn-cadastro-log','modal-config':'btn-config','modal-info':'btn-info'};
                if (modalBtnMap[id]) { var b = document.getElementById(modalBtnMap[id]); if (b) b.classList.remove('active'); }
                if (typeof this._lockCadastroTabs === 'function' && id === 'modal-cadastro') {
                    this._lockCadastroTabs(false);
                }
                var ae = document.activeElement;
                if (ae && ae !== document.body && ae.blur) ae.blur();
                document.getElementById('modal-toast')?.classList.add('hidden');
                if (id === 'modal-config' && typeof UI._saveConfigFromForm === 'function') {
                    UI._saveConfigFromForm();
                }
                if (id === 'modal-cadastro') {
                    var cloneBtn = document.getElementById('btn-clone-data');
                    if (cloneBtn) cloneBtn.style.display = 'none';
                    _reopenInfoAfterSave = false;
                    // Remove a classe edit-mode das áreas de poster
                    var fArea = document.getElementById('f-poster-area');
                    var fsArea = document.getElementById('fs-poster-area');
                    if (fArea) fArea.classList.remove('edit-mode');
                    if (fsArea) fsArea.classList.remove('edit-mode');
                    var fsCatTip = document.getElementById('fs-category-tooltip');
                    if (fsCatTip) fsCatTip.style.display = 'none';
                }
                if (id === 'modal-series-info' && typeof Logic._collapseAllInfoSeasons === 'function') {
                    Logic._collapseAllInfoSeasons();
                }
            },
            toggleModal(id) {
                const el = document.getElementById(id);
                if (!el) return;
                var opening = !el.classList.contains('active');
                if (opening) Logic._clearHeaderBtnActive();
                el.classList.toggle('active');
                if (id === 'modal-info') {
                    var btn = document.getElementById('btn-info');
                    if (btn) btn.classList.toggle('active', opening);
                    if (opening) Logic.renderInfoFeatures();
                }
            },
            _lockCadastroTabs(activeType) {
                ['tab-filmes', 'tab-series', 'tab-estreias'].forEach(function(id) {
                    var t = document.getElementById(id);
                    if (!t) return;
                    var isActiveTab = (id === 'tab-' + activeType);
                    if (activeType && !isActiveTab) {
                        t.setAttribute('disabled', 'disabled');
                        t.style.pointerEvents = 'none';
                        t.style.opacity = '0.4';
                        t.style.cursor = 'not-allowed';
                        t.classList.remove('active');
                    } else {
                        t.removeAttribute('disabled');
                        t.style.pointerEvents = '';
                        t.style.opacity = '';
                        t.style.cursor = '';
                    }
                });
            },
            _shortcutsEditing: null,
            _shortcutsDefaults: [
                { id: 's-filmes', key: 'Ctrl+1', label: 'Aba Filmes', action: 'shortcuts_filmes', locked: false },
                { id: 's-series', key: 'Ctrl+2', label: 'Aba Séries', action: 'shortcuts_series', locked: false },
                { id: 's-estreias', key: 'Ctrl+3', label: 'Aba Estreias', action: 'shortcuts_estreias', locked: false },
                { id: 's-pesquisar', key: 'Ctrl+F', label: 'Pesquisar', action: 'shortcuts_pesquisar', locked: false },
                { id: 's-cadastrar', key: 'Ctrl+E', label: 'Cadastrar novo item', action: 'shortcuts_cadastrar', locked: false },
                { id: 's-info', key: 'Ctrl+I', label: 'Abrir INFO do item selecionado', action: 'shortcuts_info', locked: false },
                { id: 's-ctx', key: 'Ctrl+M', label: 'Abrir menu de contexto', action: 'shortcuts_ctx', locked: false },
                { id: 's-view', key: 'Ctrl+T', label: 'Alternar modo de visualização', action: 'shortcuts_view', locked: false },
                { id: 's-f5', key: 'F5', label: 'Desabilitado (prevenção)', action: 'disabled', locked: true },
                { id: 's-f12', key: 'F12', label: 'Desabilitado (prevenção)', action: 'disabled', locked: true },
                { id: 's-f11', key: 'F11', label: 'Desabilitado (prevenção)', action: 'disabled', locked: true },
                { id: 's-esc', key: 'Escape', label: 'Fechar pop-ups e modais', action: 'shortcuts_esc', locked: true },
                { id: 's-dpad', key: '← → ↑ ↓', label: 'Navegação DPAD entre cards (Smart TV)', action: 'shortcuts_dpad', locked: true }
            ],
            _shortcutsLoad: function() {
                var saved = null;
                try { saved = JSON.parse(Store.getItem('cinecatalog_shortcuts')); } catch(e) {}
                if (saved && Array.isArray(saved)) return saved;
                return JSON.parse(JSON.stringify(UI._shortcutsDefaults));
            },
            _shortcutsPersist: function(list) {
                Store.setItem('cinecatalog_shortcuts', JSON.stringify(list));
            },
            _shortcutsRender: function() {
                var list = UI._shortcutsLoad();
                var container = document.getElementById('shortcuts-list');
                if (!container) return;
                var html = '';
                for (var i = 0; i < list.length; i++) {
                    var s = list[i];
                    var locked = s.locked ? 'opacity:0.5;pointer-events:none;' : '';
                    var removeBtn = s.locked ? '' : '<button data-onclick="UI._shortcutsRemove(\'' + s.id + '\')" style="background:rgba(239,68,68,0.15);color:#EF4444;border:1px solid rgba(239,68,68,0.3);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;flex-shrink:0;transition:all 0.2s" data-onmouseover="this.style.background=\'rgba(239,68,68,0.3)\'" data-onmouseout="this.style.background=\'rgba(239,68,68,0.15)\'" title="Remover atalho"><i class="fas fa-times"></i></button>';
                    var resetBtn = s.locked ? '' : '<button data-onclick="UI._shortcutsResetOne(\'' + s.id + '\')" style="background:rgba(245,158,11,0.15);color:#F59E0B;border:1px solid rgba(245,158,11,0.3);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;flex-shrink:0;transition:all 0.2s" data-onmouseover="this.style.background=\'rgba(245,158,11,0.3)\'" data-onmouseout="this.style.background=\'rgba(245,158,11,0.15)\'" title="Repor atalho padrão"><i class="fas fa-undo"></i></button>';
                    html += '<div id="shortcut-row-' + s.id + '" style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.85rem;border-radius:0.75rem;border:1px solid var(--border-color);background:var(--input-bg);margin-bottom:0.5rem;transition:all 0.25s;' + locked + '">';
                    html += '<div style="flex:1;min-width:0"><div style="font-size:0.8rem;font-weight:700;color:var(--text-color);margin-bottom:0.15rem">' + s.label + '</div>';
                    html += '<div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.04em">' + s.action + '</div></div>';
                    html += '<button data-onclick="UI._shortcutsEdit(\'' + s.id + '\')" style="background:var(--input-bg);border:1px solid var(--border-color);border-radius:0.5rem;padding:0.35rem 0.75rem;cursor:pointer;transition:all 0.2s;min-width:120px;text-align:center;font-size:0.75rem;font-weight:800;color:var(--accent-blue);font-family:monospace;letter-spacing:0.05em" data-onmouseover="this.style.borderColor=\'var(--accent-blue)\';this.style.boxShadow=\'0 0 0 3px rgba(59,130,246,0.15)\'" data-onmouseout="this.style.borderColor=\'var(--border-color)\';this.style.boxShadow=\'none\'" title="Clique para alterar">' + s.key + '</button>';
                    html += '<div style="display:flex;gap:0.3rem">' + resetBtn + removeBtn + '</div>';
                    html += '</div>';
                }
                container.innerHTML = html;
            },
            _shortcutsEdit: function(id) {
                if (UI._shortcutsEditing) UI._shortcutsCancelEdit();
                UI._shortcutsEditing = id;
                var row = document.getElementById('shortcut-row-' + id);
                if (!row) return;
                var btn = row.querySelector('button[onclick*="_shortcutsEdit"]');
                if (btn) {
                    btn.textContent = '...';
                    btn.style.borderColor = '#F59E0B';
                    btn.style.color = '#F59E0B';
                    btn.style.boxShadow = '0 0 15px rgba(245,158,11,0.25)';
                }
                UI._shortcutsKeyHandler = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.key === 'Escape') { UI._shortcutsCancelEdit(); return; }
                    var key = UI._shortcutsBuildKey(e);
                    if (!key) return;
                    var list = UI._shortcutsLoad();
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].id !== id && list[i].key === key && !list[i].locked) {
                            list[i].key = '—';
                        }
                    }
                    for (var j = 0; j < list.length; j++) {
                        if (list[j].id === id) { list[j].key = key; break; }
                    }
                    UI._shortcutsPersist(list);
                    UI._shortcutsEditing = null;
                    document.removeEventListener('keydown', UI._shortcutsKeyHandler, true);
                    UI._shortcutsRender();
                };
                document.addEventListener('keydown', UI._shortcutsKeyHandler, true);
            },
            _shortcutsCancelEdit: function() {
                UI._shortcutsEditing = null;
                if (UI._shortcutsKeyHandler) document.removeEventListener('keydown', UI._shortcutsKeyHandler, true);
                UI._shortcutsRender();
            },
            _shortcutsBuildKey: function(e) {
                var parts = [];
                if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
                if (e.altKey) parts.push('Alt');
                if (e.shiftKey) parts.push('Shift');
                var k = e.key;
                if (['Control','Alt','Shift','Meta'].indexOf(k) !== -1) return null;
                if (k === ' ') k = 'Space';
                else if (k === 'ArrowUp') k = '↑';
                else if (k === 'ArrowDown') k = '↓';
                else if (k === 'ArrowLeft') k = '←';
                else if (k === 'ArrowRight') k = '→';
                parts.push(k);
                return parts.join('+');
            },
            _shortcutsRemove: function(id) {
                var list = UI._shortcutsLoad();
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === id) { list[i].key = '—'; break; }
                }
                UI._shortcutsPersist(list);
                UI._shortcutsRender();
            },
            _shortcutsResetOne: function(id) {
                var list = UI._shortcutsLoad();
                var def = UI._shortcutsDefaults.find(function(d) { return d.id === id; });
                if (!def) return;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === id) { list[i].key = def.key; break; }
                }
                UI._shortcutsPersist(list);
                UI._shortcutsRender();
            },
            applyShortcuts: function() {
                Logic.showStatus('Atalhos aplicados com sucesso');
            },
            toggleSearchBar() {
                var container = document.getElementById('search-bar-container');
                var isOpening = !container.classList.contains('active');
                container.classList.toggle('active');
                var btn = document.querySelector('button[onclick*="toggleSearchBar"]');
                if (btn) btn.classList.toggle('active', isOpening);
                if (isOpening) setTimeout(function(){ document.getElementById('main-search').focus(); }, 100);
            },
            toggleFilters() {
                var dd = document.getElementById('filters-dropdown');
                var btn = document.getElementById('btn-filters');
                var opening = dd.classList.contains('hidden');
                dd.classList.toggle('hidden');
                if (btn) btn.classList.toggle('active', opening);
                if (btn && btn.blur) btn.blur();
                if (opening) {
                    this._populateFilterLists();
                    this.updateFilterButtonState();
                }
            },
            _populateFilterLists() {
                // Categories
                var cats = Logic.getCategories();
                var catContainer = document.getElementById('filter-categories-list');
                if (catContainer) {
                    var html = '';
                    var shown = 0;
                    cats.forEach(function(c) {
                        if (shown < 7) {
                            var active = APP_STATE.activeFilter.toLowerCase() === c.toLowerCase() ? ' active' : '';
                            html += '<button data-onclick="Logic.applyFilter(\'' + c.replace(/'/g,"\\'") + '\')" class="filter-btn' + active + '"><i class="fas fa-tag mr-2"></i>' + c + '</button>';
                            shown++;
                        }
                    });
                    catContainer.innerHTML = html;
                }
                // Year options
                var yearSet = {};
                APP_STATE.movies.forEach(function(m) {
                    if (m.type === APP_STATE.currentView && m.year && m.year.trim()) {
                        yearSet[m.year.trim()] = true;
                    }
                });
                var years = Object.keys(yearSet).sort(function(a, b) { return parseInt(b) - parseInt(a); }).slice(0, 10);
                var yrContainer = document.getElementById('filter-year-list');
                if (yrContainer) {
                    yrContainer.innerHTML = years.map(function(y) {
                        var active = APP_STATE.filterYear === y ? ' active' : '';
                        return '<button data-onclick="Logic.setYearFilter(\'' + y + '\')" class="filter-year-btn' + active + '">' + y + '</button>';
                    }).join('');
                }
            },
            updateFilterButtonState() {
                var allBtns = document.querySelectorAll('#filters-dropdown .filter-btn');
                allBtns.forEach(function(b) {
                    var f = b.dataset.filter;
                    if (!f) return;
                    var active = false;
                    if (f === 'todos') active = APP_STATE.activeFilter === 'all' && APP_STATE.sortBy === 'default' && !APP_STATE.filterYear;
                    else if (f === 'recente') active = APP_STATE.sortBy === 'recent';
                    else if (f === 'antigos') active = APP_STATE.sortBy === 'old';
                    else if (f === 'az') active = APP_STATE.sortBy === 'az';
                    else if (f === 'favoritados') active = APP_STATE.activeFilter === 'fav';
                    else if (f === 'new' || f === 'watch' || f === 'fav') active = APP_STATE.activeFilter === f;
                    b.classList.toggle('active', active);
                });
                // Update year buttons
                document.querySelectorAll('.filter-year-btn').forEach(function(b) {
                    b.classList.toggle('active', b.textContent.trim() === APP_STATE.filterYear);
                });
            },
            closeNotifications() {
                document.getElementById('notification-overlay').classList.remove('active');
                document.getElementById('btn-notifications')?.classList.remove('active');
                // Mark as closed for today
                var todayStr = new Date().toISOString().slice(0,10);
                var key = 'cinecatalog_notif_' + todayStr;
                var raw = Store.getItem(key);
                var nd = raw ? JSON.parse(raw) : { count: 0, closed: false, firstShown: true };
                nd.closed = true;
                Store.setItem(key, JSON.stringify(nd));
            },
            toggleNotifications() {
                var overlay = document.getElementById('notification-overlay');
                var btn = document.getElementById('btn-notifications');
                if (overlay.classList.contains('active')) { UI.closeNotifications(); if (btn) btn.classList.remove('active'); }
                else {
                    Logic._clearHeaderBtnActive();
                    if (btn) btn.classList.add('active');
                    // Listagem completa: todas as estreias ordenadas por data (item e)
                    var list = Logic._buildAllEstreiaNotifications();
                    Logic.showEstreiaNotifications(list, { count: 1, closed: false, firstShown: false }, '', true);
                }
            },
            toggleReminderPanel() {
                var panel = document.getElementById('reminder-panel');
                var btn = document.getElementById('btn-reminders');
                if (panel.classList.contains('active')) { UI.closeReminderPanel(); if (btn) btn.classList.remove('active'); return; }
                Logic._clearHeaderBtnActive();
                if (btn) btn.classList.add('active');
                Logic.renderReminderList();
                panel.classList.add('active');
            },
            closeReminderPanel() {
                document.getElementById('reminder-panel').classList.remove('active');
                document.getElementById('btn-reminders')?.classList.remove('active');
            },
            switchTab(type) {
                document.querySelectorAll('.tab-premium').forEach(t => t.classList.toggle('active', t.dataset.tab === type));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-content-' + type));
                var dupBtnTab = document.getElementById('btn-duplicate-series');
                if (dupBtnTab) dupBtnTab.style.display = 'none';
                // Hide CLONAR button always (removed per melhorias2.md item d)
                var cloneBtn = document.getElementById('btn-clone-data');
                if (cloneBtn) {
                    cloneBtn.style.display = 'none';
                }
                // Initialize dynamic estreia form when switching to it
                if (type === 'estreias' && !_editingId) {
                    UI.resetAllForms();
                }
                // Render sections 2/3 of the series form when switching to it
                if (type === 'series') {
                    if (typeof UI._renderSeasonBlocks === 'function') UI._renderSeasonBlocks();
                    if (typeof UI._renderEpisodeBlocks === 'function') UI._renderEpisodeBlocks();
                }
                // On other tabs, footer counters show the real saved totals
                if (type !== 'estreias') {
                    UI.updateCounters();
                }
            },
            updatePreview(url, previewId) {
                const img = document.getElementById(previewId);
                if (!img) return;
                if (url) { img.src = url; img.classList.remove('hidden'); }
                else { img.classList.add('hidden'); img.src = ''; }
            },
            updateCounters() {
                var movies = APP_STATE.movies;
                var f = movies.filter(function(m) { return m.type === 'filmes'; }).length;
                var s = movies.filter(function(m) { return m.type === 'series'; }).length;
                var e = movies.filter(function(m) { return m.type === 'estreias'; }).length;
                var cf = document.getElementById('counter-filmes');
                var cs = document.getElementById('counter-series');
                var ce = document.getElementById('counter-estreias');
                if (cf) cf.innerText = f;
                if (cs) cs.innerText = s;
                if (ce) ce.innerText = e;
            },
            updateFooterStats() {
                var currentType = APP_STATE.currentView;
                var typeTotal = APP_STATE.movies.filter(function(m) { return m.type === currentType; }).length;
                var filtered = APP_STATE.movies.filter(function(m) {
                    if (APP_STATE.currentView !== m.type) return false;
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
                }).length;
                var typeLabel = currentType === 'filmes' ? 'FILMES' : currentType === 'series' ? 'SÉRIES' : 'ESTREIAS';
                var el = document.getElementById('stats-counter');
                if (el) el.innerText = filtered + ' DE ' + typeTotal + ' ' + typeLabel;
            },
            resetAllForms() {
                ['f-title','f-year','f-duration','f-director','f-cast','f-desc','f-trailer-url','f-other-info'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.value = '';
                });
                ['fs-title','fs-year','fs-duration','fs-episode-number','fs-episode-title','fs-season','fs-director','fs-cast','fs-desc','fs-other-info','fs-country','fs-trailer-url'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.value = '';
                });
                UI._seasonData = [];
                UI._episodeData = [];
                var seasonBlocks = document.getElementById('series-season-blocks');
                if (seasonBlocks) seasonBlocks.innerHTML = '';
                var seasonHint = document.getElementById('series-seasons-hint');
                if (seasonHint) seasonHint.style.display = 'block';
                var epBlocks = document.getElementById('series-episode-blocks');
                if (epBlocks) epBlocks.innerHTML = '';
                var epHint = document.getElementById('series-episodes-hint');
                if (epHint) epHint.style.display = 'block';
                var stTotal = document.getElementById('series-seasons-total');
                if (stTotal) stTotal.textContent = '0 Temporadas';
                var epTotal = document.getElementById('series-episodes-total');
                if (epTotal) epTotal.textContent = '0 Episódios';
                // Reset dynamic estreia form
                var deFields = document.getElementById('dynamic-estreias-fields');
                if (deFields) {
                    deFields.innerHTML = '';
                    UI._estreiaCounter = 0;
                    UI._estreiaSavedIds = {};
                    UI._addEstreiaRow();
                    UI._updateEstreiaSummary();
                    UI._updateEstreiaAutoDeleteWarning();
                }
                var fcat = document.getElementById('f-category');
                if (fcat) fcat.value = '';
                document.querySelectorAll('[id$="-watched"]').forEach(function(c) { c.checked = false; });
                document.querySelectorAll('[id$="-stars"]').forEach(function(s) { s.value = 0; });
                document.querySelectorAll('.tab-content .fa-star').forEach(function(s) { s.classList.remove('text-yellow-500'); });
                document.querySelectorAll('.tab-content img[id^="preview-"]').forEach(function(i) { i.classList.add('hidden'); i.src = ''; });
                UI.resetPoster();
                UI.resetPoster('fs');
                var mu = document.getElementById('f-media-url');
                if (mu) mu.value = '';
                var fscat = document.getElementById('fs-category');
                if (fscat) fscat.value = '';
                document.querySelectorAll('.status-check-item').forEach(function(item) {
                    item.classList.remove('active-new', 'active-watch', 'active-fav');
                    var inp = item.querySelector('input');
                    if (inp) inp.checked = false;
                });
            },
            setPosterPreview(src, prefix) {
                prefix = prefix || 'f';
                var img = document.getElementById(prefix + '-poster-img');
                var area = document.getElementById(prefix + '-poster-area');
                var fallback = document.getElementById(prefix + '-poster-fallback');
                if (!img || !area) return;
                img.style.display = '';
                var oldPreview = img.src;
                img.src = src || '';
                if (oldPreview && oldPreview.indexOf('blob:') === 0 && oldPreview !== (src || '')) {
                    try { URL.revokeObjectURL(oldPreview); } catch(e) {}
                }
                img.classList.toggle('show', !!src);
                area.classList.toggle('has-image', !!src);
                
                // Controla exibição do fallback apenas durante edição
                if (typeof _editingId !== 'undefined' && _editingId) {
                    area.classList.add('edit-mode');
                    if (fallback) {
                        fallback.style.display = src ? 'none' : 'flex';
                    }
                } else {
                    area.classList.remove('edit-mode');
                    if (fallback) {
                        fallback.style.display = 'none';
                    }
                }
                
                if (typeof _editingId !== 'undefined' && _editingId) {
                    var _item = APP_STATE.movies.find(function(m) { return m.id === _editingId; });
                    if (_item) {
                        if (UI._restoringPoster) {
                            // Apenas preview: o item já carrega imageKey/image hidratada
                        } else if (src && src.indexOf('blob:') === 0) {
                            var pending = (Logic._posterBlobs || {})[prefix];
                            if (pending) {
                                var oldKey = _item.imageKey;
                                var key = 'img_' + _item.id;
                                if (oldKey && oldKey !== key) StoreImages.remove(oldKey);
                                StoreImages.save(key, pending);
                                delete Logic._posterBlobs[prefix];
                                _item.imageKey = key;
                                _item.image = src;
                            } else {
                                if (_item.imageKey) { StoreImages.remove(_item.imageKey); delete _item.imageKey; }
                                _item.image = '';
                            }
                        } else {
                            if (_item.imageKey) { StoreImages.remove(_item.imageKey); delete _item.imageKey; }
                            _item.image = src || '';
                        }
                        Store.setItem('cinecatalog_v126', Storage.toJSON());
                        Render.all();
                    }
                }
            },
            resetPoster(prefix) {
                prefix = prefix || 'f';
                var img = document.getElementById(prefix + '-poster-img');
                var area = document.getElementById(prefix + '-poster-area');
                var fallback = document.getElementById(prefix + '-poster-fallback');
                if (!img || !area) return;
                img.style.display = '';
                var oldSrc = img.src;
                img.src = '';
                if (oldSrc && oldSrc.indexOf('blob:') === 0) {
                    try { URL.revokeObjectURL(oldSrc); } catch(e) {}
                }
                img.classList.remove('show');
                area.classList.remove('has-image');
                var puf = document.getElementById(prefix + '-poster-url');
                if (puf) puf.value = '';
                var wrap = document.getElementById(prefix + '-poster-url-wrap');
                if (wrap) wrap.classList.remove('hidden');
                if (Logic && Logic._posterBlobs) delete Logic._posterBlobs[prefix];
                
                // Controla exibição do fallback apenas durante edição
                if (typeof _editingId !== 'undefined' && _editingId) {
                    area.classList.add('edit-mode');
                    if (fallback) {
                        fallback.style.display = 'flex';
                    }
                } else {
                    area.classList.remove('edit-mode');
                    if (fallback) {
                        fallback.style.display = 'none';
                    }
                }
                
                if (typeof _editingId !== 'undefined' && _editingId) {
                    var _item = APP_STATE.movies.find(function(m) { return m.id === _editingId; });
                    if (_item) {
                        if (_item.imageKey) { StoreImages.remove(_item.imageKey); delete _item.imageKey; }
                        _item.image = '';
                        Store.setItem('cinecatalog_v126', Storage.toJSON());
                        Render.all();
                    }
                }
            },
            setZoom(lvl) {
                const map = { 1: 5, 2: 6, 3: 7, 4: 8 };
                const val = map[lvl];
                document.body.style.setProperty('--cards-per-row', val);
                document.querySelectorAll('.dynamic-grid').forEach(function(grid) {
                    grid.style.setProperty('--cards-per-row', val);
                });
                var gapTotal = (val - 1) * 1.5;
                document.querySelectorAll('.carrossel-track').forEach(function(track) {
                    track.style.setProperty('--cards-per-row', val);
                    track.style.setProperty('--carrossel-gap', gapTotal + 'rem');
                });
                document.querySelectorAll('.carrossel-container').forEach(function(c) {
                    c.style.setProperty('--carrossel-gap', gapTotal + 'rem');
                });
                if (typeof Logic._applyMarqueeZoom === 'function') Logic._applyMarqueeZoom();
                document.querySelectorAll('.zoom-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === lvl));
                APP_STATE.zoom = lvl;
            },
            initMediaPicker(prefix) {
                var btn = document.getElementById(prefix + '-media-picker-btn');
                var fileInput = document.getElementById(prefix + '-media-file');
                var urlField = document.getElementById(prefix + '-media-url');
                if (btn && fileInput && urlField) {
                    btn.addEventListener('click', function() {
                        var cfg = window._appConfig || {};
                        var basePath = '';
                        if (prefix === 'f' || prefix === 'fs') {
                            basePath = cfg.pathVideos || '';
                        }
                        if (_isElectron() && window.require) {
                            try {
                                var electron = window.require('electron');
                                if (electron && electron.dialog) {
                                    electron.dialog.showOpenDialog({
                                        title: 'Selecionar vídeo',
                                        defaultPath: basePath || undefined,
                                        properties: ['openFile'],
                                        filters: [{ name: 'Vídeos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv'] }]
                                    }).then(function(res) {
                                        if (res && !res.canceled && res.filePaths && res.filePaths[0]) {
                                            var selPath = res.filePaths[0];
                                            urlField.value = selPath;
                                            delete urlField.dataset.ref;
                                            urlField.dataset.path = selPath;
                                            try {
                                                var fs = window.require('fs');
                                                var buf = fs.readFileSync(selPath);
                                                var fName = selPath.split(/[\\\/]/).pop() || 'video';
                                                var file = new File([buf], fName, { type: 'video/*' });
                                                var blobUrl = URL.createObjectURL(file);
                                                var ref = {blob: blobUrl, name: fName};
                                                urlField.value = selPath;
                                                urlField.dataset.ref = JSON.stringify(ref);
                                            } catch(e2) {}
                                        }
                                    }).catch(function() {});
                                    return;
                                }
                            } catch(e) {}
                        }
                        if (basePath && 'showOpenFilePicker' in window) {
                            (async function() {
                                try {
                                    var handles = await window.showOpenFilePicker({ types: [{ description: 'Vídeos', accept: { 'video/*': ['.mp4','.mkv','.avi','.mov','.webm','.flv','.wmv'] } }], multiple: false });
                                    if (handles && handles[0]) {
                                        var file = await handles[0].getFile();
                                        var blobUrl = URL.createObjectURL(file);
                                        var ref = {blob: blobUrl, name: file.name};
                                        urlField.value = basePath + '\\' + file.name;
                                        urlField.dataset.ref = JSON.stringify(ref);
                                    }
                                } catch(e) {
                                    fileInput.click();
                                }
                            })();
                        } else {
                            fileInput.click();
                        }
                    });
                    fileInput.addEventListener('change', function() {
                        if (this.files && this.files[0]) {
                            var file = this.files[0];
                            var cfg = window._appConfig || {};
                            var basePath = '';
                            if (prefix === 'f' || prefix === 'fs') {
                                basePath = cfg.pathVideos || '';
                            }
                            var blobUrl = URL.createObjectURL(file);
                            var ref = {blob: blobUrl, name: file.name};
                            urlField.value = basePath ? (basePath + '\\' + file.name) : file.name;
                            urlField.dataset.ref = JSON.stringify(ref);
                            this.value = '';
                        }
                    });
                }
            },
            initPosterArea(prefix) {
                var area = document.getElementById(prefix + '-poster-area');
                var fileInput = document.getElementById(prefix + '-poster-file');
                if (area && fileInput) {
                    area.addEventListener('click', function() {
                        var cfg = window._appConfig || {};
                        var basePath = (prefix === 'fs' && cfg.pathSeriesCardsActive && cfg.pathSeriesCards) ? cfg.pathSeriesCards : (cfg.pathCards || '');
                        if (_isElectron() && window.require) {
                            try {
                                var electron = window.require('electron');
                                if (electron && electron.dialog) {
                                    var fs = window.require('fs');
                                    electron.dialog.showOpenDialog({
                                        title: 'Selecionar capa',
                                        defaultPath: basePath || undefined,
                                        properties: ['openFile'],
                                        filters: [{ name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
                                    }).then(function(res) {
                                        if (res && !res.canceled && res.filePaths && res.filePaths[0]) {
                                            var selPath = res.filePaths[0];
                                            var pu = document.getElementById(prefix + '-poster-url');
                                            if (pu) pu.value = selPath;
                                            fs.readFile(selPath, function(err, buf) {
                                                if (!err && buf) {
                                                    var fName = selPath.split(/[\\\/]/).pop() || 'capa';
                                                    var file = new File([buf], fName, { type: 'image/*' });
                                                    Logic.applyPosterFile(file, prefix);
                                                }
                                            });
                                        }
                                    }).catch(function() {});
                                    return;
                                }
                            } catch(e) {}
                        }
                        if (basePath && 'showOpenFilePicker' in window) {
                            (async function() {
                                try {
                                    var handles = await window.showOpenFilePicker({ types: [{ description: 'Imagens', accept: { 'image/*': ['.jpg','.jpeg','.png','.webp'] } }], multiple: false });
                                    if (handles && handles[0]) {
                                        var file = await handles[0].getFile();
                                        if (file && file.type.startsWith('image/')) {
                                            Logic.applyPosterFile(file, prefix);
                                        }
                                        var pu = document.getElementById(prefix + '-poster-url');
                                        if (pu) pu.value = basePath + '\\' + file.name;
                                    }
                                } catch(e) {
                                    fileInput.click();
                                }
                            })();
                        } else {
                            fileInput.click();
                        }
                    });
                    fileInput.addEventListener('change', function(e) {
                        if (this.files && this.files[0]) {
                            var file = this.files[0];
                            var cfg = window._appConfig || {};
                            var basePath = (prefix === 'fs' && cfg.pathSeriesCardsActive && cfg.pathSeriesCards) ? cfg.pathSeriesCards : (cfg.pathCards || '');
                            Logic.applyPosterFile(file, prefix);
                            var pu = document.getElementById(prefix + '-poster-url');
                            if (pu) pu.value = basePath ? (basePath + '\\' + file.name) : file.name;
                            this.value = '';
                        }
                    });
                    area.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        this.classList.add('dragover');
                    });
                    area.addEventListener('dragleave', function() {
                        this.classList.remove('dragover');
                    });
                    area.addEventListener('drop', function(e) {
                        e.preventDefault();
                        this.classList.remove('dragover');
                        var file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                            Logic.applyPosterFile(file, prefix);
                        }
                    });
                    area.addEventListener('paste', function(e) {
                        var items = e.clipboardData.items;
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].type.startsWith('image/')) {
                                var file = items[i].getAsFile();
                                if (file) {
                                    Logic.applyPosterFile(file, prefix);
                                }
                                break;
                            }
                        }
                    });
                }
                var clearBtn = document.getElementById(prefix + '-poster-clear');
                if (clearBtn) {
                    clearBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        UI.resetPoster(prefix);
                    });
                }
                var urlField = document.getElementById(prefix + '-poster-url');
                if (urlField) {
                    urlField.addEventListener('input', function() {
                        if (this.value) {
                            UI.setPosterPreview(this.value, prefix);
                        } else {
                            UI.resetPoster(prefix);
                        }
                    });
                }
            },
            renderDashboard() {
                var allMovies = APP_STATE.movies;
                var movies = allMovies;
                var range = this._dashTimeFilterRange;
                if (range && this._dashTimeFilter !== 'todos') {
                    movies = allMovies.filter(function(m) {
                        var ts = m._createdAt || m.id;
                        if (!ts) return false;
                        var d = new Date(parseInt(ts));
                        return !isNaN(d.getTime()) && d >= range.start && d <= range.end;
                    });
                }
                var total = movies.length;
                var filmes = movies.filter(function(m) { return m.type === 'filmes'; }).length;
                var series = movies.filter(function(m) { return m.type === 'series'; }).length;
                var estreias = movies.filter(function(m) { return m.type === 'estreias'; }).length;

                document.getElementById('dc-total').innerText = total;
                document.getElementById('dc-filmes').innerText = filmes;
                document.getElementById('dc-series').innerText = series;
                document.getElementById('dc-estreias').innerText = estreias;

                if (this._charts) {
                    this._charts.forEach(function(c) { c.destroy(); });
                }
                this._charts = [];

                if (typeof Chart === 'undefined') {
                    document.querySelectorAll('.chart-box').forEach(function(b) {
                        b.innerHTML = '<div class="chart-empty">Chart.js não disponível</div>';
                    });
                    return;
                }

                var self = this;
                var textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim() || '#f3f4f6';
                var textSec = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#9ca3af';
                var fontFamily = "'Inter', sans-serif";
                var titleOpts = { display: true, color: textColor, font: { size: 12, weight: 'bold', family: fontFamily }, padding: { bottom: 12 } };
                var legendOpts = { position: 'bottom', labels: { color: textSec, font: { size: 11, weight: 'bold', family: fontFamily }, padding: 10, boxWidth: 12, boxHeight: 12 } };

                function createChart(id, config) {
                    var canvas = document.getElementById(id);
                    if (!canvas) return null;
                    try {
                        var chart = new Chart(canvas, config);
                        self._charts.push(chart);
                        return chart;
                    } catch(e) { return null; }
                }

                // Type distribution (donut)
                createChart('chart-type', {
                    type: 'doughnut',
                    data: {
                        labels: ['Filmes', 'Séries', 'Estreias'],
                        datasets: [{ data: [filmes, series, estreias], backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B'], borderWidth: 0, hoverOffset: 8 }]
                    },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: legendOpts, title: Object.assign({}, titleOpts, { text: 'POR TIPO' }) }, cutout: '65%' }
                });

                // Status distribution (donut)
                var statusCounts = { new: 0, watch: 0, fav: 0, none: 0 };
                movies.forEach(function(m) {
                    var s = m.statuses || {};
                    if (s.favorite) statusCounts.fav++;
                    else if (s.watch) statusCounts.watch++;
                    else if (s.new) statusCounts.new++;
                    else statusCounts.none++;
                });
                createChart('chart-status', {
                    type: 'doughnut',
                    data: {
                        labels: ['Novo', 'Assistir', 'Favorito', 'Sem Status'],
                        datasets: [{ data: [statusCounts.new, statusCounts.watch, statusCounts.fav, statusCounts.none], backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#4B5563'], borderWidth: 0, hoverOffset: 8 }]
                    },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: legendOpts, title: Object.assign({}, titleOpts, { text: 'POR STATUS' }) }, cutout: '65%' }
                });

                // Genre distribution (bar)
                var genreMap = {};
                movies.forEach(function(m) {
                    if (m.genre && m.genre.trim()) {
                        genreMap[m.genre.trim()] = (genreMap[m.genre.trim()] || 0) + 1;
                    }
                });
                var genreEntries = Object.keys(genreMap).map(function(k) { return { label: k, count: genreMap[k] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 10);
                var genreLabels = genreEntries.map(function(e) { return e.label; });
                var genreData = genreEntries.map(function(e) { return e.count; });
                createChart('chart-genre', {
                    type: 'bar',
                    data: {
                        labels: genreLabels.length ? genreLabels : ['Sem dados'],
                        datasets: [{ label: 'Títulos', data: genreData.length ? genreData : [0], backgroundColor: genreLabels.map(function(_, i) { return 'hsla(217, 91%, 60%, ' + (0.5 + (genreLabels.length - i) / genreLabels.length * 0.5) + ')'; }), borderRadius: 6, borderSkipped: false }]
                    },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, title: Object.assign({}, titleOpts, { text: 'GÊNERO' }) }, scales: { x: { ticks: { color: textSec, font: { size: 10, weight: 'bold', family: fontFamily } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { beginAtZero: true, ticks: { color: textSec, font: { size: 10, family: fontFamily }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
                });

                // Ratings distribution (bar)
                var ratingCounts = [0, 0, 0, 0, 0, 0]; // index 0 = unrated, 1-5 = stars
                movies.forEach(function(m) {
                    var r = Math.min(Math.max(parseInt(m.stars) || 0, 0), 5);
                    ratingCounts[r]++;
                });
                var ratingLabels = ['Sem estrelas', '1 Estrela', '2 Estrelas', '3 Estrelas', '4 Estrelas', '5 Estrelas'];
                var ratingColors = ['#6B7280', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E'];
                createChart('chart-ratings', {
                    type: 'bar',
                    data: {
                        labels: ratingLabels,
                        datasets: [{ label: 'Títulos', data: ratingCounts, backgroundColor: ratingColors, borderRadius: 6, borderSkipped: false }]
                    },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, title: Object.assign({}, titleOpts, { text: 'AVALIAÇÕES (ESTRELAS)' }) }, scales: { x: { ticks: { color: textSec, font: { size: 10, weight: 'bold', family: fontFamily }, maxRotation: 0 }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { beginAtZero: true, ticks: { color: textSec, font: { size: 10, family: fontFamily }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
                });

                // Dynamic chart: render based on active selector button
                self._renderDynamicChart(textColor, textSec, fontFamily, titleOpts, legendOpts);
                // Init chart selector buttons
                self._initChartSelectors();
                self._initChartStyleSelectors();
            },
            _renderDynamicChart(textColor, textSec, fontFamily, titleOpts, legendOpts) {
                var movies = APP_STATE.movies;
                var activeBtn = document.querySelector('.dash-chart-btn.active');
                var mode = activeBtn ? activeBtn.getAttribute('data-chart') : 'consumo';
                var canvas = document.getElementById('chart-dynamic');
                if (!canvas) return;
                // Destroy previous dynamic chart
                if (this._dynamicChart) { this._dynamicChart.destroy(); this._dynamicChart = null; }
                if (typeof Chart === 'undefined') return;
                var self = this;
                var PALETTE = ['#3B82F6','#8B5CF6','#F59E0B','#EF4444','#22C55E','#EC4899','#14B8A6','#F97316','#60A5FA','#A855F7','#84CC16','#FB7185'];
                var labels = [], values = [], colors = [], title = '', legendLabel = 'Títulos', special = null;

                if (mode === 'consumo') {
                    var favCount = movies.filter(function(m) { var s = m.statuses || {}; return s.favorite; }).length;
                    var watchCount = movies.filter(function(m) { var s = m.statuses || {}; return s.watch; }).length;
                    var newCount = movies.filter(function(m) { var s = m.statuses || {}; return s.new; }).length;
                    var noneCount = movies.length - favCount - watchCount - newCount;
                    labels = ['Favoritados', 'Para Assistir', 'Novos', 'Sem Status'];
                    values = [favCount, watchCount, newCount, noneCount];
                    colors = ['#EF4444', '#F59E0B', '#3B82F6', '#4B5563'];
                    title = 'CONSUMO DO ACERVO';
                    legendLabel = 'Consumo';
                    special = 'doughnut';
                } else if (mode === 'decadas') {
                    var decades = {};
                    movies.forEach(function(m) {
                        if (m.year && m.year.trim()) {
                            var y = parseInt(m.year);
                            if (!isNaN(y)) {
                                var d = Math.floor(y / 10) * 10;
                                var key = d + 's';
                                decades[key] = (decades[key] || 0) + 1;
                            }
                        }
                    });
                    labels = Object.keys(decades).sort();
                    values = labels.map(function(k) { return decades[k]; });
                    colors = labels.map(function(_, i) { return PALETTE[i % PALETTE.length]; });
                    title = 'FILMES POR DÉCADA';
                } else if (mode === 'diretores') {
                    var dirMap = {};
                    movies.forEach(function(m) {
                        if (m.director && m.director.trim()) {
                            var d = m.director.trim();
                            dirMap[d] = (dirMap[d] || 0) + 1;
                        }
                    });
                    var dirEntries = Object.keys(dirMap).map(function(k) { return { label: k, count: dirMap[k] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 8);
                    labels = dirEntries.map(function(e) { return e.label; });
                    values = dirEntries.map(function(e) { return e.count; });
                    colors = ['#3B82F6','#8B5CF6','#F59E0B','#EF4444','#22C55E','#EC4899','#14B8A6','#F97316'];
                    title = 'TOP DIRETORES';
                    legendLabel = 'Filmes';
                } else if (mode === 'dias') {
                    var days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    var dayCounts = [0, 0, 0, 0, 0, 0, 0];
                    movies.forEach(function(m) {
                        var ts = m._createdAt || m.id;
                        if (ts) {
                            var d = new Date(parseInt(ts));
                            if (!isNaN(d.getTime())) {
                                dayCounts[d.getDay()]++;
                            }
                        }
                    });
                    labels = days;
                    values = dayCounts;
                    colors = labels.map(function(_, i) { return PALETTE[i % PALETTE.length]; });
                    title = 'CADASTROS POR DIA DA SEMANA';
                    legendLabel = 'Cadastros';
                } else if (mode === 'meses') {
                    var monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
                    var monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    movies.forEach(function(m) {
                        var ts = m._createdAt || m.id;
                        if (ts) {
                            var d = new Date(parseInt(ts));
                            if (!isNaN(d.getTime())) {
                                monthCounts[d.getMonth()]++;
                            }
                        }
                    });
                    labels = monthNames;
                    values = monthCounts;
                    colors = ['#3B82F6'];
                    title = 'CADASTROS POR MÊS';
                    legendLabel = 'Cadastros';
                    special = 'line';
                } else if (mode === 'generos') {
                    var genreMap = {};
                    movies.forEach(function(m) {
                        if (m.genre && m.genre.trim()) {
                            genreMap[m.genre.trim()] = (genreMap[m.genre.trim()] || 0) + 1;
                        }
                    });
                    var genreEntries = Object.keys(genreMap).map(function(k) { return { label: k, count: genreMap[k] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 10);
                    labels = genreEntries.map(function(e) { return e.label; });
                    values = genreEntries.map(function(e) { return e.count; });
                    colors = labels.map(function(_, i) { return PALETTE[i % PALETTE.length]; });
                    title = 'GÊNEROS MAIS CADASTRADOS';
                } else if (mode === 'genwatched') {
                    var wMap = {};
                    movies.forEach(function(m) {
                        if (m.type !== 'filmes') return;
                        var s = m.statuses || {};
                        if (!(s.watch || s.favorite)) return;
                        if (m.genre && m.genre.trim()) {
                            wMap[m.genre.trim()] = (wMap[m.genre.trim()] || 0) + 1;
                        }
                    });
                    var wEntries = Object.keys(wMap).map(function(k) { return { label: k, count: wMap[k] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 10);
                    labels = wEntries.map(function(e) { return e.label; });
                    values = wEntries.map(function(e) { return e.count; });
                    colors = labels.map(function(_, i) { return PALETTE[i % PALETTE.length]; });
                    title = 'GÊNEROS MAIS ASSISTIDOS (FILMES)';
                    legendLabel = 'Filmes assistidos';
                } else if (mode === 'seriestop') {
                    var sList = [];
                    movies.forEach(function(m) {
                        if (m.type !== 'series') return;
                        var seasons = 0, eps = 0;
                        if (m.dynamicEpisodes && m.dynamicEpisodes.length) {
                            eps = m.dynamicEpisodes.length;
                            m.dynamicEpisodes.forEach(function(ep) {
                                var s = parseInt(ep.season) || 1;
                                if (s > seasons) seasons = s;
                            });
                        } else {
                            seasons = m.season ? parseInt(m.season) || 1 : 1;
                            eps = m.episodeNumber ? parseInt(m.episodeNumber) || 0 : 0;
                            if (!eps) eps = 1;
                        }
                        sList.push({ t: m.titlePt || m.originalTitle || 'Série', seasons: seasons, eps: eps });
                    });
                    sList.sort(function(a, b) { return (b.eps - a.eps) || (b.seasons - a.seasons); });
                    var top = sList.slice(0, 8);
                    labels = top.map(function(x) { var nm = x.t; if (nm.length > 20) nm = nm.slice(0, 20) + '…'; return nm; });
                    values = top.map(function(x) { return x.eps; });
                    colors = ['#8B5CF6','#A78BFA','#7C3AED','#6D28D9','#8B5CF6','#A78BFA','#7C3AED','#6D28D9'];
                    title = 'SÉRIES: MAIS TEMPORADAS E EPISÓDIOS';
                    legendLabel = 'Episódios';
                }

                var style = this._dashChartStyle || special || 'bar';
                this._drawDynamic(canvas, style, labels, values, colors, title, legendLabel, textColor, textSec, fontFamily, titleOpts, legendOpts);
            },
            _drawDynamic(canvas, style, labels, values, colors, title, legendLabel, textColor, textSec, fontFamily, titleOpts, legendOpts) {
                var self = this;
                function barCfg() {
                    return {
                        type: 'bar',
                        data: {
                            labels: labels.length ? labels : ['Sem dados'],
                            datasets: [{ label: legendLabel, data: values.length ? values : [0], backgroundColor: colors.length ? colors : ['#3B82F6'], borderRadius: 6, borderSkipped: false }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: { legend: legendOpts, title: Object.assign({}, titleOpts, { text: title }) },
                            scales: {
                                x: { ticks: { color: textSec, font: { size: 10, weight: 'bold', family: fontFamily }, maxRotation: 30 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                                y: { beginAtZero: true, ticks: { color: textSec, font: { size: 10, family: fontFamily }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } }
                            }
                        }
                    };
                }
                var cfg;
                try {
                    if (style === 'doughnut' || style === 'pie') {
                        cfg = {
                            type: style,
                            data: { labels: labels.length ? labels : ['Sem dados'], datasets: [{ data: values.length ? values : [0], backgroundColor: colors.length ? colors : ['#3B82F6'], borderWidth: 0, hoverOffset: 8 }] },
                            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: legendOpts, title: Object.assign({}, titleOpts, { text: title }) }, cutout: style === 'doughnut' ? '60%' : undefined }
                        };
                    } else if (style === 'line') {
                        var lineCol = colors.length ? colors[0] : '#3B82F6';
                        cfg = barCfg();
                        cfg.type = 'line';
                        cfg.data.datasets = [{ label: legendLabel, data: values.length ? values : [0], borderColor: lineCol, backgroundColor: lineCol + '22', fill: true, tension: 0.3, pointBackgroundColor: colors.length ? colors : [lineCol], pointRadius: 4, pointHoverRadius: 7 }];
                    } else if (style === 'coluna') {
                        cfg = barCfg();
                        cfg.options.indexAxis = 'y';
                        cfg.options.scales = {
                            x: { beginAtZero: true, ticks: { color: textSec, font: { size: 10, family: fontFamily }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                            y: { ticks: { color: textSec, font: { size: 9, weight: 'bold', family: fontFamily } }, grid: { color: 'rgba(255,255,255,0.04)' } }
                        };
                    } else if (style === 'piramide') {
                        cfg = {
                            type: 'bar',
                            data: {
                                labels: labels.length ? labels : ['Sem dados'],
                                datasets: [
                                    { label: legendLabel, data: values.length ? values : [0], backgroundColor: colors.length ? colors : ['#3B82F6'], borderRadius: 4, borderSkipped: false },
                                    { label: legendLabel + ' (espelho)', data: (values.length ? values : [0]).map(function(v) { return -v; }), backgroundColor: (colors.length ? colors : ['#3B82F6']).map(function(c) { return c + '66'; }), borderRadius: 4, borderSkipped: false }
                                ]
                            },
                            options: {
                                indexAxis: 'y',
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: { legend: legendOpts, title: Object.assign({}, titleOpts, { text: title }) },
                                scales: {
                                    x: { ticks: { color: textSec, font: { size: 10, family: fontFamily }, callback: function(v) { return Math.abs(v); } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                                    y: { ticks: { color: textSec, font: { size: 9, weight: 'bold', family: fontFamily } }, grid: { color: 'rgba(255,255,255,0.04)' } }
                                }
                            }
                        };
                    } else {
                        cfg = barCfg();
                        if (style === '3d') {
                            var baseCols = colors.length ? colors : ['#3B82F6'];
                            cfg.data.datasets[0].borderWidth = 1.5;
                            cfg.data.datasets[0].borderColor = baseCols.map(function(c) { return c + 'AA'; });
                            cfg.data.datasets[0].backgroundColor = function(context) {
                                var chart = context.chart;
                                var area = chart.chartArea;
                                var col = baseCols[context.dataIndex % baseCols.length];
                                if (!area) return col;
                                var g = chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
                                g.addColorStop(0, col + '44');
                                g.addColorStop(0.5, col + 'CC');
                                g.addColorStop(1, col);
                                return g;
                            };
                        }
                    }
                    if (cfg) { self._dynamicChart = new Chart(canvas, cfg); }
                } catch(e) {}
            },
            _initChartSelectors() {
                var self = this;
                document.querySelectorAll('.dash-chart-btn').forEach(function(btn) {
                    btn.onclick = function() {
                        document.querySelectorAll('.dash-chart-btn').forEach(function(b) { b.classList.remove('active'); b.style.background = 'transparent'; b.style.color = 'var(--text-secondary)'; });
                        btn.classList.add('active');
                        btn.style.background = 'rgba(59,130,246,0.15)';
                        btn.style.color = '#60A5FA';
                        var textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim() || '#f3f4f6';
                        var textSec2 = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#9ca3af';
                        var fontFamily2 = "'Inter', sans-serif";
                        var titleOpts2 = { display: true, color: textColor, font: { size: 12, weight: 'bold', family: fontFamily2 }, padding: { bottom: 12 } };
                        var legendOpts2 = { position: 'bottom', labels: { color: textSec2, font: { size: 11, weight: 'bold', family: fontFamily2 }, padding: 10, boxWidth: 12, boxHeight: 12 } };
                        self._renderDynamicChart(textColor, textSec2, fontFamily2, titleOpts2, legendOpts2);
                    };
                });
            },
            _initChartStyleSelectors() {
                var self = this;
                document.querySelectorAll('.dash-style-btn').forEach(function(btn) {
                    btn.onclick = function() {
                        document.querySelectorAll('.dash-style-btn').forEach(function(b) { b.classList.remove('active'); b.style.background = 'transparent'; b.style.color = 'var(--text-secondary)'; });
                        btn.classList.add('active');
                        btn.style.background = 'rgba(139,92,246,0.15)';
                        btn.style.color = '#A78BFA';
                        self._dashChartStyle = btn.getAttribute('data-style');
                        var textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim() || '#f3f4f6';
                        var textSec2 = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#9ca3af';
                        var fontFamily2 = "'Inter', sans-serif";
                        var titleOpts2 = { display: true, color: textColor, font: { size: 12, weight: 'bold', family: fontFamily2 }, padding: { bottom: 12 } };
                        var legendOpts2 = { position: 'bottom', labels: { color: textSec2, font: { size: 11, weight: 'bold', family: fontFamily2 }, padding: 10, boxWidth: 12, boxHeight: 12 } };
                        self._renderDynamicChart(textColor, textSec2, fontFamily2, titleOpts2, legendOpts2);
                    };
                });
            },
            _dashChartStyle: null,
            _dashTimeFilter: 'todos',
            setDashTimeFilter(type) {
                this._dashTimeFilter = type;
                document.querySelectorAll('#tf-btns .tf-btn').forEach(function(b) { b.classList.remove('active'); });
                var activeBtn = document.querySelector('#tf-btns .tf-btn[data-filter="' + type + '"]');
                if (activeBtn) activeBtn.classList.add('active');
                var allInputs = document.querySelectorAll('.tf-range');
                allInputs.forEach(function(el) { el.classList.remove('show'); });
                var inputEl = document.getElementById('tf-input-' + type);
                if (inputEl) inputEl.classList.add('show');
                this._populateDashTimeSelects();
                this.applyDashTimeFilter();
            },
            _populateDashTimeSelects() {
                var movies = APP_STATE.movies;
                var years = {};
                movies.forEach(function(m) {
                    if (m.year && m.year.trim()) { var y = parseInt(m.year); if (!isNaN(y)) years[y] = true; }
                    if (m._createdAt || m.id) {
                        var ts = m._createdAt || m.id;
                        var d = new Date(parseInt(ts));
                        if (!isNaN(d.getTime())) years[d.getFullYear()] = true;
                    }
                });
                var yearList = Object.keys(years).map(Number).sort(function(a,b){return a-b;});
                if (yearList.length === 0) {
                    var curYear = new Date().getFullYear();
                    yearList = [curYear - 2, curYear - 1, curYear];
                }
                function fillSelect(id, includeAll) {
                    var sel = document.getElementById(id);
                    if (!sel) return;
                    var cur = sel.value;
                    sel.innerHTML = '';
                    yearList.forEach(function(y) {
                        var opt = document.createElement('option');
                        opt.value = y; opt.textContent = y;
                        sel.appendChild(opt);
                    });
                    if (cur && yearList.indexOf(parseInt(cur)) >= 0) sel.value = cur;
                }
                fillSelect('tf-mes-year');
                fillSelect('tf-pm-year');
                fillSelect('tf-ano-year');
                fillSelect('tf-anos-start');
                fillSelect('tf-anos-end');
                if (!document.getElementById('tf-dia-date').value) {
                    var today = new Date();
                    var ds = today.getFullYear() + '-' + ('0'+(today.getMonth()+1)).slice(-2) + '-' + ('0'+today.getDate()).slice(-2);
                    document.getElementById('tf-dia-date').value = ds;
                    document.getElementById('tf-dias-start').value = ds;
                    document.getElementById('tf-dias-end').value = ds;
                }
            },
            _dashTimeFilterRange: null,
            applyDashTimeFilter() {
                var type = this._dashTimeFilter;
                var range = null;
                if (type === 'dia') {
                    var d = document.getElementById('tf-dia-date').value;
                    if (d) range = { start: new Date(d + 'T00:00:00'), end: new Date(d + 'T23:59:59') };
                } else if (type === 'periodo-dias') {
                    var s = document.getElementById('tf-dias-start').value;
                    var e = document.getElementById('tf-dias-end').value;
                    if (s && e) range = { start: new Date(s + 'T00:00:00'), end: new Date(e + 'T23:59:59') };
                } else if (type === 'mes') {
                    var m = parseInt(document.getElementById('tf-mes-month').value) - 1;
                    var y = parseInt(document.getElementById('tf-mes-year').value);
                    if (!isNaN(y)) {
                        range = { start: new Date(y, m, 1), end: new Date(y, m + 1, 0, 23, 59, 59) };
                    }
                } else if (type === 'periodo-meses') {
                    var sm = parseInt(document.getElementById('tf-pm-start-month').value) - 1;
                    var sy = parseInt(document.getElementById('tf-pm-year').value);
                    var em = parseInt(document.getElementById('tf-pm-end-month').value) - 1;
                    if (!isNaN(sy)) {
                        range = { start: new Date(sy, sm, 1), end: new Date(sy, em + 1, 0, 23, 59, 59) };
                    }
                } else if (type === 'ano') {
                    var ay = parseInt(document.getElementById('tf-ano-year').value);
                    if (!isNaN(ay)) range = { start: new Date(ay, 0, 1), end: new Date(ay, 11, 31, 23, 59, 59) };
                } else if (type === 'periodo-anos') {
                    var sny = parseInt(document.getElementById('tf-anos-start').value);
                    var eny = parseInt(document.getElementById('tf-anos-end').value);
                    if (!isNaN(sny)) range = { start: new Date(sny, 0, 1), end: new Date(eny, 11, 31, 23, 59, 59) };
                }
                this._dashTimeFilterRange = range;
                this.renderDashboard();
            },
            openConfig() {
                var el = document.getElementById('modal-config');
                var btn = document.getElementById('btn-config');
                if (!el) return;
                if (el.classList.contains('active')) { 
                    UI._saveConfigFromForm();
                    el.classList.remove('active'); if (btn) btn.classList.remove('active'); return; 
                }
                Logic._clearHeaderBtnActive();
                if (btn) btn.classList.add('active');
                el.classList.add('active');
                this._populateConfigForm();
                var scrollArea = el.querySelector('.overflow-y-auto');
                if (scrollArea) scrollArea.scrollTop = 0;
            },
            _populateConfigForm() {
                var cfg = window._appConfig;
                setVal('cfg-logo-url', cfg.logo);
                setVal('cfg-empty-icon', cfg.emptyCustomIcon ? 'custom' : cfg.emptyIcon);
                setVal('cfg-empty-title', cfg.emptyTitle);
                setVal('cfg-empty-sub1', cfg.emptySub1 || '');
                setVal('cfg-empty-sub2', cfg.emptySub2 || '');
                setVal('cfg-empty-icon-size', cfg.emptyIconSize || 56);
                document.getElementById('opv-cfg-empty-icon-size').textContent = (cfg.emptyIconSize || 56) + 'px';
                setVal('cfg-empty-icon-opacity', cfg.emptyIconOpacity != null ? cfg.emptyIconOpacity : 100);
                document.getElementById('opv-cfg-empty-icon-opacity').textContent = (cfg.emptyIconOpacity != null ? cfg.emptyIconOpacity : 100) + '%';
                setVal('cfg-empty-title-size', cfg.emptyTitleSize || '14px');
                setVal('cfg-empty-title-color', cfg.emptyTitleColor || '#FFFFFF');
                setVal('cfg-empty-title-color-hex', cfg.emptyTitleColor || '#FFFFFF');
                UI._setToggleBtn('cfg-empty-title-bold', cfg.emptyTitleBold !== false);
                UI._setToggleBtn('cfg-empty-title-italic', cfg.emptyTitleItalic === true);
                setVal('cfg-empty-sub1-size', cfg.emptySub1Size || '8px');
                setVal('cfg-empty-sub1-color', cfg.emptySub1Color || '#FFFFFF');
                setVal('cfg-empty-sub1-color-hex', cfg.emptySub1Color || '#FFFFFF');
                UI._setToggleBtn('cfg-empty-sub1-bold', cfg.emptySub1Bold === true);
                UI._setToggleBtn('cfg-empty-sub1-italic', cfg.emptySub1Italic === true);
                setVal('cfg-empty-sub2-size', cfg.emptySub2Size || '8px');
                setVal('cfg-empty-sub2-color', cfg.emptySub2Color || '#FFFFFF');
                setVal('cfg-empty-sub2-color-hex', cfg.emptySub2Color || '#FFFFFF');
                UI._setToggleBtn('cfg-empty-sub2-bold', cfg.emptySub2Bold === true);
                UI._setToggleBtn('cfg-empty-sub2-italic', cfg.emptySub2Italic === true);
                setVal('cfg-empty-icon-padding', cfg.emptyIconPadding != null ? cfg.emptyIconPadding : 20);
                setVal('opv-cfg-empty-icon-padding', (cfg.emptyIconPadding != null ? cfg.emptyIconPadding : 20) + 'px');
                setChecked('cfg-empty-icon-border', cfg.emptyIconBorder !== false);
                setVal('cfg-empty-title-gap', cfg.emptyTitleGap != null ? cfg.emptyTitleGap : 12);
                setVal('opv-cfg-empty-title-gap', (cfg.emptyTitleGap != null ? cfg.emptyTitleGap : 12) + 'px');
                var customIconInput = document.getElementById('cfg-empty-custom-icon');
                if (cfg.emptyCustomIcon) {
                    if (!customIconInput) {
                        customIconInput = document.createElement('input');
                        customIconInput.type = 'hidden';
                        customIconInput.id = 'cfg-empty-custom-icon';
                        document.getElementById('cfg-empty-icon')?.parentNode.appendChild(customIconInput);
                    }
                    customIconInput.value = cfg.emptyCustomIcon;
                }

                function _restoreColor(inputId, opacityId, hex8) {
                    if (!hex8 || hex8.length < 7) { hex8 = '#000000ff'; }
                    var hex6 = hex8.slice(0, 7);
                    var alpha = 255;
                    if (hex8.length >= 9) {
                        alpha = parseInt(hex8.slice(7, 9), 16);
                    } else if (hex8.length > 7) {
                        alpha = parseInt(hex8.slice(7), 16);
                    }
                    if (isNaN(alpha)) alpha = 255;
                    var opacity = Math.round(alpha / 255 * 100);
                    setVal(inputId, hex6);
                    setVal(inputId + '-hex', hex6);
                    var slider = document.getElementById(opacityId);
                    if (slider) slider.value = opacity;
                    var label = document.getElementById('opv-' + inputId);
                    if (label) label.textContent = opacity + '%';
                }

                _restoreColor('cfg-star-color', 'op-cfg-star-color', cfg.cardStarsColor);
                _restoreColor('cfg-year-color', 'op-cfg-year-color', cfg.cardYearColor);
                _restoreColor('cfg-status-text-color', 'op-cfg-status-text-color', cfg.cardStatusTextColor);
                _restoreColor('cfg-status-new-bg', 'op-cfg-status-new-bg', cfg.cardStatusNewBg);
                _restoreColor('cfg-status-watch-bg', 'op-cfg-status-watch-bg', cfg.cardStatusWatchBg);
                _restoreColor('cfg-status-fav-bg', 'op-cfg-status-fav-bg', cfg.cardStatusFavBg);
                _restoreColor('cfg-cat-color', 'op-cfg-cat-color', cfg.cardCategoryColor);
                _restoreColor('cfg-cat-bg', 'op-cfg-cat-bg', cfg.cardCategoryBg);
                _restoreColor('cfg-placeholder-color', 'op-cfg-placeholder-color', (cfg.placeholderColor || '#9CA3AF') + Math.round((cfg.placeholderOpacity != null ? cfg.placeholderOpacity : 50) / 100 * 255).toString(16).padStart(2, '0'));

                setVal('cfg-year-size', cfg.cardYearSize);
                setVal('cfg-status-size', cfg.cardStatusSize);
                setVal('cfg-cat-size', cfg.cardCategorySize);
                setVal('cfg-path-cards', cfg.pathCards);
                setVal('cfg-path-series-cards', cfg.pathSeriesCards);
                setVal('cfg-path-videos', cfg.pathVideos);
                setVal('cfg-path-backups', cfg.pathBackups);
                setVal('cfg-path-acervo', cfg.pathAcervo);
                setVal('cfg-acervo-backup-name', cfg.acervoBackupName || '');
                setChecked('cfg-path-cards-active', cfg.pathCardsActive);
                setChecked('cfg-path-series-cards-active', cfg.pathSeriesCardsActive);
                setChecked('cfg-path-videos-active', cfg.pathVideosActive);
                setChecked('cfg-path-backups-active', cfg.pathBackupsActive);
                setChecked('cfg-path-acervo-active', cfg.pathAcervoActive);
                setChecked('cfg-autosave', cfg.autoSave);
                setVal('cfg-video-player', cfg.videoPlayer || 'system');
                UI._populatePlayerOptions();
                setVal('cfg-video-player', cfg.videoPlayer || 'system');
                setVal('cfg-custom-player-path', cfg.customPlayerPath || '');
                UI._toggleCustomPlayerRow(cfg.videoPlayer);
                setChecked('cfg-video-player-active', cfg.videoPlayerActive !== false);
                setChecked('cfg-notifications-active', cfg.notificationsActive !== false);
                setVal('cfg-notifications-duration', cfg.notificationsDuration || 5000);
                setChecked('cfg-cadastro-notify-active', cfg.cadastroNotifyActive !== false);
                setVal('cfg-cadastro-notify-duration', cfg.cadastroNotifyDuration || 6000);
                setChecked('cfg-sugestoes-active', cfg.sugestoesActive === true);
                setChecked('cfg-sugestoes-novo', cfg.sugestoesNovo !== false);
                setChecked('cfg-sugestoes-assistir', cfg.sugestoesAssistir !== false);
                setChecked('cfg-sugestoes-favoritos', cfg.sugestoesFavoritos !== false);
                setVal('cfg-footer-dev-text', cfg.footerDevText);
                setVal('cfg-footer-created-text', cfg.footerCreatedText);
                setVal('cfg-footer-dev-size', cfg.footerDevSize);
                setVal('cfg-footer-dev-color', cfg.footerDevColor);
                setVal('cfg-footer-dev-color-hex', cfg.footerDevColor);
                setVal('cfg-footer-created-size', cfg.footerCreatedSize);
                setVal('cfg-footer-created-color', cfg.footerCreatedColor);
                setVal('cfg-footer-created-color-hex', cfg.footerCreatedColor);
                setVal('cfg-footer-autosave-size', cfg.footerAutoSaveSize);
                setVal('cfg-footer-autosave-color', cfg.footerAutoSaveColor);
                setVal('cfg-footer-autosave-color-hex', cfg.footerAutoSaveColor);
                setVal('cfg-footer-status-size', cfg.footerStatusSize);
                setVal('cfg-footer-status-color', cfg.footerStatusColor);
                setVal('cfg-footer-status-color-hex', cfg.footerStatusColor);
                setVal('cfg-footer-height', cfg.footerHeight);
                this._updateConfigPreview();
                this._syncColorSwatches();
                this._placeholderPreview();
                if (typeof UI._shortcutsRender === 'function') UI._shortcutsRender();
                var total = APP_STATE.movies.length;
                var filmes = APP_STATE.movies.filter(function(m) { return m.type === 'filmes'; }).length;
                var series = APP_STATE.movies.filter(function(m) { return m.type === 'series'; }).length;
                var elTotal = document.getElementById('cfg-reset-total');
                if (elTotal) elTotal.textContent = total + ' itens (' + filmes + ' filmes, ' + series + ' series, ' + (total - filmes - series) + ' estreias)';
            },
            _updateConfigPreview() {
                var icon = getVal('cfg-empty-icon');
                var customIcon = getVal('cfg-empty-custom-icon');
                var title = getVal('cfg-empty-title');
                var sub1 = getVal('cfg-empty-sub1');
                var sub2 = getVal('cfg-empty-sub2');
                var iconSize = parseInt(getVal('cfg-empty-icon-size')) || 56;
                var iconOpacity = parseInt(document.getElementById('cfg-empty-icon-opacity')?.value) || 100;
                var titleBold = document.getElementById('cfg-empty-title-bold')?.classList.contains('active');
                var titleItalic = document.getElementById('cfg-empty-title-italic')?.classList.contains('active');
                var titleSize = getVal('cfg-empty-title-size') || '14px';
                var titleColor = getVal('cfg-empty-title-color') || '#FFFFFF';
                var sub1Bold = document.getElementById('cfg-empty-sub1-bold')?.classList.contains('active');
                var sub1Italic = document.getElementById('cfg-empty-sub1-italic')?.classList.contains('active');
                var sub1Size = getVal('cfg-empty-sub1-size') || '8px';
                var sub1Color = getVal('cfg-empty-sub1-color') || '#FFFFFF';
                var sub2Bold = document.getElementById('cfg-empty-sub2-bold')?.classList.contains('active');
                var sub2Italic = document.getElementById('cfg-empty-sub2-italic')?.classList.contains('active');
                var sub2Size = getVal('cfg-empty-sub2-size') || '8px';
                var sub2Color = getVal('cfg-empty-sub2-color') || '#FFFFFF';
                var iconPadding = parseInt(document.getElementById('cfg-empty-icon-padding')?.value) || 0;
                var iconBorder = document.getElementById('cfg-empty-icon-border')?.checked !== false;
                var titleGap = parseInt(document.getElementById('cfg-empty-title-gap')?.value) || 0;
                var preview = document.getElementById('cfg-empty-preview');
                if (preview) {
                    var containerSize = Math.max(iconSize, 40);
                    var availSpace = Math.max(containerSize - 2 * iconPadding, 0);
                    var iconInnerSz = Math.min(Math.max(Math.round(iconSize * 0.45), 20), availSpace);
                    var iconHtml = customIcon
                        ? '<img src="' + customIcon.replace(/"/g,'&quot;') + '" style="width:' + iconInnerSz + 'px;height:' + iconInnerSz + 'px;object-fit:contain">'
                        : '<i class="fas ' + icon + ' text-blue-400" style="font-size:' + iconInnerSz + 'px"></i>';
                    var fs = titleBold ? '900' : '400';
                    var fst = titleItalic ? 'italic' : 'normal';
                    var s1fs = sub1Bold ? '700' : '400';
                    var s1fst = sub1Italic ? 'italic' : 'normal';
                    var s2fs = sub2Bold ? '700' : '400';
                    var s2fst = sub2Italic ? 'italic' : 'normal';
                    var borderStyle = iconBorder ? 'border:1px solid rgba(59,130,246,0.3)' : 'border:1px solid transparent';
                    preview.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;text-align:center">' +
                        '<div style="width:' + containerSize + 'px;height:' + containerSize + 'px;background:linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2));border-radius:1.25rem;display:flex;align-items:center;justify-content:center;padding:' + iconPadding + 'px;margin-bottom:' + titleGap + 'px;' + borderStyle + ';opacity:' + (iconOpacity / 100) + '">' + iconHtml + '</div>' +
                        '<div style="font-size:' + titleSize + ';font-weight:' + fs + ';font-style:' + fst + ';text-transform:uppercase;letter-spacing:-0.02em;color:' + titleColor + '">' + title + '</div>' +
                        '<div style="font-size:' + sub1Size + ';font-weight:' + s1fs + ';font-style:' + s1fst + ';opacity:0.7;text-transform:uppercase;letter-spacing:0.15em;margin-top:2px;color:' + sub1Color + '">' + sub1 + '</div>' +
                        '<div style="font-size:' + sub2Size + ';font-weight:' + s2fs + ';font-style:' + s2fst + ';opacity:0.7;text-transform:uppercase;letter-spacing:0.15em;color:' + sub2Color + '">' + sub2 + '</div>' +
                        '</div>';
                }
                var logoUrl = getVal('cfg-logo-url');
                var logoPreview = document.getElementById('cfg-logo-preview');
                if (logoPreview) {
                    if (logoUrl) {
                        logoPreview.innerHTML = '<img src="' + logoUrl.replace(/"/g,'&quot;') + '" style="max-height:50px;border-radius:0.5rem;border:1px solid var(--border-color)">';
                    } else {
                        logoPreview.innerHTML = '<span style="font-size:9px;opacity:0.4">Nenhum logo personalizado</span>';
                    }
                }
                // Card preview
                var cardPreview = document.getElementById('cfg-card-preview');
                if (cardPreview) {
                    var starColor = getVal('cfg-star-color') || '#EAB308';
                    var yearColor = getVal('cfg-year-color') || '#60A5FA';
                    var yearSize = getVal('cfg-year-size') || '15px';
                    var statusTextColor = getVal('cfg-status-text-color') || '#FFFFFF';
                    var statusSize = getVal('cfg-status-size') || '11px';
                    var statusNewBg = getVal('cfg-status-new-bg') || '#2563EB';
                    var statusWatchBg = getVal('cfg-status-watch-bg') || '#D97706';
                    var statusFavBg = getVal('cfg-status-fav-bg') || '#DC2626';
                    var catColor = getVal('cfg-cat-color') || '';
                    var catBg = getVal('cfg-cat-bg') || '';
                    var catSize = getVal('cfg-cat-size') || '13px';
                    cardPreview.innerHTML = '<div style="width:180px;border-radius:0.85rem;overflow:hidden;background:var(--card-bg);border:1px solid var(--border-color);box-shadow:0 4px 15px rgba(0,0,0,0.2)">' +
                        '<div style="position:relative;aspect-ratio:2/3;background:linear-gradient(135deg,#1e293b,#0f172a);display:flex;align-items:center;justify-content:center">' +
                        '<span style="position:absolute;top:8px;left:8px;z-index:6;font-size:' + catSize + ';font-weight:700;text-transform:uppercase;color:' + catColor + ';background:' + catBg + ';padding:0.1rem 0.4rem;border-radius:0.3rem">Ação</span>' +
                        '<div style="position:absolute;top:8px;right:48px;z-index:5;font-size:0.6rem;color:#FBBF24;text-shadow:0 0 6px rgba(251,191,36,0.5)" title="Lembrete"><i class="fas fa-sticky-note"></i></div>' +
                        '<div style="position:absolute;top:8px;right:8px;z-index:7;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);border:1.5px solid rgba(255,255,255,0.85)"><i class="fas fa-heart" style="font-size:12px;color:' + (statusFavBg || '#DC2626') + ';text-shadow:0 0 6px rgba(220,38,38,0.5)"></i></div>' +
                        '<i class="fas fa-film" style="font-size:2rem;color:#475569"></i>' +
                        '</div>' +
                        '<div style="padding:0.4rem 0.5rem">' +
                        '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem">' +
                        '<span style="font-size:' + yearSize + ';font-weight:900;color:' + yearColor + '">2026</span>' +
                        '<span style="display:flex;gap:1px;font-size:10px;color:' + starColor + '">' + Array(5).fill('<i class="fas fa-star"></i>').join('') + '</span>' +
                        '</div>' +
                        '<div style="display:flex;gap:0.25rem;flex-wrap:wrap">' +
                        '<span style="font-size:' + statusSize + ';font-weight:700;text-transform:uppercase;color:' + statusTextColor + ';background:' + statusNewBg + ';padding:0.05rem 0.3rem;border-radius:0.25rem">Novo</span>' +
                        '<span style="font-size:' + statusSize + ';font-weight:700;text-transform:uppercase;color:' + statusTextColor + ';background:' + statusWatchBg + ';padding:0.05rem 0.3rem;border-radius:0.25rem">Assistir</span>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                }
                // Footer preview
                var footerPreview = document.getElementById('cfg-footer-preview');
                if (footerPreview) {
                    var fDevText = getVal('cfg-footer-dev-text') || 'ELO SISTEMA E TECNOLOGIA | 2026 - ';
                    var fCreatedText = getVal('cfg-footer-created-text') || 'CRIADO PARA JONAS THEODORO';
                    var fDevSize = getVal('cfg-footer-dev-size') || '0.6rem';
                    var fDevColor = getVal('cfg-footer-dev-color') || '#9CA3AF';
                    var fCreatedSize = getVal('cfg-footer-created-size') || '0.6rem';
                    var fCreatedColor = getVal('cfg-footer-created-color') || '#9CA3AF';
                    var fAutoSize = getVal('cfg-footer-autosave-size') || '0.55rem';
                    var fAutoColor = getVal('cfg-footer-autosave-color') || '#22C55E';
                    var fStatusSize = getVal('cfg-footer-status-size') || '0.75rem';
                    var fStatusColor = getVal('cfg-footer-status-color') || '#FB923C';
                    var fHeight = getVal('cfg-footer-height') || '2.5rem';
                    footerPreview.innerHTML =
                        '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;font-family:Inter,sans-serif;min-height:' + fHeight + '">' +
                        '<div style="font-size:' + fDevSize + ';color:' + fDevColor + ';text-transform:uppercase;letter-spacing:0.05em;font-weight:500">' +
                        fDevText + '<span style="opacity:0.5;font-size:' + fCreatedSize + ';color:' + fCreatedColor + '">' + fCreatedText + '</span>' +
                         ' | <span style="color:#C7D2FE;font-weight:600">v32.2.0</span>' +
                        '</div>' +
                        '<div style="display:flex;align-items:center;gap:0.5rem">' +
                        '<span style="font-size:' + fStatusSize + ';color:' + fStatusColor + ';font-weight:900;text-transform:uppercase">0 TÍTULOS</span>' +
                        '</div>' +
                        '</div>';
                }
                // Live update: apply padding, border, gap and styles to actual empty-state on main page
                var _es = document.getElementById('empty-state');
                if (_es) {
                    var _iw = _es.querySelector('.w-28.h-28, .w-28');
                    if (_iw) {
                        _iw.style.padding = iconPadding + 'px';
                        _iw.style.border = iconBorder ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent';
                        _iw.style.opacity = iconOpacity / 100;
                        var _isz = iconSize;
                        _iw.style.width = _isz + 'px';
                        _iw.style.height = _isz + 'px';
                        _iw.style.borderRadius = Math.round(_isz * 0.22) + 'px';
                        var _avail = Math.max(_isz - 2 * iconPadding, 0);
                        var _iis = Math.min(Math.max(Math.round(_isz * 0.45), 24), _avail);
                        if (customIcon) {
                            _iw.innerHTML = '<img src="' + customIcon.replace(/"/g,'&quot;') + '" style="width:' + _iis + 'px;height:' + _iis + 'px;object-fit:contain">';
                        } else {
                            _iw.innerHTML = '<i class="fas ' + icon + ' text-blue-400" style="font-size:' + _iis + 'px"></i>';
                        }
                    }
                    var _h2 = _es.querySelector('h2');
                    if (_h2) {
                        _h2.textContent = title;
                        _h2.style.fontWeight = titleBold ? '900' : '400';
                        _h2.style.fontStyle = titleItalic ? 'italic' : 'normal';
                        _h2.style.fontSize = titleSize;
                        _h2.style.color = titleColor;
                        _h2.style.marginBottom = titleGap + 'px';
                    }
                    var _ps = _es.querySelectorAll('p');
                    if (_ps.length >= 2) {
                        _ps[0].textContent = sub1;
                        _ps[0].style.fontWeight = sub1Bold ? '700' : '400';
                        _ps[0].style.fontStyle = sub1Italic ? 'italic' : 'normal';
                        _ps[0].style.fontSize = sub1Size;
                        _ps[0].style.color = sub1Color;
                        _ps[1].textContent = sub2;
                        _ps[1].style.fontWeight = sub2Bold ? '700' : '400';
                        _ps[1].style.fontStyle = sub2Italic ? 'italic' : 'normal';
                        _ps[1].style.fontSize = sub2Size;
                        _ps[1].style.color = sub2Color;
                    }
                }
            },
            _updateColorSwatch(inputId) {
                var swatch = document.getElementById('sw-' + inputId);
                var colorInput = document.getElementById(inputId);
                var opacityId = 'op-' + inputId;
                var slider = document.getElementById(opacityId);
                if (!swatch || !colorInput) return;
                var hex = colorInput.value || '#000000';
                var opacity = slider ? parseInt(slider.value) : 100;
                if (isNaN(opacity)) opacity = 100;
                var alpha = opacity / 100;
                swatch.style.background = 'rgba(' + parseInt(hex.slice(1,3), 16) + ',' + parseInt(hex.slice(3,5), 16) + ',' + parseInt(hex.slice(5,7), 16) + ',' + alpha + ')';
                if (alpha < 0.15) swatch.style.borderColor = 'var(--text-secondary)';
                else swatch.style.borderColor = 'var(--border-color)';
            },
            _updateColorOpacity(inputId) {
                var opacityId = 'op-' + inputId;
                var labelId = 'opv-' + inputId;
                var slider = document.getElementById(opacityId);
                var label = document.getElementById(labelId);
                if (slider && label) {
                    label.textContent = slider.value + '%';
                }
                this._updateColorSwatch(inputId);
            },
            _syncColorSwatches() {
                var ids = ['cfg-star-color','cfg-year-color','cfg-status-text-color','cfg-status-new-bg','cfg-status-watch-bg','cfg-status-fav-bg','cfg-cat-color','cfg-cat-bg','cfg-placeholder-color','cfg-footer-dev-color','cfg-footer-created-color','cfg-footer-autosave-color','cfg-footer-status-color','cfg-empty-title-color','cfg-empty-sub1-color','cfg-empty-sub2-color'];
                for (var i = 0; i < ids.length; i++) {
                    this._updateColorSwatch(ids[i]);
                    var hexInput = document.getElementById(ids[i] + '-hex');
                    var colorInput = document.getElementById(ids[i]);
                    if (hexInput && colorInput) hexInput.value = colorInput.value;
                }
            },
            _openColorPicker(inputId, swatchEl) {
                var realInput = document.getElementById(inputId);
                if (!realInput) return;
                var rect = swatchEl.getBoundingClientRect();
                var temp = document.createElement('input');
                temp.type = 'color';
                temp.value = realInput.value || '#000000';
                temp.style.cssText = 'position:fixed;left:' + rect.left + 'px;top:' + rect.top + 'px;width:28px;height:28px;opacity:0.01;z-index:999999;border:none;padding:0;cursor:pointer';
                document.body.appendChild(temp);
                var self = this;
                function cleanup() {
                    if (temp.parentNode) temp.parentNode.removeChild(temp);
                }
                temp.addEventListener('input', function() {
                    realInput.value = temp.value;
                    realInput.dispatchEvent(new Event('change', {bubbles: true}));
                });
                temp.addEventListener('change', function() {
                    cleanup();
                });
                temp.addEventListener('blur', function() {
                    setTimeout(cleanup, 200);
                });
                setTimeout(function() { temp.click(); }, 10);
            },
            applyConfig() {
                UI._saveConfigFromForm();
                Logic.showStatus('Configuracoes aplicadas!');
                UI.closeModal('modal-config');
            },
            _saveConfigFromForm() {
                var cfg = window._appConfig;

                function _combineColor(inputId, opacityId) {
                    var hex = getVal(inputId) || '#000000';
                    var slider = document.getElementById(opacityId);
                    var opacity = slider ? parseInt(slider.value) : 100;
                    if (isNaN(opacity)) opacity = 100;
                    var alpha = Math.round(opacity / 100 * 255);
                    return hex + alpha.toString(16).padStart(2, '0');
                }

                cfg.logo = getVal('cfg-logo-url');
                cfg.emptyIcon = getVal('cfg-empty-icon');
                cfg.emptyCustomIcon = getVal('cfg-empty-custom-icon');
                cfg.emptyTitle = getVal('cfg-empty-title');
                cfg.emptySub1 = getVal('cfg-empty-sub1');
                cfg.emptySub2 = getVal('cfg-empty-sub2');
                cfg.emptyIconSize = parseInt(getVal('cfg-empty-icon-size')) || 56;
                cfg.emptyIconOpacity = parseInt(document.getElementById('cfg-empty-icon-opacity')?.value) || 100;
                cfg.emptyTitleBold = document.getElementById('cfg-empty-title-bold')?.classList.contains('active') || false;
                cfg.emptyTitleItalic = document.getElementById('cfg-empty-title-italic')?.classList.contains('active') || false;
                cfg.emptyTitleSize = getVal('cfg-empty-title-size') || '14px';
                cfg.emptyTitleColor = getVal('cfg-empty-title-color') || '#FFFFFF';
                cfg.emptySub1Bold = document.getElementById('cfg-empty-sub1-bold')?.classList.contains('active') || false;
                cfg.emptySub1Italic = document.getElementById('cfg-empty-sub1-italic')?.classList.contains('active') || false;
                cfg.emptySub1Size = getVal('cfg-empty-sub1-size') || '8px';
                cfg.emptySub1Color = getVal('cfg-empty-sub1-color') || '#FFFFFF';
                cfg.emptySub2Bold = document.getElementById('cfg-empty-sub2-bold')?.classList.contains('active') || false;
                cfg.emptySub2Italic = document.getElementById('cfg-empty-sub2-italic')?.classList.contains('active') || false;
                cfg.emptySub2Size = getVal('cfg-empty-sub2-size') || '8px';
                cfg.emptySub2Color = getVal('cfg-empty-sub2-color') || '#FFFFFF';
                cfg.emptyIconPadding = parseInt(document.getElementById('cfg-empty-icon-padding')?.value) || 0;
                cfg.emptyIconBorder = document.getElementById('cfg-empty-icon-border')?.checked !== false;
                cfg.emptyTitleGap = parseInt(document.getElementById('cfg-empty-title-gap')?.value) || 0;
                cfg.cardStarsColor = _combineColor('cfg-star-color', 'op-cfg-star-color');
                cfg.cardYearColor = _combineColor('cfg-year-color', 'op-cfg-year-color');
                cfg.cardYearSize = getVal('cfg-year-size');
                cfg.cardStatusNewBg = _combineColor('cfg-status-new-bg', 'op-cfg-status-new-bg');
                cfg.cardStatusWatchBg = _combineColor('cfg-status-watch-bg', 'op-cfg-status-watch-bg');
                cfg.cardStatusFavBg = _combineColor('cfg-status-fav-bg', 'op-cfg-status-fav-bg');
                cfg.cardStatusTextColor = _combineColor('cfg-status-text-color', 'op-cfg-status-text-color');
                cfg.cardStatusSize = getVal('cfg-status-size');
                cfg.cardCategoryColor = _combineColor('cfg-cat-color', 'op-cfg-cat-color');
                cfg.cardCategoryBg = _combineColor('cfg-cat-bg', 'op-cfg-cat-bg');
                cfg.cardCategorySize = getVal('cfg-cat-size');
                cfg.pathCards = getVal('cfg-path-cards');
                cfg.pathSeriesCards = getVal('cfg-path-series-cards');
                cfg.pathVideos = getVal('cfg-path-videos');
                cfg.pathBackups = getVal('cfg-path-backups');
                cfg.pathAcervo = getVal('cfg-path-acervo');
                cfg.acervoBackupName = getVal('cfg-acervo-backup-name') || '';
                cfg.pathCardsActive = document.getElementById('cfg-path-cards-active')?.checked || false;
                cfg.pathSeriesCardsActive = document.getElementById('cfg-path-series-cards-active')?.checked || false;
                cfg.pathVideosActive = document.getElementById('cfg-path-videos-active')?.checked || false;
                cfg.pathBackupsActive = document.getElementById('cfg-path-backups-active')?.checked || false;
                cfg.pathAcervoActive = document.getElementById('cfg-path-acervo-active')?.checked || false;
                cfg.autoSave = document.getElementById('cfg-autosave')?.checked || false;
                cfg.videoPlayer = getVal('cfg-video-player') || 'system';
                cfg.customPlayerPath = getVal('cfg-custom-player-path') || '';
                cfg.videoPlayerActive = document.getElementById('cfg-video-player-active')?.checked || false;
                cfg.notificationsActive = document.getElementById('cfg-notifications-active')?.checked || false;
                cfg.notificationsDuration = parseInt(document.getElementById('cfg-notifications-duration')?.value) || 5000;
                cfg.cadastroNotifyActive = document.getElementById('cfg-cadastro-notify-active')?.checked || false;
                cfg.cadastroNotifyDuration = parseInt(document.getElementById('cfg-cadastro-notify-duration')?.value) || 6000;
                cfg.sugestoesActive = document.getElementById('cfg-sugestoes-active')?.checked || false;
                cfg.sugestoesNovo = document.getElementById('cfg-sugestoes-novo')?.checked || false;
                cfg.sugestoesAssistir = document.getElementById('cfg-sugestoes-assistir')?.checked || false;
                cfg.sugestoesFavoritos = document.getElementById('cfg-sugestoes-favoritos')?.checked || false;
                cfg.footerDevText = getVal('cfg-footer-dev-text');
                cfg.footerCreatedText = getVal('cfg-footer-created-text');
                cfg.footerDevSize = getVal('cfg-footer-dev-size');
                cfg.footerDevColor = getVal('cfg-footer-dev-color');
                cfg.footerCreatedSize = getVal('cfg-footer-created-size');
                cfg.footerCreatedColor = getVal('cfg-footer-created-color');
                cfg.footerAutoSaveSize = getVal('cfg-footer-autosave-size');
                cfg.footerAutoSaveColor = getVal('cfg-footer-autosave-color');
                cfg.footerStatusSize = getVal('cfg-footer-status-size');
                cfg.footerStatusColor = getVal('cfg-footer-status-color');
                cfg.footerHeight = getVal('cfg-footer-height');
                cfg.placeholderColor = getVal('cfg-placeholder-color') || '';
                cfg.placeholderOpacity = parseInt(document.getElementById('op-cfg-placeholder-color')?.value) || 100;
                saveConfig();
                applyConfig();
            },
            resetAllData() {
                var total = APP_STATE.movies.length;
                if (!total) { Logic.showStatus('Acervo ja esta vazio'); return; }
                if (!confirm('TEM CERTEZA? Esta acao ira apagar PERMANENTEMENTE todos os ' + total + ' itens do seu acervo!')) return;
                if (!confirm('CONFIRMACAO FINAL: Deseja realmente eliminar TODO o acervo (' + total + ' itens)? Esta acao nao pode ser desfeita!')) return;
                APP_STATE.movies = [];
                Store.removeItem('cinecatalog_v126');
                Render.all();
                UI.updateCounters();
                Logic.showStatus('Acervo completamente limpo!');
                var elTotal = document.getElementById('cfg-reset-total');
                if (elTotal) elTotal.textContent = '0 itens (0 filmes, 0 series, 0 estreias)';
            },
            pickFolder(inputId) {
                var input = document.getElementById(inputId);
                if (!input) return;
                var self = this;
                _legacyPick();
                function _legacyPick() {
                    var fileInput = document.getElementById('folder-picker-helper');
                    if (!fileInput) {
                        fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.id = 'folder-picker-helper';
                        fileInput.setAttribute('webkitdirectory', '');
                        fileInput.setAttribute('directory', '');
                        fileInput.style.display = 'none';
                        document.body.appendChild(fileInput);
                    }
                    fileInput.onchange = function() {
                        if (this.files && this.files[0]) {
                            var path = this.files[0].webkitRelativePath.split('/')[0];
                            try {
                                var fullPath = this.files[0].path || path;
                                input.value = fullPath;
                            } catch(e) {
                                input.value = path;
                            }
                            self._autoActivatePath(inputId);
                            self._updateConfigPreview();
                        }
                        this.value = '';
                    };
                    fileInput.click();
                }
            },
            _autoActivatePath(inputId) {
                var toggleId = inputId + '-active';
                var toggle = document.getElementById(toggleId);
                if (toggle && !toggle.checked) {
                    toggle.checked = true;
                }
            },
            _onPathInput(inputId, toggleId) {
                var input = document.getElementById(inputId);
                var toggle = document.getElementById(toggleId);
                if (!input || !toggle) return;
                if (input.value && input.value.trim()) {
                    if (!toggle.checked) toggle.checked = true;
                } else {
                    if (toggle.checked) toggle.checked = false;
                }
            },
            _setToggleBtn(btnId, isActive) {
                var btn = document.getElementById(btnId);
                if (!btn) return;
                if (isActive) {
                    btn.classList.add('active');
                    btn.style.background = 'var(--accent-blue)';
                    btn.style.color = '#fff';
                    btn.style.borderColor = 'var(--accent-blue)';
                } else {
                    btn.classList.remove('active');
                    btn.style.background = 'var(--input-bg)';
                    btn.style.color = 'var(--text-secondary)';
                    btn.style.borderColor = 'var(--border-color)';
                }
            },
            _toggleEmptyStyle(target, prop) {
                var btnId = 'cfg-empty-' + target + '-' + prop;
                var btn = document.getElementById(btnId);
                if (!btn) return;
                var isActive = btn.classList.contains('active');
                if (isActive) {
                    btn.classList.remove('active');
                    btn.style.background = 'var(--input-bg)';
                    btn.style.color = 'var(--text-secondary)';
                    btn.style.borderColor = 'var(--border-color)';
                } else {
                    btn.classList.add('active');
                    btn.style.background = 'var(--accent-blue)';
                    btn.style.color = '#fff';
                    btn.style.borderColor = 'var(--accent-blue)';
                }
                this._updateConfigPreview();
            },
            _toggleCustomPlayerRow(value) {
                var row = document.getElementById('cfg-custom-player-row');
                if (row) row.style.display = value === 'custom' ? 'flex' : 'none';
            },
            _detectPlayers() {
                var list = [];
                var fs = null;
                try {
                    if (_isElectron() && window.require) fs = window.require('fs');
                } catch(e) {}
                if (!fs) return list;
                var cands = [
                    { key: 'vlc', label: 'VLC Media Player', paths: ['C:\\Program Files\\VideoLAN\\VLC\\vlc.exe', 'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe'] },
                    { key: 'mpc', label: 'Media Player Classic (MPC-HC)', paths: ['C:\\Program Files\\MPC-HC\\mpc-hc64.exe', 'C:\\Program Files (x86)\\MPC-HC\\mpc-hc.exe', 'C:\\Program Files\\MPC-HC\\mpc-hc.exe'] },
                    { key: 'mpcbe', label: 'Media Player Classic BE', paths: ['C:\\Program Files\\MPC-BE\\mpc-be64.exe', 'C:\\Program Files (x86)\\MPC-BE\\mpc-be.exe'] },
                    { key: 'mpv', label: 'mpv', paths: ['C:\\Program Files\\mpv\\mpv.exe', 'C:\\Program Files (x86)\\mpv\\mpv.exe'] },
                    { key: 'pot', label: 'PotPlayer', paths: ['C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe', 'C:\\Program Files (x86)\\DAUM\\PotPlayer\\PotPlayerMini.exe'] },
                    { key: 'km', label: 'KMPlayer', paths: ['C:\\Program Files\\KMPlayer\\KMPlayer64.exe', 'C:\\Program Files (x86)\\KMPlayer\\KMPlayer.exe'] }
                ];
                cands.forEach(function(c) {
                    for (var i = 0; i < c.paths.length; i++) {
                        try {
                            if (fs.existsSync(c.paths[i])) {
                                list.push({ key: c.key, label: c.label, path: c.paths[i] });
                                break;
                            }
                        } catch(e) {}
                    }
                });
                return list;
            },
            _populatePlayerOptions() {
                var sel = document.getElementById('cfg-video-player');
                if (!sel) return;
                var current = sel.value || 'system';
                var detected = UI._detectPlayers();
                window._detectedPlayers = {};
                var existing = [];
                for (var i = 0; i < sel.options.length; i++) existing.push(sel.options[i].value);
                detected.forEach(function(p) {
                    window._detectedPlayers[p.key] = p.path;
                    if (existing.indexOf(p.key) < 0) {
                        var opt = document.createElement('option');
                        opt.value = p.key;
                        opt.textContent = p.label;
                        sel.appendChild(opt);
                    }
                });
                sel.value = current;
                if (!sel.value) sel.value = 'system';
            },
            pickPlayerFile() {
                var input = document.getElementById('cfg-custom-player-path');
                if (!input) return;
                var self = this;
                var fileInput = document.getElementById('player-picker-helper');
                if (!fileInput) {
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.id = 'player-picker-helper';
                    fileInput.accept = '.exe';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                }
                fileInput.onchange = function() {
                    if (this.files && this.files[0]) {
                        try {
                            var fullPath = this.files[0].path || this.files[0].name;
                            input.value = fullPath;
                        } catch(e) {
                            input.value = this.files[0].name;
                        }
                    }
                    this.value = '';
                };
                fileInput.click();
            },
            pickIconFile(inputId) {
                var input = document.getElementById(inputId);
                if (!input) return;
                var fileInput = document.getElementById('icon-picker-helper');
                if (!fileInput) {
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.id = 'icon-picker-helper';
                    fileInput.accept = '.png,.ico,.svg,.webp';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                } else {
                    fileInput.accept = '.png,.ico,.svg,.webp';
                }
                var self = this;
                fileInput.onchange = function() {
                    if (this.files && this.files[0]) {
                        var file = this.files[0];
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            var dataUrl = e.target.result;
                            var customInput = document.getElementById('cfg-empty-custom-icon');
                            if (!customInput) {
                                customInput = document.createElement('input');
                                customInput.type = 'hidden';
                                customInput.id = 'cfg-empty-custom-icon';
                                document.getElementById('cfg-empty-icon')?.parentNode.appendChild(customInput);
                            }
                            customInput.value = dataUrl;
                            input.value = 'custom';
                            self._updateConfigPreview();
                            var previewWrap = document.getElementById('cfg-icon-preview');
                            var previewImg = document.getElementById('cfg-icon-preview-img');
                            var previewInfo = document.getElementById('cfg-icon-preview-info');
                            if (previewWrap && previewImg && previewInfo) {
                                previewImg.src = dataUrl;
                                var sizeKb = (file.size / 1024).toFixed(1);
                                previewInfo.textContent = file.name + ' — ' + sizeKb + ' KB';
                                previewWrap.style.display = 'flex';
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    this.value = '';
                };
                fileInput.click();
            },
            resetFooterToDefault() {
                var defaults = {
                    'cfg-footer-dev-text': 'ELO SISTEMA E TECNOLOGIA | 2026 - ',
                    'cfg-footer-created-text': 'CRIADO PARA JONAS THEODORO',
                    'cfg-footer-dev-size': '0.6rem',
                    'cfg-footer-dev-color': '#9CA3AF',
                    'cfg-footer-created-size': '0.6rem',
                    'cfg-footer-created-color': '#9CA3AF',
                    'cfg-footer-autosave-size': '0.55rem',
                    'cfg-footer-autosave-color': '#22C55E',
                    'cfg-footer-status-size': '0.75rem',
                    'cfg-footer-status-color': '#FB923C',
                    'cfg-footer-height': '2.5rem'
                };
                Object.entries(defaults).forEach(function(_ref) {
                    var id = _ref[0], val = _ref[1];
                    var el = document.getElementById(id);
                    if (el) el.value = val;
                });
                this._updateConfigPreview();
                Logic.showStatus('Rodapé resetado para padrão');
            },
            resetCardsToDefault() {
                var defaults = {
                    'cfg-star-color': '#EAB308',
                    'cfg-year-color': '#60A5FA',
                    'cfg-year-size': '15px',
                    'cfg-status-text-color': '#FFFFFF',
                    'cfg-status-size': '11px',
                    'cfg-status-new-bg': '#2563EB',
                    'cfg-status-watch-bg': '#D97706',
                    'cfg-status-fav-bg': '#DC2626',
                    'cfg-cat-color': '#FFFFFF',
                    'cfg-cat-bg': '#000000',
                    'cfg-cat-size': '13px'
                };
                Object.entries(defaults).forEach(function(_ref) {
                    var id = _ref[0], val = _ref[1];
                    var el = document.getElementById(id);
                    if (el) {
                        if (el.type === 'color') el.value = val;
                        else el.value = val;
                    }
                    var opId = 'op-' + id;
                    var opEl = document.getElementById(opId);
                    if (opEl) opEl.value = 100;
                    var labelId = 'opv-' + id;
                    var labelEl = document.getElementById(labelId);
                    if (labelEl) labelEl.textContent = '100%';
                });
                this._syncColorSwatches();
                this._updateConfigPreview();
                Logic.showStatus('Cards resetados para padrão');
            },
            _updateColorFromHex(pickerId, hex) {
                hex = (hex || '').trim();
                if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
                var colorInput = document.getElementById(pickerId);
                var swatch = document.getElementById('sw-' + pickerId);
                var hexInput = document.getElementById(pickerId + '-hex');
                if (colorInput) colorInput.value = hex;
                if (swatch) swatch.style.background = hex;
                if (hexInput) hexInput.value = hex;
                var opId = 'op-' + pickerId;
                var opEl = document.getElementById(opId);
                if (opEl) opEl.value = 100;
                var labelId = 'opv-' + pickerId;
                var labelEl = document.getElementById(labelId);
                if (labelEl) labelEl.textContent = '100%';
                this._updateConfigPreview();
            },
            _placeholderPreview() {
                var preview = document.getElementById('cfg-placeholder-preview');
                if (!preview) return;
                var hex = document.getElementById('cfg-placeholder-color')?.value || '#9CA3AF';
                var opacity = parseInt(document.getElementById('op-cfg-placeholder-color')?.value) || 50;
                preview.style.color = hex;
                preview.style.opacity = opacity / 100;
            },
            _resetPlaceholderColor() {
                var colorInput = document.getElementById('cfg-placeholder-color');
                var hexInput = document.getElementById('cfg-placeholder-color-hex');
                var swatch = document.getElementById('sw-cfg-placeholder-color');
                var slider = document.getElementById('op-cfg-placeholder-color');
                var label = document.getElementById('opv-cfg-placeholder-color');
                var preview = document.getElementById('cfg-placeholder-preview');
                if (colorInput) colorInput.value = '#9CA3AF';
                if (hexInput) hexInput.value = '#9CA3AF';
                if (swatch) swatch.style.background = '#9CA3AF';
                if (slider) slider.value = 50;
                if (label) label.textContent = '50%';
                if (preview) {
                    preview.style.color = '#9CA3AF';
                    preview.style.opacity = 0.5;
                }
            },

            pickSuggestion() {
                var cfg = window._appConfig;
                if (!cfg || cfg.sugestoesActive !== true) {
                    Logic.showStatus('Sugestão está desativada nas configurações');
                    return;
                }
                var filters = [];
                if (cfg.sugestoesNovo !== false) filters.push('new');
                if (cfg.sugestoesAssistir !== false) filters.push('watch');
                if (cfg.sugestoesFavoritos !== false) filters.push('favorite');
                var candidates = APP_STATE.movies.filter(function(m) {
                    if (m.type !== 'filmes' && m.type !== 'series') return false;
                    if (!m.statuses) return false;
                    return filters.length > 0 && filters.some(function(f) { return m.statuses[f] === true; });
                });
                if (candidates.length === 0) {
                    candidates = APP_STATE.movies.filter(function(m) {
                        return m.type === 'filmes' || m.type === 'series';
                    });
                }
                if (candidates.length === 0) {
                    Logic.showStatus('Nenhum filme/série no acervo');
                    return;
                }
                var pick = candidates[Math.floor(Math.random() * candidates.length)];
                UI._fillSuggestionModal(pick);
                UI.openModal('modal-sugestao');
                Logic.showStatus('Sugestão: ' + (pick.titlePt || pick.originalTitle || ''));
            },

            _fillSuggestionModal(item) {
                if (!item) return;
                var title = item.titlePt || item.originalTitle || 'Sem título';
                var year = item.year || '—';
                var duration = item.duration || (item.type === 'series' ? 'Série' : '—');
                var synopsis = item.desc || '—';
                var director = item.director || '—';
                var cast = item.cast || '—';
                var poster = item.image || '';
                var mediaUrl = item.mediaFile || item.trailUrl || '';
                var statusText = '';
                if (item.statuses) {
                    if (item.statuses.favorite) statusText = 'FAVORITO';
                    else if (item.statuses.watch) statusText = 'ASSISTIR';
                    else if (item.statuses.new) statusText = 'NOVO';
                }

                document.getElementById('sug-title').textContent = title;
                document.getElementById('sug-year').textContent = year;
                document.getElementById('sug-duration').textContent = duration;
                var statusEl = document.getElementById('sug-status');
                if (statusEl) {
                    statusEl.textContent = statusText || '—';
                    if (statusText === 'FAVORITO') { statusEl.style.color = '#EF4444'; statusEl.style.background = 'rgba(239,68,68,0.15)'; statusEl.style.borderColor = 'rgba(239,68,68,0.25)'; }
                    else if (statusText === 'ASSISTIR') { statusEl.style.color = '#F59E0B'; statusEl.style.background = 'rgba(251,191,36,0.15)'; statusEl.style.borderColor = 'rgba(251,191,36,0.25)'; }
                    else if (statusText === 'NOVO') { statusEl.style.color = '#3B82F6'; statusEl.style.background = 'rgba(59,130,246,0.15)'; statusEl.style.borderColor = 'rgba(59,130,246,0.25)'; }
                }
                document.getElementById('sug-synopsis').textContent = synopsis;
                document.getElementById('sug-director').textContent = director;
                document.getElementById('sug-cast').textContent = cast;

                var posterImg = document.getElementById('sug-poster');
                var posterFallback = document.getElementById('sug-poster-fallback');
                if (poster && poster.trim()) {
                    posterImg.src = poster;
                    posterImg.style.display = 'block';
                    if (posterFallback) posterFallback.style.display = 'none';
                } else {
                    posterImg.style.display = 'none';
                    if (posterFallback) posterFallback.style.display = 'flex';
                }

                var playBtn = document.getElementById('sug-play-btn');
                var playLabel = document.getElementById('sug-play-label');
                if (playBtn && playLabel) {
                    if (mediaUrl && mediaUrl.trim()) {
                        playBtn.href = mediaUrl;
                        playBtn.onclick = function(e) {
                            e.preventDefault();
                            Logic.openMediaWithPlayer(mediaUrl, item.type);
                        };
                        playLabel.textContent = item.type === 'series' ? 'EXECUTAR EPISÓDIO' : 'ASSISTIR';
                        playBtn.style.opacity = '1';
                        playBtn.style.pointerEvents = '';
                    } else {
                        playBtn.href = '#';
                        playBtn.onclick = null;
                        playLabel.textContent = 'SEM MÍDIA';
                        playBtn.style.opacity = '0.4';
                        playBtn.style.pointerEvents = 'none';
                    }
                }
            },

            _showSuggestionOnLoad() {
                var cfg = window._appConfig;
                if (!cfg || cfg.sugestoesActive !== true) return;
                var shown = Store.getItem('sugestao_shown_today');
                var today = new Date().toISOString().slice(0, 10);
                if (shown === today) return;
                Store.setItem('sugestao_shown_today', today);
                // Delay to allow app to fully render
                setTimeout(function() {
                    UI.pickSuggestion();
                }, 1500);
            },

            openGenerateList() {
                var container = document.getElementById('a4-preview');
                var btn = document.getElementById('btn-generate-list');
                if (!container) return;
                Logic._clearHeaderBtnActive();
                if (btn) btn.classList.add('active');
                if (btn && btn.blur) btn.blur();
                UI._listAllItems = APP_STATE.movies.filter(function(m) {
                    return m.type === APP_STATE.currentView;
                });
                var q = (APP_STATE.searchQuery || '').toLowerCase().trim();
                if (q.length >= 3) {
                    var terms = q.indexOf('+') > -1 ? q.split('+').map(function(t){return t.trim()}).filter(function(t){return t;}) : [q];
                    UI._listAllItems = UI._listAllItems.filter(function(m) {
                        return terms.some(function(term) {
                            return (m.titlePt || '').toLowerCase().includes(term) ||
                                (m.originalTitle || '').toLowerCase().includes(term) ||
                                (m.director || '').toLowerCase().includes(term) ||
                                (m.cast || '').toLowerCase().includes(term) ||
                                (m.genre || '').toLowerCase().includes(term) ||
                                (m.desc || '').toLowerCase().includes(term);
                        });
                    });
                }
                UI._renderListContent(1);
                UI.openModal('modal-generate-list');
            },

            _renderListContent(page) {
                var container = document.getElementById('a4-preview');
                var pagination = document.getElementById('list-pagination');
                if (!container) return;
                var items = UI._listAllItems || [];
                var perPage = 30;
                var totalPages = Math.max(1, Math.ceil(items.length / perPage));
                var start = (page - 1) * perPage;
                var pageItems = items.slice(start, start + perPage);
                var now = new Date();
                var dateStr = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear() + ' ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
                var viewLabel = APP_STATE.currentView === 'filmes' ? 'FILMES' : APP_STATE.currentView === 'series' ? 'SÉRIES' : 'ESTREIAS';
                var logoUrl = (window._appConfig && window._appConfig.logo) || '';
                var html = '<div class="a4-header">';
                if (logoUrl) {
                    html += '<img src="' + logoUrl.replace(/"/g,'&quot;') + '" style="max-height:36px;margin:0 auto 0.4rem">';
                } else {
                    html += '<div class="header-icon"><i class="fas fa-film"></i></div>';
                }
                html += '<h1>CATÁLOGO ' + viewLabel + '</h1>';
                html += '<div class="sub">CineCatalog Elo — Acervo ' + APP_STATE.movies.length + ' títulos</div>';
                html += '<div class="datetime">Gerado em ' + dateStr + ' | Página ' + page + ' de ' + totalPages + '</div>';
                html += '</div>';
                var isEstreiaList = APP_STATE.currentView === 'estreias';
                var listHeaders = isEstreiaList
                    ? ['#', 'Estreia', 'Data', 'Tipo', 'Gênero', 'Status']
                    : ['#', APP_STATE.currentView === 'series' ? 'Série' : 'Título', 'Original', 'Ano', 'Diretor', 'Gêneros', 'Status'];
                html += '<table><thead><tr>';
                listHeaders.forEach(function(h) { html += '<th>' + h + '</th>'; });
                html += '</tr></thead><tbody>';
                pageItems.forEach(function(m, i) {
                    var num = start + i + 1;
                    var s = m.statuses || {};
                    var statuses = [];
                    if (s.new) statuses.push('Novo');
                    if (s.watch) statuses.push('Assistir');
                    if (s.favorite) statuses.push('Fav');
                    var cells;
                    if (isEstreiaList) {
                        cells = [num, (m.titlePt || '—'), (m.date || '—'), (m.estreiaType === 'series' ? 'SÉRIE' : 'FILME'), (m.genre || '—'), (statuses.join(', ') || '—')];
                    } else {
                        cells = [num, (m.titlePt || '—'), (m.originalTitle || '—'), (m.year || '—'), (m.director || '—'), (m.genre || '—'), (statuses.join(', ') || '—')];
                    }
                    html += '<tr>';
                    cells.forEach(function(c) { html += '<td>' + c + '</td>'; });
                    html += '</tr>';
                });
                html += '</tbody></table>';
                if (pageItems.length === 0) {
                    html += '<div style="text-align:center;padding:3rem;color:#94a3b8;font-size:11px">Nenhum item encontrado</div>';
                }
                container.innerHTML = html;
                // Pagination
                if (pagination) {
                    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
                    var phtml = '';
                    if (page > 1) phtml += '<button data-onclick="UI._renderListContent(' + (page-1) + ')" style="background:#374151;color:#fff">Anterior</button>';
                    for (var p = 1; p <= totalPages; p++) {
                        var active = p === page ? ' style="background:#2563EB;color:#fff"' : ' style="background:#1f2937;color:#94a3b8"';
                        phtml += '<button data-onclick="UI._renderListContent(' + p + ')"' + active + '>' + p + '</button>';
                    }
                    if (page < totalPages) phtml += '<button data-onclick="UI._renderListContent(' + (page+1) + ')" style="background:#374151;color:#fff">Próximo</button>';
                    pagination.innerHTML = phtml;
                }
            },

            printList() {
                window.print();
            },

            exportListPDF() {
                var content = document.getElementById('a4-preview');
                if (!content) return;
                var printWindow = window.open('', '_blank');
                if (!printWindow) { alert('Permita pop-ups para exportar'); return; }
                var styles = Array.from(document.styleSheets).map(function(sheet) {
                    try {
                        return Array.from(sheet.cssRules || []).map(function(rule) { return rule.cssText; }).join('');
                    } catch(e) { return ''; }
                }).join('');
                printWindow.document.write('<html><head><title>Catalogo</title><style>' + styles + '</style><style>body{background:white;padding:0;margin:0}@media print{body *{visibility:visible}#a4-preview{position:static;width:100%}}</style></head><body>');
                printWindow.document.write(content.outerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                setTimeout(function() { printWindow.print(); }, 500);
            },

            exportListJPG() {
                var content = document.getElementById('a4-preview');
                if (!content) return;
                // Use html2canvas if available, otherwise prompt user
                if (typeof html2canvas === 'undefined') {
                    // Load html2canvas dynamically
                    var script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = function() {
                        html2canvas(content, {scale:2,useCORS:true,backgroundColor:'#ffffff'}).then(function(canvas) {
                            var link = document.createElement('a');
                            link.download = 'catalogo_' + APP_STATE.currentView + '.jpg';
                            link.href = canvas.toDataURL('image/jpeg',0.95);
                            link.click();
                        });
                    };
                    document.head.appendChild(script);
                } else {
                    html2canvas(content, {scale:2,useCORS:true,backgroundColor:'#ffffff'}).then(function(canvas) {
                        var link = document.createElement('a');
                        link.download = 'catalogo_' + APP_STATE.currentView + '.jpg';
                        link.href = canvas.toDataURL('image/jpeg',0.95);
                        link.click();
                    });
                }
            },

            // === Cadastro Log (Histórico A4) ===
            openCadastroLog() {
                var btn = document.getElementById('btn-cadastro-log');
                Logic._clearHeaderBtnActive();
                if (btn) btn.classList.add('active');
                UI._renderCadastroLog(1);
                UI.openModal('modal-cadastro-log');
            },

            _renderCadastroLog(page) {
                var container = document.getElementById('cadastro-log-preview');
                var pagination = document.getElementById('cadastro-log-pagination');
                if (!container) return;
                // Get all movies with creation date (apenas FILMES e SÉRIES)
                var all = APP_STATE.movies.filter(function(m) { return m.type === 'filmes' || m.type === 'series'; }).slice().sort(function(a, b) {
                    var da = a._createdAt || a.id || '0';
                    var db = b._createdAt || b.id || '0';
                    return da > db ? 1 : da < db ? -1 : 0;
                });
                // Group by month
                var months = {};
                var monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                var dayNames = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
                all.forEach(function(m) {
                    var ts = m._createdAt || m.id;
                    var d = new Date(parseInt(ts));
                    if (isNaN(d.getTime())) { d = new Date(); }
                    var key = d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0');
                    if (!months[key]) { months[key] = { label: monthNames[d.getMonth()] + ' ' + d.getFullYear(), items: [] }; }
                    m._cadastroDate = d;
                    months[key].items.push(m);
                });
                var monthKeys = Object.keys(months).sort();
                var perPage = 50;
                var totalPages = Math.max(1, Math.ceil(monthKeys.length / 1));
                var startMonth = (page - 1) * 1;
                var pageMonths = monthKeys.slice(startMonth, startMonth + 1);
                var now = new Date();
                var dateStr = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear() + ' ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
                var allCount = all.length;
                var html = '<div class="log-inner">';
                html += '<div class="log-header">';
                html += '<div style="font-size:24px;color:#3B82F6;margin-bottom:0.3rem"><i class="fas fa-film"></i></div>';
                html += '<h1>HISTÓRICO DE CADASTRO</h1>';
                html += '<div class="sub">CineCatalog Elo — ' + allCount + ' títulos cadastrados</div>';
                html += '<div class="datetime">Gerado em ' + dateStr + ' | Página ' + page + ' de ' + totalPages + '</div>';
                html += '</div>';
                // Totalizadores e Status dinâmicos (em tempo real)
                var tFilmes = all.filter(function(m) { return m.type === 'filmes'; }).length;
                var tSeries = all.filter(function(m) { return m.type === 'series'; }).length;
                var tNew = all.filter(function(m) { return m.statuses && m.statuses.new; }).length;
                var tWatch = all.filter(function(m) { return m.statuses && m.statuses.watch; }).length;
                var tFav = all.filter(function(m) { return m.statuses && m.statuses.favorite; }).length;
                html += '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;justify-content:center;align-items:center;margin:0.8rem 0 1rem">' +
                    '<div style="background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;border-radius:8px;padding:0.3rem 0.75rem;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em">Filmes: ' + tFilmes + '</div>' +
                    '<div style="background:#f5f3ff;border:1px solid #ddd6fe;color:#5b21b6;border-radius:8px;padding:0.3rem 0.75rem;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em">Séries: ' + tSeries + '</div>' +
                    '<div style="background:#e0f2fe;border:1px solid #7dd3fc;color:#075985;border-radius:8px;padding:0.3rem 0.75rem;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em">Novos: ' + tNew + '</div>' +
                    '<div style="background:#fffbeb;border:1px solid #fcd34d;color:#b45309;border-radius:8px;padding:0.3rem 0.75rem;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em">Assistir: ' + tWatch + '</div>' +
                    '<div style="background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c;border-radius:8px;padding:0.3rem 0.75rem;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em">Favoritos: ' + tFav + '</div>' +
                    '</div>';
                if (!monthKeys.length) {
                    html += '<div style="text-align:center;padding:2rem;color:#94a3b8;font-size:10px">Nenhum título cadastrado ainda.</div>';
                } else {
                    pageMonths.forEach(function(key) {
                        var mData = months[key];
                        html += '<div class="log-month">' + mData.label + ' <span style="font-weight:400;color:#64748b;font-size:8px">(' + mData.items.length + ' títulos)</span></div>';
                        html += '<table><thead><tr><th>#</th><th>Data</th><th>Dia</th><th>Título</th><th>Tipo</th><th>Gêneros</th><th>Status</th></tr></thead><tbody>';
                        mData.items.forEach(function(m, i) {
                            var d = m._cadastroDate;
                            var dateStr2 = d.getDate().toString().padStart(2,'0') + '/' + (d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getFullYear();
                            var timeStr = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
                            var dayName = dayNames[d.getDay()];
                            var typeLabel = m.type === 'filmes' ? 'Filme' : m.type === 'series' ? 'Série' : 'Estreia';
                            var st = m.statuses || {};
                            var stBadges = '';
                            if (st.new) stBadges += '<span style="display:inline-block;background:#2563EB;color:#fff;padding:1px 6px;border-radius:999px;font-size:8px;font-weight:700;margin-right:3px">Novo</span>';
                            if (st.watch) stBadges += '<span style="display:inline-block;background:#D97706;color:#fff;padding:1px 6px;border-radius:999px;font-size:8px;font-weight:700;margin-right:3px">Assistir</span>';
                            if (st.favorite) stBadges += '<span style="display:inline-block;background:#DC2626;color:#fff;padding:1px 6px;border-radius:999px;font-size:8px;font-weight:700;margin-right:3px">Fav</span>';
                            if (!stBadges) stBadges = '<span style="color:#94a3b8;font-size:8px">—</span>';
                            html += '<tr><td>' + (i+1) + '</td><td>' + dateStr2 + ' ' + timeStr + '</td><td>' + dayName + '</td><td>' + (m.titlePt || m.originalTitle || '—') + '</td><td>' + typeLabel + '</td><td>' + (m.genre || '—') + '</td><td>' + stBadges + '</td></tr>';
                        });
                        html += '</tbody></table>';
                    });
                }
                html += '</div>';
                container.innerHTML = html;
                // Pagination
                if (pagination) {
                    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
                    var phtml = '';
                    if (page > 1) phtml += '<button data-onclick="UI._renderCadastroLog(' + (page-1) + ')" style="background:#374151;color:#fff">Anterior</button>';
                    for (var p = 1; p <= totalPages; p++) {
                        var active = p === page ? ' style="background:#2563EB;color:#fff"' : ' style="background:#1f2937;color:#94a3b8"';
                        phtml += '<button data-onclick="UI._renderCadastroLog(' + p + ')"' + active + '>' + p + '</button>';
                    }
                    if (page < totalPages) phtml += '<button data-onclick="UI._renderCadastroLog(' + (page+1) + ')" style="background:#374151;color:#fff">Próximo</button>';
                    pagination.innerHTML = phtml;
                }
            },

            printCadastroLog() {
                var content = document.getElementById('cadastro-log-preview');
                if (!content) return;
                var printWindow = window.open('', '_blank');
                if (!printWindow) { alert('Permita pop-ups para imprimir'); return; }
                var styles = Array.from(document.styleSheets).map(function(sheet) {
                    try { return Array.from(sheet.cssRules || []).map(function(rule) { return rule.cssText; }).join(''); }
                    catch(e) { return ''; }
                }).join('');
                printWindow.document.write('<html><head><title>Historico Cadastro</title><style>' + styles + '</style><style>body{background:white;padding:0;margin:0}.log-a4-preview{position:static;width:100%}.no-print,.list-controls{display:none!important}@media print{body *{visibility:visible}}</style></head><body>');
                printWindow.document.write(content.outerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                setTimeout(function() { printWindow.print(); }, 500);
            },

            exportCadastroLogPDF() {
                var content = document.getElementById('cadastro-log-preview');
                if (!content) return;
                var printWindow = window.open('', '_blank');
                if (!printWindow) { alert('Permita pop-ups para exportar'); return; }
                var styles = Array.from(document.styleSheets).map(function(sheet) {
                    try { return Array.from(sheet.cssRules || []).map(function(rule) { return rule.cssText; }).join(''); }
                    catch(e) { return ''; }
                }).join('');
                printWindow.document.write('<html><head><title>Historico Cadastro</title><style>' + styles + '</style><style>body{background:white;padding:0;margin:0}.log-a4-preview{position:static;width:100%}.no-print{display:none!important}</style></head><body>');
                printWindow.document.write(content.outerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                setTimeout(function() { printWindow.print(); }, 500);
            },

            openDynamicSeriesModal() {
                document.getElementById('modal-dynamic-series').style.display = 'flex';
            },
            closeDynamicSeriesModal() {
                document.getElementById('modal-dynamic-series').style.display = 'none';
            },
            _dynSeasonEps: {},
            _dynButtonsVisible: false,
            _seasonData: [],
            _seasonEditMode: false,
            _episodeData: [],
            _episodeEditMode: false,

            /* ==== NOVO CADASTRO SÉRIES — 3 SEÇÕES (item f) ==== */
            autoGenerateSeasons() {
                var total = parseInt(document.getElementById('fs-season').value) || 0;
                if (total <= 0) { Logic.showModalStatus('Digite o Total de Temporadas primeiro.', 'orange'); return; }
                UI._syncSeasonDataFromDom();
                while (UI._seasonData.length < total) UI._seasonData.push({});
                if (UI._seasonData.length > total) UI._seasonData = UI._seasonData.slice(0, total);
                UI._seasonData.forEach(function(d, i) { d.seasonNumber = i + 1; d.totalSeasons = total; });
                UI._renderSeasonBlocks();
                UI._renderEpisodeBlocks();
                Logic.showStatus(total + ' campo(s) de temporada criado(s) em tempo real.');
            },
            seriesAddSeason() {
                UI._syncSeasonDataFromDom();
                UI._seasonData.push({});
                var total = UI._seasonData.length;
                UI._seasonData.forEach(function(d, i) { d.seasonNumber = i + 1; d.totalSeasons = total; });
                UI._renderSeasonBlocks();
                UI._renderEpisodeBlocks();
            },
            seriesRemoveSeason() {
                UI._syncSeasonDataFromDom();
                if (!UI._seasonData.length) return;
                UI._seasonData.pop();
                var total = UI._seasonData.length;
                UI._seasonData.forEach(function(d, i) { d.seasonNumber = i + 1; d.totalSeasons = total; });
                UI._renderSeasonBlocks();
                UI._renderEpisodeBlocks();
            },
            clearAllSeasonFields() {
                if (!UI._seasonData.length) return;
                if (!confirm('Remover todos os campos das Temporadas?')) return;
                UI._seasonData = [];
                document.getElementById('fs-season').value = '';
                UI._renderSeasonBlocks();
                UI._renderEpisodeBlocks();
                Logic.showStatus('Todos os campos de Temporadas removidos.', 4000);
            },
            _removeSeasonBlock(idx) {
                UI._syncSeasonDataFromDom();
                UI._seasonData.splice(idx, 1);
                var total = UI._seasonData.length;
                UI._seasonData.forEach(function(d, i) { d.seasonNumber = i + 1; d.totalSeasons = total; });
                UI._renderSeasonBlocks();
                UI._renderEpisodeBlocks();
            },
            _syncSeasonDataFromDom() {
                var container = document.getElementById('series-season-blocks');
                if (!container) return;
                container.querySelectorAll('.series-dyn-block.season').forEach(function(block) {
                    var i = parseInt(block.dataset.index) || 0;
                    if (i >= UI._seasonData.length) return;
                    var d = UI._seasonData[i];
                    ['title','year','cast','trailerUrl'].forEach(function(f) {
                        var el = block.querySelector('[data-field="' + f + '"]');
                        if (el) d[f] = el.value;
                    });
                });
            },
            _renderSeasonBlocks() {
                var container = document.getElementById('series-season-blocks');
                var hint = document.getElementById('series-seasons-hint');
                var totalEl = document.getElementById('series-seasons-total');
                if (!container) return;
                UI._syncSeasonDataFromDom();
                if (!UI._seasonData.length) {
                    container.innerHTML = '';
                    if (hint) hint.style.display = 'block';
                    if (totalEl) totalEl.textContent = '0 Temporadas';
                    return;
                }
                if (hint) hint.style.display = 'none';
                var html = '';
                for (var i = 0; i < UI._seasonData.length; i++) {
                    var d = UI._seasonData[i] || {};
                    html += '<div class="series-dyn-block season" data-index="' + i + '">' +
                        '<span class="series-dyn-num">' + (i + 1) + '</span>' +
                        '<div class="series-dyn-grid">' +
                        '<div class="series-dyn-row">' +
                        '<input type="text" data-field="title" value="' + (d.title || '').replace(/"/g, '&quot;') + '" placeholder="Título" class="field-premium series-field">' +
                        '<input type="text" data-field="cast" value="' + (d.cast || '').replace(/"/g, '&quot;') + '" placeholder="Elenco" class="field-premium series-field">' +
                        '</div>' +
                        '<div class="series-dyn-row">' +
                        '<input type="text" data-field="year" value="' + (d.year || '').replace(/"/g, '&quot;') + '" placeholder="Ano" class="field-premium series-field" style="flex:0 0 70px">' +
                        '<input type="text" data-field="trailerUrl" value="' + (d.trailerUrl || '').replace(/"/g, '&quot;') + '" placeholder="Trailer" class="field-premium series-field">' +
                        '</div>' +
                        '</div>' +
                        '<button type="button" class="series-dyn-remove" data-onclick="UI._removeSeasonBlock(' + i + ')" title="Remover temporada"><i class="fas fa-times"></i></button>' +
                        '</div>';
                }
                container.innerHTML = html;
                if (totalEl) totalEl.textContent = UI._seasonData.length + ' Temporada' + (UI._seasonData.length !== 1 ? 's' : '');
                var fsSeason = document.getElementById('fs-season');
                if (fsSeason) fsSeason.value = UI._seasonData.length;
            },

            autoGenerateEpisodes() {
                var total = parseInt(document.getElementById('fs-episode-number').value) || 0;
                if (total <= 0) { Logic.showModalStatus('Digite o Total de Episódios primeiro.', 'orange'); return; }
                UI._syncEpisodeDataFromDom();
                while (UI._episodeData.length < total) UI._episodeData.push({});
                if (UI._episodeData.length > total) UI._episodeData = UI._episodeData.slice(0, total);
                UI._episodeData.forEach(function(d, i) { d.epNumber = i + 1; });
                UI._renderEpisodeBlocks();
                Logic.showStatus(total + ' campo(s) de episódio criado(s) em tempo real.');
            },
            seriesAddEpisode() {
                UI._syncEpisodeDataFromDom();
                UI._episodeData.push({});
                var total = UI._episodeData.length;
                UI._episodeData.forEach(function(d, i) { d.epNumber = i + 1; });
                document.getElementById('fs-episode-number').value = total;
                UI._renderEpisodeBlocks();
            },
            seriesRemoveEpisode() {
                UI._syncEpisodeDataFromDom();
                if (!UI._episodeData.length) return;
                UI._episodeData.pop();
                var total = UI._episodeData.length;
                UI._episodeData.forEach(function(d, i) { d.epNumber = i + 1; });
                document.getElementById('fs-episode-number').value = total;
                UI._renderEpisodeBlocks();
            },
            clearAllEpisodeFields() {
                if (!UI._episodeData.length) return;
                if (!confirm('Remover todos os campos dos Episódios?')) return;
                UI._episodeData = [];
                document.getElementById('fs-episode-number').value = '';
                UI._renderEpisodeBlocks();
                Logic.showStatus('Todos os campos de Episódios removidos.', 4000);
            },
            _removeEpisodeBlock(idx) {
                UI._syncEpisodeDataFromDom();
                UI._episodeData.splice(idx, 1);
                var total = UI._episodeData.length;
                UI._episodeData.forEach(function(d, i) { d.epNumber = i + 1; });
                document.getElementById('fs-episode-number').value = total;
                UI._renderEpisodeBlocks();
            },
            _syncEpisodeDataFromDom() {
                var container = document.getElementById('series-episode-blocks');
                if (!container) return;
                container.querySelectorAll('.series-dyn-block.episode').forEach(function(block) {
                    var i = parseInt(block.dataset.index) || 0;
                    if (i >= UI._episodeData.length) return;
                    var d = UI._episodeData[i];
                    ['title','year','cast','duration'].forEach(function(f) {
                        var el = block.querySelector('[data-field="' + f + '"]');
                        if (el) d[f] = el.value;
                    });
                    var seasonEl = block.querySelector('[data-field="season"]');
                    if (seasonEl) d.season = seasonEl.value;
                    var mediaEl = block.querySelector('[data-field="mediaUrl"]');
                    if (mediaEl) d.mediaUrl = mediaEl.dataset.ref || mediaEl.value;
                    if (d.year) d.date = d.year;
                    if (d.cast) d.guestCast = d.cast;
                });
            },
            _renderEpisodeBlocks() {
                var container = document.getElementById('series-episode-blocks');
                var hint = document.getElementById('series-episodes-hint');
                var totalEl = document.getElementById('series-episodes-total');
                if (!container) return;
                UI._syncEpisodeDataFromDom();
                if (!UI._episodeData.length) {
                    container.innerHTML = '';
                    if (hint) hint.style.display = 'block';
                    if (totalEl) totalEl.textContent = '0 Episódios';
                    return;
                }
                if (hint) hint.style.display = 'none';
                var seasonCount = UI._seasonData.length;
                if (seasonCount < 1) seasonCount = 1;
                var html = '';
                for (var i = 0; i < UI._episodeData.length; i++) {
                    var d = UI._episodeData[i] || {};
                    var opts = '';
                    for (var s = 1; s <= seasonCount; s++) {
                        opts += '<option value="' + s + '"' + (String(d.season) === String(s) ? ' selected' : '') + '>Temporada ' + s + '</option>';
                    }
                    var dispMedia = d.mediaUrl || '';
                    if (dispMedia.charAt(0) === '{') {
                        try {
                            var mr = JSON.parse(dispMedia);
                            dispMedia = mr.name || '';
                        } catch(e) {}
                    }
                    var dispCast = d.cast || d.guestCast || '';
                    var dispYear = d.year || d.date || '';
                    html += '<div class="series-dyn-block episode" data-index="' + i + '">' +
                        '<span class="series-dyn-num">' + (i + 1) + '</span>' +
                        '<div class="series-dyn-grid">' +
                        '<div class="series-dyn-row">' +
                        '<select data-field="season" class="field-premium series-field" style="flex:0 0 110px;min-width:0">' + opts + '</select>' +
                        '<input type="text" data-field="title" value="' + (d.title || '').replace(/"/g, '&quot;') + '" placeholder="Título" class="field-premium series-field">' +
                        '<input type="text" data-field="cast" value="' + (dispCast || '').replace(/"/g, '&quot;') + '" placeholder="Elenco" class="field-premium series-field">' +
                        '</div>' +
                        '<div class="series-dyn-row">' +
                        '<input type="text" data-field="year" value="' + (dispYear || '').replace(/"/g, '&quot;') + '" placeholder="Ano" class="field-premium series-field" style="flex:0 0 70px">' +
                        '<input type="text" data-field="duration" value="' + (d.duration || '').replace(/"/g, '&quot;') + '" placeholder="Duração" class="field-premium series-field" style="flex:0 0 85px">' +
                        '<div style="display:flex;gap:0.25rem;align-items:center;flex:1;min-width:0">' +
                        '<input type="text" data-field="mediaUrl" value="' + (dispMedia || '').replace(/"/g, '&quot;') + '" placeholder="Link da Série" class="field-premium series-field">' +
                        '<button type="button" class="input-icon-btn" data-onclick="UI._pickEpisodeFile(' + i + ')" title="Selecionar ficheiro local"><i class="fas fa-folder-open"></i></button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<button type="button" class="series-dyn-remove" data-onclick="UI._removeEpisodeBlock(' + i + ')" title="Remover episódio"><i class="fas fa-times"></i></button>' +
                        '</div>';
                }
                container.innerHTML = html;
                if (totalEl) totalEl.textContent = UI._episodeData.length + ' Episódio' + (UI._episodeData.length !== 1 ? 's' : '');
                var fsEp = document.getElementById('fs-episode-number');
                if (fsEp) fsEp.value = UI._episodeData.length;
            },
            _pickEpisodeFile(idx) {
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.style.display = 'none';
                document.body.appendChild(input);
                input.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        var file = this.files[0];
                        var blobUrl = URL.createObjectURL(file);
                        var ref = {blob: blobUrl, name: file.name};
                        var block = document.querySelector('.series-dyn-block.episode[data-index="' + idx + '"]');
                        var mediaEl = block ? block.querySelector('[data-field="mediaUrl"]') : null;
                        if (mediaEl) {
                            mediaEl.value = file.name;
                            mediaEl.dataset.ref = JSON.stringify(ref);
                        }
                    }
                    document.body.removeChild(input);
                });
                input.click();
            },

            toggleDynButtons() {
                UI._dynButtonsVisible = !UI._dynButtonsVisible;
                var el = document.getElementById('dyn-series-buttons');
                if (el) el.style.display = UI._dynButtonsVisible ? 'flex' : 'none';
            },

            openSeasonModal() {
                UI._seasonEditMode = (UI._seasonData && UI._seasonData.length > 0);
                UI._generateSeasonBlocks();
                document.getElementById('modal-seasons').style.display = 'flex';
                var btn = document.getElementById('season-footer-btn');
                if (btn) btn.innerHTML = UI._seasonEditMode ? '<i class="fas fa-save mr-1.5"></i> SALVAR' : '<i class="fas fa-check mr-1.5"></i> CRIAR TEMPORADAS';
            },
            closeSeasonModal() {
                document.getElementById('modal-seasons').style.display = 'none';
            },
            _generateSeasonBlocks() {
                var container = document.getElementById('season-blocks-container');
                if (!container) return;
                var totalSeasons = parseInt(document.getElementById('fs-season').value) || 1;
                var seriesOptions = '';
                document.querySelectorAll('#tab-content-series').length; // ensure on series tab
                var seriesTitle = (document.getElementById('fs-title') && document.getElementById('fs-title').value.trim()) || 'Série';
                // Gather all series titles from APP_STATE
                var seriesList = (APP_STATE.movies || []).filter(function(m) { return m.type === 'series'; });
                seriesList.forEach(function(s) {
                    var t = s.titlePt || s.originalTitle || '';
                    seriesOptions += '<option value="' + t.replace(/"/g, '&quot;') + '">' + t + '</option>';
                });
                // Add current (unsaved) series title as first option
                if (seriesTitle && seriesOptions.indexOf(seriesTitle) === -1) {
                    seriesOptions = '<option value="' + seriesTitle.replace(/"/g, '&quot;') + '">' + seriesTitle + '</option>' + seriesOptions;
                }
                var html = '';
                for (var i = 0; i < totalSeasons; i++) {
                    var saved = UI._seasonData[i] || {};
                    var statusOptions = ['Exibição','Finalizada','Renovada','Assistir','Favorita'];
                    var statusHtml = '<select data-field="status" class="field-premium" style="font-size:0.6rem;padding:0.25rem 0.3rem;min-width:0">';
                    statusHtml += '<option value="">Status</option>';
                    statusOptions.forEach(function(opt) {
                        statusHtml += '<option value="' + opt + '"' + (saved.status === opt ? ' selected' : '') + '>' + opt + '</option>';
                    });
                    statusHtml += '</select>';
                    html += '<div class="season-block-item" data-index="' + i + '" style="display:grid;grid-template-columns:32px 1fr 60px 60px 90px 28px;gap:0.4rem;align-items:center;margin-bottom:0.5rem;padding:0.5rem;border-radius:0.6rem;background:rgba(139,92,246,0.05);border:1px solid rgba(139,92,246,0.1)">';
                    html += '<span class="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-black" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:white">' + (i + 1) + '</span>';
                    html += '<select data-field="series" class="field-premium" style="font-size:0.6rem;padding:0.25rem 0.3rem;min-width:0">' + seriesOptions.replace('selected', '').replace(new RegExp('value="' + (saved.series || seriesTitle).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"'), 'value="' + (saved.series || seriesTitle).replace(/"/g, '&quot;') + '" selected') + '</select>';
                    html += '<input type="text" data-field="totalSeasons" class="field-premium" value="' + totalSeasons + '" readonly style="font-size:0.6rem;padding:0.25rem 0.3rem;text-align:center;background:rgba(139,92,246,0.1);color:#C4B5FD">';
                    html += '<input type="text" data-field="year" class="field-premium" value="' + (saved.year || '') + '" placeholder="Ano" style="font-size:0.6rem;padding:0.25rem 0.3rem">';
                    html += statusHtml;
                    html += '<div data-onclick="UI._clearSeasonBlock(' + i + ')" class="cursor-pointer flex items-center justify-center" style="width:24px;height:24px;border-radius:0.4rem;background:rgba(239,68,68,0.15);color:#EF4444;font-size:0.5rem" title="Limpar"><i class="fas fa-times"></i></div>';
                    html += '</div>';
                }
                container.innerHTML = html;
                // Pre-fill saved values
                UI._seasonData.forEach(function(d, i) {
                    var block = container.querySelector('.season-block-item[data-index="' + i + '"]');
                    if (!block) return;
                    var seriesSel = block.querySelector('[data-field="series"]');
                    if (seriesSel && d.series) seriesSel.value = d.series;
                    var yearInp = block.querySelector('[data-field="year"]');
                    if (yearInp && d.year) yearInp.value = d.year;
                    var statusSel = block.querySelector('[data-field="status"]');
                    if (statusSel && d.status) statusSel.value = d.status;
                });
            },
            _clearSeasonBlock(index) {
                UI._seasonData[index] = {};
                var block = document.querySelector('.season-block-item[data-index="' + index + '"]');
                if (!block) return;
                block.querySelectorAll('input, select').forEach(function(el) {
                    if (el.dataset.field === 'totalSeasons') return;
                    el.value = '';
                });
            },
            clearAllSeasons() {
                if (!confirm('Limpar todos os dados de temporadas?')) return;
                UI._seasonData = [];
                UI._generateSeasonBlocks();
            },
            saveSeasons() {
                var blocks = document.querySelectorAll('.season-block-item');
                UI._seasonData = [];
                blocks.forEach(function(block, i) {
                    var d = {};
                    d.series = (block.querySelector('[data-field="series"]') || {}).value || '';
                    d.seasonNumber = i + 1;
                    d.totalSeasons = (block.querySelector('[data-field="totalSeasons"]') || {}).value || '';
                    d.year = (block.querySelector('[data-field="year"]') || {}).value || '';
                    d.status = (block.querySelector('[data-field="status"]') || {}).value || '';
                    UI._seasonData.push(d);
                });
                UI.closeSeasonModal();
                Logic.showStatus(UI._seasonData.length + ' temporada(s) salva(s)!');
            },

            openEpisodeModal() {
                UI._episodeEditMode = (UI._episodeData && UI._episodeData.length > 0);
                UI._generateEpisodeBlocks();
                document.getElementById('modal-episodes').style.display = 'flex';
                var btn = document.getElementById('episode-footer-btn');
                if (btn) btn.innerHTML = UI._episodeEditMode ? '<i class="fas fa-save mr-1.5"></i> SALVAR' : '<i class="fas fa-check mr-1.5"></i> CRIAR EPISÓDIOS';
            },
            closeEpisodeModal() {
                document.getElementById('modal-episodes').style.display = 'none';
            },
            _generateEpisodeBlocks() {
                var container = document.getElementById('episode-blocks-container');
                if (!container) return;
                var totalEpisodes = parseInt(document.getElementById('fs-episode-number').value) || 1;
                var totalSeasons = parseInt(document.getElementById('fs-season').value) || 1;
                var seriesTitle = (document.getElementById('fs-title') && document.getElementById('fs-title').value.trim()) || 'Série';
                // Series options
                var seriesList = (APP_STATE.movies || []).filter(function(m) { return m.type === 'series'; });
                var seriesOpts = '';
                seriesList.forEach(function(s) {
                    var t = s.titlePt || s.originalTitle || '';
                    seriesOpts += '<option value="' + t.replace(/"/g, '&quot;') + '">' + t + '</option>';
                });
                if (seriesTitle && seriesOpts.indexOf(seriesTitle) === -1) {
                    seriesOpts = '<option value="' + seriesTitle.replace(/"/g, '&quot;') + '">' + seriesTitle + '</option>' + seriesOpts;
                }
                // Season options
                var seasonOpts = '';
                for (var s = 1; s <= totalSeasons; s++) {
                    seasonOpts += '<option value="' + s + '">Temporada ' + s + '</option>';
                }
                var statusOpts = ['Exibição','Finalizada','Renovada','Assistir','Favorita'];
                var html = '';
                for (var e = 0; e < totalEpisodes; e++) {
                    var saved = UI._episodeData[e] || {};
                    var statusHtml = '<select data-field="status" class="field-premium" style="font-size:0.55rem;padding:0.2rem 0.25rem;min-width:0">';
                    statusHtml += '<option value="">Status</option>';
                    statusOpts.forEach(function(opt) {
                        statusHtml += '<option value="' + opt + '"' + (saved.status === opt ? ' selected' : '') + '>' + opt + '</option>';
                    });
                    statusHtml += '</select>';
                    var starsHtml = '<select data-field="stars" class="field-premium" style="font-size:0.55rem;padding:0.2rem 0.25rem;min-width:0">';
                    starsHtml += '<option value="0">☆☆☆☆☆</option>';
                    for (var st = 1; st <= 5; st++) {
                        var starStr = '★'.repeat(st) + '☆'.repeat(5 - st);
                        starsHtml += '<option value="' + st + '"' + (saved.stars == st ? ' selected' : '') + '>' + starStr + '</option>';
                    }
                    starsHtml += '</select>';
                    html += '<div class="episode-block-item" data-index="' + e + '" style="margin-bottom:0.6rem;padding:0.5rem;border-radius:0.6rem;background:rgba(124,58,217,0.05);border:1px solid rgba(124,58,217,0.1)">';
                    // Row 1: Header with Series dropdown, Season dropdown, EP#, Total EP, Status
                    html += '<div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.3rem">';
                    html += '<span class="w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-black" style="background:linear-gradient(135deg,#7C3AED,#6D28D9);color:white;min-width:24px">' + (e + 1) + '</span>';
                    html += '<select data-field="series" class="field-premium" style="font-size:0.55rem;padding:0.2rem 0.25rem;flex:1;min-width:0">' + seriesOpts + '</select>';
                    html += '<select data-field="season" class="field-premium" style="font-size:0.55rem;padding:0.2rem 0.25rem;min-width:0">' + seasonOpts + '</select>';
                    html += '<span style="font-size:0.5rem;font-weight:700;color:var(--text-secondary);padding:0 0.2rem;white-space:nowrap">EP ' + (e + 1) + '/' + totalEpisodes + '</span>';
                    html += statusHtml;
                    html += '<div data-onclick="UI._clearEpisodeBlock(' + e + ')" class="cursor-pointer flex items-center justify-center" style="width:22px;height:22px;border-radius:0.4rem;background:rgba(239,68,68,0.15);color:#EF4444;font-size:0.5rem;min-width:22px" title="Limpar"><i class="fas fa-times"></i></div>';
                    html += '</div>';
                    // Row 2: Title + Synopsis + Duration
                    html += '<div style="display:grid;grid-template-columns:1fr 1.5fr 60px;gap:0.3rem;margin-bottom:0.3rem">';
                    html += '<input type="text" data-field="title" class="field-premium" value="' + (saved.title || '').replace(/"/g, '&quot;') + '" placeholder="Título EP" style="font-size:0.55rem;padding:0.2rem 0.3rem">';
                    html += '<input type="text" data-field="synopsis" class="field-premium" value="' + (saved.synopsis || '').replace(/"/g, '&quot;') + '" placeholder="Sinopse" style="font-size:0.55rem;padding:0.2rem 0.3rem">';
                    html += '<input type="text" data-field="duration" class="field-premium" value="' + (saved.duration || '').replace(/"/g, '&quot;') + '" placeholder="Duração" style="font-size:0.55rem;padding:0.2rem 0.3rem">';
                    html += '</div>';
                    // Row 3: Date + Direction + Stars
                    html += '<div style="display:grid;grid-template-columns:70px 1fr 90px;gap:0.3rem">';
                    html += '<input type="text" data-field="date" class="field-premium" value="' + (saved.date || '').replace(/"/g, '&quot;') + '" placeholder="Data" style="font-size:0.55rem;padding:0.2rem 0.3rem">';
                    html += '<input type="text" data-field="direction" class="field-premium" value="' + (saved.direction || '').replace(/"/g, '&quot;') + '" placeholder="Direção" style="font-size:0.55rem;padding:0.2rem 0.3rem">';
                    html += starsHtml;
                    html += '</div>';
                    // Row 4: Link da Serie (with folder picker) + Trailer URL
                    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;margin-top:0.3rem">';
                    html += '<div>';
                    html += '<label style="font-size:0.5rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);margin-bottom:0.15rem;display:block"><i class="fas fa-link mr-1 opacity-60"></i>Link da Série</label>';
                    html += '<div class="input-with-icon" style="border-radius:0.4rem">';
                    html += '<input type="text" data-field="mediaUrl" class="field-premium" value="' + (saved.mediaUrl || '').replace(/"/g, '&quot;') + '" placeholder="https://example.com/serie.mp4" style="font-size:0.5rem;padding:0.15rem 0.25rem">';
                    html += '<button type="button" class="input-icon-btn" style="width:22px;height:22px;font-size:0.5rem" title="Selecionar ficheiro local"><i class="fas fa-folder-open"></i></button>';
                    html += '</div></div>';
                    html += '<div>';
                    html += '<label style="font-size:0.5rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);margin-bottom:0.15rem;display:block"><i class="fas fa-video mr-1 opacity-60"></i>Trailer</label>';
                    html += '<input type="text" data-field="trailerUrl" class="field-premium" value="' + (saved.trailerUrl || '').replace(/"/g, '&quot;') + '" placeholder="https://youtube.com/..." style="font-size:0.5rem;padding:0.2rem 0.3rem">';
                    html += '</div></div>';
                    html += '</div>';
                }
                container.innerHTML = html;
                // Pre-fill saved values
                UI._episodeData.forEach(function(d, i) {
                    var block = container.querySelector('.episode-block-item[data-index="' + i + '"]');
                    if (!block) return;
                    ['title','synopsis','duration','date','direction','mediaUrl','trailerUrl'].forEach(function(f) {
                        var el = block.querySelector('[data-field="' + f + '"]');
                        if (el && d[f]) el.value = d[f];
                    });
                    var seriesSel = block.querySelector('[data-field="series"]');
                    if (seriesSel && d.series) seriesSel.value = d.series;
                    var seasonSel = block.querySelector('[data-field="season"]');
                    if (seasonSel && d.season) seasonSel.value = d.season;
                    var statusSel = block.querySelector('[data-field="status"]');
                    if (statusSel && d.status) statusSel.value = d.status;
                    var starsSel = block.querySelector('[data-field="stars"]');
                    if (starsSel && d.stars) starsSel.value = d.stars;
                });
            },
            _clearEpisodeBlock(index) {
                UI._episodeData[index] = {};
                var block = document.querySelector('.episode-block-item[data-index="' + index + '"]');
                if (!block) return;
                block.querySelectorAll('input, select').forEach(function(el) {
                    el.value = el.tagName === 'SELECT' ? '' : '';
                });
            },
            clearAllEpisodes() {
                if (!UI._episodeData || UI._episodeData.length === 0) return;
                // Save current data for undo
                UI._episodeDataBackup = UI._episodeData.slice();
                UI._episodeData = [];
                UI._generateEpisodeBlocks();
                Logic.showStatus('Dados limpos! Clique "Desfazer" para restaurar.', 5000);
                // Show undo button temporarily
                var btn = document.getElementById('episode-footer-btn');
                if (btn && !document.getElementById('episode-undo-btn')) {
                    var undoBtn = document.createElement('button');
                    undoBtn.id = 'episode-undo-btn';
                    undoBtn.onclick = function() {
                        UI._episodeData = UI._episodeDataBackup ? UI._episodeDataBackup.slice() : [];
                        UI._generateEpisodeBlocks();
                        undoBtn.remove();
                    };
                    undoBtn.className = 'py-2.5 px-4 rounded-xl text-[0.7rem] font-black uppercase tracking-wider transition';
                    undoBtn.style.cssText = 'background:rgba(245,158,11,0.15);color:#F59E0B;border:1px solid rgba(245,158,11,0.3)';
                    undoBtn.innerHTML = '<i class="fas fa-undo mr-1"></i> DESFAZER';
                    btn.parentNode.insertBefore(undoBtn, btn);
                    setTimeout(function() { if (undoBtn.parentNode) undoBtn.remove(); }, 10000);
                }
            },
            saveEpisodes() {
                var blocks = document.querySelectorAll('.episode-block-item');
                UI._episodeData = [];
                blocks.forEach(function(block, i) {
                    var d = {};
                    ['title','synopsis','duration','date','direction','mediaUrl','trailerUrl'].forEach(function(f) {
                        var el = block.querySelector('[data-field="' + f + '"]');
                        d[f] = el ? el.value : '';
                    });
                    d.series = (block.querySelector('[data-field="series"]') || {}).value || '';
                    d.season = (block.querySelector('[data-field="season"]') || {}).value || '';
                    d.epNumber = i + 1;
                    d.status = (block.querySelector('[data-field="status"]') || {}).value || '';
                    d.stars = (block.querySelector('[data-field="stars"]') || {}).value || '0';
                    UI._episodeData.push(d);
                });
                UI.closeEpisodeModal();
                Logic.showStatus(UI._episodeData.length + ' episódio(s) salvo(s)!');
            },
            generateDynamicSeriesFields() {
                var numSeasons = parseInt(document.getElementById('ds-seasons').value) || 1;
                var container = document.getElementById('dynamic-series-container');
                var fields = document.getElementById('dynamic-series-fields');
                if (!fields) return;
                if (!UI._dynSeasonEps || Object.keys(UI._dynSeasonEps).length === 0) {
                    UI._dynSeasonEps = {};
                    for (var s = 1; s <= numSeasons; s++) {
                        UI._dynSeasonEps[s] = 1;
                    }
                }
                var totalEps = 0;
                for (var s in UI._dynSeasonEps) { totalEps += UI._dynSeasonEps[s]; }
                var html = '<div style="margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between;background:rgba(139,92,246,0.06);border-radius:0.75rem;padding:0.5rem 0.75rem;border:1px solid rgba(139,92,246,0.1)">' +
                    '<span style="font-size:0.65rem;font-weight:700;color:#C4B5FD">' + numSeasons + ' TEMPORADAS · ' + totalEps + ' EPISÓDIOS</span>' +
                    '<button data-onclick="UI.saveAllDynamicEpisodes()" class="px-3 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-wider transition" style="background:linear-gradient(135deg,#10B981,#059669);color:white;box-shadow:0 2px 10px rgba(16,185,129,0.3)" data-onmouseover="this.style.filter=\'brightness(1.15)\'" data-onmouseout="this.style.filter=\'\'"><i class="fas fa-save mr-1"></i> SALVAR TUDO</button>' +
                    '</div>';
                for (var s = 1; s <= numSeasons; s++) {
                    var epsInSeason = UI._dynSeasonEps[s] || 1;
                    html += '<div class="season-block" data-season="' + s + '" style="margin-bottom:1rem;border:1px solid var(--border-color);border-radius:1rem;padding:1rem;background:rgba(139,92,246,0.05)">' +
                        '<div class="flex items-center gap-2 mb-3">' +
                        '<span class="w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem] font-black" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:white">' + s + '</span>' +
                        '<span class="season-status text-[0.75rem] font-black uppercase tracking-widest" style="color:#8B5CF6">TEMPORADA ' + s + ' — <span class="ep-count">' + epsInSeason + '</span> EPISÓDIOS</span>' +
                        '<div style="flex:1"></div>' +
                        '<button data-onclick="UI._addEp(' + s + ')" class="w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-black transition" style="background:rgba(16,185,129,0.2);color:#10B981;border:1px solid rgba(16,185,129,0.3)" title="Adicionar episódio" data-onmouseover="this.style.background=\'rgba(16,185,129,0.4)\'" data-onmouseout="this.style.background=\'rgba(16,185,129,0.2)\'"><i class="fas fa-plus"></i></button>' +
                        '<button data-onclick="UI._removeEp(' + s + ')" class="w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-black transition" style="background:rgba(239,68,68,0.2);color:#EF4444;border:1px solid rgba(239,68,68,0.3)" title="Remover episódio" data-onmouseover="this.style.background=\'rgba(239,68,68,0.4)\'" data-onmouseout="this.style.background=\'rgba(239,68,68,0.2)\'"><i class="fas fa-minus"></i></button>' +
                        '</div>' +
                        '<div class="season-eps" data-season="' + s + '">';
                    for (var e = 1; e <= epsInSeason; e++) {
                        var epId = 'se' + s + '_ep' + e;
                        html += UI._buildEpRow(s, e, epId);
                    }
                    html += '</div></div>';
                }
                fields.innerHTML = html;
                container.style.display = 'block';
                UI.closeDynamicSeriesModal();
            },
            _buildEpRow(season, episode, epId) {
                return '<div class="dynamic-ep-row" data-ep="' + episode + '" data-season="' + season + '" style="display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;padding:0.3rem 0.5rem;border-radius:0.5rem;background:rgba(0,0,0,0.2)">' +
                    '<span class="text-[0.6rem] font-black" style="color:#8B5CF6;min-width:20px;text-align:center">' + episode + '</span>' +
                    '<input type="text" id="' + epId + '-title" class="field-premium" placeholder="Título EP" style="flex:2;font-size:0.6rem;padding:0.3rem 0.5rem;min-width:0">' +
                    '<input type="text" id="' + epId + '-duration" class="field-premium" placeholder="Duração" style="flex:0 0 70px;font-size:0.6rem;padding:0.3rem 0.5rem">' +
                    '<input type="text" id="' + epId + '-year" class="field-premium" placeholder="Ano" style="flex:0 0 60px;font-size:0.6rem;padding:0.3rem 0.5rem">' +
                    '<div class="input-with-icon" style="flex:2;min-width:0">' +
                    '<input type="text" id="' + epId + '-link" class="field-premium" placeholder="Link / vídeo" style="font-size:0.6rem;padding:0.3rem 1.8rem 0.3rem 0.5rem">' +
                    '<button type="button" class="input-icon-btn" style="width:20px;height:20px;font-size:0.5rem" data-onclick="UI._pickEpFile(\'' + epId + '\')"><i class="fas fa-folder-open"></i></button>' +
                    '</div>' +
                    '<button data-onclick="UI._applyEpisode(\'' + epId + '\',' + season + ',' + episode + ')" class="px-2 py-1 rounded text-[0.5rem] font-black uppercase tracking-wider transition" style="background:rgba(16,185,129,0.2);color:#10B981;border:1px solid rgba(16,185,129,0.3)" title="Aplicar"><i class="fas fa-check"></i></button>' +
                    '<button data-onclick="UI._editEpisode(\'' + epId + '\',' + season + ',' + episode + ')" class="px-2 py-1 rounded text-[0.5rem] font-black uppercase tracking-wider transition" style="background:rgba(59,130,246,0.2);color:#60A5FA;border:1px solid rgba(59,130,246,0.3)" title="Editar"><i class="fas fa-edit"></i></button>' +
                    '</div>';
            },
            _addEp(season) {
                UI._dynSeasonEps[season] = (UI._dynSeasonEps[season] || 1) + 1;
                var epsContainer = document.querySelector('.season-block[data-season="' + season + '"] .season-eps');
                if (!epsContainer) return;
                var e = UI._dynSeasonEps[season];
                var epId = 'se' + season + '_ep' + e;
                var row = document.createElement('div');
                row.innerHTML = UI._buildEpRow(season, e, epId);
                epsContainer.appendChild(row.firstElementChild);
                UI._updateSeasonStatus(season);
            },
            _removeEp(season) {
                if ((UI._dynSeasonEps[season] || 1) <= 1) return;
                var epsContainer = document.querySelector('.season-block[data-season="' + season + '"] .season-eps');
                if (!epsContainer || !epsContainer.lastElementChild) return;
                epsContainer.removeChild(epsContainer.lastElementChild);
                UI._dynSeasonEps[season]--;
                UI._updateSeasonStatus(season);
            },
            _updateSeasonStatus(season) {
                var count = UI._dynSeasonEps[season] || 1;
                var statusEl = document.querySelector('.season-block[data-season="' + season + '"] .ep-count');
                if (statusEl) statusEl.textContent = count;
                var totalEps = 0;
                for (var s in UI._dynSeasonEps) { totalEps += UI._dynSeasonEps[s]; }
                var summaryEl = document.querySelector('#dynamic-series-fields > div:first-child');
                if (summaryEl) {
                    var numSeasons = Object.keys(UI._dynSeasonEps).length;
                    summaryEl.innerHTML = '<span style="font-size:0.65rem;font-weight:700;color:#C4B5FD">' + numSeasons + ' TEMPORADAS · ' + totalEps + ' EPISÓDIOS</span>' +
                        '<button data-onclick="UI.saveAllDynamicEpisodes()" class="px-3 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-wider transition" style="background:linear-gradient(135deg,#10B981,#059669);color:white;box-shadow:0 2px 10px rgba(16,185,129,0.3)" data-onmouseover="this.style.filter=\'brightness(1.15)\'" data-onmouseout="this.style.filter=\'\'"><i class="fas fa-save mr-1"></i> SALVAR TUDO</button>';
                }
            },
            saveAllDynamicEpisodes() {
                var saved = JSON.parse(Store.getItem('_dyn_series_episodes') || '{}');
                var key = _editingId || 'pending';
                if (!saved[key]) saved[key] = [];
                var count = 0;
                document.querySelectorAll('.season-block').forEach(function(block) {
                    var season = parseInt(block.dataset.season);
                    block.querySelectorAll('.dynamic-ep-row').forEach(function(row) {
                        var epNum = parseInt(row.dataset.ep);
                        var epId = 'se' + season + '_ep' + epNum;
                        var title = document.getElementById(epId + '-title');
                        var duration = document.getElementById(epId + '-duration');
                        var year = document.getElementById(epId + '-year');
                        var linkEl = document.getElementById(epId + '-link');
                        if (!title) return;
                        var t = title.value.trim();
                        if (!t) return;
                        var d = duration ? duration.value.trim() : '';
                        var y = year ? year.value.trim() : '';
                        var l = linkEl ? (linkEl.dataset.ref || linkEl.value) : '';
                        var epData = {num: epNum, season: season, title: t, duration: d, year: y, link: l};
                        var existing = -1;
                        for (var i = 0; i < saved[key].length; i++) {
                            if (saved[key][i].season === season && saved[key][i].num === epNum) {
                                existing = i; break;
                            }
                        }
                        if (existing >= 0) saved[key][existing] = epData;
                        else saved[key].push(epData);
                        count++;
                    });
                });
                Store.setItem('_dyn_series_episodes', JSON.stringify(saved));
                Logic.showStatus(count + ' episódios salvos com sucesso!');
            },
            _pickEpFile(epId) {
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.style.display = 'none';
                document.body.appendChild(input);
                input.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        var file = this.files[0];
                        var blobUrl = URL.createObjectURL(file);
                        var ref = {blob: blobUrl, name: file.name};
                        var linkField = document.getElementById(epId + '-link');
                        if (linkField) {
                            linkField.value = file.name;
                            linkField.dataset.ref = JSON.stringify(ref);
                        }
                    }
                    document.body.removeChild(input);
                });
                input.click();
            },
            _applyEpisode(epId, season, episode) {
                var title = document.getElementById(epId + '-title').value.trim();
                var duration = document.getElementById(epId + '-duration').value.trim();
                var year = document.getElementById(epId + '-year').value.trim();
                var linkEl = document.getElementById(epId + '-link');
                var link = linkEl ? (linkEl.dataset.ref || linkEl.value) : '';
                if (!title) { Logic.showStatus('Preencha o título do episódio'); return; }
                var epData = {num: episode, season: season, title: title, duration: duration, year: year, link: link};
                var saved = JSON.parse(Store.getItem('_dyn_series_episodes') || '{}');
                var key = _editingId || 'pending';
                if (!saved[key]) saved[key] = [];
                var existing = -1;
                for (var i = 0; i < saved[key].length; i++) {
                    if (saved[key][i].season === season && saved[key][i].num === episode) {
                        existing = i;
                        break;
                    }
                }
                if (existing >= 0) saved[key][existing] = epData;
                else saved[key].push(epData);
                Store.setItem('_dyn_series_episodes', JSON.stringify(saved));
                Logic.showStatus('Episódio T' + season + 'E' + episode + ' aplicado!');
                var applyBtn = event && event.target ? event.target.closest('button') : null;
                if (applyBtn) { applyBtn.style.background = 'rgba(16,185,129,0.4)'; setTimeout(function() { applyBtn.style.background = 'rgba(16,185,129,0.2)'; }, 1000); }
            },
            _editEpisode(epId, season, episode) {
                var saved = JSON.parse(Store.getItem('_dyn_series_episodes') || '{}');
                var key = _editingId || 'pending';
                var episodes = saved[key] || [];
                for (var i = 0; i < episodes.length; i++) {
                    if (episodes[i].season === season && episodes[i].num === episode) {
                        var ep = episodes[i];
                        document.getElementById(epId + '-title').value = ep.title || '';
                        document.getElementById(epId + '-duration').value = ep.duration || '';
                        document.getElementById(epId + '-year').value = ep.year || '';
                        var linkEl = document.getElementById(epId + '-link');
                        if (linkEl) {
                            if (ep.link && ep.link.charAt(0) === '{') {
                                try { var r = JSON.parse(ep.link); linkEl.value = r.name || ''; linkEl.dataset.ref = ep.link; } catch(e) { linkEl.value = ep.link; }
                            } else {
                                linkEl.value = ep.link || '';
                            }
                        }
                        Logic.showStatus('Dados carregados para edição');
                        return;
                    }
                }
                Logic.showStatus('Nenhum dado salvo para este episódio');
            },
            _estreiaSavedIds: {},
            _estreiaCounter: 0,
            _buildEstreiaRow(index, data) {
                data = data || {};
                var cats = Logic.getCategories();
                var opts = '<option value="">Gênero</option>' + cats.map(function(c) {
                    var sel = (data.genre || '') === c ? ' selected' : '';
                    return '<option value="' + c + '"' + sel + '>' + c + '</option>';
                }).join('');
                var typeVal = data.estreiaType || '';
                var typeOpts = '<option value="">Tipo</option>' +
                    '<option value="filmes"' + (typeVal === 'filmes' ? ' selected' : '') + '>Filmes</option>' +
                    '<option value="series"' + (typeVal === 'series' ? ' selected' : '') + '>Séries</option>';
                var titleVal = (data.titlePt || data.originalTitle || '').replace(/"/g,'&quot;');
                // Convert DD/MM/AAAA to YYYY-MM-DD for date input
                var dateRaw = data.date || '';
                var dateVal = UI._dateToInput(dateRaw);
                var trailerVal = (data.trailUrl || '').replace(/"/g,'&quot;');
                return '<div class="dynamic-estreia-row" data-index="' + index + '" data-saved-id="' + (data.id || '') + '" style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.6rem;padding:0.6rem 0.6rem;border-radius:0.75rem;background:rgba(0,0,0,0.12);border:1px solid var(--border-color);flex-wrap:nowrap">' +
                    '<span class="font-black shrink-0" style="color:#34D399;min-width:28px;text-align:center;font-size:0.9rem">' + (index + 1) + '</span>' +
                    '<input type="date" id="de-date-' + index + '" class="field-premium" style="flex:0 0 150px;font-size:0.85rem;padding:0.4rem 0.5rem;min-height:38px;color-scheme:dark" value="' + dateVal + '" data-onchange="UI._checkEstreiaDateNotification(this.value)">' +
                    '<input type="text" id="de-title-' + index + '" class="field-premium" placeholder="Título" style="flex:2;font-size:0.85rem;padding:0.45rem 0.6rem;min-width:0" value="' + titleVal + '">' +
                    '<select id="de-type-' + index + '" class="field-premium" title="Tipo" style="flex:0 0 110px;font-size:0.8rem;padding:0.45rem 0.6rem;min-width:0">' + typeOpts + '</select>' +
                    '<select id="de-category-' + index + '" class="field-premium" style="flex:0 0 140px;font-size:0.8rem;padding:0.45rem 0.6rem;min-width:0">' + opts + '</select>' +
                    '<input type="text" id="de-trailer-' + index + '" class="field-premium" placeholder="Trailer URL" style="flex:1;font-size:0.8rem;padding:0.45rem 0.6rem;min-width:0" value="' + trailerVal + '">' +
                    '<button type="button" class="estreia-btn estreia-btn-remove" data-onclick="UI._removeEstreiaRow(' + index + ')" title="Remover esta estreia" style="flex:0 0 30px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;padding:0"><i class="fas fa-minus"></i></button>' +
                    '</div>';
            },
            _initDynamicEstreias(savedData) {
                var fields = document.getElementById('dynamic-estreias-fields');
                if (!fields) return;
                var rows = fields.querySelectorAll('.dynamic-estreia-row');
                var existingCount = rows.length;
                if (existingCount > 0) return;
                UI._estreiaCounter = 0;
                UI._estreiaSavedIds = {};
                if (savedData && savedData.id) {
                    UI._addEstreiaRow(savedData);
                } else {
                    UI._addEstreiaRow();
                }
            },
            _addEstreiaRow(data) {
                var fields = document.getElementById('dynamic-estreias-fields');
                if (!fields) return;
                var index = UI._estreiaCounter++;
                var wrapper = document.createElement('div');
                wrapper.innerHTML = UI._buildEstreiaRow(index, data || {});
                var newRow = wrapper.firstElementChild;
                // Always add new row at the TOP (above the first existing row)
                if (fields.firstChild) {
                    fields.insertBefore(newRow, fields.firstChild);
                } else {
                    fields.appendChild(newRow);
                }
                // Re-index all rows
                UI._reindexEstreiaRows();
                UI._updateEstreiaSummary();
                // Scroll to show last registered (bottom)
                var container = document.getElementById('dynamic-estreias-container');
                if (container) container.scrollTop = container.scrollHeight;
            },
            _removeLastEstreiaRow() {
                var fields = document.getElementById('dynamic-estreias-fields');
                if (!fields) return;
                var rows = fields.querySelectorAll('.dynamic-estreia-row');
                if (rows.length <= 1) return;
                var last = rows[rows.length - 1];
                var savedId = last.getAttribute('data-saved-id');
                if (savedId) {
                    if (!confirm('Remover esta estreia do sistema?')) return;
                    APP_STATE.movies = APP_STATE.movies.filter(function(m) { return m.id !== savedId; });
                    delete UI._estreiaSavedIds[savedId];
                    Storage.save();
                    Render.all();
                }
                fields.removeChild(last);
                UI._reindexEstreiaRows();
                UI._updateEstreiaSummary();
                UI._updateEstreiaAutoDeleteWarning();
            },
            _reindexEstreiaRows() {
                var fields = document.getElementById('dynamic-estreias-fields');
                if (!fields) return;
                var rows = fields.querySelectorAll('.dynamic-estreia-row');
                var total = rows.length;
                rows.forEach(function(row, idx) {
                    row.setAttribute('data-index', idx);
                    var numSpan = row.querySelector('span:first-child');
                    // Numeração invertida: a mais recente (topo) recebe o maior número
                    if (numSpan) numSpan.textContent = total - idx;
                    // Update input ids
                    var titleInput = row.querySelector('input[placeholder="Título"]');
                    if (titleInput) titleInput.id = 'de-title-' + idx;
                    var dateInput = row.querySelector('input[type="date"]');
                    if (dateInput) { dateInput.id = 'de-date-' + idx; dateInput.setAttribute('onchange', 'UI._checkEstreiaDateNotification(this.value)'); }
                    var typeSelect = row.querySelector('select[id^="de-type-"]');
                    if (typeSelect) typeSelect.id = 'de-type-' + idx;
                    var catSelect = row.querySelector('select[id^="de-category-"]');
                    if (catSelect) catSelect.id = 'de-category-' + idx;
                    var trailerInput = row.querySelectorAll('input[type="text"]');
                    for (var t = 0; t < trailerInput.length; t++) {
                        if (trailerInput[t].placeholder === 'Trailer URL') {
                            trailerInput[t].id = 'de-trailer-' + idx;
                            break;
                        }
                    }
                    var removeBtn = row.querySelector('.estreia-btn-remove');
                    if (removeBtn) removeBtn.setAttribute('onclick', 'UI._removeEstreiaRow(' + idx + ')');
                });
            },
            _applyEstreia(index) {
                var row = document.querySelector('.dynamic-estreia-row[data-index="' + index + '"]');
                if (!row) { Logic.showStatus('Linha não encontrada'); return; }
                var title = document.getElementById('de-title-' + index);
                var date = document.getElementById('de-date-' + index);
                var category = document.getElementById('de-category-' + index);
                var type = document.getElementById('de-type-' + index);
                var trailer = document.getElementById('de-trailer-' + index);
                if (!title) return;
                var t = title.value.trim();
                if (!t) { Logic.showStatus('Preencha o título da estreia'); return; }
                var typeVal = (type && type.value) ? type.value : 'filmes';
                var savedId = row.getAttribute('data-saved-id');
                if (savedId) {
                    // Update existing
                    var idx = APP_STATE.movies.findIndex(function(m) { return m.id === savedId; });
                    if (idx >= 0) {
                        var orig = APP_STATE.movies[idx];
                        orig.titlePt = t;
                        orig.originalTitle = t;
                        orig.date = date ? UI._dateToStorage(date.value.trim()) : '';
                        orig.genre = category ? category.value : (orig.genre || '');
                        orig.estreiaType = typeVal;
                        orig.trailUrl = trailer ? trailer.value.trim() : '';
                        APP_STATE.movies[idx] = orig;
                        Storage.save();
                        Render.all();
                        UI.updateCounters();
                        Logic.showStatus('Estreia "' + t + '" atualizada!');
                    }
                } else {
                    // Create new
                    var newItem = {
                        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
                        _createdAt: Date.now().toString(),
                        type: 'estreias',
                        estreiaType: typeVal,
                        originalTitle: t,
                        titlePt: t,
                        date: date ? UI._dateToStorage(date.value.trim()) : '',
                        genre: category ? category.value : '',
                        trailUrl: trailer ? trailer.value.trim() : '',
                        image: 'https://via.placeholder.com/300x450'
                    };
                    APP_STATE.movies.push(newItem);
                    row.setAttribute('data-saved-id', newItem.id);
                    UI._estreiaSavedIds[newItem.id] = true;
                    Storage.save();
                    Render.all();
                    UI.updateCounters();
                    Logic.showStatus('Estreia "' + t + '" adicionada!');
                }
                // Mark apply button as neon green (applied)
                var applyBtn = row.querySelector('.estreia-btn-apply');
                if (applyBtn) applyBtn.classList.add('applied');
                Logic.checkEstreiaNotifications();
                UI._updateEstreiaAutoDeleteWarning();
            },
            _editEstreiaRow(index) {
                var saved = UI._getSavedEstreiaForRow(index);
                if (!saved) { Logic.showStatus('Nenhuma estreia salva para editar nesta linha'); return; }
                var title = document.getElementById('de-title-' + index);
                var date = document.getElementById('de-date-' + index);
                var category = document.getElementById('de-category-' + index);
                var type = document.getElementById('de-type-' + index);
                var trailer = document.getElementById('de-trailer-' + index);
                if (title) title.value = saved.titlePt || saved.originalTitle || '';
                if (date) date.value = UI._dateToInput(saved.date || '');
                if (category) category.value = saved.genre || '';
                if (type) type.value = saved.estreiaType || '';
                if (trailer) trailer.value = saved.trailUrl || '';
                Logic.showStatus('Dados carregados para edição');
            },
            _getSavedEstreiaForRow(index) {
                var row = document.querySelector('.dynamic-estreia-row[data-index="' + index + '"]');
                if (!row) return null;
                var savedId = row.getAttribute('data-saved-id');
                if (!savedId) return null;
                return APP_STATE.movies.find(function(m) { return m.id === savedId; });
            },
            _removeEstreiaRow(index) {
                var row = document.querySelector('.dynamic-estreia-row[data-index="' + index + '"]');
                if (!row) return;
                var savedId = row.getAttribute('data-saved-id');
                if (savedId) {
                    var movie = APP_STATE.movies.find(function(m) { return m.id === savedId; });
                    var title = movie ? (movie.titlePt || movie.originalTitle || '') : '';
                    if (!confirm('Remover a estreia "' + title + '" do sistema?')) return;
                    APP_STATE.movies = APP_STATE.movies.filter(function(m) { return m.id !== savedId; });
                    delete UI._estreiaSavedIds[savedId];
                    Storage.save();
                    Render.all();
                    Logic.showStatus('Estreia removida!');
                }
                var fields = document.getElementById('dynamic-estreias-fields');
                if (fields) fields.removeChild(row);
                UI._reindexEstreiaRows();
                UI._updateEstreiaSummary();
                if (fields && fields.querySelectorAll('.dynamic-estreia-row').length === 0) {
                    UI._addEstreiaRow();
                }
                Logic.checkEstreiaNotifications();
                UI._updateEstreiaAutoDeleteWarning();
            },
            _removeAllEstreias() {
                var fields = document.getElementById('dynamic-estreias-fields');
                if (!fields) return;
                var rows = fields.querySelectorAll('.dynamic-estreia-row');
                if (rows.length === 0) { Logic.showStatus('Não há estreias para remover.'); return; }
                var total = APP_STATE.movies.filter(function(m) { return m.type === 'estreias'; }).length;
                if (!confirm('Remover TODAS as estreias (' + total + ')? Esta ação não pode ser desfeita.')) return;
                rows.forEach(function(row) {
                    var savedId = row.getAttribute('data-saved-id');
                    if (savedId) {
                        APP_STATE.movies = APP_STATE.movies.filter(function(m) { return m.id !== savedId; });
                        delete UI._estreiaSavedIds[savedId];
                    }
                });
                fields.innerHTML = '';
                UI._estreiaSavedIds = {};
                UI._estreiaCounter = 0;
                Storage.save();
                Render.all();
                UI.updateCounters();
                Logic.updateReminderBadge();
                Logic.checkEstreiaNotifications();
                UI._addEstreiaRow();
                UI._updateEstreiaSummary();
                UI._updateEstreiaAutoDeleteWarning();
                Logic.showStatus('Todas as estreias foram removidas!');
            },
            _isDateExpired(dateStr) {
                if (!dateStr) return false;
                var parts = dateStr.split('/');
                if (parts.length !== 3) return false;
                var d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                var today = new Date();
                today.setHours(0,0,0,0);
                return d < today;
            },
            _autoDeleteExpiredEstreias() {
                var deleted = [];
                var removedBlobs = [];
                APP_STATE.movies = APP_STATE.movies.filter(function(m) {
                    if (m.type !== 'estreias') return true;
                    if (UI._isDateExpired(m.date)) {
                        deleted.push(m.titlePt || m.originalTitle || 'Sem título');
                        if (m.imageKey && typeof StoreImages !== 'undefined') removedBlobs.push(m.imageKey);
                        return false;
                    }
                    return true;
                });
                removedBlobs.forEach(function(k) { StoreImages.remove(k); });
                if (deleted.length > 0) {
                    Storage.save();
                    Render.all();
                    UI.updateCounters();
                    Logic.updateReminderBadge();
                    Logic.showStatus(deleted.length + ' estreia(s) vencida(s) removida(s) automaticamente.');
                }
                // Update warning display
                UI._updateEstreiaAutoDeleteWarning();
            },
            _updateEstreiaAutoDeleteWarning() {
                var warning = document.getElementById('estreia-auto-delete-warning');
                if (!warning) return;
                var hasExpired = false;
                APP_STATE.movies.forEach(function(m) {
                    if (m.type === 'estreias' && UI._isDateExpired(m.date)) hasExpired = true;
                });
                warning.style.display = hasExpired ? 'block' : 'none';
            },
            _dateToInput(dateStr) {
                if (!dateStr) return '';
                var sep = dateStr.indexOf('/') >= 0 ? '/' : '-';
                var parts = dateStr.split(sep);
                if (parts.length !== 3) return dateStr;
                if (parts[0].length === 4) {
                    // Already YYYY format: replace separator with dash
                    return parts[0] + '-' + parts[1] + '-' + parts[2];
                }
                // DD/MM/AAAA → YYYY-MM-DD
                return parts[2] + '-' + parts[1] + '-' + parts[0];
            },
            _dateToStorage(dateStr) {
                if (!dateStr) return '';
                var sep = dateStr.indexOf('-') >= 0 ? '-' : '/';
                var parts = dateStr.split(sep);
                if (parts.length !== 3) return dateStr;
                if (parts[0].length === 4) {
                    // YYYY-MM-DD → DD/MM/AAAA
                    return parts[2] + '/' + parts[1] + '/' + parts[0];
                }
                // Already DD/MM/AAAA
                return parts[0] + '/' + parts[1] + '/' + parts[2];
            },
            _checkEstreiaDateNotification(dateVal) {
                if (!dateVal) return;
                var parts = dateVal.split('-');
                if (parts.length !== 3) return;
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                var estreiaDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                estreiaDate.setHours(0, 0, 0, 0);
                var diff = Math.round((estreiaDate - today) / (1000 * 60 * 60 * 24));
                if (diff === 3) {
                    Logic.showModalStatus('FALTAM 3 DIAS PARA ESTA ESTREIA!', 'orange');
                } else if (diff === 2) {
                    Logic.showModalStatus('FALTAM 2 DIAS PARA ESTA ESTREIA!', 'orange');
                } else if (diff === 1) {
                    Logic.showModalStatus('FALTAM 1 DIA PARA ESTA ESTREIA!', 'orange');
                }
            },
            _updateEstreiaSummary() {
                var fields = document.getElementById('dynamic-estreias-fields');
                if (!fields) return;
                var count = fields.querySelectorAll('.dynamic-estreia-row').length;
                var display = document.getElementById('estreia-count-display');
                if (display) display.textContent = count + ' ESTREIA' + (count !== 1 ? 'S' : '');
                var footerCounter = document.getElementById('counter-estreias');
                if (footerCounter) footerCounter.innerText = count;
            },
            saveAllDynamicEstreias() {
                var fields = document.getElementById('dynamic-estreias-fields');
                if (!fields) return;
                var rows = fields.querySelectorAll('.dynamic-estreia-row');
                var saved = 0;
                rows.forEach(function(row) {
                    var index = parseInt(row.getAttribute('data-index'));
                    var title = document.getElementById('de-title-' + index);
                    if (!title || !title.value.trim()) return;
                    var date = document.getElementById('de-date-' + index);
                    var category = document.getElementById('de-category-' + index);
                    var type = document.getElementById('de-type-' + index);
                    var trailer = document.getElementById('de-trailer-' + index);
                    var t = title.value.trim();
                    var typeVal = (type && type.value) ? type.value : 'filmes';
                    var savedId = row.getAttribute('data-saved-id');
                    if (savedId) {
                        var idx = APP_STATE.movies.findIndex(function(m) { return m.id === savedId; });
                        if (idx >= 0) {
                            var orig = APP_STATE.movies[idx];
                            orig.titlePt = t;
                            orig.originalTitle = t;
                            orig.date = date ? UI._dateToStorage(date.value.trim()) : '';
                            orig.genre = category ? category.value : (orig.genre || '');
                            orig.estreiaType = typeVal;
                            orig.trailUrl = trailer ? trailer.value.trim() : '';
                            APP_STATE.movies[idx] = orig;
                            saved++;
                        }
                    } else {
                        var newItem = {
                            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
                            _createdAt: Date.now().toString(),
                            type: 'estreias',
                            estreiaType: typeVal,
                            originalTitle: t,
                            titlePt: t,
                            date: date ? UI._dateToStorage(date.value.trim()) : '',
                            genre: category ? category.value : '',
                            trailUrl: trailer ? trailer.value.trim() : '',
                            image: 'https://via.placeholder.com/300x450'
                        };
                        APP_STATE.movies.push(newItem);
                        row.setAttribute('data-saved-id', newItem.id);
                        UI._estreiaSavedIds[newItem.id] = true;
                        saved++;
                    }
                });
                if (saved > 0) {
                    Storage.save();
                    Render.all();
                    UI.updateCounters();
                    Logic.checkEstreiaNotifications();
                    UI._updateEstreiaAutoDeleteWarning();
                    Logic.showStatus(saved + ' estreia' + (saved !== 1 ? 's' : '') + ' salva' + (saved !== 1 ? 's' : '') + ' com sucesso!');
                }
                // After save, set focus on the last registered estreia
                var container = document.getElementById('dynamic-estreias-container');
                if (container) {
                    var allRows = container.querySelectorAll('.dynamic-estreia-row');
                    if (allRows.length > 0) {
                        var lastRow = allRows[0]; // newest is at top after reverse
                        var lastTitle = lastRow.querySelector('input[placeholder="Título"]');
                        if (lastTitle) lastTitle.focus();
                    }
                }
            },
            exportCadastroLogImage(format) {
                var content = document.getElementById('cadastro-log-preview');
                if (!content) return;
                var loadHtml2canvas = function(cb) {
                    if (typeof html2canvas !== 'undefined') { cb(); return; }
                    var script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = cb;
                    document.head.appendChild(script);
                };
                loadHtml2canvas(function() {
                    html2canvas(content, {scale:2,useCORS:true,backgroundColor:'#ffffff'}).then(function(canvas) {
                        var link = document.createElement('a');
                        link.download = 'historico_cadastro.' + format;
                        link.href = canvas.toDataURL('image/' + (format === 'jpg' ? 'jpeg' : format), 0.95);
                        link.click();
                    });
                });
            }
        };
