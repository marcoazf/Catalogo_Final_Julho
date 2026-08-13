# Checklist Manual de Verificação — CineCatalog Elo

> Complemento humano aos testes automatizados (Playwright).
> Usar um navegador real (Chrome) abrindo `index.html` via `file://`.

## Núcleo (rodar a cada etapa)
- [ ] A página carrega sem console vermelho (F12 → Console).
- [ ] Logotipo + título "CineCatalog Elo | v32.2.0" visíveis no header.
- [ ] Abas Filmes / Séries / Estreias alternam a visualização.
- [ ] Empty state aparece com acervo vazio.
- [ ] Cadastrar filme → card aparece com ano e poster.
- [ ] Botão direito no card → Info abre modal com dados corretos.
- [ ] Botão direito no card → Editar carrega o formulário preenchido → salvar atualiza.
- [ ] Botão direito no card → Remover (com confirmação) remove o card.
- [ ] Buscar por termo ≥3 letras destaca o card (brilho neon).
- [ ] Fechar e reabrir o navegador → dados continuam (localStorage/IndexedDB).
- [ ] Zoom 1X–4X e modos Carrossel/Grelha/Marquee funcionam.

## Por etapa
- [ ] Etapa 1 (monólito quebrado): app abre com os novos arquivos `css/style.css`, `js/*.js`; zero erros 404 no console.
- [ ] Etapa 2 (Tailwind purgado): visual idêntico ao baseline; comparação de screenshot antes/depois.
- [ ] Etapa 3 (IndexedDB): migração automática do localStorage legado; capas carregam como Blob; >5MB de capas não quebram.
- [ ] Etapa 4 (lazy + revokeObjectURL): cards com milhares de itens sem travar; sem vazamento de blob URLs.
- [ ] Etapa 5 (pt-BR + aria + sem onclick): `lang="pt-BR"`; todos os botões funcionam sem `onclick` inline; leitor de tela anuncia ícones.
- [ ] Etapa 6 (PWA): instala como app; funciona offline; manifest válido.
