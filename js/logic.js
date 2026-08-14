        const Logic = {
            _editingId: null,
            _lastNotifications: [],
            _reminderListRefresh: false,

            _headerBtnIds: ['btn-theme','btn-notifications','btn-reminders','btn-cadastro-log','btn-config','btn-info','btn-generate-list','btn-dashboard','btn-filters'],
            _clearHeaderBtnActive() {
                this._headerBtnIds.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.classList.remove('active');
                });
            },

            deleteMovieCtx() {
                var self = this;
                this.closeCtxMenu(function() {
                    if(confirm("Eliminar permanentemente?")) {
                        var mv = APP_STATE.movies.find(m => m.id === APP_STATE.selectedId);
                        if (mv && mv.imageKey && typeof StoreImages !== 'undefined') StoreImages.remove(mv.imageKey);
                        APP_STATE.movies = APP_STATE.movies.filter(m => m.id !== APP_STATE.selectedId);
                        Storage.save();
                        Render.all();
                    }
                });
            },

            editEstreia: function(id) {
                APP_STATE.selectedId = id;
                Logic.editMovieCtx();
            },
            deleteEstreiaConfirm: function(id) {
                var movie = APP_STATE.movies.find(function(m) { return m.id === id; });
                if (!movie) return;
                var title = movie.titlePt || movie.originalTitle || 'Estreia';
                if (!confirm('Remover a estreia "' + title + '"? Esta ação não pode ser desfeita.')) return;
                if (movie.imageKey && typeof StoreImages !== 'undefined') StoreImages.remove(movie.imageKey);
                APP_STATE.movies = APP_STATE.movies.filter(function(m) { return m.id !== id; });
                Store.setItem('cinecatalog_v126', Storage.toJSON());
                Render.all();
                UI.updateCounters();
                Logic.updateReminderBadge();
                Logic.showStatus('Estreia removida');
            },
            editMovieCtx() {
                var self = this;
                this.closeCtxMenu(function() {
                    const movie = APP_STATE.movies.find(m => m.id === APP_STATE.selectedId);
                    if (!movie) return;
                    UI.openModal('modal-cadastro');
                    _editingId = movie.id;
                    // Adiciona classe edit-mode às áreas de poster
                    var fArea = document.getElementById('f-poster-area');
                    var fsArea = document.getElementById('fs-poster-area');
                    if (fArea) fArea.classList.add('edit-mode');
                    if (fsArea) fsArea.classList.add('edit-mode');
                    UI.switchTab(movie.type);
                    UI._lockCadastroTabs(movie.type);
                    const typeLabel = movie.type === 'filmes' ? 'O FILME' : movie.type === 'series' ? 'A SÉRIE' : 'A ESTREIA';
                    document.getElementById('modal-title').innerHTML = 'EDITAR <span style="-webkit-text-fill-color:#3B82F6">' + typeLabel + '</span>';
                    var btn = document.getElementById('btn-save-v2');
                    if (btn) btn.innerHTML = '<i class="fas fa-check mr-2"></i> ATUALIZAR';
                    // Load fields based on type
                    if (movie.type === 'filmes') {
                        document.getElementById('f-title').value = movie.titlePt || movie.originalTitle || '';
                        document.getElementById('f-year').value = movie.year || '';
                        document.getElementById('f-duration').value = movie.duration || '';
                        document.getElementById('f-director').value = movie.director || '';
                        document.getElementById('f-cast').value = movie.cast || '';
                        document.getElementById('f-category').value = movie.genre || '';
                        document.getElementById('f-desc').value = movie.desc || '';
                        document.getElementById('f-trailer-url').value = movie.trailUrl || '';
                        document.getElementById('f-other-info').value = movie.otherInfo || '';
                        document.getElementById('f-stars').value = movie.stars || 0;
                        document.querySelectorAll('#star-input-container i').forEach(function(s) { s.classList.toggle('text-yellow-500', s.dataset.v <= (movie.stars || 0)); });
                        UI._restoringPoster = true;
                        if ((movie.image && movie.image !== 'https://via.placeholder.com/300x450') || movie.imageKey) {
                            UI.setPosterPreview(movie.image);
                        } else {
                            UI.resetPoster();
                        }
                        UI._restoringPoster = false;
                        if (movie.mediaFile) {
                            var fMedia = document.getElementById('f-media-url');
                            if (fMedia) {
                                try { var r = JSON.parse(movie.mediaFile); fMedia.value = r.name || ''; if (r.blob) fMedia.dataset.ref = movie.mediaFile; } catch(e) { fMedia.value = movie.mediaFile; }
                            }
                        }
                        var st = movie.statuses || {};
                        document.getElementById('f-status-new').checked = st.new || false;
                        document.getElementById('f-status-watch').checked = st.watch || false;
                        document.getElementById('f-status-fav').checked = st.favorite || false;
                        document.querySelectorAll('.status-check-item').forEach(function(item) {
                            var inp = item.querySelector('input');
                            var cls = 'active-' + item.dataset.status;
                            item.classList.toggle(cls, inp.checked);
                        });
                    } else if (movie.type === 'series') {
                        document.getElementById('fs-title').value = movie.titlePt || movie.originalTitle || '';
                        document.getElementById('fs-episode-number').value = movie.episodeNumber || '';
                        document.getElementById('fs-episode-title').value = movie.episodeTitle || '';
                        document.getElementById('fs-year').value = movie.year || '';
                        document.getElementById('fs-duration').value = movie.duration || '';
                        document.getElementById('fs-desc').value = movie.desc || '';
                        document.getElementById('fs-season').value = movie.season || '';
                        document.getElementById('fs-director').value = movie.director || movie.creator || '';
                        document.getElementById('fs-cast').value = movie.cast || '';
                        document.getElementById('fs-category').value = movie.genre || '';
                        document.getElementById('fs-other-info').value = movie.otherInfo || '';
                        document.getElementById('fs-stars').value = movie.stars || 0;
                        document.querySelectorAll('#star-input-container-series i').forEach(function(s) { s.classList.toggle('text-yellow-500', s.dataset.v <= (movie.stars || 0)); });
                        UI._restoringPoster = true;
                        if ((movie.image && movie.image !== 'https://via.placeholder.com/300x450') || movie.imageKey) {
                            UI.setPosterPreview(movie.image, 'fs');
                        } else {
                            UI.resetPoster('fs');
                        }
                        UI._restoringPoster = false;
                        var countryEl = document.getElementById('fs-country');
                        if (countryEl) countryEl.value = movie.country || '';
                        // Load dynamic episodes
                        if (movie.dynamicEpisodes && movie.dynamicEpisodes.length) {
                            var numSeasons = 0;
                            var epsBySeason = {};
                            movie.dynamicEpisodes.forEach(function(ep) {
                                var s = ep.season || 1;
                                if (!epsBySeason[s]) epsBySeason[s] = [];
                                epsBySeason[s].push(ep);
                                if (s > numSeasons) numSeasons = s;
                            });
                            document.getElementById('ds-seasons').value = numSeasons || 1;
                            UI._dynSeasonEps = {};
                            for (var s in epsBySeason) { UI._dynSeasonEps[s] = epsBySeason[s].length; }
                            UI.generateDynamicSeriesFields();
                            movie.dynamicEpisodes.forEach(function(ep) {
                                var epId = 'se' + ep.season + '_ep' + ep.num;
                                var titleEl = document.getElementById(epId + '-title');
                                if (titleEl) titleEl.value = ep.title || '';
                                var durEl = document.getElementById(epId + '-duration');
                                if (durEl) durEl.value = ep.duration || '';
                                var yearEl = document.getElementById(epId + '-year');
                                if (yearEl) yearEl.value = ep.year || '';
                                var linkEl = document.getElementById(epId + '-link');
                                if (linkEl) {
                                    if (ep.link && ep.link.charAt(0) === '{') {
                                        try { var r = JSON.parse(ep.link); linkEl.value = r.name || ''; linkEl.dataset.ref = ep.link; } catch(e) { linkEl.value = ep.link; }
                                    } else {
                                        linkEl.value = ep.link || '';
                                    }
                                }
                            });
                            var saved = JSON.parse(Store.getItem('_dyn_series_episodes') || '{}');
                            saved[_editingId] = movie.dynamicEpisodes;
                            Store.setItem('_dyn_series_episodes', JSON.stringify(saved));
                        }
                        var st = movie.statuses || {};
                        document.getElementById('fs-status-new').checked = st.new || false;
                        document.getElementById('fs-status-watch').checked = st.watch || false;
                        document.getElementById('fs-status-fav').checked = st.favorite || false;
                        document.querySelectorAll('.status-check-item').forEach(function(item) {
                            var inp = item.querySelector('input');
                            var cls = 'active-' + item.dataset.status;
                            item.classList.toggle(cls, inp.checked);
                        });
                        // Load new season/episode data
                        UI._seasonData = (movie.dynamicSeasons && movie.dynamicSeasons.length > 0) ? movie.dynamicSeasons.slice() : [];
                        UI._episodeData = (movie.dynamicEpisodesNew && movie.dynamicEpisodesNew.length > 0) ? movie.dynamicEpisodesNew.slice() : [];
                        var trEl = document.getElementById('fs-trailer-url');
                        if (trEl) trEl.value = movie.trailerUrl || '';
                        UI._renderSeasonBlocks();
                        UI._renderEpisodeBlocks();
                    } else if (movie.type === 'estreias') {
                        // Clear existing dynamic rows and populate from movie
                        var fields = document.getElementById('dynamic-estreias-fields');
                        if (fields) fields.innerHTML = '';
                        UI._estreiaCounter = 0;
                        UI._estreiaSavedIds = {};
                        if (movie.id) {
                            UI._addEstreiaRow(movie);
                            // Mark apply button as applied
                            setTimeout(function() {
                                var row = fields ? fields.querySelector('.dynamic-estreia-row') : null;
                                if (row) {
                                    var applyBtn = row.querySelector('.estreia-btn-apply');
                                    if (applyBtn) applyBtn.classList.add('applied');
                                }
                            }, 50);
                        } else {
                            UI._addEstreiaRow();
                        }
                        UI._updateEstreiaAutoDeleteWarning();
                    }
                    // Hide clone button when editing
                    var cloneBtn = document.getElementById('btn-clone-data');
                    if (cloneBtn) cloneBtn.style.display = 'none';
                    // Also hide clone when estreia tab
                    var estreiaClone = document.querySelector('#tab-content-estreias #btn-clone-data');
                    if (estreiaClone) estreiaClone.style.display = 'none';
                });
            },

            handleSearch(val) {
                clearTimeout(APP_STATE.searchTimer);
                APP_STATE.searchTimer = setTimeout(() => {
                    var trimmed = val.trim();
                    if (trimmed.length > 0 && trimmed.length < 3) {
                        APP_STATE.searchQuery = '';
                        Render.all();
                        return;
                    }
                    APP_STATE.searchQuery = val;
                    Render.all();
                    if (trimmed.length >= 3) {
                        this._saveSearchHistory(trimmed);
                    }
                }, 350);
            },

            clearSearch() {
                document.getElementById('main-search').value = '';
                this.handleSearch('');
                document.querySelectorAll('.movie-card.search-match').forEach(function(c) { c.classList.remove('search-match'); });
            },

            setMainView(type) {
                APP_STATE.currentView = type;
                document.getElementById('link-filmes').classList.toggle('active', type === 'filmes');
                document.getElementById('link-series').classList.toggle('active', type === 'series');
                document.getElementById('link-estreias').classList.toggle('active', type === 'estreias');
                Render.all();
            },

            setViewMode(mode) {
                APP_STATE.viewMode = mode;
                document.querySelectorAll('.view-btn[id^="view-"]').forEach(function(b) { b.classList.remove('active'); });
                var btn = document.getElementById('view-' + mode);
                if (btn) btn.classList.add('active');
                Render.all();
            },

            toggleViewContextMenu(event) {
                var menu = document.getElementById('view-context-menu');
                if (!menu) return;
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                    return;
                }
                var btn = event.currentTarget;
                var rect = btn.getBoundingClientRect();
                menu.style.left = (rect.left - 100) + 'px';
                menu.style.top = (rect.bottom + 4) + 'px';
                menu.classList.add('show');
                // Close on outside click
                var closer = function(e) {
                    if (!e.target.closest('#view-context-menu') && !e.target.closest('#view-ctx-btn')) {
                        menu.classList.remove('show');
                        document.removeEventListener('click', closer);
                    }
                };
                setTimeout(function() { document.addEventListener('click', closer); }, 10);
            },

            closeViewContextMenu() {
                var menu = document.getElementById('view-context-menu');
                if (menu) menu.classList.remove('show');
            },

            setMarqueeSpeed(val) {
                document.getElementById('marquee-speed-val').textContent = val + 's';
                document.documentElement.style.setProperty('--marquee-speed', val + 's');
                // Update all marquee rows
                document.querySelectorAll('.marquee-row').forEach(function(r) {
                    r.style.animationDuration = val + 's';
                });
            },

            setMarqueeEffect(effect) {
                APP_STATE.marqueeEffect = effect;
                ['linear','ease','alternate'].forEach(function(e) {
                    var el = document.getElementById('effect-' + e);
                    if (el) el.style.display = 'none';
                });
                var sel = document.getElementById('effect-' + effect);
                if (sel) sel.style.display = 'inline';
                // Apply to marquee rows
                document.querySelectorAll('.marquee-row').forEach(function(r) {
                    if (effect === 'alternate') {
                        r.style.animationDirection = r.classList.contains('marquee-row-right') ? 'alternate' : 'alternate-reverse';
                    } else {
                        r.style.animationTimingFunction = effect === 'ease' ? 'ease-in-out' : 'linear';
                        r.style.animationDirection = r.classList.contains('marquee-row-left') ? 'normal' : '';
                    }
                });
            },

            setMarqueePause(paused) {
                document.querySelectorAll('.marquee-row').forEach(function(r) {
                    r.classList.toggle('paused', paused);
                });
            },

            _renderCarrossel(items) {
                var container = document.getElementById('movies-container');
                if (!container) return;
                container.className = '';
                container.innerHTML = '';
                var cpr = parseInt(document.body.style.getPropertyValue('--cards-per-row') || '5', 10);
                var gapTotal = (cpr - 1) * 1.5; // 1.5rem gap per card
                container.style.setProperty('--carrossel-gap', gapTotal + 'rem');
                var rows = [[], []];
                items.forEach(function(m, i) {
                    rows[i % 2].push(m);
                });
                var self = this;
                rows.forEach(function(rowItems, rowIdx) {
                    var rowEl = document.createElement('div');
                    rowEl.className = 'carrossel-row';
                    var scrollPos = 0;
                    var maxScroll = Math.max(0, rowItems.length - cpr);
                    // Left arrow
                    var leftArrow = document.createElement('button');
                    leftArrow.className = 'carrossel-arrow disabled';
                    leftArrow.innerHTML = '<i class="fas fa-chevron-left" style="font-size:9px"></i>';
                    leftArrow.addEventListener('click', function() {
                        if (scrollPos <= 0) return;
                        scrollPos--;
                        this.classList.toggle('disabled', scrollPos <= 0);
                        rightArrow.classList.toggle('disabled', scrollPos >= maxScroll);
                        track.style.transform = 'translateX(-' + (scrollPos * (100 / cpr)) + '%)';
                    });
                    // Track
                    var track = document.createElement('div');
                    track.className = 'carrossel-track';
                    track.style.setProperty('--cards-per-row', cpr);
                    track.style.setProperty('--carrossel-gap', gapTotal + 'rem');
                    var frag = document.createDocumentFragment();
                    rowItems.forEach(function(m) {
                        frag.appendChild(Render.createCard(m));
                    });
                    track.appendChild(frag);
                    // Wrap track so overflow hidden clips the scroll but cards can pop out
                    var trackWrap = document.createElement('div');
                    trackWrap.style.cssText = 'overflow:hidden;flex:1;';
                    trackWrap.appendChild(track);
                    // Right arrow
                    var rightArrow = document.createElement('button');
                    rightArrow.className = 'carrossel-arrow' + (maxScroll <= 0 ? ' disabled' : '');
                    rightArrow.innerHTML = '<i class="fas fa-chevron-right" style="font-size:9px"></i>';
                    rightArrow.addEventListener('click', function() {
                        if (scrollPos >= maxScroll) return;
                        scrollPos++;
                        this.classList.toggle('disabled', scrollPos >= maxScroll);
                        leftArrow.classList.toggle('disabled', scrollPos <= 0);
                        track.style.transform = 'translateX(-' + (scrollPos * (100 / cpr)) + '%)';
                    });
                    rowEl.appendChild(leftArrow);
                    rowEl.appendChild(trackWrap);
                    rowEl.appendChild(rightArrow);
                    container.appendChild(rowEl);
                });
            },

            _renderGridCategorias(items) {
                var container = document.getElementById('movies-container');
                if (!container) return;
                container.className = '';
                container.innerHTML = '';
                // Group items by genre
                var groups = {};
                items.forEach(function(m) {
                    var cat = m.genre || 'Sem Gênero';
                    if (!groups[cat]) groups[cat] = [];
                    groups[cat].push(m);
                });
                var catOrder = Object.keys(groups).sort();
                var cpr = document.body.style.getPropertyValue('--cards-per-row') || '5';
                catOrder.forEach(function(cat) {
                    var section = document.createElement('div');
                    section.className = 'grid-category-section';
                    var title = document.createElement('div');
                    title.className = 'grid-category-title';
                    title.style.background = 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(168,85,247,0.08))';
                    title.style.color = '#60A5FA';
                    title.innerHTML = '<i class="fas fa-tag" style="font-size:9px"></i> ' + cat + ' <span class="count">' + groups[cat].length + ' títulos</span>';
                    section.appendChild(title);
                    var grid = document.createElement('div');
                    grid.className = 'dynamic-grid';
                    grid.style.setProperty('--cards-per-row', cpr);
                    var frag = document.createDocumentFragment();
                    groups[cat].forEach(function(m) {
                        frag.appendChild(Render.createCard(m));
                    });
                    grid.appendChild(frag);
                    section.appendChild(grid);
                    container.appendChild(section);
                });
            },

            _renderMarquee(items) {
                var container = document.getElementById('movies-container');
                if (!container) return;
                container.className = '';
                container.innerHTML = '';
                if (!items.length) { container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-secondary);font-size:11px">Sem itens para exibir</div>'; return; }
                var rows = [[], []];
                items.forEach(function(m, i) {
                    rows[i % 2].push(m);
                });
                var speed = document.documentElement.style.getPropertyValue('--marquee-speed') || '30s';
                var self = this;
                rows.forEach(function(rowItems, rowIdx) {
                    var wrapper = document.createElement('div');
                    wrapper.className = 'marquee-container';
                    var row = document.createElement('div');
                    var dirClass = rowIdx % 2 === 0 ? 'marquee-row-left' : 'marquee-row-right';
                    row.className = 'marquee-row ' + dirClass;
                    row.style.animationDuration = speed;
                    // Duplicate items for seamless loop
                    var doubled = rowItems.concat(rowItems);
                    var frag = document.createDocumentFragment();
                    doubled.forEach(function(m) {
                        frag.appendChild(Render.createCard(m));
                    });
                    row.appendChild(frag);
                    wrapper.appendChild(row);
                    container.appendChild(wrapper);
                });
                this._applyMarqueeZoom();
            },

            _applyMarqueeZoom() {
                var map = { 1: 5, 2: 6, 3: 7, 4: 8 };
                var val = map[APP_STATE.zoom] || 5;
                var gapTotal = (val - 1) * 1.5;
                document.querySelectorAll('.marquee-row').forEach(function(row) {
                    var cont = row.closest('.marquee-container');
                    var avail = cont ? cont.clientWidth : 0;
                    if (avail > 0) {
                        var w = (avail - gapTotal * 16) / val;
                        row.style.setProperty('--marquee-card-width', Math.floor(w) + 'px');
                    }
                });
            },

            applyFilter(f) {
                if (f === 'todos') {
                    APP_STATE.activeFilter = 'all';
                    APP_STATE.sortBy = 'default';
                    APP_STATE.filterYear = '';
                } else if (f === 'recente') {
                    APP_STATE.sortBy = 'recent';
                } else if (f === 'antigos') {
                    APP_STATE.sortBy = 'old';
                } else if (f === 'az') {
                    APP_STATE.sortBy = 'az';
                } else if (f === 'favoritados') {
                    APP_STATE.activeFilter = APP_STATE.activeFilter === 'fav' ? 'all' : 'fav';
                    APP_STATE.sortBy = 'default';
                } else if (f === 'new' || f === 'watch' || f === 'fav') {
                    APP_STATE.activeFilter = APP_STATE.activeFilter === f ? 'all' : f;
                    APP_STATE.sortBy = 'default';
                } else {
                    APP_STATE.activeFilter = APP_STATE.activeFilter === f ? 'all' : f;
                    APP_STATE.sortBy = 'default';
                }
                Render.all();
                UI.updateFilterButtonState();
            },

            setYearFilter(year) {
                APP_STATE.filterYear = APP_STATE.filterYear === year ? '' : year;
                Render.all();
                UI.updateFilterButtonState();
            },

            setTheme(name) {
                document.body.classList.remove('theme-dark', 'theme-light', 'theme-amber', 'theme-midnight', 'light-mode');
                if (name !== 'dark') document.body.classList.add('theme-' + name);
                if (name === 'light') document.body.classList.add('light-mode');
                var icon = document.getElementById('theme-icon');
                var icons = { dark: 'fa-moon', light: 'fa-sun', amber: 'fa-fire', midnight: 'fa-star' };
                icon.className = 'fas ' + (icons[name] || 'fa-moon') + ' text-xs';
                Store.setItem('cinecatalog_theme', name);
                document.getElementById('theme-menu').classList.add('hidden');
                document.getElementById('btn-theme')?.classList.remove('active');
                document.querySelectorAll('#theme-menu .theme-option').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.theme === name);
                });
                var dashEl = document.getElementById('modal-dashboard');
                if (dashEl && dashEl.classList.contains('active')) UI.renderDashboard();
            },

            toggleThemeMenu() {
                var menu = document.getElementById('theme-menu');
                var btn = document.getElementById('btn-theme');
                var opening = menu.classList.contains('hidden');
                menu.classList.toggle('hidden');
                if (btn) btn.classList.toggle('active', opening);
                if (btn && btn.blur) btn.blur();
            },

            openContextMenu(e, id) {
                e.preventDefault();
                APP_STATE.selectedId = id;
                const menu = document.getElementById('context-menu');
                menu.classList.remove('fade-out');
                menu.style.display = 'block';
                // Force reflow then add show
                void menu.offsetWidth;
                menu.classList.add('show');
                menu.style.left = `${e.pageX}px`;
                menu.style.top = `${e.pageY}px`;
                // Update reminder button label
                const movie = APP_STATE.movies.find(m => m.id === id);
                if (movie) {
                    // Hide reminder for estreias
                    const estBtn = menu.querySelector('[onclick*="editReminderCtx"]');
                    if (estBtn) {
                        estBtn.style.display = (movie.type === 'estreias') ? 'none' : '';
                        var remLabel = document.getElementById('ctx-reminder-label');
                        if (remLabel) remLabel.innerText = (movie.reminder && movie.reminder.trim()) ? 'EDITAR LEMBRETE' : 'Criar Lembrete';
                    }
                }
            },

            closeCtxMenu(cb) {
                const menu = document.getElementById('context-menu');
                menu.classList.remove('show');
                menu.classList.add('fade-out');
                setTimeout(function() {
                    menu.style.display = 'none';
                    menu.classList.remove('fade-out');
                    if (cb) cb();
                }, 200);
            },

            playMedia(id) {
                const movie = APP_STATE.movies.find(m => m.id === id);
                if (!movie) return;
                var raw = movie.mediaFile || movie.trailUrl;
                if (!raw) return;
                var url = raw;
                // Try portable reference JSON {blob, name, path}
                if (raw.charAt(0) === '{' || raw.charAt(0) === '[') {
                    try {
                        var ref = JSON.parse(raw);
                        if (ref.blob) url = ref.blob;
                        else if (ref.path) url = ref.path;
                    } catch(e) {}
                }
                // Convert local Windows path to file:/// URL
                if (!url.match(/^(https?:|blob:|file:)/i)) {
                    url = 'file:///' + url.replace(/\\/g, '/');
                }
                var a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },

            viewMovieCtx() {
                var self = this;
                this.closeCtxMenu(function() {
                    const movie = APP_STATE.movies.find(m => m.id === APP_STATE.selectedId);
                    if (!movie) return;
                    _infoMovieList = APP_STATE.movies.filter(function(m) {
                        if (movie.type !== m.type) return false;
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
                    _infoMovieIndex = _infoMovieList.findIndex(function(m) { return m.id === APP_STATE.selectedId; });
                    if (_infoMovieIndex < 0) _infoMovieIndex = 0;
                    if (movie.type === 'series') {
                        Logic.showSeriesInfo();
                        UI.openModal('modal-series-info');
                    } else {
                        Logic.showMovieInfo();
                        UI.openModal('modal-movie-info');
                    }
                });
            },
            showMovieInfo: function() {
                if (!_infoMovieList.length) return;
                if (_infoMovieIndex < 0) _infoMovieIndex = 0;
                if (_infoMovieIndex >= _infoMovieList.length) _infoMovieIndex = _infoMovieList.length - 1;
                var m = _infoMovieList[_infoMovieIndex];
                APP_STATE.selectedId = m.id;

                var title = m.originalTitle || m.titlePt || '—';
                document.getElementById('mmi-title').textContent = title;
                document.getElementById('mmi-year').textContent = m.year || '—';
                document.getElementById('mmi-duration').textContent = m.duration || '—';
                document.getElementById('mmi-category').textContent = (m.genre || m.category || '—').toUpperCase();
                document.getElementById('mmi-synopsis').textContent = m.desc || 'Sem sinopse.';
                document.getElementById('mmi-director').textContent = m.director || 'Não informado.';
                document.getElementById('mmi-cast').textContent = m.cast || 'Não informado.';

                // Poster
                var posterImg = document.getElementById('mmi-poster');
                var posterFallback = document.getElementById('mmi-poster-fallback');
                if (m.image && m.image !== 'https://via.placeholder.com/300x450') {
                    posterImg.src = m.image;
                    posterImg.style.display = 'block';
                    posterFallback.style.display = 'none';
                } else {
                    posterImg.style.display = 'none';
                    posterFallback.style.display = 'flex';
                }

                // Status pills
                var statusContainer = document.getElementById('mmi-statuses');
                var st = m.statuses || {};
                var statusHtml = '';
                if (st.new) statusHtml += '<span class="mmi-status-pill new"><i class="fas fa-plus-circle" style="font-size:6px"></i> Novo</span>';
                if (st.watch) statusHtml += '<span class="mmi-status-pill watch"><i class="fas fa-eye" style="font-size:6px"></i> Assistir</span>';
                if (st.favorite) statusHtml += '<span class="mmi-status-pill fav"><i class="fas fa-heart" style="font-size:6px"></i> Favorito</span>';
                statusContainer.innerHTML = statusHtml;

                // Trailer link
                var trailerLink = document.getElementById('mmi-trailer-link');
                var trailerIcon = document.getElementById('mmi-trailer-icon');
                if (m.trailUrl && m.trailUrl.trim()) {
                    trailerLink.href = m.trailUrl;
                    trailerLink.classList.remove('disabled');
                    trailerIcon.style.color = '#EF4444';
                } else {
                    trailerLink.href = 'javascript:void(0)';
                    trailerLink.classList.add('disabled');
                    trailerIcon.style.color = '#4B5563';
                }

                // Play button
                var playBtn = document.getElementById('mmi-play-btn');
                var playUrl = m.mediaFile || m.trailUrl || '';
                if (playUrl) {
                    playBtn.dataset.mediaUrl = playUrl;
                    playBtn.classList.remove('disabled');
                } else {
                    playBtn.dataset.mediaUrl = '';
                    playBtn.classList.add('disabled');
                }

                // Counter
                document.getElementById('mmi-counter').textContent = (_infoMovieIndex + 1) + ' DE ' + _infoMovieList.length;
            },
            navigateMovieInfo: function(dir) {
                _infoMovieIndex += dir;
                if (_infoMovieIndex < 0) _infoMovieIndex = _infoMovieList.length - 1;
                if (_infoMovieIndex >= _infoMovieList.length) _infoMovieIndex = 0;
                Logic.showMovieInfo();
            },

            // --- Series Info Modal ---
            showSeriesInfo: function() {
                if (!_infoMovieList.length) return;
                if (_infoMovieIndex < 0) _infoMovieIndex = 0;
                if (_infoMovieIndex >= _infoMovieList.length) _infoMovieIndex = _infoMovieList.length - 1;
                var m = _infoMovieList[_infoMovieIndex];
                APP_STATE.selectedId = m.id;

                var title = m.originalTitle || m.titlePt || '—';
                document.getElementById('msi-title').textContent = title;
                document.getElementById('msi-year').textContent = m.year || '—';
                document.getElementById('msi-duration').textContent = m.duration || '—';
                document.getElementById('msi-category').textContent = (m.genre || m.category || '—').toUpperCase();
                document.getElementById('msi-synopsis').textContent = m.desc || 'Sem sinopse.';
                document.getElementById('msi-director').textContent = m.director || 'Não informado.';
                document.getElementById('msi-cast').textContent = m.cast || 'Não informado.';

                // Poster
                var posterImg = document.getElementById('msi-poster');
                var posterFallback = document.getElementById('msi-poster-fallback');
                if (m.image && m.image !== 'https://via.placeholder.com/300x450') {
                    posterImg.src = m.image;
                    posterImg.style.display = 'block';
                    posterFallback.style.display = 'none';
                } else {
                    posterImg.style.display = 'none';
                    posterFallback.style.display = 'flex';
                }

                // Status pills
                var statusContainer = document.getElementById('msi-statuses');
                var st = m.statuses || {};
                var statusHtml = '';
                if (st.new) statusHtml += '<span class="mmi-status-pill new"><i class="fas fa-plus-circle" style="font-size:6px"></i> Novo</span>';
                if (st.watch) statusHtml += '<span class="mmi-status-pill watch"><i class="fas fa-eye" style="font-size:6px"></i> Assistir</span>';
                if (st.favorite) statusHtml += '<span class="mmi-status-pill fav"><i class="fas fa-heart" style="font-size:6px"></i> Favorito</span>';
                statusContainer.innerHTML = statusHtml;

                // Trailer link
                var trailerLink = document.getElementById('msi-trailer-link');
                var trailerIcon = document.getElementById('msi-trailer-icon');
                var sTrailer = m.trailUrl || m.trailerUrl || '';
                if (sTrailer && sTrailer.trim()) {
                    trailerLink.href = sTrailer;
                    trailerLink.classList.remove('disabled');
                    trailerIcon.style.color = '#EF4444';
                } else {
                    trailerLink.href = 'javascript:void(0)';
                    trailerLink.classList.add('disabled');
                    trailerIcon.style.color = '#4B5563';
                }

                // Gestão de temporadas e episódios
                Logic.renderSeriesSeasons();

                // Counter
                document.getElementById('msi-counter').textContent = (_infoMovieIndex + 1) + ' DE ' + _infoMovieList.length;
            },
            _normalizeSeriesSeasons: function(m) {
                if (!m) return [];
                var out = [];
                if (m.dynamicEpisodesNew && m.dynamicEpisodesNew.length) {
                    var dynSeasons = m.dynamicSeasons || [];
                    var bySeason = {};
                    m.dynamicEpisodesNew.forEach(function(ep) {
                        var s = String(ep.season || 1);
                        if (!bySeason[s]) bySeason[s] = [];
                        bySeason[s].push(ep);
                    });
                    var seasonNums = Object.keys(bySeason).map(Number).sort(function(a,b){ return a-b; });
                    seasonNums.forEach(function(sn) {
                        var meta = null;
                        for (var i = 0; i < dynSeasons.length; i++) {
                            if (String(dynSeasons[i].seasonNumber) === String(sn)) { meta = dynSeasons[i]; break; }
                        }
                        var eps = bySeason[sn].slice().sort(function(a,b){ return (parseInt(a.epNumber)||0) - (parseInt(b.epNumber)||0); });
                        out.push({
                            number: sn,
                            title: (meta && meta.title) || '',
                            year: (meta && meta.year) || '',
                            cast: (meta && meta.cast) || '',
                            trailerUrl: (meta && meta.trailerUrl) || '',
                            episodes: eps.map(function(ep, i) {
                                return {
                                    number: ep.epNumber || (i + 1),
                                    title: ep.title || '',
                                    date: ep.date || '',
                                    year: ep.year || '',
                                    duration: ep.duration || '',
                                    guestCast: ep.guestCast || '',
                                    cast: ep.cast || '',
                                    mediaUrl: ep.mediaUrl || ep.link || '',
                                    trailerUrl: ep.trailerUrl || ''
                                };
                            })
                        });
                    });
                    return out;
                }
                if (m.seasons && m.seasons.length) {
                    m.seasons.forEach(function(season) {
                        var eps = (season.episodes || []).map(function(ep, i) {
                            return {
                                number: ep.number || (i + 1),
                                title: ep.title || '',
                                date: ep.date || '',
                                year: ep.year || '',
                                duration: ep.duration || '',
                                guestCast: ep.guestCast || '',
                                cast: ep.cast || '',
                                mediaUrl: ep.mediaFile || ep.mediaUrl || '',
                                trailerUrl: ep.trailerUrl || ''
                            };
                        });
                        out.push({
                            number: season.number || (out.length + 1),
                            title: season.title || '',
                            year: season.year || '',
                            cast: season.cast || '',
                            trailerUrl: season.trailerUrl || '',
                            episodes: eps
                        });
                    });
                    return out;
                }
                if (m.season || m.episodeNumber) {
                    out.push({
                        number: parseInt(m.season) || 1,
                        title: '',
                        year: '',
                        cast: '',
                        trailerUrl: '',
                        episodes: [{ number: parseInt(m.episodeNumber) || 1, title: '', date: '', duration: '', guestCast: '', mediaUrl: m.mediaFile || '', trailerUrl: '' }]
                    });
                }
                return out;
            },
            renderSeriesSeasons: function() {
                var m = _infoMovieList[_infoMovieIndex];
                var container = document.getElementById('msi-seasons');
                if (!container) return;
                if (!m) { container.innerHTML = ''; return; }
                var seasons = Logic._normalizeSeriesSeasons(m);
                if (!seasons.length) {
                    container.innerHTML = '<span style="font-size:9px;color:var(--text-secondary)">Nenhuma temporada cadastrada para esta série.</span>';
                    return;
                }
                var html = '';
                for (var i = seasons.length - 1; i >= 0; i--) {
                    var s = seasons[i];
                    var seasonMeta = [];
                    if (s.title) seasonMeta.push(s.title);
                    if (s.year) seasonMeta.push(s.year);
                    if (s.cast) seasonMeta.push(s.cast);
                    html += '<div class="msi-season-card">' +
                        '<div class="msi-season-head msi-season-toggle" data-onclick="Logic.toggleSeriesSeason(this)" title="Clique para expandir/recolher as temporadas">' +
                        '<i class="fas fa-chevron-right msi-season-chevron"></i>' +
                        '<span class="msi-season-badge">' + s.number + '</span>' +
                        '<div style="flex:1;min-width:0">' +
                        '<div class="msi-season-title">Temporada ' + s.number + (s.episodes.length ? ' — ' + s.episodes.length + ' episódio(s)' : '') + '</div>' +
                        (seasonMeta.length ? '<div class="msi-season-meta">' + seasonMeta.join(' • ') + '</div>' : '') +
                        '</div>' +
                        '</div>';
                    html += '<div class="msi-season-body" style="display:none">';
                    if (s.episodes.length) {
                        for (var j = 0; j < s.episodes.length; j++) {
                            var ep = s.episodes[j];
                            var epUrl = ep.mediaUrl && ep.mediaUrl.trim();
                            var epMeta = [];
                            if (ep.year || ep.date) epMeta.push(ep.year || ep.date);
                            if (ep.duration) epMeta.push(ep.duration);
                            if (ep.cast || ep.guestCast) epMeta.push('C. ' + (ep.cast || ep.guestCast));
                            html += '<div class="msi-ep-row">' +
                                '<div class="msi-ep-info">' +
                                '<div class="msi-ep-title"><i class="fas fa-play-circle" style="font-size:8px;color:' + (epUrl ? '#34D399' : '#4B5563') + ';margin-right:0.25rem"></i>EP. ' + ep.number + (ep.title ? ' — ' + ep.title : '') + '</div>' +
                                (epMeta.length ? '<div class="msi-ep-meta">' + epMeta.join(' • ') + '</div>' : '') +
                                '</div>' +
                                '<button type="button" class="msi-play-btn green' + (epUrl ? '' : ' disabled') + '" data-onclick="Logic.playInfoEpisode(' + s.number + ',' + j + ')" title="Executar episódio no player configurado"><i class="fas fa-play" style="font-size:7px"></i> Executar Episódio</button>' +
                                '</div>';
                        }
                    } else {
                        html += '<div class="msi-ep-meta" style="margin-top:0.3rem">Nenhum episódio nesta temporada.</div>';
                    }
                    html += '</div>';
                    html += '</div>';
                }
                container.innerHTML = html;
            },
            toggleSeriesSeason: function(headEl) {
                var card = headEl.closest('.msi-season-card');
                if (!card) return;
                var body = card.querySelector('.msi-season-body');
                if (!body) return;
                var isOpen = body.style.display !== 'none';
                body.style.display = isOpen ? 'none' : 'block';
                headEl.classList.toggle('msi-season-open', !isOpen);
            },
            _collapseAllInfoSeasons: function() {
                document.querySelectorAll('#msi-seasons .msi-season-body').forEach(function(b) { b.style.display = 'none'; });
                document.querySelectorAll('#msi-seasons .msi-season-head.msi-season-toggle').forEach(function(h) { h.classList.remove('msi-season-open'); });
            },
            playInfoMedia: function(type) {
                var m = _infoMovieList[_infoMovieIndex];
                if (!m) return;
                var raw = m.mediaFile || m.trailUrl || '';
                if (!raw) {
                    Logic.showModalStatus('Este item não possui mídia para executar.', 'orange');
                    return;
                }
                var url = raw;
                if (raw.charAt(0) === '{' || raw.charAt(0) === '[') {
                    try {
                        var ref = JSON.parse(raw);
                        if (ref.blob) url = ref.blob;
                        else if (ref.path) url = ref.path;
                    } catch(e) {}
                }
                Logic.openMediaWithPlayer(url, type);
            },
            playInfoSeason: function(seasonNum) {
                var m = _infoMovieList[_infoMovieIndex];
                if (!m) return;
                var seasons = Logic._normalizeSeriesSeasons(m);
                var season = null;
                for (var i = 0; i < seasons.length; i++) {
                    if (String(seasons[i].number) === String(seasonNum)) { season = seasons[i]; break; }
                }
                if (!season || !season.trailerUrl) {
                    Logic.showModalStatus('Temporada ' + seasonNum + ' sem trailer configurado.', 'orange');
                    return;
                }
                Logic.openMediaWithPlayer(season.trailerUrl, 'series');
            },
            playInfoEpisode: function(seasonNum, epIndex) {
                var m = _infoMovieList[_infoMovieIndex];
                if (!m) return;
                var seasons = Logic._normalizeSeriesSeasons(m);
                var season = null;
                for (var i = 0; i < seasons.length; i++) {
                    if (String(seasons[i].number) === String(seasonNum)) { season = seasons[i]; break; }
                }
                var ep = season && season.episodes[epIndex];
                var url = ep ? (ep.mediaUrl || '') : '';
                if (!url) {
                    Logic.showModalStatus('Este episódio não possui link/vídeo configurado.', 'orange');
                    return;
                }
                Logic.openMediaWithPlayer(url, 'series');
            },
            navigateSeriesInfo: function(dir) {
                _infoMovieIndex += dir;
                if (_infoMovieIndex < 0) _infoMovieIndex = _infoMovieList.length - 1;
                if (_infoMovieIndex >= _infoMovieList.length) _infoMovieIndex = 0;
                Logic.showSeriesInfo();
            },
            editFromInfo: function(type) {
                UI.closeModal('modal-movie-info');
                UI.closeModal('modal-series-info');
                _reopenInfoAfterSave = true;
                Logic.editMovieCtx();
            },
            cloneData: function() {
                _editingId = null;
                _reopenInfoAfterSave = false;
                document.getElementById('modal-title').innerHTML = 'CLONAR <span style="-webkit-text-fill-color:#3B82F6">DADOS</span>';
                var btn = document.getElementById('btn-save-v2');
                if (btn) btn.innerHTML = '<i class="fas fa-check mr-2"></i> CLONAR';
                var cloneBtn = document.getElementById('btn-clone-data');
                if (cloneBtn) cloneBtn.style.display = 'none';
                Logic.showStatus('Modo clonagem — altere os campos e clique em CLONAR');
            },

            toggleCardFav(id, el) {
                const movie = APP_STATE.movies.find(m => m.id === id);
                if (!movie) return;
                if (!movie.statuses) movie.statuses = {};
                var isFav = !(movie.statuses.favorite || false);
                movie.statuses.favorite = isFav;
                Storage.save();
                var card = el ? el.closest('.movie-card') : null;
                if (card) {
                    if (isFav) {
                        card.classList.add('border-red-500/50');
                        card.classList.add('shadow-[0_0_15px_rgba(239,68,68,0.2)]');
                    } else {
                        card.classList.remove('border-red-500/50');
                        card.classList.remove('shadow-[0_0_15px_rgba(239,68,68,0.2)]');
                    }
                    var heart = card.querySelector('.card-heart');
                    if (heart) {
                        heart.classList.toggle('active', isFav);
                        heart.title = isFav ? 'Desfavoritar' : 'Favoritar';
                        var ic = heart.querySelector('i');
                        if (ic) ic.className = (isFav ? 'fas' : 'fa-regular') + ' fa-heart';
                    }
                    var badgesRow = card.querySelector('.card-badges');
                    if (badgesRow) {
                        var favBadge = badgesRow.querySelector('.card-badge-fav');
                        if (isFav && !favBadge) {
                            var span = document.createElement('span');
                            span.className = 'card-badge-fav px-2 py-0.5 rounded-full uppercase';
                            span.style.background = 'var(--card-status-fav-bg,#DC2626)';
                            span.style.color = 'var(--card-status-text-color,#FFF)';
                            span.style.fontSize = 'var(--card-status-size,11px)';
                            span.style.fontWeight = '400';
                            span.textContent = 'Fav';
                            badgesRow.appendChild(span);
                        } else if (!isFav && favBadge) {
                            favBadge.remove();
                        }
                    }
                }
                UI.updateCounters();
                Logic.updateReminderBadge();
                var af = APP_STATE.activeFilter;
                if (af === 'fav' || af === 'favoritados') Render.all();
                Logic.showStatus(isFav ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
            },

            editReminderCtx() {
                var self = this;
                this.closeCtxMenu(function() {
                    const movie = APP_STATE.movies.find(m => m.id === APP_STATE.selectedId);
                    if (!movie) return;
                    document.getElementById('reminder-text').value = movie.reminder || '';
                    document.getElementById('reminder-popup').style.display = 'flex';
                    var titlePrefix = movie.reminder ? 'EDITAR' : 'CRIAR';
                    var movieName = movie.titlePt || movie.originalTitle || 'FILME';
                    document.getElementById('reminder-popup-title').innerHTML = titlePrefix + ' LEMBRETE DE <span style="-webkit-text-fill-color:#FBBF24;font-weight:400">' + movieName + '</span>';
                    document.getElementById('reminder-delete-btn').style.display = movie.reminder ? '' : 'none';
                    var info = document.getElementById('reminder-created-info');
                    if (movie.reminderCreatedAt) {
                        var d = new Date(movie.reminderCreatedAt);
                        var pad = function(n) { return n < 10 ? '0' + n : n; };
                        info.innerText = 'Criado em ' + pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
                        info.style.display = 'block';
                    } else {
                        info.style.display = 'none';
                    }
                    // Auto-focus textarea (cursor blinks at the end)
                    setTimeout(function() {
                        var ta = document.getElementById('reminder-text');
                        if (ta) {
                            ta.focus();
                            try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch(e) {}
                        }
                    }, 250);
                });
            },

            editReminderById(id) {
                UI.closeReminderPanel();
                APP_STATE.selectedId = id;
                const movie = APP_STATE.movies.find(m => m.id === id);
                if (!movie) return;
                document.getElementById('reminder-text').value = movie.reminder || '';
                document.getElementById('reminder-popup').style.display = 'flex';
                var movieName = movie.titlePt || movie.originalTitle || 'FILME';
                document.getElementById('reminder-popup-title').innerHTML = 'EDITAR LEMBRETE DE <span style="-webkit-text-fill-color:#FBBF24;font-weight:400">' + movieName + '</span>';
                document.getElementById('reminder-delete-btn').style.display = movie.reminder ? '' : 'none';
                var info = document.getElementById('reminder-created-info');
                if (movie.reminderCreatedAt) {
                    var d = new Date(movie.reminderCreatedAt);
                    var pad = function(n) { return n < 10 ? '0' + n : n; };
                    info.innerText = 'Criado em ' + pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
                    info.style.display = 'block';
                } else {
                    info.style.display = 'none';
                }
                // Auto-focus textarea (cursor blinks at the end)
                setTimeout(function() {
                    var ta = document.getElementById('reminder-text');
                    if (ta) {
                        ta.focus();
                        try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch(e) {}
                    }
                }, 250);
            },

            saveReminder() {
                const movie = APP_STATE.movies.find(m => m.id === APP_STATE.selectedId);
                if (!movie) return;
                var text = document.getElementById('reminder-text').value.trim();
                if (!text) { Logic.showStatus('Escreva algo para o lembrete'); return; }
                movie.reminder = text;
                if (!movie.reminderCreatedAt) movie.reminderCreatedAt = Date.now();
                Storage.save();
                Render.all();
                Logic.updateReminderBadge();
                document.getElementById('reminder-popup').style.display = 'none';
                if (Logic._reminderListRefresh) {
                    Logic.renderReminderList();
                    Logic._reminderListRefresh = false;
                }
                Logic.showStatus('EDITAR LEMBRETE');
            },

            deleteReminder() {
                const movie = APP_STATE.movies.find(m => m.id === APP_STATE.selectedId);
                if (!movie) return;
                movie.reminder = '';
                movie.reminderCreatedAt = '';
                document.getElementById('reminder-text').value = '';
                Storage.save();
                Render.all();
                Logic.updateReminderBadge();
                document.getElementById('reminder-popup').style.display = 'none';
                Logic.showStatus('Lembrete removido!');
            },

             removeReminderNotif(id) {
                const movie = APP_STATE.movies.find(m => m.id === id);
                if (!movie) return;
                var title = movie.titlePt || movie.originalTitle || 'filme';
                if (!confirm('Remover lembrete de "' + title + '"?')) return;
                movie.reminder = '';
                movie.reminderCreatedAt = '';
                Storage.save();
                Render.all();
                Logic.updateReminderBadge();
                Logic.renderReminderList();
                Logic.showStatus('Lembrete removido!');
            },

            removeEstreiaNotif(id) {
                if (!confirm('Remover esta estreia do catálogo?')) return;
                APP_STATE.movies = APP_STATE.movies.filter(function(m) { return m.id !== id; });
                Storage.save();
                Render.all();
                Logic.checkEstreiaNotifications();
                Logic.showStatus('Estreia removida!');
            },

            // Listagem completa: todas as estreias (com ou sem data) ordenadas por data (item e)
            _buildAllEstreiaNotifications() {
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                var list = [];
                var rp = function(n) { return n < 10 ? '0' + n : n; };
                APP_STATE.movies.forEach(function(m) {
                    if (m.type !== 'estreias') return;
                    var title = m.titlePt || m.originalTitle || 'Sem título';
                    var rawDate = m.date || '';
                    var parts = rawDate.indexOf('/') >= 0 ? rawDate.split('/') : rawDate.split('-');
                    if (parts.length !== 3) {
                        list.push({ title: title, msg: 'DATA NÃO DEFINIDA', type: 'nodate', id: m.id, sort: 9e15 });
                        return;
                    }
                    var estreiaDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    estreiaDate.setHours(0, 0, 0, 0);
                    var diff = Math.round((estreiaDate - today) / (1000 * 60 * 60 * 24));
                    var dateStr = rp(estreiaDate.getDate()) + '/' + rp(estreiaDate.getMonth() + 1) + '/' + estreiaDate.getFullYear();
                    var nType, nMsg;
                    if (diff === 0) { nType = 'today'; nMsg = 'ESTREIA HOJE!'; }
                    else if (diff > 0) { nType = 'soon'; nMsg = 'Faltam ' + diff + ' dia' + (diff > 1 ? 's' : ''); }
                    else { nType = 'passed'; nMsg = 'ESTREIA PASSOU'; }
                    list.push({ title: title, msg: nMsg, type: nType, id: m.id, date: dateStr, sort: estreiaDate.getTime() });
                });
                list.sort(function(a, b) { return a.sort - b.sort; });
                return list;
            },

            updateReminderBadge() {
                var badge = document.getElementById('reminder-badge');
                if (!badge) return;
                var count = 0;
                APP_STATE.movies.forEach(function(m) {
                    if (m.reminder && m.reminder.trim()) count++;
                });
                if (count > 0) { badge.innerText = count; badge.style.display = 'flex'; }
                else { badge.style.display = 'none'; }
            },

            renderReminderList() {
                var container = document.getElementById('reminder-list');
                var titleEl = document.getElementById('reminder-panel-title');
                if (!container) return;
                if (titleEl) titleEl.innerHTML = '<i class="fas fa-sticky-note mr-2 text-2xl"></i>LEMBRETES';
                var allItems = APP_STATE.movies.filter(function(m) { return m.reminder && m.reminder.trim() && (m.type === 'filmes' || m.type === 'series'); });
                var count = allItems.length;
                var html = '';
                if (count > 3) { container.style.maxHeight = '480px'; container.style.overflowY = 'auto'; container.style.scrollBehavior = 'smooth'; }
                else { container.style.maxHeight = ''; container.style.overflowY = ''; }
                html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">' +
                    '<span style="font-size:10px;font-weight:700;text-transform:uppercase;color:#F59E0B">' + count + ' lembrete' + (count !== 1 ? 's' : '') + '</span>' +
                    '</div>';
                if (count === 0) {
                    container.innerHTML = html + '<div style="text-align:center;padding:2rem 1rem"><div style="width:64px;height:64px;border-radius:1.5rem;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem"><i class="fas fa-sticky-note" style="font-size:28px;color:#F59E0B;opacity:0.5"></i></div><div style="font-size:0.85rem;font-weight:800;color:#F59E0B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem">0 Lembretes</div><div style="font-size:0.65rem;color:var(--text-secondary);font-weight:500">Clique direito num card para criar o primeiro lembrete</div></div>';
                    return;
                }
                allItems.forEach(function(m, idx) {
                    var num = idx + 1;
                    var rd = m.reminderCreatedAt ? new Date(m.reminderCreatedAt) : null;
                    var rp = function(n) { return n < 10 ? '0' + n : n; };
                    var dateStr = rd ? rp(rd.getDate()) + '/' + rp(rd.getMonth()+1) + '/' + rd.getFullYear() + ' ' + rp(rd.getHours()) + ':' + rp(rd.getMinutes()) : '';
                    var title = m.titlePt || m.originalTitle || 'Sem título';
                    var typeIcon = m.type === 'series' ? 'fa-layer-group' : 'fa-film';
                    var typeColor = m.type === 'series' ? '#A78BFA' : '#60A5FA';
                    html += '<div style="padding:1rem;border-radius:1rem;border:1px solid var(--border-color);margin-bottom:0.75rem">' +
                        '<div style="display:flex;align-items:flex-start;gap:0.75rem">' +
                        '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:28px">' +
                        '<span style="font-size:13px;font-weight:900;color:#F59E0B">' + num + '</span>' +
                        '<i class="fas ' + typeIcon + '" style="color:' + typeColor + ';font-size:14px"></i>' +
                        '</div>' +
                        '<div style="flex:1;min-width:0">' +
                        '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:2px">' +
                        '<span style="font-size:11px;font-weight:700;text-transform:uppercase;color:' + typeColor + '">' + (m.type === 'series' ? 'SÉRIE' : 'FILME') + '</span>' +
                        '<span style="font-size:13px;font-weight:800;text-transform:uppercase;color:#F59E0B">' + title + '</span>' +
                        '</div>' +
                        '<div style="font-size:0.7rem;color:rgba(255,255,255,0.5);margin-bottom:2px">' + (m.genre || '') + '</div>' +
                        (dateStr ? '<div style="font-size:0.7rem;color:rgba(255,255,255,0.5);margin-bottom:4px">' + dateStr + '</div>' : '') +
                        '<div style="font-size:15px;color:var(--text-color);font-weight:500;word-break:break-word;margin-bottom:6px">' + m.reminder + '</div>' +
                        '<div style="display:flex;gap:4px">' +
                        '<button data-onclick="Logic.editReminderById(\'' + m.id + '\');Logic._reminderListRefresh=true" class="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded" style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3)"><i class="fas fa-edit mr-1"></i>Editar</button>' +
                        '<button data-onclick="Logic.removeReminderNotif(\'' + m.id + '\')" class="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3)"><i class="fas fa-trash mr-1"></i>Remover</button>' +
                        '</div>' +
                        '</div>' +
                        '</div></div>';
                });
                container.innerHTML = html;
            },

            showStatus(msg, duration) {
                const el = document.getElementById('user-action-status');
                el.innerText = `● ${msg}`;
                el.style.opacity = '1';
                var cfg = window._appConfig;
                var isCadastroMsg = (msg.indexOf('sucesso') >= 0 || msg.indexOf('cadastro') >= 0 || msg.indexOf('atualizado') >= 0);
                var dur = duration || 6000;
                if (isCadastroMsg && cfg && cfg.cadastroNotifyActive !== false) {
                    dur = cfg.cadastroNotifyDuration || 6000;
                }
                setTimeout(() => el.style.opacity = '0', dur);
            },

            openMediaWithPlayer(url, mediaType) {
                if (!url || !url.trim()) return;
                if (url.charAt(0) === '{' || url.charAt(0) === '[') {
                    try {
                        var ref = JSON.parse(url);
                        if (ref.blob) url = ref.blob;
                        else if (ref.path) url = ref.path;
                    } catch(e) {}
                }
                var cfg = window._appConfig;
                var player = cfg.videoPlayer || 'system';
                var isTrailer = (url.indexOf('youtube.com') >= 0 || url.indexOf('youtu.be') >= 0 || url.indexOf('trailer') >= 0);
                if (isTrailer) {
                    var w = window.open(url, '_blank');
                    if (w) {
                        try {
                            if (w.document && w.document.documentElement) {
                                w.document.documentElement.requestFullscreen().catch(function() {});
                            }
                        } catch(e) {}
                    }
                    return;
                }
                if (player === 'system') {
                    var openUrl = url;
                    if (!openUrl.match(/^(https?:|blob:|file:)/i)) {
                        openUrl = 'file:///' + openUrl.replace(/\\/g, '/');
                    }
                    var sw = screen.availWidth, sh = screen.availHeight;
                    var w = window.open(openUrl, '_blank', 'width=' + sw + ',height=' + sh + ',top=0,left=0');
                    if (!w) w = window.open(openUrl, '_blank');
                    if (w) {
                        try {
                            if (w.document && w.document.documentElement) {
                                w.document.documentElement.requestFullscreen().catch(function() {});
                            }
                        } catch(e) {}
                    }
                    return;
                }
                var playerPath = '';
                if (player === 'wmp') {
                    playerPath = 'wmplayer.exe';
                } else if (player === 'custom') {
                    playerPath = cfg.customPlayerPath || '';
                } else if (window._detectedPlayers && window._detectedPlayers[player]) {
                    playerPath = window._detectedPlayers[player];
                }
                if (playerPath) {
                    var isLocal = /^[A-Za-z]:[\\\/]/.test(url) || url.startsWith('\\\\');
                    if (isLocal) {
                        try {
                            if (typeof require !== 'undefined') {
                                var cp = require('child_process');
                                var args = player === 'wmp' ? ['"'+url+'"'] : ['"'+url+'"'];
                                cp.exec('"' + playerPath + '" ' + args.join(' '), function() {});
                                return;
                            }
                        } catch(e) {}
                        try {
                            var link = document.createElement('a');
                            link.href = 'file:///' + url.replace(/\\/g, '/');
                            link.target = '_blank';
                            link.click();
                            return;
                        } catch(e) {}
                    }
                    window.open(url, '_blank');
                } else {
                    window.open(url, '_blank');
                }
            },

            renderInfoFeatures() {
                var grid = document.getElementById('info-features-grid');
                if (!grid) return;
                if (grid.dataset.rendered) return;
                grid.dataset.rendered = '1';
                var features = [
                    {icon:'fa-film',label:'Cadastro Filmes',desc:'Registre filmes com título original, português, ano, duração, diretor, elenco, sinopse, gênero, póster, trailer, media e muito mais.'},
                    {icon:'fa-tv',label:'Cadastro Séries',desc:'Cadastre séries com temporadas, episódios, numeração e dados completos de produção.'},
                    {icon:'fa-star',label:'Cadastro Estreias',desc:'Registre estreias de filmes e séries com data, estúdio, idioma e informações de lançamento. Adição com "+", remoção individual com "-" em cada linha e Lixeira para remover todas, com contador em tempo real.'},
                    {icon:'fa-search',label:'Pesquisa Avançada',desc:'Busque por título, diretor, elenco, gênero e sinopse. Suporta busca booleana usando o operador + entre termos.'},
                    {icon:'fa-history',label:'Histórico Pesquisas',desc:'As últimas 5 pesquisas são salvas automaticamente para acesso rápido.'},
                    {icon:'fa-filter',label:'Filtros Inteligentes',desc:'Filtre por status (Novo, Assistir, Favorito), ano, gênero e ordenação A-Z.'},
                    {icon:'fa-heart',label:'Favoritos',desc:'Marque filmes como favoritos com um coração neon. Filtre e visualize apenas os favoritos.'},
                    {icon:'fa-eye',label:'Assistir Depois',desc:'Marque itens para assistir depois. Organize sua lista de pendências.'},
                    {icon:'fa-plus-circle',label:'Status Novo',desc:'Identifique conteúdos recém-adicionados com o selo "Novo" nos cards.'},
                    {icon:'fa-star-half-alt',label:'Avaliação Estrelas',desc:'Avalie filmes e séries com sistema de estrelas (0-5). Visualização nos cards.'},
                    {icon:'fa-bell',label:'Notificações',desc:'Receba notificações sobre estreias e lembretes programados.'},
                    {icon:'fa-sticky-note',label:'Lembretes',desc:'Crie lembretes personalizados para filmes. Painel dedicado com data e descrição.'},
                    {icon:'fa-edit',label:'Edição Rápida',desc:'Edite qualquer item diretamente pela visualização de info ou pelo menu de contexto.'},
                    {icon:'fa-copy',label:'Clonar Dados',desc:'Duplique registros existentes para criar novos rapidamente, alterando apenas os campos desejados.'},
                    {icon:'fa-trash',label:'Remover Itens',desc:'Remova filmes, séries ou estreias com confirmação. Menu de contexto rápido. Estreias: botão "-" por linha e Lixeira para remover todas de uma vez.'},
                    {icon:'fa-palette',label:'Temas Visuais',desc:'4 temas exclusivos: Dark, Light, Amber Noir e Midnight. Troca instantânea com um clique.'},
                    {icon:'fa-cog',label:'Configurações',desc:'Personalize logotipo, cores, ícones, caminhos de pasta e muito mais.'},
                    {icon:'fa-folder',label:'Gestão Pastas',desc:'Configure caminhos para cards, vídeos, backups e acervo. Selecione pastas visualmente.'},
                    {icon:'fa-save',label:'Auto Salvamento',desc:'Ative o auto salvamento com backup automático para pasta configurada.'},
                    {icon:'fa-chart-pie',label:'Dashboard',desc:'Painel estatístico com gráficos de tipo, status, género e avaliações dos seus títulos.'},
                    {icon:'fa-print',label:'Gerar Lista A4',desc:'Imprima ou exporte para PDF/JPG uma lista completa dos itens visualizados em formato A4 tabelado.'},
                    {icon:'fa-download',label:'Exportar Dados',desc:'Exporte todo o seu acervo em formato JSON para backup ou transferência.'},
                    {icon:'fa-upload',label:'Importar Dados',desc:'Importe acervo de arquivos JSON. Restaure backups facilmente.'},
                    {icon:'fa-moon',label:'Modo Noturno',desc:'Alternância de temas com menu flutuante. Escolha entre Dark, Light, Amber e Midnight.'},
                    {icon:'fa-info-circle',label:'Sobre o Sistema',desc:'CineCatalog Elo v32.2.0 — Edição Premium. Sistema completo de gestão de acervo cinematográfico.'},
                    {icon:'fa-th-large',label:'Modos de Exibição',desc:'Três modos de visualização: Carrossel com setas, Grelha por gêneros, e Cine Marquee com animação. Ajuste velocidade e efeito no menu.'},
                    {icon:'fa-arrows-alt-h',label:'Navegação Carrossel',desc:'Navegue horizontalmente por linha com setas laterais. Duas linhas visíveis com rolagem infinita até o fim dos cards.'},
                    {icon:'fa-tachometer-alt',label:'Desempenho Otimizado',desc:'Renderizaçao lazy com batches de 20 cards. Scroll infinito suave sem travar a interface.'},
                    {icon:'fa-clock',label:'Lembretes Persistentes',desc:'Crie lembretes para qualquer filme ou série. O painel de lembretes permanece acessível mesmo vazio, mostrando a contagem zero.'},
                    {icon:'fa-calendar-alt',label:'Calendário de Estreias',desc:'Visualize as estreias do seu acervo organizadas por data. Notificações automáticas quando a data de estreia se aproxima.'},
                    {icon:'fa-chart-bar',label:'Estatísticas em Tempo Real',desc:'Filtros dinâmicos no dashboard: visualize cadastros e ações por dia, período de dias, mês, período de meses, ano inteiro ou período de anos.'},
                    {icon:'fa-random',label:'Sugestão Inteligente',desc:'Sistema de sugestão aleatória que sempre encontra um título, mesmo sem filtros ativos. Prioriza títulos com status Novo, Assistir ou Favorito.'},
                    {icon:'fa-layer-group',label:'Agrupamento por Gênero',desc:'Modo Grelha organiza automaticamente o acervo por gênero, com contadores e separadores visuais entre seções.'},
                    {icon:'fa-expand-arrows-alt',label:'Zoom Responsivo',desc:'4 níveis de zoom (1X a 4X) que ajustam o número de colunas visíveis de 5 a 8 cards por linha, adaptando-se à resolução do monitor.'},
                    {icon:'fa-th',label:'Grelha com Categorias',desc:'Visualização em grelha agrupa os títulos por gênero, facilitando a navegação e descoberta por tipo de conteúdo.'},
                    {icon:'fa-music',label:'Trailer Integrado',desc:'Links de trailer integrados nos modais de informação. Abre em tela cheia no navegador com parâmetro fullscreen.'},
                    {icon:'fa-user-secret',label:'Perfil do Diretor',desc:'Informações detalhadas do diretor em cada item, permitindo identificar rapidamente o criador de cada obra.'},
                    {icon:'fa-globe',label:'Multi-país',desc:'Suporte a múltiplos países de origem em séries. Campo país no cadastro de séries com identificação visual.'},
                    {icon:'fa-clone',label:'Duplicar Itens',desc:'Clone qualquer registro existente para criar um novo rapidamente. Botão CLONAR aparece automaticamente após cada cadastro.'},
                    {icon:'fa-clipboard-list',label:'Histórico de Cadastro',desc:'Registo cronológico de todos os cadastros realizados. Visualize data, hora e tipo de cada operação de cadastro.'},
                    {icon:'fa-sliders-h',label:'Filtros Avançados',desc:'Sistema completo de filtros: por status, ano, gênero, ordenação alfabética e ordenação por data. Múltiplos critérios combináveis.'},
                    {icon:'fa-closed-captioning',label:'Legendas Customizáveis',desc:'Suporte a legendas em múltiplos formatos. Configure estilo, cor e tamanho das legendas nas configurações de mídia.'},
                    {icon:'fa-tv',label:'Modo Smart TV',desc:'Interface otimizada para Smart TV com navegação por DPAD (setas direcionais), contorno de foco amarelo e cards focáveis.'},
                    {icon:'fa-cloud-upload-alt',label:'Upload de Capas',desc:'Área de upload com drag-and-drop para capas. Aceita JPG, PNG e WebP com proporção 9:16 (720x1280px). Preview em tempo real.'},
                    {icon:'fa-hdd',label:'Backup Automático',desc:'Auto salvamento contínuo para IndexedDB (localForage) com exportação automática para ficheiro JSON na pasta configurada do acervo.'},
                    {icon:'fa-moon',label:'4 Temas Visuais',desc:'Dark, Light, Amber Noir e Midnight. Troca instantânea com persistência em IndexedDB. Cores adaptam-se automaticamente.'},
                    {icon:'fa-text-height',label:'Tipografia Responsiva',desc:'Sistema de tipografia fluida que escala proporcionalmente entre HD, FHD, 2K e 4K. Usa clamp() para transição suave.'},
                    {icon:'fa-window-maximize',label:'Modais Premium',desc:'Janelas de cadastro e informação com design premium: bordas arredondadas, sombras neon, animações de entrada e backdrop blur.'},
                    {icon:'fa-minus-circle',label:'Estreias: Remoção Individual',desc:'Cada linha de estreia possui seu próprio botão "-" para remover apenas aquela estreia da lista, com confirmação e atualização em tempo real.'},
                    {icon:'fa-text-height',label:'Fontes dos Cards',desc:'Status (Novo, Assistir, Fav), Gênero e Ano exibidos com fontes maiores e mais destacadas em cada card de filme e série, com tamanhos configuráveis.'},
                    {icon:'fa-bolt',label:'Neon no Hover',desc:'Ao passar o mouse sobre um card, apenas o brilho neon azul é exibido — sem zoom nem movimentação do card. Visual mais elegante e estável, preservando o efeito surreal do neon.'}
                ];
                var self = this;
                grid.innerHTML = features.map(function(f, idx) {
                    return '<div class="info-item" data-idx="' + idx + '" data-icon="' + f.icon + '" data-label="' + f.label.replace(/"/g,'&quot;') + '" data-desc="' + f.desc.replace(/"/g,'&quot;').replace(/'/g,"&#39;") + '">' +
                        '<i class="fas ' + f.icon + '"></i>' +
                        '<div class="info-label">' + f.label + '</div>' +
                        '</div>';
                }).join('');
                grid.querySelectorAll('.info-item').forEach(function(item) {
                    item.addEventListener('click', function() {
                        self._toggleInfoItem(this);
                    });
                });
                // Click on modal body to close description
                var modalBody = document.querySelector('#modal-info .overflow-y-auto');
                if (modalBody) {
                    modalBody.addEventListener('click', function(e) {
                        if (!e.target.closest('.info-item') && !e.target.closest('#info-desc-box')) {
                            self._closeInfoDesc();
                        }
                    });
                }
            },

            _toggleInfoItem(item) {
                var wasActive = item.classList.contains('active');
                // Remove active from all
                document.querySelectorAll('#info-features-grid .info-item.active').forEach(function(el) {
                    el.classList.remove('active');
                });
                if (!wasActive) {
                    // Micro-animation
                    item.classList.add('popping');
                    item.classList.add('active');
                    var self = this;
                    setTimeout(function() { item.classList.remove('popping'); }, 400);
                    // Show description in bottom box
                    var box = document.getElementById('info-desc-box');
                    var title = document.getElementById('info-desc-title');
                    var text = document.getElementById('info-desc-text');
                    var icon = box ? box.querySelector('.desc-icon') : null;
                    if (box && title && text) {
                        box.classList.remove('hidden-box');
                        title.textContent = item.dataset.label;
                        text.textContent = item.dataset.desc;
                        if (icon) {
                            icon.className = 'fas ' + item.dataset.icon + ' desc-icon';
                        }
                    }
                } else {
                    // Same icon clicked - close the box
                    this._closeInfoDesc();
                }
            },

            _closeInfoDesc() {
                var box = document.getElementById('info-desc-box');
                if (box) box.classList.add('hidden-box');
                document.querySelectorAll('#info-features-grid .info-item.active').forEach(function(el) {
                    el.classList.remove('active');
                });
            },

            showModalStatus(msg, type, duration) {
                var toast = document.getElementById('modal-toast');
                var txt = document.getElementById('modal-toast-text');
                if (!toast || !txt) { alert(msg); return; }
                txt.innerText = msg;
                toast.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[9px] font-black uppercase tracking-wider mb-4 animate-pulse';
                if (type === 'red') {
                    toast.classList.add('bg-red-600/90');
                } else if (type === 'orange') {
                    toast.classList.add('bg-orange-600/90');
                } else {
                    toast.classList.add('bg-emerald-600/90');
                }
                toast.classList.remove('hidden');
                setTimeout(function() {
                    toast.classList.add('hidden');
                }, duration || 5000);
            },

            exportData() {
                var data = {
                    movies: APP_STATE.movies,
                    categories: Logic.getCategories(),
                    config: {
                        theme: Store.getItem('cinecatalog_theme') || 'dark'
                    }
                };
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
                var dl = document.createElement('a');
                dl.setAttribute("href", dataStr);
                dl.setAttribute("download", "CineCatalog_Backup.json");
                dl.click();
            },

            importData(e) {
                var reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        var data = JSON.parse(event.target.result);
                        if (data.movies) {
                            APP_STATE.movies = data.movies;
                            Store.setItem('cinecatalog_v126', Storage.toJSON());
                            if (typeof StoreImages !== 'undefined') StoreImages.prune(APP_STATE.movies);
                            if (data.categories) {
                                Store.setItem('cinecatalog_categories', JSON.stringify(data.categories));
                            }
                            if (data.config && data.config.theme) {
                                Store.setItem('cinecatalog_theme', data.config.theme);
                                Logic.setTheme(data.config.theme);
                            }
                        } else {
                            APP_STATE.movies = data;
                            Store.setItem('cinecatalog_v126', Storage.toJSON());
                            if (typeof StoreImages !== 'undefined') StoreImages.prune(APP_STATE.movies);
                        }
                        Storage.save();
                        Render.all();
                        Logic.showStatus('Dados importados com sucesso!');
                    } catch(err) {
                        Logic.showStatus('Erro ao importar: formato inválido');
                    }
                };
                reader.readAsText(e.target.files[0]);
            },

            clearAllData() {
                if (confirm('Eliminar todos os dados permanentemente?')) {
                    APP_STATE.movies = [];
                    Store.removeItem('cinecatalog_v126');
                    if (typeof StoreImages !== 'undefined') StoreImages.clear();
                    Render.all();
                    UI.updateCounters();
                    Logic.showStatus('Todos os dados eliminados');
                }
            },

            // --- Category Management ---
            getCategories() {
                var cats = JSON.parse(Store.getItem('cinecatalog_categories'));
                if (!cats || !cats.length) {
                    cats = ['Ação', 'Comédia', 'Drama', 'Ficção Científica', 'Terror'];
                    this.saveCategories(cats);
                }
                return cats.sort();
            },
            saveCategories(cats) {
                Store.setItem('cinecatalog_categories', JSON.stringify(cats));
                this.renderCategorySelect();
                this.renderCategoryManager();
            },
            renderCategorySelect() {
                var cats = this.getCategories();
                var opts = '<option value="">Escolher Gênero</option>' +
                    cats.map(function(c) { return '<option value="'+c+'">'+c+'</option>'; }).join('');
                
                var selF = document.getElementById('f-category');
                if (selF) {
                    var curVal = selF.value;
                    selF.innerHTML = opts;
                    selF.value = curVal;
                }
                
                var selFs = document.getElementById('fs-category');
                if (selFs) {
                    var curValFs = selFs.value;
                    selFs.value = '';
                }
                var dList = document.getElementById('fs-category-list');
                if (dList) {
                    dList.innerHTML = cats.map(function(c) { return '<option value="'+c+'">'; }).join('');
                }
                if (selFs) selFs.value = curValFs;

            },
            _filterCategoryTooltip(val) {
                var tip = document.getElementById('fs-category-tooltip');
                var input = document.getElementById('fs-category');
                if (!tip || !input) return;
                val = (val || '').trim();
                var cats = this.getCategories();
                if (!val || !cats.length) {
                    tip.style.display = 'none';
                    return;
                }
                var v = val.toLowerCase();
                var matches = cats.filter(function(c) {
                    return c.toLowerCase().indexOf(v) === 0;
                }).slice(0, 6);
                if (!matches.length) {
                    tip.style.display = 'none';
                    return;
                }
                tip.innerHTML = matches.map(function(c) {
                    return '<div class="fs-cat-opt" data-cat="' + c.replace(/"/g, '&quot;') + '">' + c + '</div>';
                }).join('');
                tip.querySelectorAll('.fs-cat-opt').forEach(function(opt) {
                    opt.onclick = function() {
                        input.value = this.dataset.cat;
                        tip.style.display = 'none';
                        input.focus();
                    };
                });
                tip.style.display = 'block';
            },
            _hideCategoryTooltip(delayed) {
                var tip = document.getElementById('fs-category-tooltip');
                if (!tip) return;
                var hide = function() { tip.style.display = 'none'; };
                if (delayed) setTimeout(hide, 150);
                else hide();
            },
            _categoryTooltipKey(e) {
                var tip = document.getElementById('fs-category-tooltip');
                if (!tip || tip.style.display === 'none') return;
                if (e.key === 'Escape') {
                    this._hideCategoryTooltip(false);
                    return;
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    var opts = tip.querySelectorAll('.fs-cat-opt');
                    if (!opts.length) return;
                    var cur = -1;
                    for (var i = 0; i < opts.length; i++) {
                        if (opts[i].classList.contains('active')) { cur = i; break; }
                    }
                    if (e.key === 'ArrowDown') cur = (cur + 1) % opts.length;
                    else cur = (cur - 1 + opts.length) % opts.length;
                    opts.forEach(function(o) { o.classList.remove('active'); });
                    opts[cur].classList.add('active');
                    opts[cur].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    return;
                }
                if (e.key === 'Enter' || e.key === 'Tab') {
                    var act = tip.querySelector('.fs-cat-opt.active');
                    if (act) {
                        e.preventDefault();
                        document.getElementById('fs-category').value = act.dataset.cat;
                        this._hideCategoryTooltip(false);
                        document.getElementById('fs-category').focus();
                    }
                }
            },
            renderCategoryManager() {
                var list = document.getElementById('cat-manager-list');
                if (!list) return;
                var cats = this.getCategories();
                if (cats.length) {
                    list.innerHTML = cats.map(function(c) {
                        return '<div class="cat-item"><span>'+c+'</span><span class="cat-rm" data-cat="'+c+'"><i class="fas fa-times"></i></span></div>';
                    }).join('');
                    list.querySelectorAll('.cat-rm').forEach(function(btn) {
                        btn.onclick = function(e) {
                            var cat = this.dataset.cat;
                            if (confirm('Remover gênero "'+cat+'"?')) {
                                Logic.removeCategory(cat);
                            }
                        };
                    });
                } else {
                    list.innerHTML = '<div style="font-size:11px;color:var(--text-secondary);padding:0.5rem;text-align:center">Nenhum gênero</div>';
                }
            },
            toggleCatManager() {
                var overlay = document.getElementById('cat-manager-overlay');
                if (!overlay) return;
                overlay.classList.toggle('active');
                if (overlay.classList.contains('active')) {
                    this.renderCategoryManager();
                    document.getElementById('cat-input').value = '';
                    setTimeout(function() { document.getElementById('cat-input').focus(); }, 100);
                }
            },
            addCategory(name) {
                name = name.trim();
                if (!name) { this.showStatus('Digite um nome de gênero'); return; }
                var cats = this.getCategories();
                if (cats.indexOf(name) >= 0) { this.showStatus('Gênero já existe'); return; }
                cats.push(name);
                this.saveCategories(cats);
                document.getElementById('cat-input').value = '';
                this.showStatus('Gênero "'+name+'" adicionado');
            },
            removeCategory(name) {
                var cats = this.getCategories().filter(function(c) { return c !== name; });
                this.saveCategories(cats);
                this.showStatus('Gênero "'+name+'" removido');
            },

            // --- Status toggle ---
            toggleStatus(el) {
                var input = el.querySelector('input');
                if (!input) return;
                input.checked = !input.checked;
                var cls = 'active-' + el.dataset.status;
                el.classList.toggle(cls, input.checked);
            },

            // --- Image Compression ---
            compressImage(file, maxSize, callback) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var img = new Image();
                    img.onload = function() {
                        var canvas = document.createElement('canvas');
                        var w = img.width, h = img.height;
                        var quality = 0.92;
                        var iter = 0;
                        function tryCompress() {
                            canvas.width = w;
                            canvas.height = h;
                            var ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            canvas.toBlob(function(blob) {
                                if (blob && blob.size > maxSize && quality > 0.1 && iter < 20) {
                                    iter++;
                                    quality -= 0.05;
                                    tryCompress();
                                } else {
                                    callback(URL.createObjectURL(blob), blob);
                                }
                            }, 'image/jpeg', quality);
                        }
                        tryCompress();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            },

            // --- Poster Blob helpers ---
            // Aplica um arquivo de imagem ao campo de capa: comprime, guarda
            // o Blob em _posterBlobs[prefix] e mostra o preview. O Blob é
            // persistido no IndexedDB apenas no save (ou no preview em edição).
            applyPosterFile(file, prefix) {
                if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
                var self = this;
                this._posterBlobs = this._posterBlobs || {};
                this.compressImage(file, 300 * 1024, function(url, blob) {
                    if (blob) self._posterBlobs[prefix] = blob;
                    UI.setPosterPreview(url, prefix);
                });
            },

            // Resolve a capa na hora do save:
            //  - Blob pendente (capa escolhida agora) -> grava no IndexedDB e usa imageKey
            //  - URL externa no campo de URL -> usa image (formato legado)
            //  - Edição sem nova capa -> preserva o que já existia (imageKey ou image)
            resolvePosterOnSave(prefix, id, urlSrc) {
                var out = { imageKey: '', image: '' };
                var blob = (this._posterBlobs || {})[prefix] || null;
                if (blob) {
                    out.imageKey = 'img_' + id;
                    StoreImages.save(out.imageKey, blob);
                    out.image = StoreImages.urlFor(out.imageKey) || '';
                } else if (urlSrc && /^(https?:|file:)/i.test(urlSrc)) {
                    out.image = urlSrc;
                } else if (window._editingId) {
                    var cur = APP_STATE.movies.find(function(m) { return m.id === window._editingId; });
                    if (cur) { out.imageKey = cur.imageKey || ''; out.image = cur.image || ''; }
                }
                if (!out.imageKey && !out.image) out.image = 'https://via.placeholder.com/300x450';
                return out;
            },

            // --- Unified Notifications (estreias only) ---
            checkEstreiaNotifications(silent) {
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                var notifications = [];
                var popupCandidates = [];

                APP_STATE.movies.forEach(function(m) {
                    if (m.type !== 'estreias' || !m.date) return;
                    var parts = m.date.indexOf('/') >= 0 ? m.date.split('/') : m.date.split('-');
                    if (parts.length !== 3) return;
                    var estreiaDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    estreiaDate.setHours(0, 0, 0, 0);
                    var diff = Math.round((estreiaDate - today) / (1000 * 60 * 60 * 24));
                    var title = m.titlePt || m.originalTitle || 'Sem título';

                    // Badge: 5,3,1 day before, today, and passed
                    if (diff === 0) {
                        notifications.push({ title: title, msg: 'ESTREIA HOJE!', type: 'today', id: m.id, diff: 0 });
                    } else if (diff === 5 || diff === 3 || diff === 1) {
                        notifications.push({ title: title, msg: 'Faltam ' + diff + ' dia' + (diff > 1 ? 's' : ''), type: 'soon', id: m.id, diff: diff });
                    } else if (diff < 0) {
                        notifications.push({ title: title, msg: 'ESTREIA PASSOU!', type: 'passed', id: m.id, diff: diff });
                    }

                    // Popup candidates: 3,2,1,0 days before
                    if (diff >= 0 && diff <= 3) {
                        popupCandidates.push({ title: title, id: m.id, diff: diff });
                    }
                });

                // Auto-delete warning
                var expiredCount = 0;
                APP_STATE.movies.forEach(function(m) {
                    if (m.type !== 'estreias' || !m.date) return;
                    var parts = m.date.indexOf('/') >= 0 ? m.date.split('/') : m.date.split('-');
                    if (parts.length !== 3) return;
                    var ed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    ed.setHours(0, 0, 0, 0);
                    if (ed < today) expiredCount++;
                });
                if (expiredCount > 0) {
                    notifications.push({ title: 'Auto-Exclusão', msg: expiredCount + ' estreia(s) vencida(s) serão removidas automaticamente', type: 'auto', id: '' });
                }

                this._lastNotifications = notifications;

                // Update badge count
                var badge = document.getElementById('notification-badge');
                if (badge) {
                    if (notifications.length > 0) { badge.innerText = notifications.length; badge.style.display = 'flex'; }
                    else { badge.style.display = 'none'; }
                }

                // --- Popup logic: show only once per estreia event ---
                var hasNewPopup = false;
                popupCandidates.forEach(function(pc) {
                    var popKey = 'est_popup_' + pc.id + '_' + pc.diff;
                    var shown = Store.getItem(popKey);
                    if (!shown) {
                        hasNewPopup = true;
                        Store.setItem(popKey, '1');
                    }
                });

                if (!silent && notifications.length > 0 && hasNewPopup && window._appConfig && window._appConfig.notificationsActive !== false) {
                    this.showEstreiaNotifications(notifications, null, null, false);
                }
            },

            showEstreiaNotifications(list, notifData, notifKey, skipCount) {
                var container = document.getElementById('notification-list');
                var countLabel = document.getElementById('notification-count-label');
                if (!container) return;
                if (countLabel) countLabel.textContent = list.length + ' notificaç' + (list.length === 1 ? 'ão' : 'ões');
                container.innerHTML = list.map(function(n) {
                    var icon, color, badgeIcon, badgeColor;
                    if (n.type === 'today') { icon = 'fa-calendar-check'; color = '#22C55E'; badgeIcon = 'fa-star'; badgeColor = '#22C55E'; }
                    else if (n.type === 'soon') { icon = 'fa-clock'; color = '#F97316'; badgeIcon = 'fa-hourglass-half'; badgeColor = '#F97316'; }
                    else if (n.type === 'auto') { icon = 'fa-trash'; color = '#8B5CF6'; badgeIcon = 'fa-robot'; badgeColor = '#8B5CF6'; }
                    else if (n.type === 'nodate') { icon = 'fa-calendar'; color = '#94A3B8'; badgeIcon = 'fa-calendar'; badgeColor = '#94A3B8'; }
                    else { icon = 'fa-calendar-times'; color = '#EF4444'; badgeIcon = 'fa-times-circle'; badgeColor = '#EF4444'; }
                    // Sem possibilidade de edição/remoção: listagem apenas informativa
                    var delBtn = '';
                    return '<div style="padding:1rem;border-radius:1.25rem;border:1px solid var(--border-color);margin-bottom:0.6rem;background:rgba(255,255,255,0.03);transition:all 0.2s" data-onmouseover="this.style.borderColor=\'' + color + '40\';this.style.background=\'rgba(255,255,255,0.06)\'" data-onmouseout="this.style.borderColor=\'\';this.style.background=\'\'">' +
                        '<div style="display:flex;align-items:center;gap:0.85rem">' +
                        '<div style="width:36px;height:36px;border-radius:10px;background:' + color + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
                        '<i class="fas ' + icon + '" style="color:' + color + ';font-size:16px"></i>' +
                        '</div>' +
                        '<div style="flex:1;min-width:0">' +
                        '<div style="font-size:0.8rem;font-weight:900;text-transform:uppercase;color:' + color + ';letter-spacing:0.03em">' + n.msg + '</div>' +
                        '<div style="font-size:0.95rem;color:var(--text-color);font-weight:700;margin-top:1px">' + n.title + '</div>' +
                        (n.date ? '<div style="font-size:0.7rem;color:var(--text-secondary);font-weight:600;margin-top:3px"><i class="fas fa-calendar-alt mr-1"></i>' + n.date + '</div>' : '') +
                        '</div>' + delBtn +
                        '</div></div>';
                }).join('');
                var overlay = document.getElementById('notification-overlay');
                if (overlay) overlay.classList.add('active');

                if (skipCount) return;

                // Auto-close after 6 seconds for non-first popups
                var todayStr = new Date().toISOString().slice(0,10);
                var key = notifKey || 'cinecatalog_notif_' + todayStr;
                var raw = Store.getItem(key);
                var nd = raw ? JSON.parse(raw) : { count: 0, closed: false, firstShown: true };
                nd.count = (nd.count || 0) + 1;
                nd.firstShown = nd.count === 1;
                nd.closed = false;
                Store.setItem(key, JSON.stringify(nd));

                if (nd.count > 1) {
                    var notifDuration = (window._appConfig && window._appConfig.notificationsDuration) || 5000;
                    setTimeout(function() {
                        var overlay2 = document.getElementById('notification-overlay');
                        if (overlay2 && overlay2.classList.contains('active')) {
                            UI.closeNotifications();
                        }
                    }, notifDuration);
                }
            },

            openDashboard() {
                var el = document.getElementById('modal-dashboard');
                var btn = document.getElementById('btn-dashboard');
                if (!el) return;
                if (el.classList.contains('active')) { el.classList.remove('active'); if (btn) btn.classList.remove('active'); return; }
                this._clearHeaderBtnActive();
                el.classList.add('active');
                if (btn) btn.classList.add('active');
                UI._dashTimeFilter = 'todos';
                UI._dashTimeFilterRange = null;
                UI._dashChartStyle = null;
                document.querySelectorAll('.dash-style-btn').forEach(function(b) { b.classList.remove('active'); b.style.background = 'transparent'; b.style.color = 'var(--text-secondary)'; });
                UI._populateDashTimeSelects();
                document.querySelectorAll('#tf-btns .tf-btn').forEach(function(b) { b.classList.remove('active'); });
                var allBtn = document.querySelector('#tf-btns .tf-btn[data-filter="todos"]');
                if (allBtn) allBtn.classList.add('active');
                document.querySelectorAll('.tf-range').forEach(function(el) { el.classList.remove('show'); });
                var allInput = document.getElementById('tf-input-todos');
                if (allInput) allInput.classList.add('show');
                UI.renderDashboard();
            }
        };

        function getVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }
        function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; }
        function setChecked(id, v) { var el = document.getElementById(id); if (el) el.checked = !!v; }

        function _isElectron() {
            try {
                return typeof window !== 'undefined' && typeof window.require === 'function' && window.process && window.process.versions && window.process.versions.electron;
            } catch(e) { return false; }
        }

