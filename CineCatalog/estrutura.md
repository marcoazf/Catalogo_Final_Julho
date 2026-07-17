# CineCatalog Elo — WPF Desktop

## Estrutura do Projeto

```
14_Catalogo_Jonas/CineCatalog/
├── CineCatalog.sln
└── CineCatalog/
    ├── CineCatalog.csproj          → .NET 8 + WPF + CommunityToolkit.Mvvm
    ├── App.xaml / App.xaml.cs      → Bootstrapping, DI manual, ApplyTheme()
    ├── MainWindow.xaml / .cs       → Janela principal (header, footer, conteúdo)
    │
    ├── Models/
    │   ├── CatalogItem.cs          → Base: Id, Title, ImagePath, MediaPath,
    │   │                              Rating, Status, Watched, Tags, CreatedAt
    │   ├── MovieItem.cs            → + Duration, Director, Genre
    │   ├── SeriesItem.cs           → + Seasons, Episodes, Creator, Genre
    │   └── AppSettings.cs          → Theme, ZoomLevel, LastView, AutoSave
    │
    ├── Services/
    │   ├── IDataService.cs         → Contrato de carga/armazenamento
    │   ├── JsonDataService.cs      → JSON em %LOCALAPPDATA%/CineCatalog/
    │   │                              Leitura/escrita assíncrona com lock
    │   │                              Write atomic (temp + replace)
    │   ├── IFileDialogService.cs   → Contrato para dialogs nativos
    │   └── FileDialogService.cs    → OpenFileDialog (imagem, vídeo, backup)
    │
    ├── ViewModels/
    │   ├── MainViewModel.cs        → Coordena app, inicialização, navegação
    │   ├── CatalogViewModel.cs     → Grid, busca debounce 300ms, filtros,
    │   │                              zoom, CRUD, export/import, play
    │   ├── ItemDetailViewModel.cs  → Formulário cadastro/edição (ambos tipos)
    │   └── SettingsViewModel.cs    → Tema, info dados, limpar catálogo
    │
    ├── Views/
    │   ├── CatalogView.xaml / .cs  → Grid virtualizado, toolbar, busca, zoom
    │   ├── SettingsView.xaml / .cs → Configurações de tema e dados
    │   └── ItemDetailDialog.xaml/.cs → Modal cadastro/edição (Window modal)
    │
    ├── Controls/
    │   └── MovieCard.xaml / .cs    → Card 9:14 c/ imagem, gradiente, título,
    │                                 ano, avaliação, badges (favorito/assistido)
    │
    ├── Converters/
    │   ├── Converters.cs           → BoolToVisibility, InverseBool,
    │   │                              RatingToString, ItemTypeToBool
    │   └── StringNotEmptyConverter → StringNotEmpty, FilePathToImage,
    │                                  FileExistsToVisibility, FileExistsToCollapsed
    │
    └── Themes/
        ├── Generic.xaml            → Tema escuro (default)
        └── Light.xaml              → Tema claro
```

---

## Destaques Técnicos

### Arquitetura
- **MVVM puro** com `CommunityToolkit.Mvvm 8.2.2`
  - `[ObservableProperty]` — source generators eliminam boilerplate
  - `[RelayCommand]` — commands tipados sem `ICommand` manual
  - `ObservableObject` — notificação de propriedades automática
- **Injeção de dependência manual** no startup (`App.xaml.cs`)
  - Serviços e ViewModels resolvidos no bootstrapping
  - Fácil migração para DI container (Microsoft.Extensions.DI) no futuro

### Armazenamento
- **100% local** — sem banco de dados
- JSON em `%LOCALAPPDATA%/CineCatalog/`
  - `catalog.json` → todos os filmes/séries
  - `settings.json` → configurações (tema, zoom)
- Escrita assíncrona com `SemaphoreSlim` para thread-safety
- Escrita atômica: `temp → replace` (sem corrupção em crash)
- `System.Text.Json` — serialização rápida e moderna

### Performance
- **Virtualização** via `VirtualizingStackPanel`
  - Apenas itens visíveis são renderizados no DOM do WPF
  - Suporta milhares de cards sem degradação
  - `CacheLength="20,10"` para suavizar scroll
- **Busca com debounce** de 300ms
  - Evita reprocessamento a cada tecla
  - Cancela requests anteriores via `CancellationTokenSource`
- **Imagens** carregadas com `DecodePixelWidth=300`
  - Reduz consumo de memória ao decodificar apenas o necessário

### Mídia
- **Reprodução via shell** (`Process.Start` com `UseShellExecute=true`)
  - Suporta MP4, MKV, AVI, WMV, MOV, WebM
  - Usa o player padrão do sistema (VLC, Windows Media Player, etc.)
  - Sem dependências de codec embutidas
- **Preview de poster** via `File.OpenRead`
  - Cache automático pelo WPF `BitmapCacheOption.OnLoad`

### Experiência do Usuário
- **Zoom dinâmico** 1X–4X (8, 6, 5, 4 colunas)
- **Tema Dark/Light** trocado em tempo real via `ResourceDictionary`
  - Alteração persiste em `settings.json`
  - Aplicado no startup antes da janela abrir
- **Import/Export** JSON para backup completo
- **Context menu** com editar, reproduzir, favoritar, eliminar
- **Badges** visuais: coração (favorito), check (assistido)
- **Status bar** com contador e mensagens de feedback

### Extensibilidade
- **Modelos separados** por tipo (`MovieItem`, `SeriesItem`) com base comum
- **Interfaces** para serviços (`IDataService`, `IFileDialogService`)
  - Troca de implementação sem impacto nos ViewModels
- **Converters centralizados** — fáceis de adicionar/remover
- **Temas em arquivos XAML separados** — novo tema = novo arquivo
- **Código comentado** em pontos críticos para manutenção futura

### Requisitos para Compilar
- Visual Studio 2022+ (qualquer edição)
- .NET 8 SDK
- Pacotes NuGet (restaurados automaticamente):
  - `CommunityToolkit.Mvvm 8.2.2`
  - `System.Text.Json 8.0.4`
