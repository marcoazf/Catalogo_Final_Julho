# Diretrizes de Tipografia — CineCatalog Elo

## Princípio

Toda tipografia na interface **deve ser no mínimo `0.6rem`** (equivalente a ~9.6px na base 16px padrão, escalando com `clamp(14px, 0.5vw + 8px, 18px)` definido no `<html>`).

Exceções pontuais (badges, tags minúsculas, placeholders) podem usar `0.5rem` (~8px), mas nunca abaixo disso.

## Tamanhos referenciais

| Elemento | Tamanho | Contexto |
|---|---|---|
| Título de janela modal (ex: CADASTRO NOVO, DASHBOARD, CONFIG, INFO, LISTA) | `0.75rem` | Cabeçalho de modais |
| Aba do formulário (ex: Filmes, Séries, Estreias) | `0.8rem` | `.tab-premium` |
| Rótulo da aba (ex: Novo Filme, Nova Série, Nova Estreia) | `0.75rem` | inline tab labels |
| Label de campo do formulário (ex: Título, Categoria, Ano) | `0.65rem` | `.label-premium` |
| Barra de pesquisa — texto digitado | `0.875rem` (14px) | `text-sm` (Tailwind) |
| Dashboard — título da janela | `0.75rem` | `modal-dashboard span` |
| Dashboard — valor numérico do card | `34px` | `.dc-value` |
| Dashboard — rótulo do card (ex: Total Títulos) | `0.7rem` | `.dc-label` |
| Gráfico — título (Chart.js) | `12px` | `titleOpts.size` |
| Gráfico — legenda (Chart.js) | `11px` | `legendOpts.labels.font.size` |
| Gráfico — eixos (Chart.js) | `10px` | `scales.x.ticks.font.size` |
| Botão de menu (ex: Info, Editar no menu de contexto) | `0.65rem` | `#context-menu button` |
| Opção no menu Animação (ex: Linear, Suave, Alternado) | `0.7rem` | `.view-ctx-option` |
| Rótulo no menu Animação (ex: Velocidade Animação, Efeito) | `0.65rem` | `.view-ctx-label` |
| Valor numérico no menu Animação (ex: 30s) | `0.6rem` | `.view-ctx-option .val` |
| Botão no menu Animação (ex: Pausar, Retomar, Cancelar) | `0.65rem` | `.view-ctx-footer button` |
| Mensagem de gráfico vazio | `0.6rem` | `.chart-empty` |
| Rodapé — texto informativo (esquerda) | `0.6rem` | `footer` |
| Rodapé — contador de títulos (direita) — laranja | `0.75rem` | `#stats-counter` |
| Rodapé — indicador auto-salvamento | `0.55rem` | `#auto-save-text` |
| Botão de filtro (ex: Todos, Filmes, Séries) | `0.65rem` | `.filter-btn` |
| Rótulo de secção de filtro (ex: ANO, STATUS) | `0.65rem` | `.filter-section-label` |
| Botão de ano no filtro | `0.55rem` | `.filter-year-btn` |
| Opção de tema (ex: Dark, Light, Amber) | `0.6rem` | `.theme-option` |
| Secção de Configurações (ex: Logotipo, Cards) | `0.7rem` | `.config-section-title` |
| Rótulo em Configurações (ex: URL da Imagem) | `0.6rem` | `.config-row label` |
| Interruptor em Configurações (ex: Activar) | `0.6rem` | `.config-switch .switch-label` |
| Badge em Configurações | `0.55rem` | `.cfg-badge` |
| Botão de activação em Configurações | `0.55rem` | `.cfg-btn-activate` |
| Notificações — título | `0.65rem` | `#notification-overlay h3` |
| Notificações — mensagem (JS) | `0.6rem` | JS renderNotification |
| Lembretes — popup info | `0.5rem` | `#reminder-created-info` |
| Lembretes — botões (Salvar, Cancelar, Remover) | `0.6rem` | `#reminder-popup button` |
| Lembretes — género, data (JS) | `0.6rem` | JS reminder HTML |
| Informações — ícone | `1.3rem` | `.info-item i` |
| Informações — label do ícone | `0.6rem` | `.info-item .info-label` |
| Informações — título descrição | `0.7rem` | `#info-desc-box .desc-text h4` |
| Informações — texto descrição | `0.6rem` | `#info-desc-box .desc-text p` |
| Histórico — subtítulo cabeçalho | `0.75rem` | `.log-a4-preview .log-header .sub` |
| Histórico — data/hora | `0.6rem` | `.log-a4-preview .log-header .datetime` |
| Histórico — tabela corpo | `0.6rem` | `.log-a4-preview table` |
| Histórico — tabela cabeçalho | `0.55rem` | `.log-a4-preview table th` |
| Lista A4 — data/hora | `0.55rem` | `#a4-preview .a4-header .datetime` |
| Lista A4 — tabela corpo | `0.6rem` | `#a4-preview table` |
| Lista A4 — tabela cabeçalho | `0.55rem` | `#a4-preview table th` |
| Lista A4 — botões de controlo | `0.6rem` | `.list-controls button` |
| Pesquisa — item do histórico | `0.65rem` | `.search-history-item` |
| Pesquisa — botão Limpar | `0.65rem` | `inline Limpar` |

## Notas

- Sempre usar **`rem`** em vez de `px` para fontes, exceto valores muito grandes (ex: `28px` no `.dc-value`) que não precisam escalar linearmente.
- A base `html { font-size: clamp(14px, 0.5vw + 8px, 18px); }` garante que em monitores maiores (1920px+) as fontes cresçam até 18px, melhorando legibilidade em resoluções altas.
- Tamanhos menores que `0.6rem` só devem ser usados em contextos puramente decorativos ou de espaço extremamente restrito.
