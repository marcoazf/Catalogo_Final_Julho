        const Render = {
            BATCH_SIZE: 20,
            _allFiltered: [],
            _renderedCount: 0,
            _scrollHandler: null,

            _container: null,
            _emptyState: null,

            all() {
                this._container = document.getElementById('movies-container');
                this._emptyState = document.getElementById('empty-state');
                const container = this._container;
                const emptyState = this._emptyState;

                // Reset search match flags
                APP_STATE.movies.forEach(function(m) { m._searchMatch = false; });

                var searchQueryRaw = APP_STATE.searchQuery || '';
                var q = searchQueryRaw.toLowerCase().trim();
                var isBoolean = q.indexOf('+') > -1;
                var boolTerms = isBoolean ? q.split('+').map(function(t) { return t.trim(); }).filter(function(t) { return t; }) : [];
                var filtered = APP_STATE.movies.filter(m => {
                    const matchType = APP_STATE.currentView === m.type;
                    let matchSearch = true;
                    if (q) {
                        if (q.length < 3 && q.length > 0) { matchSearch = false; }
                        else if (isBoolean && boolTerms.length) {
                            matchSearch = boolTerms.every(function(term) {
                                return ((m.titlePt || '').toLowerCase().includes(term) ||
                                    (m.originalTitle || '').toLowerCase().includes(term) ||
                                    (m.director || '').toLowerCase().includes(term) ||
                                    (m.cast || '').toLowerCase().includes(term) ||
                                    (m.genre || '').toLowerCase().includes(term) ||
                                    (m.desc || '').toLowerCase().includes(term));
                            });
                        } else {
                            matchSearch = ((m.titlePt || '').toLowerCase().includes(q) ||
                                (m.originalTitle || '').toLowerCase().includes(q) ||
                                (m.director || '').toLowerCase().includes(q) ||
                                (m.cast || '').toLowerCase().includes(q) ||
                                (m.genre || '').toLowerCase().includes(q) ||
                                (m.desc || '').toLowerCase().includes(q));
                        }
                    }
                    let matchFilter = true;
                    const s = m.statuses || {};
                    const af = APP_STATE.activeFilter;
                    const isEstreia = m.type === 'estreias';
                    if (!isEstreia) {
                        if (af === 'new') matchFilter = s.new === true;
                        else if (af === 'watch') matchFilter = s.watch === true;
                        else if (af === 'fav' || af === 'favoritados') matchFilter = s.favorite === true;
                    }
                    if (!isEstreia && af !== 'all' && af !== 'todos' && af !== 'new' && af !== 'watch' && af !== 'fav' && af !== 'favoritados') {
                        matchFilter = (m.genre || '').toLowerCase() === af.toLowerCase();
                    }
                    if (matchFilter && APP_STATE.filterYear) matchFilter = (m.year || '') === APP_STATE.filterYear;
                    if (matchSearch && q.length >= 3) {
                        m._searchMatch = true;
                    } else {
                        m._searchMatch = false;
                    }
                    return matchType && matchSearch && matchFilter;
                });

                if (APP_STATE.sortBy === 'recent') {
                    filtered.sort((a, b) => (b.year || '0').localeCompare(a.year || '0'));
                } else if (APP_STATE.sortBy === 'old') {
                    filtered.sort((a, b) => (a.year || '0').localeCompare(b.year || '0'));
                } else if (APP_STATE.sortBy === 'az') {
                    filtered.sort((a, b) => (a.titlePt || a.originalTitle || '').localeCompare(b.titlePt || b.originalTitle || ''));
                }

                container.innerHTML = '';
                if (this._scrollHandler) { window.removeEventListener('scroll', this._scrollHandler); this._scrollHandler = null; }

                if (filtered.length === 0) {
                    if (q && APP_STATE.movies.length > 0) {
                        emptyState.style.display = 'none';
                        container.innerHTML = '<div style="text-align:center;padding:4rem 2rem;color:var(--text-secondary)"><i class="fas fa-search text-3xl mb-4" style="opacity:0.3"></i><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem">Nenhum resultado para "<span style="color:var(--accent)">' + searchQueryRaw.replace(/</g,'&lt;') + '</span>"</div><div style="font-size:10px;opacity:0.6">Tente outro termo de busca</div></div>';
                    } else {
                        emptyState.style.display = 'flex';
                        emptyState.innerHTML = '';
                        if (APP_STATE.currentView === 'estreias') {
                            emptyState.innerHTML = '<div class="w-28 h-28 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-[2rem] flex items-center justify-center mb-6 border border-amber-500/30 shadow-2xl shadow-amber-500/10 mx-auto"><i class="fas fa-calendar-alt text-amber-400 text-4xl"></i></div><h2 class="text-4xl font-black italic uppercase tracking-tighter mb-2">NENHUMA ESTRÉIA</h2><div class="text-[10px] theme-text-sec uppercase tracking-[0.2em] space-y-1"><p>NÃO HÁ ESTRÉIAS PARA SEREM EXIBIDAS NESTE MOMENTO</p></div>';
                        } else if (APP_STATE.currentView === 'series') {
                            emptyState.innerHTML = '<div class="w-28 h-28 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-[2rem] flex items-center justify-center mb-6 border border-purple-500/30 shadow-2xl shadow-purple-500/10 mx-auto"><i class="fas fa-tv text-purple-400 text-4xl"></i></div><h2 class="text-4xl font-black italic uppercase tracking-tighter mb-2">ACERVO VAZIO</h2><div class="text-[10px] theme-text-sec uppercase tracking-[0.2em] space-y-1"><p>O SEU CINEMA PARTICULAR COMEÇA,</p><p>COM O PRIMEIRO CADASTRO</p></div>';
                        } else {
                            emptyState.innerHTML = '<div class="w-28 h-28 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[2rem] flex items-center justify-center mb-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mx-auto"><i class="fas fa-clapperboard text-blue-400 text-4xl"></i></div><h2 class="text-4xl font-black italic uppercase tracking-tighter mb-2">ACERVO VAZIO</h2><div class="text-[10px] theme-text-sec uppercase tracking-[0.2em] space-y-1"><p>O SEU CINEMA PARTICULAR COMEÇA,</p><p>COM O PRIMEIRO CADASTRO</p></div>';
                        }
                    }
                } else {
                    emptyState.style.display = 'none';
                    emptyState.innerHTML = '';
                }
                    if (APP_STATE.currentView === 'estreias') {
                        container.className = '';
                        this._renderEstreias(filtered);
                    } else if (APP_STATE.viewMode === 'carrossel') {
                        container.className = '';
                        Logic._renderCarrossel(filtered);
                    } else if (APP_STATE.viewMode === 'marquee') {
                        container.className = '';
                        Logic._renderMarquee(filtered);
                    } else if (APP_STATE.viewMode === 'grid') {
                        container.className = '';
                        Logic._renderGridCategorias(filtered);
                    } else {
                        container.className = 'dynamic-grid';
                        this._allFiltered = filtered;
                        this._renderedCount = 0;
                        this._loadMore();
                        if (filtered.length > this.BATCH_SIZE) {
                            var ticking = false;
                            this._scrollHandler = function() {
                                if (!ticking) {
                                    ticking = true;
                                    requestAnimationFrame(function() {
                                        var cont = Render._container;
                                        if (!cont || Render._renderedCount >= Render._allFiltered.length) {
                                            if (Render._scrollHandler) window.removeEventListener('scroll', Render._scrollHandler);
                                            ticking = false;
                                            return;
                                        }
                                        var rect = cont.getBoundingClientRect();
                                        if (rect.bottom < window.innerHeight + 600) {
                                            Render._loadMore();
                                        }
                                        ticking = false;
                                    });
                                }
                            };
                            window.addEventListener('scroll', this._scrollHandler);
                            this._scrollHandler();
                        }
                    }
                UI.updateFooterStats();
            },
            _loadMore() {
                var container = document.getElementById('movies-container');
                if (!container) return;
                var end = Math.min(this._renderedCount + this.BATCH_SIZE, this._allFiltered.length);
                var frag = document.createDocumentFragment();
                for (var i = this._renderedCount; i < end; i++) {
                    frag.appendChild(this.createCard(this._allFiltered[i]));
                }
                container.appendChild(frag);
                this._renderedCount = end;
                if (this._renderedCount >= this._allFiltered.length && this._scrollHandler) {
                    window.removeEventListener('scroll', this._scrollHandler);
                    this._scrollHandler = null;
                }
            },
            _renderEstreias: function(items) {
                var container = document.getElementById('movies-container');
                if (!container) return;
                // Sort: future dates (closest first) then past dates (most recent first)
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                var sorted = items.slice().sort(function(a, b) {
                    var da = a.date || '';
                    var db = b.date || '';
                    if (!da && !db) return 0;
                    if (!da) return 1;
                    if (!db) return -1;
                    var pa = da.split('/');
                    var pb = db.split('/');
                    if (pa.length !== 3 || pb.length !== 3) return da.localeCompare(db);
                    var na = parseInt(pa[2]) * 10000 + parseInt(pa[1]) * 100 + parseInt(pa[0]);
                    var nb = parseInt(pb[2]) * 10000 + parseInt(pb[1]) * 100 + parseInt(pb[0]);
                    // Check if dates are past
                    var aDate = new Date(parseInt(pa[2]), parseInt(pa[1]) - 1, parseInt(pa[0]));
                    var bDate = new Date(parseInt(pb[2]), parseInt(pb[1]) - 1, parseInt(pb[0]));
                    var aPast = aDate < today;
                    var bPast = bDate < today;
                    if (aPast !== bPast) return aPast ? 1 : -1; // future first, past last
                    return na - nb; // ascending within each group
                });
                var html = '<div class="estreias-menu-title"><i class="fas fa-calendar-alt mr-2" style="color:#F59E0B"></i>Estreias exibidas por ordem de prioridade de data</div>';
                for (var i = 0; i < sorted.length; i++) {
                    var m = sorted[i];
                    var num = (i + 1).toString().padStart(2, '0');
                    var dateStr = m.date || '';
                    if (m.date) {
                        var parts = m.date.split('/');
                        if (parts.length === 3) {
                            var months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
                            var day = parseInt(parts[0]);
                            var month = parseInt(parts[1]) - 1;
                            var year2 = parts[2];
                            if (month >= 0 && month <= 11) dateStr = day + ' ' + months[month] + ' ' + year2;
                        }
                    }
                    var title = m.titlePt || m.originalTitle || 'Sem título';
                    var et = m.estreiaType || 'filmes';
                    var typeClass = et === 'series' ? 'series' : 'filmes';
                    var typeLabel = et === 'series' ? 'SÉRIE' : 'FILME';
                    var hasTrailer = m.trailUrl && m.trailUrl.trim();
                    var safeId = m.id.replace(/"/g, '&quot;');
                    var expired = m.date ? UI._isDateExpired(m.date) : false;
                    html += '<div class="estreia-list-item' + (expired ? ' estreia-expired' : '') + (m._searchMatch ? ' search-match' : '') + '">' +
                        '<div class="estreia-list-header">' +
                        '<div class="estreia-number">' + num + '</div>' +
                        '<div class="estreia-date"><i class="fas fa-calendar-alt mr-1"></i>' + dateStr + '</div>' +
                        '<div class="estreia-title">' + title + '</div>' +
                        '<div class="estreia-type-badge ' + typeClass + '">' + typeLabel + '</div>' +
                        (hasTrailer ? '<a href="' + m.trailUrl.replace(/"/g,'&quot;') + '" target="_blank" rel="noopener noreferrer" class="estreia-play-link" title="Ver Trailer"><i class="fas fa-play"></i></a>' : '<div class="estreia-play-link" style="opacity:0.25;cursor:default;pointer-events:none"><i class="fas fa-play"></i></div>') +
                        '<button data-onclick="Logic.editEstreia(\'' + safeId + '\')" class="estreia-edit-link" title="Editar"><i class="fas fa-edit"></i></button>' +
                        '<button data-onclick="Logic.deleteEstreiaConfirm(\'' + safeId + '\')" class="estreia-delete-link" title="Remover"><i class="fas fa-trash"></i></button>' +
                        '</div>' +
                        '</div>';
                }
                if (!items.length) {
                    html = '';
                }
                container.innerHTML = html;
                UI._updateEstreiaAutoDeleteWarning();
            },

            createCard(data) {
                const div = document.createElement('div');
                const s = data.statuses || {};
                const isFav = s.favorite;
                var cn = 'movie-card';
                if (isFav) cn += ' border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
                if (data._searchMatch) cn += ' search-match';
                div.className = cn;
                const badges = [];
                if (s.new) badges.push('<span style="background:var(--card-status-new-bg,#2563EB);color:var(--card-status-text-color,#FFF);font-size:var(--card-status-size,11px);font-weight:400" class="px-2 py-0.5 rounded-full uppercase">Novo</span>');
                if (s.watch) badges.push('<span style="background:var(--card-status-watch-bg,#D97706);color:var(--card-status-text-color,#FFF);font-size:var(--card-status-size,11px);font-weight:400" class="px-2 py-0.5 rounded-full uppercase">Assistir</span>');
                if (isFav) badges.push('<span style="background:var(--card-status-fav-bg,#DC2626);color:var(--card-status-text-color,#FFF);font-size:var(--card-status-size,11px);font-weight:400" class="px-2 py-0.5 rounded-full uppercase">Fav</span>');
                const hasMedia = (data.mediaFile && data.mediaFile.trim()) || (data.trailUrl && data.trailUrl.trim());
                const hasReminder = data.reminder && data.reminder.trim();
                const starCount = Math.min(data.stars || 0, 5);
                var reminderTitle = '';
                if (hasReminder) {
                    var rt = data.reminder.replace(/"/g,'&quot;');
                    if (data.reminderCreatedAt) {
                        var rd = new Date(data.reminderCreatedAt);
                        var rp = function(n) { return n < 10 ? '0' + n : n; };
                        reminderTitle = rd.getDate() + '/' + rp(rd.getMonth()+1) + '/' + rd.getFullYear() + ' ' + rp(rd.getHours()) + ':' + rp(rd.getMinutes()) + ' - ' + rt;
                    } else {
                        reminderTitle = rt;
                    }
                }
                var isGrid = APP_STATE.viewMode === 'grid';
                var topLabel = isGrid && data.duration ? data.duration : (data.genre || data.category || '');
                var catChip = '';
                if (topLabel) {
                    catChip = '<div class="card-category" title="' + topLabel + '" style="color:var(--card-category-color);background:var(--card-category-bg);font-size:var(--card-category-size)">' + topLabel + '</div>';
                } else if (!(data.type === 'series')) {
                    catChip = '<div class="card-category" style="color:var(--card-category-color);background:var(--card-category-bg);font-size:var(--card-category-size)">&nbsp;</div>';
                }
                var imgSrc = '';
                if (data.imageKey && typeof StoreImages !== 'undefined') {
                    imgSrc = StoreImages.urlFor(data.imageKey) || '';
                } else {
                    imgSrc = data.image || '';
                }
                div.innerHTML =
                    '<img src="' + imgSrc + '" loading="lazy" decoding="async" data-onerror="this.data-onerror=null;this.classList.add(\'error\');this.nextElementSibling.style.display=\'flex\'">' +
                    '<div class="card-fallback"><i class="fas fa-film"></i><span>S/ Poster</span></div>' +
                    catChip +
                    '<div class="card-heart' + (isFav ? ' active' : '') + '" data-onclick="event.stopPropagation();Logic.toggleCardFav(\'' + data.id + '\', this)"><i class="' + (isFav ? 'fas' : 'fa-regular') + ' fa-heart"></i></div>' +
                    (hasReminder ? '<div class="absolute top-0.5 right-12 z-5 text-amber-400 text-[0.6rem]" title="' + reminderTitle + '"><i class="fas fa-sticky-note"></i></div>' : '') +
                    (hasMedia ? '<div class="card-play-overlay"><div class="card-play-btn" data-onclick="event.stopPropagation();Logic.playMedia(\'' + data.id + '\')"><i class="fas fa-play"></i></div></div>' : '') +
                    '<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3" style="z-index:3">' +
                    '<div class="flex items-center gap-2">' +
                    '<span class="font-bold" style="font-size:var(--card-year-size,15px);color:var(--card-year-color,#60A5FA)">' + (data.year || '') + '</span>' +
                    (starCount > 0 ? '<div class="text-[13px]" style="color:var(--card-star-color,#EAB308)">' + '&#9733;'.repeat(starCount) + '</div>' : '') +
                    '</div>' +
                    (badges.length ? '<div class="flex gap-1.5 mt-2 card-badges">' + badges.join('') + '</div>' : '') +
                    '</div>';
                div.oncontextmenu = (e) => Logic.openContextMenu(e, data.id);
                return div;
            }
        };
