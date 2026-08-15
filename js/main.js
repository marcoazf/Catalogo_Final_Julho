        // Expose to window so onclick attributes can find them
        window.APP_STATE = APP_STATE;
        window.Storage = Storage;
        window.Render = Render;
        window.Logic = Logic;
        window.UI = UI;

        window.onload = () => {
            // Block F5, F12 and reload
            document.addEventListener('keydown', function(e) {
                /* Prevenções */
                if (e.key === 'F12' || e.key === 'F5' || e.key === 'F11') {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                /* ESC fecha modais */
                if (e.key === 'Escape') {
                    if (UI._shortcutsEditing) { UI._shortcutsCancelEdit(); return; }
                    var ctxm = document.getElementById('context-menu');
                    if (ctxm && ctxm.classList.contains('show')) { Logic.closeCtxMenu(); return; }
                    var sbar = document.getElementById('search-bar-container');
                    if (sbar && sbar.classList.contains('active')) { UI.toggleSearchBar(); return; }
                    var rp = document.getElementById('reminder-popup');
                    if (rp) rp.style.display = 'none';
                    var mmi = document.getElementById('modal-movie-info');
                    if (mmi && mmi.classList.contains('active')) { mmi.classList.remove('active'); return; }
                    var msi = document.getElementById('modal-series-info');
                    if (msi && msi.classList.contains('active')) { msi.classList.remove('active'); return; }
                    var mc = document.getElementById('modal-cadastro');
                    if (mc && mc.classList.contains('active') && APP_STATE.currentView !== 'series') { UI.closeModal('modal-cadastro'); return; }
                    var mi = document.getElementById('modal-info');
                    if (mi && mi.classList.contains('active')) { UI.closeModal('modal-info'); return; }
                    var mg = document.getElementById('modal-generate-list');
                    if (mg && mg.classList.contains('active')) { UI.closeModal('modal-generate-list'); return; }
                    var ms = document.getElementById('modal-sugestao');
                    if (ms && ms.classList.contains('active')) { UI.closeModal('modal-sugestao'); return; }
                    var mcfg = document.getElementById('modal-config');
                    if (mcfg && mcfg.classList.contains('active')) { UI.closeModal('modal-config'); return; }
                    var mcl = document.getElementById('modal-cadastro-log');
                    if (mcl && mcl.classList.contains('active')) { UI.closeModal('modal-cadastro-log'); return; }
                    var mdb = document.getElementById('modal-dashboard');
                    if (mdb && mdb.classList.contains('active')) { UI.closeModal('modal-dashboard'); return; }
                    return;
                }
                /* Atalhos customizados */
                if (UI._shortcutsEditing) return;
                var sk = UI._shortcutsBuildKey(e);
                if (!sk) return;
                var list = UI._shortcutsLoad();
                for (var i = 0; i < list.length; i++) {
                    if (list[i].key === sk && list[i].key !== '—') {
                        var act = list[i].action;
                        if (act === 'disabled') return;
                        e.preventDefault();
                        e.stopPropagation();
                        if (act === 'shortcuts_filmes') Logic.setMainView('filmes');
                        else if (act === 'shortcuts_series') Logic.setMainView('series');
                        else if (act === 'shortcuts_estreias') Logic.setMainView('estreias');
                        else if (act === 'shortcuts_pesquisar') UI.toggleSearchBar();
                        else if (act === 'shortcuts_cadastrar') UI.openModal('modal-cadastro');
                        else if (act === 'shortcuts_info') {
                            var msel = APP_STATE.selectedId;
                            if (msel) { Logic.viewMovieCtx(); }
                        }
                        else if (act === 'shortcuts_ctx') {
                            var msel2 = APP_STATE.selectedId;
                            if (msel2) {
                                var mcard2 = document.querySelector('[data-id="' + msel2 + '"]');
                                var rect = mcard2 ? mcard2.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
                                var synth = { preventDefault: function(){}, pageX: rect.left + rect.width / 2, pageY: rect.top + rect.height / 2 };
                                Logic.openContextMenu(synth, msel2);
                            }
                        }
                        else if (act === 'shortcuts_view') {
                            var modes = ['carrossel','grid','marquee'];
                            var ci = modes.indexOf(APP_STATE.viewMode);
                            Logic.setViewMode(modes[(ci + 1) % modes.length]);
                        }
                        else if (act === 'shortcuts_esc') {
                            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                        }
                        return;
                    }
                }
                /* DPAD Smart TV */
                if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.key) !== -1) {
                    var cards = document.querySelectorAll('#movies-container .movie-card, #movies-container .estreia-list-item');
                    if (cards.length === 0) return;
                    var cur = null;
                    for (var j = 0; j < cards.length; j++) {
                        if (cards[j].classList.contains('dpad-focused')) { cur = j; break; }
                    }
                    if (cur === null) {
                        cards[0].classList.add('dpad-focused');
                        cards[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    } else {
                        cards[cur].classList.remove('dpad-focused');
                        var cols = 1;
                        var firstTop = cards[0].getBoundingClientRect().top;
                        for (var c = 1; c < cards.length; c++) {
                            if (Math.abs(cards[c].getBoundingClientRect().top - firstTop) > 10) { cols = c; break; }
                        }
                        if (c === cards.length) cols = cards.length;
                        var next = cur;
                        if (e.key === 'ArrowRight') next = Math.min(cur + 1, cards.length - 1);
                        else if (e.key === 'ArrowLeft') next = Math.max(cur - 1, 0);
                        else if (e.key === 'ArrowDown') next = Math.min(cur + cols, cards.length - 1);
                        else if (e.key === 'ArrowUp') next = Math.max(cur - cols, 0);
                        cards[next].classList.add('dpad-focused');
                        cards[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                    e.preventDefault();
                }
            });

            if (typeof loadUIPrefs === 'function') loadUIPrefs();
            Storage.load();
            // Load saved theme
            var savedTheme = Store.getItem('cinecatalog_theme') || 'dark';
            Logic.setTheme(savedTheme);
            // Restore persisted UI state (view, visualização, zoom)
            Logic.setMainView(APP_STATE.currentView);
            Logic.setViewMode(APP_STATE.viewMode);
            UI.setZoom(APP_STATE.zoom);
            UI.updateFilterButtonState();
            /* Tooltip do trailer: acompanha o cursor (abaixo e à direita) */
            ['mmi-trailer-link', 'msi-trailer-link'].forEach(function(tid) {
                var tel = document.getElementById(tid);
                if (!tel) return;
                tel.addEventListener('mousemove', function(e) {
                    tel.style.setProperty('--tip-x', (e.clientX + 12) + 'px');
                    tel.style.setProperty('--tip-y', (e.clientY + 12) + 'px');
                });
            });
            window.addEventListener('click', (e) => {
                if (!e.target.closest('#context-menu')) Logic.closeCtxMenu();
                if (!e.target.closest('#search-bar-container') && !e.target.closest('button[onclick*="toggleSearchBar"]')) {
                    var sbarClick = document.getElementById('search-bar-container');
                    if (sbarClick && sbarClick.classList.contains('active')) UI.toggleSearchBar();
                }
                if (!e.target.closest('#filters-dropdown') && !e.target.closest('#btn-filters')) {
                    document.getElementById('filters-dropdown')?.classList.add('hidden');
                    document.getElementById('btn-filters')?.classList.remove('active');
                }
                if (!e.target.closest('#theme-menu') && !e.target.closest('#btn-theme')) {
                    document.getElementById('theme-menu')?.classList.add('hidden');
                    document.getElementById('btn-theme')?.classList.remove('active');
                }
                if (!e.target.closest('#fs-category') && !e.target.closest('#fs-category-tooltip')) {
                    var fsCatTip = document.getElementById('fs-category-tooltip');
                    if (fsCatTip) fsCatTip.style.display = 'none';
                }
            });
            // Close cat-manager overlay when clicking backdrop
            document.getElementById('cat-manager-overlay')?.addEventListener('click', function(e) {
                if (e.target === this) this.classList.remove('active');
            });

            // Init star ratings for all 3 tabs (click same star to deselect)
            function initStars(containerId, hiddenId) {
                var container = document.getElementById(containerId);
                if (!container) return;
                container.querySelectorAll('.fa-star').forEach(function(star) {
                    star.onclick = function() {
                        var hidden = document.getElementById(hiddenId);
                        var v = parseInt(star.dataset.v);
                        var cur = parseInt(hidden.value);
                        if (cur === v) {
                            hidden.value = 0;
                            container.querySelectorAll('.fa-star').forEach(function(s) { s.classList.remove('text-yellow-500'); });
                        } else {
                            hidden.value = v;
                            container.querySelectorAll('.fa-star').forEach(function(s) { s.classList.toggle('text-yellow-500', parseInt(s.dataset.v) <= v); });
                        }
                    };
                });
            }
            initStars('star-input-container', 'f-stars');
            initStars('star-input-container-series', 'fs-stars');

            // --- Init poster areas (Filmes + Séries) ---
            UI.initPosterArea('f');
            UI.initPosterArea('fs');

            // --- Init media pickers (Filmes + Séries) ---
            UI.initMediaPicker('f');
            UI.initMediaPicker('fs');

            // --- Detect OS players (dropdown PLAYER DE VÍDEO) ---
            try {
                window._detectedPlayers = {};
                UI._detectPlayers().forEach(function(p) { window._detectedPlayers[p.key] = p.path; });
            } catch(e) {}

            // --- Check estreia notifications (silent on load: badge only, no popup) ---
            Logic.checkEstreiaNotifications(true);
            // Check again every 60 seconds
            setInterval(function() { Logic.checkEstreiaNotifications(); }, 60000);
            // --- Auto-delete expired estreias ---
            UI._autoDeleteExpiredEstreias();
            setInterval(function() { UI._autoDeleteExpiredEstreias(); }, 60000);
            // --- Show suggestion on load ---
            UI._showSuggestionOnLoad();

            // Close notification overlay on backdrop click
            document.getElementById('notification-overlay')?.addEventListener('click', function(e) {
                if (e.target === this) UI.closeNotifications();
            });
            document.getElementById('reminder-panel')?.addEventListener('click', function(e) {
                if (e.target === this) UI.closeReminderPanel();
            });
            document.getElementById('modal-movie-info')?.addEventListener('click', function(e) {
                if (e.target === this) UI.closeModal('modal-movie-info');
            });
            document.getElementById('modal-series-info')?.addEventListener('click', function(e) {
                if (e.target === this) UI.closeModal('modal-series-info');
            });
            document.getElementById('modal-sugestao')?.addEventListener('click', function(e) {
                if (e.target === this) UI.closeModal('modal-sugestao');
            });
        };
