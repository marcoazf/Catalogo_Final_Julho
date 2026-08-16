        const APP_STATE = {
            movies: [],
            currentView: 'filmes',
            activeFilter: 'all',
            searchQuery: '',
            selectedId: null,
            searchTimer: null,
            sortBy: 'default',
            filterYear: '',
            viewMode: 'carrossel',
            marqueeEffect: 'linear',
            zoom: 1
        };

        const Storage = {
            toJSON() {
                return JSON.stringify(APP_STATE.movies.map(function(m) {
                    var c = Object.assign({}, m);
                    delete c._searchMatch;
                    delete c._cadastroDate;
                    if (c.imageKey) delete c.image;
                    return c;
                }));
            },
            save() {
                // Strip temporary properties before saving
                Store.setItem('cinecatalog_v126', Storage.toJSON());
                UI.updateCounters();
                UI.updateFooterStats();
                Logic.updateReminderBadge();
                Logic.showStatus('Sincronizado');
            },
            load() {
                const data = Store.getItem('cinecatalog_v126');
                if (data) {
                    try { APP_STATE.movies = JSON.parse(data); } catch(e) { APP_STATE.movies = [];
                        // Limpeza automática de caminhos de mídia: remove filenames se já estiverem incluidos
// Isso evita problemas como "C:\pastas\arquivo.mp4\arquivo.mp4"
var camposCaminho = ['pathVideos', 'pathBackups', 'pathCards', 'pathSeriesCards', 'pathAcervo'];
camposCaminho.forEach(function(campo) {
    if (APP_STATE[campo] && typeof APP_STATE[campo] === 'string') {
        // Remove filename do final do path se existir
        var regex = /[\\/]([^\\/]+)$/;
        var match = APP_STATE[campo].match(regex);
        if (match) {
            APP_STATE[campo] = APP_STATE[campo].replace(regex, '');
        }
    }
});
                     }
                    APP_STATE.movies.forEach(function(m) {
                        if (!m._createdAt) m._createdAt = m.id || Date.now().toString();
                        if (!m.statuses && (m.status || m.watched !== undefined)) {
                            m.statuses = { new: false, watch: false, favorite: false };
                            if (m.status === 'Favorito') m.statuses.favorite = true;
                            if (m.watched) m.statuses.watch = true;
                            if (!m.statuses.favorite && !m.statuses.watch) m.statuses.new = true;
                            delete m.status;
                            delete m.watched;
                        }
                        // Limpa URLs de blob: legadas (não persistem entre sessões)
                        if (m.image && m.image.indexOf('blob:') === 0) m.image = '';
                    });
                }
                if (!APP_STATE.movies || !APP_STATE.movies.length) {
                    APP_STATE.movies = [];
                }
                // Hidrata objectURLs a partir das capas Blob já carregadas
                if (typeof StoreImages !== 'undefined') StoreImages.hydrateMovies(APP_STATE.movies);
                Render.all();
                Logic.renderCategorySelect();
                UI.updateCounters();
                Logic.updateReminderBadge();
            }
        };

        const CONFIG_STORAGE_KEY = 'cinecatalog_config';

        function loadConfig() {
            var raw = Store.getItem(CONFIG_STORAGE_KEY);
            if (raw) {
                try { return JSON.parse(raw); } catch(e) {}
            }
            return {
                logo: '',
                emptyIcon: 'fa-clapperboard',
                emptyCustomIcon: '',
                emptyTitle: 'ACERVO VAZIO',
                emptySub1: 'O SEU CINEMA PARTICULAR COMEÇA,',
                emptySub2: 'COM O PRIMEIRO CADASTRO',
                emptyIconSize: 56,
                emptyIconOpacity: 100,
                emptyTitleBold: true,
                emptyTitleItalic: false,
                emptyTitleSize: '14px',
                emptyTitleColor: '#FFFFFF',
                emptySub1Bold: false,
                emptySub1Italic: false,
                emptySub1Size: '8px',
                emptySub1Color: '#FFFFFF',
                emptySub2Bold: false,
                emptySub2Italic: false,
                emptySub2Size: '8px',
                emptySub2Color: '#FFFFFF',
                emptyIconPadding: 20,
                emptyIconBorder: true,
                emptyTitleGap: 12,
                cardStarsColor: '#EAB308',
                cardYearColor: '#60A5FA',
                cardYearSize: '15px',
                cardStatusNewBg: '#2563EB',
                cardStatusWatchBg: '#D97706',
                cardStatusFavBg: '#DC2626',
                cardStatusTextColor: '#FFFFFF',
                cardStatusSize: '11px',
                cardCategoryColor: '#FFFFFF',
                cardCategoryBg: '#000000',
                cardCategorySize: '13px',
                pathCards: '',
                pathSeriesCards: '',
                pathVideos: '',
                pathBackups: '',
                pathAcervo: '',
                acervoBackupName: '',
                pathBackupGeral: '',
                backupGeralName: '',
                pathCardsActive: false,
                pathSeriesCardsActive: false,
                pathVideosActive: false,
                pathBackupsActive: false,
                pathAcervoActive: false,
                pathBackupGeralActive: false,
                placeholderColor: '',
                placeholderOpacity: 100,
                autoSave: false,
                autoSavePath: '',
                videoPlayer: 'system',
                customPlayerPath: '',
                videoPlayerActive: true,
                footerDevText: 'ELO SISTEMA E TECNOLOGIA | 2026 - ',
                footerCreatedText: 'CRIADO PARA JONAS THEODORO',
                footerDevSize: '0.6rem',
                footerDevColor: '#9CA3AF',
                footerCreatedSize: '0.6rem',
                footerCreatedColor: '#9CA3AF',
                footerAutoSaveSize: '0.55rem',
                footerAutoSaveColor: '#22C55E',
                footerStatusSize: '0.75rem',
                footerStatusColor: '#FB923C',
                footerHeight: '2.5rem',
                notificationsActive: true,
                notificationsDuration: 5000,
                cadastroNotifyActive: true,
                cadastroNotifyDuration: 6000,
                sugestoesActive: false,
                sugestoesNovo: true,
                sugestoesAssistir: true,
                sugestoesFavoritos: true
            };
        }

        function saveConfig() {
            Store.setItem(CONFIG_STORAGE_KEY, JSON.stringify(window._appConfig));
        }

        function applyConfig() {
            var cfg = window._appConfig;
            if (cfg.logo) {
                var logoEl = document.getElementById('logo-img');
                if (logoEl) {
                    var logoImg = logoEl.tagName === 'IMG' ? logoEl : logoEl.querySelector('img');
                    if (logoImg) logoImg.src = cfg.logo;
                }
            }
            var es = document.getElementById('empty-state');
            if (es) {
                var iconWrapper = es.querySelector('.w-28.h-28, .w-28');
                if (iconWrapper) {
                    var iconSz = cfg.emptyIconSize || 56;
                    var iconOp = cfg.emptyIconOpacity != null ? cfg.emptyIconOpacity / 100 : 1;
                    var iconPad = cfg.emptyIconPadding != null ? cfg.emptyIconPadding : 20;
                    var iconBorderOn = cfg.emptyIconBorder !== false;
                    iconWrapper.style.width = iconSz + 'px';
                    iconWrapper.style.height = iconSz + 'px';
                    iconWrapper.style.opacity = iconOp;
                    iconWrapper.style.borderRadius = Math.round(iconSz * 0.22) + 'px';
                    iconWrapper.style.padding = iconPad + 'px';
                    iconWrapper.style.border = iconBorderOn ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent';
                    var availSpace = Math.max(iconSz - 2 * iconPad, 0);
                    var iconInnerSize = Math.min(Math.max(Math.round(iconSz * 0.45), 24), availSpace);
                    if (cfg.emptyCustomIcon) {
                        iconWrapper.innerHTML = '<img src="' + cfg.emptyCustomIcon.replace(/"/g,'&quot;') + '" style="width:' + iconInnerSize + 'px;height:' + iconInnerSize + 'px;object-fit:contain">';
                    } else {
                        iconWrapper.innerHTML = '<i class="fas ' + cfg.emptyIcon + ' text-blue-400" style="font-size:' + iconInnerSize + 'px"></i>';
                    }
                }
                var h2 = es.querySelector('h2');
                if (h2) {
                    h2.textContent = cfg.emptyTitle;
                    h2.style.fontWeight = cfg.emptyTitleBold !== false ? '900' : '400';
                    h2.style.fontStyle = cfg.emptyTitleItalic ? 'italic' : 'normal';
                    h2.style.fontSize = cfg.emptyTitleSize || '14px';
                    if (cfg.emptyTitleColor) h2.style.color = cfg.emptyTitleColor;
                    h2.style.marginBottom = (cfg.emptyTitleGap != null ? cfg.emptyTitleGap : 12) + 'px';
                }
                var ps = es.querySelectorAll('p');
                if (ps.length >= 2) {
                    ps[0].textContent = cfg.emptySub1 || '';
                    ps[0].style.fontWeight = cfg.emptySub1Bold ? '700' : '400';
                    ps[0].style.fontStyle = cfg.emptySub1Italic ? 'italic' : 'normal';
                    if (cfg.emptySub1Size) ps[0].style.fontSize = cfg.emptySub1Size;
                    if (cfg.emptySub1Color) ps[0].style.color = cfg.emptySub1Color;
                    ps[1].textContent = cfg.emptySub2 || '';
                    ps[1].style.fontWeight = cfg.emptySub2Bold ? '700' : '400';
                    ps[1].style.fontStyle = cfg.emptySub2Italic ? 'italic' : 'normal';
                    if (cfg.emptySub2Size) ps[1].style.fontSize = cfg.emptySub2Size;
                    if (cfg.emptySub2Color) ps[1].style.color = cfg.emptySub2Color;
                }
            }
            document.body.style.setProperty('--card-star-color', cfg.cardStarsColor);
            document.body.style.setProperty('--card-year-color', cfg.cardYearColor);
            document.body.style.setProperty('--card-year-size', cfg.cardYearSize);
            document.body.style.setProperty('--card-status-new-bg', cfg.cardStatusNewBg);
            document.body.style.setProperty('--card-status-watch-bg', cfg.cardStatusWatchBg);
            document.body.style.setProperty('--card-status-fav-bg', cfg.cardStatusFavBg);
            document.body.style.setProperty('--card-status-text-color', cfg.cardStatusTextColor);
            document.body.style.setProperty('--card-status-size', cfg.cardStatusSize);
            document.body.style.setProperty('--card-category-color', cfg.cardCategoryColor || '');
            document.body.style.setProperty('--card-category-bg', cfg.cardCategoryBg || '');
            document.body.style.setProperty('--card-category-size', cfg.cardCategorySize || '');
            document.body.style.setProperty('--placeholder-color', cfg.placeholderColor || '');
            document.body.style.setProperty('--placeholder-opacity', (cfg.placeholderOpacity != null ? cfg.placeholderOpacity : 100) / 100);
            var asIndicator = document.getElementById('auto-save-indicator');
            if (asIndicator) {
                asIndicator.style.display = 'flex';
                var icon = document.getElementById('auto-save-icon');
                if (cfg.autoSave) {
                    icon.style.color = '#00E5FF';
                    icon.style.fontSize = '1.1rem';
                } else {
                    icon.style.color = '#6B7280';
                    icon.style.fontSize = '1.1rem';
                }
            }
            // Footer customization
            var footer = document.querySelector('footer');
            if (footer) {
                footer.style.minHeight = cfg.footerHeight;
                footer.style.paddingTop = '0.5rem';
                footer.style.paddingBottom = '0.5rem';
                var devEl = document.getElementById('footer-dev-text');
                if (devEl) {
                    devEl.style.fontSize = cfg.footerDevSize;
                    devEl.style.color = cfg.footerDevColor;
                    var span = devEl.querySelector('span.opacity-50');
                    if (span) {
                        span.textContent = cfg.footerCreatedText;
                        span.style.fontSize = cfg.footerCreatedSize;
                        span.style.color = cfg.footerCreatedColor;
                    }
                    // Preserve text node (dev text) — update if config differs from default
                    for (var i = 0; i < devEl.childNodes.length; i++) {
                        if (devEl.childNodes[i].nodeType === 3) {
                            devEl.childNodes[i].textContent = cfg.footerDevText;
                            break;
                        }
                    }
                }
                var statusEl = document.getElementById('stats-counter');
                if (statusEl) {
                    statusEl.style.fontSize = cfg.footerStatusSize;
                    statusEl.style.color = cfg.footerStatusColor;
                }
            }
            if (window.Render) window.Render.all();
        }

        const UI_PREFS_KEY = 'cinecatalog_ui_prefs';

        function saveUIPrefs() {
            try {
                Store.setItem(UI_PREFS_KEY, JSON.stringify({
                    currentView: APP_STATE.currentView,
                    activeFilter: APP_STATE.activeFilter,
                    filterYear: APP_STATE.filterYear,
                    sortBy: APP_STATE.sortBy,
                    viewMode: APP_STATE.viewMode,
                    zoom: APP_STATE.zoom
                }));
            } catch(e) {}
        }

        function loadUIPrefs() {
            try {
                var raw = Store.getItem(UI_PREFS_KEY);
                if (!raw) return;
                var p = JSON.parse(raw);
                if (p && ['filmes', 'series', 'estreias'].indexOf(p.currentView) > -1) APP_STATE.currentView = p.currentView;
                if (p && ['carrossel', 'grid', 'marquee'].indexOf(p.viewMode) > -1) APP_STATE.viewMode = p.viewMode;
                if (p && typeof p.activeFilter === 'string') APP_STATE.activeFilter = p.activeFilter;
                if (p && typeof p.filterYear === 'string') APP_STATE.filterYear = p.filterYear;
                if (p && typeof p.sortBy === 'string') APP_STATE.sortBy = p.sortBy;
                if (p && typeof p.zoom === 'number' && p.zoom >= 1 && p.zoom <= 4) APP_STATE.zoom = p.zoom;
            } catch(e) {}
        }

        window._appConfig = loadConfig();
        // Gêneros (topo do card): inicia sempre com cor texto = branco e fundo = preto
        window._appConfig.cardCategoryColor = '#FFFFFF';
        window._appConfig.cardCategoryBg = '#000000';
        // Fontes dos cards aumentadas: Status, Gêneros e Ano mais visíveis
        if (!window._appConfig.cardCategorySize || window._appConfig.cardCategorySize === '7px' || window._appConfig.cardCategorySize === '8px' || window._appConfig.cardCategorySize === '11px') {
            window._appConfig.cardCategorySize = '13px';
        }
        if (!window._appConfig.cardYearSize || window._appConfig.cardYearSize === '9px' || window._appConfig.cardYearSize === '10px' || window._appConfig.cardYearSize === '13px') {
            window._appConfig.cardYearSize = '15px';
        }
        if (!window._appConfig.cardStatusSize || window._appConfig.cardStatusSize === '6px' || window._appConfig.cardStatusSize === '7px' || window._appConfig.cardStatusSize === '9px') {
            window._appConfig.cardStatusSize = '11px';
        }
        applyConfig();
